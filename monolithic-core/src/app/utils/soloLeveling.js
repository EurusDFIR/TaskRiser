// utils/soloLeveling.js
import { GiCrown, GiRank3, GiSwordsEmblem } from 'react-icons/gi';
import { BsLightningChargeFill } from 'react-icons/bs';

export function calculateLevel(exp) {
  if (exp < 100) return 1;  // E
  if (exp < 300) return 2;  // D
  if (exp < 600) return 3;  // C
  if (exp < 1000) return 4; // B
  if (exp < 2000) return 5; // A
  if (exp < 5000) return 6; // S
  if (exp < 10000) return 7; // S+
  return 8;                 // National
}

export function determineRank(level) {
  if (level >= 8) return { name: 'NATIONAL', color: 'bg-gradient-to-r from-red-600 via-purple-600 to-blue-600', textColor: 'text-white', shadow: 'shadow-[0_0_15px_rgba(255,255,255,0.6)]', borderColor: 'border-purple-500', icon: <GiCrown className="inline-block mr-1" /> };
  if (level >= 7) return { name: 'S+', color: 'bg-purple-700', textColor: 'text-yellow-300', shadow: 'shadow-[0_0_12px_rgba(168,85,247,0.6)]', borderColor: 'border-purple-600', icon: <BsLightningChargeFill className="inline-block mr-1" /> };
  if (level >= 6) return { name: 'S', color: 'bg-purple-600', textColor: 'text-yellow-400', shadow: 'shadow-[0_0_10px_rgba(168,85,247,0.5)]', borderColor: 'border-purple-500', icon: <BsLightningChargeFill className="inline-block mr-1" /> };
  if (level >= 5) return { name: 'A', color: 'bg-blue-600', textColor: 'text-white', shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]', borderColor: 'border-blue-500', icon: <GiRank3 className="inline-block mr-1" /> };
  if (level >= 4) return { name: 'B', color: 'bg-sky-500', textColor: 'text-gray-900', shadow: 'shadow-[0_0_8px_rgba(6,182,212,0.4)]', borderColor: 'border-sky-500', icon: <GiSwordsEmblem className="inline-block mr-1" /> };
  if (level >= 3) return { name: 'C', color: 'bg-green-500', textColor: 'text-gray-900', shadow: 'shadow-[0_0_6px_rgba(34,197,94,0.4)]', borderColor: 'border-green-500' };
  if (level >= 2) return { name: 'D', color: 'bg-yellow-500', textColor: 'text-gray-900', shadow: 'shadow-[0_0_5px_rgba(234,179,8,0.4)]', borderColor: 'border-yellow-500' };
  return { name: 'E', color: 'bg-gray-500', textColor: 'text-white', shadow: 'shadow-[0_0_4px_rgba(107,114,128,0.4)]', borderColor: 'border-gray-500' };
}

export function expForNextLevelBoundary(level) {
  if (level <= 1) return 0;
  if (level === 2) return 100;
  if (level === 3) return 300;
  if (level === 4) return 600;
  if (level === 5) return 1000;
  if (level === 6) return 2000;
  if (level === 7) return 5000;
  if (level === 8) return 10000;
  return Infinity;
}

export function taskDifficultyToRank(difficultyName) {
  switch (difficultyName?.toLowerCase()) {
    case 's-rank': case 'legendary': return determineRank(6);
    case 'a-rank': case 'hard': return determineRank(5);
    case 'b-rank': return determineRank(4);
    case 'c-rank': case 'medium': return determineRank(3);
    case 'd-rank': return determineRank(2);
    case 'e-rank': case 'easy': default: return determineRank(1);
  }
}
