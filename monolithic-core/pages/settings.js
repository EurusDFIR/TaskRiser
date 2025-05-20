import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import { FaUser, FaArrowLeft, FaImage } from 'react-icons/fa';
import { BsPersonBadgeFill, BsShieldLockFill } from 'react-icons/bs';

export default function Settings() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        avatar: null,
    });
    const [previewUrl, setPreviewUrl] = useState('');
    const [csrfToken, setCsrfToken] = useState('');

    // Fetch user data using JWT token or NextAuth session
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            // Check for NextAuth session
            fetch('/api/auth/session')
                .then(res => res.json())
                .then(session => {
                    if (!session || !session.user) {
                        router.push('/login');
                        return;
                    }
                    // We have a NextAuth session, proceed with fetching user data
                    fetchUserData();
                })
                .catch(err => {
                    console.error('Error checking session:', err);
                    router.push('/login');
                });
            return;
        }

        document.cookie = `authToken=${token}; path=/; max-age=3600;`;
        fetchUserData(token);

        // Lấy CSRF token từ cookies
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});

        if (cookies.csrfToken) {
            setCsrfToken(cookies.csrfToken);
        } else {
            // Nếu không có CSRF token, gọi API để lấy token mới
            fetch('/api/csrf/token')
                .then(res => res.json())
                .then(data => {
                    if (data.csrfToken) {
                        setCsrfToken(data.csrfToken);
                    }
                })
                .catch(err => console.error('Error fetching CSRF token:', err));
        }
    }, [router]);

    // Fetch user data
    const fetchUserData = async (token) => {
        try {
            const headers = {};
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const res = await fetch('/api/users/me', { headers });

            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('authToken');
                    router.push('/login');
                    return;
                }
                throw new Error('Failed to fetch user data');
            }

            const userData = await res.json();
            setFormData(prev => ({
                ...prev,
                username: userData.username || '',
            }));
            setPreviewUrl(userData.avatar || '');
        } catch (error) {
            console.error('Fetch user data error:', error);
            toast.error(error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Sanitize input - chỉ cho phép các ký tự an toàn cho username
        if (name === 'username') {
            const sanitizedValue = value.replace(/[^a-zA-Z0-9_\-\.]/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: sanitizedValue,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra kích thước file (tối đa 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error("File quá lớn. Vui lòng chọn file dưới 2MB.");
                return;
            }

            // Kiểm tra định dạng file
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                toast.error("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP).");
                return;
            }

            setFormData(prev => ({
                ...prev,
                avatar: file,
            }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastStyle = { background: '#111827', color: '#e5e7eb', border: '1px solid #374151' };

        try {
            const token = localStorage.getItem('authToken');
            const formDataToSend = new FormData();

            // Add username
            formDataToSend.append('username', formData.username);

            // Add avatar if exists
            if (formData.avatar) {
                formDataToSend.append('avatar', formData.avatar);
                console.log('Sending file:', formData.avatar.name, formData.avatar.type, formData.avatar.size);
            }

            // Add CSRF token
            formDataToSend.append('csrfToken', csrfToken);

            // Log for debugging
            for (let pair of formDataToSend.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ?
                    `File: ${pair[1].name}, ${pair[1].size} bytes` :
                    pair[1]));
            }

            const headers = {};
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch('/api/users/update-profile', {
                method: 'POST',
                headers,
                body: formDataToSend,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            toast.success('Profile updated successfully', {
                iconTheme: { primary: '#8b5cf6', secondary: '#fff' },
                style: toastStyle,
            });
            setTimeout(() => router.reload(), 1000);
        } catch (error) {
            console.error("Update profile error:", error);
            toast.error(error.message, { style: toastStyle });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>TaskRiser - Settings</title>
            </Head>
            <div className="min-h-screen bg-[#caf0f8] text-[#03045e] font-['Orbitron',_sans-serif]">
                <main className="max-w-2xl mx-auto py-8 px-4">
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-[#0077b6] hover:text-[#00b4d8] transition-colors"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back
                        </button>
                    </div>

                    <div className="bg-[#ade8f4] p-5 rounded-xl shadow-xl border border-[#48cae4]/40 mb-6">
                        <h1 className="text-2xl font-bold mb-6 text-[#0077b6] border-b-2 border-[#00b4d8]/20 pb-2">HUNTER SETTINGS</h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[#0077b6] mb-1.5 flex items-center">
                                    <BsPersonBadgeFill className="mr-2 text-[#00b4d8]" /> Hunter ID / Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-[#caf0f8] border-2 border-[#90e0ef]/60 rounded-lg shadow-sm placeholder-[#48cae4]/60 text-[#03045e] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#0077b6] mb-1.5 flex items-center">
                                    <FaImage className="mr-2 text-[#00b4d8]" /> Hunter Badge Image
                                </label>
                                <div className="flex items-center space-x-4">
                                    <div className="w-20 h-20 rounded-full overflow-hidden bg-[#caf0f8] border-2 border-[#90e0ef] flex items-center justify-center">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Avatar preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-[#90e0ef] flex items-center justify-center h-full w-full">
                                                <FaUser size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleAvatarChange}
                                        className="block w-full text-sm text-[#0077b6]
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-[#caf0f8] file:text-[#0077b6]
                                            hover:file:bg-[#90e0ef] file:transition-colors"
                                    />
                                </div>
                            </div>

                            {/* CSRF Token hidden field */}
                            <input type="hidden" name="csrfToken" value={csrfToken} />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#0077b6] to-[#00b4d8] hover:from-[#0096c7] hover:to-[#48cae4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00b4d8] focus:ring-offset-[#caf0f8] disabled:opacity-50 transition-all"
                            >
                                {loading ? 'Updating Profile...' : 'Update Hunter Profile'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
} 