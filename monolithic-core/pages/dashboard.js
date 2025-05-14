// monolithic-core/pages/dashboard.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FaPlus, FaChevronRight, FaUserCircle, FaBell, FaTrophy, FaExclamationTriangle, FaUsers, FaCheckCircle, FaCircle } from 'react-icons/fa'; // Thêm icon
import { GiCastle } from 'react-icons/gi';

// --- MOCK DATA (NẾU CẦN FAKE) ---
const fakeRanking = [
  { id: 1, username: 'Shadow Monarch', tasksCompleted: 42, percentage: 98, rank: 'S' },
  { id: 2, username: 'Thomas Andre', tasksCompleted: 38, percentage: 85, rank: 'A' },
  { id: 3, username: 'Cha Hae-In', tasksCompleted: 35, percentage: 78, rank: 'B' },
];

const fakeNotifications = [
  { id: 1, type: 'reset', title: 'Dungeon Reset in 2 Hours', message: 'Complete your current quests before the daily reset to maximize your rewards.', icon: <FaExclamationTriangle className="text-yellow-400 mr-3" size={20}/> },
  { id: 2, type: 'achievement', title: 'New Achievement Unlocked!', message: '"Consistent Hunter" - Completed 7 daily quests in a row. Reward: +50 EXP', icon: <FaTrophy className="text-green-400 mr-3" size={20}/> },
  { id: 3, type: 'guild', title: 'Guild Invitation', message: '"The Monarchs" guild has invited you to join their ranks. Accept invitation?', icon: <FaUsers className="text-blue-400 mr-3" size={20}/>, actions: true },
];
// --- KẾT THÚC MOCK DATA ---


// Hàm tính Level (giữ nguyên hoặc điều chỉnh)
function calculateLevel(exp) {
  if (exp < 100) return 1;
  if (exp < 300) return 2;
  if (exp < 600) return 3;
  if (exp < 1000) return 4;
  return 5; // Hoặc cao hơn
}

// Component TaskItem (Đơn giản hóa)
function TaskItem({ task, onUpdateStatus, onDeleteTask }) { // Thêm onDeleteTask
  const [isCompleted, setIsCompleted] = useState(task.status === 'Completed');
  const [loading, setLoading] = useState(false);

  const difficultyColor = {
    Easy: 'bg-green-500',
    Medium: 'bg-yellow-500',
    Hard: 'bg-red-500',
    'S-Rank': 'bg-purple-500', // Thêm S-Rank cho phù hợp UI
    'A-Rank': 'bg-orange-500',
    'B-Rank': 'bg-blue-500',
  };

  const handleStatusToggle = async () => {
    setLoading(true);
    const newStatus = isCompleted ? 'Pending' : 'Completed';
    try {
      await onUpdateStatus(task.id, newStatus);
      setIsCompleted(!isCompleted); // Cập nhật UI
      toast.success(`Quest "${task.title}" marked as ${newStatus}.`);
    } catch (error) {
      toast.error("Failed to update quest status.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xóa task (nếu cần nút xóa trên item)
  // const handleDelete = async () => {
  //   if (window.confirm(`Are you sure you want to delete quest: "${task.title}"?`)) {
  //     try {
  //       await onDeleteTask(task.id);
  //       toast.success(`Quest "${task.title}" deleted.`);
  //     } catch (error) {
  //       toast.error("Failed to delete quest.");
  //     }
  //   }
  // };

  return (
    <div className={`bg-gray-750 p-4 rounded-lg mb-3 border-l-4 ${isCompleted ? 'border-green-500 opacity-70' : `border-${difficultyColor[task.difficulty]?.split('-')[1] || 'gray'}-500`}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-lg font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-100'}`}>{task.title}</h3>
          {/* <p className="text-xs text-gray-400 mt-1">{task.description || "No description available."}</p> */}
          <p className="text-xs text-gray-500 mt-1">
            {/* Due: {task.deadline || "Not set"} • */}
            Difficulty: {task.difficulty}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${difficultyColor[task.difficulty] || 'bg-gray-500'} mb-2`}>
            {task.difficulty}
          </span>
          {/* <FaChevronRight className="text-gray-500 hover:text-gray-300 cursor-pointer" /> */}
        </div>
      </div>
      <div className="mt-2 flex items-center">
        <button
            onClick={handleStatusToggle}
            disabled={loading}
            className={`mr-2 p-2 rounded-full hover:bg-gray-600 focus:outline-none ${isCompleted ? 'text-green-400' : 'text-gray-400'}`}
            title={isCompleted ? "Mark as Pending" : "Mark as Completed"}
        >
            {isCompleted ? <FaCheckCircle size={20} /> : <FaCircle size={20} />}
        </button>
        {/* <button onClick={handleDelete} className="text-red-500 hover:text-red-400 text-xs">Delete</button> */}
      </div>
    </div>
  );
}


export default function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]); // Task đã lọc
  const [activeFilter, setActiveFilter] = useState('All'); // Filter: All, Completed
  const [ranking, setRanking] = useState(fakeRanking); // Dùng fake data trước
  const [notifications, setNotifications] = useState(fakeNotifications);

  const [showNewQuestModal, setShowNewQuestModal] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestDifficulty, setNewQuestDifficulty] = useState('Medium');


  const router = useRouter();

  // Fetch User Data (EXP, Level)
  const fetchUserData = async (token) => {
    try {
      const res = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) router.push('/login'); // Token hết hạn
        throw new Error('Failed to fetch user data');
      }
      const data = await res.json();
      setUserData(data);
      setUserLevel(calculateLevel(data.totalExp));
    } catch (err) {
      console.error("Fetch user data error:", err.message);
      toast.error(err.message);
    }
  };

  // Fetch Tasks
  const fetchTasks = async (token) => {
    try {
      const res = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch quests');
      const data = await res.json();
      setTasks(data);
      setFilteredTasks(data); // Ban đầu hiển thị tất cả
      setActiveFilter('All');
    } catch (err) {
      console.error("Fetch tasks error:", err.message);
      toast.error(err.message);
    }
  };

  // Fetch Ranking (Nếu có API thật)
  // const fetchRankingData = async () => {
  //   try {
  //     const res = await fetch('/api/ranking');
  //     if (!res.ok) throw new Error('Failed to fetch ranking');
  //     const data = await res.json();
  //     setRanking(data.slice(0, 3)); // Lấy top 3
  //   } catch (err) {
  //     console.error("Fetch ranking error:", err.message);
  //     // Giữ fakeRanking nếu lỗi
  //   }
  // };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUserData(token);
    fetchTasks(token);
    // fetchRankingData(); // Nếu có API ranking thật
  }, [router]);

  // Xử lý tạo Task mới
  const handleCreateQuest = async (e) => {
    e.preventDefault();
    if (!newQuestTitle) {
      toast.error("Quest title cannot be empty.");
      return;
    }
    const token = localStorage.getItem('authToken');
    const toastId = toast.loading("Creating new quest...");
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newQuestTitle, difficulty: newQuestDifficulty }),
      });
      toast.dismiss(toastId);
      if (!res.ok) throw new Error('Failed to create quest');
      const newTask = await res.json();
      setTasks([newTask, ...tasks]);
      // Cập nhật filteredTasks dựa trên activeFilter hiện tại
      if (activeFilter === 'All' || (activeFilter === 'Completed' && newTask.status === 'Completed')) {
        setFilteredTasks(currentFiltered => [newTask, ...currentFiltered]);
      } else if (activeFilter !== 'Completed' && newTask.status !== 'Completed') {
         setFilteredTasks(currentFiltered => [newTask, ...currentFiltered]);
      }

      setShowNewQuestModal(false);
      setNewQuestTitle('');
      setNewQuestDifficulty('Medium');
      toast.success("New quest added!");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.message);
    }
  };

  // Xử lý cập nhật trạng thái Task
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update quest status');
      const updatedTask = await res.json();

      // Cập nhật state tasks và filteredTasks
      const updatedTasks = tasks.map(t => t.id === taskId ? updatedTask : t);
      setTasks(updatedTasks);
      applyFilter(activeFilter, updatedTasks); // Áp dụng lại filter với tasks đã cập nhật

      if (updatedTask.status === 'Completed') {
        await fetchUserData(token); // Fetch lại user data để cập nhật EXP
      }
      return Promise.resolve(); // Trả về promise để TaskItem xử lý
    } catch (err) {
      console.error(err);
      return Promise.reject(err); // Trả về promise để TaskItem xử lý
    }
  };

  // Xử lý xóa Task (nếu cần)
  // const handleDeleteTask = async (taskId) => { ... }

  // Xử lý filter
  const applyFilter = (filter, sourceTasks = tasks) => {
    setActiveFilter(filter);
    if (filter === 'All') {
      setFilteredTasks(sourceTasks.filter(task => task.status !== 'Completed'));
    } else if (filter === 'Completed') {
      setFilteredTasks(sourceTasks.filter(task => task.status === 'Completed'));
    }
    // Thêm các filter khác nếu muốn (Daily, Work, etc. - cần thêm trường type cho Task)
  };


  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    router.push('/login');
    toast.success("Logged out successfully!");
  };

  // --- JSX CHO HEADER ĐƠN GIẢN ---
  const SimpleHeader = () => (
    <header className="bg-gray-800 text-gray-200 p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
      <div className="flex items-center">
        <GiCastle size={30} className="text-purple-400 mr-2" />
        <h1 className="text-2xl font-bold text-purple-400">TASK DUNGEON</h1>
      </div>
      <nav className="flex items-center space-x-4">
        {/* Các link menu khác có thể thêm sau */}
        {userData && (
            <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-md">
                <FaUserCircle className="text-purple-400" />
                <span className="text-sm">{userData.username}</span>
            </div>
        )}
        <button
          onClick={handleLogout}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150"
        >
          Logout
        </button>
      </nav>
    </header>
  );
  // --- KẾT THÚC JSX HEADER ---

  return (
    <>
      <Head>
        <title>Dashboard - Task Dungeon</title>
      </Head>
      <div className="min-h-screen bg-gray-900 text-gray-300">
        <SimpleHeader />

        <main className="p-4 md:p-8">
          {/* User Info Bar */}
          {userData && (
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-purple-400">
                  {userData.username.toUpperCase() || 'SHADOW MONARCH'}
                </h2>
                <p className="text-sm text-gray-400">
                  Level {userLevel} Hunter | Rank: {userLevel >= 5 ? 'S' : userLevel >= 3 ? 'A' : 'B'} {/* Rank đơn giản */}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">LEVEL</p>
                  <p className="text-2xl font-bold text-green-400">{userLevel}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">EXP</p>
                  <p className="text-xl font-bold text-yellow-400">{userData.totalExp} <span className="text-xs">/ {userLevel * 100 + (userLevel-1)*200 /* EXP cho level tiếp theo (ví dụ) */}</span></p>
                </div>
                {/* Gates - Tạm thời fake hoặc bỏ qua
                <div className="text-center bg-purple-600 p-2 rounded-md">
                  <p className="text-xs text-purple-200">GATES</p>
                  <p className="text-xl font-bold text-white">3/5</p>
                </div>
                */}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Dungeon Gates & Hunter Ranking */}
            <div className="lg:col-span-1 space-y-6">
              {/* DUNGEON GATES - Tạm thời FAKE/LOCKED */}
              <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-purple-400 mb-3 border-b border-gray-700 pb-2">DUNGEON GATES</h3>
                <div className="space-y-3">
                    <div className="bg-purple-600 p-3 rounded-md text-white relative">
                        Daily Quests
                        <span className="absolute top-2 right-2 text-xs bg-green-400 text-black px-2 py-0.5 rounded-full">Active</span>
                        <div className="w-full bg-purple-800 rounded-full h-1 mt-1">
                            <div className="bg-pink-500 h-1 rounded-full" style={{width: "75%"}}></div>
                        </div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-md text-gray-500 cursor-not-allowed">Weekly Challenges <span className="text-xs">(Locked)</span></div>
                    <div className="bg-gray-700 p-3 rounded-md text-gray-500 cursor-not-allowed">Boss Raid <span className="text-xs">(Locked - Lvl 50)</span></div>
                </div>
              </div>

              {/* HUNTER RANKING */}
              <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-purple-400 mb-3 border-b border-gray-700 pb-2">HUNTER RANKING</h3>
                <div className="space-y-2">
                  {ranking.slice(0,3).map((hunter, index) => ( // Hiển thị top 3
                    <div key={hunter.id} className={`p-3 rounded-md flex items-center justify-between text-white ${
                        index === 0 ? 'bg-red-600' : index === 1 ? 'bg-orange-500' : 'bg-green-500'
                    }`}>
                      <div className="flex items-center">
                        <span className="font-bold text-lg mr-2 bg-black bg-opacity-20 px-2 rounded">{hunter.rank || ['S','A','B'][index]}</span>
                        <div>
                            <p className="font-semibold">{hunter.username}</p>
                            <p className="text-xs opacity-80">{hunter.tasksCompleted || (40 - index*5)} tasks completed</p>
                        </div>
                      </div>
                      <span className="font-bold text-lg">{hunter.percentage || (90 - index*10)}%</span>
                    </div>
                  ))}
                </div>
                <Link href="/ranking" className="block text-center mt-4 text-purple-400 hover:text-purple-300 font-semibold">
                  View Full Ranking →
                </Link>
              </div>
            </div>

            {/* Main Content - Your Current Dungeon & System Notifications */}
            <div className="lg:col-span-2 space-y-6">
              {/* YOUR CURRENT DUNGEON */}
              <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                  <h3 className="text-xl font-semibold text-purple-400">YOUR CURRENT DUNGEON</h3>
                  <button
                    onClick={() => setShowNewQuestModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-lg flex items-center transition duration-150"
                  >
                    <FaPlus className="mr-2" /> New Quest
                  </button>
                </div>
                {/* Filter Buttons */}
                <div className="mb-4 flex space-x-2">
                  {['All', 'Completed'].map(filter => ( // Tạm thời chỉ có All và Completed
                    <button
                      key={filter}
                      onClick={() => applyFilter(filter)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition duration-150
                        ${activeFilter === filter ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}
                      `}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                {/* Task List */}
                {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => (
                    <TaskItem key={task.id} task={task} onUpdateStatus={handleUpdateTaskStatus} />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    {activeFilter === 'Completed' ? 'No completed quests yet.' : 'No active quests. Time to hunt!'}
                  </p>
                )}
              </div>

              {/* SYSTEM NOTIFICATIONS - FAKE */}
              <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-purple-400 mb-3 border-b border-gray-700 pb-2">SYSTEM NOTIFICATIONS</h3>
                <div className="space-y-3">
                  {notifications.map(notif => (
                    <div key={notif.id} className="bg-gray-750 p-3 rounded-md flex items-start">
                      {notif.icon}
                      <div>
                        <p className="font-semibold text-gray-200">{notif.title}</p>
                        <p className="text-xs text-gray-400">{notif.message}</p>
                        {notif.actions && (
                            <div className="mt-2 space-x-2">
                                <button className="text-xs bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded">Accept</button>
                                <button className="text-xs bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded">Decline</button>
                            </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* New Quest Modal */}
        {showNewQuestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
              <h2 className="text-2xl font-semibold text-purple-400 mb-4">Add New Quest</h2>
              <form onSubmit={handleCreateQuest}>
                <div className="mb-4">
                  <label htmlFor="questTitle" className="block text-sm font-medium text-gray-400 mb-1">Quest Title</label>
                  <input
                    type="text"
                    id="questTitle"
                    value={newQuestTitle}
                    onChange={(e) => setNewQuestTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., Defeat the Goblin King"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="questDifficulty" className="block text-sm font-medium text-gray-400 mb-1">Difficulty (Rank)</label>
                  <select
                    id="questDifficulty"
                    value={newQuestDifficulty}
                    onChange={(e) => setNewQuestDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="Easy">Easy (E-Rank)</option>
                    <option value="Medium">Medium (C-Rank)</option>
                    <option value="Hard">Hard (A-Rank)</option>
                    <option value="S-Rank">S-Rank (Legendary)</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewQuestModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md transition duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition duration-150"
                  >
                    Add Quest
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}