(() => {
  const icons = ['<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>', '<path d="M3 21V9h6V3h8v9h4v9ZM9 9v12M12 7h2M12 11h2M12 15h2M6 13v2M17 16h1"/>', '<path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Z"/><path d="m7 12 3 3 7-7"/>', '<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>'];
  document.querySelectorAll('.dealer-stat .dealer-icon').forEach((icon, index) => { icon.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[index]}</svg>`; });
  const regions = {
    'TP. Hồ Chí Minh': ['Quận 1', 'Thủ Đức', 'Tân Bình', 'Bình Tân'],
    'Hà Nội': ['Hoàn Kiếm', 'Cầu Giấy', 'Hà Đông'],
    'Đà Nẵng': ['Hải Châu', 'Sơn Trà'],
    'Cần Thơ': ['Ninh Kiều', 'Cái Răng']
  };
  // Layout examples only. Replace with verified dealer records before publishing a directory.
  const records = Object.entries(regions).flatMap(([city, areas]) => areas.map((area, index) => ({
    city, area, name: `Đại lý Abraham ${area}`, services: index % 2 ? ['Trưng bày xe', 'Bảo hành', 'Xe trẻ em'] : ['Trưng bày xe', 'Bảo hành', 'Phụ tùng', 'Xe thể thao']
  })));
  const form = document.querySelector('#locator-form');
  const city = document.querySelector('#locator-city');
  const district = document.querySelector('#locator-district');
  const cards = document.querySelector('#location-cards');
  const dialog = document.querySelector('#dealer-detail');
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
  function updateDistricts() {
    district.replaceChildren(new Option('Tất cả khu vực', ''), ...regions[city.value].map(area => new Option(area, area)));
  }
  function mapUrl(area = '') {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Xe đạp Abraham ${area} ${city.value}`)}`;
  }
  function render() {
    const query = normalize(form.elements.query.value.trim());
    const category = form.elements.category.value;
    const services = [...form.querySelectorAll('[name=service]:checked')].map(input => input.value);
    const matches = records.filter(item => item.city === city.value && (!district.value || item.area === district.value) && (!query || normalize(`${item.name} ${item.city}`).includes(query)) && (!category || item.services.includes(category)) && services.every(service => item.services.includes(service)));
    cards.replaceChildren();
    matches.forEach(item => {
      const article = document.createElement('article');
      article.className = 'location-card';
      article.innerHTML = `<img src="images/cuahangabraham.png" alt="Hình minh họa cửa hàng Abraham" loading="lazy"><div class="location-content"><h3>${item.name}</h3><span class="sample-tag">Địa điểm minh họa</span><p>⌖ ${item.area}, ${item.city}<br>Địa chỉ cụ thể đang được cập nhật.</p><div class="location-tags">${item.services.map(service => `<span>${service}</span>`).join('')}</div><div class="location-actions"><a href="${mapUrl(item.area)}" target="_blank" rel="noopener noreferrer">⌖ Tìm trên bản đồ</a><button type="button">Xem chi tiết</button></div></div>`;
      article.querySelector('button').addEventListener('click', () => {
        dialog.querySelector('h2').textContent = item.name;
        dialog.querySelector('.detail-description').textContent = `Đây là thẻ minh họa cho khu vực ${item.area}, ${item.city}. Thông tin địa chỉ, dịch vụ và giờ mở cửa chưa được xác nhận. Vui lòng liên hệ Abraham để được giới thiệu đại lý phù hợp.`;
        dialog.showModal();
      });
      cards.append(article);
    });
    if (!matches.length) cards.innerHTML = '<div class="empty-result">Không có địa điểm minh họa phù hợp.<br>Hãy đổi bộ lọc hoặc liên hệ Abraham để được hỗ trợ.</div>';
    document.querySelector('#result-count').textContent = `${matches.length} địa điểm minh họa tại ${city.value}`;
    const mapQuery = encodeURIComponent(`Xe đạp Abraham ${district.value} ${city.value}`);
    document.querySelector('#locator-map').src = `https://maps.google.com/maps?q=${mapQuery}&output=embed`;
    document.querySelector('#map-external').href = mapUrl(district.value);
  }
  const initialCity = new URLSearchParams(location.search).get('city');
  if (Object.hasOwn(regions, initialCity)) city.value = initialCity;
  updateDistricts();
  city.addEventListener('change', () => { updateDistricts(); render(); });
  form.addEventListener('submit', event => { event.preventDefault(); render(); });
  form.addEventListener('reset', () => { setTimeout(() => { updateDistricts(); render(); }, 0); });
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
    cards.classList.toggle('list-view', button.dataset.view === 'list');
    document.querySelectorAll('[data-view]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  }));
  dialog.querySelector('.detail-close').addEventListener('click', () => dialog.close());
  render();
})();
