import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

export default function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();

    return (
        <nav className="bg-[#1D1340]/50 backdrop-blur-lg border-b border-[#A480F2]/30">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="text-2xl font-bold text-[#A480F2] hover:text-[#8B5CF6]">
                        TaskRiser
                    </Link>

                    <div className="flex items-center space-x-4">
                        {session ? (
                            <>
                                <Link
                                    href="/settings"
                                    className="flex items-center text-[#A480F2] hover:text-[#8B5CF6]"
                                >
                                    <FaUser className="mr-2" />
                                    {session.user.username || session.user.email}
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="flex items-center text-[#A480F2] hover:text-[#8B5CF6]"
                                >
                                    <FaSignOutAlt className="mr-2" />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="text-[#A480F2] hover:text-[#8B5CF6]"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
} 