(() => {
  const menuButton = document.querySelector('.menu-button');
  const mobileNav = document.querySelector('.mobile-nav');
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileNav.classList.toggle('open', !open);
  });
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));

  const sampleDealers = {
    hcm: ['Đại lý mẫu 1 – Quận 1', 'Đại lý mẫu 2 – Thành phố Thủ Đức', 'Đại lý mẫu 3 – Quận 7'],
    hn: ['Đại lý mẫu 1 – Quận Hoàn Kiếm', 'Đại lý mẫu 2 – Quận Cầu Giấy', 'Đại lý mẫu 3 – Quận Hà Đông'],
    dn: ['Đại lý mẫu 1 – Quận Hải Châu', 'Đại lý mẫu 2 – Quận Sơn Trà'],
    ct: ['Đại lý mẫu 1 – Quận Ninh Kiều', 'Đại lý mẫu 2 – Quận Cái Răng']
  };
  const province = document.querySelector('#province');
  const results = document.querySelector('#dealer-results');
  province?.addEventListener('change', () => {
    const items = sampleDealers[province.value];
    results.innerHTML = items ? items.map(name => `<div class="dealer-card"><strong>${name}</strong><small>[Địa chỉ và thông tin liên hệ cần xác nhận]</small></div>`).join('') : '<div class="dealer-empty"><span>⌖</span><p>Chọn tỉnh / thành phố để xem đại lý gần bạn.</p></div>';
  });

  const journey = document.querySelector('.journey');
  const stopsBox = document.querySelector('.journey-stops');
  const stops = [...document.querySelectorAll('[data-stop]')];
  const progress = document.querySelector('.journey-progress');
  const wheel = document.querySelector('.journey-wheel');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let buttons = [];
  function updateJourney() {
    if (!journey || innerWidth <= 1000) return;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const ratio = Math.min(1, Math.max(0, scrollY / maxScroll));
    progress.style.height = `${ratio * 100}%`;
    wheel.style.top = `${ratio * 100}%`;
    wheel.style.transform = `translateY(-50%) rotate(${reduce ? 0 : ratio * 2600}deg)`;
    buttons.forEach(({button, section}) => button.classList.toggle('active', scrollY + innerHeight * .42 >= section.offsetTop));
  }
  function positionStops() {
    if (!journey || innerWidth <= 1000) return;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    stopsBox.innerHTML = '';
    buttons = stops.map(section => {
      const ratio = Math.min(1, Math.max(0, section.offsetTop / maxScroll));
      const button = document.createElement('button');
      button.className = 'journey-stop';
      button.style.top = `${ratio * 100}%`;
      button.type = 'button';
      button.setAttribute('aria-label', `Đi đến: ${section.dataset.stop}`);
      button.innerHTML = `<span>${section.dataset.stop}</span>`;
      button.addEventListener('click', () => section.scrollIntoView({behavior: reduce ? 'auto' : 'smooth'}));
      stopsBox.append(button);
      return {button, section};
    });
    updateJourney();
  }
  addEventListener('load', positionStops);
  addEventListener('resize', positionStops);
  addEventListener('scroll', updateJourney, {passive:true});
  positionStops();
})();
