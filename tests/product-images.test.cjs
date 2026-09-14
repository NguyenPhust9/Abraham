const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=name=>fs.readFileSync(path.join(__dirname,'../js',name),'utf8');
function element(tag='div') {return {tagName:tag.toUpperCase(),children:[],value:'',handlers:{},attrs:{},classes:new Set(),classList:{add(k){this.owner.classes.add(k)},remove(k){this.owner.classes.delete(k)},toggle(k,value){value?this.add(k):this.remove(k)}},append(...items){this.children.push(...items)},replaceChildren(){this.children=[]},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,fn){this.handlers[k]=fn}};}
function node(tag){const e=element(tag);e.classList.owner=e;return e;}
function context() {const nodes=new Map();const get=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)};const revoked=[];let serial=0;const c=vm.createContext({document:{getElementById:get,createElement:node},URL:{createObjectURL:()=>`blob:${++serial}`,revokeObjectURL:url=>revoked.push(url)},showProductFormError:message=>{c.error=message},console});c.window=c;vm.runInContext(source('product-images.js'),c);return {c,get,revoked};}
async function adminImages() {
 const {c,get,revoked}=context();vm.runInContext(source('admin-product-images.js'),c);const api=c.AdminProductImages;api.init();api.load({image_url:'/old.jpg',image_urls:['/old.jpg']});
 assert.equal(get('productImageGallery').children.length,1);
 const files=[{name:'a.jpg',type:'image/jpeg'},{name:'b.png',type:'image/png'}];get('productImageFile').handlers.change({target:{files,value:'files'}});assert.equal(get('productImageGallery').children.length,3);
 get('productImageGallery').children[1].children[2].handlers.click(); // Make the first new image the cover.
 api.setBusy(true);assert.equal(get('productImageFile').disabled,true);let prevented=false;get('productModal').handlers['hide.bs.modal']({preventDefault(){prevented=true}});assert(prevented);
 const uploaded=[];
 await assert.rejects(api.uploadAll(async file=>{uploaded.push(file.name);if(file.name==='b.png')throw new Error('upload failed');return '/a.jpg'},()=>{}),/upload failed/);
 const urls=await api.uploadAll(async file=>{uploaded.push(file.name);return '/b.png'},()=>{});
 assert.deepEqual(Array.from(urls),['/a.jpg','/old.jpg','/b.png']);assert.deepEqual(uploaded,['a.jpg','b.png','b.png']);assert.deepEqual(revoked,['blob:1','blob:2']);
 api.setBusy(false);get('productImageGallery').children[1].children[3].handlers.click();assert.deepEqual(Array.from(await api.uploadAll(()=>{},()=>{})),['/a.jpg','/b.png']);
 api.load(null);assert.equal(get('productImageGallery').children.length,0);
 get('productImageFile').handlers.change({target:{files:[{type:'text/plain'}],value:'x'}});assert.match(c.error,/hình ảnh/);
}
function gallery() {
 const {c,get}=context();vm.runInContext(source('frontend-language.js'),c);vm.runInContext(source('product-gallery.js'),c);
 assert.deepEqual(Array.from(c.getProductImages(null)),[]);assert.deepEqual(Array.from(c.getProductImages({image_url:'/a',image_urls:['/b','/a',null]})),['/a','/b']);
 c.renderProductGallery({name:'Road bike',image_url:'/a.jpg',image_urls:['/a.jpg','/b.jpg','/c.jpg']});
 assert.equal(get('product-image').src,'/a.jpg');assert.equal(get('product-thumbnails').children.length,3);assert.equal(get('product-thumbnails').hidden,false);
 get('product-thumbnails').children[2].handlers.click();assert.equal(get('product-image').src,'/c.jpg');assert.equal(get('product-image-counter').textContent,'3 / 3');
 get('product-image-next').onclick();assert.equal(get('product-image').src,'/a.jpg');get('product-image').onkeydown({key:'ArrowLeft',preventDefault(){}});assert.equal(get('product-image').src,'/c.jpg');
 c.renderProductGallery({name:'Legacy',image_url:'images/update.png'});assert.equal(get('product-image').src,'/images/product-placeholder.svg');assert.equal(get('product-thumbnails').hidden,true);
 c.renderProductGallery({name:'No photos'});assert.equal(get('product-image').src,'/images/product-placeholder.svg');
}
(async()=>{await adminImages();gallery();console.log('Passed multiple files, cover selection, old-image preservation, removal, upload retry, URL cleanup, upload lock, thumbnails/arrows and legacy products.');})().catch(error=>{console.error(error);process.exitCode=1});
