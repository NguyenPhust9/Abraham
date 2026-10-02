"""Copy HCM 3 source stock into existing website SKUs. Dry-run by default."""
import argparse
import hashlib
import json
import os
import re
import sys
from pathlib import Path
from decimal import Decimal, InvalidOperation
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit, unquote
from urllib.request import Request, urlopen


class SyncError(Exception):
    pass


def load_local_config():
    config = Path(__file__).resolve().parents[1] / '.env'
    if not config.is_file():
        return
    allowed = {'AMIS_API_BASE', 'AMIS_CLIENT_ID', 'AMIS_CLIENT_SECRET', 'AMIS_STOCK_CODE', 'DATABASE_URL'}
    for line in config.read_text(encoding='utf-8-sig').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        name, value = line.split('=', 1)
        name, value = name.strip(), value.strip()
        if name not in allowed:
            continue
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
            value = value[1:-1]
        if value and not os.environ.get(name):
            os.environ[name] = value


def normalize(value):
    return ' '.join(str(value or '').split()).casefold()


def field(item, *names):
    keys = {re.sub(r'[^a-z0-9]', '', str(k).casefold()): v for k, v in item.items()}
    for name in names:
        key = re.sub(r'[^a-z0-9]', '', name.casefold())
        if key in keys and keys[key] is not None:
            return keys[key]
    return None


def decode(value):
    if isinstance(value, str):
        try:
            return json.loads(value)
        except ValueError as exc:
            raise SyncError('AMIS data is not valid JSON.') from exc
    return value


def records(payload):
    data = decode(field(payload, 'data'))
    if isinstance(data, dict):
        data = field(data, 'items', 'records', 'result', 'data')
        data = decode(data)
    if not isinstance(data, list) or any(not isinstance(item, dict) for item in data):
        raise SyncError('Unexpected AMIS record format; no stock will be changed.')
    return data


def integer(value):
    if value is None or isinstance(value, bool) or str(value).strip() == '':
        raise SyncError('Missing stock quantity; refusing to interpret it as zero.')
    try:
        number = Decimal(str(value))
        if not number.is_finite() or number != number.to_integral_value() or not -2147483648 <= number <= 2147483647:
            raise SyncError('Stock must be a finite integer within the database range.')
        return int(number)
    except InvalidOperation as exc:
        raise SyncError('Invalid stock quantity; no stock will be changed.') from exc


def token_from(value):
    if isinstance(value, dict):
        token = field(value, 'access_token', 'token', 'bearer_token', 'authorization_token')
        if isinstance(token, str) and token.strip():
            return token.strip()
        for key in ('data', 'result'):
            child = field(value, key)
            if child is not None:
                token = token_from(child)
                if token:
                    return token
    elif isinstance(value, list):
        for child in value:
            token = token_from(child)
            if token:
                return token
    elif isinstance(value, str):
        value = value.strip()
        if value.startswith(('{', '[')):
            return token_from(decode(value))
        if len(value) >= 40 and not any(c.isspace() for c in value):
            return value
    return None


class Amis:
    def __init__(self, client_id, client_secret, base='https://crmconnect.misa.vn/api/v2'):
        if not base.startswith('https://'):
            raise SyncError('AMIS_API_BASE must use HTTPS.')
        self.base = base.rstrip('/')
        self.client_id = client_id
        self.client_secret = client_secret
        self.token = None

    def request(self, path, params=None, body=None):
        url = self.base + path + ('?' + urlencode(params) if params else '')
        headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
        if self.token:
            headers.update({'Authorization': 'Bearer ' + self.token, 'Clientid': self.client_id})
        req = Request(url, headers=headers, data=json.dumps(body).encode() if body is not None else None)
        try:
            with urlopen(req, timeout=60) as response:
                payload = json.load(response)
        except HTTPError as exc:
            # Do not print response bodies: they may contain account data or tokens.
            raise SyncError(f'AMIS {path} returned HTTP {exc.code}.') from None
        except (URLError, TimeoutError, ValueError, OSError):
            raise SyncError(f'Unable to read a valid AMIS response for {path}.') from None
        if not isinstance(payload, dict):
            raise SyncError('AMIS response must be an object.')
        if field(payload, 'success') in (False, 'false', 'False', 0):
            # This ledger endpoint returns a false flag with code 0 and valid pages.
            # Accept only this specific shape; inventory() verifies the full snapshot.
            valid_ledger = (path == '/Stocks/product_ledger'
                            and type(field(payload, 'code')) is int
                            and field(payload, 'code') == 0
                            and integer(field(payload, 'total_pages')) > 0
                            and integer(field(payload, 'total_records')) > 0)
            if not valid_ledger or not records(payload):
                raise SyncError(f'AMIS rejected {path}, even though HTTP may have succeeded.')
        return payload

    def authenticate(self):
        payload = self.request('/Account', body={'client_id': self.client_id, 'client_secret': self.client_secret})
        self.token = token_from(payload)
        if not self.token:
            raise SyncError('AMIS did not return an access token.')

    def stock_id(self, code):
        rows = records(self.request('/Stocks'))
        matches = [row for row in rows if normalize(field(row, 'stock_code', 'code')) == normalize(code)]
        if len(matches) != 1:
            raise SyncError(f'Expected exactly one warehouse matching code {code}.')
        value = field(matches[0], 'async_id', 'stock_id', 'id')
        if value is None or not str(value).strip():
            raise SyncError('Selected warehouse has no ID.')
        return str(value)

    def inventory(self, stock_id):
        all_rows = []
        seen = set()
        expected_pages = None
        expected_records = None
        for page in range(1, 101):
            payload = self.request('/Stocks/product_ledger', params={'page': page, 'pageSize': 50, 'stockID': stock_id})
            rows = records(payload)
            record_count = field(payload, 'total_records')
            if record_count is not None:
                record_count = integer(record_count)
                if record_count < 1 or (expected_records is not None and expected_records != record_count):
                    raise SyncError('AMIS record count changed or is invalid; retry next cycle.')
                expected_records = record_count
            total = field(payload, 'total_pages')
            nested = decode(field(payload, 'data'))
            if total is None and isinstance(nested, dict):
                total = field(nested, 'total_pages')
            if total is not None:
                total = integer(total)
                if total < 1 or (expected_pages is not None and total != expected_pages):
                    raise SyncError('AMIS page count changed or is invalid; retry next cycle.')
                expected_pages = total
            if not rows:
                if expected_pages is not None and page <= expected_pages:
                    raise SyncError('AMIS returned an empty page before the inventory was complete.')
                break
            digest = hashlib.sha256(json.dumps(rows, sort_keys=True).encode()).hexdigest()
            if digest in seen:
                raise SyncError('AMIS repeated an inventory page; no stock will be changed.')
            seen.add(digest)
            all_rows.extend(rows)
            if expected_pages is not None:
                if page >= expected_pages:
                    break
            elif len(rows) < 50:
                break
        else:
            raise SyncError('Inventory exceeded 100 pages; no partial update is permitted.')
        if not all_rows:
            raise SyncError('AMIS inventory is empty; existing website stock is preserved.')
        if expected_records is not None and len(all_rows) != expected_records:
            raise SyncError('AMIS inventory count is incomplete; no stock will be changed.')
        return all_rows


def inventory_map(rows):
    result = {}
    for row in rows:
        code = field(row, 'product_code', 'inventory_item_code', 'code')
        key = normalize(code)
        if not key:
            raise SyncError('An AMIS inventory row has no product code.')
        if key in result:
            raise SyncError('Duplicate AMIS product codes; refusing ambiguous stock updates.')
        result[key] = {'code': str(code).strip(), 'stock': integer(field(row, 'main_stock_quantity'))}
    return result


def plan_updates(products, inventory):
    updates, missing = [], []
    seen = set()
    unchanged = 0
    for product in products:
        key = normalize(product['sku'])
        if not key:
            continue
        seen.add(key)
        item = inventory.get(key)
        if item is None:
            missing.append(product['id'])
            continue
        if product['stock'] == item['stock']:
            unchanged += 1
        updates.append((product['id'], item['stock']))
    if not updates:
        raise SyncError('No AMIS codes match website SKUs. No stock was changed.')
    return updates, {'matched': len(updates), 'changed': len(updates) - unchanged,
                     'unchanged': unchanged, 'missing_in_amis': len(missing),
                     'missing_on_website': len(set(inventory) - seen)}


def sync(connection, amis, warehouse, apply=False):
    # Serialize before reading AMIS so a slower old snapshot cannot overwrite a newer one.
    locked = connection.execute('SELECT pg_try_advisory_lock(731904251)').fetchone()[0]
    if not locked:
        raise SyncError('Another inventory sync is running.')
    try:
        connection.execute('SELECT amis_stock_code, amis_stock_synced_at FROM public.products LIMIT 0')
        amis.authenticate()
        inventory = inventory_map(amis.inventory(amis.stock_id(warehouse)))
        with connection.transaction():
            rows = connection.execute('SELECT id, sku, stock FROM public.products ORDER BY id FOR UPDATE').fetchall()
            products = [dict(zip(('id', 'sku', 'stock'), row)) for row in rows]
            updates, summary = plan_updates(products, inventory)
            if apply:
                with connection.cursor() as cursor:
                    cursor.executemany('''UPDATE public.products
                        SET stock = %s, amis_stock_code = %s, amis_stock_synced_at = now(), updated_at = now()
                        WHERE id = %s''', [(stock, warehouse, product_id) for product_id, stock in updates])
        return {**summary, 'warehouse': warehouse, 'mode': 'apply' if apply else 'dry-run'}
    finally:
        connection.execute('SELECT pg_advisory_unlock(731904251)')


def validate_database_project():
    root = Path(__file__).resolve().parents[1]
    website = root / 'js' / 'shop.js'
    if not website.is_file():
        raise SyncError('Cannot verify the website Supabase project.')
    projects = set(re.findall(r'https://([a-z0-9]+)\.supabase\.co', website.read_text(encoding='utf-8')))
    uri = urlsplit(os.environ['DATABASE_URL'])
    host = re.fullmatch(r'db\.([a-z0-9]+)\.supabase\.co', uri.hostname or '')
    user = re.fullmatch(r'postgres\.([a-z0-9]+)', unquote(uri.username or ''))
    project = host.group(1) if host else user.group(1) if user else None
    if not project or projects != {project}:
        raise SyncError('DATABASE_URL does not match the website Supabase project. No connection or stock update was made.')


def main():
    load_local_config()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true', help='Write the validated AMIS snapshot to the database')
    args = parser.parse_args()
    required = ['AMIS_CLIENT_ID', 'AMIS_CLIENT_SECRET', 'DATABASE_URL']
    missing = [name for name in required if not os.environ.get(name)]
    if missing:
        raise SyncError('Missing environment variables: ' + ', '.join(missing))
    validate_database_project()
    try:
        import psycopg
    except ImportError:
        raise SyncError('Install scripts/requirements-stock.txt first.') from None
    amis = Amis(os.environ['AMIS_CLIENT_ID'], os.environ['AMIS_CLIENT_SECRET'],
                os.environ.get('AMIS_API_BASE', 'https://crmconnect.misa.vn/api/v2'))
    warehouse = os.environ.get('AMIS_STOCK_CODE', 'HCM 3').strip()
    if not warehouse:
        raise SyncError('AMIS_STOCK_CODE is empty.')
    try:
        with psycopg.connect(os.environ['DATABASE_URL'], autocommit=True, sslmode='require', connect_timeout=20) as conn:
            conn.execute("SET statement_timeout = '90s'")
            conn.execute("SET lock_timeout = '10s'")
            summary = sync(conn, amis, warehouse, args.apply)
    except psycopg.Error:
        raise SyncError('Database operation failed. Check credentials, connection and migration 005. Transaction rolled back.') from None
    print(json.dumps(summary, ensure_ascii=True))
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a', encoding='utf-8') as report:
            report.write('## AMIS stock synchronization\n\n')
            report.write('\n'.join(f'- {key}: {value}' for key, value in summary.items()) + '\n')


if __name__ == '__main__':
    try:
        main()
    except SyncError as exc:
        print('ERROR: ' + str(exc), file=sys.stderr)
        sys.exit(1)
