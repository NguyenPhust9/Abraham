function detailMoney(value) {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? price.toLocaleString('vi-VN') + '₫' : 'Liên hệ báo giá';
}

function detailProductImage(value) {
  return !value || /(?:update\.png|product-placeholder)/i.test(value) ? '/images/product-placeholder-vi.svg' : value;
}
function detailColor(value) {
  const color = window.ProductVariants.normalize(value);
  const colors = [['xanh duong','#168bea'],['duong','#168bea'],['xanh ngoc','#4cbaa7'],['xanh la','#69a666'],['la','#69a666'],['do','#e23d4c'],['hong','#ef9ec3'],['tim','#9160bd'],['vang','#e8c72a'],['cam','#f59631'],['den','#303b43'],['trang','#e9edf0'],['bac','#aab3bc']];
  return colors.find(([name]) => color.includes(name))?.[1] || '#8195a6';
}
function detailFavorites() {
  try { const data = JSON.parse(localStorage.getItem('abraham_favorites') || '[]'); return Array.isArray(data) ? data.map(String) : []; }
  catch { return []; }
}

function renderDetailExtras(product) {
  document.getElementById('product-price').textContent = detailMoney(product.price);
  document.getElementById('breadcrumb-category').textContent = product.category || 'Xe đạp Abraham';
  document.getElementById('description-title').textContent = product.name || 'Xe đạp Abraham';
  document.getElementById('description-full').textContent = document.getElementById('product-description').textContent;
  const specs = product.specifications && typeof product.specifications === 'object' ? product.specifications : {};
  const wheel = String(product.category || '').match(/(?:xe đạp\s*)(\d+(?:\.\d+)?|700c)/i);
  const wheelLabel = wheel ? (/700c/i.test(wheel[1]) ? '700C' : wheel[1] + ' inch') : null;
  document.getElementById('summary-wheel').textContent = specs.wheel_size || wheelLabel || 'Liên hệ tư vấn';
  document.getElementById('summary-age').textContent = specs.age_range || specs.age || 'Liên hệ tư vấn';
  document.getElementById('summary-frame').textContent = specs.frame || 'Đang cập nhật';
  const list = document.getElementById('product-specifications-list');
  // This page is in Vietnamese; use the source values and Vietnamese field labels.
  const fields = PRODUCT_SPEC_FIELDS.filter(field => typeof specs[field.key] === 'string' && specs[field.key].trim());
  [...list.children].forEach((row, index) => {
    row.querySelector('dt').textContent = fields[index].label;
    row.querySelector('dd').textContent = specs[fields[index].key];
  });
  document.getElementById('specs-empty').hidden = list.children.length > 0;
}

document.addEventListener('DOMContentLoaded', () => {
  const authLabel = document.getElementById('authLabel');
  const translateLogin = () => { if (authLabel.textContent === 'Log In') authLabel.textContent = 'Đăng nhập'; };
  new MutationObserver(translateLogin).observe(authLabel, {childList:true});
  translateLogin();
  document.getElementById('related-products-list').addEventListener('click', event => {
    const favorite = event.target.closest('[data-favorite]');
    const cart = event.target.closest('[data-cart]');
    try {
      if (favorite) {
        const current = detailFavorites();
        const id = favorite.dataset.favorite;
        const selected = !current.includes(id);
        localStorage.setItem('abraham_favorites', JSON.stringify(selected ? [...current,id] : current.filter(value => value !== id)));
        favorite.setAttribute('aria-pressed', String(selected));
        favorite.textContent = selected ? '♥' : '♡';
      }
      if (cart && !cart.disabled) {
        const product = window.detailRelatedProducts.find(item => String(item.id) === cart.dataset.cart);
        if (!product) return;
        window.AbrahamCart.add(product);
        document.getElementById('related-notice').textContent = `Đã thêm ${product.name} vào giỏ hàng.`;
      }
    } catch (error) {
      document.getElementById('related-notice').textContent = error.message || 'Chưa thể lưu lựa chọn. Vui lòng thử lại.';
    }
  });
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTab(tab, focus = false) {
    tabs.forEach(button => {
      const selected = button === tab;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      document.getElementById(button.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectTab(tabs[next], true); }
    });
  });
  document.querySelectorAll('.detail-gallery, #related-products-list, #product-variant-options').forEach(container => {
    container.addEventListener('error', event => {
      if (event.target.tagName === 'IMG' && !event.target.src.endsWith('/images/product-placeholder-vi.svg')) {
        event.target.onerror = null;
        event.target.src = '/images/product-placeholder-vi.svg';
      }
    }, true);
  });
});
