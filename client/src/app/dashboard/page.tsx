// Converted from monolithic-core/pages/dashboard.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import toast from "react-hot-toast";
import { FaPlus, FaBell } from "react-icons/fa";
import { BsLightningChargeFill, BsUiChecksGrid } from "react-icons/bs";
import { GiPortal, GiLockedFortress, GiShadowFollower } from "react-icons/gi";
import {
  calculateLevel,
  determineRank,
  expForNextLevelBoundary,
  taskDifficultyToRank,
} from "../../utils/soloLeveling";

import TaskItem from "../../TaskItem";
import SystemHeader from "../../SystemHeader";
import LeftPane from "../../LeftPane";
import RankingPreview from "../../RankingPreview";

const difficultyOptions = [
  { value: "E-Rank", label: "E-Rank (Easy)" },
  { value: "D-Rank", label: "D-Rank (Medium)" },
  { value: "C-Rank", label: "C-Rank (Challenging)" },
  { value: "B-Rank", label: "B-Rank (Hard)" },
  { value: "A-Rank", label: "A-Rank (Very Hard)" },
  { value: "S-Rank", label: "S-Rank (Legendary)" },
];

type UserData = {
  username: string;
  totalExp?: number;
  // add other properties as needed
};

export default function DashboardPage() {
  // State quản lý LeftPane collapsed
  const [leftPaneCollapsed, setLeftPaneCollapsed] = useState(false);
  // --- HANDLERS BỔ SUNG ---
  // Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  // Cập nhật trạng thái task
  const handleUpdateTaskStatus = async (
    taskId: string | number,
    newStatus: string
  ) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/tasks/${taskId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (res.ok) {
        // reload tasks
        fetchTasks();
        toast.success("Task status updated!");
      } else {
        toast.error("Failed to update task status");
      }
    } catch (err) {
      toast.error("Error updating task status");
    }
  };

  // Lọc task
  const applyFilter = (filter: string) => {
    setActiveFilter(filter);
    if (filter === "Active") {
      setFilteredTasks(tasks.filter((t) => t.status !== "Cleared"));
    } else if (filter === "Cleared") {
      setFilteredTasks(tasks.filter((t) => t.status === "Cleared"));
    } else {
      setFilteredTasks(tasks);
    }
  };

  // Lấy lại danh sách task (dùng lại cho update status)
  const fetchTasks = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    fetch("http://localhost:8080/api/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks || []);
        // Áp dụng filter hiện tại
        if (activeFilter === "Active") {
          setFilteredTasks(
            (data.tasks || []).filter((t: any) => t.status !== "Cleared")
          );
        } else if (activeFilter === "Cleared") {
          setFilteredTasks(
            (data.tasks || []).filter((t: any) => t.status === "Cleared")
          );
        } else {
          setFilteredTasks(data.tasks || []);
        }
      });
  };
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userLevel, setUserLevel] = useState(1);
  const [userRank, setUserRank] = useState(determineRank(1));
  const [expProgress, setExpProgress] = useState(0);
  const [expToNext, setExpToNext] = useState(expForNextLevelBoundary(2));
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("Active");
  const [showNewQuestModal, setShowNewQuestModal] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState("");
  const [newQuestDifficulty, setNewQuestDifficulty] = useState("E-Rank");
  const [newQuestDescription, setNewQuestDescription] = useState("");
  const [newQuestDueDate, setNewQuestDueDate] = useState("");
  const [newQuestPriority, setNewQuestPriority] = useState("Medium");
  const [newQuestTags, setNewQuestTags] = useState("");
  const [newQuestInitialStatus, setNewQuestInitialStatus] = useState("Pending");
  const [ranking] = useState([
    { id: 1, username: "Shadow Monarch", tasksCompleted: 102, totalExp: 12500 },
    { id: 2, username: "Beast Monarch", tasksCompleted: 88, totalExp: 9800 },
    {
      id: 3,
      username: "Iron Body Monarch",
      tasksCompleted: 75,
      totalExp: 8200,
    },
  ]);
  const [notifications] = useState([
    {
      id: 1,
      type: "system_alert",
      title: "[SYSTEM] Emergency Quest Issued!",
      message:
        "Unidentified High-Rank Gate detected in Sector Gamma. All available A-Rank and above Hunters deploy immediately. Reward: Significant EXP & Unique Artifact.",
      icon: <BsUiChecksGrid className="text-red-400 mr-3 shrink-0" size={24} />,
    },
    {
      id: 2,
      type: "achievement",
      title: '[SYSTEM] Title Unlocked: "Gate Conqueror"',
      message:
        "Successfully cleared 10 D-Rank Gates. Passive Mana Regeneration +5%.",
      icon: (
        <BsLightningChargeFill
          className="text-yellow-400 mr-3 shrink-0"
          size={24}
        />
      ),
    },
    {
      id: 3,
      type: "guild_invite",
      title: "[SYSTEM] Guild Invitation Received",
      message:
        'The "Ahjin Guild" (Guildmaster: Sung Jinwoo) has extended an invitation. Their current focus is S-Rank Gate subjugation.',
      icon: <FaPlus className="text-sky-400 mr-3 shrink-0" size={24} />,
      actions: true,
    },
    {
      id: 4,
      type: "daily_reset",
      title: "[SYSTEM] Daily Quest Log Reset",
      message:
        "Your daily quests have been refreshed. New challenges await, Hunter.",
      icon: <FaBell className="text-green-400 mr-3 shrink-0" size={24} />,
    },
  ]);
  const router = useRouter();

  // ...existing logic for fetching user/tasks, updateUserProfile, fetchUserData, fetchTasks, handleCreateQuest, handleUpdateTaskStatus, applyFilter, handleLogout...

  // Lấy thông tin user
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
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
      });
  }, []);

  // Lấy danh sách task
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    fetch("http://localhost:8080/api/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks || []);
        setFilteredTasks(data.tasks || []);
      });
  }, []);

  // ...UI chuyển đổi giống monolithic-core, sử dụng LeftPane, SystemHeader, RankingPreview, TaskItem, modal tạo task, filter, ...
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0077b6] via-[#00b4d8] to-[#90e0ef]">
      <LeftPane
        userData={userData || undefined}
        onLogout={handleLogout}
        activePath="/dashboard"
        collapsed={leftPaneCollapsed}
        setCollapsed={setLeftPaneCollapsed}
      />
      <div
        className="flex flex-col"
        style={{
          marginLeft: leftPaneCollapsed ? 56 : 256, // px, tương ứng w-16 và w-64
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <SystemHeader
          userData={userData || undefined}
          onLogout={handleLogout}
        />
        <main className="flex flex-col md:flex-row gap-8 p-8">
          <section className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#0077b6] drop-shadow">
                Dashboard
              </h2>
              <button
                className="bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#0077b6] hover:from-[#48cae4] hover:to-[#90e0ef] text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all text-lg"
                onClick={() => setShowNewQuestModal(true)}
              >
                <FaPlus className="inline-block mr-2" /> New Quest
              </button>
            </div>
            {userData && (
              <div className="mb-8 p-6 bg-gradient-to-r from-[#e0f7fa]/90 to-[#caf0f8]/80 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center md:gap-8 gap-4 border border-[#90e0ef]/60">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#00b4d8]">
                      Hunter:
                    </span>
                    <span className="text-[#0077b6] text-lg font-bold">
                      {userData.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-[#00b4d8]">Level:</span>
                    <span className="text-[#0077b6] text-lg font-bold">
                      {userLevel}
                    </span>
                    <span className="font-semibold text-[#00b4d8]">Rank:</span>
                    <span className="text-[#0077b6] text-lg font-bold">
                      {userRank.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#00b4d8]">EXP:</span>
                    <span className="text-[#0077b6] text-lg font-bold">
                      {expProgress} / {expToNext}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="mb-8">
              <div className="flex gap-3 mb-4">
                <button
                  className={`px-5 py-2 rounded-full font-semibold shadow transition-all text-base ${
                    activeFilter === "Active"
                      ? "bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#0077b6] text-white"
                      : "bg-[#e0f7fa] text-[#00b4d8] hover:bg-[#caf0f8] border border-[#90e0ef]"
                  }`}
                  onClick={() => applyFilter("Active")}
                >
                  Active
                </button>
                <button
                  className={`px-5 py-2 rounded-full font-semibold shadow transition-all text-base ${
                    activeFilter === "Cleared"
                      ? "bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#0077b6] text-white"
                      : "bg-[#e0f7fa] text-[#00b4d8] hover:bg-[#caf0f8] border border-[#90e0ef]"
                  }`}
                  onClick={() => applyFilter("Cleared")}
                >
                  Cleared
                </button>
              </div>
              {filteredTasks.length === 0 ? (
                <div className="text-gray-400 text-lg text-center py-8">
                  No tasks found.
                </div>
              ) : (
                <ul className="space-y-4">
                  {filteredTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onUpdateStatus={handleUpdateTaskStatus}
                    />
                  ))}
                </ul>
              )}
            </div>
          </section>
          <aside className="w-full md:w-96 flex-shrink-0">
            <div className="mb-8">
              <RankingPreview ranking={ranking} />
            </div>
            <div className="">
              <h2 className="text-2xl font-bold text-[#00b4d8] mb-4">
                Notifications
              </h2>
              <ul className="space-y-4">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className="bg-gradient-to-r from-[#caf0f8]/90 to-[#e0f7fa]/80 p-4 rounded-xl flex items-center gap-4 shadow border border-[#90e0ef]/60"
                  >
                    {n.icon}
                    <div>
                      <div className="font-semibold text-[#0077b6] text-base">
                        {n.title}
                      </div>
                      <div className="text-[#00b4d8] text-sm">{n.message}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </main>
      </div>
      {/* Modal tạo quest mới (có thể bổ sung sau) */}
    </div>
  );
}
