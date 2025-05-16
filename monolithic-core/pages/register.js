// monolithic-core/pages/register.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head'; // Để đặt title cho trang
import Link from 'next/link'; // Để tạo link cho "Sign in"
import toast from 'react-hot-toast'; // Để hiển thị thông báo

// Import icon (ví dụ dùng react-icons, bạn cần cài đặt: npm install react-icons)
import { FaGoogle, FaFacebookF, FaEye, FaEyeSlash } from 'react-icons/fa';
import { GiCastle } from 'react-icons/gi'; // Icon cho logo Task Dungeon

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // Email là optional theo UI
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!fullName || !username || !password || !confirmPassword) {
      toast.error('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!agreeTerms) {
      toast.error('You must agree to the Terms of Service and Privacy Policy.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // API của bạn hiện tại có thể chỉ nhận username, email, password
        // Bạn cần điều chỉnh API backend hoặc gửi dữ liệu phù hợp
        // Ở đây, ta sẽ gửi username, email (nếu có), password
        body: JSON.stringify({ username, email: email || undefined, password, fullName }), // Thêm fullName nếu backend xử lý
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong during registration.');
      }

      toast.success('Account created successfully! Please sign in.');
      router.push('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
      setError(err.message); // Có thể hiển thị lỗi cụ thể hơn trên form
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Account - TaskRiser</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-[#03045e] font-['Orbitron',_sans-serif] relative overflow-hidden bg-gradient-to-br from-[#caf0f8] via-[#ade8f4] to-[#90e0ef] backdrop-blur-xl">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#48cae4]/30 rounded-full filter blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-[#00b4d8]/30 rounded-full filter blur-3xl opacity-60 animate-pulse animation-delay-2000"></div>
        <div className="w-full max-w-md bg-[#f8fdff]/80 backdrop-blur-lg p-8 rounded-xl shadow-2xl border-2 border-[#90e0ef]/60 z-10">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-[#0077b6] rounded-full mb-3">
              <GiCastle size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[#0077b6]">TASK RISER</h1>
            <p className="text-[#0096c7] mt-1">Create your hunter account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[#0077b6]">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-[#caf0f8] border border-[#90e0ef] rounded-md shadow-sm placeholder-[#48cae4] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] sm:text-sm text-[#03045e]"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#0077b6]">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-[#caf0f8] border border-[#90e0ef] rounded-md shadow-sm placeholder-[#48cae4] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] sm:text-sm text-[#03045e]"
                placeholder="Choose a username"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#0077b6]">
                Email (Optional)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-[#caf0f8] border border-[#90e0ef] rounded-md shadow-sm placeholder-[#48cae4] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] sm:text-sm text-[#03045e]"
                placeholder="Enter your email"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-[#0077b6]">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-[#caf0f8] border border-[#90e0ef] rounded-md shadow-sm placeholder-[#48cae4] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] sm:text-sm text-[#03045e]"
                placeholder="Create a password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-[#48cae4] hover:text-[#0077b6]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-[#0077b6]"
              >
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-[#caf0f8] border border-[#90e0ef] rounded-md shadow-sm placeholder-[#48cae4] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] sm:text-sm text-[#03045e]"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-[#48cae4] hover:text-[#0077b6]"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="flex items-center">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 text-[#00b4d8] border-[#90e0ef] rounded focus:ring-[#00b4d8]"
              />
              <label htmlFor="agreeTerms" className="ml-2 block text-sm text-[#0077b6]">
                I agree to the{' '}
                <a href="/terms" className="font-medium text-[#0096c7] hover:text-[#0077b6]">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="font-medium text-[#0096c7] hover:text-[#0077b6]">
                  Privacy Policy
                </a>
              </label>
            </div>

            {error && <p className="text-sm text-[#d90429]">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#0096c7] hover:to-[#48cae4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00b4d8] focus:ring-offset-[#caf0f8] disabled:opacity-50 transition-all"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#0077b6]">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-[#0096c7] hover:text-[#0077b6]">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#90e0ef]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#caf0f8] text-[#48cae4]">OR</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button
                  type="button"
                  disabled
                  className="w-full inline-flex justify-center py-2 px-4 border border-[#90e0ef] rounded-md shadow-sm bg-[#ade8f4] text-sm font-medium text-[#0077b6] hover:bg-[#caf0f8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00b4d8] focus:ring-offset-[#caf0f8] disabled:opacity-50 transition-all"
                >
                  <FaGoogle className="mr-2 h-5 w-5" />
                  Google
                </button>
              </div>
              <div>
                <button
                  type="button"
                  disabled
                  className="w-full inline-flex justify-center py-2 px-4 border border-[#90e0ef] rounded-md shadow-sm bg-[#ade8f4] text-sm font-medium text-[#0077b6] hover:bg-[#caf0f8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00b4d8] focus:ring-offset-[#caf0f8] disabled:opacity-50 transition-all"
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