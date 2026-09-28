const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const context = vm.createContext({ console });
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/admin-bulk-price-import.js'), 'utf8'), context);
const api = context.AdminBulkPriceImport;
const products = [{ id: 1, sku: 'AB-01', name: 'Bike A', price: 100 }];

assert.equal(api.parsePrice('1.250.000đ'), 1250000);
let result = api.prepareRows([{ SKU: 'ab-01', Giá: 200 }, { SKU: 'MISSING', Giá: 300 }], products);
assert.equal(result.rows[0].product.id, 1);
assert.equal(result.rows[0].price, 200);
assert.equal(result.rows[0].error, '');
assert.match(result.rows[1].error, /Không tìm thấy/);
result = api.prepareRows([{ ID: 1, Price: 400 }, { ID: 1, Price: 500 }], products);
assert.equal(result.rows[0].error, '');
assert.match(result.rows[1].error, /trùng/);
console.log('Passed independent Excel bulk-price matching, validation and duplicate detection.');
