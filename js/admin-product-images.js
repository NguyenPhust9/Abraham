(() => {
    let entries = [], busy = false;
    const $ = id => document.getElementById(id);
    function revoke(entry) { if (entry.objectUrl) URL.revokeObjectURL(entry.objectUrl); }
    function render() {
        const container = $("productImageGallery");
        container.replaceChildren();
        entries.forEach((entry, index) => {
            const figure = document.createElement("div"); figure.className = "admin-image-card";
            const image = document.createElement("img"); image.src = entry.objectUrl || entry.url; image.alt = `Ảnh sản phẩm ${index + 1}`;
            const label = document.createElement("span"); label.className = "admin-image-label"; label.textContent = index === 0 ? "Ảnh chính" : `Ảnh ${index + 1}`;
            const main = document.createElement("button"); main.type = "button"; main.className = "btn btn-sm btn-outline-primary"; main.textContent = "Đặt ảnh chính"; main.disabled = busy || index === 0;
            main.addEventListener("click", () => { if (busy) return; entries.unshift(entries.splice(index, 1)[0]); render(); });
            const remove = document.createElement("button"); remove.type = "button"; remove.className = "btn btn-sm btn-outline-danger"; remove.textContent = "Xoá"; remove.disabled = busy;
            remove.addEventListener("click", () => { if (busy) return; revoke(entries.splice(index, 1)[0]); render(); });
            figure.append(image, label, main, remove); container.append(figure);
        });
        $("productImageUrl").value = entries[0]?.url || "";
        $("productImageCount").textContent = entries.length ? `${entries.length} ảnh. Ảnh chính hiển thị ở Shop và giỏ hàng.` : "Chưa có ảnh. Bạn có thể chọn nhiều ảnh cùng lúc hoặc thêm từng đợt.";
        $("productImageFile").disabled = busy;
    }
    window.AdminProductImages = {
        init() {
            $("productImageFile").addEventListener("change", event => {
                if (busy) return;
                const files = [...event.target.files];
                if (files.some(file => !file.type.startsWith("image/"))) { showProductFormError("Vui lòng chỉ chọn tệp hình ảnh."); event.target.value = ""; return; }
                files.forEach(file => entries.push({ file, url: null, objectUrl: URL.createObjectURL(file) }));
                event.target.value = ""; render();
            });
            $("productModal").addEventListener("hide.bs.modal", event => { if (busy) event.preventDefault(); });
            $("productModal").addEventListener("hidden.bs.modal", () => this.load(null));
        },
        load(product) {
            entries.forEach(revoke);
            entries = getProductImages(product).map(url => ({ url, file: null }));
            $("productImageFile").value = ""; render();
        },
        setBusy(value) { busy = value; render(); },
        async uploadAll(upload, onProgress) {
            for (let index = 0; index < entries.length; index++) {
                const entry = entries[index];
                if (!entry.file) continue;
                onProgress(index + 1, entries.length);
                const url = await upload(entry.file);
                if (!url) throw new Error("Không nhận được URL ảnh sau khi tải lên.");
                entry.url = url; entry.file = null; revoke(entry); entry.objectUrl = null;
                render();
            }
            return entries.map(entry => entry.url);
        }
    };
})();
