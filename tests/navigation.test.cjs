const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
function run(pathname){
 const links=['/','/shop','/about','/dealers','/blog','/contact'].map(href=>node(href));const cart=node('/cart');
 const document={querySelectorAll:s=>s==='.abx-navigation-link'?links:s==='.abx-cart-link'?[cart]:[],getElementsByClassName:()=>[]};
 const window={location:{pathname,origin:'http://localhost'}};
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/custom.js'),'utf8'),vm.createContext({window,document,URL,console}));
 return {links,cart};
}
function node(href){const classes=new Set();const attrs={href};return {classList:{toggle:(n,on)=>on?classes.add(n):classes.delete(n)},getAttribute:n=>attrs[n],setAttribute:(n,v)=>attrs[n]=v,removeAttribute:n=>delete attrs[n],classes,attrs};}
let r=run('/product-detail.html');assert(r.links[1].classes.has('is-active'));assert.equal(r.links[1].attrs['aria-current'],'page');
r=run('/dealers');assert(r.links[3].classes.has('is-active'));
r=run('/san-pham/bike-123');assert(r.links[1].classes.has('is-active'));
r=run('/blog-post');assert(r.links[4].classes.has('is-active'));
r=run('/checkout');assert(r.cart.classes.has('is-active'));assert.equal(r.links.some(link=>link.classes.has('is-active')),false);
r=run('/');assert(r.links[0].classes.has('is-active'));assert(!r.cart.classes.has('is-active'));
console.log('Passed shared active navigation for home, detail pages, blog posts and checkout flow.');
