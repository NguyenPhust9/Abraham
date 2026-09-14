(() => {
    const $ = id => document.getElementById(id);
    const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
    const money = value => Math.max(0, Number(value) || 0).toLocaleString("en-US") + "đ";
    let noticeTimer;
    function itemRow(item) {
        const name = item.name || "Abraham Bike";
        const quantity = Number(item.quantity);
        const stock = Number(item.stock) || 0;
        return `<article class="cart-item" aria-label="${escape(name)}">
            <div class="cart-item-product"><a class="cart-item-image" href="${escape(getProductUrl(item))}" aria-label="View ${escape(name)}"><img src="${escape(frontendProductImage(item.image_url))}" alt="${escape(name)}"></a><div class="cart-item-copy"><span class="cart-item-category">${escape(frontendCategory(item.category || "Abraham Bikes"))}</span><h3><a href="${escape(getProductUrl(item))}">${escape(name)}</a></h3><span class="cart-item-stock ${stock > 0 ? "" : "is-out"}">${stock > 0 ? "In stock" : "Out of stock"}</span></div></div>
            <span class="cart-item-price"><span class="visually-hidden">Unit price: </span>${money(item.price)}</span>
            <div class="cart-quantity"><button type="button" data-cart-step="-1" data-cart-id="${escape(item.id)}" aria-label="Decrease quantity of ${escape(name)}" ${quantity <= 1 ? "disabled" : ""}>−</button><input type="number" min="1" max="${Math.max(1, stock)}" step="1" value="${quantity}" data-cart-quantity="${escape(item.id)}" aria-label="Quantity for ${escape(name)}"><button type="button" data-cart-step="1" data-cart-id="${escape(item.id)}" aria-label="Increase quantity of ${escape(name)}" ${quantity >= stock ? "disabled" : ""}>+</button></div>
            <strong class="cart-item-total"><span class="visually-hidden">Item total: </span>${money(item.price * quantity)}</strong>
            <button type="button" class="cart-remove" data-cart-remove="${escape(item.id)}" aria-label="Remove ${escape(name)}"><i class="fa-regular fa-trash-can" aria-hidden="true"></i></button>
        </article>`;
    }
    function render() {
        const items = window.AbrahamCart.read();
        const count = items.reduce((total, item) => total + Number(item.quantity), 0);
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        $("cart-items").innerHTML = items.map(itemRow).join("");
        $("cart-item-count").textContent = `${count} ${count === 1 ? "item" : "items"}`;
        $("cart-summary-count").textContent = `(${count})`;
        $("cart-subtotal").textContent = money(total);
        $("cart-total").textContent = money(total);
        $("cart-layout").classList.toggle("d-none", items.length === 0);
        $("cart-empty").classList.toggle("d-none", items.length !== 0);
    }
    function showError(text) {
        $("cart-error").textContent = text;
        $("cart-error").classList.remove("d-none");
        $("cart-error").scrollIntoView({ behavior: "smooth", block: "center" });
    }
    function success(message) {
        const popup = $("cart-notice");
        clearTimeout(noticeTimer);
        $("cart-notice-text").textContent = message;
        popup.hidden = false;
        popup.classList.add("is-visible");
        if (typeof popup.showPopover === "function" && !popup.matches(":popover-open")) popup.showPopover();
        noticeTimer = setTimeout(() => {
            if (typeof popup.hidePopover === "function" && popup.matches(":popover-open")) popup.hidePopover();
            popup.classList.remove("is-visible"); popup.hidden = true;
        }, 2400);
    }
    function restoreFocus(attribute, value, step) {
        const element = [...$("cart-items").querySelectorAll(`[${attribute}]`)].find(element => element.getAttribute(attribute) === String(value) && (!step || element.dataset.cartStep === step));
        if (element && !element.disabled) element.focus({ preventScroll: true });
        else if (attribute === "data-cart-id") restoreFocus("data-cart-quantity", value);
    }
    function updateQuantity(id, quantity, focusAttribute, step) {
        try {
            window.AbrahamCart.quantity(id, quantity);
            $("cart-error").classList.add("d-none");
        } catch (error) { showError(error.message); render(); }
        restoreFocus(focusAttribute, id, step);
    }
    document.addEventListener("DOMContentLoaded", () => {
        render();
        $("cart-items").addEventListener("click", event => {
            const remove = event.target.closest("[data-cart-remove]");
            if (remove) {
                try { window.AbrahamCart.remove(remove.dataset.cartRemove); $("cart-error").classList.add("d-none"); success("Removed from your cart."); } catch (error) { showError(error.message); }
                return;
            }
            const button = event.target.closest("[data-cart-step]");
            if (!button || button.disabled) return;
            const item = window.AbrahamCart.read().find(item => String(item.id) === button.dataset.cartId);
            if (item) updateQuantity(item.id, Number(item.quantity) + Number(button.dataset.cartStep), "data-cart-id", button.dataset.cartStep);
        });
        $("cart-items").addEventListener("change", event => {
            const input = event.target.closest("[data-cart-quantity]");
            if (input) updateQuantity(input.dataset.cartQuantity, input.value, "data-cart-quantity");
        });
        $("cart-items").addEventListener("error", event => {
            if (event.target.tagName === "IMG" && !event.target.src.endsWith("/images/product-placeholder.svg")) event.target.src = "/images/product-placeholder.svg";
        }, true);
    });
    window.addEventListener("abraham:cart-updated", render);
    window.addEventListener("storage", event => { if (event.key === "abraham_cart") render(); });
})();
