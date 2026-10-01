(() => {
  const topics = ['Chọn xe cho bé', 'Bảo dưỡng', 'An toàn', 'Kinh nghiệm mua xe', 'Xe đạp thể thao', 'Phụ kiện'];
  const seeds = [
    ['chon-xe-cho-be','Cách chọn xe đạp cho bé theo độ tuổi và chiều cao',0,'images/begaideobalo.png','Hướng dẫn chọn chiếc xe vừa vặn để bé tự tin khám phá thế giới xung quanh.','Hãy bắt đầu từ chiều cao và chiều dài chân của bé, thay vì chỉ dựa vào tuổi. Kích thước bánh xe là điểm tham khảo; hình dáng khung và khả năng điều chỉnh yên cũng ảnh hưởng đến độ vừa vặn.\n\nCho bé thử xe trực tiếp. Bé cần với tới tay lái thoải mái, sử dụng được phanh và chủ động chống chân khi cần. Không chọn xe quá lớn với mong muốn dùng được nhiều năm.\n\nƯu tiên xe có trọng lượng bé có thể kiểm soát. Điều chỉnh yên theo hướng dẫn của nhà sản xuất, kiểm tra phanh và cho bé tập ở khu vực bằng phẳng, tách khỏi xe cộ.'],
    ['bao-duong-tai-nha','Hướng dẫn bảo dưỡng xe đạp tại nhà trong 10 phút',1,'images/nhongsen.jpg','Những bước chăm sóc đơn giản để chiếc xe luôn sạch và vận hành êm.','Lau bụi bẩn trên khung bằng khăn mềm ẩm. Tránh phun nước áp lực cao vào ổ trục và các bộ phận chuyển động.\n\nKiểm tra lốp và bơm theo khoảng áp suất ghi trên thành lốp, có tính đến hướng dẫn của nhà sản xuất. Quan sát vết cắt, nứt hoặc vật lạ mắc trên lốp.\n\nVệ sinh xích bằng dụng cụ phù hợp, tra dầu dành cho xích xe đạp và lau phần dầu thừa. Không để dầu dính lên má phanh, đĩa phanh hoặc bề mặt phanh của vành.\n\nBóp thử hai phanh trước khi đi. Nếu phanh yếu, có tiếng động bất thường hoặc chi tiết bị lỏng, hãy nhờ kỹ thuật viên kiểm tra.'],
    ['xe-12-inch','Xe đạp 12 inch phù hợp với bé mấy tuổi?',0,'images/xedaptreem.jpg','Chiều cao và khả năng điều khiển quan trọng hơn một mốc tuổi cố định.','Xe 12 inch thường là nhóm xe nhỏ cho trẻ mới làm quen, nhưng không có một độ tuổi phù hợp cho tất cả trẻ. Mỗi mẫu xe có chiều cao yên, tầm với tay lái và giới hạn sử dụng khác nhau.\n\nĐối chiếu bảng kích thước của đúng mẫu xe rồi cho bé ngồi thử. Bé cần lên xuống xe dễ dàng, với được tay lái và phanh, giữ thăng bằng phù hợp với giai đoạn học của mình.\n\nĐừng chỉ chọn theo màu sắc hay kích thước bánh. Một chiếc xe vừa người và dễ kiểm soát sẽ giúp buổi tập thoải mái hơn.'],
    ['an-toan-tap-xe','5 lưu ý an toàn khi cho trẻ tập đi xe',2,'images/treem.png','Chuẩn bị kỹ để mỗi buổi tập xe của bé thoải mái và tự tin hơn.','1. Chọn mũ bảo hiểm phù hợp với kích thước đầu và cài quai theo hướng dẫn của nhà sản xuất.\n\n2. Kiểm tra phanh, lốp, tay lái và yên trước buổi tập.\n\n3. Chọn mặt sân bằng phẳng, có tầm nhìn tốt và tách khỏi phương tiện giao thông.\n\n4. Cho bé làm quen với cách dừng xe trước khi tăng tốc. Người lớn cần giám sát trong suốt buổi tập.\n\n5. Duy trì buổi tập ngắn, có nghỉ và dừng lại khi bé mệt hoặc mất tập trung.'],
    ['xe-nu-di-hoc','Nên chọn xe đạp nữ đi học như thế nào?',3,'images/xedapnu.jpg','Gợi ý chọn xe vừa người, dễ sử dụng và phù hợp đường đi hằng ngày.','Xác định quãng đường và đặc điểm đường đi: bằng phẳng, nhiều dốc hay thường phải gửi xe ở không gian nhỏ. Từ đó cân nhắc trọng lượng xe, số tốc độ và trang bị đi kèm.\n\nThử tư thế ngồi, tầm với tay lái và khả năng lên xuống xe. Khung thấp có thể thuận tiện nhưng vẫn cần đúng kích thước với người sử dụng.\n\nNếu cần mang đồ, hãy kiểm tra tải trọng cho phép của giỏ hoặc baga. Đèn, phản quang, chắn bùn và khóa là những trang bị nên cân nhắc cho nhu cầu đi lại hằng ngày.'],
    ['mtb-va-touring','Sự khác nhau giữa xe MTB và Touring',4,'images/roadbike.png','Hiểu mục đích sử dụng để lựa chọn dòng xe phù hợp với hành trình.','MTB thường hướng đến đường địa hình với lốp có độ bám và cấu hình phù hợp bề mặt gồ ghề. Touring thường ưu tiên sự thoải mái, ổn định và khả năng mang hành lý cho hành trình dài.\n\nĐây chỉ là đặc điểm chung: cấu hình thực tế thay đổi theo từng mẫu xe. Hãy so sánh kích thước lốp, tư thế ngồi, dải truyền động và vị trí lắp phụ kiện.\n\nChọn theo cung đường bạn đi thường xuyên nhất và thử xe trực tiếp. Không nhất thiết chọn xe có nhiều trang bị hơn nếu bạn không sử dụng đến.'],
    ['kiem-tra-phanh-lop','Cách kiểm tra phanh và lốp trước mỗi chuyến đi',1,'images/thangxedap.jpg','Dành vài phút kiểm tra trước khi bắt đầu hành trình.','Quan sát lốp để phát hiện vết rách, phồng hoặc mòn bất thường. Kiểm tra áp suất bằng đồng hồ và đối chiếu hướng dẫn trên lốp cùng tài liệu của xe.\n\nDắt xe chậm rồi bóp lần lượt từng phanh để kiểm tra khả năng dừng. Tay phanh không nên chạm sát tay lái khi bóp hết.\n\nNếu thấy phanh yếu, bánh lắc hoặc tiếng cọ kéo dài, hãy dừng sử dụng và mang xe đi kiểm tra. Không tự điều chỉnh bộ phận bạn chưa hiểu rõ.'],
    ['xe-cho-be-gai','Gợi ý xe đạp cho bé gái mới bắt đầu',0,'images/begaideobalo.png','Ưu tiên độ vừa vặn, trọng lượng và sự thoải mái khi bé tập xe.','Một chiếc xe khởi đầu nên vừa người, dễ lên xuống và đủ nhẹ để bé chủ động điều khiển. Hãy cho bé thử thao tác dắt xe, quay đầu và dừng xe.\n\nMàu sắc và giỏ xe có thể giúp bé thêm hào hứng, nhưng không thay thế các tiêu chí về độ vừa vặn và hoạt động của phanh.\n\nCho bé tham gia lựa chọn, rồi kiểm tra giới hạn chiều cao, cân nặng và hướng dẫn lắp ráp của mẫu xe trước khi sử dụng.'],
    ['thay-xich-lop','Khi nào nên thay xích và lốp xe?',1,'images/nhongsen.jpg','Nhận biết dấu hiệu hao mòn và kiểm tra đúng cách.','Xích cần được kiểm tra độ mòn bằng dụng cụ phù hợp. Ngưỡng thay phụ thuộc loại truyền động; hãy đối chiếu hướng dẫn của nhà sản xuất hoặc nhờ cửa hàng đo kiểm.\n\nLốp có vết phồng, rách, lộ sợi bố hoặc nứt rõ cần được kiểm tra trước khi tiếp tục sử dụng. Không chỉ dựa vào thời gian sử dụng để quyết định thay.\n\nVệ sinh và bảo quản xe nơi khô ráo giúp bạn dễ phát hiện bất thường, nhưng không thể khắc phục chi tiết đã hỏng.'],
    ['phu-kien-tre-em','Phụ kiện cần có cho xe đạp trẻ em',5,'images/xedaptreem.jpg','Chuẩn bị phụ kiện phù hợp để bé tập xe thuận tiện hơn.','Bắt đầu với mũ bảo hiểm vừa đầu, phù hợp hoạt động đạp xe. Kiểm tra và điều chỉnh quai theo hướng dẫn sử dụng mỗi khi cần.\n\nChuông, đèn và phản quang hỗ trợ nhận biết, nhưng không thay thế việc tập xe trong khu vực an toàn và có người lớn giám sát.\n\nChọn phụ kiện tương thích với xe, lắp chắc chắn và không vướng bánh, xích hay dây phanh. Hạn chế treo đồ nặng lên tay lái.']
  ];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
  let posts = seeds.map(([id,title,topic,image,excerpt,content]) => ({id,title,category:topics[topic],image,excerpt,content,local:true}));
  let category = '', query = '';
  const grid = document.querySelector('#article-grid');
  const reader = document.querySelector('#article-reader');
  const url = post => post.local ? `?article=${encodeURIComponent(post.id)}` : `/blog-post?id=${encodeURIComponent(post.id)}`;
  const minutes = post => `${Math.max(1, Math.ceil((post.content || post.excerpt || '').split(/\s+/).length / 200))} phút đọc`;
  const date = post => post.created_at && !Number.isNaN(Date.parse(post.created_at)) ? new Date(post.created_at).toLocaleDateString('vi-VN') : 'Abraham Bike';
  const meta = post => `<span>${escape(date(post))}</span><span>◷ ${minutes(post)}</span>`;
  function render() {
    const filtered = posts.filter((post,index) => (category || query || index > 0) && (!category || post.category === category) && (!query || normalize(`${post.title} ${post.excerpt}`).includes(query)));
    grid.innerHTML = filtered.map(post => `<article class="article-tile"><a class="article-photo" href="${url(post)}"><img src="${escape(post.image)}" alt="${escape(post.title)}" loading="lazy"><span class="story-badge">${escape(post.category)}</span></a><div class="article-content"><h3><a href="${url(post)}">${escape(post.title)}</a></h3><p>${escape(post.excerpt)}</p><div class="story-meta">${meta(post)}</div><a class="read-story" href="${url(post)}">Xem thêm →</a></div></article>`).join('') || '<p class="article-empty">Không tìm thấy bài viết phù hợp. Hãy thử từ khóa khác hoặc chọn tất cả chủ đề.</p>';
    document.querySelector('#blog-result-status').textContent = `${filtered.length} bài viết${category ? ` · ${category}` : ''}${query ? ' phù hợp với tìm kiếm' : ''}`;
    document.querySelectorAll('[data-topic]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.topic === category)));
    document.querySelector('#featured-story').hidden = Boolean(category || query);
  }
  function renderHighlights() {
    const first = posts[0];
    document.querySelector('#featured-story').innerHTML = `<img src="${escape(first.image)}" alt="${escape(first.title)}"><div class="featured-copy"><span class="story-badge">${escape(first.category)}</span><h2><a href="${url(first)}">${escape(first.title)}</a></h2><p>${escape(first.excerpt)}</p><div class="story-meta">${meta(first)}</div><a class="button" href="${url(first)}">Đọc bài viết →</a></div>`;
    document.querySelector('#popular-stories').innerHTML = posts.slice(0,3).map(post => `<a class="popular-story" href="${url(post)}"><img src="${escape(post.image)}" alt="" loading="lazy"><div><h3>${escape(post.title)}</h3><small>◷ ${minutes(post)}</small></div></a>`).join('');
    document.querySelector('#topic-list').innerHTML = [...new Set([...topics,...posts.map(post => post.category)])].map(topic => `<button type="button" data-topic="${escape(topic)}"><span>${escape(topic)}</span><small>${posts.filter(post => post.category === topic).length} bài viết</small></button>`).join('');
  }
  function showArticle(id) {
    const post = posts.find(post => post.local && post.id === id);
    if (!post) return;
    reader.querySelector('h2').textContent = post.title;
    reader.querySelector('.reader-body').textContent = post.content;
    reader.querySelector('img').src = post.image;
    reader.querySelector('img').alt = post.title;
    if (!reader.open) reader.showModal();
  }
  document.addEventListener('click', event => {
    const topic = event.target.closest('[data-topic]');
    if (topic) { category = topic.dataset.topic; render(); }
    const link = event.target.closest('a[href^="?article="]');
    if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey) { event.preventDefault(); const next = new URL(link.href); history.pushState(null,'',next); showArticle(next.searchParams.get('article')); }
  });
  document.querySelector('#knowledge-search').addEventListener('submit', event => { event.preventDefault(); query = normalize(document.querySelector('#article-query').value.trim()); render(); });
  document.querySelector('#show-all-articles').addEventListener('click', () => { category = ''; query = ''; document.querySelector('#article-query').value = ''; render(); });
  reader.querySelector('button').addEventListener('click', () => reader.close());
  reader.addEventListener('close', () => { const current = new URL(location.href); if (current.searchParams.has('article')) { current.searchParams.delete('article'); history.replaceState(null,'',current); } });
  window.addEventListener('popstate', () => { const id = new URLSearchParams(location.search).get('article'); if (id) showArticle(id); else reader.close(); });
  document.querySelector('#knowledge-newsletter').addEventListener('submit', event => {
    event.preventDefault();
    const email = document.querySelector('#newsletter-email').value.trim();
    location.href = `mailto:support@abrahambikes.com?subject=${encodeURIComponent('Đăng ký nhận kiến thức xe đạp')}&body=${encodeURIComponent(`Tôi muốn nhận bài viết mới từ Abraham qua email: ${email}`)}`;
    document.querySelector('#newsletter-status').textContent = 'Vui lòng gửi yêu cầu trong ứng dụng email vừa mở. Bạn cũng có thể gửi trực tiếp đến support@abrahambikes.com.';
  });
  document.addEventListener('error', event => { if (event.target.tagName === 'IMG' && event.target.closest('main') && !event.target.src.endsWith('/images/banner.png')) event.target.src = 'images/banner.png'; }, true);
  window.setPublishedBlogPosts = data => {
    if (!data?.length) return;
    const safeImage = source => { try { const parsed = new URL(source,location.href); return ['https:','http:'].includes(parsed.protocol) ? parsed.href : 'images/banner.png'; } catch { return 'images/banner.png'; } };
    posts = data.map(post => ({...post, category:post.category || 'Kiến thức xe đạp',image:safeImage(post.image_url || 'images/banner.png'),excerpt:post.excerpt || (post.content || '').slice(0,130), local:false}));
    renderHighlights(); render();
  };
  renderHighlights(); render(); showArticle(new URLSearchParams(location.search).get('article'));
})();
