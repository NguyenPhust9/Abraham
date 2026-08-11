/* =========================================================
   ABRAHAM — AUTH MODULE
   Yêu cầu: biến `supabaseClient` phải được khởi tạo TRƯỚC
   khi file này được load (giữ nguyên trong file HTML chính,
   nơi bạn đã có createClient(SUPABASE_URL, SUPABASE_KEY)).

   Cách dùng: thêm dòng này SAU script khởi tạo supabaseClient
   <script src="js/auth.js"></script>
========================================================= */

let isSignUpMode = false;

/* ---------- Lấy role + tên hiển thị từ bảng profiles ---------- */
async function getUserRole(userId) {
	const { data, error } = await supabaseClient
		.from("profiles")
		.select("role, full_name")
		.eq("id", userId)
		.single();

	if (error) {
		console.error("Không lấy được profile:", error);
		return { role: "customer", full_name: null };
	}

	return data;
}

/* ---------- Cập nhật giao diện navbar theo trạng thái đăng nhập ---------- */
async function setAuthUI(user) {
	const authLabel = document.getElementById("authLabel");
	const authTrigger = document.getElementById("authTrigger");

	if (!authLabel || !authTrigger) return;

	if (user) {
		const profile = await getUserRole(user.id);
		const displayName = profile.full_name || user.email.split("@")[0];

		authLabel.textContent = profile.role === "admin"
			? `${displayName} (Admin)`
			: displayName;

		authTrigger.removeAttribute("data-bs-toggle");
		authTrigger.removeAttribute("data-bs-target");
		authTrigger.href = "#";
		authTrigger.onclick = function (e) {
			e.preventDefault();
			handleLogout();
		};
	} else {
		authLabel.textContent = "Đăng nhập";
		authTrigger.setAttribute("data-bs-toggle", "modal");
		authTrigger.setAttribute("data-bs-target", "#authModal");
		authTrigger.onclick = null;
	}
}

/* ---------- Đăng xuất ---------- */
async function handleLogout() {
	const { error } = await supabaseClient.auth.signOut();

	if (error) {
		console.error("Lỗi đăng xuất:", error.message);
	}
}

/* ---------- Hiển thị / ẩn thông báo lỗi trong modal ---------- */
function showAuthError(message) {
	const errorBox = document.getElementById("authError");
	if (!errorBox) return;
	errorBox.textContent = message;
	errorBox.classList.remove("d-none");
}

function hideAuthError() {
	const errorBox = document.getElementById("authError");
	if (!errorBox) return;
	errorBox.classList.add("d-none");
}

/* ---------- Chuyển đổi giữa chế độ Đăng nhập / Đăng ký ---------- */
function toggleAuthMode() {
	isSignUpMode = !isSignUpMode;

	const title = document.getElementById("authModalTitle");
	const submitBtn = document.getElementById("authSubmitBtn");
	const switchText = document.getElementById("authSwitchText");
	const switchLink = document.getElementById("authSwitchLink");

	if (isSignUpMode) {
		title.textContent = "Đăng ký";
		submitBtn.textContent = "Đăng ký";
		switchText.textContent = "Đã có tài khoản?";
		switchLink.textContent = "Đăng nhập";
	} else {
		title.textContent = "Đăng nhập";
		submitBtn.textContent = "Đăng nhập";
		switchText.textContent = "Chưa có tài khoản?";
		switchLink.textContent = "Đăng ký ngay";
	}

	hideAuthError();
}

/* ---------- Xử lý submit form đăng nhập / đăng ký ---------- */
async function handleAuthSubmit(event) {
	event.preventDefault();
	hideAuthError();

	const email = document.getElementById("authEmail").value.trim();
	const password = document.getElementById("authPassword").value;
	const submitBtn = document.getElementById("authSubmitBtn");

	submitBtn.disabled = true;
	submitBtn.textContent = isSignUpMode ? "Đang đăng ký..." : "Đang đăng nhập...";

	try {
		if (isSignUpMode) {
			const { error } = await supabaseClient.auth.signUp({
				email,
				password
			});

			if (error) throw error;

			showAuthError("Đăng ký thành công! Kiểm tra email để xác nhận tài khoản (nếu bật xác thực email), sau đó đăng nhập lại.");
		} else {
			const { error } = await supabaseClient.auth.signInWithPassword({
				email,
				password
			});

			if (error) throw error;

			const modalEl = document.getElementById("authModal");
			const modalInstance = bootstrap.Modal.getInstance(modalEl);
			if (modalInstance) modalInstance.hide();

			document.getElementById("authForm").reset();
		}
	} catch (err) {
		showAuthError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
	} finally {
		submitBtn.disabled = false;
		submitBtn.textContent = isSignUpMode ? "Đăng ký" : "Đăng nhập";
	}
}

/* ---------- Khởi tạo khi trang tải xong ---------- */
document.addEventListener("DOMContentLoaded", function () {

	// Kiểm tra session hiện có
	supabaseClient.auth.getSession().then(({ data }) => {
		setAuthUI(data.session ? data.session.user : null);
	});

	// Tự động cập nhật UI mỗi khi trạng thái đăng nhập thay đổi
	supabaseClient.auth.onAuthStateChange((event, session) => {
		setAuthUI(session ? session.user : null);
	});

	// Gắn sự kiện submit cho form auth (nếu modal có trong trang)
	const authForm = document.getElementById("authForm");
	if (authForm) {
		authForm.addEventListener("submit", handleAuthSubmit);
	}

	// Gắn sự kiện chuyển đổi Đăng nhập / Đăng ký
	const switchLink = document.getElementById("authSwitchLink");
	if (switchLink) {
		switchLink.addEventListener("click", function (e) {
			e.preventDefault();
			toggleAuthMode();
		});
	}
});