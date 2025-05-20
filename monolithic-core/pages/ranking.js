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
  if (level >= 8) return { name: 'NATIONAL', color: 'bg-gradient-to-r from-[#023e8a] via-[#0077b6] to-[#0096c7]', textColor: 'text-white', shadow: 'shadow-[0_0_25px_rgba(0,180,216,0.7)]' };
  if (level >= 7) return { name: 'S+', color: 'bg-[#023e8a]', textColor: 'text-white', shadow: 'shadow-[0_0_20px_rgba(0,119,182,0.7)]' };
  if (level >= 6) return { name: 'S', color: 'bg-[#0077b6]', textColor: 'text-white', shadow: 'shadow-[0_0_15px_rgba(0,119,182,0.6)]' };
  if (level >= 5) return { name: 'A', color: 'bg-[#0096c7]', textColor: 'text-white', shadow: 'shadow-[0_0_15px_rgba(0,150,199,0.6)]' };
  if (level >= 4) return { name: 'B', color: 'bg-[#00b4d8]', textColor: 'text-white', shadow: 'shadow-[0_0_12px_rgba(0,180,216,0.5)]' };
  if (level >= 3) return { name: 'C', color: 'bg-[#48cae4]', textColor: 'text-[#03045e]', shadow: 'shadow-[0_0_10px_rgba(72,202,228,0.5)]' };
  if (level >= 2) return { name: 'D', color: 'bg-[#90e0ef]', textColor: 'text-[#03045e]', shadow: 'shadow-[0_0_8px_rgba(144,224,239,0.5)]' };
  return { name: 'E', color: 'bg-[#ade8f4]', textColor: 'text-[#03045e]', shadow: 'shadow-[0_0_5px_rgba(173,232,244,0.5)]' };
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
      bgColor: 'bg-gradient-to-br from-[#023e8a] via-[#0077b6] to-[#0096c7]',
      borderColor: 'border-[#00b4d8]',
      numberBg: 'bg-[#0077b6]',
      progressColor: 'from-[#0096c7] via-[#00b4d8] to-[#48cae4]',
      icon: <GiCrown size={28} className="text-[#ade8f4]" />,
      glow: rank.shadow, // Apply rank's glow
      sizeClass: 'scale-110 z-10', // Make #1 slightly bigger
    },
    2: {
      bgColor: 'bg-gradient-to-br from-[#0077b6] via-[#0096c7] to-[#00b4d8]',
      borderColor: 'border-[#48cae4]',
      numberBg: 'bg-[#0096c7]',
      progressColor: 'from-[#00b4d8] to-[#48cae4]',
      icon: <GiRank3 size={24} className="text-[#ade8f4]" />,
      glow: rank.shadow,
      sizeClass: 'mt-8', // Push down #2 and #3 slightly
    },
    3: {
      bgColor: 'bg-gradient-to-br from-[#0096c7] via-[#00b4d8] to-[#48cae4]',
      borderColor: 'border-[#90e0ef]',
      numberBg: 'bg-[#00b4d8]',
      progressColor: 'from-[#48cae4] to-[#90e0ef]',
      icon: <GiSwordsEmblem size={24} className="text-[#caf0f8]" />,
      glow: rank.shadow,
      sizeClass: 'mt-8',
    }
  };

  const style = positionStyles[position];
  const avatarLetter = player.username.charAt(0).toUpperCase();
  const expToNext = expForNextLevel(level);
  const currentExpInLevel = player.totalExp - (expForNextLevel(level - 1) || 0); // Exp gained within current level
  const expProgressPercentage = Math.min((currentExpInLevel / (expToNext - (expForNextLevel(level - 1) || 0))) * 100, 100);


  return (
    <div className={`relative transform transition-all duration-300 hover:scale-105 ${style.sizeClass}`}>
      <div className={`absolute -top-5 -left-5 ${style.numberBg} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-2xl z-20 border-2 border-[#caf0f8] shadow-lg`}>
        {style.icon || position}
      </div>

      <div className={`${style.bgColor} rounded-xl border-2 ${style.borderColor} p-5 flex flex-col items-center ${style.glow} transition-shadow duration-300 hover:shadow-[0_0_30px_8px_rgba(0,180,216,0.8)]`}>
        <div className={`w-24 h-24 rounded-full bg-[#caf0f8] flex items-center justify-center text-[#0077b6] text-3xl font-bold mb-3 border-2 border-[#90e0ef] ${rank.textColor === 'text-white' ? 'ring-2 ring-offset-2 ring-offset-[#0096c7] ring-[#ade8f4]' : `ring-2 ring-offset-2 ring-offset-[#0096c7] ${rank.color.replace('bg-', 'ring-')}`}`}>
          {avatarLetter}
        </div>

        <h3 className="font-bold text-white text-xl truncate max-w-[150px] mb-1">{player.username}</h3>

        <div className={`mb-2 px-3 py-1 rounded-full text-sm font-semibold ${rank.color} ${rank.textColor} border border-[#caf0f8]/20 flex items-center gap-1`}>
          {rank.name === 'S' || rank.name === 'S+' || rank.name === 'NATIONAL' ? <BsLightningChargeFill className="inline-block" /> : null}
          {rank.name}-Rank Hunter
        </div>

        <p className="text-[#caf0f8] text-md">Level {level}</p>

        <div className="w-full bg-[#caf0f8]/30 h-3 rounded-full mt-3 mb-1 overflow-hidden border border-[#90e0ef]/30">
          <div className={`bg-gradient-to-r ${style.progressColor} h-full rounded-full`} style={{ width: `${expProgressPercentage}%` }}></div>
        </div>

        <p className="text-[#ade8f4] font-semibold text-sm">{player.totalExp.toLocaleString()} EXP</p>
      </div>
    </div>
  );
}

function PlayerRow({ player, position }) {
  const level = calculateLevel(player.totalExp);
  const rank = determineRank(level);
  const avatarLetter = player.username.charAt(0).toUpperCase();

  const expToNext = expForNextLevel(level);
  const currentExpInLevel = player.totalExp - (expForNextLevel(level - 1) || 0);
  const expProgressPercentage = Math.min((currentExpInLevel / (expToNext - (expForNextLevel(level - 1) || 0))) * 100, 100);

  // Solo Leveling inspired titles
  const hunterTitles = [
    "Shadow Novice", "Mana Cultivator", "Gate Explorer", "Rift Walker",
    "Awakened Soul", "Elite Hunter", "Shadow Operative", "Artifact Seeker"
  ];
  const title = hunterTitles[position % hunterTitles.length]; // Cycle through titles

  return (
    <tr className={`border-b border-[#90e0ef]/30 hover:bg-[#caf0f8]/10 transition-colors group ${rank.shadow} hover:shadow-[0_0_20px_rgba(0,180,216,0.4)]`}>
      <td className="py-4 px-4">
        <div className="flex items-center justify-center">
          <span className="text-[#90e0ef] font-bold text-lg">{position}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-full bg-[#ade8f4] flex items-center justify-center text-[#0077b6] font-bold mr-4 border-2 border-[#90e0ef] group-hover:border-[#00b4d8] transition-colors ${rank.textColor === 'text-white' ? 'ring-1 ring-offset-1 ring-offset-[#0096c7] ring-[#ade8f4]' : `ring-1 ring-offset-1 ring-offset-[#0096c7] ${rank.color.replace('bg-', 'ring-')}`}`}>
            {avatarLetter}
          </div>
          <div>
            <p className="font-semibold text-lg text-[#0077b6] group-hover:text-[#00b4d8] transition-colors">{player.username}</p>
            <p className="text-xs text-[#48cae4] group-hover:text-[#0096c7] transition-colors">{title}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-center">
        <span className={`font-bold text-[#0077b6] text-lg ${rank.textColor} px-2 py-0.5 rounded-md ${rank.color} text-sm`}>
          {rank.name}
        </span>
      </td>
      <td className="py-4 px-4 text-center">
        <span className="font-bold text-[#0077b6] text-lg">{level}</span>
      </td>
      <td className="py-4 px-4 min-w-[150px]">
        <div className="w-full bg-[#ade8f4]/50 h-2.5 rounded-full overflow-hidden border border-[#90e0ef]/50">
          <div className={`bg-gradient-to-r from-[#0096c7] to-[#48cae4] h-full rounded-full`} style={{ width: `${expProgressPercentage}%` }}></div>
        </div>
        <p className="text-xs text-[#48cae4] text-center mt-1">{currentExpInLevel.toLocaleString()} / {(expToNext - (expForNextLevel(level - 1) || 0)).toLocaleString()}</p>
      </td>
      <td className="py-4 px-4 text-right">
        <span className={`font-bold text-[#00b4d8] text-lg`}>
          {player.totalExp.toLocaleString()}
          <span className="text-xs text-[#48cae4] ml-1">EXP</span>
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
  const [totalPages, setTotalPages] = useState(1);
  const [awardingExp, setAwardingExp] = useState(false);
  const [expAmount, setExpAmount] = useState(100);
  const [expMessage, setExpMessage] = useState(null);
  const [seedingUsers, setSeedingUsers] = useState(false);
  const [seedMessage, setSeedMessage] = useState(null);
  const [seedCount, setSeedCount] = useState(5);
  const itemsPerPage = 7; // Số lượng người chơi hiển thị trên mỗi trang (ngoài top 3)

  // Hàm cập nhật EXP cho người dùng hiện tại
  const updateUserExp = async () => {
    try {
      setAwardingExp(true);
      setExpMessage(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        setExpMessage({ type: 'error', text: 'You need to log in first!' });
        return;
      }

      const res = await fetch('/api/users/update-exp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ expAmount })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to award EXP');
      }

      // Hiển thị thông báo thành công
      setExpMessage({
        type: 'success',
        text: `Awarded ${data.expGained} EXP! (${data.previousExp} → ${data.newExp})`
      });

      // Làm mới dữ liệu bảng xếp hạng
      fetchRanking();

    } catch (error) {
      console.error('Error updating EXP:', error);
      setExpMessage({ type: 'error', text: error.message });
    } finally {
      setAwardingExp(false);
    }
  };

  // Hàm để fetch dữ liệu xếp hạng
  const fetchRanking = async () => {
    setLoading(true);
    setError('');
    try {
      // Gọi API endpoint để lấy dữ liệu xếp hạng
      const res = await fetch(`/api/users/ranking?filter=${timeFilter}&page=${currentPage}&limit=${itemsPerPage + 3}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch ranking data');
      }

      const data = await res.json();
      setRankingData(data.players || []);
      setTotalPages(data.totalPages || 1);

    } catch (err) {
      console.error('Error fetching ranking data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Tải dữ liệu từ API thay vì sử dụng dữ liệu mẫu
  useEffect(() => {
    fetchRanking();
  }, [timeFilter, currentPage, itemsPerPage]);

  const [currentUserData, setCurrentUserData] = useState({
    id: 0,
    username: 'Loading...',
    totalExp: 0,
    rank: 0,
    positionsGained: 0,
    expNeeded: 0
  });

  // Lấy thông tin người dùng hiện tại
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const res = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) return;

        const userData = await res.json();

        // Tìm vị trí của người dùng trong bảng xếp hạng
        const userRankIndex = rankingData.findIndex(player => player.id === userData.id);
        const userRank = userRankIndex !== -1 ? userRankIndex + 1 : 'N/A';

        // Tính toán các thông tin cần thiết
        const userLevel = calculateLevel(userData.totalExp);
        const expForNext = expForNextLevel(userLevel);
        const expNeeded = expForNext - userData.totalExp;

        // Giả lập vị trí có thể tăng lên (trong ứng dụng thực tế, điều này có thể dựa trên 
        // dữ liệu thực hoặc dự đoán dựa trên mức độ hoạt động)
        const positionsGained = 3;

        setCurrentUserData({
          ...userData,
          rank: userRank,
          positionsGained,
          expNeeded
        });
      } catch (error) {
        console.error('Error fetching current user data:', error);
      }
    };

    if (rankingData.length > 0) {
      fetchCurrentUser();
    }
  }, [rankingData]);

  const top3Players = rankingData.slice(0, 3);
  const otherPlayers = rankingData.slice(3);

  // Hàm để tạo dữ liệu người dùng mẫu
  const seedSampleUsers = async () => {
    try {
      setSeedingUsers(true);
      setSeedMessage(null);

      const res = await fetch('/api/seed/ranking-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ count: seedCount })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create sample users');
      }

      // Hiển thị thông báo thành công
      setSeedMessage({
        type: 'success',
        text: data.message
      });

      // Làm mới dữ liệu bảng xếp hạng
      fetchRanking();

    } catch (error) {
      console.error('Error seeding users:', error);
      setSeedMessage({
        type: 'error',
        text: error.message
      });
    } finally {
      setSeedingUsers(false);
    }
  };

  return (
    <>
      <Head>
        <title>TaskRiser - Hunter Ranking</title>
      </Head>
      <div className="min-h-screen bg-[#caf0f8] text-[#03045e] font-['Orbitron',_sans-serif]">
        {/* Header */}
        <div className="bg-[#f8fdff]/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-[#90e0ef]/60 shadow-lg sticky top-0 z-50">
          <div className="flex items-center">
            <GiDoubleDragon size={36} className="text-[#0077b6] mr-3 drop-shadow-[0_0_5px_rgba(0,180,216,0.7)]" />
            <h1 className="text-3xl font-bold tracking-wider">
              <span className="text-[#0077b6]">HUNTER</span> <span className="text-[#00b4d8]">RANKING</span>
            </h1>
          </div>
          <div className="flex gap-3">
            {/* Thêm button để seed data */}
            <div className="flex items-center gap-2">
              <select
                value={seedCount}
                onChange={(e) => setSeedCount(parseInt(e.target.value))}
                className="h-10 px-2 py-1 bg-[#ade8f4] border border-[#48cae4] rounded text-[#0077b6] font-medium"
              >
                {[1, 2, 5, 10, 15, 20].map(num => (
                  <option key={num} value={num}>{num} users</option>
                ))}
              </select>
              <button
                onClick={seedSampleUsers}
                disabled={seedingUsers}
                className="bg-gradient-to-r from-[#023e8a] to-[#0077b6] hover:from-[#0077b6] hover:to-[#0096c7] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-[#48cae4]/40 transition-all duration-150 flex items-center disabled:opacity-50"
              >
                {seedingUsers ? 'Creating...' : 'Add Hunters'}
              </button>
            </div>

            {/* Existing Dashboard link */}
            <Link href="/dashboard" className="bg-gradient-to-r from-[#0096c7] to-[#00b4d8] hover:from-[#0077b6] hover:to-[#0096c7] text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-[#48cae4]/40 transition-all duration-150 flex items-center">
              <FaChevronLeft className="mr-2 opacity-80" /> System Panel
            </Link>
          </div>
        </div>

        <main className="container mx-auto p-4 md:p-8 max-w-6xl">
          {/* Show seed message if any */}
          {seedMessage && (
            <div className={`mb-4 p-3 rounded-lg text-center ${seedMessage.type === 'success'
                ? 'bg-[#0096c7]/10 text-[#0077b6] border border-[#0096c7]/30'
                : 'bg-red-500/10 text-red-600 border border-red-500/30'
              }`}>
              {seedMessage.text}
            </div>
          )}

          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#023e8a] via-[#0077b6] to-[#00b4d8]">
                LEADERBOARD
              </span>
            </h1>
            <p className="text-[#0077b6] text-lg">Witness the Ascended Hunters of the System.</p>
          </div>

          <div className="flex justify-center md:justify-end mb-8 space-x-3">
            {['all', 'month', 'week'].map(filter => (
              <button
                key={filter}
                onClick={() => {
                  setTimeFilter(filter);
                  setCurrentPage(1); // Reset về trang 1 khi chuyển filter
                }}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 border-2
                            ${timeFilter === filter
                    ? 'bg-[#0096c7] border-[#00b4d8] text-white shadow-lg shadow-[#48cae4]/40'
                    : 'bg-[#ade8f4] border-[#90e0ef] text-[#0077b6] hover:bg-[#90e0ef] hover:border-[#48cae4] hover:text-[#023e8a]'}`}
              >
                {filter === 'all' && <FaTrophy className="inline mr-2 mb-0.5" />}
                {filter.charAt(0).toUpperCase() + filter.slice(1)} {filter !== 'all' && 'Time'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-pulse flex flex-col items-center">
                <BsLightningChargeFill size={60} className="text-[#0077b6] mb-4" />
                <p className="text-xl text-[#0096c7] tracking-wider">ACCESSING SYSTEM DATA...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-[#ade8f4] border-2 border-[#00b4d8] text-[#0077b6] p-6 rounded-lg shadow-xl flex items-center gap-4">
              <BsLightningChargeFill size={40} className="text-[#0096c7]" />
              <div>
                <p className="font-bold text-xl">System Error:</p>
                <p className="text-lg">{error}</p>
                <p className="text-sm mt-1">Try reloading the System Panel.</p>
              </div>
            </div>
          ) : rankingData.length === 0 ? (
            <div className="text-center py-16 bg-[#f8fdff] rounded-xl border border-[#90e0ef] shadow-lg">
              <GiShadowFollower size={80} className="text-[#90e0ef] mx-auto mb-6" />
              <p className="text-3xl text-[#0077b6] font-semibold">No Hunter Data Available</p>
              <p className="text-[#48cae4] mt-3 text-lg">The Gates are quiet... for now. Be the first to make your mark!</p>
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

              {otherPlayers.length > 0 && (
                <div className="bg-[#f8fdff]/80 rounded-xl overflow-hidden shadow-2xl border border-[#90e0ef] mb-8">
                  <table className="w-full">
                    <thead className="bg-[#ade8f4]/50">
                      <tr className="border-b border-[#90e0ef]">
                        <th className="py-4 px-4 text-left text-sm font-semibold text-[#0077b6] uppercase tracking-wider w-20">Rank</th>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-[#0077b6] uppercase tracking-wider">Hunter</th>
                        <th className="py-4 px-4 text-center text-sm font-semibold text-[#0077b6] uppercase tracking-wider w-28">Class</th>
                        <th className="py-4 px-4 text-center text-sm font-semibold text-[#0077b6] uppercase tracking-wider w-24">Level</th>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-[#0077b6] uppercase tracking-wider min-w-[200px]">Progress</th>
                        <th className="py-4 px-4 text-right text-sm font-semibold text-[#0077b6] uppercase tracking-wider w-40">Total EXP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {otherPlayers.map((player, index) => (
                        <PlayerRow
                          key={player.id}
                          player={player}
                          position={index + 4} // +4 because 1,2,3 are top
                        />
                      ))}
                    </tbody>
                  </table>

                  {totalPages > 1 && (
                    <div className="flex justify-between items-center p-5 border-t border-[#90e0ef] bg-[#caf0f8]/30">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors ${currentPage === 1 ? 'text-[#90e0ef] cursor-not-allowed bg-[#caf0f8]' : 'text-[#0077b6] hover:bg-[#00b4d8]/30 hover:text-[#023e8a] bg-[#ade8f4] border border-[#48cae4]'}`}
                      >
                        <FaChevronLeft className="mr-2" /> Previous Gate
                      </button>

                      <div className="text-sm text-[#0077b6]">
                        Page {currentPage} of {totalPages}
                      </div>

                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-colors ${currentPage === totalPages ? 'text-[#90e0ef] cursor-not-allowed bg-[#caf0f8]' : 'text-[#0077b6] hover:bg-[#00b4d8]/30 hover:text-[#023e8a] bg-[#ade8f4] border border-[#48cae4]'}`}
                      >
                        Next Gate <FaChevronRight className="ml-2" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Your Position - Styled like a System Window */}
              <div className="bg-gradient-to-br from-[#0077b6] via-[#0096c7] to-[#00b4d8] rounded-xl p-6 md:p-8 shadow-xl border-2 border-[#48cae4] relative overflow-hidden">
                <div className="absolute -top-2 -left-2 w-16 h-16 bg-[#ade8f4] rounded-full opacity-30 blur-2xl"></div>
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-[#48cae4] rounded-full opacity-30 blur-2xl"></div>

                <h2 className="text-3xl font-bold text-white mb-6 relative z-10">
                  <BsLightningChargeFill className="inline mr-2 text-[#caf0f8] animate-pulse" />
                  Your Hunter Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center relative z-10">
                  <div>
                    <div className="text-5xl font-bold text-white mb-1">
                      {currentUserData.rank}
                      {typeof currentUserData.rank === 'number' && <span className="text-2xl text-[#ade8f4]">th</span>}
                    </div>
                    <div className="text-sm text-[#caf0f8] uppercase tracking-wider">Current Rank</div>
                  </div>

                  <div>
                    <div className="text-5xl font-bold text-[#90e0ef] mb-1">+{currentUserData.positionsGained}</div>
                    <div className="text-sm text-[#caf0f8] uppercase tracking-wider">Potential Rank Up</div>
                  </div>

                  <div>
                    <div className="text-5xl font-bold text-[#ade8f4] mb-1">{currentUserData.expNeeded > 0 ? currentUserData.expNeeded.toLocaleString() : 'MAX'}</div>
                    <div className="text-sm text-[#caf0f8] uppercase tracking-wider">EXP to Next Awakening</div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-[#caf0f8]/30">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[#caf0f8]">System Alert: Keep clearing Dungeons to ascend further, Hunter {currentUserData.username}!</p>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={expAmount}
                          onChange={(e) => setExpAmount(parseInt(e.target.value) || 0)}
                          min="1"
                          max="1000"
                          className="w-20 px-2 py-1 rounded bg-[#caf0f8]/20 border border-[#caf0f8]/30 text-white text-center"
                        />
                        <span className="text-[#caf0f8]">EXP</span>
                      </div>

                      <button
                        onClick={updateUserExp}
                        disabled={awardingExp}
                        className="px-4 py-1.5 rounded-lg bg-[#ade8f4] text-[#0077b6] font-semibold hover:bg-[#caf0f8] hover:text-[#023e8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {awardingExp ? 'Awarding...' : 'Award EXP'}
                      </button>
                    </div>
                  </div>

                  {expMessage && (
                    <div className={`mt-2 text-center p-2 rounded ${expMessage.type === 'success' ? 'bg-[#caf0f8]/20 text-[#ade8f4]' : 'bg-red-500/20 text-red-200'
                      }`}>
                      {expMessage.text}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
        <footer className="text-center py-8 border-t border-[#90e0ef]/50 text-sm text-[#0077b6]">
          Solo Leveling Inspired Ranking System © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  );
}