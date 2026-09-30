# Đồng bộ tồn kho AMIS → website

## Quy tắc đã thống nhất

- Kho: **HCM 3**, chọn chính xác theo mã kho.
- Nguồn tồn: **`main_stock_quantity`**, giữ nguyên giá trị nguyên AMIS trả về, không trừ `amount_summary`, không dùng `order_quantity`.
- Khớp `product_code`/`inventory_item_code` của AMIS với `products.sku`. Bỏ khoảng trắng thừa và không phân biệt hoa/thường; không bỏ dấu hay đoán theo tên.
- Chỉ cập nhật tồn và thời điểm đồng bộ của sản phẩm đã có. Không sửa ảnh, tên, giá; không tự thêm sản phẩm mới. Mã thiếu trong AMIS được giữ nguyên cùng mốc đồng bộ cũ, không tự đặt 0.
- Website nhận đơn nhưng **không trừ/giữ chỗ tồn**. Vì vậy nhiều đơn có thể cùng dựa vào một số tồn; việc xử lý thực tế thực hiện ở AMIS.
- Tồn đã nhập từ AMIS không sửa tay qua website. Trigger database bảo vệ số tồn; trang quản trị khóa ô tồn với các sản phẩm đã đồng bộ.

## Kích hoạt

1. Chạy các migration `001` đến `004` nếu database chưa có; sau đó chạy toàn bộ `migrations/005_amis_stock_source.sql` trong **Supabase → SQL Editor**. Migration 005 chạy trong một transaction và cập nhật hàm đặt hàng để không trừ tồn.
2. Đưa code, bao gồm `.github/workflows/sync-amis-stock.yml`, lên nhánh mặc định của repository GitHub.
3. Vào **Settings → Secrets and variables → Actions → Secrets**, thêm:
   - `AMIS_CLIENT_ID`
   - `AMIS_CLIENT_SECRET`
   - `DATABASE_URL`: URI PostgreSQL của Supabase, dùng kết nối trực tiếp hoặc **Session pooler**, có quyền cập nhật bảng `public.products`. Không dùng Transaction pooler vì tác vụ giữ advisory lock theo phiên kết nối. Nếu runner không kết nối IPv6 trực tiếp được, dùng Session pooler IPv4.
4. Vào **Actions → Sync AMIS inventory → Run workflow**, để `apply=false`. Xem báo cáo số SKU khớp, thay đổi và không khớp. Lỗi định dạng, thiếu trường số lượng, SKU trùng hoặc không có mã khớp sẽ dừng toàn bộ lượt chạy.
5. Chạy lại với `apply=true` để đồng bộ lần đầu, xác nhận tồn ở website khớp kho HCM 3.
6. Trong **Settings → Secrets and variables → Actions → Variables**, thêm `AMIS_SYNC_ENABLED=true`. Khi đó lịch chạy ở phút **07, 22, 37, 52 mỗi giờ** sẽ ghi tồn tự động. Đổi biến thành `false` để dừng lịch.

Khóa AMIS và mật khẩu database chỉ nằm trong Secrets, không đưa vào HTML/JavaScript trình duyệt hay commit lên Git. File `.env.example` chỉ liệt kê tên cấu hình; script đọc biến môi trường, không tự nạp `.env`.

## Vận hành

- Đây là ảnh chụp tồn theo lịch, không phải thời gian thực. Trang chi tiết hiển thị số tồn và thời điểm đồng bộ gần nhất.
- Mỗi lượt tải đủ các trang AMIS, kiểm tra toàn bộ dữ liệu rồi cập nhật trong một transaction. API lỗi không làm ghi dở hoặc đặt tồn bằng 0. Lỗi database rollback cả lượt.
- Có khóa chống hai tiến trình đồng bộ chồng nhau. Tất cả lượt chạy dùng cùng một database và kho.
- Báo cáo trong GitHub Actions chỉ có số lượng và mã kho, không in token hoặc phản hồi API nguyên văn.
- Endpoint và tên trường AMIS dựa theo code mẫu được cung cấp; cần lượt chạy thử với tài khoản thật để xác nhận quyền API và cấu trúc phản hồi thực tế.
- Lịch GitHub Actions có thể chạy trễ; repository công khai không hoạt động 60 ngày có thể bị tắt lịch. Xem [tài liệu schedule của GitHub](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

## Chạy từ máy chủ riêng

```sh
python -m pip install -r scripts/requirements-stock.txt
python scripts/sync_amis_stock.py          # Xem trước, không ghi
python scripts/sync_amis_stock.py --apply  # Ghi tồn từ AMIS
```

Đặt ba biến môi trường bí mật ở trên và `AMIS_STOCK_CODE=HCM 3`. Không lưu file chứa mật khẩu trong thư mục website đang phục vụ bằng HTTP.

## Kiểm tra

```sh
python -m unittest discover -s tests -p 'test_amis_stock.py' -v
node --test tests/checkout.test.cjs
```

Trước khi kích hoạt thật, kiểm tra một đơn thử trong môi trường thử nghiệm: số tồn trước/sau đặt đơn phải giữ nguyên. Các bài kiểm tra Python dùng phản hồi giả lập và không kết nối tài khoản AMIS/database thật.
