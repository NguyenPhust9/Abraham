/* =========================================================
   ABRAHAM — ADMIN GUARD
   Kiểm tra: phải đăng nhập VÀ role = 'admin' mới cho vào trang.
   Nếu không, tự động chuyển hướng về index.html.
========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

	const checkingScreen = document.getElementById("adminCheckingScreen");
	const adminContent = document.getElementById("adminContent");

	// 1. Lấy session hiện tại
	const { data: sessionData } = await supabaseClient.auth.getSession();
	const user = sessionData.session ? sessionData.session.user : null;

	// 2. Chưa đăng nhập -> đá về trang chủ
	if (!user) {
		alert("Bạn cần đăng nhập để truy cập trang này.");
		window.location.href = "index.html";
		return;
	}

	// 3. Đã đăng nhập -> kiểm tra role trong bảng profiles
	const { data: profile, error } = await supabaseClient
		.from("profiles")
		.select("role, full_name")
		.eq("id", user.id)
		.single();

	if (error || !profile || profile.role !== "admin") {
		alert("Bạn không có quyền truy cập trang này.");
		window.location.href = "index.html";
		return;
	}

	// 4. Là admin thật -> hiện nội dung
	checkingScreen.classList.add("d-none");
	adminContent.classList.remove("d-none");

	// 5. Báo cho admin.js biết đã xác thực xong, kèm tên hiển thị
	document.dispatchEvent(new CustomEvent("adminVerified", {
		detail: {
			name: profile.full_name || user.email.split("@")[0]
		}
	}));
});