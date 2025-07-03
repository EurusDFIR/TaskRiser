// LeftPane.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  FaBars,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaTachometerAlt,
  FaMedal,
  FaTasks,
  FaUserCircle,
  FaColumns,
  FaChartLine,
} from "react-icons/fa";
import { GiSpikedDragonHead } from "react-icons/gi";

interface UserData {
  username?: string;
  avatar?: string;
}

interface LeftPaneProps {
  userData?: UserData;
  onLogout?: () => void;
  activePath?: string;
  collapsed?: boolean;
  setCollapsed?: (c: boolean) => void;
}

const NAV_ITEMS = [
  { label: "Profile", icon: <FaUserCircle />, href: "/profile" },
  { label: "Dashboard", icon: <FaTachometerAlt />, href: "/dashboard" },
  { label: "Kanban", icon: <FaColumns />, href: "/kanban" },
  { label: "Ranking", icon: <FaMedal />, href: "/ranking" },
  { label: "Quests", icon: <FaTasks />, href: "/dashboard#quests" },
  { label: "Performance", icon: <FaChartLine />, href: "/performance-test" },
];

export default function LeftPane({
  userData,
  onLogout,
  activePath,
  collapsed: collapsedProp,
  setCollapsed: setCollapsedProp,
}: LeftPaneProps) {
  // Nếu nhận prop collapsed/setCollapsed thì dùng prop, nếu không thì fallback local state (để backward compatible)
  const [internalCollapsed, internalSetCollapsed] = useState(false);
  const collapsed =
    collapsedProp !== undefined ? collapsedProp : internalCollapsed;
  const setCollapsed =
    setCollapsedProp !== undefined ? setCollapsedProp : internalSetCollapsed;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (setCollapsedProp) return; // Nếu dùng prop thì không lưu localStorage
    const stored = localStorage.getItem("leftPaneCollapsed");
    if (stored !== null) internalSetCollapsed(stored === "true");
  }, []);
  useEffect(() => {
    if (setCollapsedProp) return;
    localStorage.setItem("leftPaneCollapsed", internalCollapsed.toString());
  }, [internalCollapsed, setCollapsedProp]);

  const isActive = (href: string) => {
    if (href === "/dashboard#quests") {
      return pathname === "/dashboard" && window.location.hash === "#quests";
    }
    return pathname === href;
  };
  return (
    <>
      {/* Nút toggle luôn cố định ở góc trên cùng bên trái, nổi trên mọi layout */}
      <button
        className="fixed top-4 left-4 bg-[#caf0f8] border border-[#90e0ef] rounded-full p-2 shadow-md hover:bg-[#ade8f4] transition-all z-[9999]"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand menu" : "Collapse menu"}
        style={{ width: 36, height: 36 }}
      >
        {collapsed ? (
          <FaChevronRight className="text-[#0077b6] text-xl" />
        ) : (
          <FaChevronLeft className="text-[#0077b6] text-xl" />
        )}
      </button>
      <aside
        className={`fixed top-0 left-0 h-screen z-40 bg-[#f8fdff]/90 border-r border-[#90e0ef]/60 shadow-xl flex flex-col transition-all duration-300 ${
          collapsed ? "w-16 min-w-[56px]" : "w-64 min-w-[200px]"
        }`}
      >
        <div
          className={`flex items-center gap-3 px-4 py-6 transition-all duration-300 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <GiSpikedDragonHead
            size={collapsed ? 32 : 40}
            className="text-[#0077b6]"
          />
          <span
            className={`text-2xl font-bold text-[#0077b6] tracking-wider transition-all duration-300 ${
              collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            }`}
          >
            TaskRiser
          </span>
        </div>
        <nav className="flex-1 flex flex-col gap-1 mt-2">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} legacyBehavior>
              <a
                className={`flex items-center gap-3 px-4 py-2 rounded-lg mx-2 my-1 font-semibold transition-all text-[#0077b6] hover:bg-[#caf0f8] hover:text-[#0096c7] ${
                  isActive(item.href)
                    ? "bg-[#00b4d8]/20 text-[#0096c7] font-bold"
                    : ""
                } ${collapsed ? "justify-center px-2" : ""}`}
                tabIndex={0}
              >
                <span className="text-lg">{item.icon}</span>
                <span
                  className={`transition-all duration-300 ${
                    collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                  }`}
                >
                  {item.label}
                </span>
              </a>
            </Link>
          ))}
        </nav>
        <div
          className={`mt-auto mb-4 px-4 flex flex-col gap-2 ${
            collapsed ? "items-center" : ""
          }`}
        >
          {userData && (
            <div
              className={`flex items-center gap-2 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#90e0ef] flex items-center justify-center text-[#0077b6] font-bold text-lg relative">
                {userData?.avatar ? (
                  <img
                    src={userData?.avatar}
                    alt={userData?.username || "User"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).onerror = null;
                      (e.target as HTMLImageElement).style.display = "none";
                      (
                        (
                          e.target as HTMLImageElement
                        ).parentNode?.querySelector(
                          ".fallback-text"
                        ) as HTMLElement
                      ).style.display = "flex";
                    }}
                  />
                ) : null}
                <span className="fallback-text absolute inset-0 flex items-center justify-center">
                  {userData?.username?.charAt(0).toUpperCase() || "H"}
                </span>
              </div>
              <span
                className={`font-semibold text-[#0077b6] text-sm truncate max-w-[120px] transition-all duration-300 ${
                  collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                }`}
              >
                {userData?.username}
              </span>
            </div>
          )}
          <button
            onClick={onLogout}
            className={`flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white font-semibold shadow hover:from-[#0096c7] hover:to-[#48cae4] transition-all ${
              collapsed ? "justify-center w-10 h-10 p-0" : "w-full"
            }`}
          >
            <FaSignOutAlt />
            <span
              className={`transition-all duration-300 ${
                collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
