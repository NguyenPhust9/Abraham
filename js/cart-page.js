(() => {
    const escape = value => String(value ?? "").replace(/[&<>"']/g, char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
    const money=value=>Math.max(0,Number(value)||0).toLocaleString("en-US")+"đ";
    function render() {
        const items=window.AbrahamCart.read();
        document.getElementById("cart-items").innerHTML=items.length?items.map(item=>`<tr><td><a class="d-flex align-items-center gap-3 text-decoration-none" href="${escape(getProductUrl(item))}"><img src="${escape(frontendProductImage(item.image_url))}" alt="" style="width:70px;height:70px;object-fit:contain"><strong>${escape(item.name||"Abraham Bike")}</strong></a></td><td>${money(item.price)}</td><td><input type="number" class="form-control" style="width:85px" min="1" max="${escape(item.stock)}" step="1" value="${escape(item.quantity)}" data-cart-quantity="${escape(item.id)}" aria-label="Quantity for ${escape(item.name)}"></td><td>${money(item.price*item.quantity)}</td><td><button type="button" class="btn btn-outline-danger btn-sm" data-cart-remove="${escape(item.id)}" aria-label="Remove ${escape(item.name)}">Remove</button></td></tr>`).join(""):'<tr><td colspan="5" class="text-center py-5">Your cart is empty. <a href="/shop">Explore our bikes</a>.</td></tr>';
        document.getElementById("cart-total").textContent=money(items.reduce((total,item)=>total+item.price*item.quantity,0));
    }
    document.addEventListener("DOMContentLoaded",()=>{
        render();
        document.getElementById("cart-items").addEventListener("click",event=>{const button=event.target.closest("[data-cart-remove]");if(button)try{window.AbrahamCart.remove(button.dataset.cartRemove);}catch(error){showError(error.message);}});
        document.getElementById("cart-items").addEventListener("change",event=>{const input=event.target.closest("[data-cart-quantity]");if(input)try{window.AbrahamCart.quantity(input.dataset.cartQuantity,input.value);document.getElementById("cart-error").classList.add("d-none");}catch(error){showError(error.message);render();}});
    });
    function showError(text){const error=document.getElementById("cart-error");error.textContent=text;error.classList.remove("d-none");}
    window.addEventListener("abraham:cart-updated",render);
    window.addEventListener("storage",event=>{if(event.key==="abraham_cart")render();});
})();
