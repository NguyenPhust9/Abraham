const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const nodes = new Map();
function node(id) {
  if (!nodes.has(id)) nodes.set(id, { textContent:'', src:'', handlers:{}, attrs:{}, classes:new Set(),
    classList:{add(){},remove(){},toggle(){}},
    setAttribute(k,v){this.attrs[k]=v;}, removeAttribute(k){delete this.attrs[k];},
    addEventListener(k,fn){this.handlers[k]=fn;},
    querySelector(){return node(id+'-child');}, querySelectorAll(){return [];}
  });
  return nodes.get(id);
}
const variants = [{id:1,sku:'BIKE - Red',name:'Red',stock:0,price:10,image_url:'/red.png',badge:'Sale'}, {id:2,sku:'BIKE - Blue',name:'Blue',stock:5,price:20,image_url:'/blue.png'}];
const links = [node('red-link'),node('blue-link')];
node('product-variant-options').querySelectorAll = () => links;
const added = [], history = [];
const context = vm.createContext({console,URL,URLSearchParams,document:{getElementById:node,querySelector:node,addEventListener(){}},
  location:{pathname:'/san-pham/red-1',search:'',origin:'http://localhost'},
  history:{pushState(_,__,url){history.push(url);},replaceState(){}},addEventListener(){},
  supabase:{createClient(){return {from(){return {select(){return this;},ilike(){return this;},eq(){return this;},order:async()=>({data:variants})};}};}},
  ProductVariants:{productVariantInfo:()=>({base:'BIKE',key:'bike',color:'Color'})},
  getProductUrl:p=>'/san-pham/color-'+p.id, detailProductImage:x=>x, detailColor:()=> 'blue',
  frontendProductImage:x=>x, frontendValue:x=>x, renderProductSpecifications(){},
  renderDetailExtras:p=>{node('product-price').textContent=p.price;},
  renderProductGallery:p=>{node('product-image').src=p.image_url;},getProductImages:p=>[p.image_url],
  AbrahamCart:{add:p=>added.push(p.id)}
});
context.window=context;
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../js/product-detail.js'),'utf8'),context);
(async()=>{
  context.renderProductDetail(variants[0],false);
  await context.loadProductVariants(variants[0]);
  assert.equal(node('product-add-order').disabled,true);
  let prevented=false;
  links[1].handlers.click({button:0,preventDefault(){prevented=true;}});
  assert(prevented); assert.equal(history.length,1);
  assert.equal(node('product-name').textContent,'Blue');
  assert.equal(node('product-image').src,'/blue.png');
  assert.equal(node('product-price').textContent,20);
  assert.equal(node('product-add-order').disabled,false);
  links[0].handlers.pointerenter({pointerType:'mouse'});
  assert.equal(node('product-image').src,'/red.png');
  links[0].handlers.pointerleave();
  assert.equal(node('product-image').src,'/blue.png');
  node('product-add-order').onclick(); assert.deepEqual(added,[2]);
  links[0].handlers.click({button:0,ctrlKey:true,preventDefault(){throw Error('Modified click intercepted');}});
  assert.equal(history.length,1);
  console.log('Passed inline color selection, image preview restoration, price, stock, cart SKU and modified links.');
})().catch(error=>{console.error(error);process.exitCode=1;});
