const FRONTEND_CATEGORIES = {"Xe Đạp": "Bikes", "Xe đạp": "Bikes", "Dịch vụ": "Services", "Hàng hóa": "Merchandise", "Phụ Tùng Xe Đạp": "Bicycle Parts", "Phụ Tùng Sạc": "E-bike Parts", "Phụ Tùng IC": "Controller Parts", "Phụ Tùng": "Parts", "Xe điện": "Electric Bikes"};
const FRONTEND_VALUES = {"Thép": "Steel", "Nhôm": "Aluminum", "Cổ ngang": "Flat handlebar", "Đĩa trước, đĩa sau": "Front and rear disc brakes", "Bạc đạn": "Sealed bearings", "Phuộc nhún": "Suspension fork", "Cốt vuông": "Square taper", "Rời": "Detachable", "Rổ sắt": "Steel basket", "Sơn tĩnh điện 3 lớp chống trầy": "Three-layer scratch-resistant powder coating", "1 xe/thùng": "1 bike per carton", "Mới": "New", "Giảm giá": "Sale"};
function frontendCategory(value) {
    const text = String(value || "").trim();
    if (FRONTEND_CATEGORIES[text]) return FRONTEND_CATEGORIES[text];
    const size = text.match(/^xe đạp\s*(\d+|700c)$/i);
    return size ? (/700c/i.test(size[1]) ? "700C Bikes" : `${size[1]}-inch Bikes`) : text;
}
function frontendValue(value) {
    const text = String(value || "").trim();
    const key = Object.keys(FRONTEND_VALUES).find(k => k.toLowerCase() === text.toLowerCase());
    return key ? FRONTEND_VALUES[key] : text;
}
function frontendProductImage(url) {
    let language = "en";
    try { language = localStorage.getItem("abraham-language") || "en"; } catch (error) {}
    const placeholder = language === "vi" ? "/images/product-placeholder-vi.svg" : language === "zh" ? "/images/product-placeholder-zh.svg" : "/images/product-placeholder.svg";
    return !url || /(?:^|\/)update\.png(?:[?#].*)?$/.test(url) ? placeholder : url;
}
