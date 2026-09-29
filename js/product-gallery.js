(() => {
    window.renderProductGallery = product => {
        const images = getProductImages(product);
        const urls = images.length ? images.map(frontendProductImage) : ["/images/product-placeholder.svg"];
        const name = product.name || "Abraham Bike";
        const main = document.getElementById("product-image");
        const thumbs = document.getElementById("product-thumbnails");
        const prev = document.getElementById("product-image-prev");
        const next = document.getElementById("product-image-next");
        const counter = document.getElementById("product-image-counter");
        let selected = 0;
        const buttons = [];
        function select(index) {
            selected = (index + urls.length) % urls.length;
            main.src = urls[selected]; main.alt = `${name} — image ${selected + 1}`;
            counter.textContent = `${selected + 1} / ${urls.length}`;
            buttons.forEach((button, i) => { button.classList.toggle("is-selected", i === selected); button.setAttribute("aria-pressed", String(i === selected)); });
        }
        thumbs.replaceChildren();
        urls.forEach((url, index) => {
            const button = document.createElement("button"); button.type = "button"; button.setAttribute("aria-label", `View image ${index + 1} of ${name}`);
            const image = document.createElement("img"); image.src = url; image.alt = ""; image.loading = "lazy";
            image.onerror = () => { image.onerror = null; image.src = "/images/product-placeholder.svg"; };
            button.append(image);
            button.addEventListener("click", () => select(index));
            button.addEventListener("pointerenter", () => select(index));
            button.addEventListener("focus", () => select(index));
            thumbs.append(button); buttons.push(button);
        });
        thumbs.hidden = prev.hidden = next.hidden = counter.hidden = urls.length < 2;
        prev.onclick = () => select(selected - 1); next.onclick = () => select(selected + 1);
        main.onkeydown = event => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); select(selected + (event.key === "ArrowRight" ? 1 : -1)); } };
        main.onerror = () => { if (!main.src.endsWith("/images/product-placeholder.svg")) main.src = "/images/product-placeholder.svg"; };
        select(0);
    };
})();
