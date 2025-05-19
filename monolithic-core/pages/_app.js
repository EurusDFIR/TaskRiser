// monolithic-core/pages/_app.js (Ví dụ Pages Router)
import '../src/app/globals.css'; // File CSS toàn cục của bạn
import { Toaster } from 'react-hot-toast'; // Import Toaster
import { GoogleOAuthProvider } from '@react-oauth/google';

function MyApp({ Component, pageProps }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <Toaster
        position="top-right" // Vị trí hiển thị toast
        reverseOrder={false} // Thứ tự hiển thị
        toastOptions={{
          className: 'bg-gray-900 text-white rounded shadow-lg px-4 py-3',
          style: { fontFamily: 'var(--font-geist-sans), Arial, sans-serif' },
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-[#221426]/95 via-[#1D1340]/90 to-[#445EF2]/90 text-[#F2F2F2] font-['Orbitron',_sans-serif] backdrop-blur-xl">
        <Component {...pageProps} />
      </div>
    </GoogleOAuthProvider>
  );
}

export default MyApp;