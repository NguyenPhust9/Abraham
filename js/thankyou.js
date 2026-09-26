document.addEventListener("DOMContentLoaded", () => {
    const orderId = sessionStorage.getItem("abraham_last_order_id");
    const reference = document.getElementById("thankyouOrderReference");
    if (orderId && reference) {
        reference.textContent = `Order reference: ${orderId}`;
        reference.classList.remove("d-none");
    }
});
