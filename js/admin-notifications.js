(() => {
    let timer;
    const duration = 3200;
    const popup = () => document.getElementById("admin-success-popup");
    function close() {
        clearTimeout(timer);
        const element = popup();
        if (!element) return;
        if (typeof element.hidePopover === "function" && element.matches(":popover-open")) element.hidePopover();
        element.classList.remove("is-visible");
        element.hidden = true;
    }
    function schedule() {
        clearTimeout(timer);
        timer = setTimeout(close, duration);
    }
    window.showAdminSuccess = message => {
        const element = popup();
        if (!element) return;
        clearTimeout(timer);
        document.getElementById("admin-success-message").textContent = message;
        element.hidden = false;
        element.classList.add("is-visible");
        if (typeof element.showPopover === "function" && !element.matches(":popover-open")) element.showPopover();
        schedule();
    };
    document.addEventListener("DOMContentLoaded", () => {
        const element = popup();
        document.getElementById("admin-success-close").addEventListener("click", close);
        element.addEventListener("mouseenter", () => clearTimeout(timer));
        element.addEventListener("mouseleave", schedule);
        element.addEventListener("focusin", () => clearTimeout(timer));
        element.addEventListener("focusout", schedule);
        document.addEventListener("keydown", event => { if (event.key === "Escape" && !element.hidden) close(); });
    });
})();
