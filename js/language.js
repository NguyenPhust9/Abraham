(function() {
"use strict";
	var initLanguagePicker = function() {

		if (typeof document.querySelector !== 'function') return;

		var actions = document.querySelector('.abx-navigation-actions');

		var account = actions && actions.querySelector('.abx-account');
        var nativePicker = document.querySelector('#language-picker');

		if ((!nativePicker && (!actions || !account)) || document.getElementById('languagePicker')) return;



		var languages = {

			en: {

				flag: '/images/flags/english.svg', name: 'English', label: 'Select language', googleCode: 'en'

			},

			zh: {

				flag: '/images/flags/chinese.svg', name: '中文', label: '选择语言', googleCode: 'zh-CN'

			},

			vi: {

				flag: '/images/flags/vietnamese.svg', name: 'Tiếng Việt', label: 'Chọn ngôn ngữ', googleCode: 'vi'

			}

		};

		var pageTranslations = {

			'Built For The Road. Backed By Trust.':['Sinh ra cho mọi cung đường. Được bảo chứng bằng niềm tin.','为道路而生，以信赖为本。'],'Explore Bikes':['Khám phá xe đạp','探索自行车'],'Certified quality':['Chất lượng chứng nhận','认证品质'],'Nationwide network':['Mạng lưới toàn quốc','全国网络'],'Rider-first support':['Hỗ trợ lấy người đi xe làm trọng tâm','骑手优先服务'],'Years of experience':['Năm kinh nghiệm','年经验'],'Dealers nationwide':['Đại lý toàn quốc','全国经销商'],'Product categories':['Danh mục sản phẩm','产品类别'],'A Bicycle Brand Built Around Everyday Riders.':['Thương hiệu xe đạp dành cho người dùng hằng ngày.','为日常骑手打造的自行车品牌。'],'Discover Our Services':['Khám phá dịch vụ','探索我们的服务'],'Why Abraham':['Vì sao chọn Abraham','为什么选择 Abraham'],'Experience You Can Feel On Every Ride.':['Trải nghiệm khác biệt trên mọi hành trình.','每次骑行都能感受的体验。'],'Rider-Focused Design':['Thiết kế hướng đến người đi xe','以骑手为中心的设计'],'Certified Quality':['Chất lượng được chứng nhận','认证品质'],'Nationwide Reach':['Phủ rộng toàn quốc','覆盖全国'],'Long-Term Support':['Hỗ trợ dài hạn','长期支持'],'Engineered For The Ride':['Được thiết kế cho hành trình','为骑行而设计'],'Balanced Construction':['Kết cấu cân bằng','均衡结构'],'Smooth Power Transfer':['Truyền lực mượt mà','顺畅传动'],'Confident Braking':['Phanh an toàn, tự tin','自信制动'],'Everyday Geometry':['Hình học phù hợp hằng ngày','日常骑行几何'],'Our Values':['Giá trị của chúng tôi','我们的价值观'],'Core Values':['Giá trị cốt lõi','核心价值观'],'Integrity':['Chính trực','诚信'],'Reliability':['Đáng tin cậy','可靠'],'Dedication':['Tận tâm','专注'],

			'Expert Bike Care,':['Chăm sóc xe chuyên nghiệp,','专业自行车养护，'],'Built Around Your Ride':['Tối ưu cho hành trình của bạn','围绕您的骑行打造'],'Explore Services':['Khám phá dịch vụ','探索服务'],'Everything Your Bike Needs':['Mọi điều chiếc xe của bạn cần','满足爱车的一切需求'],'Bike Tune-Up':['Hiệu chỉnh xe đạp','自行车调校'],'Repair & Maintenance':['Sửa chữa và bảo dưỡng','维修与保养'],'Bike Fit & Setup':['Căn chỉnh và thiết lập xe','车辆适配与设置'],'Warranty & Support':['Bảo hành và hỗ trợ','保修与支持'],'Four Steps. One Better Ride.':['Bốn bước cho hành trình tốt hơn.','四个步骤，骑得更好。'],'Book Your Service':['Đặt lịch dịch vụ','预约服务'],'Bike Check-In':['Tiếp nhận xe','车辆接收'],'Expert Service':['Dịch vụ chuyên nghiệp','专业服务'],'Ready to Ride':['Sẵn sàng lên đường','准备骑行'],'Book Service':['Đặt lịch','预约服务'],'Why Abraham Service':['Vì sao chọn dịch vụ Abraham','为什么选择 Abraham 服务'],'Experienced Technicians':['Kỹ thuật viên giàu kinh nghiệm','经验丰富的技师'],'Quality Components':['Linh kiện chất lượng','优质配件'],'Precision Service':['Dịch vụ chính xác','精准服务'],'Ongoing Support':['Hỗ trợ liên tục','持续支持'],'Rider Stories':['Câu chuyện người đi xe','骑手故事'],

			'Insights & Stories':['Kiến thức và câu chuyện','见解与故事'],'From the Abraham Journal':['Từ nhật ký Abraham','来自 Abraham 骑行日志'],'Loading posts...':['Đang tải bài viết...','正在加载文章……'],'Load More Articles':['Xem thêm bài viết','加载更多文章'],'Browse by Topic':['Duyệt theo chủ đề','按主题浏览'],'Maintenance':['Bảo dưỡng','保养'],'Road Riding':['Đạp xe đường trường','公路骑行'],'Mountain Biking':['Đạp xe địa hình','山地骑行'],'Beginner Guides':['Hướng dẫn người mới','新手指南'],'Never Miss a Ride Tip':['Đừng bỏ lỡ mẹo đạp xe','不错过任何骑行技巧'],'Subscribe':['Đăng ký','订阅'],'Abraham Journal':['Nhật ký Abraham','Abraham 骑行日志'],'Stories From The Ride.':['Những câu chuyện trên hành trình.','骑行路上的故事。'],'Loading article...':['Đang tải bài viết...','正在加载文章……'],'Article not found':['Không tìm thấy bài viết','未找到文章'],'Back to Blog':['Quay lại Blog','返回博客'],'Back to Journal':['Quay lại nhật ký','返回日志'],'Continue exploring':['Tiếp tục khám phá','继续探索'],'View All Stories':['Xem tất cả câu chuyện','查看全部故事'],'Warranty':['Bảo hành','保修'],'Find a Store':['Tìm cửa hàng','查找门店'],'Accessories':['Phụ kiện','配件'],

			"We're Here to Help":['Chúng tôi luôn sẵn sàng hỗ trợ','我们随时为您服务'],"Let's Get You Rolling":['Cùng bạn bắt đầu hành trình','助您轻松启程'],'Call Us':['Gọi cho chúng tôi','致电我们'],'Email Us':['Gửi email','发送邮件'],'Send a Message':['Gửi tin nhắn','发送留言'],'We reply within 1 day':['Phản hồi trong vòng 1 ngày','我们将在一天内回复'],'Visit Showroom':['Ghé showroom','参观展厅'],'Opening Hours':['Giờ mở cửa','营业时间'],'Send Us a Message':['Gửi tin nhắn cho chúng tôi','给我们留言'],'First name':['Tên','名'],'Last name':['Họ','姓'],'Email address':['Địa chỉ email','电子邮箱'],'Phone number':['Số điện thoại','电话号码'],'What do you need?':['Bạn cần hỗ trợ gì?','您需要什么帮助？'],'Bike Service & Repair':['Bảo dưỡng và sửa chữa xe','自行车保养与维修'],'Warranty Support':['Hỗ trợ bảo hành','保修支持'],'Order & Shipping':['Đơn hàng và giao hàng','订单与配送'],'Something Else':['Nội dung khác','其他'],'Subscribe for Ride Tips & Offers':['Đăng ký nhận mẹo đạp xe và ưu đãi','订阅骑行技巧与优惠'],

			'YOUR NEXT RIDE':['HÀNH TRÌNH TIẾP THEO','下一段骑行'],'Continue shopping':['Tiếp tục mua sắm','继续购物'],'Your items':['Sản phẩm của bạn','您的商品'],'Order summary':['Tóm tắt đơn hàng','订单摘要'],'Items':['Sản phẩm','商品'],'Delivery':['Giao hàng','配送'],'Confirmed with your order':['Xác nhận cùng đơn hàng','随订单确认'],'Need a hand?':['Bạn cần hỗ trợ?','需要帮助？'],'Talk to our team':['Liên hệ đội ngũ','联系我们的团队'],'Explore bikes':['Khám phá xe đạp','探索自行车'],'Success':['Thành công','成功'],

			'Shipping & Payment':['Giao hàng và thanh toán','配送与付款'],'Review Order':['Kiểm tra đơn hàng','核对订单'],'Complete Order':['Hoàn tất đơn hàng','完成订单'],'Your information is secure':['Thông tin của bạn được bảo mật','您的信息安全无忧'],'We protect your privacy':['Chúng tôi bảo vệ quyền riêng tư của bạn','我们保护您的隐私'],'Select a country':['Chọn quốc gia','选择国家'],'Company Name':['Tên công ty','公司名称'],'State / Country':['Tỉnh/Quốc gia','省/国家'],'Email Address':['Địa chỉ email','电子邮箱'],'Create an account?':['Tạo tài khoản?','创建账户？'],'Ship To A Different Address?':['Giao đến địa chỉ khác?','配送到其他地址？'],'Have a coupon code?':['Bạn có mã giảm giá?','有优惠码吗？'],'Apply':['Áp dụng','应用'],'Review your selected products':['Kiểm tra sản phẩm đã chọn','核对所选商品'],'Cart Subtotal':['Tạm tính giỏ hàng','购物车小计'],'Order Total':['Tổng đơn hàng','订单总额'],'Direct Bank Transfer':['Chuyển khoản ngân hàng','银行转账'],'Cheque Payment':['Thanh toán bằng séc','支票付款'],'Paypal':['PayPal','PayPal'],'Your order has been placed successfully.':['Đơn hàng của bạn đã được đặt thành công.','您的订单已成功提交。'],'Back to home':['Về trang chủ','返回首页'],'Track and review all orders placed with your account.':['Theo dõi và xem lại tất cả đơn hàng trong tài khoản.','跟踪并查看账户中的所有订单。'],'Log in to view your orders':['Đăng nhập để xem đơn hàng','登录查看订单'],'Your order history is securely linked to your account.':['Lịch sử đơn hàng được liên kết an toàn với tài khoản của bạn.','订单记录已安全关联到您的账户。'],'Your completed orders will appear here.':['Các đơn hàng đã hoàn tất sẽ xuất hiện tại đây.','已完成的订单将显示在此处。'],'Start shopping':['Bắt đầu mua sắm','开始购物']

		};

		Object.assign(pageTranslations, {

			'Premium bicycles and expert service, built for every rider. Certified technicians, genuine parts, and care backed by precision — since day one.':['Xe đạp cao cấp và dịch vụ chuyên nghiệp dành cho mọi người đi xe. Kỹ thuật viên được chứng nhận, linh kiện chính hãng và quy trình chăm sóc chính xác ngay từ ngày đầu tiên.','为每位骑手提供高品质自行车与专业服务。认证技师、正品配件，以及从第一天起始终精准可靠的养护。'],

			'— Get in Touch —':['— LIÊN HỆ VỚI CHÚNG TÔI —','— 联系我们 —'],'Visit, Call, or Write to Us':['Ghé thăm, gọi điện hoặc nhắn cho chúng tôi','到访、致电或留言'],'Our service center and showroom are open six days a week. Drop by for a fitting, a repair, or just to talk bikes.':['Trung tâm dịch vụ và showroom mở cửa sáu ngày mỗi tuần. Hãy ghé qua để căn chỉnh, sửa chữa hoặc đơn giản là trò chuyện về xe đạp.','服务中心与展厅每周开放六天。欢迎前来进行车辆适配、维修，或聊聊自行车。'],'Showroom & Service Center':['Showroom và Trung tâm dịch vụ','展厅与服务中心'],'128 Nguyen Van Linh, District 7, Ho Chi Minh City':['128 Nguyễn Văn Linh, Quận 7, Thành phố Hồ Chí Minh','胡志明市第七郡阮文灵路128号'],'Mon – Sat, 8:00 AM – 6:30 PM':['Thứ Hai – Thứ Bảy, 8:00 – 18:30','周一至周六，8:00–18:30'],'Sunday: Service by appointment':['Chủ nhật: Phục vụ theo lịch hẹn','周日：预约服务'],'Tell us what your bike needs — we\'ll follow up with the next available slot.':['Hãy cho chúng tôi biết chiếc xe của bạn cần gì — chúng tôi sẽ phản hồi với lịch trống gần nhất.','请告诉我们您的自行车需要什么服务，我们会提供最近的可预约时间。'],

			'Certified safety standard':['Tiêu chuẩn an toàn được chứng nhận','认证安全标准'],

			'The Details That Turn A Bike Into A Better Ride.':['Những chi tiết tạo nên một hành trình tốt hơn.','让自行车带来更佳骑行体验的细节。'],'01 / FRAME':['01 / KHUNG XE','01 / 车架'],'02 / DRIVE':['02 / TRUYỀN ĐỘNG','02 / 传动'],'03 / CONTROL':['03 / KIỂM SOÁT','03 / 操控'],'04 / COMFORT':['04 / THOẢI MÁI','04 / 舒适'],'Made To Move':['Sinh ra để chuyển động','为前行而生'],'One Brand. Different Ways To Ride.':['Một thương hiệu. Nhiều phong cách đạp xe.','一个品牌，多种骑行方式。'],'Urban Ride':['Đạp xe đô thị','城市骑行'],'Daily Commute':['Đi lại hằng ngày','日常通勤'],'Comfortable, dependable mobility for the rhythm of everyday city life.':['Phương tiện thoải mái, đáng tin cậy cho nhịp sống đô thị hằng ngày.','舒适可靠的出行方式，融入日常城市节奏。'],'Road Experience':['Trải nghiệm đường trường','公路体验'],'Ride For Fitness':['Đạp xe rèn luyện','健身骑行'],'A responsive setup for riders who want to go farther and keep improving.':['Thiết lập nhạy bén cho người muốn đi xa hơn và không ngừng tiến bộ.','灵敏配置，适合希望骑得更远并不断进步的骑手。'],'Weekend Adventure':['Phiêu lưu cuối tuần','周末探险'],'Explore More':['Khám phá nhiều hơn','探索更多'],'Ready for slower roads, longer routes, and the journeys you ride just for yourself.':['Sẵn sàng cho những con đường yên bình, hành trình dài hơn và những chuyến đi dành riêng cho bạn.','从容应对宁静道路、更长路线，以及只属于自己的旅程。'],'We always put transparency and honesty first, building lasting trust with our customers.':['Chúng tôi luôn đặt sự minh bạch và trung thực lên hàng đầu, xây dựng niềm tin lâu dài với khách hàng.','我们始终将透明与诚信放在首位，与客户建立长久信任。'],'We build our reputation through the outstanding quality of our products and services.':['Chúng tôi xây dựng uy tín bằng chất lượng vượt trội của sản phẩm và dịch vụ.','我们以卓越的产品与服务品质建立信誉。'],'We continuously strive to deliver the best value to our customers, partners, and community.':['Chúng tôi không ngừng nỗ lực mang lại giá trị tốt nhất cho khách hàng, đối tác và cộng đồng.','我们持续努力，为客户、合作伙伴和社区创造最佳价值。'],

			'For more than two decades, Abraham has focused on one thing: building dependable bicycles that make everyday riding easier, safer, and more enjoyable.':['Trong hơn hai thập kỷ, Abraham luôn tập trung vào một điều: tạo ra những chiếc xe đạp đáng tin cậy, giúp việc di chuyển hằng ngày dễ dàng, an toàn và thú vị hơn.','二十多年来，Abraham 始终专注于打造可靠的自行车，让日常骑行更轻松、更安全、更愉悦。'],

			'Abraham was created with a straightforward belief: a good bicycle should feel reliable from the first pedal stroke and remain a trusted companion for the journeys that follow.':['Abraham được hình thành từ một niềm tin giản dị: một chiếc xe tốt phải mang lại cảm giác đáng tin cậy ngay từ vòng đạp đầu tiên và luôn là người bạn đồng hành trên những hành trình tiếp theo.','Abraham 源于一个朴素的信念：好自行车应从第一脚踩踏起就值得信赖，并在往后的旅程中始终相伴。'],

			'Over the years, that belief has shaped how we approach design, engineering, product development, distribution, and after-sales care. We continue to improve the details that matter most to riders: comfort, control, durability, and confidence.':['Qua nhiều năm, niềm tin ấy định hình cách chúng tôi thiết kế, kỹ thuật, phát triển sản phẩm, phân phối và chăm sóc sau bán hàng. Chúng tôi không ngừng hoàn thiện những yếu tố quan trọng nhất: sự thoải mái, khả năng kiểm soát, độ bền và sự tự tin.','多年来，这一信念塑造了我们的设计、工程、产品开发、销售与售后服务。我们持续改进骑手最重视的细节：舒适、操控、耐用与信心。'],

			'The name “Abraham” represents the values the brand aims to carry forward: trust, commitment, and a long-term relationship with every rider.':['Tên gọi “Abraham” đại diện cho những giá trị thương hiệu luôn theo đuổi: niềm tin, sự cam kết và mối quan hệ lâu dài với mỗi người đi xe.','“Abraham”这一名称代表品牌坚持传承的价值：信任、承诺，以及与每位骑手建立长期关系。'],

			'From choosing the right bike to keeping it in great condition, Abraham is built around practical support for real riders.':['Từ việc chọn đúng chiếc xe đến duy trì xe trong tình trạng tốt nhất, Abraham luôn mang đến sự hỗ trợ thiết thực cho người đi xe.','从选对自行车到保持良好车况，Abraham 始终为真实骑手提供实用支持。'],

			'Geometry and components selected for comfort, control, and everyday usability.':['Hình học và linh kiện được lựa chọn để đảm bảo sự thoải mái, khả năng kiểm soát và tính tiện dụng hằng ngày.','精选几何设计与组件，兼顾舒适、操控与日常实用性。'],

			'Products developed to meet applicable safety and regulatory requirements.':['Sản phẩm được phát triển đáp ứng các yêu cầu an toàn và quy định hiện hành.','产品依照适用的安全与法规要求开发。'],

			'A broad dealer network makes Abraham easier to discover, try, and maintain.':['Mạng lưới đại lý rộng khắp giúp khách hàng dễ dàng tìm hiểu, trải nghiệm và bảo dưỡng xe Abraham.','广泛的经销商网络让您更方便地了解、试骑和保养 Abraham。'],

			'After-sales guidance and maintenance support help riders stay confident.':['Hướng dẫn sau bán hàng và hỗ trợ bảo dưỡng giúp người đi xe luôn an tâm.','售后指导与保养支持让骑手始终安心。'],

			'We focus on the parts riders interact with every day — the frame, drivetrain, braking, and overall riding position.':['Chúng tôi tập trung vào những bộ phận người dùng tiếp xúc mỗi ngày — khung xe, hệ truyền động, phanh và tư thế lái tổng thể.','我们专注于骑手每天接触的部分——车架、传动、刹车及整体骑行姿势。'],

			'A dependable frame platform designed to feel stable, responsive, and easy to handle.':['Nền tảng khung xe đáng tin cậy, ổn định, nhạy bén và dễ điều khiển.','可靠的车架平台，稳定灵敏且易于操控。'],

			'Reliable gearing helps riders maintain an efficient rhythm across daily routes.':['Hệ thống truyền động đáng tin cậy giúp duy trì nhịp đạp hiệu quả trên các cung đường hằng ngày.','可靠的变速系统帮助骑手在日常路线中保持高效节奏。'],

			'Responsive stopping performance gives riders better control when conditions change.':['Khả năng phanh nhạy giúp người đi xe kiểm soát tốt hơn khi điều kiện thay đổi.','灵敏的制动性能让骑手在路况变化时拥有更好控制。'],

			'A comfortable riding position supports commuting, fitness rides, and longer weekends.':['Tư thế lái thoải mái phù hợp cho đi làm, rèn luyện và những chuyến đi dài cuối tuần.','舒适骑姿适合通勤、健身骑行及周末长途。'],

			'Whether the destination is work, a training loop, or somewhere beyond the city, Abraham is designed to fit into the way people actually ride.':['Dù điểm đến là nơi làm việc, cung đường luyện tập hay một nơi ngoài thành phố, Abraham được thiết kế phù hợp với cách mọi người thực sự đạp xe.','无论目的地是工作地点、训练路线还是城市之外，Abraham 都为真实骑行方式而设计。'],

			'— Trusted by Riders —':['— Được người đi xe tin chọn —','— 深受骑手信赖 —'],'Abraham\'s service is second to none. My bike feels brand new every time. Reliable, professional, and worth every ride.':['Dịch vụ của Abraham thật sự xuất sắc. Chiếc xe của tôi luôn như mới sau mỗi lần bảo dưỡng — đáng tin cậy, chuyên nghiệp và xứng đáng cho mọi hành trình.','Abraham 的服务无可挑剔。每次保养后，我的自行车都焕然一新，可靠、专业，值得每一次骑行。'],'Fast, professional, and detailed. The team explained exactly what my bike needed without making things complicated.':['Nhanh chóng, chuyên nghiệp và tỉ mỉ. Đội ngũ giải thích chính xác chiếc xe của tôi cần gì một cách rất dễ hiểu.','快速、专业且细致。团队清楚说明了我的自行车需要什么，一点也不复杂。'],'Top-tier care for serious riders. Abraham keeps my bike performing at its absolute best.':['Dịch vụ hàng đầu dành cho người đạp xe nghiêm túc. Abraham giúp chiếc xe của tôi luôn đạt hiệu năng tốt nhất.','为认真骑行者提供顶级养护。Abraham 让我的自行车始终保持最佳性能。'],'Booking was effortless and my bike was ready earlier than expected. Great communication throughout.':['Đặt lịch rất dễ dàng và xe của tôi hoàn thành sớm hơn dự kiến. Quá trình trao đổi luôn rõ ràng.','预约轻松，车辆还提前完成，整个过程沟通顺畅。'],'The bike fit adjustment changed everything. No more wrist pain on long rides.':['Việc căn chỉnh xe đã thay đổi hoàn toàn trải nghiệm của tôi. Tôi không còn đau cổ tay khi đi đường dài.','车辆适配改变了一切，长途骑行时手腕再也不疼了。'],"Genuine parts, honest pricing, and technicians who actually know what they're doing.":['Linh kiện chính hãng, giá cả minh bạch và kỹ thuật viên thực sự am hiểu công việc.','正品配件、透明价格，还有真正专业的技师。'],'Daily Commuter':['Người đi làm hằng ngày','日常通勤骑手'],'Weekend Cyclist':['Người đạp xe cuối tuần','周末骑手'],'Road Cyclist':['Người đạp xe đường trường','公路骑手'],'Commuter':['Người đi làm','通勤骑手'],'Touring Cyclist':['Người đạp xe đường dài','长途骑手'],'Mountain Biker':['Người đạp xe địa hình','山地骑手'],

			'01. Book Your Service':['01. Đặt lịch dịch vụ','01. 预约服务'],'— choose what your bike needs.':['— chọn dịch vụ chiếc xe của bạn cần.','— 选择您的爱车所需服务。'],'02. Bike Check-In':['02. Tiếp nhận xe','02. 车辆接收'],'— we inspect your bike and riding needs.':['— chúng tôi kiểm tra xe và nhu cầu sử dụng của bạn.','— 我们检查车辆及您的骑行需求。'],'03. Expert Service':['03. Dịch vụ chuyên nghiệp','03. 专业服务'],'— adjustments and repairs are completed with care.':['— việc hiệu chỉnh và sửa chữa được thực hiện cẩn thận.','— 精心完成调校与维修。'],'04. Ready to Ride':['04. Sẵn sàng lên đường','04. 准备骑行'],'— final quality check before handover.':['— kiểm tra chất lượng lần cuối trước khi bàn giao.','— 交付前进行最终质量检查。'],

			'From everyday tune-ups to complete performance servicing, Abraham keeps your bike smooth, responsive, and ready for every road ahead.':['Từ hiệu chỉnh hằng ngày đến bảo dưỡng hiệu năng toàn diện, Abraham giúp chiếc xe luôn mượt mà, nhạy bén và sẵn sàng cho mọi cung đường.','从日常调校到全面性能保养，Abraham 让您的自行车始终顺畅灵敏，随时迎接每段道路。'],

			'Professional care for everyday riders, weekend explorers, and cyclists who expect more from every kilometer.':['Chăm sóc chuyên nghiệp cho người đi xe hằng ngày, người khám phá cuối tuần và những tay đua mong muốn nhiều hơn trên từng kilômét.','为日常骑手、周末探索者以及追求更佳体验的骑行者提供专业养护。'],

			'Complete inspection and adjustment to keep your bike smooth, quiet, safe, and responsive.':['Kiểm tra và hiệu chỉnh toàn diện để xe luôn mượt, êm, an toàn và nhạy bén.','全面检查与调校，让爱车保持顺畅、安静、安全且灵敏。'],

			'Brakes, gears, drivetrain, wheels, and essential components serviced with precision.':['Phanh, bộ số, hệ truyền động, bánh xe và các linh kiện thiết yếu được bảo dưỡng chính xác.','精准保养刹车、变速、传动系统、车轮及关键组件。'],

			'Fine-tuned adjustments for better comfort, control, efficiency, and confidence.':['Tinh chỉnh để tăng sự thoải mái, khả năng kiểm soát, hiệu quả và tự tin.','精细调校，提升舒适度、操控、效率与信心。'],

			'Reliable after-sales care and dedicated support whenever your Abraham bike needs attention.':['Chăm sóc sau bán hàng đáng tin cậy và hỗ trợ tận tâm khi xe Abraham của bạn cần.','为您的 Abraham 自行车提供可靠的售后养护与专属支持。'],

			'A clear, straightforward service process designed to get you back on the road with confidence.':['Quy trình dịch vụ rõ ràng, đơn giản giúp bạn tự tin trở lại hành trình.','清晰直接的服务流程，让您安心重返道路。'],

			'More than maintenance. We focus on how your bike feels, performs, and supports the way you actually ride.':['Không chỉ là bảo dưỡng. Chúng tôi chú trọng cảm giác, hiệu năng và cách chiếc xe hỗ trợ phong cách đạp xe của bạn.','不止于保养，我们更关注车辆感受、性能以及对您骑行方式的支持。'],

			'Skilled bike specialists with practical product knowledge.':['Chuyên gia xe đạp lành nghề với kiến thức sản phẩm thực tế.','具备实用产品知识的专业自行车技师。'],

			'Carefully selected parts for dependable long-term performance.':['Linh kiện được lựa chọn kỹ lưỡng để đảm bảo hiệu năng bền bỉ lâu dài.','精心挑选配件，确保长期可靠性能。'],

			'Every adjustment considers safety, performance, and ride feel.':['Mọi điều chỉnh đều cân nhắc độ an toàn, hiệu năng và cảm giác lái.','每次调校都兼顾安全、性能与骑行感受。'],

			'Helpful advice before, during, and after every service.':['Tư vấn hữu ích trước, trong và sau mỗi lần bảo dưỡng.','在每次服务前、中、后提供实用建议。'],

			'Ride Better Starts With Better Care.':['Hành trình tốt hơn bắt đầu từ sự chăm sóc tốt hơn.','更好的骑行始于更好的养护。'],

			'Book your Abraham service today and feel the difference from the first kilometer.':['Đặt lịch dịch vụ Abraham hôm nay và cảm nhận sự khác biệt ngay từ kilômét đầu tiên.','立即预约 Abraham 服务，从第一公里感受不同。']

		});



		var picker = nativePicker || document.createElement('div');
        if (!nativePicker) {

		picker.id = 'languagePicker';

		picker.className = 'dropdown abx-language notranslate';

		picker.setAttribute('translate', 'no');

		picker.innerHTML = '<button class="abx-language-trigger" type="button" data-bs-toggle="dropdown" aria-expanded="false">' +

			'<img class="abx-language-flag" src="/images/flags/english.svg" alt=""><span class="abx-language-name">English</span>' +

			'<svg class="abx-language-chevron" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 6 3.5 4 3.5-4"></path></svg></button>' +

			'<ul class="dropdown-menu dropdown-menu-end abx-language-menu">' +

			'<li><button class="dropdown-item" type="button" data-language="en"><img class="abx-option-flag" src="/images/flags/english.svg" alt="">English</button></li>' +

			'<li><button class="dropdown-item" type="button" data-language="zh"><img class="abx-option-flag" src="/images/flags/chinese.svg" alt="">中文</button></li>' +

			'<li><button class="dropdown-item" type="button" data-language="vi"><img class="abx-option-flag" src="/images/flags/vietnamese.svg" alt="">Tiếng Việt</button></li></ul>';

		actions.insertBefore(picker, account);
        } else { nativePicker.classList.add('notranslate'); }



		var translations = {
            'Products':['S\u1ea3n ph\u1ea9m','\u4ea7\u54c1'],'Dealers':['H\u1ec7 th\u1ed1ng \u0111\u1ea1i l\u00fd','\u7ecf\u9500\u5546\u7f51\u7edc'],'Knowledge':['Ki\u1ebfn th\u1ee9c','\u77e5\u8bc6'],

			'Home':['Trang chủ','首页'],'Shop':['Cửa hàng','商店'],'About us':['Về chúng tôi','关于我们'],'Services':['Dịch vụ','服务'],'Blog':['Bài viết','博客'],'Contact us':['Liên hệ','联系我们'],'Log In':['Đăng nhập','登录'],'Log out':['Đăng xuất','退出登录'],'Your account':['Tài khoản của bạn','您的账户'],'View cart':['Xem giỏ hàng','查看购物车'],'Admin':['Quản trị','管理'],

			'Ride Further,':['Đi xa hơn,','骑得更远，'],'Ride Better':['Trải nghiệm tốt hơn','骑得更好'],'Premium bicycles built for every kind of rider. From daily city commutes to weekend trail adventures, find the frame, fit, and components that keep you rolling.':['Xe đạp cao cấp dành cho mọi tay đua. Từ đi lại hằng ngày trong thành phố đến những chuyến phiêu lưu cuối tuần, hãy tìm khung xe, kích thước và linh kiện phù hợp để luôn vững bánh.','为各种骑行者打造的高品质自行车。从城市日常通勤到周末越野探险，找到合适的车架、尺寸和配件，让骑行一路顺畅。'],'Shop Now':['Mua ngay','立即购买'],'Explore':['Khám phá','探索'],

			'Built with excellent components.':['Được chế tạo từ linh kiện chất lượng cao.','采用优质组件打造。'],'Every frame is tested for strength and comfort, paired with trusted gearing and brakes so you can ride with confidence, mile after mile.':['Mỗi khung xe đều được kiểm tra độ bền và sự thoải mái, kết hợp cùng bộ truyền động và phanh đáng tin cậy để bạn tự tin trên mọi hành trình.','每个车架都经过强度与舒适性测试，并配备可靠的变速和刹车系统，让您一路安心骑行。'],

			'Why Choose Us':['Vì sao chọn chúng tôi','为什么选择我们'],'From first-time riders to seasoned cyclists, we help you find a bike that fits your body, your budget, and the roads you love.':['Dù mới bắt đầu hay đã giàu kinh nghiệm, chúng tôi giúp bạn tìm chiếc xe phù hợp với vóc dáng, ngân sách và cung đường yêu thích.','无论是新手还是资深骑手，我们都会帮您找到适合身形、预算和喜爱路线的自行车。'],'Fast & Free Shipping':['Giao hàng nhanh và miễn phí','快速免费配送'],'Easy to Shop':['Dễ dàng mua sắm','轻松选购'],'24/7 Support':['Hỗ trợ 24/7','全天候支持'],'Hassle Free Returns':['Đổi trả dễ dàng','无忧退换'],

			'We Help You Find Your Perfect Ride':['Chúng tôi giúp bạn tìm chiếc xe hoàn hảo','助您找到理想座驾'],'Free professional bike fitting':['Căn chỉnh xe chuyên nghiệp miễn phí','免费专业车辆适配'],'Certified mechanics on every build':['Kỹ thuật viên chứng nhận cho mọi chiếc xe','每辆车均由认证技师组装'],'Genuine components and warranty':['Linh kiện chính hãng và bảo hành','正品配件与保修'],'Ongoing maintenance and tune-ups':['Bảo dưỡng và hiệu chỉnh định kỳ','持续保养与调校'],'Find your ride':['Tìm chiếc xe của bạn','寻找您的座驾'],'Choose what moves you':['Chọn phong cách phù hợp với bạn','选择令您心动的骑行方式'],

			'Urban':['Đô thị','城市'],'Road':['Đường trường','公路'],'Gravel':['Đường hỗn hợp','砾石路'],'Comfortable. Practical. Everyday.':['Thoải mái. Tiện dụng. Mỗi ngày.','舒适、实用，适合日常。'],'Speed. Efficiency. Performance.':['Tốc độ. Hiệu quả. Hiệu năng.','速度、效率、性能。'],'Versatile. Capable. Go beyond.':['Linh hoạt. Mạnh mẽ. Vượt giới hạn.','多功能、强悍，突破边界。'],'Tough. Confident. All terrain.':['Bền bỉ. Tự tin. Mọi địa hình.','坚固、自信，全地形适用。'],

			'Ride with confidence':['Tự tin trên mọi hành trình','自信骑行'],'Quality you can feel, journeys you can trust.':['Chất lượng bạn có thể cảm nhận, hành trình bạn có thể tin tưởng.','看得见的品质，值得信赖的旅程。'],'Countries':['Quốc gia','国家'],'Frame Warranty':['Bảo hành khung','车架保修'],'Happy Riders':['Khách hàng hài lòng','满意骑手'],'Stores & Partners':['Cửa hàng và đối tác','门店与合作伙伴'],'Recent Blog':['Bài viết mới','最新文章'],'View All Posts':['Xem tất cả bài viết','查看全部文章'],

			'Copyright ©':['Bản quyền ©','版权所有 ©'],

			'Back to the collection':['Quay lại bộ sưu tập','返回系列'],'Technical specifications':['Thông số kỹ thuật','技术参数'],'Premium bicycle designed by Abraham for confident everyday riding.':['Xe đạp cao cấp do Abraham thiết kế, giúp bạn tự tin trên mọi hành trình hằng ngày.','Abraham 设计的高品质自行车，让日常骑行更加自信。'],'Abraham Collection':['Bộ sưu tập Abraham','Abraham 系列'],'Designed for a variety of riding needs.':['Được thiết kế cho nhiều nhu cầu đạp xe.','满足多种骑行需求。'],'Technical support':['Hỗ trợ kỹ thuật','技术支持'],'Expert advice on choosing and maintaining your bike.':['Tư vấn chuyên sâu về lựa chọn và bảo dưỡng xe.','提供选车与保养方面的专业建议。'],'After-sales support':['Hỗ trợ sau bán hàng','售后支持'],'Contact the Abraham team whenever you need help.':['Liên hệ đội ngũ Abraham bất cứ khi nào bạn cần hỗ trợ.','需要帮助时可随时联系 Abraham 团队。'],'Add to order':['Thêm vào đơn hàng','加入订单'],'Explore more bikes':['Khám phá thêm xe đạp','探索更多自行车'],'Related products':['Sản phẩm liên quan','相关产品'],'Subscribe to Newsletter':['Đăng ký nhận bản tin','订阅资讯'],'Premium Bicycles':['Xe đạp cao cấp','高品质自行车'],'Explore All Bikes':['Khám phá tất cả xe đạp','探索全部自行车'],

			'Frame':['Khung sườn','车架'],'Handlebar':['Ghi đông','车把'],'Brakes':['Phanh','刹车'],'Bottom bracket':['Trục giữa','中轴'],'Fork':['Phuộc','前叉'],'Crankset':['Giò đĩa','曲柄组'],'Chainring':['Đĩa xích','牙盘'],'Rims':['Vành xe','轮圈'],'Tires':['Lốp xe','轮胎'],'Basket':['Giỏ xe','车篮'],'Paint finish':['Lớp sơn','涂装'],'Packaging':['Quy cách đóng gói','包装'],'Steel':['Thép','钢'],'Aluminum':['Nhôm','铝'],'Flat handlebar':['Ghi đông ngang','平把'],'Suspension fork':['Phuộc nhún','避震前叉'],'Steel basket':['Giỏ thép','钢制车篮'],

			'Controller Parts':['Phụ tùng bộ điều khiển','控制器配件'],'E-bike Parts':['Phụ tùng xe đạp điện','电动自行车配件'],'View details':['Xem chi tiết','查看详情'],

			'Discover our high-quality bicycles, designed for':['Khám phá những chiếc xe đạp chất lượng cao, được thiết kế cho','探索高品质自行车，专为'],'a better and more active lifestyle.':['một lối sống năng động và tốt đẹp hơn.','更美好、更积极的生活方式而打造。'],

			'Discover our high-quality bicycles, designed for a better and more active lifestyle.':['Khám phá những chiếc xe đạp chất lượng cao, được thiết kế cho lối sống năng động và tốt đẹp hơn.','探索高品质自行车，为更美好、更积极的生活方式而设计。'],'Search':['Tìm kiếm','搜索'],'All':['Tất cả','全部'],'Categories':['Danh mục','分类'],'Availability':['Tình trạng hàng','库存状态'],'Price range':['Khoảng giá','价格范围'],'Min':['Tối thiểu','最低'],'Max':['Tối đa','最高'],'Apply filters':['Áp dụng bộ lọc','应用筛选'],'Reset filters':['Đặt lại bộ lọc','重置筛选'],'products':['sản phẩm','件商品'],'Sort by:':['Sắp xếp theo:','排序：'],'Newest':['Mới nhất','最新'],'Oldest':['Cũ nhất','最早'],'Price: Low to High':['Giá: Thấp đến cao','价格：从低到高'],'Price: High to Low':['Giá: Cao đến thấp','价格：从高到低'],'Product image coming soon':['Hình ảnh sản phẩm sắp được cập nhật','产品图片即将更新'],'Contact us for product details':['Liên hệ với chúng tôi để biết chi tiết sản phẩm','联系我们了解产品详情'],'Add to cart':['Thêm vào giỏ hàng','加入购物车'],'Out of stock':['Hết hàng','缺货'],'In stock':['Còn hàng','有货'],'Bicycle Parts':['Phụ tùng xe đạp','自行车配件'],'Bikes':['Xe đạp','自行车'],'Electric Bikes':['Xe đạp điện','电动自行车'],'Merchandise':['Hàng hóa','商品'],'Filter':['Bộ lọc','筛选'],'Clear filters':['Xóa bộ lọc','清除筛选'],'No products found':['Không tìm thấy sản phẩm','未找到商品'],

			'About Abraham':['Về Abraham','关于 Abraham'],'Our Story':['Câu chuyện của chúng tôi','我们的故事'],'Our Mission':['Sứ mệnh của chúng tôi','我们的使命'],'Our Vision':['Tầm nhìn của chúng tôi','我们的愿景'],'Meet Our Team':['Gặp gỡ đội ngũ','认识我们的团队'],'Learn More':['Tìm hiểu thêm','了解更多'],'Get in touch':['Liên hệ với chúng tôi','联系我们'],'Send Message':['Gửi tin nhắn','发送消息'],'Name':['Họ tên','姓名'],'Message':['Nội dung','留言'],'Subject':['Chủ đề','主题'],'Phone':['Điện thoại','电话'],'Address':['Địa chỉ','地址'],

			'Our Services':['Dịch vụ của chúng tôi','我们的服务'],'Bike Repair':['Sửa chữa xe đạp','自行车维修'],'Bike Maintenance':['Bảo dưỡng xe đạp','自行车保养'],'Bike Fitting':['Căn chỉnh xe đạp','自行车适配'],'Book a Service':['Đặt lịch dịch vụ','预约服务'],'Read More':['Đọc thêm','阅读更多'],'Latest News':['Tin mới nhất','最新资讯'],'Continue Reading':['Đọc tiếp','继续阅读'],

			'Shopping Cart':['Giỏ hàng','购物车'],'Cart':['Giỏ hàng','购物车'],'Product':['Sản phẩm','商品'],'Price':['Giá','价格'],'Quantity':['Số lượng','数量'],'Total':['Tổng cộng','合计'],'Remove':['Xóa','移除'],'Continue Shopping':['Tiếp tục mua sắm','继续购物'],'Proceed to Checkout':['Tiến hành thanh toán','去结算'],'Cart Totals':['Tổng giỏ hàng','购物车合计'],'Subtotal':['Tạm tính','小计'],'Your cart is empty':['Giỏ hàng của bạn đang trống','您的购物车是空的'],

			'Checkout':['Thanh toán','结算'],'Billing Details':['Thông tin thanh toán','账单信息'],'First Name':['Tên','名'],'Last Name':['Họ','姓'],'Country':['Quốc gia','国家'],'Province':['Tỉnh/Thành phố','省/市'],'Postal / Zip':['Mã bưu chính','邮政编码'],'Order Notes':['Ghi chú đơn hàng','订单备注'],'Your Order':['Đơn hàng của bạn','您的订单'],'Place Order':['Đặt hàng','提交订单'],'Thank you!':['Cảm ơn bạn!','谢谢！'],'Your order was successfully completed.':['Đơn hàng của bạn đã được hoàn tất.','您的订单已成功完成。'],'Back to shop':['Quay lại cửa hàng','返回商店'],'Order history':['Lịch sử đơn hàng','订单记录'],'No orders yet':['Chưa có đơn hàng','暂无订单'],'Loading your orders...':['Đang tải đơn hàng...','正在加载订单……'],

			'Quality bicycles and dedicated support for every ride.':['Xe đạp chất lượng cùng dịch vụ hỗ trợ tận tâm trên mọi hành trình.','优质自行车，为每段旅程提供贴心支持。'],'Company':['Công ty','公司'],'Support':['Hỗ trợ','支持'],'Knowledge base':['Kho kiến thức','知识库'],'Live chat':['Trò chuyện trực tuyến','在线聊天'],'About':['Thông tin','关于我们'],'Jobs':['Tuyển dụng','招聘'],'Our team':['Đội ngũ của chúng tôi','我们的团队'],'Leadership':['Ban lãnh đạo','管理团队'],'Privacy Policy':['Chính sách bảo mật','隐私政策'],'Featured Products':['Sản phẩm nổi bật','精选产品'],'Nordic Road Bike':['Xe đạp đường trường Nordic','Nordic 公路自行车'],'Kruzo Aero Bike':['Xe đạp khí động học Kruzo','Kruzo 气动自行车'],'Urban Cruiser Bike':['Xe đạp đô thị Urban Cruiser','Urban Cruiser 城市自行车'],'Terms & Conditions':['Điều khoản và điều kiện','条款与条件'],'. All Rights Reserved. — Abraham. Template adapted from':['. Bảo lưu mọi quyền. — Abraham. Giao diện được điều chỉnh từ','. 版权所有。— Abraham。模板改编自'],'Distributed By':['Phân phối bởi','发行方'],'Email':['Email','电子邮箱'],'Password':['Mật khẩu','密码'],"Don't have an account?":['Chưa có tài khoản?','还没有账户？'],'Sign up now':['Đăng ký ngay','立即注册']

		};

		Object.assign(translations, pageTranslations);
        Object.assign(translations, window.AbrahamShopTranslations || {});
        Object.assign(translations, window.AbrahamCartTranslations || {});
        Object.assign(translations, {
            'Children’s bikes': ['Xe đạp trẻ em', '儿童自行车'],
            'City bikes (City)': ['Xe đạp thành phố (City)', '城市自行车 (City)'],
            'Mountain bikes (MTB)': ['Xe đạp địa hình (MTB)', '山地自行车 (MTB)'],
            'Touring bikes': ['Xe đạp Touring', '旅行自行车'],
            'Road bikes': ['Xe đạp Road', '公路自行车'],
            'Folding bikes': ['Xe đạp gấp', '折叠自行车'],
            'Parts': ['Phụ tùng', '配件'],
            'Bicycle parts': ['Phụ tùng xe đạp', '自行车配件'],
            'E-bike parts': ['Phụ tùng xe đạp điện', '电动自行车配件'],
            'Three values we uphold': ['Ba điều chúng tôi giữ vững', '我们坚持的三项价值'],
            'Why Abraham?': ['Vì sao là Abraham?', '为什么选择 Abraham？'],
            'Integrity': ['Trung thực', '诚信'],
            'Reliability': ['Tin cậy', '可靠'],
            'Dedication': ['Tận tâm', '用心'],
            'Learn more about Abraham →': ['Tìm hiểu thêm về Abraham →', '了解更多 Abraham →']
        });
		var originalText = new WeakMap();
        var originalAttributes = new WeakMap();
        var renderedText = new WeakMap();
		var translateString = function(source, index) {

            var content = window.AbrahamContentTranslations || {};
            var normalized = source.replace(/\s+/g, ' ').trim();
            var itemCount = normalized.match(/^(\d+) items?$/);
            if (itemCount) return index === 0 ? itemCount[1] + ' sản phẩm' : index === 1 ? itemCount[1] + ' 件商品' : normalized;
            var quantityLabel = normalized.match(/^Quantity:\s*(\d+)$/);
            if (quantityLabel) return (index === 0 ? 'Số lượng: ' : index === 1 ? '数量：' : 'Quantity: ') + quantityLabel[1];
            if (Object.prototype.hasOwnProperty.call(content, normalized)) {
                return (source.match(/^\s*/) || [''])[0]
                    + (index === 0 ? normalized : content[normalized][index === 1 ? 1 : 0])
                    + (source.match(/\s*$/) || [''])[0];
            }
            var variants = normalized.match(/^(\d+) màu$/);
            if (variants) return index === 0 ? source : variants[1] + (index === 1 ? ' 种颜色' : ' colors');
			var key = source.replace(/\s+/g, ' ').trim(), translated = translations[key];

			/* Some redesigned pages use Vietnamese directly in the markup. Resolve

			   those labels back to their English key so every language remains usable. */

			if (!translated) {

				Object.keys(translations).some(function(englishKey) {

					var values = translations[englishKey];

					if (values[0] === key || values[1] === key) {

						translated = values;

						key = englishKey;

						return true;

					}

					return false;

				});

			}

			if (translated) {

				var leading = (source.match(/^\s*/) || [''])[0];

				var trailing = (source.match(/\s*$/) || [''])[0];

				return leading + (index === -1 ? key : translated[index]) + trailing;

			}

			var size = key.match(/^(\d+|700C)-inch Bikes$/i) || key.match(/^(700C) Bikes$/i);

            var vietnameseSize = key.match(/^Xe đạp (12|14|16|18|20) inch$/);
            var childCategory = key.match(/^Xe đạp (12|14|16|18|20) inch\s*\((\d+)-(\d+) tuổi\)$/);
            if (childCategory) return index === -1 ? childCategory[1] + '-inch Bikes (' + childCategory[2] + '-' + childCategory[3] + ' years)' : index === 1 ? childCategory[1] + '英寸自行车 (' + childCategory[2] + '-' + childCategory[3] + ' 岁)' : key;
            if (vietnameseSize) return index === -1 ? vietnameseSize[1] + '-inch Bikes' : index === 1 ? vietnameseSize[1] + ' 英寸自行车' : key;
            var age = key.match(/^\((\d+)-(\d+) tuổi\)$/);
            if (age) return index === -1 ? '(' + age[1] + '-' + age[2] + ' years)' : index === 1 ? '(' + age[1] + '-' + age[2] + ' 岁)' : key;
			if (size) return index === -1 ? key : index === 0 ? 'Xe đạp ' + size[1] + ' inch' : size[1] + ' 英寸自行车';
			var count = key.match(/^(\d+) products$/i);

			if (count) return index === -1 ? key : index === 0 ? count[1] + ' sản phẩm' : count[1] + ' 件商品';
            var results = key.match(/^(\d+) products\. In stock only\.$/);
            if (results) return index === -1 ? key : index === 0 ? results[1] + ' sản phẩm. Chỉ hiển thị hàng còn tồn.' : results[1] + ' 件商品。仅显示有货商品。';
            var page = key.match(/^Page (\d+)$/);
            if (page) return index === -1 ? key : (index === 0 ? 'Trang ' : '第 ') + page[1] + (index === 1 ? ' 页' : '');
            var added = key.match(/^(.*?) added to your cart\.$/);
            if (added) return index === -1 ? key : index === 0 ? added[1] + ' đã được thêm vào giỏ hàng.' : added[1] + ' 已加入购物车。';
			return source;

		};

		var translateContent = function(code, root) {

			var index = code === 'vi' ? 0 : code === 'zh' ? 1 : -1;

			var walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT);

			var node;

			while ((node = walker.nextNode())) {

				if (!node.parentElement || node.parentElement.closest('.notranslate,script,style')) continue;

				if (!originalText.has(node) || (renderedText.has(node) && node.nodeValue !== renderedText.get(node))) originalText.set(node, node.nodeValue);
				var source = originalText.get(node);

				var translated = translateString(source, index);
                if (node.nodeValue !== translated) node.nodeValue = translated;
                renderedText.set(node, translated);
			}

			(root || document.body).querySelectorAll('[placeholder]').forEach(function(element) {
				if (!element.dataset.i18nPlaceholder) element.dataset.i18nPlaceholder = element.getAttribute('placeholder');

				var source = element.dataset.i18nPlaceholder;

				var placeholders = {'Search products...':['Tìm kiếm sản phẩm...','搜索商品……'],'Enter your name':['Nhập tên của bạn','输入您的姓名'],'Enter your email':['Nhập email của bạn','输入您的邮箱'],'Write your message...':['Nhập nội dung tin nhắn...','请输入留言……'],'Tell us about your bike and what it needs...':['Hãy cho chúng tôi biết tình trạng và nhu cầu của chiếc xe...','请告诉我们您的自行车情况和所需服务……']};

				Object.keys(placeholders).some(function(key) { if (placeholders[key].includes(source)) { source = key; return true; } return false; });
                element.setAttribute('placeholder', placeholders[source] ? (index >= 0 ? placeholders[source][index] : source) : translateString(source, index));
			});
            (root || document.body).querySelectorAll('[aria-label],[title]').forEach(function(element) {
                if (element.closest('.notranslate')) return;
                if (!originalAttributes.has(element)) originalAttributes.set(element, {});
                var attributes = originalAttributes.get(element);
                ['aria-label', 'title'].forEach(function(attribute) {
                    if (!element.hasAttribute(attribute)) return;
                    if (!(attribute in attributes)) attributes[attribute] = element.getAttribute(attribute);
                    element.setAttribute(attribute, translateString(attributes[attribute], index));
                });
            });
		};

		var activeLanguage = 'en';

		var observer = new MutationObserver(function(records) {

			records.forEach(function(record) {
                if (record.type === 'characterData') {
                    if (renderedText.get(record.target) === record.target.nodeValue) return;
                    originalText.set(record.target, record.target.nodeValue);
                    if (record.target.parentElement) translateContent(activeLanguage, record.target.parentElement);
                    return;
                }
				record.addedNodes.forEach(function(node) {

					if (node.nodeType === 1) translateContent(activeLanguage, node);

					else if (node.nodeType === 3 && node.parentElement) translateContent(activeLanguage, node.parentElement);

				});

			});

		});

		observer.observe(document.body, {childList:true, characterData:true, subtree:true});


		var applyLanguage = function(code) {

			var language = languages[code] || languages.en;

			document.documentElement.lang = code === 'zh' ? 'zh-CN' : code;

			picker.querySelector(nativePicker ? '.language-trigger img' : '.abx-language-flag').src = language.flag;

			picker.querySelector(nativePicker ? '.language-trigger span' : '.abx-language-name').textContent = language.name;

			picker.querySelector(nativePicker ? '.language-trigger' : '.abx-language-trigger').setAttribute('aria-label', language.label);

			picker.querySelectorAll('[data-language]').forEach(function(option) {

				var active = option.getAttribute('data-language') === code;

				option.classList.toggle('active', active);

				option.setAttribute('aria-current', active ? 'true' : 'false');

			});

			try { window.localStorage.setItem('abraham-language', code); } catch (error) {}

			activeLanguage = code;

			translateContent(code);

			document.querySelectorAll('img[src*="product-placeholder"]').forEach(function(image) {

				image.src = code === 'vi' ? '/images/product-placeholder-vi.svg' : code === 'zh' ? '/images/product-placeholder-zh.svg' : '/images/product-placeholder.svg';

			});

		};



		picker.addEventListener('click', function(event) {

			var option = event.target.closest('[data-language]');

			if (option) applyLanguage(option.getAttribute('data-language'));

		});

		window.addEventListener('abraham-language-change', function(event) { applyLanguage(event.detail.language); });
        var saved = 'vi';

		try { saved = window.localStorage.getItem('abraham-language') || 'vi'; } catch (error) {}

        window.AbrahamLanguage = { refresh: function(root) { translateContent(activeLanguage, root); } };
		applyLanguage(saved);
	};

	initLanguagePicker();
})();
