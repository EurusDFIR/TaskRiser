// monolithic-core/pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Import icon
import { FaGoogle, FaFacebookF, FaEye, FaEyeSlash } from 'react-icons/fa';
import { GiCastle } from 'react-icons/gi'; // Icon cho logo Task Dungeon

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(''); // Có thể là username hoặc email
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!identifier || !password) {
      toast.error('Please enter your username/email and password.');
      setLoading(false);
      return;
    }

    try {
      // API của bạn hiện tại nhận 'email'. Nếu muốn hỗ trợ cả username,
      // bạn cần điều chỉnh API backend để kiểm tra cả hai.
      // Hoặc, ở đây bạn có thể thử đoán xem là email hay username
      // và gửi trường 'email' hoặc 'username' tương ứng.
      // Để đơn giản, hiện tại ta giả sử API login nhận 'email'.
      // Nếu người dùng nhập username, bạn có thể cần logic bổ sung.
      const loginPayload = {
        email: identifier, // Giả sử API nhận email
        password,
      };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid username/email or password.');
      }

      // Lưu token và user data (nếu có)
      localStorage.setItem('authToken', data.token);
      if (data.user) {
        localStorage.setItem('userData', JSON.stringify(data.user));
      }
      // TODO: Xử lý 'Remember me' - có thể lưu token vào cookie với thời gian hết hạn dài hơn

      toast.success('Signed in successfully!');
      router.push('/dashboard'); // Chuyển hướng đến trang dashboard
    } catch (err) {
      toast.error(err.message || 'Sign in failed.');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In - Task Dungeon</title>
      </Head>
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-gray-300">
        <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-xl border border-purple-700">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-purple-600 rounded-full mb-3">
              <GiCastle size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-purple-400">TASK DUNGEON</h1>
            <p className="text-gray-400 mt-1">Level up your productivity</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-400">
                Username or Email
              </label>
              <input
                type="text" // Có thể là email hoặc text tùy bạn muốn validate
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Enter your username or email"
                required
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-400">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Enter your password"
                required
              />
               <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-purple-600 border-gray-500 rounded focus:ring-purple-500"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-400">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-purple-400 hover:text-purple-300">
                  Forgot password?
                </a>
              </div>
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-800 disabled:opacity-50"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-purple-400 hover:text-purple-300">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-500">OR</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button
                  type="button"
                  // onClick={handleGoogleSignIn}
                  disabled
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-800 disabled:opacity-50"
                >
                  <FaGoogle className="mr-2 h-5 w-5" />
                  Google
                </button>
              </div>
              <div>
                <button
                  type="button"
                  // onClick={handleFacebookSignIn}
                  disabled
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-800 disabled:opacity-50"
                >
                  <FaFacebookF className="mr-2 h-5 w-5" />
                  Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}