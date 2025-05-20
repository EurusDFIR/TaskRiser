const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

console.log('\n===== BÁOCÁO PHÂN TÍCH BẢO MẬT HỆ THỐNG TASK RISER =====\n');

// Test 1: JWT token forgery attack
console.log('=== Test 1: JWT Token Forgery ===');
const SECRET = 'leaked-secret-key'; // Giả sử bị lộ secret
try {
    // Tạo một token giả với quyền admin
    const forgedToken = jwt.sign(
        { userId: '1', username: 'admin', email: 'admin@example.com', role: 'admin' },
        SECRET,
        { expiresIn: '1h' }
    );
    console.log('Forged JWT token:', forgedToken);
    console.log('Tấn công: Token giả này có thể được sử dụng để truy cập các routes được bảo vệ');
    console.log('Nguy cơ: Nếu JWT_SECRET bị lộ, attacker có thể tạo token với bất kỳ quyền hạn nào');
} catch (e) {
    console.error('JWT Error:', e.message);
}

// Test 2: Password strength test
console.log('\n=== Test 2: Password Strength ===');

// if (password.length < 6) {
//   return res.status(400).json({ message: 'Password must be at least 6 characters long' });
// }
const weakPasswords = [
    '123456',     // 123456 - mật khẩu yếu phổ biến nhất
    'qwerty',     // qwerty - mật khẩu yếu phổ biến
    'password',   // mật khẩu từ điển 
    'abcdef'      // chỉ chứa ký tự thường
];

console.log('Kiểm tra các mật khẩu yếu nhưng vẫn vượt qua validation:');
weakPasswords.forEach(password => {
    console.log(`Mật khẩu "${password}" được chấp nhận (>= 6 ký tự): ${password.length >= 6}`);
});
console.log('Nguy cơ: Hệ thống chỉ kiểm tra độ dài mật khẩu mà không yêu cầu các ký tự đặc biệt, số, chữ hoa');

// Test 3: Hash time for passwords (security vs performance)
console.log('\n=== Test 3: Password Hashing Performance ===');
async function testBcrypt() {
    const password = 'testPassword123';
    console.time('Hash generation');
    const salt = await bcrypt.genSalt(10); // 10 rounds in code
    const hash = await bcrypt.hash(password, salt);
    console.timeEnd('Hash generation');

    console.time('Hash verification');
    const match = await bcrypt.compare(password, hash);
    console.timeEnd('Hash verification');
    console.log('Kết quả xác thực mật khẩu:', match ? 'Đúng' : 'Sai');
    console.log('Đánh giá: Sử dụng bcrypt với 10 rounds là hợp lý cho bảo mật/hiệu suất');
}

// Test 4: XSS Vulnerability Test
console.log('\n=== Test 4: XSS Vulnerability Demo ===');
// Phân tích pages/settings.js để tìm lỗ hổng XSS tiềm ẩn
console.log('XSS Vector 1: Reflected XSS qua User Profile');
const maliciousUsername = '<img src="x" onerror="alert(\'XSS Attack\')">';
console.log('Username độc hại:', maliciousUsername);
console.log('Nguy cơ: Không thấy sanitization rõ ràng với username trong settings.js trước khi hiển thị');
console.log('Tình huống tấn công:');
console.log('1. Attacker tạo tài khoản với username chứa mã JS độc hại');
console.log('2. Khi admin xem danh sách users, mã JS sẽ thực thi trong context của admin');
console.log('3. Có thể đánh cắp cookies, tokens hoặc thực hiện các hành động với quyền admin');

// Test 5: CSRF Vulnerability Demo
console.log('\n=== Test 5: CSRF Vulnerability Demo ===');
console.log('CSRF Attack Vector: Cập nhật profile không có CSRF token');
console.log('Form độc hại có thể được đặt trên website của attacker:');
console.log(`
<html>
  <body>
    <h1>You Won a Prize!</h1>
    <form id="csrf-form" action="http://localhost:3000/api/users/update-profile" method="POST" enctype="multipart/form-data">
      <input type="hidden" name="username" value="hacked_by_csrf" />
    </form>
    <script>
      document.getElementById("csrf-form").submit();
    </script>
  </body>
</html>
`);
console.log('Nguy cơ: API routes không kiểm tra CSRF token');
console.log('Tình huống tấn công:');
console.log('1. Người dùng đăng nhập vào TaskRiser và có session hợp lệ');
console.log('2. Người dùng truy cập trang web độc hại trong cùng trình duyệt');
console.log('3. Request từ form ẩn được gửi kèm cookie xác thực của người dùng');
console.log('4. Server thực hiện hành động thay đổi username mà không biết đây là request giả mạo');

// Call test function for bcrypt
testBcrypt().then(() => {
    // Test 6: Sensitive Data Exposure
    console.log('\n=== Test 6: Sensitive Data Exposure ===');
    console.log('Prisma schema User model:');
    console.log(`
  model User {
    id            String    @id @default(cuid())
    username      String    @unique
    email         String    @unique
    passwordHash  String?   // Properly stored as hash
    provider      String    @default("local")
    providerId    String?
    avatar        String?
    totalExp      Int       @default(0)
    ...
  }`);
    console.log('Đánh giá: passwordHash được lưu trữ đúng cách, không lưu ở dạng plaintext');
    console.log('Tuy nhiên:');

    // Test 7: .env file security
    console.log('\n=== Test 7: Environment Variables Security ===');
    console.log('Phát hiện thông tin nhạy cảm trong .env:');
    console.log('- DATABASE_URL với mật khẩu plaintext: "postgresql://postgres:eurus@localhost:5432/taskRiser"');
    console.log('- JWT_SECRET bị lộ, một phần của chuỗi: "c07b94d965ca7d19562c5e87ce5f91c6e86602fa60a65..."');
    console.log('- GOOGLE_CLIENT_SECRET bị lộ: "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"');
    console.log('Nguy cơ: Các thông tin này có thể bị lộ nếu đã commit vào git repository.');
    console.log('Hậu quả: Attacker có thể truy cập database, giả mạo JWT tokens, hoặc sử dụng OAuth credentials');

    // Test 8: Missing security features
    console.log('\n=== Test 8: Thiếu Các Tính Năng Bảo Mật Quan Trọng ===');
    console.log('- Không có chức năng đặt lại mật khẩu (password reset)');
    console.log('- Không có giới hạn số lần đăng nhập sai (rate limiting)');
    console.log('- Không có bảo vệ CSRF rõ ràng');
    console.log('- Không thiết lập Content Security Policy headers để chống XSS');
    console.log('- Không giới hạn file size cho upload avatar (chỉ kiểm tra < 5MB - quá lớn)');

    // Test 9: Token expiration and revocation
    console.log('\n=== Test 9: Token Expiration và Revocation ===');
    console.log('JWT tokens được cấu hình hết hạn sau 1 giờ (expiresIn: \'1h\')');
    console.log('Vấn đề: Không có cơ chế thu hồi token nếu tài khoản bị xâm nhập');
    console.log('Tình huống nguy hiểm:');
    console.log('1. Attacker đánh cắp được JWT token hợp lệ của người dùng');
    console.log('2. Ngay cả khi người dùng đổi mật khẩu, token cũ vẫn có thể sử dụng được đến khi hết hạn');
    console.log('3. Không có cách nào để vô hiệu hóa token đã cấp, dù biết token đã bị đánh cắp');
    console.log('Giải pháp: Triển khai blacklist tokens hoặc sử dụng refresh token pattern');

    // Test 10: File Upload Vulnerability
    console.log('\n=== Test 10: File Upload Vulnerability ===');
    console.log('Hệ thống có chức năng upload avatar với kiểm tra:');
    console.log('- Giới hạn kích thước file < 5MB (quá lớn cho một avatar)');
    console.log('- Chỉ chấp nhận định dạng: image/jpeg, image/png, image/gif, image/webp');
    console.log('Vấn đề phát hiện:');
    console.log('1. Không có validation server-side về content-type thực sự của file');
    console.log('2. Sử dụng UUID cho tên file nhưng vẫn giữ extension của người dùng (có thể dẫn đến lỗ hổng)');
    console.log('3. Không có xử lý an toàn về path khi lưu file (tiềm ẩn path traversal)');
    console.log('Tấn công có thể:');
    console.log('- Upload file .php với MIME type giả mạo là image/jpeg');
    console.log('- Attacker gửi file .jpg với nội dung PHP thực thi server-side code');


}); 