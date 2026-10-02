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
        localStorage: storage(), console, setTimeout, clearTimeout, URLSearchParams, location: { search: '' }
    });
    for (const file of ['frontend-language.js', 'product-url.js', 'product-variants.js', 'shop-categories.js', 'shop.js']) vm.runInContext(source(file), context);
    const filters = { keyword: '', categories: new Set(), availability: 'in', minPrice: 0, maxPrice: Infinity, sort: 'newest' };
    const ids = options => Array.from(context.filterShopProducts(products, { ...filters, ...options }), product => product.id);
    assert.deepEqual(ids({}), [3, 1]);
    assert.deepEqual(ids({ availability: 'all' }), [3, 1]);
    assert.deepEqual(ids({ availability: 'out' }), [3, 1]);
    assert.deepEqual(ids({ keyword: 'ROAD', availability: 'all', categories: new Set(['Road']), maxPrice: 0 }), [1]);
    assert.deepEqual(ids({ availability: 'all', sort: 'price-asc' }), [1, 3]);
    assert.deepEqual(ids({ availability: 'all', sort: 'price-desc', minPrice: 1000000 }), [3]);
    assert.deepEqual(ids({ categories: new Set(['City']) }), [3]);
    const colored = [
        { id: 10, sku: 'BIKE - V\u00e0ng', stock: 4, image_url: '', created_at: '2026-04-01' },
        { id: 11, sku: 'BIKE - \u0110\u1ecf', stock: 2, image_url: '/red.png', created_at: '2026-01-01' },
        { id: 12, sku: 'OTHER', stock: 1, image_url: '', created_at: '2026-05-01' }
    ];
    const grouped = options => Array.from(context.filterShopProducts(colored, { ...filters, ...options }), p => p.id);
    assert.deepEqual(grouped({}), [11, 12]);
    colored[1].stock = 0;
    assert.deepEqual(grouped({}), [12, 10]);
    assert.deepEqual(grouped({ availability: 'all' }), [12, 10]);
    ready();
    await new Promise(resolve => setImmediate(resolve));
    assert.match(get('category-buttons').innerHTML, /shop-category-dropdown/);
    assert.match(get('category-buttons').innerHTML, /data-category="kids-12"/);
    assert.match(get('category-buttons').innerHTML, /data-category="parts-electric"/);
    get('category-buttons').handlers.click({ target: { closest() { return { dataset: { category: 'kids-12' } }; } } });
    assert.equal(get('product-count').textContent, 0);
    get('category-buttons').handlers.click({ target: { closest() { return { dataset: { category: 'all' } }; } } });
    assert.equal(get('product-count').textContent, 2);
    assert.match(get('product-list').innerHTML, />0đ</);
    assert.match(get('product-list').innerHTML, /City &lt;bike&gt;/);
    assert.match(get('product-list').innerHTML, /\/san-pham\/road-bike-1/);
    assert.doesNotMatch(get('product-list').innerHTML, /data-add-cart="2"/);
    get('price-min').value = '500'; get('price-max').value = '100';
    get('shop-filter-form').handlers.submit({ preventDefault() {} });
    assert.match(get('shop-filter-error').textContent, /valid price range/);
    get('shop-reset').handlers.click();
    assert.equal(get('product-count').textContent, 2);
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
(async () => { await testShop(); testCart(); console.log('Passed shop filters, in-stock-only visibility and reset, sort, zero prices, safe product rendering, invalid range handling and cart operations.'); })().catch(error => { console.error(error); process.exitCode = 1; });
