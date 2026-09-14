(() => {
    document.addEventListener("DOMContentLoaded", () => {
        const $ = id => document.getElementById(id);
        const dialog = $("product-zoom-dialog");
        let previousOverflow;
        function sync() {
            const image = $("product-image");
            $("product-zoom-image").src = image.src;
            $("product-zoom-image").alt = image.alt;
            const multiple = !$("product-image-prev").hidden;
            $("product-zoom-prev").hidden = $("product-zoom-next").hidden = $("product-zoom-counter").hidden = !multiple;
            $("product-zoom-counter").textContent = $("product-image-counter").textContent;
        }
        function change(direction) {
            const button = $(direction < 0 ? "product-image-prev" : "product-image-next");
            if (!button.hidden) { button.click(); sync(); }
        }
        $("product-image-zoom").addEventListener("click", () => {
            if (dialog.open) return;
            sync();
            previousOverflow = document.documentElement.style.overflow;
            dialog.showModal();
            document.documentElement.style.overflow = "hidden";
        });
        $("product-zoom-close").addEventListener("click", () => dialog.close());
        $("product-zoom-prev").addEventListener("click", () => change(-1));
        $("product-zoom-next").addEventListener("click", () => change(1));
        dialog.addEventListener("click", event => { if (event.target === dialog || event.target === $("product-zoom-stage")) dialog.close(); });
        dialog.addEventListener("keydown", event => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); change(event.key === "ArrowLeft" ? -1 : 1); }
        });
        dialog.addEventListener("close", () => { document.documentElement.style.overflow = previousOverflow || ""; });
    });
})();
