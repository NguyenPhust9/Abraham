const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const callbacks={},ready=[],values=new Map();
const nodes=new Map();
function get(id){if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',hidden:true,handlers:{},attrs:{},classes:new Set(),classList:{add(k){nodes.get(id).classes.add(k)},remove(k){nodes.get(id).classes.delete(k)},toggle(k,yes){yes?this.add(k):this.remove(k)}},addEventListener(name,fn){this.handlers[name]=fn},querySelectorAll(){return []},scrollIntoView(){},matches(){return !!this.open},showPopover(){this.open=true},hidePopover(){this.open=false}});return nodes.get(id);}
const context=vm.createContext({window:{addEventListener:(name,fn)=>{(callbacks[name]||=[]).push(fn)},dispatchEvent:event=>(callbacks[event.type]||[]).forEach(fn=>fn(event))},document:{getElementById:get,addEventListener:(name,fn)=>ready.push(fn),querySelectorAll:()=>[]},localStorage:{getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)},Event:class{constructor(type){this.type=type}},setTimeout:()=>1,clearTimeout(){},console});
for(const name of ['frontend-language.js','product-url.js','cart-store.js','cart-page.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',name),'utf8'),context);
ready.forEach(fn=>fn());const cart=context.window.AbrahamCart;
assert(get('cart-layout').classes.has('d-none'));assert(!get('cart-empty').classes.has('d-none'));assert.equal(get('cart-total').textContent,'0đ');
cart.add({id:6,name:'Road <bike>',category:'Xe đạp 26',price:1000000,stock:3});
assert(!get('cart-layout').classes.has('d-none'));assert.equal(get('cart-total').textContent,'1,000,000đ');assert.match(get('cart-items').innerHTML,/Road &lt;bike&gt;/);assert.match(get('cart-items').innerHTML,/26-inch Bikes/);assert.match(get('cart-items').innerHTML,/data-cart-step="-1"[^>]+disabled/);
const plus={disabled:false,dataset:{cartId:'6',cartStep:'1'}};get('cart-items').handlers.click({target:{closest:s=>s==='[data-cart-step]'?plus:null}});
assert.equal(cart.count(),2);assert.equal(get('cart-total').textContent,'2,000,000đ');
const input={dataset:{cartQuantity:'6'},value:'99'};get('cart-items').handlers.change({target:{closest:()=>input}});assert.equal(cart.count(),2);assert.match(get('cart-error').textContent,/available stock/);
input.value='3';get('cart-items').handlers.change({target:{closest:()=>input}});assert.equal(get('cart-subtotal').textContent,'3,000,000đ');assert.match(get('cart-items').innerHTML,/data-cart-step="1"[^>]+disabled/);
get('cart-items').handlers.click({target:{closest:s=>s==='[data-cart-remove]'?{dataset:{cartRemove:'6'}}:null}});assert.equal(cart.count(),0);assert(get('cart-layout').classes.has('d-none'));assert.equal(get('cart-notice').hidden,false);assert.equal(get('cart-notice').open,true);
cart.add({id:7,name:'Zero price bike',price:null,stock:1});assert.equal(get('cart-total').textContent,'0đ');
values.set('abraham_cart',JSON.stringify([{id:7,quantity:'2',price:'500',stock:4},{id:8,quantity:-1},{id:9,quantity:1.2}]));assert.equal(cart.read().length,1);cart.add({id:7,name:'Bike',price:500,stock:4});assert.equal(cart.count(),3);
console.log('Passed empty/populated cart, quantity buttons and limits, totals, removal popup, English labels, zero prices and stored quantity normalization.');
