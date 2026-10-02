const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const input = { value: 0, disabled: false };
let current = { stock: 9, amis_stock_synced_at: '2026-10-02', amis_stock_code: 'HCM 3' }, failure = null, reads = 0;
const query = {
    select() { return this; }, eq() { return this; },
    async single() { reads++; return { data: current, error: failure }; }
};
const context = vm.createContext({
    document: { getElementById() { return input; }, addEventListener() {} },
    supabaseClient: { from() { return query; } }
});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/admin.js'), 'utf8'), context);
vm.runInContext('allProducts = [{ id: 1, stock: 0 }]', context);
(async () => {
    // AMIS synced after the old editor snapshot was loaded.
    const payload = { name: 'Updated name', price: 1590000, image_url: '/new.png', stock: 0 };
    await context.prepareProductStockUpdate('1', payload);
    assert.equal('stock' in payload, false);
    assert.equal(payload.name, 'Updated name');
    assert.equal(payload.image_url, '/new.png');
    assert.equal(input.value, 9);
    assert.equal(input.disabled, true);
    // Unsynced products still allow deliberate manual stock edits.
    current = { stock: 0, amis_stock_synced_at: null }; input.disabled = false;
    const manual = { stock: 4 };
    await context.prepareProductStockUpdate('1', manual);
    assert.equal(manual.stock, 4);
    const unchanged = { stock: 0 };
    await context.prepareProductStockUpdate('1', unchanged);
    assert.equal('stock' in unchanged, false);
    const before = reads, added = { stock: 3 };
    await context.prepareProductStockUpdate('', added);
    assert.equal(reads, before); assert.equal(added.stock, 3);
    failure = new Error('Read failed');
    await assert.rejects(context.prepareProductStockUpdate('1', { stock: 4 }), /Read failed/);
    console.log('Passed stale AMIS editor, metadata edits, manual stock, unchanged stock, new products and read failure checks.');
})().catch(error => { console.error(error); process.exitCode = 1; });
