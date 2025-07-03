// Converted from monolithic-core/pages/profile.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaCog,
  FaTasks,
  FaCheckCircle,
  FaLock,
  FaMedal,
  FaTrophy,
  FaUserCircle,
  FaEyeSlash,
} from "react-icons/fa";
import { GiSpikedDragonHead, GiSkills } from "react-icons/gi";
import LeftPane from "../../LeftPane";
import toast from "react-hot-toast";
import {
  calculateLevel,
  determineRank,
  expForNextLevelBoundary,
} from "../../utils/soloLeveling";

// Dữ liệu kỹ năng và thành tựu mẫu
const fakeSkills = [
  {
    name: "Quick Learner",
    desc: "+10% EXP",
    icon: <GiSkills />,
    unlocked: true,
  },
  {
    name: "Time Master",
    desc: "Deadline +1 day",
    icon: <FaCog />,
    unlocked: true,
  },
  {
    name: "Task Multiplier",
    desc: "2x rewards",
    icon: <FaTasks />,
    unlocked: false,
  },
  {
    name: "Dungeon Vision",
    desc: "See hidden tasks",
    icon: <FaEyeSlash />,
    unlocked: false,
  },
];
const fakeAchievements = [
  {
    name: "First Blood",
    desc: "Complete your first task",
    icon: <FaCheckCircle />,
    unlocked: true,
  },
  {
    name: "Task Apprentice",
    desc: "Complete 10 tasks",
    icon: <FaMedal />,
    unlocked: true,
  },
  {
    name: "Streak Master",
    desc: "7-day streak",
    icon: <FaTrophy />,
    unlocked: false,
  },
  {
    name: "Overachiever",
    desc: "Complete 50 tasks",
    icon: <FaTrophy />,
    unlocked: false,
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const [leftPaneCollapsed, setLeftPaneCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [skills] = useState(fakeSkills);
  const [achievements] = useState(fakeAchievements);
  const [userLevel, setUserLevel] = useState(1);
  const [userRank, setUserRank] = useState({ name: "E" });
  const [expProgress, setExpProgress] = useState(0);
  const [expToNext, setExpToNext] = useState(100);
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("http://localhost:8080/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserData(data);
        if (data.totalExp) {
          setUserLevel(calculateLevel(data.totalExp));
          setUserRank(determineRank(data.totalExp));
          setExpProgress(data.totalExp);
          setExpToNext(
            expForNextLevelBoundary(calculateLevel(data.totalExp) + 1)
          );
        }
        setLoading(false);
      });
  }, [router]);

  useEffect(() => {
    if (userData) {
      setNewUsername(userData.username || "");
      setNewAvatar(userData.avatar || "");
      setAvatarPreview(userData.avatar || null);
    }
  }, [userData]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setNewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch("http://localhost:8080/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: newUsername, avatar: newAvatar }),
      });
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
        setEditMode(false);
        toast.success("Profile updated!");
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      toast.error("Error updating profile");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="text-center text-lg text-gray-400 py-20">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1D1340] via-[#232946] to-[#445EF2]">
      <LeftPane
        userData={userData || undefined}
        activePath="/profile"
        collapsed={leftPaneCollapsed}
        setCollapsed={setLeftPaneCollapsed}
      />
      <div
        className="flex flex-col items-center px-4"
        style={{
          marginLeft: leftPaneCollapsed ? 56 : 256,
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="w-full max-w-3xl mx-auto mt-12 mb-8 p-8 rounded-3xl shadow-2xl bg-gradient-to-r from-[#232946]/90 to-[#1D1340]/80 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex flex-col items-center gap-4 flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#90e0ef] flex items-center justify-center text-[#0077b6] font-bold text-4xl relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={newUsername || userData?.username || "User"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).style.display = "none";
                    (
                      (e.target as HTMLImageElement).parentNode?.querySelector(
                        ".fallback-text"
                      ) as HTMLElement
                    ).style.display = "flex";
                  }}
                />
              ) : null}
              {!avatarPreview && (
                <span className="fallback-text absolute inset-0 flex items-center justify-center">
                  {(newUsername || userData?.username || "H")
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}
            </div>
            {editMode ? (
              <>
                <input
                  type="text"
                  className="mt-2 px-3 py-2 rounded-lg border border-[#90e0ef] bg-[#232946] text-white text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#00b4d8]"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  maxLength={32}
                  disabled={saving}
                />
                <label className="mt-2 cursor-pointer text-[#00b4d8] hover:underline text-sm">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={saving}
                  />
                  Đổi ảnh đại diện
                </label>
                <div className="flex gap-2 mt-2">
                  <button
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00b4d8] to-[#A480F2] text-white font-semibold shadow hover:from-[#0096c7] hover:to-[#48cae4] transition-all"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? "Đang lưu..." : "Lưu"}
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-[#232946] text-[#A480F2] border border-[#A480F2] font-semibold shadow hover:bg-[#1D1340] transition-all"
                    onClick={() => setEditMode(false)}
                    disabled={saving}
                  >
                    Hủy
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-[#00b4d8]">
                  {userData?.username}
                </div>
                <button
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00b4d8] to-[#A480F2] text-white font-semibold shadow hover:from-[#0096c7] hover:to-[#48cae4] transition-all mt-2"
                  onClick={() => setEditMode(true)}
                >
                  Chỉnh sửa hồ sơ
                </button>
              </>
            )}
            <div className="flex gap-4 text-lg mt-2">
              <span className="font-semibold text-[#A480F2]">Level:</span>
              <span className="text-white font-bold">{userLevel}</span>
              <span className="font-semibold text-[#A480F2]">Rank:</span>
              <span className="text-white font-bold">{userRank.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#A480F2]">EXP:</span>
              <span className="text-white font-bold">
                {expProgress} / {expToNext}
              </span>
            </div>
          </div>
          <div className="flex-1 w-full">
            <h2 className="text-xl font-bold text-[#A480F2] mb-2">Skills</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {skills.map((skill, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-xl shadow-lg ${
                    skill.unlocked
                      ? "bg-gradient-to-r from-[#00b4d8]/20 to-[#A480F2]/10 text-white"
                      : "bg-[#232946]/60 text-gray-400 opacity-60"
                  }`}
                >
                  <span className="text-2xl">{skill.icon}</span>
                  <div>
                    <div className="font-semibold">{skill.name}</div>
                    <div className="text-sm">{skill.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <h2 className="text-xl font-bold text-[#A480F2] mb-2">
              Achievements
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((ach, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-xl shadow-lg ${
                    ach.unlocked
                      ? "bg-gradient-to-r from-[#A480F2]/20 to-[#00b4d8]/10 text-white"
                      : "bg-[#232946]/60 text-gray-400 opacity-60"
                  }`}
                >
                  <span className="text-2xl">{ach.icon}</span>
                  <div>
                    <div className="font-semibold">{ach.name}</div>
                    <div className="text-sm">{ach.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
