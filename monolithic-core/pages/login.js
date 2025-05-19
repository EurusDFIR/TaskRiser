// monolithic-core/pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { FaGithub } from 'react-icons/fa';

// Solo Leveling inspired icons
import { FaEye, FaEyeSlash, FaGoogle, FaFacebookF } from 'react-icons/fa';
import { GiSpikedDragonHead } from 'react-icons/gi'; // For System Access
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-[#03045e] font-['Orbitron',_sans-serif] relative overflow-hidden bg-gradient-to-br from-[#caf0f8] via-[#ade8f4] to-[#90e0ef] backdrop-blur-xl">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#48cae4]/30 rounded-full filter blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-[#00b4d8]/30 rounded-full filter blur-3xl opacity-60 animate-pulse animation-delay-2000"></div>
        <div className="w-full max-w-md bg-[#f8fdff]/80 backdrop-blur-lg p-8 rounded-xl shadow-2xl border-2 border-[#90e0ef]/60 z-10">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-[#0077b6] rounded-full mb-4 shadow-lg shadow-[#48cae4]/30">
              <GiSpikedDragonHead size={48} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-wider">
              <span className="text-[#0077b6]">SYSTEM</span> <span className="text-[#00b4d8]">ACCESS</span>
            </h1>
            <p className="text-[#0096c7] mt-2 text-sm">Authenticate to enter the Hunter Network.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="identifier" className="text-sm font-medium text-[#0077b6] mb-1.5 flex items-center">
                <BsPersonBadgeFill className="mr-2 text-[#00b4d8]" /> Hunter ID / Email
              </label>
              <input
                type="text"
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 bg-[#caf0f8] border-2 border-[#90e0ef]/60 rounded-lg shadow-sm placeholder-[#48cae4]/60 text-[#03045e] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] sm:text-sm transition-colors"
                placeholder="Enter your designation"
                required
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="text-sm font-medium text-[#0077b6] mb-1.5 flex items-center">
                <BsShieldLockFill className="mr-2 text-[#00b4d8]" /> Authentication Code
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 bg-[#caf0f8] border-2 border-[#90e0ef]/60 rounded-lg shadow-sm placeholder-[#48cae4]/60 text-[#03045e] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] sm:text-sm transition-colors"
                placeholder="Enter your authentication code"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-[#48cae4] hover:text-[#0077b6]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-[#00b4d8] border-[#90e0ef] rounded focus:ring-[#00b4d8]"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-[#0077b6]">
                Remember me
              </label>
            </div>

            {error && <p className="text-sm text-[#d90429]">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#0096c7] hover:to-[#48cae4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00b4d8] focus:ring-offset-[#caf0f8] disabled:opacity-50 transition-all"
              >
                {loading ? 'Authenticating...' : 'Access System'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#0077b6]">
              Not registered?{' '}
              <Link href="/register" className="font-medium text-[#0096c7] hover:text-[#0077b6]">
                Create an account
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
                <GoogleLogin
                  onSuccess={credentialResponse => {
                    fetch('/api/auth/google', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ token: credentialResponse.credential }),
                    })
                      .then(async (res) => {
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message || 'Google authentication failed');
                        localStorage.setItem('authToken', data.token);
                        if (data.user) {
                          const userDataToStore = {
                            username: data.user.username || 'Unknown Hunter',
                            totalExp: data.user.totalExp || 0,
                            avatar: data.user.avatar,
                            ...(data.user || {})
                          };
                          localStorage.setItem('userData', JSON.stringify(userDataToStore));
                        }
                        toast.success('System Access Granted. Welcome, Hunter.', {
                          iconTheme: { primary: '#8b5cf6', secondary: '#fff' },
                          style: { background: '#111827', color: '#e5e7eb', border: '1px solid #374151' },
                        });
                        router.push('/dashboard');
                      })
                      .catch(err => {
                        toast.error(err.message || 'System Access Denied.', {
                          style: { background: '#111827', color: '#e5e7eb', border: '1px solid #374151' },
                        });
                        setError(err.message);
                      });
                  }}
                  onError={() => {
                    toast.error('Google authentication failed', {
                      style: { background: '#111827', color: '#e5e7eb', border: '1px solid #374151' },
                    });
                  }}
                />
              </div>
              <div>
                <button
                  type="button"
                  disabled
                  className="w-full inline-flex justify-center py-2 px-4 border border-[#90e0ef] rounded-md shadow-sm bg-[#ade8f4] text-sm font-medium text-[#0077b6] hover:bg-[#caf0f8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00b4d8] focus:ring-offset-[#caf0f8] disabled:opacity-50 transition-all"
                >
                  <FaGithub className="mr-2 h-5 w-5" />
                  GitHub
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-4 text-center w-full text-xs text-[#A480F2]/60 z-0">
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
    </>
  );
}

