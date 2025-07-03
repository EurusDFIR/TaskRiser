import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  difficulty?: string;
  priority?: string;
  dueDate?: string;
  tags?: string[];
}

interface SortableTaskProps {
  id: string;
  task: Task;
  onDelete: () => void;
}

export default function SortableTask({
  id,
  task,
  onDelete,
}: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-2 rounded bg-white shadow text-[#0077b6] font-semibold flex justify-between items-center"
    >
      <span>{task.title}</span>
      <button
        onClick={onDelete}
        className="ml-2 text-red-500 hover:text-red-700"
      >
        X
      </button>
    </div>
  );
}
