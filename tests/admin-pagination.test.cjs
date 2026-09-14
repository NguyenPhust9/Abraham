const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map();function get(id){if(!nodes.has(id))nodes.set(id,{value:'',innerHTML:'',textContent:'',hidden:true,replaceChildren(){this.innerHTML=''}});return nodes.get(id);}
const c=vm.createContext({document:{getElementById:get,addEventListener(){}},console});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/admin.js'),'utf8'),c);
vm.runInContext('allProducts=Array.from({length:45},(_,i)=>({id:i+1,name:`Bike ${i+1}`,sku:`SKU-${i+1}`,category:i<30?"Road":"City",stock:1,is_active:true}));',c);
const rows=()=>[...get('productsTableBody').innerHTML.matchAll(/<tr>/g)].length;
c.renderTable();assert.equal(rows(),20);assert.equal(get('productPageInfo').textContent,'Hiển thị 1–20 / 45 sản phẩm');
vm.runInContext('adminProductPage=3;',c);c.renderTable();assert.equal(rows(),5);assert.match(get('productsTableBody').innerHTML,/Bike 45/);assert.equal(get('productPageInfo').textContent,'Hiển thị 41–45 / 45 sản phẩm');
vm.runInContext('allProducts=allProducts.slice(0,40);',c);c.renderTable();assert.equal(vm.runInContext('adminProductPage',c),2);assert.equal(rows(),20);
get('searchInput').value='SKU-39';c.resetAdminProductPage();assert.equal(rows(),1);assert.match(get('productsTableBody').innerHTML,/Bike 39/);assert.equal(vm.runInContext('adminProductPage',c),1);assert.equal(get('productPageControls').innerHTML,'');
get('searchInput').value='';get('categoryFilter').value='City';c.resetAdminProductPage();assert.equal(rows(),10);assert.match(get('productPageInfo').textContent,/10 sản phẩm/);
get('searchInput').value='missing';c.resetAdminProductPage();assert.match(get('productPageInfo').textContent,/0–0 \/ 0/);assert.match(get('productsTableBody').innerHTML,/Không tìm thấy/);
get('searchInput').value='';get('categoryFilter').value='';vm.runInContext('adminProductPageSize=10;',c);c.resetAdminProductPage();assert.equal(rows(),10);
console.log('Passed page slicing, last page, clamping after deletion, global SKU search, categories, empty results and page size.');
