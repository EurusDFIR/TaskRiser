// monolithic-core/pages/ranking.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { FaTrophy, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
// Solo Leveling inspired icons (you might need to install react-icons if not already, e.g. `npm install react-icons`)
import { GiShadowFollower, GiDoubleDragon, GiRank3, GiSwordsEmblem, GiCrown } from 'react-icons/gi'; // GiCrown for #1
import { BsLightningChargeFill } from 'react-icons/bs'; // For S-Ranks

// --- SOLO LEVELING THEME ADJUSTMENTS ---

// Extended Level Calculation (more granularity for ranks)
function calculateLevel(exp) {
  if (exp < 100) return 1; // E
  if (exp < 300) return 2; // D
  if (exp < 600) return 3; // C
  if (exp < 1000) return 4; // B
  if (exp < 2000) return 5; // A
  if (exp < 5000) return 6; // S
  if (exp < 10000) return 7; // S+
  return 8; // National Level (or keep as S++)
}

// Solo Leveling Ranks
function determineRank(level) {
  if (level >= 8) return { name: 'NATIONAL', color: 'bg-gradient-to-r from-red-600 via-purple-600 to-blue-600', textColor: 'text-white', shadow: 'shadow-[0_0_25px_rgba(255,255,255,0.7)]' };
  if (level >= 7) return { name: 'S+', color: 'bg-purple-700', textColor: 'text-yellow-300', shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.7)]' }; // S-Rank Purple
  if (level >= 6) return { name: 'S', color: 'bg-purple-600', textColor: 'text-yellow-400', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.6)]' };
  if (level >= 5) return { name: 'A', color: 'bg-blue-600', textColor: 'text-white', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.6)]' };
  if (level >= 4) return { name: 'B', color: 'bg-cyan-500', textColor: 'text-gray-900', shadow: 'shadow-[0_0_12px_rgba(6,182,212,0.5)]' };
  if (level >= 3) return { name: 'C', color: 'bg-green-500', textColor: 'text-gray-900', shadow: 'shadow-[0_0_10px_rgba(34,197,94,0.5)]' };
  if (level >= 2) return { name: 'D', color: 'bg-yellow-500', textColor: 'text-gray-900', shadow: 'shadow-[0_0_8px_rgba(234,179,8,0.5)]' };
  return { name: 'E', color: 'bg-gray-600', textColor: 'text-white', shadow: 'shadow-[0_0_5px_rgba(107,114,128,0.5)]' };
}

// EXP needed for next level (adjust based on new levels)
function expForNextLevel(level) {
  if (level === 1) return 100; // To D
  if (level === 2) return 300; // To C
  if (level === 3) return 600; // To B
  if (level === 4) return 1000; // To A
  if (level === 5) return 2000; // To S
  if (level === 6) return 5000; // To S+
  if (level === 7) return 10000; // To National
  return 15000; // Max level, or next goal
}

// --- COMPONENT STYLING UPDATES ---

function TopPlayerCard({ player, position }) {
  const level = calculateLevel(player.totalExp);
  const rank = determineRank(level);
  
  const positionStyles = {
    1: { // Monarch / Absolute Being
      bgColor: 'bg-gradient-to-br from-gray-900 via-purple-900 to-black',
      borderColor: 'border-purple-500',
      numberBg: 'bg-purple-600',
      progressColor: 'from-purple-500 via-pink-500 to-red-500',
      icon: <GiCrown size={28} className="text-yellow-400" />,
      glow: rank.shadow, // Apply rank's glow
      sizeClass: 'scale-110 z-10', // Make #1 slightly bigger
    },
    2: {
      bgColor: 'bg-gradient-to-br from-gray-900 via-blue-900 to-black',
      borderColor: 'border-blue-500',
      numberBg: 'bg-blue-600',
      progressColor: 'from-blue-400 to-cyan-400',
      icon: <GiRank3 size={24} className="text-sky-300" />,
      glow: rank.shadow,
      sizeClass: 'mt-8', // Push down #2 and #3 slightly
    },
    3: {
      bgColor: 'bg-gradient-to-br from-gray-900 via-teal-900 to-black',
      borderColor: 'border-cyan-500',
      numberBg: 'bg-cyan-600',
      progressColor: 'from-teal-400 to-green-400',
      icon: <GiSwordsEmblem size={24} className="text-teal-300" />,
      glow: rank.shadow,
      sizeClass: 'mt-8',
    }
  };
  
  const style = positionStyles[position];
  const avatarLetter = player.username.charAt(0).toUpperCase();
  const expToNext = expForNextLevel(level);
  const currentExpInLevel = player.totalExp - (expForNextLevel(level -1 ) || 0); // Exp gained within current level
  const expProgressPercentage = Math.min((currentExpInLevel / (expToNext - (expForNextLevel(level-1) || 0))) * 100, 100);


  return (
    <div className={`relative transform transition-all duration-300 hover:scale-105 ${style.sizeClass}`}>
      <div className={`absolute -top-5 -left-5 ${style.numberBg} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-2xl z-20 border-2 border-gray-950 shadow-lg`}>
        {style.icon || position}
      </div>
      
      <div className={`${style.bgColor} rounded-xl border-2 ${style.borderColor} p-5 flex flex-col items-center ${style.glow} transition-shadow duration-300 hover:shadow-[0_0_30px_8px_rgba(R,G,B,0.8)]`}> {/* Replace R,G,B with actual color for hover if desired, or keep rank glow */}
        <div className={`w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-white text-3xl font-bold mb-3 border-2 border-gray-700 ${rank.textColor === 'text-white' ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-gray-500' : `ring-2 ring-offset-2 ring-offset-gray-800 ${rank.color.replace('bg-','ring-')}` }`}>
          {avatarLetter}
        </div>
        
        <h3 className="font-bold text-white text-xl truncate max-w-[150px] mb-1">{player.username}</h3>
        
        <div className={`mb-2 px-3 py-1 rounded-full text-sm font-semibold ${rank.color} ${rank.textColor} border border-black/20 flex items-center gap-1`}>
          {rank.name === 'S' || rank.name === 'S+' || rank.name === 'NATIONAL' ? <BsLightningChargeFill className="inline-block" /> : null}
          {rank.name}-Rank Hunter
        </div>
        
        <p className="text-slate-300 text-md">Level {level}</p>
        
        <div className="w-full bg-gray-700/50 h-3 rounded-full mt-3 mb-1 overflow-hidden border border-gray-600">
          <div className={`bg-gradient-to-r ${style.progressColor} h-full rounded-full`} style={{ width: `${expProgressPercentage}%` }}></div>
        </div>
        
        <p className="text-sky-400 font-semibold text-sm">{player.totalExp.toLocaleString()} EXP</p>
      </div>
    </div>
  );
}

function PlayerRow({ player, position }) {
  const level = calculateLevel(player.totalExp);
  const rank = determineRank(level);
  const avatarLetter = player.username.charAt(0).toUpperCase();
  
  const expToNext = expForNextLevel(level);
  const currentExpInLevel = player.totalExp - (expForNextLevel(level -1) || 0);
  const expProgressPercentage = Math.min((currentExpInLevel / (expToNext - (expForNextLevel(level-1) || 0))) * 100, 100);

  // Solo Leveling inspired titles
  const hunterTitles = [
    "Shadow Novice", "Mana Cultivator", "Gate Explorer", "Rift Walker",
    "Awakened Soul", "Elite Hunter", "Shadow Operative", "Artifact Seeker"
  ];
  const title = hunterTitles[position % hunterTitles.length]; // Cycle through titles

  return (
    <tr className={`border-b border-gray-700/50 hover:bg-gray-800/70 transition-colors group ${rank.shadow} hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]`}>
      <td className="py-4 px-4">
        <div className="flex items-center justify-center">
          <span className="text-slate-400 font-bold text-lg">{position}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold mr-4 border-2 border-gray-600 group-hover:border-sky-500 transition-colors ${rank.textColor === 'text-white' ? 'ring-1 ring-offset-1 ring-offset-gray-700 ring-gray-500' : `ring-1 ring-offset-1 ring-offset-gray-700 ${rank.color.replace('bg-','ring-')}` }`}>
            {avatarLetter}
          </div>
          <div>
            <p className="font-semibold text-lg text-slate-100 group-hover:text-sky-400 transition-colors">{player.username}</p>
            <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">{title}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-center">
        <span className={`font-bold text-slate-200 text-lg ${rank.textColor} px-2 py-0.5 rounded-md ${rank.color} text-sm`}>
          {rank.name}
        </span>
      </td>
      <td className="py-4 px-4 text-center">
        <span className="font-bold text-slate-200 text-lg">{level}</span>
      </td>
      <td className="py-4 px-4 min-w-[150px]">
        <div className="w-full bg-gray-600/50 h-2.5 rounded-full overflow-hidden border border-gray-500/50">
          <div className={`bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full`} style={{ width: `${expProgressPercentage}%` }}></div>
        </div>
        <p className="text-xs text-slate-500 text-center mt-1">{currentExpInLevel.toLocaleString()} / {(expToNext - (expForNextLevel(level-1) || 0)).toLocaleString()}</p>
      </td>
      <td className="py-4 px-4 text-right">
        <span className={`font-bold text-sky-400 text-lg`}>
          {player.totalExp.toLocaleString()} 
          <span className="text-xs text-slate-500 ml-1">EXP</span>
        </span>
      </td>
    </tr>
  );
}

export default function RankingPage() {
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // Show 7 players below top 3

  // Mock data - replace with API call
  useEffect(() => {
    const mockHunters = [
      { id: 1, username: 'Shadow Monarch', totalExp: 12500 },
      { id: 2, username: 'Void Walker', totalExp: 9800 },
      { id: 3, username: 'System Admin', totalExp: 8200 },
      { id: 4, username: 'Crimson Fang', totalExp: 7500 },
      { id: 5, username: 'Azure Knight', totalExp: 6800 },
      { id: 6, username: 'Gate Keeper', totalExp: 5500 },
      { id: 7, username: 'Rune Carver', totalExp: 4900 },
      { id: 8, username: 'Silent Assassin', totalExp: 4300 },
      { id: 9, username: 'Oracle Eye', totalExp: 3800 },
      { id: 10, username: 'Stone Fist', totalExp: 3200 },
      { id: 11, username: 'Wind Dancer', totalExp: 2800 },
      { id: 12, username: 'Light Bringer', totalExp: 2100 },
      { id: 13, username: 'Newbie Hunter', totalExp: 850 },
      { id: 14, username: 'Just Awakened', totalExp: 450 },
      { id: 15, username: 'Eager Beaver', totalExp: 150 },
      { id: 16, username: 'Fodder', totalExp: 50 },
    ].sort((a, b) => b.totalExp - a.totalExp); // Ensure sorted by EXP

    setLoading(true);
    setError('');
    setTimeout(() => { // Simulate API delay
        setRankingData(mockHunters);
        setLoading(false);
    }, 1000);
    // Replace with actual API call:
    // const fetchRanking = async () => {
    //   setLoading(true);
    //   setError('');
    //   try {
    //     const res = await fetch(`/api/ranking?filter=${timeFilter}&page=${currentPage}`);
    //     if (!res.ok) {
    //       throw new Error((await res.json()).message || 'Failed to fetch ranking');
    //     }
    //     const data = await res.json(); // Assuming API returns { players: [], totalPages: X }
    //     setRankingData(data.players);
    //     // setTotalPages(data.totalPages); 
    //   } catch (err) {
    //     setError(err.message);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchRanking();
  }, [timeFilter]); // Removed currentPage from dependencies for mock data

  const currentUser = {
    id: 10, // Example current user ID
    username: 'MyHunterSelf',
    totalExp: 3200, // Example EXP
    rank: 0, // Will be calculated
    positionsGained: 3,
    expNeeded: 0 // Will be calculated
  };

  // Calculate current user's rank and exp needed
  const currentUserRankInfo = rankingData.findIndex(p => p.id === currentUser.id);
  currentUser.rank = currentUserRankInfo !== -1 ? currentUserRankInfo + 1 : 'N/A';
  const currentUserLevel = calculateLevel(currentUser.totalExp);
  const expForNext = expForNextLevel(currentUserLevel);
  currentUser.expNeeded = expForNext - currentUser.totalExp;


  const top3Players = rankingData.slice(0, 3);
  const otherPlayers = rankingData.slice(3);
  
  // Pagination for otherPlayers
  const totalPages = Math.ceil(otherPlayers.length / itemsPerPage);
  const paginatedOtherPlayers = otherPlayers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  return (
    <>
      <Head>
        <title>TaskRiser - System Panel</title>
        {/* Optional: Add a Solo Leveling-esque favicon */}
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-[#caf0f8] via-[#ade8f4] to-[#90e0ef] text-[#03045e] font-['Orbitron',_sans-serif] backdrop-blur-xl">
        {/* Header */}
        <div className="bg-[#f8fdff]/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-[#90e0ef]/60 shadow-lg sticky top-0 z-50">
          <div className="flex items-center">
            <GiDoubleDragon size={36} className="text-purple-500 mr-3 drop-shadow-[0_0_5px_rgba(168,85,247,0.7)]" />
            <h1 className="text-3xl font-bold tracking-wider">
              <span className="text-purple-400">HUNTER</span> <span className="text-sky-400">RANKING</span>
            </h1>
          </div>
          <Link href="/dashboard" className="bg-gradient-to-r from-sky-600 to-purple-600 hover:from-sky-500 hover:to-purple-500 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-sky-500/50 transition-all duration-150 flex items-center">
            <FaChevronLeft className="mr-2 opacity-80" /> System Panel
          </Link>
        </div>
        
        <main className="container mx-auto p-4 md:p-8 max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-sky-400">
                    LEADERBOARD
                </span>
            </h1>
            <p className="text-slate-400 text-lg">Witness the Ascended Hunters of the System.</p>
          </div>
          
          <div className="flex justify-center md:justify-end mb-8 space-x-3">
            {['all', 'month', 'week'].map(filter => (
              <button 
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 border-2
                            ${timeFilter === filter 
                                ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/40' 
                                : 'bg-gray-800/60 border-gray-700 text-slate-400 hover:bg-gray-700/80 hover:border-sky-600 hover:text-sky-300'}`}
              >
                {filter === 'all' && <FaTrophy className="inline mr-2 mb-0.5" />}
                {filter.charAt(0).toUpperCase() + filter.slice(1)} {filter !== 'all' && 'Time'}
              </button>
            ))}
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-pulse flex flex-col items-center">
                <BsLightningChargeFill size={60} className="text-purple-500 mb-4" />
                <p className="text-xl text-purple-400 tracking-wider">ACCESSING SYSTEM DATA...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border-2 border-red-500/70 text-red-300 p-6 rounded-lg shadow-xl flex items-center gap-4">
              <BsLightningChargeFill size={40} className="text-red-400" />
              <div>
                <p className="font-bold text-xl">System Error:</p>
                <p className="text-lg">{error}</p>
                <p className="text-sm mt-1">Try reloading the System Panel.</p>
              </div>
            </div>
          ) : rankingData.length === 0 ? (
            <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700/50 shadow-lg">
              <GiShadowFollower size={80} className="text-slate-600 mx-auto mb-6" />
              <p className="text-3xl text-slate-400 font-semibold">No Hunter Data Available</p>
              <p className="text-slate-500 mt-3 text-lg">The Gates are quiet... for now. Be the first to make your mark!</p>
            </div>
          ) : (
            <>
              {top3Players.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 mb-12 items-end">
                  {/* Second Place */}
                  <div className="flex justify-center md:order-1">
                    {top3Players.length > 1 && (
                      <TopPlayerCard player={top3Players[1]} position={2} />
                    )}
                  </div>
                  {/* First Place */}
                  <div className="flex justify-center md:order-2">
                    {top3Players.length > 0 && (
                      <TopPlayerCard player={top3Players[0]} position={1} />
                    )}
                  </div>
                  {/* Third Place */}
                  <div className="flex justify-center md:order-3">
                    {top3Players.length > 2 && (
                      <TopPlayerCard player={top3Players[2]} position={3} />
                    )}
                  </div>
                </div>
              )}
              
              {paginatedOtherPlayers.length > 0 && (
                <div className="bg-gray-900/70 rounded-xl overflow-hidden shadow-2xl border border-gray-700/50 mb-8">
                  <table className="w-full">
                    <thead className="bg-black/30">
                      <tr className="border-b border-gray-700/50">
                        <th className="py-4 px-4 text-left text-sm font-semibold text-sky-400 uppercase tracking-wider w-20">Rank</th>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-sky-400 uppercase tracking-wider">Hunter</th>
                        <th className="py-4 px-4 text-center text-sm font-semibold text-sky-400 uppercase tracking-wider w-28">Class</th>
                        <th className="py-4 px-4 text-center text-sm font-semibold text-sky-400 uppercase tracking-wider w-24">Level</th>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-sky-400 uppercase tracking-wider min-w-[200px]">Progress</th>
                        <th className="py-4 px-4 text-right text-sm font-semibold text-sky-400 uppercase tracking-wider w-40">Total EXP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOtherPlayers.map((player, index) => (
                        <PlayerRow 
                            key={player.id} 
                            player={player} 
                            position={(currentPage - 1) * itemsPerPage + index + 4} // +4 because 1,2,3 are top
                        />
                      ))}
                    </tbody>
                  </table>
                  
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center p-5 border-t border-gray-700/50 bg-black/20">
                      <button 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors ${currentPage === 1 ? 'text-gray-600 cursor-not-allowed bg-gray-800/50' : 'text-sky-400 hover:bg-sky-600/30 hover:text-sky-300 bg-gray-800/80 border border-sky-700/50'}`}
                      >
                        <FaChevronLeft className="mr-2" /> Previous Gate
                      </button>
                      
                      <div className="text-sm text-slate-400">
                        Page {currentPage} of {totalPages}
                      </div>
                      
                      <button 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors ${currentPage === totalPages ? 'text-gray-600 cursor-not-allowed bg-gray-800/50' : 'text-sky-400 hover:bg-sky-600/30 hover:text-sky-300 bg-gray-800/80 border border-sky-700/50'}`}
                      >
                        Next Gate <FaChevronRight className="ml-2" />
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Your Position - Styled like a System Window */}
              <div className="bg-gradient-to-br from-gray-900 via-blue-950 to-black rounded-xl p-6 md:p-8 shadow-xl border-2 border-sky-700/50 relative overflow-hidden">
                <div className="absolute -top-2 -left-2 w-16 h-16 bg-sky-500 rounded-full opacity-30 blur-2xl"></div>
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-purple-500 rounded-full opacity-30 blur-2xl"></div>
                
                <h2 className="text-3xl font-bold text-sky-300 mb-6 relative z-10">
                  <BsLightningChargeFill className="inline mr-2 text-sky-400 animate-pulse" />
                  Your Hunter Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center relative z-10">
                  <div>
                    <div className="text-5xl font-bold text-white mb-1">
                      {currentUser.rank}
                      {typeof currentUser.rank === 'number' && <span className="text-2xl text-slate-400">th</span>}
                    </div>
                    <div className="text-sm text-slate-400 uppercase tracking-wider">Current Rank</div>
                  </div>
                  
                  <div>
                    <div className="text-5xl font-bold text-green-400 mb-1">+{currentUser.positionsGained}</div>
                    <div className="text-sm text-slate-400 uppercase tracking-wider">Potential Rank Up</div>
                  </div>
                  
                  <div>
                    <div className="text-5xl font-bold text-yellow-400 mb-1">{currentUser.expNeeded > 0 ? currentUser.expNeeded.toLocaleString() : 'MAX'}</div>
                    <div className="text-sm text-slate-400 uppercase tracking-wider">EXP to Next Awakening</div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-sky-800/50 text-center">
                    <p className="text-slate-500">System Alert: Keep clearing Dungeons to ascend further, Hunter {currentUser.username}!</p>
                </div>
              </div>
            </>
          )}
        </main>
        <footer className="text-center py-8 border-t border-purple-600/20 text-sm text-slate-600">
            Solo Leveling Inspired Ranking System © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  );
}