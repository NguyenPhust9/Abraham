/* =========================================================
   ABRAHAM — AUTH MODULE
   Requires: `supabaseClient` must be initialized BEFORE
   this file is loaded (keep it in the main HTML file,
   where you already have createClient(SUPABASE_URL, SUPABASE_KEY)).

   Usage: add this line AFTER the supabaseClient init script
   <script src="js/auth.js"></script>
========================================================= */

let isSignUpMode = false;

function continueAfterLogin() {
	const afterLogin = sessionStorage.getItem("abraham_after_login");
	if (!afterLogin) return false;

	sessionStorage.removeItem("abraham_after_login");
	const destination = new URL(afterLogin, window.location.origin);
	if (destination.pathname !== window.location.pathname || destination.search !== window.location.search) {
		window.location.assign(destination.href);
	}
	return true;
}

async function handleOAuthLogin(provider, button) {
	hideAuthError();
	const originalText = button.textContent;
	button.disabled = true;
	button.textContent = "Connecting...";

	try {
		if (!sessionStorage.getItem("abraham_after_login")) {
			sessionStorage.setItem("abraham_after_login", window.location.pathname + window.location.search);
		}

		const { error } = await supabaseClient.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: window.location.origin + window.location.pathname + window.location.search
			}
		});
		if (error) throw error;
	} catch (error) {
		button.disabled = false;
		button.textContent = originalText;
		showAuthError(error.message || `Unable to connect with ${provider}. Please try again.`);
	}
}

function addOAuthButtons() {
	const form = document.getElementById("authForm");
	if (!form || document.getElementById("authSocialLogin")) return;

	const socialLogin = document.createElement("div");
	socialLogin.id = "authSocialLogin";
	socialLogin.className = "mt-3";
	socialLogin.innerHTML = `
		<div class="d-flex align-items-center gap-2 mb-3" aria-hidden="true">
			<span class="border-top flex-grow-1"></span><span class="text-muted small">OR CONTINUE WITH</span><span class="border-top flex-grow-1"></span>
		</div>
		<div class="d-grid gap-2">
			<button type="button" class="btn btn-outline-secondary auth-oauth-button" data-auth-provider="google"><i class="fa-brands fa-google me-2" aria-hidden="true"></i>Continue with Google</button>
		</div>`;
	form.insertAdjacentElement("afterend", socialLogin);
	socialLogin.querySelectorAll("[data-auth-provider]").forEach(button => {
		button.addEventListener("click", () => handleOAuthLogin(button.dataset.authProvider, button));
	});
}

function addOrderHistoryLink() {
	const cartLink = document.querySelector('.abx-account-menu a[href="/cart"]');
	if (!cartLink || document.querySelector('.abx-account-menu a[href="/orders"]')) return;
	const item = document.createElement("li");
	item.innerHTML = '<a class="dropdown-item" href="/orders">Order history</a>';
	cartLink.closest("li").insertAdjacentElement("afterend", item);
}

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
		const displayName = profile.full_name || user.email?.split("@")[0] || "Account";

		authTrigger.setAttribute("aria-label", "Account menu");
        authTrigger.setAttribute("data-bs-toggle", "dropdown");
        authTrigger.setAttribute("aria-expanded", "false");
        document.getElementById("accountChevron")?.classList.remove("d-none");
        authTrigger.title = "Account menu";
		authLabel.textContent = profile.role === "admin"
			? `${displayName} (Admin)`
			: displayName;


		authTrigger.removeAttribute("data-bs-target");
		authTrigger.href = "#";
		authTrigger.onclick = null;

		// Hiện nút Admin nếu đúng role
		if (adminNavItem) {
			adminNavItem.classList.toggle("d-none", profile.role !== "admin");
		}
	} else {
		authTrigger.setAttribute("aria-label", "Log in");
        document.getElementById("accountChevron")?.classList.add("d-none");
        authTrigger.removeAttribute("aria-expanded");
        authTrigger.title = "Log in";
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

			// Continue the action that required authentication (for example checkout).
			continueAfterLogin();
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
		if (data.session?.user) continueAfterLogin();
	});

	// Automatically update UI whenever auth state changes
	supabaseClient.auth.onAuthStateChange((event, session) => {
		// Run profile queries after the auth callback returns.
        setTimeout(() => setAuthUI(session ? session.user : null).catch(err => console.error("Account display error:", err)), 0);
	});

	document.getElementById("accountLogout")?.addEventListener("click", handleLogout);

	// Attach submit handler to the auth form (if the modal is present on the page)
	const authForm = document.getElementById("authForm");
	if (authForm) {
		authForm.addEventListener("submit", handleAuthSubmit);
	}
	addOAuthButtons();
	addOrderHistoryLink();

	// Attach toggle handler for Log In / Sign Up switch
	const switchLink = document.getElementById("authSwitchLink");
	if (switchLink) {
		switchLink.addEventListener("click", function (e) {
			e.preventDefault();
			toggleAuthMode();
		});
	}
});
