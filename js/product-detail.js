const SUPABASE_URL = "https://bqowjqqnpeiwoaaczybg.supabase.co";
		const SUPABASE_KEY = "sb_publishable_xqesJg10fSssMRE6xyc3-A_J0y94QtK";

		const supabaseClient = window.supabase.createClient(
			SUPABASE_URL,
			SUPABASE_KEY
		);

		const escapeHtml = (value) =>
			String(value ?? "")
				.replaceAll("&", "&amp;")
				.replaceAll("<", "&lt;")
				.replaceAll(">", "&gt;")
				.replaceAll('"', "&quot;")
				.replaceAll("'", "&#039;");

        const detailProductCache = new Map();
        let currentDetailProductId = null;
		async function loadProductVariants(product) {
			const info = window.ProductVariants.productVariantInfo(product);
			if (!info.base || !product.sku) return;
			const { data, error } = await supabaseClient.from("products")
				.select("*")
				.ilike("sku", `${info.base}%`)
				.eq("is_active", true)
				.order("id", { ascending: true });
			if (error || !data || String(currentDetailProductId) !== String(product.id)) return;
			const variants = data.filter(item => window.ProductVariants.productVariantInfo(item).key === info.key);
			variants.forEach(variant => detailProductCache.set(String(variant.id), variant));
			if (variants.length < 2) return;

			const section = document.getElementById("product-variants");
			const options = document.getElementById("product-variant-options");
			options.innerHTML = variants.map(variant => {
				const variantInfo = window.ProductVariants.productVariantInfo(variant);
				const selected = String(variant.id) === String(product.id);
				const unavailable = Number(variant.stock || 0) <= 0;
				return `<a href="${escapeHtml(getProductUrl(variant))}" class="abx-variant-option${selected ? " is-selected" : ""}${unavailable ? " is-out" : ""}" ${selected ? 'aria-current="true"' : ""}>
					<img src="${escapeHtml(detailProductImage(variant.image_url))}" alt="" loading="lazy">
					<span><strong><i class="color-dot" style="background:${detailColor(variantInfo.color)}" aria-hidden="true"></i>${escapeHtml(variantInfo.color)}</strong><small>${unavailable ? "Hết hàng" : ""}</small></span>
				</a>`;
			}).join("");
            const mainImage = document.getElementById("product-image");
            let hovered = null;
            let focused = null;
            let originalImage = null;
            const previewColor = () => {
                const variant = hovered || focused;
                if (variant) {
                    if (!originalImage) originalImage = { src: mainImage.src, alt: mainImage.alt };
                    mainImage.src = detailProductImage(variant.image_url);
                    mainImage.alt = variant.name || product.name || "Xe đạp Abraham";
                } else if (originalImage) {
                    mainImage.src = originalImage.src;
                    mainImage.alt = originalImage.alt;
                    originalImage = null;
                }
            };
            options.querySelectorAll(".abx-variant-option").forEach((option, index) => {
                const variant = variants[index];
                option.addEventListener("click", event => {
                    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                    event.preventDefault();
                    if (String(currentDetailProductId) === String(variant.id)) return;
                    hovered = null;
                    focused = null;
                    originalImage = null;
                    window.history.pushState(null, "", getProductUrl(variant));
                    renderProductDetail(variant, false);
                    options.querySelectorAll(".abx-variant-option").forEach((link, itemIndex) => {
                        const selected = itemIndex === index;
                        link.classList.toggle("is-selected", selected);
                        if (selected) link.setAttribute("aria-current", "true");
                        else link.removeAttribute("aria-current");
                    });
                });
                option.addEventListener("pointerenter", event => {
                    if (event.pointerType === "touch") return;
                    hovered = variant;
                    previewColor();
                });
                option.addEventListener("pointerleave", () => {
                    hovered = null;
                    previewColor();
                });
                option.addEventListener("focus", () => {
                    focused = variant;
                    previewColor();
                });
                option.addEventListener("blur", () => {
                    focused = null;
                    previewColor();
                });
            });
            section.classList.remove("d-none");
		}

		async function loadProductDetail() {
			const params = new URLSearchParams(window.location.search);
			const productId = getProductIdFromPath(window.location.pathname) || params.get("id");
            const requestPath = window.location.pathname + window.location.search;
            if (detailProductCache.has(String(productId))) {
                renderProductDetail(detailProductCache.get(String(productId)));
                return;
            }

			const loadingEl = document.getElementById("product-loading");
			const errorEl = document.getElementById("product-error");
			const detailEl = document.getElementById("product-detail");
			const errorMessageEl = document.getElementById("product-error-message");

			if (!productId) {
				loadingEl.classList.add("d-none");
				errorEl.classList.remove("d-none");
				errorMessageEl.textContent = "Đường dẫn chưa có mã sản phẩm.";
				return;
			}

			const { data, error } = await supabaseClient
				.from("products")
				.select("*")
				.eq("id", productId)
				.maybeSingle();
            if (window.location.pathname + window.location.search !== requestPath) return;

			loadingEl.classList.add("d-none");

			if (error || !data || data.is_active === false) {
				errorEl.classList.remove("d-none");
				errorMessageEl.textContent = error
					? error.message
					: "Sản phẩm không tồn tại hoặc đã ngừng hiển thị.";
				return;
			}

            renderProductDetail(data);
        }

        function renderProductDetail(data, refreshVariants = true) {
            currentDetailProductId = data.id;
            detailProductCache.set(String(data.id), data);
            const errorEl = document.getElementById("product-error");
            const errorMessageEl = document.getElementById("product-error-message");
            const detailEl = document.getElementById("product-detail");
            document.getElementById("product-loading").classList.add("d-none");
            errorEl.classList.add("d-none");
			const canonicalPath = getProductUrl(data);
            const canonicalUrl = new URL(canonicalPath, window.location.origin).href;
            document.getElementById("product-canonical").href = canonicalUrl;
            const ogUrl = document.querySelector('meta[property="og:url"]');
            if (ogUrl) ogUrl.setAttribute("content", canonicalUrl);
            if (window.location.pathname !== canonicalPath || window.location.search) {
                window.history.replaceState(null, "", canonicalPath);
            }
            const name = String(data.name || "Abraham Bike");
			const category = String(data.category || "Xe đạp Abraham");
			const description = String(
				data.description ||
				"Xe đạp Abraham đồng hành cùng bạn trên những hành trình mỗi ngày. Liên hệ để được tư vấn mẫu xe phù hợp."
			);
			const stock = Number(data.stock || 0);

			document.title = `${name} — Abraham`;
document.title = `${name} — Abraham`;

// Cập nhật meta tag động theo từng sản phẩm
const metaDescription = description.length > 155
	? description.slice(0, 155) + "..."
	: description;

document.getElementById("meta-description").setAttribute("content", metaDescription);
document.getElementById("meta-og-title").setAttribute("content", `${name} — Abraham`);
document.getElementById("meta-og-description").setAttribute("content", metaDescription);
document.getElementById("meta-og-image").setAttribute("content", frontendProductImage(data.image_url));
			document.getElementById("product-name").textContent = name;
			document.getElementById("product-breadcrumb-name").textContent = name;
			document.getElementById("product-category").textContent = category;
			document.getElementById("product-description").textContent = description;
            renderProductSpecifications(data.specifications);
            renderDetailExtras(data);
            renderProductGallery(data);
            document.getElementById('product-thumbnails').hidden = false;
            if (!getProductImages(data).length) {
                document.getElementById('product-image').src = '/images/product-placeholder-vi.svg';
                document.querySelector('#product-thumbnails img').src = '/images/product-placeholder-vi.svg';
            }
            if (refreshVariants) {
                document.getElementById("product-variants").classList.add("d-none");
                loadProductVariants(data);
            }

			const badgeEl = document.getElementById("product-badge");
            badgeEl.classList.add("d-none");
			if (data.badge) {
				badgeEl.textContent = frontendValue(data.badge);
				badgeEl.classList.remove("d-none");
			}

			const stockEl = document.getElementById("product-stock");
			const stockLabelEl = document.getElementById("product-stock-label");

			if (stock > 0) {
				stockEl.classList.remove("out");
				stockLabelEl.textContent = `Còn hàng · Tồn kho: ${stock.toLocaleString('vi-VN')}`;
			} else {
				stockEl.classList.add("out");
				stockLabelEl.textContent = `Hết hàng · Tồn kho: ${stock.toLocaleString('vi-VN')}`;
			}

			const addOrderButton = document.getElementById("product-add-order");
			addOrderButton.disabled = stock <= 0;
			addOrderButton.querySelector("span").textContent = stock <= 0 ? "Hết hàng" : "Thêm vào giỏ hàng";
			addOrderButton.onclick = function () {
				try {
					window.AbrahamCart.add(data);
					window.location.href = "/cart";
				} catch (cartError) {
					errorEl.classList.remove("d-none");
					errorMessageEl.textContent = cartError.message || "Chưa thể thêm sản phẩm vào giỏ hàng.";
				}
			};

			detailEl.classList.remove("d-none");

			// Tải sản phẩm tương tự (cùng danh mục)
			if (refreshVariants) loadRelatedProducts(data.category, data);
		}

        window.addEventListener("popstate", loadProductDetail);

		async function loadRelatedProducts(category, currentProduct) {
			if (!category) return;

			const { data, error } = await supabaseClient
				.from("products")
				.select("*")
				.eq("category", category)
				.neq("id", currentProduct.id)
				.eq("is_active", true)
				.limit(24);

			if (error || !data || data.length === 0) return;
			const currentKey = window.ProductVariants.productVariantInfo(currentProduct).key;
			const related = window.ProductVariants.groupProductVariants(data)
				.filter(product => window.ProductVariants.productVariantInfo(product).key !== currentKey)
				.slice(0, 4);
			if (!related.length) return;
            window.detailRelatedProducts = related;

			const sectionEl = document.getElementById("related-products-section");
			const listEl = document.getElementById("related-products-list");

			listEl.innerHTML = related.map(product => {
				const name = escapeHtml(product.name || "Abraham Bike");
				const cat = escapeHtml(String(product.category || "Xe đạp Abraham"));
				const image = escapeHtml(detailProductImage(product.image_url));
                const price = detailMoney(product.price);
                const url = escapeHtml(getProductUrl(product));
                const id = escapeHtml(product.id);
                const favorite = detailFavorites().includes(String(product.id));

				return `
					<div class="col-6 col-md-3">
						<article class="abx-related-card">
                            <button type="button" class="related-favorite" data-favorite="${id}" aria-label="Yêu thích ${name}" aria-pressed="${favorite}">${favorite ? '♥' : '♡'}</button>
							<a href="${url}" class="abx-related-image">
								<img src="${image}" alt="${name}">
							</a>
							<div class="abx-related-body">
								<span class="abx-related-category">${cat}</span>
								<h4><a href="${url}">${name}</a></h4><div class="related-colors" aria-label="Các màu sản phẩm">${product._variants.map(v => `<span class="color-dot" style="background:${detailColor(window.ProductVariants.productVariantInfo(v).color)}" title="${escapeHtml(window.ProductVariants.productVariantInfo(v).color)}"></span>`).join('')}</div><strong class="related-price">${price}</strong><div class="related-actions"><a class="related-view" href="${url}">Xem chi tiết</a><button class="related-cart" type="button" data-cart="${id}" aria-label="Thêm ${name} vào giỏ hàng" ${Number(product.stock || 0) <= 0 ? 'disabled' : ''}><i class="fa-solid fa-cart-shopping" aria-hidden="true"></i></button></div>
							</div>
						</article>
					</div>
				`;
			}).join("");

			sectionEl.classList.remove("d-none");
		}

		document.addEventListener("DOMContentLoaded", () => loadProductDetail().catch(() => {
 document.getElementById("product-loading").classList.add("d-none");
 document.getElementById("product-error").classList.remove("d-none");
 document.getElementById("product-error-message").textContent = "Không thể tải sản phẩm. Vui lòng kiểm tra kết nối và tải lại trang.";
}));

