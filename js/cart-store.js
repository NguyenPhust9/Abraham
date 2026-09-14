(() => {
    const KEY = "abraham_cart";
    function read() {
        try { const data=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(data)?data.filter(item=>item && item.id!=null && Number(item.quantity)>0):[]; } catch (_) { return []; }
    }
    function save(items) {
        try {localStorage.setItem(KEY,JSON.stringify(items));} catch(_){throw new Error("Unable to save your cart in this browser.");}
        window.dispatchEvent(new Event("abraham:cart-updated"));
    }
    function count() {return read().reduce((sum,item)=>sum+(Number(item.quantity)||0),0);}
    function updateBadge() {
        document.querySelectorAll(".abx-cart-link").forEach(link=>{
            let badge=link.querySelector(".abx-cart-count");
            if(!badge){badge=document.createElement("span");badge.className="abx-cart-count";link.append(badge);}
            const quantity=count();badge.textContent=quantity;badge.hidden=quantity===0;link.setAttribute("aria-label",`View cart, ${quantity} items`);
        });
    }
    window.AbrahamCart = {
        read, count,
        add(product) {
            const stock=Number(product.stock)||0;
            if(stock<=0)throw new Error("This product is out of stock.");
            const items=read();let item=items.find(item=>String(item.id)===String(product.id));
            if(item && item.quantity>=stock)throw new Error("You have reached the available quantity for this product.");
            if(item){item.quantity+=1;item.name=product.name;item.price=Math.max(0,Number(product.price)||0);item.stock=stock;item.image_url=product.image_url;}
            else items.push({id:product.id,name:product.name,price:Math.max(0,Number(product.price)||0),image_url:product.image_url,quantity:1,stock});
            save(items);
        },
        quantity(id,quantity) {const items=read();const item=items.find(item=>String(item.id)===String(id));if(!item)return;const amount=Number(quantity);if(!Number.isInteger(amount)||amount<1||amount>item.stock)throw new Error("Choose a quantity within available stock.");item.quantity=amount;save(items);},
        remove(id) {save(read().filter(item=>String(item.id)!==String(id)));}
    };
    document.addEventListener("DOMContentLoaded",updateBadge);
    window.addEventListener("abraham:cart-updated",updateBadge);
    window.addEventListener("storage",event=>{if(event.key===KEY)updateBadge();});
})();
