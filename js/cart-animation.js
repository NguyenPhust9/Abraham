(() => {
    function pulse(target) {
        if (typeof target.animate === "function") {
            target.animate([{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }], { duration: 320, easing: "ease-out" });
        }
    }
    window.flyProductToCart = button => {
        const image = button.closest(".shop-product-card")?.querySelector(".shop-product-media img");
        const cart = document.querySelector(".abx-cart-link");
        if (!image || !cart) return;
        const source = image.getBoundingClientRect();
        let destination = cart.getBoundingClientRect();
        let target = cart;
        let floating;
        // Show a temporary cart destination when the header is off screen or collapsed.
        if (destination.width === 0 || destination.height === 0 || destination.bottom <= 0 || destination.top >= window.innerHeight) {
            floating = cart.cloneNode(true);
            floating.classList.add("cart-flight-target");
            floating.setAttribute("aria-label", "View cart");
            document.body.append(floating);
            target = floating;
            destination = floating.getBoundingClientRect();
        }
        const clearTarget = () => { if (floating) setTimeout(() => floating.remove(), 600); };
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || typeof image.animate !== "function") {
            pulse(target); clearTarget(); return;
        }
        const thumbnail = document.createElement("img");
        thumbnail.src = image.currentSrc || image.src;
        thumbnail.alt = "";
        thumbnail.setAttribute("aria-hidden", "true");
        thumbnail.className = "cart-flight-image";
        document.body.append(thumbnail);
        const sx = source.left + source.width / 2 - 36;
        const sy = source.top + source.height / 2 - 36;
        const tx = destination.left + destination.width / 2 - 36;
        const ty = destination.top + destination.height / 2 - 36;
        const midX = sx + (tx - sx) * .45;
        const midY = Math.max(8, Math.min(sy, ty) - 70);
        try {
            const animation = thumbnail.animate([
                { transform: `translate3d(${sx}px, ${sy}px, 0) scale(1)`, opacity: 1 },
                { transform: `translate3d(${midX}px, ${midY}px, 0) scale(.8)`, opacity: .95, offset: .55 },
                { transform: `translate3d(${tx}px, ${ty}px, 0) scale(.12)`, opacity: .2 }
            ], { duration: 780, easing: "cubic-bezier(.3,.05,.65,1)", fill: "forwards" });
            animation.finished.then(() => { thumbnail.remove(); pulse(target); clearTarget(); }, () => { thumbnail.remove(); clearTarget(); });
        } catch (_) { thumbnail.remove(); clearTarget(); }
    };
})();
