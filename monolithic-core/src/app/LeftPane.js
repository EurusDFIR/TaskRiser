// src/app/LeftPane.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaBars, FaChevronLeft, FaChevronRight, FaSignOutAlt, FaTachometerAlt, FaMedal, FaTasks, FaUserCircle } from 'react-icons/fa';
import { GiSpikedDragonHead } from 'react-icons/gi';

const NAV_ITEMS = [
  { label: 'Profile', icon: <FaUserCircle />, href: '/profile' },
  { label: 'Dashboard', icon: <FaTachometerAlt />, href: '/dashboard' },
  { label: 'Ranking', icon: <FaMedal />, href: '/ranking' },
  { label: 'Quests', icon: <FaTasks />, href: '/dashboard#quests' },
];

export default function LeftPane({ userData, onLogout, activePath }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  // Persist collapse state
  useEffect(() => {
    const stored = localStorage.getItem('leftPaneCollapsed');
    if (stored !== null) setCollapsed(stored === 'true');
  }, []);
  useEffect(() => {
    localStorage.setItem('leftPaneCollapsed', collapsed);
  }, [collapsed]);

  // Determine active nav
  const isActive = (href) => {
    if (href === '/dashboard#quests') return router.asPath.startsWith('/dashboard#quests');
    return router.pathname === href;
  };

  return (
    <aside className={`fixed top-0 left-0 h-screen z-40 bg-[#f8fdff]/90 border-r border-[#90e0ef]/60 shadow-xl flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} min-w-[60px]`}> 
      {/* Collapse/Expand Button */}
      <button
        className="absolute top-4 right-[-18px] bg-[#caf0f8] border border-[#90e0ef] rounded-full p-1 shadow-md hover:bg-[#ade8f4] transition-all z-50"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
      >
        {collapsed ? <FaChevronRight className="text-[#0077b6]" /> : <FaChevronLeft className="text-[#0077b6]" />}
      </button>
      {/* Logo/App Name */}
      <div className="flex items-center gap-3 px-4 py-6">
        <GiSpikedDragonHead size={collapsed ? 32 : 40} className="text-[#0077b6]" />
        {!collapsed && <span className="text-2xl font-bold text-[#0077b6] tracking-wider">TaskRiser</span>}
      </div>
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 mt-2">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} legacyBehavior>
            <a
              className={`flex items-center gap-3 px-4 py-2 rounded-lg mx-2 my-1 font-semibold transition-all text-[#0077b6] hover:bg-[#caf0f8] hover:text-[#0096c7] ${isActive(item.href) ? 'bg-[#00b4d8]/20 text-[#0096c7] font-bold' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              tabIndex={0}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </a>
          </Link>
        ))}
      </nav>
      {/* User Info & Logout */}
      <div className={`mt-auto mb-4 px-4 flex flex-col gap-2 ${collapsed ? 'items-center' : ''}`}>
        {userData && (
          <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-[#90e0ef] flex items-center justify-center text-[#0077b6] font-bold text-lg">
              {userData.username?.charAt(0).toUpperCase() || 'H'}
            </div>
            {!collapsed && <span className="font-semibold text-[#0077b6] text-sm truncate max-w-[120px]">{userData.username}</span>}
          </div>
        )}
        <button
          onClick={onLogout}
          className={`flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white font-semibold shadow hover:from-[#0096c7] hover:to-[#48cae4] transition-all ${collapsed ? 'justify-center w-10 h-10 p-0' : 'w-full'}`}
        >
          <FaSignOutAlt />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
