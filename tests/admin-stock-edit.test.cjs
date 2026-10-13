const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const nodes = new Map();
function get(id) {
  if (!nodes.has(id)) nodes.set(id, {
    value: '', innerHTML: '', textContent: '', hidden: true, disabled: false,
    focus() { this.focused = true; },
    replaceChildren() { this.innerHTML = ''; }
  });
  return nodes.get(id);
}

let updatePayload;
const query = {
  update(payload) { updatePayload = payload; return this; },
  eq() { return this; },
  async select() { return { data: [{ id: 7, stock: updatePayload.stock }], error: null }; }
};
const context = vm.createContext({
  document: { getElementById: get, addEventListener() {} },
  supabaseClient: { from() { return query; } },
  showAdminSuccess() {}, alert(message) { context.lastAlert = message; },
  console
});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/admin.js'), 'utf8'), context);

assert.equal(context.parseStockValue('12'), 12);
assert.equal(context.parseStockValue('-1'), null);
assert.equal(context.parseStockValue('1.5'), null);

vm.runInContext("allProducts=[{id:7,name:'Bike A',stock:9,is_active:true}];", context);
get('stockInput-7').value = '15';
get('stockInput-7').defaultValue = '9';
get('stockInput-7').parentElement = { querySelectorAll() { return []; } };
context.saveProductStock(7).then(() => {
  assert.equal(updatePayload.stock, 15);
  assert.equal(vm.runInContext('allProducts[0].stock', context), 15);
  console.log('Passed stock validation and admin stock update while preserving the current value.');
});
