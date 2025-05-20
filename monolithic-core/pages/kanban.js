import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import toast from 'react-hot-toast';
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
    useDroppable
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaPlus, FaTasks, FaArrowRight, FaCheckCircle, FaClock, FaPause, FaPlay } from 'react-icons/fa';
import { GiScrollUnfurled, GiSpikedDragonHead } from 'react-icons/gi';
import { BsUiChecksGrid, BsLightningChargeFill } from 'react-icons/bs';
import LeftPane from '../src/app/LeftPane';
import { calculateLevel, determineRank, taskDifficultyToRank } from '../src/app/utils/soloLeveling';

// Các cột Kanban
const initialColumns = {
    backlog: {
        id: 'backlog',
        title: 'QUEST BACKLOG',
        icon: <GiScrollUnfurled className="text-[#0077b6]" />,
        tasks: [],
        color: 'from-[#ade8f4] to-[#caf0f8]',
        status: 'Pending'
    },
    inProgress: {
        id: 'inProgress',
        title: 'IN PROGRESS',
        icon: <FaPlay className="text-[#0077b6]" />,
        tasks: [],
        color: 'from-[#90e0ef] to-[#ade8f4]',
        status: 'InProgress'
    },
    onHold: {
        id: 'onHold',
        title: 'ON HOLD',
        icon: <FaPause className="text-[#0077b6]" />,
        tasks: [],
        color: 'from-[#48cae4] to-[#90e0ef]',
        status: 'OnHold'
    },
    completed: {
        id: 'completed',
        title: 'COMPLETED',
        icon: <FaCheckCircle className="text-[#0077b6]" />,
        tasks: [],
        color: 'from-[#00b4d8] to-[#48cae4]',
        status: 'Completed'
    },
};

// Component Card cho các task
function SortableTaskCard({ task, columnId, onContextMenu }) {
    const rank = taskDifficultyToRank(task.difficulty);

    // Format due date if present
    const formatDueDate = () => {
        if (!task.dueDate) return null;
        try {
            const date = new Date(task.dueDate);
            return date.toLocaleDateString();
        } catch (e) {
            console.error('Error formatting date:', e);
            return null;
        }
    };

    // Get priority styling
    const getPriorityStyle = () => {
        const priority = task.priority || 'Medium';
        switch (priority) {
            case 'Low':
                return 'bg-[#90e0ef] text-[#03045e]';
            case 'Medium':
                return 'bg-[#0096c7] text-white';
            case 'High':
                return 'bg-[#023e8a] text-white';
            case 'Urgent':
                return 'bg-red-600 text-white';
            default:
                return 'bg-[#0096c7] text-white';
        }
    };

    // Parse tags if in JSON format
    const getTags = () => {
        if (!task.tags) return [];
        if (typeof task.tags === 'string') {
            try {
                return JSON.parse(task.tags);
            } catch (e) {
                return [];
            }
        }
        return Array.isArray(task.tags) ? task.tags : [];
    };

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'task',
            task,
            columnId,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none',
    };

    // Handle right-click context menu
    const handleRightClick = (e) => {
        e.preventDefault();
        onContextMenu(e, task);
    };

    const dueDate = formatDueDate();
    const priorityClass = getPriorityStyle();
    const tags = getTags();

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`p-3 mb-3 rounded-lg border ${isDragging
                ? 'shadow-xl bg-[#90e0ef] border-[#00b4d8]'
                : 'shadow-md bg-white border-[#ade8f4] hover:border-[#00b4d8]'
                } cursor-grab transition-all`}
            {...attributes}
            {...listeners}
            onContextMenu={handleRightClick}
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-[#0077b6] text-sm">{task.title}</h4>
                <span
                    className={`text-xs px-2 py-0.5 rounded-full ${rank.bgColor} ${rank.textColor} border`}
                >
                    {task.difficulty}
                </span>
            </div>

            {/* Task details */}
            {task.description && (
                <div className="mb-2 text-xs text-gray-600 overflow-hidden overflow-ellipsis whitespace-nowrap"
                    title={task.description.replace(/<[^>]*>/g, ' ')}
                >
                    {task.description.replace(/<[^>]*>/g, ' ').substring(0, 60)}
                    {task.description.length > 60 && '...'}
                </div>
            )}

            {/* Priority & Due Date */}
            <div className="flex flex-wrap gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${priorityClass}`}>
                    {task.priority || 'Medium'}
                </span>

                {dueDate && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex items-center">
                        <FaClock className="inline mr-1" size={10} />
                        {dueDate}
                    </span>
                )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {tags.slice(0, 3).map((tag, idx) => (
                        <span
                            key={idx}
                            className="text-xs px-1.5 py-0.5 rounded-sm bg-[#caf0f8] text-[#0077b6]"
                        >
                            #{tag}
                        </span>
                    ))}
                    {tags.length > 3 && (
                        <span className="text-xs px-1 text-[#0077b6]">+{tags.length - 3}</span>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between text-xs text-[#0096c7]">
                <div>
                    <BsLightningChargeFill className="inline mr-1 text-yellow-500" />
                    {task.expReward} EXP
                </div>
                <div className="flex items-center">
                    <FaClock className="inline mr-1" />
                    {new Date(task.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
}

// Droppable Column Component
function KanbanColumn({ column, tasks, onContextMenu }) {
    const { setNodeRef, isOver, active } = useDroppable({
        id: column.id,
        data: {
            type: 'column',
            column
        }
    });

    // Tính toán các lớp CSS dựa trên trạng thái kéo thả
    const dropIndicatorClass = isOver
        ? 'ring-4 ring-[#00b4d8] ring-opacity-70 bg-[#caf0f8]/30'
        : '';

    return (
        <div
            ref={setNodeRef}
            className={`bg-gradient-to-b border border-[#90e0ef] rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-150 ${dropIndicatorClass}`}
            style={{ minHeight: '300px' }}
        >
            <div className={`bg-gradient-to-r ${column.color} p-3 border-b border-[#90e0ef] flex items-center justify-between sticky top-0`}>
                <div className="flex items-center">
                    {column.icon}
                    <h3 className="font-bold text-[#0077b6] ml-2">{column.title}</h3>
                </div>
                <div className="bg-[#0077b6] text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-semibold">
                    {tasks?.length || 0}
                </div>
            </div>

            <div className="flex-1 p-3 bg-[#f8fdff]/80">
                <SortableContext
                    items={tasks.map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <SortableTaskCard
                                key={task.id}
                                task={task}
                                columnId={column.id}
                                onContextMenu={onContextMenu}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-[#90e0ef] opacity-50 py-8">
                            <FaTasks size={24} className="mb-2" />
                            <p className="text-sm">No quests yet</p>
                            <p className="text-xs mt-1">Drag items here</p>
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
}

export default function KanbanPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [columns, setColumns] = useState(initialColumns);
    const [showNewQuestModal, setShowNewQuestModal] = useState(false);
    const [newQuestTitle, setNewQuestTitle] = useState('');
    const [newQuestDifficulty, setNewQuestDifficulty] = useState('E-Rank');
    const [newQuestDescription, setNewQuestDescription] = useState('');
    const [newQuestDueDate, setNewQuestDueDate] = useState('');
    const [newQuestPriority, setNewQuestPriority] = useState('Medium');
    const [newQuestTags, setNewQuestTags] = useState('');
    const [newQuestInitialStatus, setNewQuestInitialStatus] = useState('Pending');
    const [activeTask, setActiveTask] = useState(null);
    // Context menu state
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedTaskForDelete, setSelectedTaskForDelete] = useState(null);

    // Cấu hình sensors cho kéo thả với cài đặt cải tiến
    const sensors = useSensors(
        useSensor(MouseSensor, {
            // Giảm khoảng cách kích hoạt để dễ bắt đầu kéo
            activationConstraint: {
                distance: 1,
                tolerance: 5,
                delay: 0,
            },
        }),
        useSensor(TouchSensor, {
            // Giảm thời gian kích hoạt để dễ bắt đầu kéo trên thiết bị cảm ứng
            activationConstraint: {
                delay: 50,
                tolerance: 8,
                distance: 0,
            },
        })
    );

    const difficultyOptions = [
        { value: 'E-Rank', label: 'E-Rank (Easy)' },
        { value: 'D-Rank', label: 'D-Rank (Medium)' },
        { value: 'C-Rank', label: 'C-Rank (Challenging)' },
        { value: 'B-Rank', label: 'B-Rank (Hard)' },
        { value: 'A-Rank', label: 'A-Rank (Very Hard)' },
        { value: 'S-Rank', label: 'S-Rank (Legendary)' },
    ];

    const priorityOptions = [
        { value: 'Low', label: 'Low Priority', color: 'bg-[#90e0ef] text-[#03045e]' },
        { value: 'Medium', label: 'Medium Priority', color: 'bg-[#0096c7] text-white' },
        { value: 'High', label: 'High Priority', color: 'bg-[#023e8a] text-white' },
        { value: 'Urgent', label: 'Urgent Priority', color: 'bg-red-600 text-white' },
    ];

    const statusOptions = [
        { value: 'Pending', label: 'Quest Backlog', column: 'backlog' },
        { value: 'InProgress', label: 'In Progress', column: 'inProgress' },
        { value: 'OnHold', label: 'On Hold', column: 'onHold' },
        { value: 'Completed', label: 'Completed', column: 'completed' },
    ];

    // Đảm bảo người dùng đã đăng nhập
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/login');
            return;
        }

        document.cookie = `authToken=${token}; path=/; max-age=3600;`;

        const fetchUserData = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        localStorage.removeItem('authToken');
                        router.push('/login');
                        return;
                    }
                    throw new Error('Failed to fetch user data');
                }

                const data = await res.json();
                setUserData(data);
            } catch (error) {
                console.error('Fetch user data error:', error);
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchTasks = async () => {
            try {
                const res = await fetch('/api/tasks', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    // Check if it's a database connectivity issue
                    const errorData = await res.json().catch(() => ({}));
                    if (errorData?.message?.includes('database') || errorData?.error?.includes('database')) {
                        console.error('Database connection error:', errorData);
                        toast.error('Database connection error. Please make sure your PostgreSQL server is running at localhost:5432.');
                    } else {
                        throw new Error('Failed to fetch quests');
                    }
                    return;
                }

                let tasks = await res.json();

                // Thêm expReward nếu thiếu (cho hiển thị)
                tasks = tasks.map(task => ({
                    ...task,
                    expReward: task.expReward || (taskDifficultyToRank(task.difficulty).level * 50 + 20)
                }));

                // Phân loại các task vào các cột tương ứng
                const newColumns = { ...initialColumns };

                tasks.forEach(task => {
                    let columnId;
                    switch (task.status) {
                        case 'Pending':
                            columnId = 'backlog';
                            break;
                        case 'InProgress':
                            columnId = 'inProgress';
                            break;
                        case 'OnHold':
                            columnId = 'onHold';
                            break;
                        case 'Completed':
                            columnId = 'completed';
                            break;
                        default:
                            columnId = 'backlog';
                    }

                    if (!newColumns[columnId].tasks) {
                        newColumns[columnId].tasks = [];
                    }

                    newColumns[columnId].tasks.push(task);
                });

                setColumns(newColumns);
            } catch (error) {
                console.error('Fetch tasks error:', error);
                toast.error(error.message || 'Failed to fetch quests');
            }
        };

        fetchUserData();
        fetchTasks();
    }, [router]);

    // Xử lý đăng xuất
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push('/login');
        toast.success("Đăng xuất thành công");
    };

    // Xử lý kéo thả
    const handleDragStart = (event) => {
        const { active } = event;
        const activeData = active.data.current;

        console.log('Drag started:', active.id, activeData);

        if (activeData && activeData.task) {
            setActiveTask(activeData.task);
        }
    };

    // Sử dụng nhiều thuật toán phát hiện va chạm kết hợp để tăng khả năng phát hiện
    const customCollisionDetection = (args) => {
        // Thử các thuật toán theo thứ tự ưu tiên
        const pointerCollisions = pointerWithin(args);
        if (pointerCollisions.length > 0) return pointerCollisions;

        const rectCollisions = rectIntersection(args);
        if (rectCollisions.length > 0) return rectCollisions;

        // Cuối cùng dùng thuật toán đo điểm gần nhất
        return closestCenter(args);
    };

    const handleDragEnd = async (event) => {
        setActiveTask(null);
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Kiểm tra nếu task đang được kéo
        const activeData = active.data.current;
        if (!activeData) return;

        // Tìm task được kéo
        const sourceColumnId = activeData.columnId;
        const sourceColumn = columns[sourceColumnId];
        const draggedTask = sourceColumn.tasks.find(task => task.id === activeId);

        if (!draggedTask) return;

        // Lấy thông tin về vùng thả
        const overData = over.data.current;
        if (!overData) return;

        // Xác định cột đích
        let destColumnId;

        if (overData.type === 'column') {
            // Nếu thả vào column
            destColumnId = overId;
        } else if (overData.type === 'task') {
            // Nếu thả vào task, lấy columnId của task đó
            destColumnId = overData.columnId;
        } else {
            return;
        }

        const destColumn = columns[destColumnId];

        if (!destColumn) return;

        // Nếu kéo vào cùng một cột
        if (sourceColumnId === destColumnId) {
            if (overData.type === 'task' && activeId !== overId) {
                // Sắp xếp lại trong cùng một cột
                const oldIndex = sourceColumn.tasks.findIndex(task => task.id === activeId);
                const newIndex = destColumn.tasks.findIndex(task => task.id === overId);

                const newTasks = arrayMove(sourceColumn.tasks, oldIndex, newIndex);

                setColumns({
                    ...columns,
                    [sourceColumnId]: {
                        ...sourceColumn,
                        tasks: newTasks
                    }
                });
            }
        } else {
            // Di chuyển sang cột khác
            await updateTaskStatus(draggedTask, destColumn);
        }
    };

    const handleDragCancel = () => {
        setActiveTask(null);
    };

    // Cập nhật trạng thái task
    const updateTaskStatus = async (draggedTask, destColumn) => {
        // Kiểm tra xem destColumn có hợp lệ không
        if (!destColumn || !destColumn.id || !destColumn.status) {
            console.error('Destination column is invalid:', destColumn);
            toast.error('Error updating task status');
            return;
        }

        console.log('Moving task to column:', destColumn.id, 'with status:', destColumn.status);

        // Tìm column hiện tại chứa task
        const sourceColumnId = findColumnIdByTaskId(draggedTask.id);
        if (!sourceColumnId) {
            console.error('Source column not found for task:', draggedTask.id);
            return;
        }

        const sourceColumn = columns[sourceColumnId];

        // Tạo mảng mới cho cột nguồn và xóa task
        const newSourceTasks = sourceColumn.tasks.filter(task => task.id !== draggedTask.id);

        // Tạo bản sao của task với trạng thái mới
        const updatedTask = {
            ...draggedTask,
            status: destColumn.status
        };

        // Log task data
        console.log('Updated task data:', {
            id: updatedTask.id,
            title: updatedTask.title,
            oldStatus: draggedTask.status,
            newStatus: destColumn.status
        });

        // Tạo mảng mới cho cột đích và thêm task
        const newDestTasks = [...destColumn.tasks, updatedTask];

        // Cập nhật state UI trước khi gọi API
        setColumns({
            ...columns,
            [sourceColumnId]: {
                ...sourceColumn,
                tasks: newSourceTasks,
            },
            [destColumn.id]: {
                ...destColumn,
                tasks: newDestTasks,
            },
        });

        // Cập nhật trạng thái task trên server
        try {
            const token = localStorage.getItem('authToken');

            // Tạo dữ liệu để gửi đi và log nó
            const requestData = { status: destColumn.status };
            console.log(`Sending API request to update task ${draggedTask.id}:`, requestData);

            const res = await fetch(`/api/tasks/${draggedTask.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(requestData),
            });

            // Log response status và text
            console.log(`API response status: ${res.status}`);

            if (!res.ok) {
                // Lấy thông tin lỗi chi tiết từ response
                let errorMessage = 'Failed to update quest status';
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.message || errorMessage;
                    console.error('Error data:', errorData);
                } catch (e) {
                    console.error('Could not parse error response', e);
                }

                throw new Error(errorMessage);
            }

            // Parse response data
            const responseData = await res.json();
            console.log('Task successfully updated:', responseData);

            // Nếu task chuyển sang trạng thái hoàn thành, cập nhật kinh nghiệm
            if (destColumn.status === 'Completed' && sourceColumn.status !== 'Completed') {
                // Refresh user data để cập nhật kinh nghiệm và level
                const userRes = await fetch('/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUserData(userData);
                }
            }

            toast.success(`Quest "${draggedTask.title}" moved to ${destColumn.title}`, {
                duration: 2000,
                style: { background: '#0077b6', color: '#fff' },
            });
        } catch (error) {
            console.error('Update task status error:', error);
            toast.error(error.message);

            // Revert changes on error - khôi phục lại state ban đầu
            setColumns(prevColumns => {
                // Phục hồi task vào cột ban đầu
                const revertedSourceTasks = [...prevColumns[sourceColumnId].tasks, draggedTask];
                // Loại bỏ task khỏi cột đích (nếu đã được thêm vào UI)
                const revertedDestTasks = prevColumns[destColumn.id].tasks.filter(
                    task => task.id !== draggedTask.id
                );

                return {
                    ...prevColumns,
                    [sourceColumnId]: {
                        ...prevColumns[sourceColumnId],
                        tasks: revertedSourceTasks
                    },
                    [destColumn.id]: {
                        ...prevColumns[destColumn.id],
                        tasks: revertedDestTasks
                    }
                };
            });
        }
    };

    // Helper để tìm columnId từ taskId
    const findColumnIdByTaskId = (taskId) => {
        for (const [columnId, column] of Object.entries(columns)) {
            if (column.tasks && column.tasks.some(task => task.id === taskId)) {
                return columnId;
            }
        }
        return null;
    };

    // Update the format method
    function formatDate(dateString) {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch (e) {
            console.error('Error formatting date:', e);
            return null;
        }
    }

    // Update the useEffect that sets the default due date
    useEffect(() => {
        if (showNewQuestModal && !newQuestDueDate) {
            const today = new Date();
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);

            // Format as YYYY-MM-DD
            const month = String(nextWeek.getMonth() + 1).padStart(2, '0');
            const day = String(nextWeek.getDate()).padStart(2, '0');
            const formattedDate = `${nextWeek.getFullYear()}-${month}-${day}`;

            setNewQuestDueDate(formattedDate);
        }
    }, [showNewQuestModal]);

    // Modified create quest handler
    const handleCreateQuest = async (e) => {
        e.preventDefault();
        if (!newQuestTitle) {
            toast.error("Quest title cannot be empty.");
            return;
        }

        const token = localStorage.getItem('authToken');
        const toastId = toast.loading("Assigning New Quest...");

        try {
            // Process tags if provided
            const tags = newQuestTags
                ? newQuestTags.split(',').map(tag => tag.trim()).filter(tag => tag)
                : [];

            const questData = {
                title: newQuestTitle,
                difficulty: newQuestDifficulty,
                status: newQuestInitialStatus,
                description: newQuestDescription,
                priority: newQuestPriority,
                dueDate: newQuestDueDate ? new Date(newQuestDueDate).toISOString() : null,
                tags: tags
            };

            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(questData),
            });

            toast.dismiss(toastId);

            if (!res.ok) {
                throw new Error((await res.json()).message || 'Failed to create quest');
            }

            const newTask = await res.json();
            newTask.expReward = newTask.expReward || (taskDifficultyToRank(newTask.difficulty).level * 50 + 20);

            // Add to the appropriate column based on initial status
            const columnId = statusOptions.find(opt => opt.value === newQuestInitialStatus)?.column || 'backlog';

            setColumns(prev => ({
                ...prev,
                [columnId]: {
                    ...prev[columnId],
                    tasks: [...prev[columnId].tasks, newTask]
                }
            }));

            // Reset form fields
            setShowNewQuestModal(false);
            setNewQuestTitle('');
            setNewQuestDescription('');
            setNewQuestDifficulty('E-Rank');
            setNewQuestDueDate('');
            setNewQuestPriority('Medium');
            setNewQuestTags('');
            setNewQuestInitialStatus('Pending');

            toast.success("New Quest Registered in System!");
        } catch (error) {
            toast.dismiss(toastId);
            toast.error(error.message);
        }
    };

    // Reset form when closing modal
    const handleCloseModal = () => {
        setShowNewQuestModal(false);
        setNewQuestTitle('');
        setNewQuestDescription('');
        setNewQuestDifficulty('E-Rank');
        setNewQuestDueDate('');
        setNewQuestPriority('Medium');
        setNewQuestTags('');
        setNewQuestInitialStatus('Pending');
    };

    // Add deleteTask function
    const deleteTask = async (taskToDelete) => {
        if (!taskToDelete) return;

        const token = localStorage.getItem('authToken');
        const toastId = toast.loading("Deleting quest...");

        try {
            const res = await fetch(`/api/tasks/${taskToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
            });

            toast.dismiss(toastId);

            if (!res.ok) {
                throw new Error((await res.json()).message || 'Failed to delete quest');
            }

            // Find column containing the task
            const columnId = findColumnIdByTaskId(taskToDelete.id);
            if (!columnId) {
                throw new Error('Task not found in any column');
            }

            // Remove task from state
            const column = columns[columnId];
            const updatedTasks = column.tasks.filter(t => t.id !== taskToDelete.id);

            setColumns({
                ...columns,
                [columnId]: {
                    ...column,
                    tasks: updatedTasks
                }
            });

            toast.success(`Quest "${taskToDelete.title}" has been deleted!`);
        } catch (error) {
            toast.dismiss(toastId);
            toast.error(error.message);
            console.error('Delete task error:', error);
        }
    };

    // Add handler to close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setContextMenu(null);
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleContextMenu = (e, task) => {
        e.preventDefault();
        setSelectedTaskForDelete(task);
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#caf0f8] flex items-center justify-center">
                <div className="text-[#0077b6] text-lg">Đang tải...</div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>TaskRiser - Kanban Board</title>
            </Head>
            <div className="min-h-screen bg-[#caf0f8] text-[#03045e] font-['Orbitron',_sans-serif] flex">
                <LeftPane userData={userData} onLogout={handleLogout} activePath="/kanban" />
                <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
                    <div className="p-4 md:p-6 lg:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl md:text-3xl font-bold text-[#0077b6] flex items-center gap-3">
                                <GiSpikedDragonHead className="text-[#0077b6]" size={32} />
                                Hunter's Kanban Board
                            </h1>
                            <button
                                onClick={() => setShowNewQuestModal(true)}
                                className="bg-gradient-to-r from-[#0096c7] to-[#00b4d8] hover:from-[#0077b6] hover:to-[#0096c7] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-[#48cae4]/40 transition-all duration-150 flex items-center justify-center text-sm"
                            >
                                <FaPlus className="mr-2" /> Add New Quest
                            </button>
                        </div>

                        {/* Kanban Board */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={customCollisionDetection}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragCancel={handleDragCancel}
                            measuring={{
                                droppable: {
                                    strategy: 'always'
                                }
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 overflow-auto pb-8">
                                {Object.entries(columns).map(([columnId, column]) => (
                                    <KanbanColumn
                                        key={columnId}
                                        column={{ ...column, id: columnId }}
                                        tasks={column.tasks || []}
                                        onContextMenu={handleContextMenu}
                                    />
                                ))}
                            </div>

                            {/* Drag Overlay */}
                            <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                                {activeTask ? (
                                    <div className="p-3 mb-3 rounded-lg border shadow-xl bg-[#90e0ef] border-[#00b4d8] max-w-[300px] opacity-90 transform scale-105">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-[#0077b6] text-sm">{activeTask.title}</h4>
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full border`}
                                            >
                                                {activeTask.difficulty}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-[#0096c7]">
                                            <div>
                                                <BsLightningChargeFill className="inline mr-1 text-yellow-500" />
                                                {activeTask.expReward} EXP
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </div>
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-50 bg-white shadow-xl rounded-lg overflow-hidden border border-[#90e0ef]"
                    style={{
                        top: contextMenu.y,
                        left: contextMenu.x,
                    }}
                >
                    <button
                        onClick={() => {
                            deleteTask(selectedTaskForDelete);
                            setContextMenu(null);
                        }}
                        className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Quest
                    </button>
                </div>
            )}

            {/* Enhanced New Quest Modal */}
            {showNewQuestModal && (
                <div className="fixed inset-0 bg-[#03045e]/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-y-auto">
                    <div className="bg-gradient-to-br from-[#023e8a] via-[#0077b6] to-[#0096c7] p-6 rounded-xl shadow-2xl w-full max-w-3xl border-2 border-[#00b4d8]/70 relative my-8">
                        <div className="absolute -top-2 -right-2 w-16 h-16 bg-[#00b4d8] rounded-full opacity-20 blur-xl animate-ping"></div>
                        <h2 className="text-2xl font-bold text-[#caf0f8] mb-5 flex items-center">
                            <BsLightningChargeFill className="mr-2 text-[#48cae4]" />
                            Register New Quest Directive
                        </h2>
                        <form onSubmit={handleCreateQuest}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Quest Title */}
                                <div className="md:col-span-2">
                                    <label htmlFor="questTitle" className="block text-sm font-medium text-[#48cae4] mb-1">
                                        Quest Objective:
                                    </label>
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

                                {/* Due Date */}
                                <div>
                                    <label htmlFor="questDueDate" className="block text-sm font-medium text-[#48cae4] mb-1">
                                        Deadline:
                                    </label>
                                    <input
                                        type="date"
                                        id="questDueDate"
                                        value={newQuestDueDate}
                                        onChange={(e) => setNewQuestDueDate(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-[#caf0f8] border-2 border-[#90e0ef] rounded-md text-[#03045e] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] transition-colors"
                                    />
                                </div>

                                {/* Initial Status */}
                                <div>
                                    <label htmlFor="questInitialStatus" className="block text-sm font-medium text-[#48cae4] mb-1">
                                        Initial Status:
                                    </label>
                                    <select
                                        id="questInitialStatus"
                                        value={newQuestInitialStatus}
                                        onChange={(e) => setNewQuestInitialStatus(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-[#caf0f8] border-2 border-[#90e0ef] rounded-md text-[#03045e] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] transition-colors"
                                    >
                                        {statusOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Difficulty Rank */}
                                <div>
                                    <label htmlFor="questDifficulty" className="block text-sm font-medium text-[#48cae4] mb-1">
                                        Threat Level (Rank):
                                    </label>
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

                                {/* Priority */}
                                <div>
                                    <label htmlFor="questPriority" className="block text-sm font-medium text-[#48cae4] mb-1">
                                        Priority Level:
                                    </label>
                                    <select
                                        id="questPriority"
                                        value={newQuestPriority}
                                        onChange={(e) => setNewQuestPriority(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-[#caf0f8] border-2 border-[#90e0ef] rounded-md text-[#03045e] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] transition-colors"
                                    >
                                        {priorityOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label htmlFor="questTags" className="block text-sm font-medium text-[#48cae4] mb-1">
                                        Tags (comma separated):
                                    </label>
                                    <input
                                        type="text"
                                        id="questTags"
                                        value={newQuestTags}
                                        onChange={(e) => setNewQuestTags(e.target.value)}
                                        placeholder="e.g., urgent, meeting, research"
                                        className="w-full px-3 py-2.5 bg-[#caf0f8] border-2 border-[#90e0ef] rounded-md text-[#03045e] placeholder-[#90e0ef] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] transition-colors"
                                    />
                                </div>

                                {/* Description Editor */}
                                <div className="md:col-span-2 mt-2">
                                    <label htmlFor="questDescription" className="block text-sm font-medium text-[#48cae4] mb-1">
                                        Quest Details:
                                    </label>
                                    <textarea
                                        id="questDescription"
                                        value={newQuestDescription}
                                        onChange={(e) => setNewQuestDescription(e.target.value)}
                                        placeholder="Describe your quest in detail..."
                                        className="w-full px-3 py-2.5 bg-[#caf0f8] border-2 border-[#90e0ef] rounded-md text-[#03045e] placeholder-[#90e0ef] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] transition-colors h-56 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
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
        </>
    );
} 