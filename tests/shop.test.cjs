const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = name => fs.readFileSync(path.join(__dirname, '..', 'js', name), 'utf8');

function storage() {
    const items = new Map();
    return { getItem: key => items.get(key) || null, setItem: (key, value) => items.set(key, value) };
}
function node() {
    return { value: '', max: '10000000', checked: false, textContent: '', innerHTML: '', handlers: {}, attrs: {},
        classList: { add() {}, remove() {}, toggle() {} },
        addEventListener(name, callback) { this.handlers[name] = callback; },
        setAttribute(key, value) { this.attrs[key] = value; },
        querySelectorAll() { return []; }, replaceChildren() { this.innerHTML = ''; }, scrollIntoView() {} };
}
const products = [
    { id: 1, name: 'Road bike', category: 'Road', price: null, stock: 2, created_at: '2026-01-01' },
    { id: 2, name: 'Road bike premium', category: 'Road', price: 3000000, stock: 0, created_at: '2026-02-01' },
    { id: 3, name: 'City <bike>', category: 'City', price: 1000000, stock: '3', created_at: '2026-03-01' },
    { id: 4, name: 'Hidden bike', category: 'Road', price: 0, stock: 5, is_active: false },
    { id: 5, name: 'Old bike', category: 'Road', price: 0, stock: null }
];

async function testShop() {
    const nodes = new Map();
    const get = id => { if (!nodes.has(id)) nodes.set(id, node()); return nodes.get(id); };
    let ready;
    const context = vm.createContext({
        window: { supabase: { createClient: () => ({ from: () => ({ select() { return this; }, order() { return this; }, range: async (from, to) => ({ data: products.slice(from, to + 1), error: null }) }) }) }, AbrahamCart: { add() {} } },
        document: { getElementById: get, addEventListener: (event, callback) => { ready = callback; } },
        localStorage: storage(), console, setTimeout, clearTimeout
    });
    for (const file of ['frontend-language.js', 'product-url.js', 'shop.js']) vm.runInContext(source(file), context);
    const filters = { keyword: '', categories: new Set(), availability: 'in', minPrice: 0, maxPrice: Infinity, sort: 'newest' };
    const ids = options => Array.from(context.filterShopProducts(products, { ...filters, ...options }), product => product.id);
    assert.deepEqual(ids({}), [3, 1]);
    assert.deepEqual(ids({ availability: 'all' }), [3, 2, 1, 5]);
    assert.deepEqual(ids({ availability: 'out' }), [2, 5]);
    assert.deepEqual(ids({ keyword: 'ROAD', availability: 'all', categories: new Set(['Road']), maxPrice: 0 }), [1]);
    assert.deepEqual(ids({ availability: 'all', sort: 'price-asc' }), [1, 5, 3, 2]);
    assert.deepEqual(ids({ availability: 'all', sort: 'price-desc', minPrice: 1000000 }), [2, 3]);
    assert.deepEqual(ids({ categories: new Set(['City']) }), [3]);
    ready();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(get('availability-all').checked, true);
    assert.equal(get('in-stock-only').checked, false);
    assert.equal(get('product-count').textContent, 4);
    assert.match(get('product-list').innerHTML, />0đ</);
    assert.match(get('product-list').innerHTML, /City &lt;bike&gt;/);
    assert.match(get('product-list').innerHTML, /\/san-pham\/road-bike-1/);
    get('in-stock-only').checked = false;
    get('in-stock-only').handlers.change();
    assert.equal(get('product-count').textContent, 4);
    assert.match(get('product-list').innerHTML, /data-add-cart="2" disabled/);
    get('availability-out').checked = true;
    get('availability-out').handlers.change();
    assert.equal(get('product-count').textContent, 2);
    get('price-min').value = '500'; get('price-max').value = '100';
    get('shop-filter-form').handlers.submit({ preventDefault() {} });
    assert.match(get('shop-filter-error').textContent, /valid price range/);
    get('shop-reset').handlers.click();
    assert.equal(get('product-count').textContent, 4);
    assert.equal(get('availability-all').checked, true);
}
function testCart() {
    const callbacks = {}, localStorage = storage();
    const context = vm.createContext({ localStorage, Event: class { constructor(type) { this.type = type; } },
        document: { addEventListener() {}, querySelectorAll: () => [] },
        window: { addEventListener: (name, callback) => { callbacks[name] = callback; }, dispatchEvent: event => callbacks[event.type]?.() } });
    vm.runInContext(source('cart-store.js'), context);
    const cart = context.window.AbrahamCart;
    cart.add(products[0]); cart.add(products[0]);
    assert.equal(cart.count(), 2);
    assert.equal(cart.read()[0].price, 0);
    assert.throws(() => cart.add(products[0]), /available quantity/);
    assert.throws(() => cart.add(products[1]), /out of stock/);
    cart.quantity(1, 1); assert.equal(cart.count(), 1);
    assert.throws(() => cart.quantity(1, 5), /available stock/);
    cart.remove(1); assert.equal(cart.count(), 0);
}
(async () => { await testShop(); testCart(); console.log('Passed shop filters, availability defaults/toggles, sort, zero prices, safe product rendering, invalid range handling and cart operations.'); })().catch(error => { console.error(error); process.exitCode = 1; });
