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

  const languagePicker = document.querySelector('#language-picker');
  const languageTrigger = languagePicker?.querySelector('.language-trigger');
  const languageMenu = languagePicker?.querySelector('.language-menu');
  const languageData = {
    vi: {label: 'VI', name: 'Tiếng Việt', flag: 'images/flags/vietnamese.svg'},
    en: {label: 'EN', name: 'English', flag: 'images/flags/english.svg'},
    zh: {label: '中文', name: '中文', flag: 'images/flags/chinese.svg'}
  };
  function applyLanguageChoice(code) {
    const selected = languageData[code] || languageData.vi;
    document.documentElement.lang = code === 'zh' ? 'zh-CN' : code;
    languageTrigger.querySelector('img').src = selected.flag;
    languageTrigger.querySelector('span').textContent = selected.name;
    languageTrigger.setAttribute('aria-label', `Ngôn ngữ: ${selected.name}`);
    languageMenu.querySelectorAll('[data-language]').forEach(button => button.classList.toggle('active', button.dataset.language === code));
    try { localStorage.setItem('abraham-language', code); } catch (error) {}
    window.dispatchEvent(new CustomEvent('abraham-language-change', {detail:{language:code}}));
  }
  languageTrigger?.addEventListener('click', () => {
    const open = languageTrigger.getAttribute('aria-expanded') === 'true';
    languageTrigger.setAttribute('aria-expanded', String(!open));
    languageMenu.hidden = open;
  });
  languageMenu?.addEventListener('click', event => {
    const option = event.target.closest('[data-language]');
    if (!option) return;
    applyLanguageChoice(option.dataset.language);
    languageMenu.hidden = true;
    languageTrigger.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('click', event => {
    if (!languagePicker?.contains(event.target)) {
      languageMenu.hidden = true;
      languageTrigger?.setAttribute('aria-expanded', 'false');
    }
  });
  let savedLanguage = 'vi';
  try { savedLanguage = localStorage.getItem('abraham-language') || 'vi'; } catch (error) {}
  applyLanguageChoice(savedLanguage);

  const authDialog = document.querySelector('#home-auth-dialog');
  const authTrigger = document.querySelector('#home-auth-trigger');
  const authLabel = document.querySelector('#home-auth-label');
  const authForm = document.querySelector('#home-auth-form');
  const authSwitch = document.querySelector('#home-auth-switch');
  const authError = document.querySelector('#home-auth-error');
  let signUpMode = false;
  function setAuthMode(signUp) {
    signUpMode = signUp;
    document.querySelector('#home-auth-title').textContent = signUp ? 'Đăng ký' : 'Đăng nhập';
    authForm.querySelector('.auth-submit').textContent = signUp ? 'Đăng ký' : 'Đăng nhập';
    authSwitch.innerHTML = signUp ? 'Đã có tài khoản? <strong>Đăng nhập</strong>' : 'Chưa có tài khoản? <strong>Đăng ký</strong>';
    authError.hidden = true;
  }
  authTrigger?.addEventListener('click', async () => {
    if (authTrigger.dataset.loggedIn === 'true') {
      await supabaseClient.auth.signOut();
      return;
    }
    authDialog.showModal();
  });
  authDialog?.querySelector('.auth-close').addEventListener('click', () => authDialog.close());
  authDialog?.addEventListener('click', event => { if (event.target === authDialog) authDialog.close(); });
  authSwitch?.addEventListener('click', () => setAuthMode(!signUpMode));
  authForm?.addEventListener('submit', async event => {
    event.preventDefault();
    authError.hidden = true;
    const submit = authForm.querySelector('.auth-submit');
    submit.disabled = true;
    submit.textContent = signUpMode ? 'Đang đăng ký…' : 'Đang đăng nhập…';
    const email = document.querySelector('#home-auth-email').value.trim();
    const password = document.querySelector('#home-auth-password').value;
    const response = signUpMode ? await supabaseClient.auth.signUp({email,password}) : await supabaseClient.auth.signInWithPassword({email,password});
    submit.disabled = false;
    if (response.error) {
      authError.textContent = response.error.message;
      authError.hidden = false;
      submit.textContent = signUpMode ? 'Đăng ký' : 'Đăng nhập';
      return;
    }
    authDialog.close();
    authForm.reset();
  });
  if (typeof supabaseClient !== 'undefined') {
    const syncAuth = user => {
      authTrigger.dataset.loggedIn = String(Boolean(user));
      authLabel.textContent = user ? (user.email?.split('@')[0] || 'Đăng xuất') : 'Đăng nhập';
      authTrigger.title = user ? 'Bấm để đăng xuất' : 'Đăng nhập';
    };
    supabaseClient.auth.getSession().then(({data}) => syncAuth(data.session?.user));
    supabaseClient.auth.onAuthStateChange((_event, session) => syncAuth(session?.user));
  }

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
