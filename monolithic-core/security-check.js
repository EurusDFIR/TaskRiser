// Script kiểm tra các tính năng bảo mật đã triển khai

// Thử đăng nhập
async function testLogin(email, password) {
    try {
        console.log(`\n=== KIỂM TRA ĐĂNG NHẬP === (${email}, ${password})`);
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log(`Trạng thái: ${response.status} ${response.statusText}`);
        console.log('Kết quả:', data);

        return {
            success: response.ok,
            token: data.token,
            headers: Object.fromEntries(response.headers.entries()),
            user: data.user
        };
    } catch (error) {
        console.error('Lỗi kiểm tra đăng nhập:', error.message);
        return { success: false };
    }
}

// Kiểm tra XSS - Thử đăng ký username với mã độc
async function testXSS() {
    console.log('\n=== KIỂM TRA XSS PROTECTION ===');
    const maliciousUsername = '<script>alert("XSS")</script>';
    console.log(`Thử đăng ký với username độc hại: ${maliciousUsername}`);

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: maliciousUsername,
                email: 'xss_test@example.com',
                password: 'StrongP@ssword123', // Mật khẩu mạnh đáp ứng các yêu cầu
            }),
        });

        const data = await response.json();
        console.log(`Trạng thái: ${response.status} ${response.statusText}`);
        console.log('Kết quả:', data);

        // Kiểm tra nếu username được sanitize hay không
        if (data.user && data.user.username) {
            console.log(`Username được lưu: "${data.user.username}"`);
            console.log(`XSS Protection: ${data.user.username !== maliciousUsername ? 'THÀNH CÔNG' : 'THẤT BẠI'}`);
        } else {
            console.log('Không thể xác minh XSS protection - đăng ký thất bại');
        }
    } catch (error) {
        console.error('Lỗi kiểm tra XSS:', error.message);
    }
}

// Kiểm tra Rate Limiting - Thử đăng nhập sai nhiều lần
async function testRateLimiting() {
    console.log('\n=== KIỂM TRA RATE LIMITING ===');
    const attempts = 6; // Vượt quá ngưỡng 5 lần

    console.log(`Thử đăng nhập sai ${attempts} lần với email: rate_limited@example.com`);

    for (let i = 0; i < attempts; i++) {
        console.log(`\nLần thử #${i + 1}:`);
        const result = await testLogin('rate_limited@example.com', 'wrong_password');

        // Kiểm tra các headers rate limit
        if (result.headers['x-ratelimit-limit']) {
            console.log(`Rate Limit: ${result.headers['x-ratelimit-limit']}`);
            console.log(`Remaining: ${result.headers['x-ratelimit-remaining']}`);
            console.log(`Reset: ${result.headers['x-ratelimit-reset']}`);
        }

        // Nếu bị khóa (429 Too Many Requests)
        if (!result.success && result.headers['retry-after']) {
            console.log(`Rate Limiting KÍCH HOẠT - Thử lại sau: ${result.headers['retry-after']} giây`);
            break; // Dừng vòng lặp khi đã bị rate limit
        }
    }
}

// Kiểm tra chính sách mật khẩu
async function testPasswordPolicy() {
    console.log('\n=== KIỂM TRA CHÍNH SÁCH MẬT KHẨU ===');
    const weakPasswords = [
        'password',
        '123456',
        'abcdef',
        'qwerty',
        'abc123'
    ];

    // Test mật khẩu yếu
    for (const weakPassword of weakPasswords) {
        console.log(`\nKiểm tra mật khẩu yếu: "${weakPassword}"`);

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'password_test_user',
                    email: `password_test_${Date.now()}@example.com`,
                    password: weakPassword,
                }),
            });

            const data = await response.json();
            console.log(`Trạng thái: ${response.status} ${response.statusText}`);

            if (!response.ok && data.errors) {
                console.log('Lỗi mật khẩu yếu được phát hiện:');
                data.errors.forEach(error => console.log(`- ${error}`));
            } else {
                console.log('Kết quả:', data.message || data);
            }
        } catch (error) {
            console.error('Lỗi kiểm tra mật khẩu:', error.message);
        }
    }

    // Test mật khẩu mạnh
    console.log('\nKiểm tra mật khẩu mạnh: "StrongP@ssword123"');
    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'strong_password_user',
                email: `strong_password_${Date.now()}@example.com`,
                password: 'StrongP@ssword123',
            }),
        });

        const data = await response.json();
        console.log(`Trạng thái: ${response.status} ${response.statusText}`);
        console.log('Kết quả:', data.message || data);
    } catch (error) {
        console.error('Lỗi kiểm tra mật khẩu mạnh:', error.message);
    }
}

// Kiểm tra CSRF Protection
async function testCSRF() {
    console.log('\n=== KIỂM TRA CSRF PROTECTION ===');

    // 1. Đăng nhập hợp lệ để lấy cookie
    console.log('1. Đăng nhập hợp lệ để lấy cookie và token:');
    const loginResult = await testLogin('test@example.com', 'password123');

    if (!loginResult.success) {
        console.log('Không thể đăng nhập để thử CSRF protection');
        return;
    }

    // 2. Thử gửi request POST không có CSRF token
    console.log('\n2. Gửi request cập nhật profile không có CSRF token:');
    try {
        const response = await fetch('http://localhost:3000/api/users/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginResult.token}`,
                // Không gửi CSRF token
            },
            body: JSON.stringify({
                username: 'csrf_test_user',
            }),
        });

        const data = await response.json();
        console.log(`Trạng thái: ${response.status} ${response.statusText}`);
        console.log('Kết quả:', data.message || data);

        if (response.status === 403 && data.message?.includes('CSRF')) {
            console.log('CSRF Protection KÍCH HOẠT thành công!');
        } else {
            console.log('CSRF Protection có thể không hoạt động đúng!');
        }
    } catch (error) {
        console.error('Lỗi kiểm tra CSRF:', error.message);
    }
}

// Chạy tất cả các kiểm tra
async function runAllTests() {
    console.log('===== KIỂM TRA BẢO MẬT TASKSRISER =====');
    console.log('Chạy các kiểm tra bảo mật trên hệ thống...\n');

    // Test đăng nhập bình thường
    await testLogin('test@example.com', 'password123');

    // Test XSS Protection
    await testXSS();

    // Test Rate Limiting
    await testRateLimiting();

    // Test Password Policy
    await testPasswordPolicy();

    // Test CSRF Protection
    await testCSRF();

    console.log('\n===== KẾT THÚC KIỂM TRA BẢO MẬT =====');
}

// Chạy tất cả các kiểm tra
runAllTests(); 