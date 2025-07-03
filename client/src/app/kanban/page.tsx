"use client";
import { useDroppable } from "@dnd-kit/core";
// Droppable column wrapper
function DroppableColumn({
  columnId,
  children,
}: {
  columnId: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });
  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 60,
        opacity: isOver ? 0.97 : 1,
        transition:
          "box-shadow 0.28s cubic-bezier(.22,1,.36,1), background 0.22s, opacity 0.18s",
        boxShadow: isOver
          ? "0 0 0 5px #00b4d8, 0 8px 32px rgba(0,180,216,0.18)"
          : "0 2px 8px rgba(0,0,0,0.07)",
        background: isOver ? "rgba(0,180,216,0.13)" : undefined,
        borderRadius: 16,
      }}
    >
      {children}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
  rectIntersection,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FaPlus,
  FaCheckCircle,
  FaClock,
  FaPause,
  FaPlay,
} from "react-icons/fa";
import { GiScrollUnfurled, GiSpikedDragonHead } from "react-icons/gi";
import { BsLightningChargeFill } from "react-icons/bs";
import LeftPane from "../../LeftPane";
import {
  calculateLevel,
  determineRank,
  taskDifficultyToRank,
} from "../../utils/soloLeveling";

// Task type
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  difficulty?: string;
  priority?: string;
  dueDate?: string;
  tags?: string[];
}

import React from "react";

interface KanbanColumn {
  id: string;
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
  color: string;
  status: string;
}

type ColumnType = {
  [key: string]: KanbanColumn;
};

// Kanban columns config (iconType is a string, not a React element)
const initialColumns: ColumnType = {
  backlog: {
    id: "backlog",
    title: "QUEST BACKLOG",
    icon: "GiScrollUnfurled",
    tasks: [],
    color: "from-[#ade8f4] to-[#caf0f8]",
    status: "Pending",
  },
  inProgress: {
    id: "inProgress",
    title: "IN PROGRESS",
    icon: "FaPlay",
    tasks: [],
    color: "from-[#90e0ef] to-[#ade8f4]",
    status: "InProgress",
  },
  onHold: {
    id: "onHold",
    title: "ON HOLD",
    icon: "FaPause",
    tasks: [],
    color: "from-[#48cae4] to-[#90e0ef]",
    status: "OnHold",
  },
  completed: {
    id: "completed",
    title: "COMPLETED",
    icon: "FaCheckCircle",
    tasks: [],
    color: "from-[#00b4d8] to-[#48cae4]",
    status: "Completed",
  },
};

// Helper to render the correct icon
function renderColumnIcon(icon: string) {
  const className = "text-[#0077b6]";
  switch (icon) {
    case "GiScrollUnfurled":
      return <GiScrollUnfurled className={className} />;
    case "FaPlay":
      return <FaPlay className={className} />;
    case "FaPause":
      return <FaPause className={className} />;
    case "FaCheckCircle":
      return <FaCheckCircle className={className} />;
    default:
      return null;
  }
}

interface SortableTaskProps {
  id: string;
  task: Task;
  onDelete: () => void;
}

import { MdDragIndicator } from "react-icons/md";
function SortableTask({
  id,
  task,
  onDelete,
  onClick,
  onContextMenu,
}: SortableTaskProps & {
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: { task } });

  // Unified blue/cyan theme for all cards
  const style: React.CSSProperties = {
    transform: `${CSS.Transform.toString(transform)}${
      isDragging ? " scale(1.08)" : ""
    }`,
    transition: isDragging
      ? "transform 0.18s cubic-bezier(.22,1,.36,1), box-shadow 0.18s"
      : "transform 0.28s cubic-bezier(.22,1,.36,1), box-shadow 0.28s",
    opacity: isDragging ? 0.96 : 1,
    background:
      "linear-gradient(120deg, #e0f7fa 0%, #caf0f8 60%, #90e0ef 100%)",
    borderRadius: "1.5rem",
    boxShadow: isDragging
      ? "0 20px 60px 0 rgba(0,180,216,0.22), 0 2px 12px rgba(0,0,0,0.13)"
      : "0 6px 32px 0 rgba(0,180,216,0.10), 0 2px 8px rgba(0,0,0,0.07)",
    padding: "1.35rem 1.15rem 1.15rem 1.35rem",
    cursor: "pointer",
    position: "relative",
    zIndex: isDragging ? 100 : 1,
    userSelect: "none",
    border: isDragging ? "2.5px solid #00b4d8" : "1.5px solid #90e0ef",
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter: "blur(3px)",
    overflow: "hidden",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onContextMenu={onContextMenu}
      className="group transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_8px_32px_0_rgba(0,180,216,0.13)]"
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
      <div className="flex justify-between items-center relative z-10">
        {/* Drag handle icon - only this triggers drag */}
        <span
          {...listeners}
          className="mr-3 text-[#00b4d8] hover:text-[#0077b6] cursor-grab active:cursor-grabbing drop-shadow-lg"
          style={{ fontSize: 24, display: "inline-flex", alignItems: "center" }}
          title="Kéo để di chuyển"
          onClick={(e) => e.stopPropagation()}
        >
          <MdDragIndicator />
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-base text-[#0077b6] truncate mb-0.5 tracking-tight">
            {task.title}
          </div>
          {task.description && (
            <div className="text-xs text-[#48cae4] truncate mb-0.5">
              {task.description}
            </div>
          )}
          <div className="flex gap-2 mt-1 text-xs flex-wrap">
            {task.difficulty && (
              <span className="bg-gradient-to-r from-[#caf0f8] to-[#90e0ef] text-[#0077b6] px-2 py-0.5 rounded-full font-bold shadow-sm border border-[#90e0ef]/40">
                {task.difficulty}
              </span>
            )}
            {task.priority && (
              <span className="bg-gradient-to-r from-[#00b4d8]/10 to-[#48cae4]/10 text-[#00b4d8] px-2 py-0.5 rounded-full font-bold shadow-sm border border-[#90e0ef]/40">
                {task.priority}
              </span>
            )}
            {task.dueDate && (
              <span className="bg-gradient-to-r from-[#e0f7fa] to-[#caf0f8] text-[#0077b6] px-2 py-0.5 rounded-full font-semibold border border-[#90e0ef]/40">
                {task.dueDate}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-2 text-[#00b4d8] hover:text-red-500 text-lg font-bold rounded-full bg-white/70 px-2 py-0.5 shadow-sm border border-[#90e0ef]/40 transition-all duration-150"
          title="Delete"
          type="button"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function KanbanPage() {
  const router = useRouter();
  // Logout handler giống dashboard
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/login");
  };
  const [columns, setColumns] = useState<ColumnType>(() =>
    JSON.parse(JSON.stringify(initialColumns))
  );
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    difficulty: "E-Rank",
    priority: "Medium",
    dueDate: "",
    status: "Pending",
  });
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  // Undo/Redo state (removed)
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    task: Task | null;
  }>({ x: 0, y: 0, task: null });

  // Đóng context menu khi click ra ngoài
  useEffect(() => {
    const handleClick = () => setContextMenu({ x: 0, y: 0, task: null });
    if (contextMenu.task) {
      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    }
  }, [contextMenu.task]);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("http://localhost:8080/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const tasks: Task[] = await res.json();
        // Sort tasks into columns
        const newColumns: ColumnType = JSON.parse(
          JSON.stringify(initialColumns)
        );
        tasks.forEach((task) => {
          let col = "backlog";
          if (task.status === "InProgress") col = "inProgress";
          else if (task.status === "OnHold") col = "onHold";
          else if (task.status === "Completed") col = "completed";
          newColumns[col].tasks.push(task);
        });
        setColumns(newColumns);
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Add new task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:8080/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      });
      if (!res.ok) throw new Error("Failed to add task");
      setShowModal(false);
      setNewTask({
        title: "",
        description: "",
        difficulty: "E-Rank",
        priority: "Medium",
        dueDate: "",
        status: "Pending",
      });
      // Refetch tasks sau khi thêm mới để đảm bảo dữ liệu đồng bộ
      const fetchTasks = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem("authToken");
          const res = await fetch("http://localhost:8080/api/tasks", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Failed to fetch tasks");
          const tasks: Task[] = await res.json();
          const newColumns: ColumnType = JSON.parse(
            JSON.stringify(initialColumns)
          );
          tasks.forEach((task) => {
            let col = "backlog";
            if (task.status === "InProgress") col = "inProgress";
            else if (task.status === "OnHold") col = "onHold";
            else if (task.status === "Completed") col = "completed";
            newColumns[col].tasks.push(task);
          });
          setColumns(newColumns);
        } catch (e: any) {
          toast.error(e.message);
        } finally {
          setLoading(false);
        }
      };
      await fetchTasks();
      toast.success("Task added!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Delete task
  const handleDeleteTask = async (task: Task, colId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`http://localhost:8080/api/tasks/${task.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // Hiển thị lỗi chi tiết nếu có
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to delete task");
        return;
      }
      // Refetch lại tasks để đảm bảo đồng bộ UI
      const fetchTasks = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem("authToken");
          const res = await fetch("http://localhost:8080/api/tasks", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Failed to fetch tasks");
          const tasks: Task[] = await res.json();
          const newColumns: ColumnType = JSON.parse(
            JSON.stringify(initialColumns)
          );
          tasks.forEach((task) => {
            let col = "backlog";
            if (task.status === "InProgress") col = "inProgress";
            else if (task.status === "OnHold") col = "onHold";
            else if (task.status === "Completed") col = "completed";
            newColumns[col].tasks.push(task);
          });
          setColumns(newColumns);
        } catch (e: any) {
          toast.error(e.message);
        } finally {
          setLoading(false);
        }
      };
      await fetchTasks();
      toast.success("Task deleted!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Drag and drop handlers
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  const handleDragStart = (event: any) => {
    setDraggedTask(event.active.data.current?.task || null);
  };
  const handleDragEnd = async (event: any) => {
    setDraggedTask(null);
    const { active, over } = event;
    if (!over || !active) return;
    // Xác định cột nguồn
    const fromCol = Object.keys(columns).find((col) =>
      columns[col as keyof ColumnType].tasks.some(
        (t: Task) => t.id === active.id
      )
    );
    // Xác định cột đích: nếu over.id là columnId thì dùng luôn, nếu là taskId thì tìm column chứa task đó
    let toCol = over.id;
    if (!columns[toCol as keyof ColumnType]) {
      // over.id là taskId, tìm column chứa task này
      toCol =
        Object.keys(columns).find((col) =>
          columns[col as keyof ColumnType].tasks.some(
            (t: Task) => t.id === over.id
          )
        ) || "";
    }
    if (!fromCol || !toCol || !columns[toCol as keyof ColumnType]) return;
    const task = columns[fromCol as keyof ColumnType].tasks.find(
      (t: Task) => t.id === active.id
    );
    if (!task) return;

    // Nếu kéo trong cùng một cột (chỉ đổi vị trí)
    if (fromCol === toCol) {
      // Lấy index cũ và mới
      const oldIndex = columns[fromCol as keyof ColumnType].tasks.findIndex(
        (t: Task) => t.id === active.id
      );
      let newIndex = columns[toCol as keyof ColumnType].tasks.findIndex(
        (t: Task) => t.id === over.id
      );
      // Nếu thả vào chính nó (kéo không đổi vị trí), không làm gì
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      // Nếu kéo xuống dưới cùng (over.id === active.id), thì đặt newIndex = tasks.length - 1
      if (over.id === active.id) {
        newIndex = columns[toCol as keyof ColumnType].tasks.length - 1;
      }
      setColumns((prev) => {
        const updated = { ...prev };
        const tasks = [...updated[fromCol as keyof ColumnType].tasks];
        const moved = tasks.splice(oldIndex, 1)[0];
        tasks.splice(newIndex, 0, moved);
        updated[fromCol as keyof ColumnType].tasks = tasks;
        return updated;
      });
      return;
    }

    // Kéo sang cột khác
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`http://localhost:8080/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...task,
          status: columns[toCol as keyof ColumnType].status,
        }),
      });
      if (!res.ok) {
        // Nếu backend trả về lỗi, không cập nhật UI, báo lỗi rõ ràng
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to move task");
        return;
      }
      setColumns((prev) => {
        // Xóa task khỏi tất cả các cột trước khi thêm vào cột mới (chống nhân đôi)
        const updated = { ...prev };
        Object.keys(updated).forEach((col) => {
          updated[col].tasks = updated[col].tasks.filter(
            (t: Task) => t.id !== task.id
          );
        });
        updated[toCol as keyof ColumnType].tasks.push({
          ...task,
          status: columns[toCol as keyof ColumnType].status,
        });
        return updated;
      });
      toast.success("Task moved!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  // Undo/Redo handlers removed
  return (
    <>
      {/* Context menu for task */}
      {contextMenu.task && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.y + 2,
            left: contextMenu.x + 2,
            zIndex: 9999,
            minWidth: 160,
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)",
            padding: 8,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col">
            <button
              className="text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
              onClick={() => {
                setSelectedTask(contextMenu.task as Task);
                setEditTask({ ...(contextMenu.task as Task) });
                setContextMenu({ x: 0, y: 0, task: null });
              }}
            >
              ✏️ Edit Task
            </button>
            <button
              className="text-left px-3 py-2 hover:bg-blue-50 rounded text-sm text-red-600"
              onClick={() => {
                handleDeleteTask(contextMenu.task as Task, "");
                setContextMenu({ x: 0, y: 0, task: null });
              }}
            >
              🗑️ Delete Task
            </button>
            <button
              className="text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
              onClick={() => {
                toast("Tính năng thêm ảnh sẽ sớm có!");
                setContextMenu({ x: 0, y: 0, task: null });
              }}
            >
              🖼️ Add Image (coming soon)
            </button>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-[#caf0f8] text-[#03045e] font-['Orbitron',_sans-serif] flex">
        <LeftPane
          userData={undefined}
          activePath="/kanban"
          onLogout={handleLogout}
        />
        <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#0077b6] drop-shadow-lg flex items-center gap-3 tracking-tight">
                  <GiSpikedDragonHead
                    className="text-[#00b4d8] drop-shadow-xl"
                    size={40}
                  />
                  Hunter's Kanban Board
                </h1>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-[#0096c7] to-[#00b4d8] hover:from-[#0077b6] hover:to-[#0096c7] text-white font-bold py-3 px-6 rounded-2xl shadow-xl hover:shadow-[#48cae4]/40 transition-all duration-200 flex items-center justify-center text-base border-2 border-[#90e0ef]/40 backdrop-blur-lg"
              >
                <FaPlus className="mr-2" /> Add New Quest
              </button>
            </div>
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 md:gap-8 overflow-auto pb-12">
                {Object.entries(columns).map(([columnId, column]) => (
                  <div
                    key={columnId}
                    className={`rounded-3xl p-6 bg-gradient-to-br ${column.color} shadow-2xl border border-[#90e0ef]/40 backdrop-blur-xl transition-all duration-300 relative group hover:scale-[1.025] hover:shadow-[0_8px_40px_0_rgba(0,180,216,0.18)]`}
                    id={columnId}
                    data-id={columnId}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shadow-md border border-[#caf0f8]/60">
                        {renderColumnIcon(column.icon as string)}
                      </div>
                      <span className="font-extrabold text-xl text-[#0077b6] tracking-wide drop-shadow-sm uppercase">
                        {column.title}
                      </span>
                    </div>
                    <DroppableColumn columnId={columnId}>
                      <div className="flex flex-col gap-3 min-h-[60px]">
                        {loading ? (
                          <>
                            {[...Array(2)].map((_, idx) => (
                              <div
                                key={idx}
                                className="animate-pulse bg-slate-200/60 h-20 rounded-2xl mb-2 shadow"
                              />
                            ))}
                          </>
                        ) : column.tasks.length === 0 ? (
                          <div className="text-gray-400 text-base italic text-center py-6 select-none">
                            No tasks
                          </div>
                        ) : (
                          <SortableContext
                            id={columnId}
                            items={column.tasks.map((t: Task) => t.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {column.tasks.map((task: Task) => (
                              <SortableTask
                                key={task.id}
                                id={task.id}
                                task={task}
                                onDelete={() =>
                                  handleDeleteTask(task, columnId)
                                }
                                onClick={() => {
                                  setSelectedTask(task);
                                  setEditTask({ ...task });
                                }}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  setContextMenu({
                                    x: e.clientX,
                                    y: e.clientY,
                                    task,
                                  });
                                }}
                              />
                            ))}
                          </SortableContext>
                        )}
                      </div>
                    </DroppableColumn>
                    {/* Glassmorphism effect overlay */}
                    <div className="absolute inset-0 pointer-events-none rounded-3xl bg-white/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </div>
                ))}
              </div>
              {/* DragOverlay for previewing the dragged task with animation */}
              <DragOverlay
                dropAnimation={{
                  duration: 240,
                  easing: "cubic-bezier(.22,1,.36,1)",
                }}
              >
                {draggedTask ? (
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: "0.75rem",
                      boxShadow:
                        "0 16px 40px 0 rgba(0,180,216,0.25), 0 2px 8px rgba(0,0,0,0.12)",
                      padding: "1rem",
                      minWidth: 220,
                      maxWidth: 340,
                      transform: "scale(1.10)",
                      opacity: 0.97,
                      transition:
                        "box-shadow 0.18s, transform 0.18s cubic-bezier(.22,1,.36,1)",
                    }}
                    className="pointer-events-none"
                  >
                    <div className="font-semibold mb-1">
                      {draggedTask.title}
                    </div>
                    {draggedTask.description && (
                      <div className="text-xs text-gray-500 mb-1">
                        {draggedTask.description}
                      </div>
                    )}
                    <div className="flex gap-2 mt-1 text-xs">
                      {draggedTask.difficulty && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {draggedTask.difficulty}
                        </span>
                      )}
                      {draggedTask.priority && (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                          {draggedTask.priority}
                        </span>
                      )}
                      {draggedTask.dueDate && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          {draggedTask.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {/* Modal for editing task - Asana-style layout */}
        {selectedTask && editTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-blue-200 animate-fadeInUp bg-gradient-to-br from-[#f8fdff] to-[#e0f7fa]">
              {/* Left: Main info */}
              <div className="flex-1 p-8 md:p-10 min-w-[340px]">
                <div className="flex items-center gap-4 mb-6">
                  <input
                    value={editTask.title}
                    onChange={(e) =>
                      setEditTask({ ...editTask, title: e.target.value })
                    }
                    className="text-3xl font-extrabold w-full bg-transparent outline-none border-b-2 border-blue-200 focus:border-blue-500 transition mb-1 tracking-tight text-[#0077b6] placeholder:text-blue-200"
                    placeholder="Task title"
                    required
                  />
                  <button
                    className={`ml-2 px-3 py-1.5 rounded-lg shadow text-sm font-bold transition-all duration-150 border-2 ${
                      editTask.status === "Completed"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300"
                    }`}
                    onClick={() =>
                      setEditTask({
                        ...editTask,
                        status:
                          editTask.status === "Completed"
                            ? "Pending"
                            : "Completed",
                      })
                    }
                    type="button"
                  >
                    {editTask.status === "Completed"
                      ? "✓ Completed"
                      : "Mark complete"}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  {/* Assignee */}
                  <div>
                    <label className="block text-xs text-blue-500 font-semibold mb-1">
                      Assignee
                    </label>
                    <input
                      className="w-full border border-blue-100 rounded-lg p-2 text-sm bg-white/60 focus:border-blue-400 transition"
                      placeholder="No assignee"
                      disabled
                    />
                  </div>
                  {/* Due date */}
                  <div>
                    <label className="block text-xs text-blue-500 font-semibold mb-1">
                      Due date
                    </label>
                    <input
                      type="date"
                      value={editTask.dueDate || ""}
                      onChange={(e) =>
                        setEditTask({ ...editTask, dueDate: e.target.value })
                      }
                      className="w-full border border-blue-100 rounded-lg p-2 text-sm bg-white/60 focus:border-blue-400 transition"
                    />
                  </div>
                  {/* Priority */}
                  <div>
                    <label className="block text-xs text-blue-500 font-semibold mb-1">
                      Priority
                    </label>
                    <select
                      value={editTask.priority || "Medium"}
                      onChange={(e) =>
                        setEditTask({ ...editTask, priority: e.target.value })
                      }
                      className="w-full border border-blue-100 rounded-lg p-2 text-sm bg-white/60 focus:border-blue-400 transition"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  {/* Difficulty */}
                  <div>
                    <label className="block text-xs text-blue-500 font-semibold mb-1">
                      Difficulty
                    </label>
                    <select
                      value={editTask.difficulty || "E-Rank"}
                      onChange={(e) =>
                        setEditTask({ ...editTask, difficulty: e.target.value })
                      }
                      className="w-full border border-blue-100 rounded-lg p-2 text-sm bg-white/60 focus:border-blue-400 transition"
                    >
                      <option value="E-Rank">E-Rank</option>
                      <option value="D-Rank">D-Rank</option>
                      <option value="C-Rank">C-Rank</option>
                      <option value="B-Rank">B-Rank</option>
                      <option value="A-Rank">A-Rank</option>
                      <option value="S-Rank">S-Rank</option>
                    </select>
                  </div>
                  {/* Status */}
                  <div>
                    <label className="block text-xs text-blue-500 font-semibold mb-1">
                      Status
                    </label>
                    <select
                      value={editTask.status || "Pending"}
                      onChange={(e) =>
                        setEditTask({ ...editTask, status: e.target.value })
                      }
                      className="w-full border border-blue-100 rounded-lg p-2 text-sm bg-white/60 focus:border-blue-400 transition"
                    >
                      <option value="Pending">Pending</option>
                      <option value="InProgress">InProgress</option>
                      <option value="OnHold">OnHold</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  {/* Tags */}
                  <div>
                    <label className="block text-xs text-blue-500 font-semibold mb-1">
                      Tags
                    </label>
                    <input
                      value={editTask.tags ? editTask.tags.join(", ") : ""}
                      onChange={(e) =>
                        setEditTask({
                          ...editTask,
                          tags: e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                      className="w-full border border-blue-100 rounded-lg p-2 text-sm bg-white/60 focus:border-blue-400 transition"
                      placeholder="tag1, tag2"
                    />
                  </div>
                </div>
                {/* Description */}
                <div className="mb-6">
                  <label className="block text-xs text-blue-500 font-semibold mb-1">
                    Description
                  </label>
                  <textarea
                    value={editTask.description || ""}
                    onChange={(e) =>
                      setEditTask({ ...editTask, description: e.target.value })
                    }
                    className="w-full border border-blue-100 rounded-lg p-3 min-h-[100px] text-base bg-white/60 focus:border-blue-400 transition placeholder:text-blue-200"
                    placeholder="Type / for menu"
                  />
                </div>
                {/* Subtasks (placeholder) */}
                <div className="mb-6">
                  <label className="block text-xs text-blue-500 font-semibold mb-1">
                    Subtasks
                  </label>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-100 rounded-lg p-3 text-sm text-blue-400 italic flex items-center gap-2">
                    <span className="material-icons text-blue-300">
                      check_box_outline_blank
                    </span>
                    Coming soon...
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTask(null);
                      setEditTask(null);
                    }}
                    className="px-5 py-2 rounded-lg bg-gray-100 text-gray-600 font-semibold shadow hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#0096c7] to-[#00b4d8] text-white font-bold shadow hover:from-[#0077b6] hover:to-[#0096c7] transition-all"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("authToken");
                        const res = await fetch(
                          `http://localhost:8080/api/tasks/${editTask.id}`,
                          {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(editTask),
                          }
                        );
                        if (!res.ok) {
                          const err = await res.json().catch(() => ({}));
                          toast.error(err.message || "Failed to update task");
                          return;
                        }
                        setSelectedTask(null);
                        setEditTask(null);
                        setLoading(true);
                        try {
                          const token = localStorage.getItem("authToken");
                          const res = await fetch(
                            "http://localhost:8080/api/tasks",
                            {
                              headers: { Authorization: `Bearer ${token}` },
                            }
                          );
                          if (!res.ok) throw new Error("Failed to fetch tasks");
                          const tasks: Task[] = await res.json();
                          const newColumns: ColumnType = JSON.parse(
                            JSON.stringify(initialColumns)
                          );
                          tasks.forEach((task) => {
                            let col = "backlog";
                            if (task.status === "InProgress")
                              col = "inProgress";
                            else if (task.status === "OnHold") col = "onHold";
                            else if (task.status === "Completed")
                              col = "completed";
                            newColumns[col].tasks.push(task);
                          });
                          setColumns(newColumns);
                          toast.success("Task updated!");
                        } catch (e: any) {
                          toast.error(e.message);
                        } finally {
                          setLoading(false);
                        }
                      } catch (e: any) {
                        toast.error(e.message);
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
              {/* Right: Comments, Collaborators, Actions (placeholder) */}
              <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-blue-100 bg-gradient-to-br from-[#e0f7fa] to-[#f8fdff] p-8 flex flex-col gap-6 relative">
                <div>
                  <div className="font-bold text-lg text-blue-700 mb-2 flex items-center gap-2">
                    <span className="material-icons text-blue-400">
                      chat_bubble_outline
                    </span>{" "}
                    Comments
                  </div>
                  <div className="text-blue-300 text-sm italic mb-2">
                    Coming soon...
                  </div>
                  <textarea
                    className="w-full border border-blue-100 rounded-lg p-2 text-sm bg-white/60"
                    placeholder="Add a comment..."
                    disabled
                  />
                </div>
                <div>
                  <div className="font-bold text-lg text-blue-700 mb-2 flex items-center gap-2">
                    <span className="material-icons text-blue-400">group</span>{" "}
                    Collaborators
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-400 font-bold text-lg">
                      ?
                    </span>
                    <span className="text-blue-300 text-sm">
                      Coming soon...
                    </span>
                  </div>
                </div>
                <div className="mt-auto flex gap-3">
                  <button
                    type="button"
                    className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold shadow hover:bg-blue-200 transition-all"
                  >
                    Leave task
                  </button>
                  <button
                    type="button"
                    className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold shadow hover:bg-blue-200 transition-all"
                  >
                    Attach file
                  </button>
                  <button
                    type="button"
                    className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold shadow hover:bg-blue-200 transition-all"
                  >
                    Copy link
                  </button>
                </div>
                <span
                  className="absolute top-4 right-4 text-blue-300 text-xl cursor-pointer hover:text-blue-500 transition-all"
                  onClick={() => {
                    setSelectedTask(null);
                    setEditTask(null);
                  }}
                  title="Close"
                >
                  ×
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal for adding new task */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <form
              onSubmit={handleAddTask}
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4">Add New Quest</h2>
              <input
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                className="w-full mb-2 p-2 border rounded"
                placeholder="Title"
                required
              />
              <textarea
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="w-full mb-2 p-2 border rounded"
                placeholder="Description"
              />
              <select
                value={newTask.difficulty}
                onChange={(e) =>
                  setNewTask({ ...newTask, difficulty: e.target.value })
                }
                className="w-full mb-2 p-2 border rounded"
              >
                <option value="E-Rank">E-Rank</option>
                <option value="D-Rank">D-Rank</option>
                <option value="C-Rank">C-Rank</option>
                <option value="B-Rank">B-Rank</option>
                <option value="A-Rank">A-Rank</option>
                <option value="S-Rank">S-Rank</option>
              </select>
              <select
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask({ ...newTask, priority: e.target.value })
                }
                className="w-full mb-2 p-2 border rounded"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
                className="w-full mb-2 p-2 border rounded"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

export default KanbanPage;
