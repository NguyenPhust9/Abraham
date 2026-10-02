(() => {
  if (document.getElementById('abrahamFloatingContact')) return;
  const contact = document.createElement('aside');
  contact.id = 'abrahamFloatingContact';
  contact.className = 'abx-floating-contact notranslate';
  contact.setAttribute('aria-label', 'Liên hệ nhanh');
  contact.setAttribute('translate', 'no');
  contact.innerHTML = `
    <a class="abx-contact-button abx-contact-phone" href="tel:0901184998" aria-label="Gọi Hotline 0901 184 998" data-contact-label="Hotline: 0901 184 998"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 2.5 3 4.8c-.9.6-.9 2.1-.5 3.4 2.1 6.7 6.6 11.2 13.3 13.3 1.3.4 2.8.4 3.4-.5l2.3-3.6-5.5-3.6-2 2.5a15 15 0 0 1-6.3-6.3l2.5-2Z"/></svg></a>
    <a class="abx-contact-button abx-contact-zalo" href="https://zalo.me/1075006016291309696" target="_blank" rel="noopener noreferrer" aria-label="Nhắn tin qua Zalo" data-contact-label="Nhắn tin Zalo"><span aria-hidden="true">Zalo</span></a>
    <a class="abx-contact-button abx-contact-messenger" href="https://www.facebook.com/abraham.com.vn" target="_blank" rel="noopener noreferrer" aria-label="Nhắn tin qua Messenger" data-contact-label="Nhắn tin Messenger"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.5 2 2 6.1 2 11.3c0 2.9 1.4 5.5 3.6 7.2V22l3.4-1.9c1 .3 2 .5 3 .5 5.5 0 10-4.1 10-9.3S17.5 2 12 2Zm-6 12 5-5 3 3 4-3-5 6-3-3Z"/></svg></a>`;
  document.body.appendChild(contact);
})();
