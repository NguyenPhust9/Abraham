(() => {
  const track = document.getElementById('featured-products');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeImage = value => {
    if (typeof value !== 'string' || !value.trim()) return 'images/product-placeholder.svg';
    try {
      const url = new URL(value, location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : 'images/product-placeholder.svg';
    } catch { return 'images/product-placeholder.svg'; }
  };
  const controls = [...document.querySelectorAll('[data-slide]')];
  function updateControls() {
    controls[0].disabled = track.scrollLeft < 4;
    controls[1].disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  }
  controls.forEach(button => button.addEventListener('click', () => {
    track.scrollBy({left: Number(button.dataset.slide) * (track.querySelector('.product-card')?.getBoundingClientRect().width + 18 || track.clientWidth), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }));
  track.addEventListener('scroll', updateControls, {passive:true});
  addEventListener('resize', updateControls);
  track.addEventListener('error', event => {
    if (event.target.tagName === 'IMG' && !event.target.src.endsWith('/images/product-placeholder.svg')) event.target.src = 'images/product-placeholder.svg';
  }, true);
  async function loadFeatured() {
    try {
      if (typeof supabaseClient === 'undefined') throw new Error('Unavailable');
      const {data, error} = await supabaseClient.from('products').select('*').not('image_url', 'is', null).neq('image_url', '').order('id', {ascending:true}).limit(200);
      if (error) throw error;
      const products = (data || []).filter(p => p.is_active !== false && !/(?:update\.png|product-placeholder)/i.test(p.image_url));
      // Lead with different categories to show the breadth of the catalogue.
      const categories = new Set();
      const leading = products.filter(p => {
        const category = p.category || '';
        if (categories.has(category)) return false;
        categories.add(category); return true;
      });
      const featured = [...leading, ...products.filter(p => !leading.includes(p))].slice(0, 12);
      if (!featured.length) {
        track.innerHTML = '<div class="load-state"><p>Sản phẩm đang được cập nhật.</p><a class="button" href="/shop">Khám phá cửa hàng</a></div>';
      } else {
        track.innerHTML = featured.map(product => {
          const href = escape(getProductUrl(product));
          const price = Number(product.price);
          return `<article class="product-card"><a class="product-image" href="${href}"><img src="${escape(safeImage(product.image_url))}" alt="${escape(product.name)}" loading="lazy"></a><h3 title="${escape(product.name)}"><a href="${href}">${escape(product.name)}</a></h3><p>${escape(product.category || 'Xe đạp Abraham')}</p><strong class="product-price">${Number.isFinite(price) && price > 0 ? price.toLocaleString('vi-VN') + '₫' : 'Liên hệ báo giá'}</strong><a class="button" href="${href}">Xem chi tiết</a></article>`;
        }).join('');
      }
    } catch {
      track.innerHTML = '<div class="load-state"><p>Chưa thể tải sản phẩm. Vui lòng thử lại.</p><button class="button" type="button" id="retry-products">Tải lại sản phẩm</button><a class="text-link" href="/shop">Xem cửa hàng →</a></div>';
      document.getElementById('retry-products').addEventListener('click', () => {
        track.innerHTML = '<p class="load-state">Đang tải sản phẩm…</p>';
        loadFeatured();
      });
    }
    updateControls();
  }
  loadFeatured();
  updateControls();

  document.getElementById('dealer-search').addEventListener('submit', event => {
    event.preventDefault();
    const city = document.getElementById('dealer-city').value;
    window.location.href = `/dealers?city=${encodeURIComponent(city)}`;
  });
})();
