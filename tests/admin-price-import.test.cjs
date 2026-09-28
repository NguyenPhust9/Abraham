const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const context = vm.createContext({ console });
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/admin-price-import.js'), 'utf8'), context);
const api = context.AdminProductImport;

assert.equal(api.parseNumber('1.250.000đ'), 1250000);
assert.equal(api.parseNumber('1,250,000'), 1250000);
assert.equal(api.parseNumber('', 0), 0);

const products = [{ id: 1, sku: 'AB-01', name: 'Bike A' }];
let result = api.prepareRows([
  { 'Mã sản phẩm': 'ab-01', 'Tên sản phẩm': 'Đã có', Giá: 100 },
  { 'Mã sản phẩm': 'NEW-01', 'Tên sản phẩm': 'Xe mới', 'Danh mục': 'Bikes', Giá: '2.500.000', 'Tồn kho': 12 },
  { 'Mã sản phẩm': 'new-01', 'Tên sản phẩm': 'Trùng trong file', Giá: 200 }
], products);
assert.equal(result.fatalError, '');
assert.equal(result.rows[0].action, 'skip');
assert.match(result.rows[0].skipReason, /tồn tại/);
assert.equal(result.rows[1].action, 'create');
assert.equal(result.rows[1].price, 2500000);
assert.equal(result.rows[1].stock, 12);
assert.equal(result.rows[1].category, 'Bikes');
assert.equal(result.rows[2].action, 'skip');
assert.match(result.rows[2].skipReason, /trùng trong file/);

result = api.prepareRows([{ SKU: '', Name: 'Thiếu mã' }, { SKU: 'X', Name: '', Price: -1 }], products);
assert.match(result.rows[0].error, /Thiếu mã/);
assert.match(result.rows[1].error, /Thiếu tên/);
assert.match(api.prepareRows([{ Price: 100 }], products).fatalError, /SKU/);
console.log('Passed product Excel parsing, new-product mapping, validation and duplicate skipping.');
