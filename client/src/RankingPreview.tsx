// RankingPreview.tsx
import Link from "next/link";
import { BsBarChartFill } from "react-icons/bs";
import { determineRank, calculateLevel } from "./utils/soloLeveling";

interface Hunter {
  id: string | number;
  username: string;
  tasksCompleted: number;
  totalExp: number;
}

interface RankingPreviewProps {
  ranking: Hunter[];
}

export default function RankingPreview({ ranking }: RankingPreviewProps) {
  return (
    <div className="bg-gradient-to-br from-[#e0f7fa]/90 to-[#caf0f8]/80 p-4 md:p-5 rounded-xl shadow-xl border border-[#90e0ef]/60">
      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#0077b6] mb-4 border-b-2 border-[#90e0ef]/40 pb-2 flex items-center">
        <BsBarChartFill className="mr-2 text-[#00b4d8]" size={22} /> TOP HUNTERS
      </h3>
      <div className="space-y-2.5">
        {ranking.slice(0, 3).map((hunter, index) => {
          const rankInfo = determineRank(calculateLevel(hunter.totalExp));
          return (
            <div
              key={hunter.id}
              className={`p-3 rounded-lg flex items-center justify-between text-[#0077b6] shadow-md border ${rankInfo.borderColor}/70 ${rankInfo.color} transition-transform hover:scale-[1.02] bg-[#f8fdff]/70`}
            >
              <div className="flex items-center">
                <span
                  className={`font-bold text-lg mr-3 ${rankInfo.textColor} px-2 py-0.5 rounded bg-gradient-to-r from-[#00b4d8] to-[#90e0ef]`}
                >
                  {rankInfo.icon || index + 1}
                </span>
                <div>
                  <p className={`font-semibold ${rankInfo.textColor}`}>
                    {hunter.username}
                  </p>
                  <p className={`text-xs opacity-80 ${rankInfo.textColor}`}>
                    {hunter.tasksCompleted} Quests Cleared
                  </p>
                </div>
              </div>
              <span
                className={`font-bold text-lg ${rankInfo.textColor}`}
                suppressHydrationWarning
              >
                {hunter.totalExp.toLocaleString("en-US")}
              </span>
            </div>
          );
        })}
      </div>
      <Link
        href="/ranking"
        className="block text-center mt-5 text-[#00b4d8] hover:text-[#0077b6] font-semibold transition-colors group"
      >
        Access Full Ranking Archive{" "}
        <span className="opacity-70 group-hover:opacity-100 transition-opacity ml-1">
          →
        </span>
      </Link>
    </div>
  );
}
