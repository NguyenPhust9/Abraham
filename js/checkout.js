(() => {
    "use strict";
    const money = value => Math.max(0, Number(value) || 0).toLocaleString("en-US") + "đ";
    const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
    const requiredFields = ["c_country", "c_fname", "c_lname", "c_address", "c_state_country", "c_email_address", "c_phone"];

    function orderRows(items) {
        const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
        return items.map(item => `<tr><td><div class="checkout-order-product"><img src="${escape(item.image_url || "/images/product-placeholder.svg")}" alt=""><span><strong>${escape(item.name || "Abraham Bike")}</strong><small>Quantity: ${Number(item.quantity)}</small></span></div></td><td>${money(Number(item.price) * Number(item.quantity))}</td></tr>`).join("") +
            `<tr><td class="text-black font-weight-bold"><strong>Cart Subtotal</strong></td><td class="text-black">${money(total)}</td></tr>` +
            `<tr><td class="text-black font-weight-bold"><strong>Order Total</strong></td><td class="text-black font-weight-bold"><strong>${money(total)}</strong></td></tr>`;
    }

    function validate(documentRef) {
        for (const id of requiredFields) {
            const input = documentRef.getElementById(id);
            if (!input || !input.value.trim() || !input.checkValidity()) {
                return { valid: false, input, message: "Please complete all required delivery information correctly." };
            }
        }
        return { valid: true };
    }

    window.CheckoutPage = { orderRows, validate };
    document.addEventListener("DOMContentLoaded", () => {
        const items = window.AbrahamCart.read();
        const body = document.getElementById("checkoutOrderBody");
        const button = document.getElementById("placeOrderBtn");
        const error = document.getElementById("checkoutError");
        body.innerHTML = items.length ? orderRows(items) : '<tr><td colspan="2" class="text-center text-muted py-4">Your cart is empty.</td></tr>';
        body.addEventListener("error", event => {
            if (event.target.tagName === "IMG" && !event.target.src.endsWith("/images/product-placeholder.svg")) {
                event.target.src = "/images/product-placeholder.svg";
            }
        }, true);
        let authenticated = false;
        const setCheckoutAuthState = session => {
            authenticated = !!session?.user;
            button.disabled = items.length === 0;
            button.textContent = "Place Order";
        };
        supabaseClient.auth.getSession().then(({ data }) => setCheckoutAuthState(data.session));
        supabaseClient.auth.onAuthStateChange((_event, session) => {
            setTimeout(() => setCheckoutAuthState(session), 0);
        });
        button.addEventListener("click", async () => {
            const { data: sessionData } = await supabaseClient.auth.getSession();
            if (!sessionData.session?.user || !authenticated) {
                error.textContent = "Please log in before placing your order.";
                error.classList.remove("d-none");
                bootstrap.Modal.getOrCreateInstance(document.getElementById("authModal")).show();
                return;
            }
            const result = validate(document);
            if (!result.valid) {
                error.textContent = result.message;
                error.classList.remove("d-none");
                result.input?.focus();
                result.input?.reportValidity();
                return;
            }
            error.classList.add("d-none");
            button.disabled = true;
            button.textContent = "Placing order...";
            const customerName = `${document.getElementById("c_fname").value.trim()} ${document.getElementById("c_lname").value.trim()}`;
            const payload = {
                p_customer_name: customerName,
                p_email: document.getElementById("c_email_address").value.trim(),
                p_phone: document.getElementById("c_phone").value.trim(),
                p_address: document.getElementById("c_address").value.trim(),
                p_city: document.getElementById("c_state_country").value.trim(),
                p_country: document.getElementById("c_country").value,
                p_postal_code: document.getElementById("c_postal_zip").value.trim(),
                p_notes: document.getElementById("c_order_notes").value.trim(),
                p_items: items.map(item => ({ product_id: item.id, quantity: Number(item.quantity) }))
            };
            try {
                const { data: orderId, error: saveError } = await supabaseClient.rpc("place_order", payload);
                if (saveError) throw saveError;
                if (!orderId) throw new Error("The order was not saved.");
                sessionStorage.setItem("abraham_last_order_id", orderId);
                window.AbrahamCart.clear();
                window.location.href = "/thankyou";
            } catch (saveError) {
                error.textContent = saveError.message || "Unable to save your order. Please try again.";
                error.classList.remove("d-none");
                button.disabled = false;
                button.textContent = "Place Order";
            }
        });
    });
})();
