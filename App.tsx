import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Kanban, Plus, BrainCircuit, Target, Settings } from 'lucide-react';
import { Task, TaskStatus, ViewMode, Priority, ProjectGoal, ZaloSettings } from './types';
import KanbanBoard from './components/KanbanBoard';
import TaskModal from './components/TaskModal';
import AIChat from './components/AIChat';
import Dashboard from './components/Dashboard';
import StrategyModal from './components/StrategyModal';
import GoalList from './components/GoalList';
import GoalModal from './components/GoalModal';
import SettingsModal from './components/SettingsModal';
import { checkAndNotifyTasks } from './services/zaloService';

const App: React.FC = () => {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<ProjectGoal[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('BOARD');
  const [zaloSettings, setZaloSettings] = useState<ZaloSettings>({
    enabled: false,
    oaId: '',
    checkInterval: 1, // check every 1 minute for demo
    notifyUpcoming: true,
    notifyOverdue: true
  });
  
  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Edit states
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [editingGoal, setEditingGoal] = useState<ProjectGoal | undefined>(undefined);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>(TaskStatus.TODO);

  // Load initial data
  useEffect(() => {
    const savedTasks = localStorage.getItem('planai-tasks');
    const savedGoals = localStorage.getItem('planai-goals');
    const savedSettings = localStorage.getItem('planai-settings');

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // Demo tasks
      const demoTasks: Task[] = [
        {
            id: '1',
            title: 'Nghiên cứu đối thủ cạnh tranh',
            description: 'Phân tích 3 đối thủ dẫn đầu thị trường và tính năng nổi bật của họ.',
            status: TaskStatus.DONE,
            priority: Priority.HIGH,
            subtasks: [],
            assignee: 'Nguyễn Văn An',
            startDate: Date.now() - 86400000 * 5, 
            dueDate: Date.now() - 86400000, 
            createdAt: Date.now(),
            tags: []
        },
        {
            id: '2',
            title: 'Phác thảo giao diện (Design System)',
            description: 'Tạo bảng màu và font chữ cơ bản cho ứng dụng.',
            status: TaskStatus.IN_PROGRESS,
            priority: Priority.MEDIUM,
            subtasks: [{id: 's1', title: 'Chọn màu chủ đạo', completed: true}, {id: 's2', title: 'Chọn font chữ', completed: false}],
            assignee: 'Trần Thị Bình',
            startDate: Date.now(),
            dueDate: Date.now() + 86400000 * 3,
            createdAt: Date.now(),
            tags: []
        },
        {
            id: '3',
            title: 'Thiết lập API Backend',
            description: 'Khởi tạo Node.js server và kết nối cơ sở dữ liệu.',
            status: TaskStatus.TODO,
            priority: Priority.URGENT,
            subtasks: [],
            assignee: 'Lê Hoàng Minh',
            startDate: Date.now() + 86400000,
            dueDate: Date.now() + 86400000 * 7,
            createdAt: Date.now(),
            tags: []
        }
      ];
      setTasks(demoTasks as any);
    }

    if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
    } else {
        // Demo Goals
        const demoGoals: ProjectGoal[] = [
            {
                id: 'g1',
                title: 'Ra mắt phiên bản Beta',
                description: 'Hoàn thiện các tính năng cốt lõi và phát hành cho 500 người dùng thử nghiệm đầu tiên.',
                deadline: Date.now() + 86400000 * 30, // 30 days later
                progress: 45,
                createdAt: Date.now()
            }
        ];
        setGoals(demoGoals);
    }

    if (savedSettings) {
        setZaloSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save on change
  useEffect(() => {
    localStorage.setItem('planai-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('planai-goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('planai-settings', JSON.stringify(zaloSettings));
  }, [zaloSettings]);

  // Automatic Notification Loop
  useEffect(() => {
    if (!zaloSettings.enabled) return;

    // Initial check
    const runCheck = async () => {
        await checkAndNotifyTasks(tasks, zaloSettings, handleNotificationSent);
    };
    runCheck();

    // Loop
    const intervalId = setInterval(runCheck, zaloSettings.checkInterval * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [tasks, zaloSettings]);

  const handleNotificationSent = (taskId: string, status: 'UPCOMING' | 'OVERDUE') => {
      setTasks(prevTasks => prevTasks.map(t => 
        t.id === taskId 
            ? { ...t, lastNotificationSent: Date.now(), notificationStatus: status } 
            : t
      ));
  };

  // Task Handlers
  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === task.id ? task : t));
    } else {
      setTasks([...tasks, task]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này không?')) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleAddTask = (status: TaskStatus = TaskStatus.TODO) => {
    setEditingTask(undefined);
    setNewTaskStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  // Goal Handlers
  const handleSaveGoal = (goal: ProjectGoal) => {
    if (editingGoal) {
        setGoals(goals.map(g => g.id === goal.id ? goal : g));
    } else {
        setGoals([...goals, goal]);
    }
  };

  const handleEditGoal = (goal: ProjectGoal) => {
      setEditingGoal(goal);
      setIsGoalModalOpen(true);
  };

  const handleDeleteGoal = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục tiêu này?')) {
        setGoals(goals.filter(g => g.id !== id));
    }
  };

  const handleAddGoal = () => {
      setEditingGoal(undefined);
      setIsGoalModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            P
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
            PlanAI
          </span>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('BOARD')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'BOARD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Kanban size={16} />
            Bảng
          </button>
          <button
            onClick={() => setViewMode('GOALS')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'GOALS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Target size={16} />
            Mục tiêu
          </button>
          <button
            onClick={() => setViewMode('DASHBOARD')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'DASHBOARD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutDashboard size={16} />
            Thống kê
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative"
            title="Cài đặt thông báo"
          >
            <Settings size={20} />
            {zaloSettings.enabled && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
            )}
          </button>

          <button
            onClick={() => setIsStrategyModalOpen(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-medium transition-colors border border-purple-200"
          >
            <BrainCircuit size={16} />
            Chiến lược
          </button>

          {viewMode === 'GOALS' ? (
             <button
               onClick={handleAddGoal}
               className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
             >
               <Plus size={18} />
               <span className="hidden sm:inline">Thêm mục tiêu</span>
             </button>
          ) : (
             <button
                onClick={() => handleAddTask(TaskStatus.TODO)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
             >
                <Plus size={18} />
                <span className="hidden sm:inline">Việc mới</span>
             </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {viewMode === 'BOARD' && (
          <KanbanBoard
            tasks={tasks}
            onTaskUpdate={handleUpdateTask}
            onTaskDelete={handleDeleteTask}
            onEditTask={handleEditTask}
            onAddTask={handleAddTask}
          />
        )}
        {viewMode === 'DASHBOARD' && (
          <Dashboard tasks={tasks} />
        )}
        {viewMode === 'GOALS' && (
           <GoalList 
              goals={goals}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
           />
        )}
      </main>

      {/* Modals & Overlays */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        initialStatus={newTaskStatus}
      />
      
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
        goal={editingGoal}
      />

      <StrategyModal
        isOpen={isStrategyModalOpen}
        onClose={() => setIsStrategyModalOpen(false)}
        tasks={tasks}
      />

      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={zaloSettings}
        onSave={setZaloSettings}
      />

      <AIChat />
    </div>
  );
};

export default App;