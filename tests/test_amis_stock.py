import json
import unittest
from contextlib import contextmanager
from pathlib import Path
from unittest.mock import patch
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from sync_amis_stock import Amis, SyncError, field, integer, inventory_map, plan_updates, records, sync, token_from


class InventoryTests(unittest.TestCase):
    def test_decodes_nested_string_data(self):
        self.assertEqual(records({'Data': json.dumps({'Items': [{'code': 'A'}]})}), [{'code': 'A'}])

    def test_malformed_data_is_not_empty_inventory(self):
        for data in [None, 'oops', {}, [None], 10]:
            with self.subTest(data=data), self.assertRaises(SyncError):
                records({'data': data})

    def test_missing_quantity_is_not_zero(self):
        for quantity in [None, '', True, 'bad', '1.5', 'NaN', 'Infinity', 2147483648]:
            with self.subTest(quantity=quantity), self.assertRaises(SyncError):
                integer(quantity)
        self.assertEqual(integer('0.00'), 0)
        self.assertEqual(integer('-2'), -2)  # Preserve signed source data, never clamp.

    def test_original_stock_not_reserved_or_available(self):
        result = inventory_map([{'ProductCode': ' FH12  - Xanh ', 'MainStockQuantity': '9',
                                 'amount_summary': 4, 'order_quantity': 5}])
        self.assertEqual(result['fh12 - xanh']['stock'], 9)

    def test_duplicate_source_codes_abort(self):
        with self.assertRaises(SyncError):
            inventory_map([{'code': ' A ', 'main_stock_quantity': 1}, {'code': 'a', 'main_stock_quantity': 2}])

    def test_missing_code_or_quantity_abort(self):
        for row in [{'main_stock_quantity': 1}, {'code': 'A'}]:
            with self.assertRaises(SyncError): inventory_map([row])

    def test_zero_updates_missing_is_preserved_and_no_inserts(self):
        source = inventory_map([{'code': 'a', 'main_stock_quantity': 0}, {'code': 'NEW', 'main_stock_quantity': 5}])
        updates, summary = plan_updates([{'id': 1, 'sku': ' A ', 'stock': 8}, {'id': 2, 'sku': 'B', 'stock': 20}], source)
        self.assertEqual(updates, [(1, 0)])
        self.assertEqual(summary['missing_in_amis'], 1)
        self.assertEqual(summary['missing_on_website'], 1)
        self.assertEqual(summary['changed'], 1)

    def test_duplicate_website_sku_receives_same_source_stock(self):
        updates, summary = plan_updates(
            [{'id': 1, 'sku': ' A ', 'stock': 1}, {'id': 2, 'sku': 'a', 'stock': 1}],
            {'a': {'stock': 3}})
        self.assertEqual(updates, [(1, 3), (2, 3)])
        self.assertEqual(summary['matched'], 2)
        self.assertEqual(summary['changed'], 2)

    def test_zero_matches_aborts(self):
        with self.assertRaises(SyncError): plan_updates([], {'a': {'stock': 1}})

    def test_unchanged_stock_is_still_timestamped(self):
        updates, summary = plan_updates([{'id': 1, 'sku': 'A', 'stock': 5}], {'a': {'stock': 5}})
        self.assertEqual(updates, [(1, 5)])
        self.assertEqual(summary['changed'], 0)

    def test_token_decoding(self):
        self.assertEqual(token_from({'Data': json.dumps({'AccessToken': 'abc'})}), 'abc')
        self.assertIsNone(token_from({'message': 'A long message should not be mistaken for a token'}))


class ApiTests(unittest.TestCase):
    def client(self, payloads):
        client = Amis('test-id', 'test-secret')
        iterator = iter(payloads)
        client.request = lambda *args, **kwargs: next(iterator)
        return client

    def test_exact_warehouse_code_required(self):
        rows = [{'stock_code': 'HCM 30', 'stock_name': 'HCM 3', 'id': 'bad'}, {'StockCode': 'HCM 3', 'AsyncId': 'good'}]
        self.assertEqual(self.client([{'data': rows}]).stock_id('HCM 3'), 'good')
        with self.assertRaises(SyncError): self.client([{'data': rows[:1]}]).stock_id('HCM 3')

    def test_page_count_overrides_short_page(self):
        client = self.client([{'data': [{'code': 'A'}], 'TotalPages': 2}, {'data': [{'code': 'B'}], 'TotalPages': 2}])
        self.assertEqual(len(client.inventory('warehouse')), 2)

    def test_paging_without_total(self):
        first = [{'code': str(i)} for i in range(50)]
        client = self.client([{'data': first}, {'data': [{'code': 'last'}]}])
        self.assertEqual(len(client.inventory('warehouse')), 51)

    def test_repeated_page_aborts(self):
        payload = {'data': [{'code': 'A'}], 'total_pages': 2}
        with self.assertRaises(SyncError): self.client([payload, payload]).inventory('warehouse')

    def test_empty_or_incomplete_inventory_aborts(self):
        for payloads in [[{'data': []}], [{'data': [{'code': 'A'}], 'total_pages': 2}, {'data': [], 'total_pages': 2}]]:
            with self.assertRaises(SyncError): self.client(payloads).inventory('warehouse')

    def test_api_success_false_is_error(self):
        class Response:
            def __enter__(self): return self
            def __exit__(self, *args): pass
            def read(self): return b'{"success":false,"data":[]}'
        with patch('sync_amis_stock.urlopen', return_value=Response()), self.assertRaises(SyncError):
            Amis('id', 'secret').request('/Stocks')

    def test_ledger_false_flag_requires_zero_code_and_complete_metadata(self):
        class Response:
            def __init__(self, payload): self.payload = payload
            def __enter__(self): return self
            def __exit__(self, *args): pass
            def read(self): return json.dumps(self.payload).encode()
        payload = {'success': False, 'code': 0, 'total_pages': 1, 'total_records': 1,
                   'data': [{'product_code': 'A', 'main_stock_quantity': 3}]}
        with patch('sync_amis_stock.urlopen', return_value=Response(payload)):
            self.assertEqual(Amis('id', 'secret').request('/Stocks/product_ledger'), payload)
        for override in [{'code': 500}, {'code': False}, {'total_records': 0}, {'data': []}]:
            with self.subTest(override=override), patch('sync_amis_stock.urlopen', return_value=Response({**payload, **override})), self.assertRaises(SyncError):
                Amis('id', 'secret').request('/Stocks/product_ledger')

    def test_inventory_record_count_must_match(self):
        client = self.client([{'data': [{'code': 'A'}], 'total_pages': 1, 'total_records': 2}])
        with self.assertRaises(SyncError): client.inventory('warehouse')


class FakeConnection:
    def __init__(self, fail_write=False):
        self.fail_write = fail_write
        self.events = []
        self.writes = []
    def execute(self, sql):
        self.events.append(sql)
        return self
    def fetchone(self): return (True,)
    def fetchall(self): return [(1, 'A', 8)]
    @contextmanager
    def transaction(self):
        try:
            yield
            self.events.append('commit')
        except Exception:
            self.events.append('rollback')
            raise
    @contextmanager
    def cursor(self): yield self
    def executemany(self, sql, args):
        if self.fail_write: raise RuntimeError('write failed')
        self.writes.append((sql, args))


class SyncTests(unittest.TestCase):
    def source(self):
        class Source:
            def authenticate(self): pass
            def stock_id(self, code): return 'id'
            def inventory(self, stock_id): return [{'code': 'A', 'main_stock_quantity': 3}]
        return Source()

    def test_dry_run_never_writes(self):
        conn = FakeConnection()
        result = sync(conn, self.source(), 'HCM 3')
        self.assertEqual(conn.writes, [])
        self.assertEqual(result['changed'], 1)
        self.assertIn('advisory_unlock', conn.events[-1])

    def test_apply_uses_single_transaction_and_exact_value(self):
        conn = FakeConnection()
        sync(conn, self.source(), 'HCM 3', True)
        self.assertEqual(conn.writes[0][1], [(3, 'HCM 3', 1)])
        self.assertIn('commit', conn.events)
        self.assertIn('advisory_lock', conn.events[0])

    def test_write_failure_rolls_back_and_unlocks(self):
        conn = FakeConnection(fail_write=True)
        with self.assertRaises(RuntimeError): sync(conn, self.source(), 'HCM 3', True)
        self.assertIn('rollback', conn.events)
        self.assertNotIn('commit', conn.events)
        self.assertIn('advisory_unlock', conn.events[-1])


if __name__ == '__main__':
    unittest.main()
