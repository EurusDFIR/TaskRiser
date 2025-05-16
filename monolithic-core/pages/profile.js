// pages/profile.js
import { useState } from 'react';
import Head from 'next/head';
import { FaCog, FaTasks, FaCheckCircle, FaLock, FaMedal, FaTrophy, FaUserCircle, FaEyeSlash } from 'react-icons/fa';
import { GiSpikedDragonHead, GiSkills } from 'react-icons/gi';
import LeftPane from '../src/app/LeftPane';

// Fake data for MVP
const fakeUser = {
  username: 'ShadowMonarch',
  level: 7,
  exp: 4250,
  expToNext: 5000,
  tasksDone: 142,
  totalExp: 14000,
};
const fakeExpHistory = [1000, 2000, 3000, 4000, 4250]; // For line chart
const fakeTaskStats = [
  { day: 'Mon', completed: 2, pending: 1 },
  { day: 'Tue', completed: 3, pending: 0 },
  { day: 'Wed', completed: 1, pending: 2 },
  { day: 'Thu', completed: 2, pending: 1 },
  { day: 'Fri', completed: 4, pending: 0 },
  { day: 'Sat', completed: 2, pending: 1 },
  { day: 'Sun', completed: 1, pending: 2 },
];
const fakeSkills = [
  { name: 'Quick Learner', desc: '+10% EXP', icon: <GiSkills />, unlocked: true },
  { name: 'Time Master', desc: 'Deadline +1 day', icon: <FaCog />, unlocked: true },
  { name: 'Task Multiplier', desc: '2x rewards', icon: <FaTasks />, unlocked: false },
  { name: 'Dungeon Vision', desc: 'See hidden tasks', icon: <FaEyeSlash />, unlocked: false },
];
const fakeAchievements = [
  { name: 'First Blood', desc: 'Complete your first task', icon: <FaCheckCircle />, unlocked: true },
  { name: 'Task Apprentice', desc: 'Complete 10 tasks', icon: <FaMedal />, unlocked: true },
  { name: 'Streak Master', desc: '7-day streak', icon: <FaTrophy />, unlocked: false },
  { name: 'Overachiever', desc: 'Complete 50 tasks', icon: <FaTrophy />, unlocked: false },
];

export default function ProfilePage() {
  const [user] = useState(fakeUser);
  const [expHistory] = useState(fakeExpHistory);
  const [taskStats] = useState(fakeTaskStats);
  const [skills] = useState(fakeSkills);
  const [achievements] = useState(fakeAchievements);

  // Calculate progress
  const expPercent = Math.min((user.exp / user.expToNext) * 100, 100);
  const unlockedSkills = skills.filter(s => s.unlocked).length;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  return (
    <>
      <Head>
        <title>Profile - TaskRiser</title>
      </Head>
      <div className="min-h-screen bg-[#caf0f8] text-[#03045e] font-['Orbitron',_sans-serif] flex">
        <LeftPane userData={user} onLogout={() => {}} activePath="/profile" />
        <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
          <div className="flex justify-between items-center p-6 pb-2">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <GiSpikedDragonHead className="text-[#0077b6]" size={32} />
              Profile
            </h1>
            <button className="p-2 rounded-full bg-[#ade8f4] hover:bg-[#90e0ef] border border-[#90e0ef] text-[#0077b6] transition-all">
              <FaCog size={22} />
            </button>
          </div>
          {/* Personal Info & Overview */}
          <section className="bg-[#f8fdff]/80 rounded-xl shadow-xl border border-[#90e0ef]/60 p-6 mx-4 mt-2 flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex flex-col items-center w-full md:w-1/3">
              <div className="w-28 h-28 rounded-full bg-[#90e0ef] flex items-center justify-center text-[#0077b6] text-6xl shadow-lg mb-3">
                <FaUserCircle />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-1">{user.username}</h2>
                <div className="text-lg font-semibold text-[#00b4d8]">Level {user.level}</div>
                <div className="mt-2">
                  <div className="w-40 h-3 bg-[#ade8f4] rounded-full overflow-hidden border border-[#90e0ef] mx-auto">
                    <div className="bg-[#00b4d8] h-full rounded-full transition-all duration-500" style={{ width: `${expPercent}%` }}></div>
                  </div>
                  <div className="text-xs text-[#0077b6] mt-1">
                    EXP: {user.exp.toLocaleString('en-US')} / {user.expToNext.toLocaleString('en-US')}<br />
                    Level {user.level + 1} in {(user.expToNext - user.exp).toLocaleString('en-US')} EXP
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                <div className="bg-[#ade8f4] rounded-lg p-3 text-center shadow border border-[#90e0ef]">
                  <div className="text-lg font-bold text-[#0077b6]">{user.tasksDone.toLocaleString('en-US')}</div>
                  <div className="text-xs text-[#0096c7]">Tasks Done</div>
                </div>
                <div className="bg-[#ade8f4] rounded-lg p-3 text-center shadow border border-[#90e0ef]">
                  <div className="text-lg font-bold text-[#0077b6]">{user.totalExp.toLocaleString('en-US')}</div>
                  <div className="text-xs text-[#0096c7]">Total EXP</div>
                </div>
              </div>
            </div>
            {/* Charts */}
            <div className="flex-1 flex flex-col gap-8 w-full">
              {/* EXP Progress Chart (Line) */}
              <div className="bg-[#ade8f4]/60 rounded-lg p-4 shadow border border-[#90e0ef]">
                <div className="font-semibold mb-2 text-[#0077b6]">EXP Progress</div>
                <div className="w-full h-32 flex items-end gap-2">
                  {/* Fake line chart */}
                  {expHistory.map((exp, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="w-2 rounded-full bg-[#00b4d8]" style={{ height: `${(exp / user.expToNext) * 100}%`, minHeight: '10px' }}></div>
                      <div className="text-[10px] text-[#0077b6] mt-1">{`Day ${i + 1}`}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Task Completion Chart (Bar) */}
              <div className="bg-[#ade8f4]/60 rounded-lg p-4 shadow border border-[#90e0ef]">
                <div className="font-semibold mb-2 text-[#0077b6]">Task Completion (7 days)</div>
                <div className="w-full h-32 flex items-end gap-2">
                  {taskStats.map((stat, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="flex gap-0.5 h-full items-end">
                        <div className="w-2 bg-[#00b4d8] rounded-t" style={{ height: `${stat.completed * 15}px` }} title="Completed"></div>
                        <div className="w-2 bg-[#90e0ef] rounded-t" style={{ height: `${stat.pending * 15}px` }} title="Pending"></div>
                      </div>
                      <div className="text-[10px] text-[#0077b6] mt-1">{stat.day}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          {/* Skills & Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Unlocked Skills */}
            <section className="bg-[#f8fdff]/80 rounded-xl shadow-xl border border-[#90e0ef]/60 p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-lg text-[#0077b6] flex items-center gap-2">
                  <GiSkills className="text-[#00b4d8]" /> Unlocked Skills
                </div>
                <div className="text-xs text-[#0096c7]">{unlockedSkills}/{skills.length} unlocked</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {skills.map((skill, i) => (
                  <div key={i} className={`rounded-lg p-4 flex flex-col items-center border shadow transition-all ${skill.unlocked ? 'bg-[#ade8f4] border-[#00b4d8]' : 'bg-[#caf0f8] border-[#90e0ef] opacity-60 grayscale'}`}>
                    <div className="text-3xl mb-2">{skill.icon}</div>
                    <div className="font-semibold text-[#0077b6] mb-1">{skill.name}</div>
                    <div className="text-xs text-[#0096c7] mb-1">{skill.desc}</div>
                    <div className={`text-xs font-bold ${skill.unlocked ? 'text-green-600' : 'text-gray-400'}`}>{skill.unlocked ? 'Unlocked' : 'Locked'}</div>
                  </div>
                ))}
              </div>
            </section>
            {/* Achievements */}
            <section className="bg-[#f8fdff]/80 rounded-xl shadow-xl border border-[#90e0ef]/60 p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-lg text-[#0077b6] flex items-center gap-2">
                  <FaTrophy className="text-[#00b4d8]" /> Achievements
                </div>
                <div className="text-xs text-[#0096c7]">{unlockedAchievements}/{achievements.length} unlocked</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {achievements.map((ach, i) => (
                  <div key={i} className={`rounded-lg p-4 flex flex-col items-center border shadow transition-all ${ach.unlocked ? 'bg-[#ade8f4] border-[#00b4d8]' : 'bg-[#caf0f8] border-[#90e0ef] opacity-60 grayscale'}`}>
                    <div className="text-3xl mb-2">{ach.icon}</div>
                    <div className="font-semibold text-[#0077b6] mb-1">{ach.name}</div>
                    <div className="text-xs text-[#0096c7] mb-1">{ach.desc}</div>
                    <div className={`text-xs font-bold ${ach.unlocked ? 'text-yellow-600' : 'text-gray-400'}`}>{ach.unlocked ? 'Unlocked' : 'Locked'}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
