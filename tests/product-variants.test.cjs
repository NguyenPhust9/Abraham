const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const context = vm.createContext({ console }); context.window = context;
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/product-variants.js'), 'utf8'), context);
const api = context.ProductVariants;

assert.deepEqual({ ...api.splitVariant('AURA-16 - Hồng Nhạt') }, { base: 'AURA-16', color: 'Hồng Nhạt' });
assert.deepEqual({ ...api.splitVariant('A200 Cổ Ngang') }, { base: 'A200 Cổ Ngang', color: '' });
assert.deepEqual({ ...api.splitVariant('BIKE24 - Trắng Dè Ngọc') }, { base: 'BIKE24', color: 'Trắng Dè Ngọc' });

const grouped = api.groupProductVariants([
  { id: 1, sku: 'AURA-16 - Đỏ', stock: 0 },
  { id: 2, sku: 'AURA-16 - Xanh Dương', stock: 3 },
  { id: 3, sku: 'AURA-18 - Đỏ', stock: 2 },
  { id: 4, sku: 'MODEL Có Đề', stock: 1 }
]);
assert.equal(grouped.length, 3);
assert.equal(grouped[0].id, 2);
assert.equal(grouped[0]._variants.length, 2);
assert.equal(api.productVariantInfo(grouped[0]).color, 'Xanh Dương');
assert.equal(api.productVariantInfo(grouped[0]).base, 'AURA-16');
assert.equal(api.formatBaseName('FH12'), 'FH-12');
assert.equal(api.formatBaseName('A700'), 'A700');
console.log('Passed bicycle model grouping, color extraction, stock preference and non-color protection.');
