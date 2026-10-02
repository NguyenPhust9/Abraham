/* =========================================================
   ABRAHAM — ADMIN PRODUCTS
   Yêu cầu: supabaseClient (js/supabase.js) và việc xác thực
   admin (js/admin-guard.js) phải chạy trước file này.
========================================================= */

let allProducts = [];
let productModalInstance = null;
let adminProductPage = 1;
let adminProductPageSize = 20;

/* ---------- Cấu hình Cloudinary (upload ảnh sản phẩm) ---------- */
const CLOUDINARY_CLOUD_NAME = "desf1gsdl";
const CLOUDINARY_UPLOAD_PRESET = "teest12345";

/* ---------- Helper: format tiền VNĐ ---------- */
function formatVND(value) {
	return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

/* ---------- Upload ảnh lên Cloudinary, trả về URL công khai ---------- */
async function uploadImageToCloudinary(file) {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

	const response = await fetch(
		`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
		{ method: "POST", body: formData }
	);

	if (!response.ok) {
		throw new Error("Tải ảnh lên Cloudinary thất bại.");
	}

	const data = await response.json();
	return data.secure_url;
}

/* ---------- Load toàn bộ sản phẩm ---------- */
async function fetchAllProducts() {
	const batchSize = 1000;
	const products = [];

	for (let from = 0; ; from += batchSize) {
		const { data, error } = await supabaseClient
			.from("products")
			.select("*")
			.order("id", { ascending: true })
			.range(from, from + batchSize - 1);

		if (error) return { data: null, error };
		const batch = data || [];
		products.push(...batch);
		if (batch.length < batchSize) break;
	}

	return { data: products, error: null };
}

async function loadProducts() {
	const tbody = document.getElementById("productsTableBody");
    document.getElementById("adminProductPagination").hidden = true;
	tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Đang tải dữ liệu...</td></tr>`;

	const { data, error } = await fetchAllProducts();

	if (error) {
		tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-4">Lỗi tải dữ liệu: ${error.message}</td></tr>`;
		return;
	}

	allProducts = data || [];
	renderCategoryFilter();
	renderStats();
	renderTable();
}

/* ---------- Đổ danh mục vào bộ lọc ---------- */
function renderCategoryFilter() {
	const select = document.getElementById("categoryFilter");
	const current = select.value;

	const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))].sort();

	select.innerHTML = `<option value="">Tất cả danh mục</option>` +
		categories.map(c => `<option value="${c}">${c}</option>`).join("");

	select.value = current;
}

/* ---------- Cập nhật thẻ thống kê ---------- */
function renderStats() {
	document.getElementById("statTotal").textContent = allProducts.length;
	document.getElementById("statActive").textContent = allProducts.filter(p => p.is_active).length;
	document.getElementById("statLowStock").textContent = allProducts.filter(p => (p.stock ?? 0) <= 5).length;
	document.getElementById("statCategories").textContent = new Set(allProducts.map(p => p.category).filter(Boolean)).size;
}

/* ---------- Render bảng theo tìm kiếm / lọc hiện tại ---------- */
function renderTable() {
	const tbody = document.getElementById("productsTableBody");
	const keyword = document.getElementById("searchInput").value.trim().toLowerCase();
	const category = document.getElementById("categoryFilter").value;

	let list = allProducts.filter(p => {
		const matchKeyword = !keyword ||
			(p.name || "").toLowerCase().includes(keyword) ||
			(p.sku || "").toLowerCase().includes(keyword);
		const matchCategory = !category || p.category === category;
		return matchKeyword && matchCategory;
	});

    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / adminProductPageSize));
    adminProductPage = Math.min(Math.max(1, adminProductPage), pages);
    renderAdminProductPagination(total, pages);
    const start = (adminProductPage - 1) * adminProductPageSize;
    list = list.slice(start, start + adminProductPageSize);

	if (list.length === 0) {
		tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Không tìm thấy sản phẩm nào.</td></tr>`;
		return;
	}

	tbody.innerHTML = list.map(p => `
		<tr>
			<td><img src="${p.image_url || 'images/update.png'}" class="thumb" alt=""></td>
			<td>
				<div class="fw-semibold">${p.name || ""}</div>
				${p.badge ? `<span class="badge bg-light text-dark border">${p.badge}</span>` : ""}
			</td>
			<td class="text-muted">${p.sku || "—"}</td>
			<td>${p.category || "—"}</td>
			<td class="fw-semibold">${formatVND(p.price)}</td>
			<td>
				<span class="badge ${(p.stock ?? 0) <= 5 ? "badge-stock-low" : "bg-light text-dark"}">${p.stock ?? 0}</span>
			</td>
			<td>
				<span class="badge ${p.is_active ? "badge-active" : "badge-inactive"}">${p.is_active ? "Đang bán" : "Đã ẩn"}</span>
			</td>
			<td class="text-end">
				<button class="btn-icon" onclick="openEditModal(${p.id})" title="Sửa">
					<i class="fa fa-pen"></i>
				</button>
				<button class="btn-icon danger" onclick="handleDeleteProduct(${p.id})" title="Xoá">
					<i class="fa fa-trash"></i>
				</button>
			</td>
		</tr>
	`).join("");
}

function renderAdminProductPagination(total, pages) {
    document.getElementById("adminProductPagination").hidden = false;
    const start = total ? (adminProductPage - 1) * adminProductPageSize + 1 : 0;
    const end = Math.min(adminProductPage * adminProductPageSize, total);
    document.getElementById("productPageInfo").textContent = `Hiển thị ${start}–${end} / ${total} sản phẩm`;
    const controls = document.getElementById("productPageControls");
    if (pages < 2) { controls.replaceChildren(); return; }
    const visible = [...new Set([1, pages, adminProductPage - 1, adminProductPage, adminProductPage + 1])].filter(page => page >= 1 && page <= pages).sort((a,b) => a-b);
    let previous = 0;
    const buttons = visible.map(page => {
        const dots = previous && page - previous > 1 ? '<span class="admin-page-dots" aria-hidden="true">…</span>' : "";
        previous = page;
        return `${dots}<button type="button" data-product-page="${page}" ${page === adminProductPage ? 'class="is-active" aria-current="page"' : ""} aria-label="Trang ${page}">${page}</button>`;
    }).join("");
    controls.innerHTML = `<button type="button" data-product-page="${adminProductPage-1}" ${adminProductPage===1 ? "disabled" : ""} aria-label="Trang trước">‹ Trước</button>${buttons}<button type="button" data-product-page="${adminProductPage+1}" ${adminProductPage===pages ? "disabled" : ""} aria-label="Trang sau">Sau ›</button>`;
}

function resetAdminProductPage() {
    adminProductPage = 1;
    renderTable();
}

/* ---------- Mở modal thêm mới ---------- */
function openAddModal() {
	document.getElementById("productForm").reset();
    document.getElementById("productStock").disabled = false;
    document.getElementById("productStock").title = "";
	document.getElementById("productId").value = "";
	document.getElementById("productImageUrl").value = "";

    AdminProductImages.load(null);
    document.getElementById("uploadStatusText").textContent = "";

	document.getElementById("productIsActive").checked = true;
	document.getElementById("productModalTitle").textContent = "Thêm sản phẩm";
	hideProductFormError();
	productModalInstance.show();
}

/* ---------- Mở modal sửa ---------- */
function openEditModal(id) {
	const product = allProducts.find(p => p.id === id);
	if (!product) return;

	document.getElementById("productId").value = product.id;
	document.getElementById("productName").value = product.name || "";
	document.getElementById("productSku").value = product.sku || "";
	document.getElementById("productCategory").value = product.category || "";
	document.getElementById("productPrice").value = product.price || 0;
	document.getElementById("productStock").value = product.stock || 0;
    document.getElementById("productStock").disabled = Boolean(product.amis_stock_synced_at);
    document.getElementById("productStock").title = product.amis_stock_synced_at
        ? "Tồn kho được đồng bộ tự động từ AMIS, kho " + product.amis_stock_code : "";
	document.getElementById("productImageUrl").value = product.image_url || "";
	document.getElementById("productBadge").value = product.badge || "";
	document.getElementById("productDescription").value = product.description || "";
    for (const field of PRODUCT_SPEC_FIELDS) {
        document.getElementById(`productSpec_${field.key}`).value = product.specifications?.[field.key] || "";
    }
    document.getElementById("productImageFile").value = "";
	document.getElementById("productIsActive").checked = !!product.is_active;

    AdminProductImages.load(product);
    document.getElementById("uploadStatusText").textContent = "";

	document.getElementById("productModalTitle").textContent = "Sửa sản phẩm";
	hideProductFormError();
	productModalInstance.show();
}

/* ---------- Xoá sản phẩm ---------- */
async function handleDeleteProduct(id) {
	const product = allProducts.find(p => p.id === id);
	const confirmed = confirm(`Xoá sản phẩm "${product ? product.name : id}"? Hành động này không thể hoàn tác.`);
	if (!confirmed) return;

	const { data: deletedProducts, error } = await supabaseClient.from("products").delete().eq("id", id).select("id");

	if (error) {
		alert("Lỗi khi xoá: " + error.message);
		return;
	}

    if (!deletedProducts?.length) {
        alert("Chưa xoá được sản phẩm. Kiểm tra quyền admin hoặc tải lại danh sách.");
        return;
    }
    showAdminSuccess("Đã xoá sản phẩm.");
	await loadProducts();
}

/* ---------- Lỗi trong modal ---------- */
function showProductFormError(message) {
	const box = document.getElementById("productFormError");
	box.textContent = message;
	box.classList.remove("d-none");
    box.scrollIntoView({ behavior: "smooth", block: "center" });
}
function hideProductFormError() {
	document.getElementById("productFormError").classList.add("d-none");
}

async function prepareProductStockUpdate(id, payload) {
    if (!id) return;
    // The editor may have been opened before a background AMIS sync.
    const { data: current, error } = await supabaseClient.from("products")
        .select("stock, amis_stock_synced_at, amis_stock_code").eq("id", id).single();
    if (error) throw error;
    if (!current) throw new Error("Product no longer exists. Reload the product list.");
    const stockInput = document.getElementById("productStock");
    const original = allProducts.find(product => String(product.id) === String(id));
    if (current.amis_stock_synced_at || stockInput.disabled || (original && Number(original.stock || 0) === payload.stock)) {
        delete payload.stock;
    }
    if (current.amis_stock_synced_at) {
        stockInput.value = current.stock ?? 0;
        stockInput.disabled = true;
        stockInput.title = "Tồn kho được đồng bộ từ AMIS, kho " + (current.amis_stock_code || "");
    }
}

/* ---------- Submit form thêm / sửa ---------- */
async function handleProductSubmit(event) {
	event.preventDefault();
	hideProductFormError();

	const id = document.getElementById("productId").value;
	const submitBtn = document.getElementById("productSubmitBtn");
	const statusText = document.getElementById("uploadStatusText");

	submitBtn.disabled = true;

	try {
        AdminProductImages.setBusy(true);
        const imageUrls = await AdminProductImages.uploadAll(uploadImageToCloudinary, (index, total) => {
            submitBtn.textContent = `Đang tải ảnh ${index}/${total}...`;
            if (statusText) statusText.textContent = `Đang tải ảnh ${index}/${total}, vui lòng đợi...`;
        });
        const imageUrl = imageUrls[0] || null;
        if (statusText) statusText.textContent = "";

        const specifications = { ...(allProducts.find(p => String(p.id) === id)?.specifications || {}) };
        for (const field of PRODUCT_SPEC_FIELDS) {
            const value = document.getElementById(`productSpec_${field.key}`).value.trim();
            if (value) specifications[field.key] = value;
            else delete specifications[field.key];
        }

		const payload = {
			name: document.getElementById("productName").value.trim(),
			sku: document.getElementById("productSku").value.trim() || null,
			category: document.getElementById("productCategory").value.trim() || null,
			price: Number(document.getElementById("productPrice").value) || 0,
			stock: Number(document.getElementById("productStock").value) || 0,
			image_url: imageUrl,
            image_urls: imageUrls,
			badge: document.getElementById("productBadge").value.trim() || null,
			description: document.getElementById("productDescription").value.trim() || null,
			specifications,
			is_active: document.getElementById("productIsActive").checked,
			updated_at: new Date().toISOString()
		};

		submitBtn.textContent = "Đang lưu...";
        // Do not send a stale editor value back over an AMIS snapshot.
        await prepareProductStockUpdate(id, payload);

		let error, savedProduct;

		if (id) {
			// Sửa sản phẩm có sẵn
			({ data: savedProduct, error } = await supabaseClient.from("products").update(payload).eq("id", id).select("id, specifications, image_urls").single());
		} else {
			// Thêm sản phẩm mới
			({ data: savedProduct, error } = await supabaseClient.from("products").insert(payload).select("id, specifications, image_urls").single());
		}

        if (error) {
            if (["PGRST204", "42703"].includes(error.code) && /image_urls/i.test(error.message)) {
                throw new Error("Cơ sở dữ liệu chưa có cột ảnh bổ sung. Chạy migrations/002_product_images.sql trong Supabase SQL Editor, rồi lưu lại.");
            }
            if (["PGRST204", "42703"].includes(error.code) && /specifications/i.test(error.message)) {
                throw new Error("Cơ sở dữ liệu chưa có cột thông số kỹ thuật. Chạy file migrations/001_product_specifications.sql trong Supabase SQL Editor, rồi lưu lại.");
            }
            throw error;
        }

        if (!savedProduct) throw new Error("Chưa lưu được sản phẩm. Kiểm tra quyền admin hoặc tải lại danh sách sản phẩm.");
        showAdminSuccess("Đã lưu sản phẩm, hình ảnh và thông số kỹ thuật.");
		AdminProductImages.setBusy(false);
		productModalInstance.hide();
		await loadProducts();

	} catch (err) {
		showProductFormError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
	} finally {
        AdminProductImages.setBusy(false);
        if (statusText) statusText.textContent = "";
		submitBtn.disabled = false;
		submitBtn.textContent = "Lưu sản phẩm";
	}
}

/* ---------- Khởi tạo khi admin đã xác thực xong ---------- */
document.addEventListener("adminVerified", function (e) {

	// Hiện tên admin trên topbar
	if (e.detail && e.detail.name) {
		document.getElementById("adminNameLabel").textContent = e.detail.name;
		document.getElementById("adminAvatar").textContent = e.detail.name.charAt(0).toUpperCase();
	}

	productModalInstance = new bootstrap.Modal(document.getElementById("productModal"));

	loadProducts();

	document.getElementById("openAddModalBtn").addEventListener("click", openAddModal);
	document.getElementById("productForm").addEventListener("submit", handleProductSubmit);
    document.getElementById("productForm").addEventListener("invalid", function (event) {
        const label = event.target.closest("div")?.querySelector("label")?.textContent || "Trường nhập liệu";
        showProductFormError(`${label}: ${event.target.validationMessage}`);
    }, true);
	document.getElementById("searchInput").addEventListener("input", resetAdminProductPage);
	document.getElementById("categoryFilter").addEventListener("change", resetAdminProductPage);
    document.getElementById("productPageSize").addEventListener("change", function () {
        const size = Number(this.value);
        if (![10, 20, 50].includes(size)) return;
        adminProductPageSize = size;
        resetAdminProductPage();
    });
    document.getElementById("productPageControls").addEventListener("click", function (event) {
        const button = event.target.closest("button[data-product-page]");
        if (!button || button.disabled) return;
        adminProductPage = Number(button.dataset.productPage);
        renderTable();
        document.getElementById("productsTableBody").closest(".admin-card").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    AdminProductImages.init();

	document.getElementById("adminLogoutBtn").addEventListener("click", async function (evt) {
		evt.preventDefault();
		await supabaseClient.auth.signOut();
		window.location.href = "/";
	});
});
