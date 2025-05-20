# Cơ Chế Bảo Mật Đã Triển Khai

## 1. XSS Protection (Cross-Site Scripting)

### Module: `lib/sanitize.js`
- **Loại bỏ HTML tags**: Hàm `stripHtmlTags()` loại bỏ tất cả HTML tags từ input
- **Escape HTML**: Hàm `escapeHtml()` chuyển đổi các ký tự đặc biệt thành entity codes
- **Sanitize username**: Hàm `sanitizeUsername()` chỉ cho phép ký tự an toàn (alphanumeric + một số ký tự đặc biệt)
- **Sanitize object**: Hàm `sanitizeObject()` làm sạch đệ quy cho các object phức tạp
- **Sanitize request**: Hàm `sanitizeRequest()` làm sạch toàn bộ req.body và req.query

### Áp dụng:
- Trang settings.js sanitize username: `const sanitizedValue = value.replace(/[^a-zA-Z0-9_\-\.]/g, '')`
- API login.js và register.js: `const sanitizedBody = sanitizeObject(req.body)`

## 2. CSRF Protection (Cross-Site Request Forgery)

### Module: `lib/csrf.js`
- **Tạo token**: Hàm `generateCSRFToken()` tạo token ngẫu nhiên bằng crypto
- **Lưu token**: Hàm `setCSRFToken()` lưu token vào HTTP-only cookie
- **Xác thực token**: Hàm `validateCSRFToken()` so sánh constant-time để tránh timing attacks
- **Middleware**: Hàm `csrfProtection()` để bọc API handlers

### Áp dụng:
- API login.js và register.js: `export default csrfProtection(loginHandler)`
- Trang settings.js: Thêm CSRF token vào form và gửi với request
- API CSRF token: `/api/csrf/token` để lấy token mới

## 3. Rate Limiting

### Module: `lib/middlewares/rateLimit.js`
- **Giới hạn requests**: Hàm `rateLimit()` giới hạn số request từ một IP
- **Login rate limit**: Hàm `loginRateLimit()` giới hạn chặt chẽ cho login (5 lần/5 phút)
- **Tích hợp Next.js**: Hàm `applyRateLimit()` để sử dụng trong API routes

### Áp dụng:
- API login.js: Rate limit 5 requests/5 phút
- API register.js: Rate limit 3 requests/giờ
- Headers: Thiết lập headers Retry-After, X-RateLimit-*

## 4. Chính Sách Mật Khẩu Mạnh

### Module: `lib/passwordValidator.js`
- **Kiểm tra mật khẩu**: Hàm `validatePasswordStrength()` với nhiều tiêu chí
- **Đánh giá điểm**: Hàm `passwordStrengthScore()` đánh giá độ mạnh từ 0-100
- **Danh sách mật khẩu phổ biến**: Kiểm tra mật khẩu không nằm trong danh sách phổ biến

### Áp dụng:
- API register.js: Yêu cầu mật khẩu mạnh
- API login.js: Cảnh báo khi mật khẩu yếu

## 5. Ghi Log Hoạt Động Bảo Mật

- API login.js: `logLoginActivity()` ghi log thành công/thất bại
- API register.js: Ghi log đăng ký 
- Lưu thông tin: timestamp, email, IP, user-agent, kết quả

## 6. Account Lockout

- API login.js: Khóa tài khoản tạm thời sau 5 lần đăng nhập thất bại
- Thời gian khóa: 15 phút
- Map `loginAttempts` để theo dõi số lần thất bại

## 7. Upload Bảo Mật

- Kiểm tra kích thước: Giới hạn 2MB thay vì 5MB
- Kiểm tra định dạng: Chỉ cho phép image/jpeg, image/png, image/gif, image/webp
- Đường dẫn an toàn: Sử dụng UUID cho tên file

## 8. Các Cải Tiến Khác

- JWT sử dụng expiresIn 1 giờ
- Escape đặc biệt cho output để ngăn XSS
- Đặt các headers bảo mật
- Cảnh báo khi sử dụng mật khẩu yếu

## Kiểm Tra Các Tính Năng Bảo Mật

### Kiểm tra CSRF Protection
1. Đăng nhập vào hệ thống
2. Mở DevTools > Application > Cookies
3. Quan sát cookie csrfToken đã được thiết lập
4. Thử submit form không có CSRF token → Sẽ bị từ chối

### Kiểm tra Rate Limiting
1. Đăng nhập sai liên tục 5 lần
2. Hệ thống sẽ hiển thị thông báo "Quá nhiều lần đăng nhập thất bại"
3. Tài khoản sẽ bị khóa tạm thời 15 phút

### Kiểm tra XSS Protection
1. Thử nhập username với HTML tags: `<script>alert('XSS')</script>`
2. Username sẽ được sanitize thành `scriptalertXSSscript`

### Kiểm tra Password Strength
1. Thử đăng ký với mật khẩu yếu: "123456"
2. Hệ thống sẽ từ chối và hiển thị các yêu cầu mật khẩu mạnh 



-----------------------------------------------------



Dưới đây là hướng dẫn test trực tiếp các cơ chế bảo mật trên giao diện TaskRiser:

## Khởi động ứng dụng (nếu chưa chạy)

```bash
npm run dev
```

## 1. Test XSS Protection

### Trên trang Đăng ký:
1. Truy cập http://localhost:3000/register
2. Nhập username chứa mã độc: `<script>alert('XSS')</script>`
3. Điền email và mật khẩu hợp lệ
4. Nhấn đăng ký
5. **Kết quả mong đợi**: Username sẽ được sanitize, không có cửa sổ alert hiện lên

### Trên trang Settings:
1. Đăng nhập vào hệ thống 
2. Truy cập http://localhost:3000/settings
3. Thay đổi username thành: `<img src="x" onerror="alert('XSS')">`
4. Nhấn cập nhật
5. **Kết quả mong đợi**: Hệ thống sẽ tự động lọc các ký tự không an toàn

## 2. Test CSRF Protection

1. Truy cập http://localhost:3000/settings
2. Mở Developer Tools (F12) > Application > Cookies
3. Tìm cookie tên `csrfToken`
4. Xóa cookie này
5. Thử cập nhật thông tin profile
6. **Kết quả mong đợi**: Request thất bại với thông báo lỗi CSRF

Hoặc tạo file HTML độc hại để test:

```html
<!DOCTYPE html>
<html>
<body>
<h1>CSRF Test Page</h1>
<form id="csrf-form" action="http://localhost:3000/api/users/update-profile" method="POST">
  <input type="hidden" name="username" value="hacked_by_csrf" />
  <button type="submit">Submit</button>
</form>
</body>
</html>
```

Lưu file này, mở trong trình duyệt và nhấn Submit khi đã đăng nhập vào TaskRiser ở tab khác. Request sẽ bị từ chối.

## 3. Test Password Policy 

### Trên trang Đăng ký:
1. Truy cập http://localhost:3000/register
2. Thử đăng ký với mật khẩu yếu lần lượt:
   - `123456`
   - `password`
   - `qwerty`
   - `abcdef`
3. **Kết quả mong đợi**: Hiện thông báo lỗi với yêu cầu cụ thể về độ mạnh mật khẩu
4. Thử với mật khẩu mạnh: `StrongP@ssword123`
5. **Kết quả mong đợi**: Đăng ký thành công

## 4. Test Rate Limiting

### Trên trang Đăng nhập:
1. Truy cập http://localhost:3000/login
2. Thử đăng nhập với email tồn tại nhưng mật khẩu sai liên tục 5 lần
3. **Kết quả mong đợi**: Sau lần thứ 5, bạn sẽ nhận được thông báo hạn chế đăng nhập
4. Mở Developer Tools > Network
5. Kiểm tra response headers của request cuối cùng, tìm các headers:
   - `X-RateLimit-Limit`
   - `X-RateLimit-Remaining`
   - `Retry-After`

## 5. Test Account Lockout

1. Truy cập http://localhost:3000/login
2. Thử đăng nhập với cùng một email nhưng mật khẩu sai liên tục nhiều lần (> 5 lần)
3. **Kết quả mong đợi**: Tài khoản bị khóa tạm thời, hiển thị thông báo cùng thời gian còn lại

## 6. Test Sanitize Upload File

1. Đăng nhập vào hệ thống
2. Truy cập http://localhost:3000/settings
3. Thử tải lên file với phần mở rộng không được phép (ví dụ: .exe, .php)
4. **Kết quả mong đợi**: Hệ thống từ chối với thông báo chỉ chấp nhận định dạng ảnh
5. Thử tải lên file ảnh lớn hơn 2MB
6. **Kết quả mong đợi**: Hiển thị lỗi kích thước file quá lớn

## 7. Test Cross-Browser Cookies và Bảo mật

1. Đăng nhập vào hệ thống
2. Mở Developer Tools > Application > Cookies
3. Kiểm tra cookie `csrfToken` và `authToken` với các thuộc tính:
   - `HttpOnly`: Nên là `true` để ngăn JavaScript truy cập
   - `SameSite`: Nên là `Strict` hoặc `Lax` để chống CSRF
   - `Secure`: Nếu sử dụng HTTPS (nếu được cấu hình)

## 8. Test XSS Output Escaping

1. Đăng nhập với tài khoản có username đã được tạo với ký tự đặc biệt
2. Kiểm tra xem username được hiển thị trên UI có bị escape đúng cách không
3. **Kiểm tra**: Xem mã nguồn trang (View Source) và xác nhận rằng các ký tự đặc biệt được escape thành entity codes (ví dụ: `&lt;` thay vì `<`)

## 9. Test Weak Password Warnings

1. Đăng nhập với mật khẩu yếu (nếu có tài khoản với mật khẩu yếu)
2. **Kết quả mong đợi**: Hệ thống hiển thị cảnh báo về mật khẩu yếu sau khi đăng nhập thành công

## Các điểm cần chú ý khi demo

1. **Developer Tools là công cụ quan trọng**: Sử dụng các tab Network, Console, Application để theo dõi requests, cookies và phản hồi từ server.

2. **Chụp ảnh màn hình**: Chụp lại các bước quan trọng và kết quả để ghi lại quá trình kiểm tra.

3. **Giải thích các cơ chế**: Khi demo, hãy giải thích cơ chế bảo mật đang hoạt động đằng sau mỗi tính năng.

4. **Chứng minh trước/sau**: Nếu có thể, tắt tạm thời một số cơ chế bảo mật để cho thấy sự khác biệt khi không có bảo vệ.

Những bài kiểm tra này sẽ giúp bạn chứng minh các lớp bảo mật đã được triển khai hiệu quả trong ứng dụng TaskRiser.
