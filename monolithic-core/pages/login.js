// monolithic-core/pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Solo Leveling inspired icons
import { FaEye, FaEyeSlash, FaGoogle, FaFacebookF } from 'react-icons/fa';
import { GiSpikedDragonHead, GiKeyCard } from 'react-icons/gi'; // For System Access
import { BsShieldLockFill, BsPersonBadgeFill, BsLightningChargeFill, BsExclamationOctagonFill } from 'react-icons/bs'; // Added BsExclamationOctagonFill

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(''); // Hunter ID or Email
  const [password, setPassword] = useState('');   // Authentication Code
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const toastStyle = { background: '#111827', color: '#e5e7eb', border: '1px solid #374151' };

    if (!identifier || !password) {
      toast.error('Hunter ID and Authentication Code required.', { style: toastStyle });
      setLoading(false);
      return;
    }

    try {
      const loginPayload = {
        email: identifier, // Assuming API still expects 'email' for identifier
        password,
      };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid Hunter ID or Authentication Code.');
      }

      localStorage.setItem('authToken', data.token);
      if (data.user) {
        const userDataToStore = {
          username: data.user.username || 'Unknown Hunter',
          totalExp: data.user.totalExp || 0,
          ...(data.user || {})
        };
        localStorage.setItem('userData', JSON.stringify(userDataToStore));
      }

      toast.success('System Access Granted. Welcome, Hunter.', {
        iconTheme: { primary: '#8b5cf6', secondary: '#fff' },
        style: toastStyle,
      });
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message || 'System Access Denied.', { style: toastStyle });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>System Access - Hunter Network</title>
        {/* Orbitron font import moved to style jsx global for page-specific application */}
      </Head>
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 text-slate-300 font-['Orbitron',_sans-serif] relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-600/20 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-sky-600/20 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-2000"></div>

        <div className="w-full max-w-md bg-black/70 backdrop-blur-md p-8 rounded-xl shadow-2xl border-2 border-purple-700/50 z-10">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-gradient-to-br from-purple-600 to-sky-500 rounded-full mb-4 shadow-lg shadow-purple-500/30">
              <GiSpikedDragonHead size={48} className="text-white transform " />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-wider">
                <span className="text-purple-400">SYSTEM</span> <span className="text-sky-400">ACCESS</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm">Authenticate to enter the Hunter Network.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              {/* SỬA LỖI Ở ĐÂY: Bỏ 'block' */}
              <label htmlFor="identifier" className="text-sm font-medium text-sky-300 mb-1.5 flex items-center">
                <BsPersonBadgeFill className="mr-2 text-sky-400" /> Hunter ID / Email
              </label>
              <input
                type="text"
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 bg-gray-800/70 border-2 border-gray-700 rounded-lg shadow-sm placeholder-slate-500 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors"
                placeholder="Enter your designation"
                required
              />
            </div>

            <div className="relative">
              {/* SỬA LỖI Ở ĐÂY: Bỏ 'block' */}
              <label htmlFor="password" className="text-sm font-medium text-sky-300 mb-1.5 flex items-center">
                <BsShieldLockFill className="mr-2 text-sky-400" /> Authentication Code
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 bg-gray-800/70 border-2 border-gray-700 rounded-lg shadow-sm placeholder-slate-500 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors"
                placeholder="Enter your access code"
                required
              />
               <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-slate-500 hover:text-sky-300 transition-colors" // Adjusted 'top-7' to align with label changes if needed
                aria-label={showPassword ? "Hide Code" : "Show Code"}
              >
                {showPassword ? <FaEyeSlash size={18}/> : <FaEye size={18}/>}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-offset-gray-900 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
                  Maintain Connection
                </label>
              </div>
              <Link href="/forgot-password">
                <a className="font-medium text-purple-400 hover:text-purple-300 hover:underline transition-colors">
                  Code Recovery?
                </a>
              </Link>
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-500/70 text-red-300 p-3 rounded-md text-sm flex items-center">
                    <BsExclamationOctagonFill className="mr-2 shrink-0" />
                    {error}
                </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-md font-semibold text-white bg-gradient-to-r from-purple-600 via-purple-700 to-sky-600 hover:from-purple-500 hover:via-purple-600 hover:to-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-950 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 group"
              >
                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Authenticating...
                    </>
                ) : (
                    <>
                        <BsLightningChargeFill className="mr-2 opacity-80 group-hover:opacity-100 group-hover:text-yellow-300 transition-all" />
                        INITIATE ACCESS
                    </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              New Hunter Registration?{' '}
              <Link href="/register">
                <a className="font-semibold text-purple-400 hover:text-purple-300 hover:underline transition-colors">
                  Proceed to Awakening
                </a>
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-700/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-gray-900/0 backdrop-blur-sm text-slate-500 uppercase tracking-wider">Alternative Gateways</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled
                className="w-full inline-flex items-center justify-center py-2.5 px-4 border-2 border-gray-700 rounded-lg shadow-sm bg-gray-800/60 text-sm font-medium text-slate-300 hover:bg-gray-700/80 hover:border-red-500/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
              >
                <FaGoogle className="mr-2 h-5 w-5 text-red-400 group-hover:text-red-300 transition-colors" />
                Google Dimensional Link
              </button>
              <button
                type="button"
                disabled
                className="w-full inline-flex items-center justify-center py-2.5 px-4 border-2 border-gray-700 rounded-lg shadow-sm bg-gray-800/60 text-sm font-medium text-slate-300 hover:bg-gray-700/80 hover:border-blue-500/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
              >
                <FaFacebookF className="mr-2 h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                Facebook Mana Stream
              </button>
            </div>
          </div>
        </div>

        <footer className="absolute bottom-4 text-center w-full text-xs text-slate-600 z-0">
            Hunter Network Protocol v2.7 | Unauthorized access will be prosecuted by the Hunter Association.
        </footer>
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&display=swap');
            body {
                font-family: 'Orbitron', sans-serif; /* Applied more broadly for consistency */
            }
            .animation-delay-2000 {
                animation-delay: 2s;
            }
        `}</style>
      </div>
    </>
  );
}