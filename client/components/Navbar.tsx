import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { ReactNode } from "react";

export default function Navbar(): ReactNode {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <nav className="bg-[#e0f7fa]/70 backdrop-blur-lg border-b border-[#90e0ef]/60 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#0077b6] hover:from-[#48cae4] hover:to-[#90e0ef]"
          >
            TaskRiser
          </Link>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link
                  href="/settings"
                  className="flex items-center text-[#00b4d8] hover:text-[#0077b6] font-semibold transition-colors"
                >
                  <FaUser className="mr-2" />
                  {session.user?.name || session.user?.email}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center text-[#00b4d8] hover:text-[#0077b6] font-semibold transition-colors"
                >
                  <FaSignOutAlt className="mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-[#00b4d8] hover:text-[#0077b6] font-semibold transition-colors"
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
