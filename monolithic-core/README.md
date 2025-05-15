# Task Dungeon (TaskRiser)

Task Dungeon là một ứng dụng quản lý nhiệm vụ (task/quest) gamification, sử dụng Next.js (Pages Router + App Router), Prisma, PostgreSQL, Tailwind CSS và React.

## Yêu cầu hệ thống

- Node.js >= 18
- npm >= 9
- PostgreSQL (hoặc dịch vụ cloud PostgreSQL)

## Hướng dẫn cài đặt và chạy dự án

### 1. Clone repository

```bash
git clone <repo-url>
cd monolithic-core
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env` ở thư mục gốc với nội dung mẫu:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your_jwt_secret"
```

- Thay các giá trị bằng thông tin kết nối PostgreSQL thật của bạn.

### 4. Khởi tạo database với Prisma

```bash
npx prisma migrate dev --name init
```

Lệnh này sẽ tạo bảng và dữ liệu mẫu (nếu có) theo schema trong `prisma/schema.prisma`.

### 5. Chạy server phát triển

```bash
npm run dev
```

- Truy cập [http://localhost:3000](http://localhost:3000) để sử dụng ứng dụng.

## Các lệnh hữu ích

- `npm run build`: Build production
- `npm start`: Chạy production
- `npx prisma studio`: Giao diện quản lý database

## Công nghệ sử dụng

- Next.js (Pages + App Router)
- React 19
- Tailwind CSS 4
- Prisma ORM
- PostgreSQL
- React Hot Toast, React Icons

## Lưu ý

- Nếu gặp lỗi về line ending (LF/CRLF) khi dùng Git trên Windows, có thể bỏ qua hoặc cấu hình git như hướng dẫn trong cảnh báo.
- Nếu gặp lỗi module không tìm thấy, hãy chắc chắn đã chạy `npm install`.
