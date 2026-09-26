(() => {
    const $ = id => document.getElementById(id);
    const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
    const money = value => Math.max(0, Number(value) || 0).toLocaleString("en-US") + "đ";
    const date = value => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
    const statusLabel = value => ({ pending: "Pending", confirmed: "Confirmed", shipping: "Shipping", completed: "Completed", cancelled: "Cancelled" }[value] || value || "Pending");

    function orderCard(order) {
        const items = Array.isArray(order.order_items) ? order.order_items : [];
        return `<article class="order-card">
            <header class="order-card-header">
                <div><span class="order-label">Order</span><h2>${escape(order.order_number)}</h2><time datetime="${escape(order.created_at)}">${escape(date(order.created_at))}</time></div>
                <span class="order-status order-status--${escape(order.status)}">${escape(statusLabel(order.status))}</span>
            </header>
            <div class="order-lines">${items.map(item => `<div class="order-line">
                <div><a href="/san-pham/${encodeURIComponent(item.product_id)}">${escape(item.product_name)}</a>${item.sku ? `<span>SKU: ${escape(item.sku)}</span>` : ""}<span>Quantity: ${Number(item.quantity) || 0}</span></div>
                <strong>${money(item.line_total)}</strong>
            </div>`).join("")}</div>
            <footer class="order-card-footer"><span>${items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)} item(s)</span><div><span>Total</span><strong>${money(order.total)}</strong></div></footer>
        </article>`;
    }

    async function loadOrders(user) {
        $("orders-loading").classList.remove("d-none");
        $("orders-error").classList.add("d-none");
        $("orders-empty").classList.add("d-none");
        $("orders-list").innerHTML = "";
        const { data, error } = await supabaseClient.from("orders")
            .select("id, order_number, total, status, created_at, order_items(product_id, product_name, sku, quantity, unit_price, line_total)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
        $("orders-loading").classList.add("d-none");
        if (error) {
            $("orders-error").textContent = error.message;
            $("orders-error").classList.remove("d-none");
            return;
        }
        if (!data?.length) {
            $("orders-empty").classList.remove("d-none");
            return;
        }
        $("orders-list").innerHTML = data.map(orderCard).join("");
    }

    document.addEventListener("DOMContentLoaded", async () => {
        const { data } = await supabaseClient.auth.getSession();
        if (!data.session?.user) {
            sessionStorage.setItem("abraham_after_login", "/orders");
            $("orders-login-required").classList.remove("d-none");
            bootstrap.Modal.getOrCreateInstance($("authModal")).show();
            return;
        }
        loadOrders(data.session.user);
    });

    window.AbrahamOrders = { orderCard, statusLabel };
})();
