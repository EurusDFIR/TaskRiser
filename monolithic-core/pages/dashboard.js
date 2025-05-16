// monolithic-core/pages/dashboard.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  FaPlus, FaUserCircle, FaBell, FaTrophy, FaExclamationTriangle,
  FaUsers, FaCheckCircle, FaRegCircle, FaSignOutAlt, FaCog // Added more icons
} from 'react-icons/fa';
import {
  GiDoubleDragon, GiPortal, GiRank3, GiSwordsEmblem, GiCrown,
  GiShadowFollower, GiCrystalGrowth, GiSpikedDragonHead, GiLightningTear, GiLockedFortress
} from 'react-icons/gi';
import { BsLightningChargeFill, BsGearFill, BsBarChartFill, BsUiChecksGrid, BsExclamationOctagonFill, BsInfoCircleFill } from 'react-icons/bs';

// --- SOLO LEVELING UTILITY FUNCTIONS (Ideally import from a shared utils file) ---
function calculateLevel(exp) {
  if (exp < 100) return 1;  // E
  if (exp < 300) return 2;  // D
  if (exp < 600) return 3;  // C
  if (exp < 1000) return 4; // B
  if (exp < 2000) return 5; // A
  if (exp < 5000) return 6; // S
  if (exp < 10000) return 7; // S+
  return 8;                 // National
}

function determineRank(level) {
  if (level >= 8) return { name: 'NATIONAL', color: 'bg-gradient-to-r from-red-600 via-purple-600 to-blue-600', textColor: 'text-white', shadow: 'shadow-[0_0_15px_rgba(255,255,255,0.6)]', borderColor: 'border-purple-500', icon: <GiCrown className="inline-block mr-1" /> };
  if (level >= 7) return { name: 'S+', color: 'bg-purple-700', textColor: 'text-yellow-300', shadow: 'shadow-[0_0_12px_rgba(168,85,247,0.6)]', borderColor: 'border-purple-600', icon: <BsLightningChargeFill className="inline-block mr-1" /> };
  if (level >= 6) return { name: 'S', color: 'bg-purple-600', textColor: 'text-yellow-400', shadow: 'shadow-[0_0_10px_rgba(168,85,247,0.5)]', borderColor: 'border-purple-500', icon: <BsLightningChargeFill className="inline-block mr-1" /> };
  if (level >= 5) return { name: 'A', color: 'bg-blue-600', textColor: 'text-white', shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]', borderColor: 'border-blue-500', icon: <GiRank3 className="inline-block mr-1" /> };
  if (level >= 4) return { name: 'B', color: 'bg-sky-500', textColor: 'text-gray-900', shadow: 'shadow-[0_0_8px_rgba(6,182,212,0.4)]', borderColor: 'border-sky-500', icon: <GiSwordsEmblem className="inline-block mr-1" /> };
  if (level >= 3) return { name: 'C', color: 'bg-green-500', textColor: 'text-gray-900', shadow: 'shadow-[0_0_6px_rgba(34,197,94,0.4)]', borderColor: 'border-green-500' };
  if (level >= 2) return { name: 'D', color: 'bg-yellow-500', textColor: 'text-gray-900', shadow: 'shadow-[0_0_5px_rgba(234,179,8,0.4)]', borderColor: 'border-yellow-500' };
  return { name: 'E', color: 'bg-gray-500', textColor: 'text-white', shadow: 'shadow-[0_0_4px_rgba(107,114,128,0.4)]', borderColor: 'border-gray-500' };
}

function expForNextLevelBoundary(level) { // Returns the EXP needed TO REACH this level
  if (level <= 1) return 0;    // E starts at 0
  if (level === 2) return 100;  // D starts at 100
  if (level === 3) return 300;  // C starts at 300
  if (level === 4) return 600;  // B starts at 600
  if (level === 5) return 1000; // A starts at 1000
  if (level === 6) return 2000; // S starts at 2000
  if (level === 7) return 5000; // S+ starts at 5000
  if (level === 8) return 10000; // National starts at 10000
  return Infinity; // For levels beyond National
}

const taskDifficultyToRank = (difficultyName) => {
    switch (difficultyName?.toLowerCase()) {
        case 's-rank': case 'legendary': return determineRank(6);
        case 'a-rank': case 'hard': return determineRank(5);
        case 'b-rank': return determineRank(4);
        case 'c-rank': case 'medium': return determineRank(3);
        case 'd-rank': return determineRank(2);
        case 'e-rank': case 'easy': default: return determineRank(1);
    }
};
// --- END SOLO LEVELING UTILITY FUNCTIONS ---


// --- SOLO LEVELING THEMED MOCK DATA ---
const fakeRankingSL = [
  { id: 1, username: 'Shadow Monarch', tasksCompleted: 102, totalExp: 12500 },
  { id: 2, username: 'Beast Monarch', tasksCompleted: 88, totalExp: 9800 },
  { id: 3, username: 'Iron Body Monarch', tasksCompleted: 75, totalExp: 8200 },
];

const fakeNotificationsSL = [
  { id: 1, type: 'system_alert', title: '[SYSTEM] Emergency Quest Issued!', message: 'Unidentified High-Rank Gate detected in Sector Gamma. All available A-Rank and above Hunters deploy immediately. Reward: Significant EXP & Unique Artifact.', icon: <BsExclamationOctagonFill className="text-red-400 mr-3 shrink-0" size={24}/> },
  { id: 2, type: 'achievement', title: '[SYSTEM] Title Unlocked: "Gate Conqueror"', message: 'Successfully cleared 10 D-Rank Gates. Passive Mana Regeneration +5%.', icon: <FaTrophy className="text-yellow-400 mr-3 shrink-0" size={24}/> },
  { id: 3, type: 'guild_invite', title: '[SYSTEM] Guild Invitation Received', message: 'The "Ahjin Guild" (Guildmaster: Sung Jinwoo) has extended an invitation. Their current focus is S-Rank Gate subjugation.', icon: <FaUsers className="text-sky-400 mr-3 shrink-0" size={24}/>, actions: true },
  { id: 4, type: 'daily_reset', title: '[SYSTEM] Daily Quest Log Reset', message: 'Your daily quests have been refreshed. New challenges await, Hunter.', icon: <BsUiChecksGrid className="text-green-400 mr-3 shrink-0" size={24}/> },
];
// --- END MOCK DATA ---


// --- SOLO LEVELING THEMED COMPONENTS ---
function TaskItem({ task, onUpdateStatus }) {
  const [isCompleted, setIsCompleted] = useState(task.status === 'Completed');
  const [loading, setLoading] = useState(false);
  const taskRank = taskDifficultyToRank(task.difficulty);

  const handleStatusToggle = async () => {
    setLoading(true);
    const newStatus = isCompleted ? 'Pending' : 'Completed'; // Assuming 'Pending' is the non-completed state
    try {
      await onUpdateStatus(task.id, newStatus);
      setIsCompleted(!isCompleted);
      toast.success(`Quest "${task.title}" status updated.`, {
        iconTheme: { primary: '#8b5cf6', secondary: '#fff' },
        style: { background: '#1f2937', color: '#e5e7eb', border: '1px solid #374151' },
      });
    } catch (error) {
      toast.error("Failed to update quest status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative bg-gray-800/70 p-4 rounded-lg mb-4 border-l-4 ${isCompleted ? `${taskRank.borderColor} opacity-60` : taskRank.borderColor} ${taskRank.shadow} hover:shadow-[0_0_15px_rgba(100,100,255,0.3)] transition-all duration-200 group`}>
      <div className={`absolute -top-2 -right-2 px-2 py-0.5 text-xs font-bold rounded ${taskRank.color} ${taskRank.textColor} border border-black/20`}>
        {taskRank.icon} {task.difficulty || taskRank.name + '-Rank'}
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-lg font-semibold ${isCompleted ? 'line-through text-slate-500' : 'text-sky-300 group-hover:text-sky-200'} transition-colors`}>{task.title}</h3>
          <p className="text-xs text-slate-400 mt-1">
            Status: <span className={isCompleted ? "text-green-400" : "text-yellow-400"}>{isCompleted ? "CLEARED" : "ACTIVE"}</span>
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-purple-400">
          EXP Reward: <span className="font-bold">{task.expReward || (taskRank.level * 50 + 20)}</span> {/* Placeholder EXP */}
        </div>
        <button
            onClick={handleStatusToggle}
            disabled={loading}
            className={`p-2 rounded-full transition-colors
                        ${isCompleted ? 'text-green-400 hover:bg-green-500/20' : 'text-slate-400 hover:text-sky-400 hover:bg-sky-500/20'}
                        focus:outline-none focus:ring-2 focus:ring-purple-500`}
            title={isCompleted ? "Re-Open Quest" : "Mark as Cleared"}
        >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-400"></div> : (isCompleted ? <FaCheckCircle size={22} /> : <FaRegCircle size={22} />)}
        </button>
      </div>
    </div>
  );
}

function SystemHeader({ userData, onLogout }) {
  return (
    <header className="bg-black/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-purple-600/50 shadow-xl sticky top-0 z-50">
      <div className="flex items-center">
        <GiSpikedDragonHead size={40} className="text-purple-500 mr-3 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider">
          <span className="text-purple-400">SYSTEM</span> <span className="text-sky-400">INTERFACE</span>
        </h1>
      </div>
      <nav className="flex items-center space-x-3 md:space-x-4">
        {userData && (
            <div className="hidden md:flex items-center space-x-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50">
                <FaUserCircle className="text-sky-400" size={18}/>
                <span className="text-sm font-semibold text-slate-300">{userData.username}</span>
            </div>
        )}
        {/* <button className="p-2 text-slate-400 hover:text-sky-300 transition-colors rounded-full hover:bg-gray-700/50">
            <BsGearFill size={20} />
        </button> */}
        <button
          onClick={onLogout}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold py-2 px-3 md:px-4 rounded-lg shadow-md hover:shadow-red-500/50 transition-all duration-150 flex items-center text-sm"
        >
          <FaSignOutAlt className="mr-2 opacity-90" /> LOGOUT
        </button>
      </nav>
    </header>
  );
}
// --- END SOLO LEVELING THEMED COMPONENTS ---


export default function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  const [userRank, setUserRank] = useState(determineRank(1));
  const [expProgress, setExpProgress] = useState(0);
  const [expToNext, setExpToNext] = useState(expForNextLevelBoundary(2));


  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Active'); // Active, Cleared
  const [ranking, setRanking] = useState(fakeRankingSL);
  const [notifications, setNotifications] = useState(fakeNotificationsSL);

  const [showNewQuestModal, setShowNewQuestModal] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestDifficulty, setNewQuestDifficulty] = useState('E-Rank'); // Default to E-Rank


  const router = useRouter();

  const updateUserProfile = (data) => {
    setUserData(data);
    const currentLevel = calculateLevel(data.totalExp);
    setUserLevel(currentLevel);
    setUserRank(determineRank(currentLevel));

    const expForCurrentLevelBoundary = expForNextLevelBoundary(currentLevel);
    const expForNextLevelBoundaryVal = expForNextLevelBoundary(currentLevel + 1);
    
    setExpToNext(expForNextLevelBoundaryVal);
    
    if (expForNextLevelBoundaryVal === Infinity) {
        setExpProgress(100); // Max level
    } else {
        const expInCurrentLevel = data.totalExp - expForCurrentLevelBoundary;
        const expNeededForLevelUp = expForNextLevelBoundaryVal - expForCurrentLevelBoundary;
        setExpProgress(Math.min((expInCurrentLevel / expNeededForLevelUp) * 100, 100));
    }
  };

  const fetchUserData = async (token) => {
    try {
      const res = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) router.push('/login');
        throw new Error('Failed to fetch user data');
      }
      const data = await res.json();
      updateUserProfile(data);
    } catch (err) {
      console.error("Fetch user data error:", err.message);
      toast.error(err.message);
    }
  };

  const fetchTasks = async (token) => {
    try {
      const res = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch quests');
      let data = await res.json();
      // Add placeholder expReward if missing, for styling
      data = data.map(task => ({...task, expReward: task.expReward || (taskDifficultyToRank(task.difficulty).level * 50 + 20)}));
      setTasks(data);
      applyFilter('Active', data); // Default to active tasks
    } catch (err) {
      console.error("Fetch tasks error:", err.message);
      toast.error(err.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
    // Simulate initial user data for styling if API is slow or for dev
    // setUserData({ username: 'TEMP_HUNTER', totalExp: 50 }); 
    // setUserLevel(calculateLevel(50));
    // setUserRank(determineRank(calculateLevel(50)));

    fetchUserData(token);
    fetchTasks(token);
  }, [router]);

  const handleCreateQuest = async (e) => {
    e.preventDefault();
    if (!newQuestTitle) {
      toast.error("Quest title cannot be empty.", { style: { background: '#1f2937', color: '#e5e7eb', border: '1px solid #374151' } });
      return;
    }
    const token = localStorage.getItem('authToken');
    const toastId = toast.loading("Assigning New Quest...", { style: { background: '#1f2937', color: '#e5e7eb', border: '1px solid #374151' } });
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newQuestTitle, difficulty: newQuestDifficulty, status: 'Pending' }), // Ensure status is Pending
      });
      toast.dismiss(toastId);
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to create quest');
      const newTask = await res.json();
      newTask.expReward = newTask.expReward || (taskDifficultyToRank(newTask.difficulty).level * 50 + 20); // Add placeholder exp

      const newTasks = [newTask, ...tasks];
      setTasks(newTasks);
      applyFilter(activeFilter, newTasks); // Re-apply filter

      setShowNewQuestModal(false);
      setNewQuestTitle('');
      setNewQuestDifficulty('E-Rank');
      toast.success("New Quest Registered in System!", { iconTheme: { primary: '#8b5cf6', secondary: '#fff' }, style: { background: '#1f2937', color: '#e5e7eb', border: '1px solid #374151' } });
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.message, { style: { background: '#1f2937', color: '#e5e7eb', border: '1px solid #374151' } });
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update quest status');
      const updatedTaskData = await res.json();
      updatedTaskData.expReward = updatedTaskData.expReward || (taskDifficultyToRank(updatedTaskData.difficulty).level * 50 + 20);


      const updatedTasks = tasks.map(t => t.id === taskId ? updatedTaskData : t);
      setTasks(updatedTasks);
      applyFilter(activeFilter, updatedTasks);

      if (updatedTaskData.status === 'Completed') {
        await fetchUserData(token); // Refresh user data for EXP and level up
      }
      return Promise.resolve();
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  };

  const applyFilter = (filter, sourceTasks = tasks) => {
    setActiveFilter(filter);
    if (filter === 'Active') {
      setFilteredTasks(sourceTasks.filter(task => task.status !== 'Completed'));
    } else if (filter === 'Cleared') {
      setFilteredTasks(sourceTasks.filter(task => task.status === 'Completed'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    // localStorage.removeItem('userData'); // Not typically stored this way
    router.push('/login');
    toast.success("System Logout Successful.", { style: { background: '#1f2937', color: '#e5e7eb', border: '1px solid #374151' } });
  };

  return (
    <>
      <Head>
        <title>System Interface - Hunter Dashboard</title>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      </Head>
      <div className="min-h-screen bg-gray-950 text-slate-300 font-['Orbitron',_sans-serif]">
        <SystemHeader userData={userData} onLogout={handleLogout} />

        <main className="p-4 md:p-6 lg:p-8">
          {/* User Info Bar - Solo Leveling Style */}
          {userData && (
            <div className="bg-gradient-to-br from-gray-900 via-purple-950 to-black p-4 md:p-5 rounded-xl shadow-2xl mb-6 md:mb-8 border-2 border-purple-700/60 relative overflow-hidden">
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-sky-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-center relative z-10">
                <div className="mb-4 md:mb-0 text-center md:text-left">
                  <h2 className="text-3xl lg:text-4xl font-black tracking-wider text-sky-300 drop-shadow-[0_1px_3px_rgba(125,211,252,0.7)]">
                    {userData.username.toUpperCase() || 'HUNTER'}
                  </h2>
                  <p className={`mt-1 text-md font-semibold px-3 py-0.5 rounded-full inline-block ${userRank.color} ${userRank.textColor} ${userRank.shadow} border border-black/20`}>
                    {userRank.icon} {userRank.name}-Rank Hunter
                  </p>
                </div>
                <div className="flex items-center space-x-4 md:space-x-6">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase">LEVEL</p>
                    <p className="text-3xl font-bold text-green-400">{userLevel}</p>
                  </div>
                  <div className="w-px h-10 bg-gray-700/50"></div>
                  <div className="text-center min-w-[100px] md:min-w-[120px]">
                    <p className="text-xs text-slate-500 uppercase">TOTAL EXP</p>
                    <p className="text-xl font-bold text-yellow-400">{userData.totalExp?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 relative z-10">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>EXP Progress (To Lv. {userLevel + 1})</span>
                    <span>{expProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700/50 h-3.5 rounded-full overflow-hidden border border-gray-600/50 shadow-inner">
                    <div 
                        className="bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-400 h-full rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${expProgress}%` }}
                    ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1 text-right">
                    {expToNext === Infinity ? "Max Level Reached" : `${(expToNext - userData.totalExp).toLocaleString()} EXP to next Awakening`}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column: Gates & Hunter Ranking */}
            <div className="lg:col-span-1 space-y-6 md:space-y-8">
              {/* AVAILABLE GATES */}
              <div className="bg-gray-800/80 p-4 md:p-5 rounded-xl shadow-xl border border-sky-700/40">
                <h3 className="text-xl font-bold text-sky-400 mb-4 border-b-2 border-sky-600/30 pb-2 flex items-center">
                    <GiPortal className="mr-2 text-sky-500" size={24}/> AVAILABLE GATES
                </h3>
                <div className="space-y-3">
                    {/* Example Gate Items - you'd map real data here */}
                    <div className="bg-gradient-to-r from-purple-600/80 to-purple-700/90 p-3.5 rounded-lg text-white relative shadow-lg border border-purple-500/50 hover:shadow-purple-500/40 transition-shadow cursor-pointer group">
                        <span className="absolute top-1.5 right-1.5 text-xs bg-green-400/90 text-black px-2 py-0.5 rounded-full font-semibold shadow-sm">ACTIVE</span>
                        <p className="font-semibold text-md group-hover:text-yellow-300 transition-colors">Daily Obliteration Quests</p>
                        <p className="text-xs opacity-80 mt-0.5">Type: Repetitive | Difficulty: E ~ C</p>
                        <div className="w-full bg-purple-900/70 rounded-full h-1.5 mt-2 overflow-hidden border border-purple-950/50">
                            <div className="bg-pink-500 h-full" style={{width: "75%"}}></div>
                        </div>
                    </div>
                    <div className="bg-gray-700/70 p-3.5 rounded-lg text-slate-500 relative border border-gray-600/50 cursor-not-allowed group">
                        <GiLockedFortress className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-600 group-hover:text-red-500 transition-colors" size={20}/>
                        <p className="font-semibold text-md">Weekly Monarch Hunt</p>
                        <p className="text-xs opacity-80 mt-0.5">Type: Limited | Difficulty: A ~ S <span className="text-red-500 font-bold">(LOCKED)</span></p>
                    </div>
                    <div className="bg-gray-700/70 p-3.5 rounded-lg text-slate-500 relative border border-gray-600/50 cursor-not-allowed group">
                        <GiLockedFortress className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-600 group-hover:text-red-500 transition-colors" size={20}/>
                        <p className="font-semibold text-md">Dimensional Boss Raid</p>
                        <p className="text-xs opacity-80 mt-0.5">Type: Cataclysm | Difficulty: S+ <span className="text-red-500 font-bold">(LOCKED - LVL 7 REQ)</span></p>
                    </div>
                </div>
              </div>

              {/* HUNTER RANKING PREVIEW */}
              <div className="bg-gray-800/80 p-4 md:p-5 rounded-xl shadow-xl border border-yellow-600/40">
                <h3 className="text-xl font-bold text-yellow-400 mb-4 border-b-2 border-yellow-600/30 pb-2 flex items-center">
                    <BsBarChartFill className="mr-2 text-yellow-500" size={22}/> TOP HUNTERS
                </h3>
                <div className="space-y-2.5">
                  {ranking.slice(0,3).map((hunter, index) => {
                    const rankInfo = determineRank(calculateLevel(hunter.totalExp));
                    return (
                      <div key={hunter.id} className={`p-3 rounded-lg flex items-center justify-between text-white shadow-md border ${rankInfo.borderColor}/70 ${rankInfo.color} transition-transform hover:scale-[1.02]`}>
                        <div className="flex items-center">
                          <span className={`font-bold text-lg mr-3 ${rankInfo.textColor} px-2 py-0.5 rounded bg-black/20`}>{rankInfo.icon || index + 1}</span>
                          <div>
                              <p className={`font-semibold ${rankInfo.textColor}`}>{hunter.username}</p>
                              <p className={`text-xs opacity-80 ${rankInfo.textColor}`}>{hunter.tasksCompleted} Quests Cleared</p>
                          </div>
                        </div>
                        <span className={`font-bold text-lg ${rankInfo.textColor}`}>{hunter.totalExp.toLocaleString()} EXP</span>
                      </div>
                    );
                  })}
                </div>
                <Link href="/ranking" className="block text-center mt-5 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors group">
                  Access Full Ranking Archive <span className="opacity-70 group-hover:opacity-100 transition-opacity ml-1">→</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Quests & Notifications */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* ACTIVE QUEST LOG */}
              <div className="bg-gray-800/80 p-4 md:p-5 rounded-xl shadow-xl border border-purple-700/40">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 border-b-2 border-purple-600/30 pb-3">
                  <h3 className="text-xl font-bold text-purple-400 mb-2 sm:mb-0 flex items-center">
                    <BsUiChecksGrid className="mr-2 text-purple-500" size={24}/> ACTIVE QUEST LOG
                  </h3>
                  <button
                    onClick={() => setShowNewQuestModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-purple-500/50 transition-all duration-150 flex items-center justify-center text-sm"
                  >
                    <FaPlus className="mr-2" /> Register New Quest
                  </button>
                </div>
                <div className="mb-4 flex space-x-2">
                  {['Active', 'Cleared'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => applyFilter(filter)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border-2
                        ${activeFilter === filter 
                            ? 'bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/30' 
                            : 'bg-gray-700/60 border-gray-600/80 text-slate-400 hover:bg-gray-600/80 hover:border-purple-600 hover:text-purple-300'}
                      `}
                    >
                      {filter} Quests
                    </button>
                  ))}
                </div>
                {filteredTasks.length > 0 ? (
                  <div className="max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                    {filteredTasks.map(task => (
                      <TaskItem key={task.id} task={task} onUpdateStatus={handleUpdateTaskStatus} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <GiShadowFollower size={50} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 text-lg">
                      {activeFilter === 'Cleared' ? 'No quests cleared yet.' : 'System Awaiting New Quest Directives...'}
                    </p>
                  </div>
                )}
              </div>

              {/* SYSTEM NOTIFICATIONS */}
              <div className="bg-gray-800/80 p-4 md:p-5 rounded-xl shadow-xl border border-red-700/40">
                <h3 className="text-xl font-bold text-red-400 mb-4 border-b-2 border-red-600/30 pb-2 flex items-center">
                    <FaBell className="mr-2 text-red-500 animate-pulse" size={22}/> SYSTEM ALERTS
                </h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                  {notifications.map(notif => (
                    <div key={notif.id} className="bg-gray-900/60 p-3.5 rounded-lg flex items-start border border-gray-700/70 shadow-md hover:border-sky-500/50 transition-colors">
                      <div className="pt-0.5">{notif.icon}</div>
                      <div>
                        <p className="font-semibold text-slate-200 text-md">{notif.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{notif.message}</p>
                        {notif.actions && (
                            <div className="mt-2.5 space-x-2">
                                <button className="text-xs bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded font-semibold shadow-sm hover:shadow-md transition-all">ACCEPT</button>
                                <button className="text-xs bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded font-semibold shadow-sm hover:shadow-md transition-all">DECLINE</button>
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

        {/* New Quest Modal - Solo Leveling Style */}
        {showNewQuestModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-gradient-to-br from-gray-900 via-purple-950 to-black p-6 rounded-xl shadow-2xl w-full max-w-lg border-2 border-purple-600/70 relative">
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-purple-500 rounded-full opacity-20 blur-xl animate-ping"></div>
              <h2 className="text-2xl font-bold text-purple-300 mb-5 flex items-center">
                <BsLightningChargeFill className="mr-2 text-purple-400" /> Register New Quest Directive
              </h2>
              <form onSubmit={handleCreateQuest}>
                <div className="mb-4">
                  <label htmlFor="questTitle" className="block text-sm font-medium text-sky-300 mb-1">Quest Objective:</label>
                  <input
                    type="text"
                    id="questTitle"
                    value={newQuestTitle}
                    onChange={(e) => setNewQuestTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800/70 border-2 border-gray-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="e.g., Subjugate Red Gate in Sector Delta"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="questDifficulty" className="block text-sm font-medium text-sky-300 mb-1">Threat Level (Rank):</label>
                  <select
                    id="questDifficulty"
                    value={newQuestDifficulty}
                    onChange={(e) => setNewQuestDifficulty(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800/70 border-2 border-gray-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    {['E-Rank', 'D-Rank', 'C-Rank', 'B-Rank', 'A-Rank', 'S-Rank'].map(rank => (
                        <option key={rank} value={rank}>{rank} (Difficulty: {taskDifficultyToRank(rank).name})</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewQuestModal(false)}
                    className="px-5 py-2 text-sm font-semibold text-slate-300 bg-gray-700/80 hover:bg-gray-600/90 rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-150"
                  >
                    Abort Directive
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-lg shadow-md hover:shadow-purple-500/50 transition-all duration-150"
                  >
                    Initiate Quest
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(55, 65, 81, 0.5); /* bg-gray-700 with opacity */
                border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #8b5cf6; /* purple-500 */
                border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #a78bfa; /* purple-400 */
            }
        `}</style>
      </div>
    </>
  );
}