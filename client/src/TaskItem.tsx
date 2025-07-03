// TaskItem.tsx
import { useState } from "react";
import toast from "react-hot-toast";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";
import { taskDifficultyToRank } from "./utils/soloLeveling";

interface Task {
  id: string | number;
  title: string;
  status: string;
  difficulty?: string;
  expReward?: number;
}

interface TaskItemProps {
  task: Task;
  onUpdateStatus: (id: string | number, status: string) => Promise<void>;
}

export default function TaskItem({ task, onUpdateStatus }: TaskItemProps) {
  const [isCompleted, setIsCompleted] = useState(task.status === "Completed");
  const [loading, setLoading] = useState(false);
  const taskRank = taskDifficultyToRank(task.difficulty);
  const handleStatusToggle = async () => {
    setLoading(true);
    const newStatus = isCompleted ? "Pending" : "Completed";
    try {
      await onUpdateStatus(task.id, newStatus);
      setIsCompleted(!isCompleted);
      toast.success(`Quest \"${task.title}\" status updated.`, {
        iconTheme: { primary: "#00b4d8", secondary: "#caf0f8" },
        style: {
          background: "#e0f7fa",
          color: "#0077b6",
          border: "1px solid #90e0ef",
        },
      });
    } catch {
      toast.error("Failed to update quest status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative bg-gradient-to-br from-[#e0f7fa]/80 to-[#caf0f8]/70 p-4 rounded-lg mb-4 border-l-4 ${
        isCompleted
          ? `${taskRank.borderColor} opacity-60`
          : taskRank.borderColor
      } ${
        taskRank.shadow
      } hover:shadow-[0_0_15px_rgba(0,119,182,0.15)] transition-all duration-200 group`}
    >
      <div
        className={`absolute -top-2 -right-2 px-2 py-0.5 text-xs font-bold rounded ${taskRank.color} ${taskRank.textColor} border border-[#90e0ef] bg-gradient-to-r from-[#00b4d8]/80 to-[#90e0ef]/80`}
      >
        {taskRank.icon} {task.difficulty || taskRank.name + "-Rank"}
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3
            className={`text-lg font-semibold ${
              isCompleted
                ? "line-through text-[#90e0ef]"
                : "text-[#0077b6] group-hover:text-[#0096c7]"
            } transition-colors`}
          >
            {task.title}
          </h3>
          <p className="text-xs text-[#48cae4] mt-1">
            Status:{" "}
            <span className={isCompleted ? "text-[#00b4d8]" : "text-[#0077b6]"}>
              {isCompleted ? "CLEARED" : "ACTIVE"}
            </span>
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-[#0096c7]">
          EXP Reward: <span className="font-bold">{task.expReward ?? 50}</span>
        </div>
        <button
          onClick={handleStatusToggle}
          disabled={loading}
          className={`p-2 rounded-full transition-colors
                        ${
                          isCompleted
                            ? "text-[#00b4d8] hover:bg-[#90e0ef]/30"
                            : "text-[#0077b6] hover:text-[#0096c7] hover:bg-[#ade8f4]/40"
                        }
                        focus:outline-none focus:ring-2 focus:ring-[#00b4d8]`}
          title={isCompleted ? "Re-Open Quest" : "Mark as Cleared"}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00b4d8]"></div>
          ) : isCompleted ? (
            <FaCheckCircle size={22} />
          ) : (
            <FaRegCircle size={22} />
          )}
        </button>
      </div>
    </div>
  );
}
