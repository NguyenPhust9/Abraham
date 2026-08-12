/* =========================================================
   ABRAHAM — BLOG LIST (public page)
   Yêu cầu: supabaseClient (js/supabase.js) phải load trước
   file này. Chỉ hiển thị các bài có is_published = true.

   Mỗi bài viết dẫn sang trang riêng blog-post.html?slug=...
   (dùng id làm dự phòng nếu bài chưa có slug).
========================================================= */

const POSTS_PER_PAGE = 6;
let publicPosts = [];
let visibleCount = POSTS_PER_PAGE;

/* ---------- Ảnh mặc định nếu bài viết chưa có ảnh ---------- */
const DEFAULT_POST_IMAGE = "images/post1.png";

/* ---------- Format ngày hiển thị kiểu "Jul 12, 2026" ---------- */
function formatBlogDate(value) {
	if (!value) return "";
	const d = new Date(value);
	return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

/* ---------- Escape để tránh lỗi hiển thị HTML lạ trong nội dung ---------- */
function escapeHtml(str) {
	const div = document.createElement("div");
	div.textContent = str || "";
	return div.innerHTML;
}

/* ---------- Tạo URL tới trang chi tiết bài viết ---------- */
function getPostUrl(post) {
	const key = post.slug ? `slug=${encodeURIComponent(post.slug)}` : `id=${encodeURIComponent(post.id)}`;
	/* Không dùng đuôi .html: vercel.json có cleanUrls=true nên Vercel sẽ
	   tự redirect .html -> URL rút gọn và làm mất query string. Gọi thẳng
	   URL rút gọn để tránh bị redirect. */
	return `blog-post?${key}`;
}

/* ---------- Load bài viết đã xuất bản từ Supabase ---------- */
async function loadPublicPosts() {
	const row = document.getElementById("blogPostsRow");

	const { data, error } = await supabaseClient
		.from("posts")
		.select("*")
		.eq("is_published", true)
		.order("created_at", { ascending: false });

	if (error) {
		row.innerHTML = `<div class="col-12 text-center text-danger py-4">Không tải được bài viết: ${error.message}</div>`;
		return;
	}

	publicPosts = data || [];

	if (publicPosts.length === 0) {
		row.innerHTML = `<div class="col-12 text-center text-muted py-4">Chưa có bài viết nào được đăng.</div>`;
		return;
	}

	renderPublicPosts();
}

/* ---------- Render danh sách bài viết (theo số lượng đang hiển thị) ---------- */
function renderPublicPosts() {
	const row = document.getElementById("blogPostsRow");
	const loadMoreRow = document.getElementById("loadMoreRow");

	const list = publicPosts.slice(0, visibleCount);

	row.innerHTML = list.map(p => {
		const url = getPostUrl(p);
		return `
		<div class="col-12 col-sm-6 col-md-4 mb-5 d-flex">
			<div class="post-entry h-100">
				<a href="${url}" class="post-thumbnail">
					<img src="${p.image_url || DEFAULT_POST_IMAGE}" alt="${escapeHtml(p.title)}" class="img-fluid">
				</a>
				<div class="post-content-entry">
					<h3><a href="${url}">${escapeHtml(p.title)}</a></h3>
					<div class="meta">
						<span>by <a href="#">${escapeHtml(p.author || "Abraham Team")}</a></span> <span>on <a href="#">${formatBlogDate(p.created_at)}</a></span>
					</div>
				</div>
			</div>
		</div>
	`;
	}).join("");

	loadMoreRow.classList.toggle("d-none", visibleCount >= publicPosts.length);
}

/* ---------- Khởi tạo khi trang tải xong ---------- */
document.addEventListener("DOMContentLoaded", function () {
	loadPublicPosts();

	const loadMoreBtn = document.getElementById("loadMoreBtn");
	if (loadMoreBtn) {
		loadMoreBtn.addEventListener("click", function (e) {
			e.preventDefault();
			visibleCount += POSTS_PER_PAGE;
			renderPublicPosts();
		});
	}
});