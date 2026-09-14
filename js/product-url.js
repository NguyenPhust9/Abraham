function productSlug(name) {
    return String(name || "san-pham").normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d")
        .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "san-pham";
}
function getProductUrl(product) {
    return `/san-pham/${productSlug(product.name)}-${encodeURIComponent(product.id)}`;
}
function getProductIdFromPath(pathname) {
    return pathname.match(/^\/san-pham\/[a-z0-9-]+-(\d+)\/?$/)?.[1] || null;
}
