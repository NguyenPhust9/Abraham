(function (global) {
    "use strict";

    const COLOR_WORDS = new Set([
        "bac", "be", "ca phe", "cam", "den", "do", "dong", "duong", "ghi", "hong",
        "kem", "la", "nau", "ngoc", "tim", "trang", "vang", "xam", "xanh"
    ]);

    const normalize = value => String(value ?? "").trim().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d")
        .replace(/\s+/g, " ");

    function looksLikeColor(value) {
        const normalized = normalize(value).replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
        if (!normalized) return false;
        return [...COLOR_WORDS].some(color => new RegExp(`(^|\\s)${color.replace(" ", "\\s+")}($|\\s)`).test(normalized));
    }

    function splitVariant(value) {
        const text = String(value ?? "").trim();
        const parts = text.split(/\s+-\s+/);
        if (parts.length < 2) return { base: text, color: "" };
        const color = parts.at(-1).trim();
        if (!looksLikeColor(color)) return { base: text, color: "" };
        return { base: parts.slice(0, -1).join(" - ").trim(), color };
    }

    function productVariantInfo(product) {
        const sku = splitVariant(product?.sku);
        const name = splitVariant(product?.name);
        const base = sku.base || name.base || String(product?.id ?? "");
        return {
            key: normalize(base) || `id:${product?.id}`,
            base,
            color: sku.color || name.color || "Màu tiêu chuẩn"
        };
    }

    function formatBaseName(value) {
        return String(value ?? "").trim().replace(/^([a-z]+)(12|14|16|18|20|22|24|26|27|28)$/i, "$1-$2");
    }

    function groupProductVariants(products) {
        const groups = new Map();
        for (const product of products || []) {
            const info = productVariantInfo(product);
            if (!groups.has(info.key)) groups.set(info.key, []);
            groups.get(info.key).push(product);
        }
        return [...groups.values()].map(variants => {
            const representative = variants.find(product => Number(product.stock || 0) > 0) || variants[0];
            return { ...representative, _variants: variants };
        });
    }

    global.ProductVariants = { normalize, looksLikeColor, splitVariant, productVariantInfo, formatBaseName, groupProductVariants };
})(typeof window !== "undefined" ? window : globalThis);
