/* =========================================================
   ABRAHAM — ADMIN BLOG
   Yêu cầu: file này được load SAU js/admin.js (dùng chung
   hàm uploadImageToCloudinary và biến supabaseClient),
   và SAU js/admin-guard.js (xác thực quyền admin).
========================================================= */

let allPosts = [];
let postModalInstance = null;

/* ---------- Tạo slug từ tiêu đề (bỏ dấu tiếng Việt) ---------- */
function slugify(text) {
	return text
		.toString()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d").replace(/Đ/g, "D")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

/* ---------- Format ngày hiển thị ---------- */
function formatPostDate(value) {
	if (!value) return "—";
	const d = new Date(value);
	return d.toLocaleDateString("vi-VN");
}

/* ---------- Load toàn bộ bài viết ---------- */
async function loadPosts() {
	const tbody = document.getElementById("postsTableBody");
	tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Đang tải dữ liệu...</td></tr>`;

	const { data, error } = await supabaseClient
		.from("posts")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) {
		tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Lỗi tải dữ liệu: ${error.message}</td></tr>`;
		return;
	}

	allPosts = data || [];
	renderPostStats();
	renderPostsTable();
}

/* ---------- Cập nhật thẻ thống kê blog ---------- */
function renderPostStats() {
	document.getElementById("statPostTotal").textContent = allPosts.length;
	document.getElementById("statPostPublished").textContent = allPosts.filter(p => p.is_published).length;
	document.getElementById("statPostDraft").textContent = allPosts.filter(p => !p.is_published).length;
}

/* ---------- Render bảng bài viết theo tìm kiếm hiện tại ---------- */
function renderPostsTable() {
	const tbody = document.getElementById("postsTableBody");
	const keyword = document.getElementById("postSearchInput").value.trim().toLowerCase();

	let list = allPosts.filter(p => !keyword || (p.title || "").toLowerCase().includes(keyword));

	if (list.length === 0) {
		tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Không tìm thấy bài viết nào.</td></tr>`;
		return;
	}

	tbody.innerHTML = list.map(p => `
		<tr>
			<td><img src="${p.image_url || 'images/post1.png'}" class="thumb" alt=""></td>
			<td class="fw-semibold">${p.title || ""}</td>
			<td>${p.category || "—"}</td>
			<td class="text-muted">${p.author || "—"}</td>
			<td class="text-muted">${formatPostDate(p.created_at)}</td>
			<td>
				<span class="badge ${p.is_published ? "badge-active" : "badge-inactive"}">${p.is_published ? "Đã xuất bản" : "Bản nháp"}</span>
			</td>
			<td class="text-end">
				<button class="btn-icon" onclick="openEditPostModal(${p.id})" title="Sửa">
					<i class="fa fa-pen"></i>
				</button>
				<button class="btn-icon danger" onclick="handleDeletePost(${p.id})" title="Xoá">
					<i class="fa fa-trash"></i>
				</button>
			</td>
		</tr>
	`).join("");
}

/* ---------- Mở modal viết bài mới ---------- */
function openAddPostModal() {
	document.getElementById("postForm").reset();
	document.getElementById("postId").value = "";
	document.getElementById("postImageUrl").value = "";

	const preview = document.getElementById("postImagePreview");
	preview.src = "";
	preview.classList.add("d-none");
	document.getElementById("postUploadStatusText").textContent = "";

	document.getElementById("postIsPublished").checked = true;
	document.getElementById("postModalTitle").textContent = "Viết bài mới";
	hidePostFormError();
	postModalInstance.show();
}

/* ---------- Mở modal sửa bài viết ---------- */
function openEditPostModal(id) {
	const post = allPosts.find(p => p.id === id);
	if (!post) return;

	document.getElementById("postId").value = post.id;
	document.getElementById("postTitle").value = post.title || "";
	document.getElementById("postSlug").value = post.slug || "";
	document.getElementById("postCategory").value = post.category || "";
	document.getElementById("postAuthor").value = post.author || "";
	document.getElementById("postExcerpt").value = post.excerpt || "";
	document.getElementById("postContent").value = post.content || "";
	document.getElementById("postImageUrl").value = post.image_url || "";
	document.getElementById("postIsPublished").checked = !!post.is_published;

	const preview = document.getElementById("postImagePreview");
	document.getElementById("postUploadStatusText").textContent = "";
	if (post.image_url) {
		preview.src = post.image_url;
		preview.classList.remove("d-none");
	} else {
		preview.src = "";
		preview.classList.add("d-none");
	}

	document.getElementById("postModalTitle").textContent = "Sửa bài viết";
	hidePostFormError();
	postModalInstance.show();
}

/* ---------- Xoá bài viết ---------- */
async function handleDeletePost(id) {
	const post = allPosts.find(p => p.id === id);
	const confirmed = confirm(`Xoá bài viết "${post ? post.title : id}"? Hành động này không thể hoàn tác.`);
	if (!confirmed) return;

	const { error } = await supabaseClient.from("posts").delete().eq("id", id);

	if (error) {
		alert("Lỗi khi xoá: " + error.message);
		return;
	}

	await loadPosts();
}

/* ---------- Lỗi trong modal bài viết ---------- */
function showPostFormError(message) {
	const box = document.getElementById("postFormError");
	box.textContent = message;
	box.classList.remove("d-none");
}
function hidePostFormError() {
	document.getElementById("postFormError").classList.add("d-none");
}

/* ---------- Submit form viết / sửa bài ---------- */
async function handlePostSubmit(event) {
	event.preventDefault();
	hidePostFormError();

	const id = document.getElementById("postId").value;
	const submitBtn = document.getElementById("postSubmitBtn");
	const fileInput = document.getElementById("postImageFile");
	const statusText = document.getElementById("postUploadStatusText");

	submitBtn.disabled = true;

	try {
		const title = document.getElementById("postTitle").value.trim();
		let slug = document.getElementById("postSlug").value.trim();
		if (!slug) slug = slugify(title);

		let imageUrl = document.getElementById("postImageUrl").value.trim() || null;

		// Nếu admin chọn ảnh mới -> upload lên Cloudinary trước
		// (hàm uploadImageToCloudinary được định nghĩa sẵn trong js/admin.js)
		if (fileInput && fileInput.files && fileInput.files[0]) {
			submitBtn.textContent = "Đang tải ảnh lên...";
			if (statusText) statusText.textContent = "Đang upload ảnh, vui lòng đợi...";

			imageUrl = await uploadImageToCloudinary(fileInput.files[0]);

			if (statusText) statusText.textContent = "";
		}

		const payload = {
			title,
			slug,
			category: document.getElementById("postCategory").value.trim() || null,
			author: document.getElementById("postAuthor").value.trim() || null,
			excerpt: document.getElementById("postExcerpt").value.trim() || null,
			content: document.getElementById("postContent").value.trim() || null,
			image_url: imageUrl,
			is_published: document.getElementById("postIsPublished").checked,
			updated_at: new Date().toISOString()
		};

		submitBtn.textContent = "Đang lưu...";

		let error;

		if (id) {
			({ error } = await supabaseClient.from("posts").update(payload).eq("id", id));
		} else {
			({ error } = await supabaseClient.from("posts").insert(payload));
		}

		if (error) throw error;

		postModalInstance.hide();
		await loadPosts();

	} catch (err) {
		showPostFormError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
	} finally {
		submitBtn.disabled = false;
		submitBtn.textContent = "Lưu bài viết";
	}
}

/* ---------- Khởi tạo khi admin đã xác thực xong ---------- */
document.addEventListener("adminVerified", function () {

	postModalInstance = new bootstrap.Modal(document.getElementById("postModal"));

	loadPosts();

	document.getElementById("openAddPostModalBtn").addEventListener("click", openAddPostModal);
	document.getElementById("postForm").addEventListener("submit", handlePostSubmit);
	document.getElementById("postSearchInput").addEventListener("input", renderPostsTable);

	// Preview ảnh ngay khi admin chọn file
	document.getElementById("postImageFile").addEventListener("change", function (evt) {
		const file = evt.target.files[0];
		const preview = document.getElementById("postImagePreview");
		if (file) {
			preview.src = URL.createObjectURL(file);
			preview.classList.remove("d-none");
		}
	});
});