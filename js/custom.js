(function() {
	'use strict';

	/* Use the same Abraham logo treatment as the home-page header. */
	document.querySelectorAll('.abx-mobile-brand').forEach(function(brand) {
		brand.innerHTML = '<img src="/images/logoabraham.png" alt="Abraham Bike">';
		brand.setAttribute('aria-label', 'Abraham Bike – Trang chủ');
	});

	/* Keep the shared navigation state consistent on every page. */
	var syncActiveNavigation = function() {
		var path = window.location.pathname.replace(/\/+$/, '') || '/';
		path = path.replace(/\.html$/i, '');
		var section = path;
		if (path === '/index') section = '/';
		if (path === '/product-detail' || path.startsWith('/san-pham/') || path.startsWith('/product/')) section = '/shop';
		if (path === '/blog-post') section = '/blog';

		var links = document.querySelectorAll('.abx-navigation-link');
		links.forEach(function(link) {
			var href = new URL(link.getAttribute('href'), window.location.origin).pathname.replace(/\/+$/, '') || '/';
			href = href.replace(/\.html$/i, '');
			var active = href === section;
			link.classList.toggle('is-active', active);
			if (active) link.setAttribute('aria-current', 'page');
			else link.removeAttribute('aria-current');
		});

		var cartActive = ['/cart', '/checkout', '/thankyou'].includes(path);
		document.querySelectorAll('.abx-cart-link').forEach(function(link) {
			link.classList.toggle('is-active', cartActive);
			if (cartActive) link.setAttribute('aria-current', 'page');
			else link.removeAttribute('aria-current');
		});
	};
	syncActiveNavigation();

	/* Shared EN / 中文 / VI language picker beside the account button. */


	var initFloatingContact = function() {
		if (typeof document.querySelector !== 'function' || document.getElementById('abrahamFloatingContact')) return;
		var contact = document.createElement('aside');
		contact.id = 'abrahamFloatingContact';
		contact.className = 'abx-floating-contact notranslate';
		contact.setAttribute('translate', 'no');
		contact.setAttribute('aria-label', 'Liên hệ nhanh');
		contact.innerHTML =
			'<a class="abx-contact-button abx-contact-phone" href="tel:0901184998" aria-label="Gọi Hotline 0901 184 998" data-contact-label="Hotline: 0901 184 998">' +
			'<i class="fa-solid fa-phone" aria-hidden="true"></i></a>' +
			'<a class="abx-contact-button abx-contact-zalo" href="https://zalo.me/1075006016291309696" target="_blank" rel="noopener noreferrer" aria-label="Nhắn tin qua Zalo" data-contact-label="Nhắn tin Zalo">' +
			'<span aria-hidden="true">Zalo</span></a>' +
			'<a class="abx-contact-button abx-contact-messenger" href="https://www.facebook.com/abraham.com.vn" target="_blank" rel="noopener noreferrer" aria-label="Nhắn tin qua Messenger" data-contact-label="Nhắn tin Messenger">' +
			'<i class="fa-brands fa-facebook-messenger" aria-hidden="true"></i></a>';
		document.body.appendChild(contact);
	};
	initFloatingContact();

	var tinyslider = function() {
		var el = document.querySelectorAll('.testimonial-slider');

		if (el.length > 0) {
			var slider = tns({
				container: '.testimonial-slider',
				items: 1,
				axis: "horizontal",
				controlsContainer: "#testimonial-nav",
				swipeAngle: false,
				speed: 700,
				nav: true,
				controls: true,
				autoplay: true,
				autoplayHoverPause: true,
				autoplayTimeout: 3500,
				autoplayButtonOutput: false
			});
		}
	};
	tinyslider();

	


	var sitePlusMinus = function() {

		var value,
    		quantity = document.getElementsByClassName('quantity-container');

		function createBindings(quantityContainer) {
	      var quantityAmount = quantityContainer.getElementsByClassName('quantity-amount')[0];
	      var increase = quantityContainer.getElementsByClassName('increase')[0];
	      var decrease = quantityContainer.getElementsByClassName('decrease')[0];
	      increase.addEventListener('click', function (e) { increaseValue(e, quantityAmount); });
	      decrease.addEventListener('click', function (e) { decreaseValue(e, quantityAmount); });
	    }

	    function init() {
	        for (var i = 0; i < quantity.length; i++ ) {
						createBindings(quantity[i]);
	        }
	    };

	    function increaseValue(event, quantityAmount) {
	        value = parseInt(quantityAmount.value, 10);

	        console.log(quantityAmount, quantityAmount.value);

	        value = isNaN(value) ? 0 : value;
	        value++;
	        quantityAmount.value = value;
	    }

	    function decreaseValue(event, quantityAmount) {
	        value = parseInt(quantityAmount.value, 10);

	        value = isNaN(value) ? 0 : value;
	        if (value > 0) value--;

	        quantityAmount.value = value;
	    }
	    
	    init();
		
	};
	sitePlusMinus();


})()
