// monolithic-core/pages/_app.js (Ví dụ Pages Router)
import '../src/app/globals.css'; // File CSS toàn cục của bạn
import { Toaster } from 'react-hot-toast'; // Import Toaster

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Toaster
        position="top-right" // Vị trí hiển thị toast
        reverseOrder={false} // Thứ tự hiển thị
        toastOptions={{
          className: 'bg-gray-900 text-white rounded shadow-lg px-4 py-3',
          style: { fontFamily: 'var(--font-geist-sans), Arial, sans-serif' },
        }}
      />
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;