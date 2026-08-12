/* =========================================================
   ABRAHAM — BLOG POST DETAIL (public page)
   Yêu cầu: supabaseClient (js/supabase.js) phải load trước
   file này. Đọc slug hoặc id từ URL để lấy đúng bài viết.
========================================================= */

const DEFAULT_POST_IMAGE = "images/post1.png";

function formatBlogDate(value) {
	if (!value) return "";
	const d = new Date(value);
	return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function escapeHtml(str) {
	const div = document.createElement("div");
	div.textContent = str || "";
	return div.innerHTML;
}

/* ---------- Chuyển nội dung (text thuần) sang các đoạn <p> ---------- */
function renderContentParagraphs(content) {
	if (!content) return "";
	return content
		.split(/\n{2,}/)
		.map(block => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
		.join("");
}

/* ---------- Ước tính thời gian đọc (dựa trên số từ, ~200 từ/phút) ---------- */
function estimateReadTime(content) {
	if (!content) return "1 phút đọc";
	const words = content.trim().split(/\s+/).filter(Boolean).length;
	const minutes = Math.max(1, Math.round(words / 200));
	return `${minutes} phút đọc`;
}

/* ---------- Lấy chữ cái đầu để làm avatar tác giả ---------- */
function getAuthorInitial(name) {
	const clean = (name || "Abraham Team").trim();
	return clean.charAt(0).toUpperCase();
}

function showError(message) {
	document.getElementById("postLoadingState").classList.add("d-none");
	const errorBox = document.getElementById("postErrorState");
	errorBox.querySelector("p").textContent = message;
	errorBox.classList.remove("d-none");
}

function renderPost(post) {
	document.title = `${post.title || "Bài viết"} — Abraham`;

	document.getElementById("postLoadingState").classList.add("d-none");
	document.getElementById("postDetailWrap").classList.remove("d-none");

	document.getElementById("postTitleEl").textContent = post.title || "";
	document.getElementById("postAuthorEl").textContent = post.author || "Abraham Team";
	document.getElementById("postDateEl").textContent = formatBlogDate(post.created_at);
	document.getElementById("postReadTimeEl").textContent = estimateReadTime(post.content || post.excerpt);
	document.getElementById("postAvatarEl").textContent = getAuthorInitial(post.author);

	const categoryEl = document.getElementById("postCategoryEl");
	if (post.category) {
		categoryEl.textContent = post.category;
		categoryEl.classList.remove("d-none");
	} else {
		categoryEl.classList.add("d-none");
	}

	const img = document.getElementById("postImageEl");
	if (post.image_url) {
		img.src = post.image_url;
		img.alt = post.title || "";
		img.classList.remove("d-none");
	} else {
		img.classList.add("d-none");
	}

	document.getElementById("postBodyEl").innerHTML = renderContentParagraphs(post.content || post.excerpt || "");
}

async function loadPost() {
	const params = new URLSearchParams(window.location.search);
	const slug = params.get("slug");
	const id = params.get("id");

	if (!slug && !id) {
		showError("Không tìm thấy bài viết. Thiếu thông tin bài viết trên đường dẫn.");
		return;
	}

	let query = supabaseClient.from("posts").select("*").eq("is_published", true);
	query = slug ? query.eq("slug", slug) : query.eq("id", id);

	const { data, error } = await query.maybeSingle();

	if (error) {
		showError("Không tải được bài viết: " + error.message);
		return;
	}

	if (!data) {
		showError("Bài viết không tồn tại hoặc chưa được xuất bản.");
		return;
	}

	renderPost(data);
}

document.addEventListener("DOMContentLoaded", loadPost);