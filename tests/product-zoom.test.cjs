const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
let ready;const nodes=new Map();function get(id){if(!nodes.has(id))nodes.set(id,{handlers:{},hidden:false,textContent:'',addEventListener(k,fn){this.handlers[k]=fn},click(){this.onclick?.();this.handlers.click?.({})}});return nodes.get(id);}
const root={style:{overflow:'auto'}};
const dialog=get('product-zoom-dialog');dialog.showModal=function(){this.open=true};dialog.close=function(){this.open=false;this.handlers.close()};
get('product-image').src='/first.jpg';get('product-image').currentSrc='/stale.jpg';get('product-image').alt='Bike';get('product-image-counter').textContent='1 / 2';
get('product-image-next').onclick=()=>{get('product-image').src='/second.jpg';get('product-image-counter').textContent='2 / 2'};
const c=vm.createContext({document:{getElementById:get,documentElement:root,addEventListener:(k,fn)=>ready=fn}});vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/product-zoom.js'),'utf8'),c);ready();
get('product-image-zoom').handlers.click();assert(dialog.open);assert.equal(get('product-zoom-image').src,'/first.jpg');assert.equal(root.style.overflow,'hidden');
get('product-zoom-next').handlers.click();assert.equal(get('product-zoom-image').src,'/second.jpg');assert.equal(get('product-zoom-counter').textContent,'2 / 2');get('product-zoom-close').handlers.click();assert(!dialog.open);assert.equal(root.style.overflow,'auto');
get('product-image-prev').hidden=true;get('product-image-zoom').handlers.click();assert(get('product-zoom-next').hidden);dialog.handlers.click({target:get('product-zoom-stage')});assert(!dialog.open);
console.log('Passed zoom open/close, current image, gallery navigation, single-image controls and scroll restoration.');
