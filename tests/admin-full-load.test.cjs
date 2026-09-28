const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const products = Array.from({ length: 2350 }, (_, index) => ({ id: index + 1 }));
const ranges = [];
const query = {
  select() { return this; },
  order() { return this; },
  range(from, to) {
    ranges.push([from, to]);
    return Promise.resolve({ data: products.slice(from, to + 1), error: null });
  }
};
const context = vm.createContext({
  document: { getElementById() { return {}; }, addEventListener() {} },
  supabaseClient: { from(table) { assert.equal(table, 'products'); return query; } },
  console
});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/admin.js'), 'utf8'), context);

(async () => {
  const result = await context.fetchAllProducts();
  assert.equal(result.error, null);
  assert.equal(result.data.length, 2350);
  assert.equal(result.data[0].id, 1);
  assert.equal(result.data.at(-1).id, 2350);
  assert.deepEqual(ranges, [[0, 999], [1000, 1999], [2000, 2999]]);
  console.log('Passed complete admin product loading beyond the Supabase 1,000-row response limit.');
})().catch(error => { console.error(error); process.exitCode = 1; });
