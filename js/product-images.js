function getProductImages(product) {
    const images = [product?.image_url, ...(Array.isArray(product?.image_urls) ? product.image_urls : [])];
    return [...new Set(images.filter(url => typeof url === "string" && url.trim()).map(url => url.trim()))];
}
