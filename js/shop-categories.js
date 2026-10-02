(function (global) {
    const tree = [
        { id: 'kids', label: 'Xe đạp trẻ em', children: [
            { id: 'kids-12', label: 'Xe đạp 12 inch (2-4 tuổi)' },
            { id: 'kids-14', label: 'Xe đạp 14 inch (3-5 tuổi)' },
            { id: 'kids-16', label: 'Xe đạp 16 inch (4-6 tuổi)' },
            { id: 'kids-18', label: 'Xe đạp 18 inch (5-7 tuổi)' },
            { id: 'kids-20', label: 'Xe đạp 20 inch (6-9 tuổi)' }
        ] },
        { id: 'city', label: 'Xe đạp thành phố (City)' },
        { id: 'mtb', label: 'Xe đạp địa hình (MTB)' },
        { id: 'touring', label: 'Xe đạp Touring' },
        { id: 'road', label: 'Xe đạp Road' },
        { id: 'folding', label: 'Xe đạp gấp' },
        { id: 'parts', label: 'Phụ tùng', children: [
            { id: 'parts-bike', label: 'Phụ tùng xe đạp' },
            { id: 'parts-electric', label: 'Phụ tùng xe đạp điện' }
        ] }
    ];
    const normalize = value => String(value || '').normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
    function categories(product) {
        const category = normalize(product.category);
        const text = normalize([product.category, product.name, product.sku].join(' '));
        if (/phu tung|parts|accessories/.test(category)) {
            return ['parts', /dien|sac|\bic\b|electric/.test(text) ? 'parts-electric' : 'parts-bike'];
        }
        // Explicit admin categories take precedence over temporary size mapping.
        if (/xe dap gap|folding/.test(category)) return ['folding'];
        if (/touring/.test(category)) return ['touring'];
        if (/\bmtb\b|dia hinh|mountain/.test(category)) return ['mtb'];
        if (/\broad\b|duong truong/.test(category)) return ['road'];
        if (/\bcity\b|thanh pho/.test(category)) return ['city'];
        const size = category.match(/(?:xe dap|bikes?)\s*(12|14|16|18|20)(?:\D|$)/)
            || text.match(/\b(12|14|16|18|20)\s*(?:inch|inches)\b/)
            || (!category || /xe dap/.test(category) ? normalize(product.sku || product.name).match(/[a-z]+\s*[- ]?\s*(12|14|16|18|20)(?:\D|$)/) : null);
        if (size) return ['kids', `kids-${size[1]}`];
        if (/xe dap tre em|kids|children/.test(category)) return ['kids'];
        if (/xe dap gap|folding/.test(text)) return ['folding'];
        if (/touring/.test(text)) return ['touring'];
        if (/\bmtb\b|dia hinh|mountain/.test(text)) return ['mtb'];
        if (/\broad\b|duong truong/.test(text)) return ['road'];
        if (/\bcity\b|thanh pho/.test(text)) return ['city'];
        if (/700\s*c/.test(text)) return ['road'];
        if (/xe dap\s*26(?:\D|$)/.test(category)) return ['mtb'];
        return ['city'];
    }
    function matches(product, selected) {
        if (!selected.size) return true;
        const assigned = categories(product);
        return [...selected].some(id => assigned.includes(id) || id === String(product.category || '').trim());
    }
    global.ShopCategories = { tree, categories, matches };
})(typeof window !== 'undefined' ? window : globalThis);
