// utils/soloLeveling.tsx
import { GiCrown, GiRank3, GiSwordsEmblem } from "react-icons/gi";
import { BsLightningChargeFill } from "react-icons/bs";
import { ReactNode } from "react";

export interface RankInfo {
  name: string;
  color: string;
  textColor: string;
  shadow: string;
  borderColor: string;
  icon?: ReactNode;
}

export function calculateLevel(exp: number): number {
  if (exp < 100) return 1; // E
  if (exp < 300) return 2; // D
  if (exp < 600) return 3; // C
  if (exp < 1000) return 4; // B
  if (exp < 2000) return 5; // A
  if (exp < 5000) return 6; // S
  if (exp < 10000) return 7; // S+
  return 8; // National
}

export function determineRank(level: number): RankInfo {
  if (level >= 8)
    return {
      name: "NATIONAL",
      color: "bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#caf0f8]",
      textColor: "text-white",
      shadow: "shadow-[0_0_18px_rgba(0,180,216,0.8)]",
      borderColor: "border-white border-2",
      icon: <GiCrown className="inline-block mr-1" />,
    };
  if (level >= 7)
    return {
      name: "S+",
      color: "bg-[#0077b6]",
      textColor: "text-white",
      shadow: "shadow-[0_0_14px_rgba(0,119,182,0.7)]",
      borderColor: "border-white border-2",
      icon: <BsLightningChargeFill className="inline-block mr-1" />,
    };
  if (level >= 6)
    return {
      name: "S",
      color: "bg-[#00b4d8]",
      textColor: "text-white",
      shadow: "shadow-[0_0_12px_rgba(0,180,216,0.6)]",
      borderColor: "border-white border-2",
      icon: <BsLightningChargeFill className="inline-block mr-1" />,
    };
  if (level >= 5)
    return {
      name: "A",
      color: "bg-[#48cae4]",
      textColor: "text-[#0077b6]",
      shadow: "shadow-[0_0_10px_rgba(72,202,228,0.5)]",
      borderColor: "border-[#90e0ef]",
      icon: <GiRank3 className="inline-block mr-1" />,
    };
  if (level >= 4)
    return {
      name: "B",
      color: "bg-[#90e0ef]",
      textColor: "text-[#0077b6]",
      shadow: "shadow-[0_0_8px_rgba(144,224,239,0.4)]",
      borderColor: "border-[#90e0ef]",
      icon: <GiSwordsEmblem className="inline-block mr-1" />,
    };
  if (level >= 3)
    return {
      name: "C",
      color: "bg-[#caf0f8]",
      textColor: "text-[#0077b6]",
      shadow: "shadow-[0_0_6px_rgba(202,240,248,0.4)]",
      borderColor: "border-[#caf0f8]",
    };
  if (level >= 2)
    return {
      name: "D",
      color: "bg-[#e0f7fa]",
      textColor: "text-[#0077b6]",
      shadow: "shadow-[0_0_5px_rgba(224,247,250,0.4)]",
      borderColor: "border-[#e0f7fa]",
    };
  return {
    name: "E",
    color: "bg-[#f8fdff]",
    textColor: "text-[#0077b6]",
    shadow: "shadow-[0_0_4px_rgba(248,253,255,0.4)]",
    borderColor: "border-[#f8fdff]",
  };
}

export function expForNextLevelBoundary(level: number): number {
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

export function taskDifficultyToRank(difficultyName?: string): RankInfo {
  switch (difficultyName?.toLowerCase()) {
    case "s-rank":
    case "legendary":
      return determineRank(6);
    case "a-rank":
    case "hard":
      return determineRank(5);
    case "b-rank":
      return determineRank(4);
    case "c-rank":
    case "medium":
      return determineRank(3);
    case "d-rank":
      return determineRank(2);
    case "e-rank":
    case "easy":
    default:
      return determineRank(1);
  }
}
