/* =========================================================
   ABRAHAM — AUTH MODULE
   Requires: `supabaseClient` must be initialized BEFORE
   this file is loaded (keep it in the main HTML file,
   where you already have createClient(SUPABASE_URL, SUPABASE_KEY)).

   Usage: add this line AFTER the supabaseClient init script
   <script src="js/auth.js"></script>
========================================================= */

let isSignUpMode = false;

/* ---------- Get role + display name from the profiles table ---------- */
async function getUserRole(userId) {
	const { data, error } = await supabaseClient
		.from("profiles")
		.select("role, full_name")
		.eq("id", userId)
		.single();

	if (error) {
		console.error("Failed to fetch profile:", error);
		return { role: "customer", full_name: null };
	}

	return data;
}

/* ---------- Update navbar UI based on auth state ---------- */
async function setAuthUI(user) {
	const authLabel = document.getElementById("authLabel");
	const authTrigger = document.getElementById("authTrigger");
	const adminNavItem = document.getElementById("adminNavItem");

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

		// Hiện nút Admin nếu đúng role
		if (adminNavItem) {
			adminNavItem.classList.toggle("d-none", profile.role !== "admin");
		}
	} else {
		authLabel.textContent = "Log In";
		authTrigger.setAttribute("data-bs-toggle", "modal");
		authTrigger.setAttribute("data-bs-target", "#authModal");
		authTrigger.onclick = null;

		// Chưa đăng nhập -> luôn ẩn nút Admin
		if (adminNavItem) {
			adminNavItem.classList.add("d-none");
		}
	}
}
/* ---------- Log out ---------- */
async function handleLogout() {
	const { error } = await supabaseClient.auth.signOut();

	if (error) {
		console.error("Logout error:", error.message);
	}
}

/* ---------- Show / hide error message in the modal ---------- */
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

/* ---------- Toggle between Log In / Sign Up mode ---------- */
function toggleAuthMode() {
	isSignUpMode = !isSignUpMode;

	const title = document.getElementById("authModalTitle");
	const submitBtn = document.getElementById("authSubmitBtn");
	const switchText = document.getElementById("authSwitchText");
	const switchLink = document.getElementById("authSwitchLink");

	if (isSignUpMode) {
		title.textContent = "Sign Up";
		submitBtn.textContent = "Sign Up";
		switchText.textContent = "Already have an account?";
		switchLink.textContent = "Log In";
	} else {
		title.textContent = "Log In";
		submitBtn.textContent = "Log In";
		switchText.textContent = "Don't have an account?";
		switchLink.textContent = "Sign Up now";
	}

	hideAuthError();
}

/* ---------- Handle login / sign-up form submit ---------- */
async function handleAuthSubmit(event) {
	event.preventDefault();
	hideAuthError();

	const email = document.getElementById("authEmail").value.trim();
	const password = document.getElementById("authPassword").value;
	const submitBtn = document.getElementById("authSubmitBtn");

	submitBtn.disabled = true;
	submitBtn.textContent = isSignUpMode ? "Signing up..." : "Logging in...";

	try {
		if (isSignUpMode) {
			const { error } = await supabaseClient.auth.signUp({
				email,
				password
			});

			if (error) throw error;

			showAuthError("Sign-up successful! Check your email to confirm your account (if email confirmation is enabled), then log in.");
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
		showAuthError(err.message || "Something went wrong, please try again.");
	} finally {
		submitBtn.disabled = false;
		submitBtn.textContent = isSignUpMode ? "Sign Up" : "Log In";
	}
}

/* ---------- Initialize on page load ---------- */
document.addEventListener("DOMContentLoaded", function () {

	// Check for an existing session
	supabaseClient.auth.getSession().then(({ data }) => {
		setAuthUI(data.session ? data.session.user : null);
	});

	// Automatically update UI whenever auth state changes
	supabaseClient.auth.onAuthStateChange((event, session) => {
		setAuthUI(session ? session.user : null);
	});

	// Attach submit handler to the auth form (if the modal is present on the page)
	const authForm = document.getElementById("authForm");
	if (authForm) {
		authForm.addEventListener("submit", handleAuthSubmit);
	}

	// Attach toggle handler for Log In / Sign Up switch
	const switchLink = document.getElementById("authSwitchLink");
	if (switchLink) {
		switchLink.addEventListener("click", function (e) {
			e.preventDefault();
			toggleAuthMode();
		});
	}
});