/* =========================================================
   ABRAHAM — ADMIN PRODUCTS
   Yêu cầu: supabaseClient (js/supabase.js) và việc xác thực
   admin (js/admin-guard.js) phải chạy trước file này.
========================================================= */

let allProducts = [];
let productModalInstance = null;

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
async function loadProducts() {
	const tbody = document.getElementById("productsTableBody");
	tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Đang tải dữ liệu...</td></tr>`;

	const { data, error } = await supabaseClient
		.from("products")
		.select("*")
		.order("id", { ascending: true });

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

/* ---------- Mở modal thêm mới ---------- */
function openAddModal() {
	document.getElementById("productForm").reset();
	document.getElementById("productId").value = "";
	document.getElementById("productImageUrl").value = "";

	const preview = document.getElementById("productImagePreview");
	if (preview) {
		preview.src = "";
		preview.classList.add("d-none");
	}
	const statusText = document.getElementById("uploadStatusText");
	if (statusText) statusText.textContent = "";

	// Ẩn nút xoá ảnh vì sản phẩm mới chưa có ảnh
	const removeBtn = document.getElementById("removeProductImageBtn");
	if (removeBtn) removeBtn.classList.add("d-none");

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
	document.getElementById("productImageUrl").value = product.image_url || "";
	document.getElementById("productBadge").value = product.badge || "";
	document.getElementById("productDescription").value = product.description || "";
	document.getElementById("productIsActive").checked = !!product.is_active;

	const preview = document.getElementById("productImagePreview");
	const statusText = document.getElementById("uploadStatusText");
	if (statusText) statusText.textContent = "";

	// Hiện/ẩn nút xoá ảnh tuỳ sản phẩm có ảnh hay không
	const removeBtn = document.getElementById("removeProductImageBtn");

	if (preview) {
		if (product.image_url) {
			preview.src = product.image_url;
			preview.classList.remove("d-none");
			if (removeBtn) removeBtn.classList.remove("d-none");
		} else {
			preview.src = "";
			preview.classList.add("d-none");
			if (removeBtn) removeBtn.classList.add("d-none");
		}
	}

	document.getElementById("productModalTitle").textContent = "Sửa sản phẩm";
	hideProductFormError();
	productModalInstance.show();
}

/* ---------- Xoá sản phẩm ---------- */
async function handleDeleteProduct(id) {
	const product = allProducts.find(p => p.id === id);
	const confirmed = confirm(`Xoá sản phẩm "${product ? product.name : id}"? Hành động này không thể hoàn tác.`);
	if (!confirmed) return;

	const { error } = await supabaseClient.from("products").delete().eq("id", id);

	if (error) {
		alert("Lỗi khi xoá: " + error.message);
		return;
	}

	await loadProducts();
}

/* ---------- Lỗi trong modal ---------- */
function showProductFormError(message) {
	const box = document.getElementById("productFormError");
	box.textContent = message;
	box.classList.remove("d-none");
}
function hideProductFormError() {
	document.getElementById("productFormError").classList.add("d-none");
}

/* ---------- Submit form thêm / sửa ---------- */
async function handleProductSubmit(event) {
	event.preventDefault();
	hideProductFormError();

	const id = document.getElementById("productId").value;
	const submitBtn = document.getElementById("productSubmitBtn");
	const fileInput = document.getElementById("productImageFile");
	const statusText = document.getElementById("uploadStatusText");

	submitBtn.disabled = true;

	try {
		// Ảnh cũ (nếu đang sửa và chưa bị xoá) hoặc rỗng (nếu thêm mới / đã bấm xoá ảnh)
		let imageUrl = document.getElementById("productImageUrl").value.trim() || null;

		// Nếu admin có chọn file ảnh mới -> upload lên Cloudinary trước
		if (fileInput && fileInput.files && fileInput.files[0]) {
			submitBtn.textContent = "Đang tải ảnh lên...";
			if (statusText) statusText.textContent = "Đang upload ảnh, vui lòng đợi...";

			imageUrl = await uploadImageToCloudinary(fileInput.files[0]);

			if (statusText) statusText.textContent = "";
		}

		const payload = {
			name: document.getElementById("productName").value.trim(),
			sku: document.getElementById("productSku").value.trim() || null,
			category: document.getElementById("productCategory").value.trim() || null,
			price: Number(document.getElementById("productPrice").value) || 0,
			stock: Number(document.getElementById("productStock").value) || 0,
			image_url: imageUrl,
			badge: document.getElementById("productBadge").value.trim() || null,
			description: document.getElementById("productDescription").value.trim() || null,
			is_active: document.getElementById("productIsActive").checked,
			updated_at: new Date().toISOString()
		};

		submitBtn.textContent = "Đang lưu...";

		let error;

		if (id) {
			// Sửa sản phẩm có sẵn
			({ error } = await supabaseClient.from("products").update(payload).eq("id", id));
		} else {
			// Thêm sản phẩm mới
			({ error } = await supabaseClient.from("products").insert(payload));
		}

		if (error) throw error;

		productModalInstance.hide();
		await loadProducts();

	} catch (err) {
		showProductFormError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
	} finally {
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
	document.getElementById("searchInput").addEventListener("input", renderTable);
	document.getElementById("categoryFilter").addEventListener("change", renderTable);

	// Preview ảnh ngay khi admin chọn file
	const imageFileInput = document.getElementById("productImageFile");
	if (imageFileInput) {
		imageFileInput.addEventListener("change", function (evt) {
			const file = evt.target.files[0];
			const preview = document.getElementById("productImagePreview");
			const removeBtn = document.getElementById("removeProductImageBtn");
			if (file && preview) {
				preview.src = URL.createObjectURL(file);
				preview.classList.remove("d-none");
				if (removeBtn) removeBtn.classList.remove("d-none");
			}
		});
	}

	// Xoá ảnh sản phẩm (xoá preview + reset input, không xoá trên Cloudinary)
	const removeImageBtn = document.getElementById("removeProductImageBtn");
	if (removeImageBtn) {
		removeImageBtn.addEventListener("click", function () {
			document.getElementById("productImageUrl").value = "";
			document.getElementById("productImageFile").value = "";

			const preview = document.getElementById("productImagePreview");
			if (preview) {
				preview.src = "";
				preview.classList.add("d-none");
			}
			removeImageBtn.classList.add("d-none");
		});
	}

	document.getElementById("adminLogoutBtn").addEventListener("click", async function (evt) {
		evt.preventDefault();
		await supabaseClient.auth.signOut();
		window.location.href = "index.html";
	});
});