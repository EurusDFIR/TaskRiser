// monolithic-core/pages/dashboard.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import toast from 'react-hot-toast';
import {
  FaPlus, FaBell,
} from 'react-icons/fa';
import { BsLightningChargeFill, BsUiChecksGrid } from 'react-icons/bs';
import { GiPortal, GiLockedFortress, GiShadowFollower } from 'react-icons/gi';
import { calculateLevel, determineRank, expForNextLevelBoundary, taskDifficultyToRank } from '../src/app/utils/soloLeveling';

import TaskItem from '../src/app/TaskItem';
import SystemHeader from '../src/app/SystemHeader';
import RankingPreview from '../src/app/RankingPreview';
import LeftPane from '../src/app/LeftPane';

const difficultyOptions = [
  { value: 'E-Rank', label: 'E-Rank (Easy)' },
  { value: 'D-Rank', label: 'D-Rank (Medium)' },
  { value: 'C-Rank', label: 'C-Rank (Challenging)' },
  { value: 'B-Rank', label: 'B-Rank (Hard)' },
  { value: 'A-Rank', label: 'A-Rank (Very Hard)' },
  { value: 'S-Rank', label: 'S-Rank (Legendary)' },
];

export default function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  const [userRank, setUserRank] = useState(determineRank(1));
  const [expProgress, setExpProgress] = useState(0);
  const [expToNext, setExpToNext] = useState(expForNextLevelBoundary(2));


  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Active'); // Active, Cleared

  const [ranking] = useState([
    { id: 1, username: 'Shadow Monarch', tasksCompleted: 102, totalExp: 12500 },
    { id: 2, username: 'Beast Monarch', tasksCompleted: 88, totalExp: 9800 },
    { id: 3, username: 'Iron Body Monarch', tasksCompleted: 75, totalExp: 8200 },
  ]);
  const [notifications] = useState([
    { id: 1, type: 'system_alert', title: '[SYSTEM] Emergency Quest Issued!', message: 'Unidentified High-Rank Gate detected in Sector Gamma. All available A-Rank and above Hunters deploy immediately. Reward: Significant EXP & Unique Artifact.', icon: <BsUiChecksGrid className="text-red-400 mr-3 shrink-0" size={24}/> },
    { id: 2, type: 'achievement', title: '[SYSTEM] Title Unlocked: "Gate Conqueror"', message: 'Successfully cleared 10 D-Rank Gates. Passive Mana Regeneration +5%.', icon: <BsLightningChargeFill className="text-yellow-400 mr-3 shrink-0" size={24}/> },
    { id: 3, type: 'guild_invite', title: '[SYSTEM] Guild Invitation Received', message: 'The "Ahjin Guild" (Guildmaster: Sung Jinwoo) has extended an invitation. Their current focus is S-Rank Gate subjugation.', icon: <FaPlus className="text-sky-400 mr-3 shrink-0" size={24}/>, actions: true },
    { id: 4, type: 'daily_reset', title: '[SYSTEM] Daily Quest Log Reset', message: 'Your daily quests have been refreshed. New challenges await, Hunter.', icon: <FaBell className="text-green-400 mr-3 shrink-0" size={24}/> },
  ]);


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

  const [showNewQuestModal, setShowNewQuestModal] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestDifficulty, setNewQuestDifficulty] = useState('E-Rank');

  return (
    <>
      <Head>
        <title>TaskRiser - Hunter Dashboard</title>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      </Head>
      <div className="min-h-screen bg-[#caf0f8] text-[#03045e] font-['Orbitron',_sans-serif] flex">
        {/* Left Navigation Pane */}
        <LeftPane userData={userData} onLogout={handleLogout} activePath={typeof window !== 'undefined' ? window.location.pathname : ''} />
        {/* Main Content Area */}
        <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
          {/* Optionally keep SystemHeader for mobile/topbar, or remove if redundant */}
          {/* <SystemHeader userData={userData} onLogout={handleLogout} /> */}
          <main className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
            {/* User Info Bar */}
            {userData && (
              <div className="bg-[#90e0ef] p-4 md:p-5 rounded-xl shadow mb-6 md:mb-8 border border-[#48cae4]/40">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="mb-4 md:mb-0 text-center md:text-left">
                    <h2 className="text-2xl lg:text-3xl font-bold tracking-wider text-[#0077b6]">
                      {userData.username.toUpperCase() || 'HUNTER'}
                    </h2>
                    <p className={`mt-1 text-sm font-semibold px-3 py-0.5 rounded-full inline-block ${userRank.color} ${userRank.textColor} border border-[#00b4d8]/30 bg-[#ade8f4]`}>
                      {userRank.icon} {userRank.name}-Rank
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 md:space-x-6">
                    <div className="text-center">
                      <p className="text-xs text-[#0096c7]/80 uppercase">LEVEL</p>
                      <p className="text-2xl font-bold text-[#0077b6]">{userLevel}</p>
                    </div>
                    <div className="w-px h-8 bg-[#48cae4]/30"></div>
                    <div className="text-center min-w-[90px] md:min-w-[110px]">
                      <p className="text-xs text-[#0096c7]/80 uppercase">TOTAL EXP</p>
                      <p className="text-lg font-bold text-[#03045e]">{userData.totalExp?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-[#0077b6]/70 mb-1">
                    <span>EXP Progress (To Lv. {userLevel + 1})</span>
                    <span>{expProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#ade8f4] h-2.5 rounded-full overflow-hidden border border-[#48cae4]/30">
                    <div className="bg-[#00b4d8] h-full rounded-full transition-all duration-500" style={{ width: `${expProgress}%` }}></div>
                  </div>
                  <p className="text-xs text-[#0077b6]/70 mt-1 text-right">
                    {expToNext === Infinity ? "Max Level Reached" : `${(expToNext - userData.totalExp).toLocaleString()} EXP to next Awakening`}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Left Column: Gates & Hunter Ranking */}
              <div className="lg:col-span-1 space-y-6 md:space-y-8">
                {/* AVAILABLE GATES */}
                <div className="bg-[#ade8f4] p-4 md:p-5 rounded-xl shadow-xl border border-[#48cae4]/40">
                  <h3 className="text-xl font-bold text-[#0077b6] mb-4 border-b-2 border-[#00b4d8]/20 pb-2 flex items-center">
                      <GiPortal className="mr-2 text-[#0096c7]" size={24}/> AVAILABLE GATES
                  </h3>
                  <div className="space-y-3">
                      {/* Example Gate Items - you'd map real data here */}
                      <div className="bg-gradient-to-r from-[#0096c7]/80 to-[#00b4d8]/90 p-3.5 rounded-lg text-white relative shadow-lg border border-[#0077b6]/30 hover:shadow-[#00b4d8]/30 transition-shadow cursor-pointer group">
                          <span className="absolute top-1.5 right-1.5 text-xs bg-[#48cae4]/90 text-[#03045e] px-2 py-0.5 rounded-full font-semibold shadow-sm">ACTIVE</span>
                          <p className="font-semibold text-md group-hover:text-[#caf0f8] transition-colors">Daily Obliteration Quests</p>
                          <p className="text-xs opacity-80 mt-0.5">Type: Repetitive | Difficulty: E ~ C</p>
                          <div className="w-full bg-[#023e8a]/70 rounded-full h-1.5 mt-2 overflow-hidden border border-[#03045e]/30">
                              <div className="bg-[#48cae4] h-full" style={{width: "75%"}}></div>
                          </div>
                      </div>
                      <div className="bg-[#caf0f8] p-3.5 rounded-lg text-[#90e0ef] relative border border-[#90e0ef]/60 cursor-not-allowed group">
                          <GiLockedFortress className="absolute top-1/2 right-3 -translate-y-1/2 text-[#90e0ef] group-hover:text-[#0077b6] transition-colors" size={20}/>
                          <p className="font-semibold text-md">Weekly Monarch Hunt</p>
                          <p className="text-xs opacity-80 mt-0.5">Type: Limited | Difficulty: A ~ S <span className="text-[#0077b6] font-bold">(LOCKED)</span></p>
                      </div>
                      <div className="bg-[#caf0f8] p-3.5 rounded-lg text-[#90e0ef] relative border border-[#90e0ef]/60 cursor-not-allowed group">
                          <GiLockedFortress className="absolute top-1/2 right-3 -translate-y-1/2 text-[#90e0ef] group-hover:text-[#0077b6] transition-colors" size={20}/>
                          <p className="font-semibold text-md">Dimensional Boss Raid</p>
                          <p className="text-xs opacity-80 mt-0.5">Type: Cataclysm | Difficulty: S+ <span className="text-[#0077b6] font-bold">(LOCKED - LVL 7 REQ)</span></p>
                      </div>
                  </div>
                </div>

                {/* HUNTER RANKING PREVIEW */}
                <RankingPreview ranking={ranking} />
              </div>

              {/* Right Column: Quests & Notifications */}
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                {/* ACTIVE QUEST LOG */}
                <div className="bg-[#ade8f4] p-4 md:p-5 rounded-xl shadow-xl border border-[#48cae4]/40">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 border-b-2 border-[#00b4d8]/20 pb-3">
                    <h3 className="text-xl font-bold text-[#0077b6] mb-2 sm:mb-0 flex items-center">
                      <BsUiChecksGrid className="mr-2 text-[#0096c7]" size={24}/> ACTIVE QUEST LOG
                    </h3>
                    <button
                      onClick={() => setShowNewQuestModal(true)}
                      className="bg-gradient-to-r from-[#0096c7] to-[#00b4d8] hover:from-[#0077b6] hover:to-[#0096c7] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-[#48cae4]/40 transition-all duration-150 flex items-center justify-center text-sm"
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
                              ? 'bg-[#00b4d8] border-[#0096c7] text-white shadow-lg shadow-[#48cae4]/30' 
                              : 'bg-[#caf0f8] border-[#90e0ef] text-[#0077b6] hover:bg-[#ade8f4] hover:border-[#00b4d8] hover:text-[#0096c7]'}
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
                    <div className="text-center py-8 bg-[#caf0f8] rounded-lg border border-[#90e0ef]">
                      <GiShadowFollower size={50} className="text-[#90e0ef] mx-auto mb-3" />
                      <p className="text-[#90e0ef] text-lg">
                        {activeFilter === 'Cleared' ? 'No quests cleared yet.' : 'System Awaiting New Quest Directives...'}
                      </p>
                    </div>
                  )}
                </div>

                {/* SYSTEM NOTIFICATIONS */}
                <div className="bg-[#ade8f4] p-4 md:p-5 rounded-xl shadow-xl border border-[#48cae4]/40">
                  <h3 className="text-xl font-bold text-[#0077b6] mb-4 border-b-2 border-[#00b4d8]/20 pb-2 flex items-center">
                      <FaBell className="mr-2 text-[#0096c7] animate-pulse" size={22}/> SYSTEM ALERTS
                  </h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {notifications.map(notif => (
                      <div key={notif.id} className="bg-[#caf0f8] p-3.5 rounded-lg flex items-start border border-[#90e0ef] shadow-md hover:border-[#00b4d8]/40 transition-colors">
                        <div className="pt-0.5">{notif.icon}</div>
                        <div>
                          <p className="font-semibold text-[#0077b6] text-md">{notif.title}</p>
                          <p className="text-xs text-[#0096c7] mt-0.5">{notif.message}</p>
                          {notif.actions && (
                              <div className="mt-2.5 space-x-2">
                                  <button className="text-xs bg-[#48cae4] hover:bg-[#00b4d8] text-[#03045e] py-1 px-3 rounded font-semibold shadow-sm hover:shadow-md transition-all">ACCEPT</button>
                                  <button className="text-xs bg-[#0077b6] hover:bg-[#023e8a] text-white py-1 px-3 rounded font-semibold shadow-sm hover:shadow-md transition-all">DECLINE</button>
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
        </div>
      </div>
      {/* New Quest Modal - Solo Leveling Style */}
      {showNewQuestModal && (
        <div className="fixed inset-0 bg-[#03045e]/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-gradient-to-br from-[#023e8a] via-[#0077b6] to-[#0096c7] p-6 rounded-xl shadow-2xl w-full max-w-lg border-2 border-[#00b4d8]/70 relative">
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-[#00b4d8] rounded-full opacity-20 blur-xl animate-ping"></div>
            <h2 className="text-2xl font-bold text-[#caf0f8] mb-5 flex items-center">
              <BsLightningChargeFill className="mr-2 text-[#48cae4]" /> Register New Quest Directive
            </h2>
            <form onSubmit={handleCreateQuest}>
              <div className="mb-4">
                <label htmlFor="questTitle" className="block text-sm font-medium text-[#48cae4] mb-1">Quest Objective:</label>
                <input
                  type="text"
                  id="questTitle"
                  value={newQuestTitle}
                  onChange={(e) => setNewQuestTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#caf0f8] border-2 border-[#90e0ef] rounded-md text-[#03045e] placeholder-[#90e0ef] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] transition-colors"
                  placeholder="e.g., Subjugate Red Gate in Sector Delta"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="questDifficulty" className="block text-sm font-medium text-[#48cae4] mb-1">Threat Level (Rank):</label>
                <select
                  id="questDifficulty"
                  value={newQuestDifficulty}
                  onChange={(e) => setNewQuestDifficulty(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#caf0f8] border-2 border-[#90e0ef] rounded-md text-[#03045e] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] transition-colors"
                >
                  {difficultyOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewQuestModal(false)}
                  className="px-5 py-2 text-sm font-semibold text-[#0077b6] bg-[#90e0ef] hover:bg-[#48cae4] rounded-lg border border-[#90e0ef] hover:border-[#00b4d8] transition-all duration-150"
                >
                  Abort Directive
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#0096c7] to-[#00b4d8] hover:from-[#0077b6] hover:to-[#0096c7] rounded-lg shadow-md hover:shadow-[#48cae4]/40 transition-all duration-150"
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
              background: #ade8f4;
              border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #00b4d8;
              border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #48cae4;
          }
      `}</style>
    </>
  );
}