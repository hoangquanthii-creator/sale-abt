
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Kanban, Plus, BrainCircuit, Target, Settings, Sparkles, MonitorPlay, Users, CloudCheck, Loader2 } from 'lucide-react';
import { Task, TaskStatus, ViewMode, ProjectGoal, ZaloSettings, KeyResult, TeamMember } from './types';
import KanbanBoard from './components/KanbanBoard';
import TaskModal from './components/TaskModal';
import AIChat from './components/AIChat';
import Dashboard from './components/Dashboard';
import StrategyModal from './components/StrategyModal';
import GoalList from './components/GoalList';
import GoalModal from './components/GoalModal';
import SettingsModal from './components/SettingsModal';
import TeamHub from './components/TeamHub';
import { checkAndNotifyTasks } from './services/zaloService';
import { api } from './services/api'; // Import API instead of storageService

const App: React.FC = () => {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<ProjectGoal[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('BOARD');
  const [zaloSettings, setZaloSettings] = useState<ZaloSettings>({
    enabled: false, oaId: '', checkInterval: 1, notifyUpcoming: true, notifyOverdue: true
  });
  
  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'zalo' | 'team' | 'data'>('zalo');

  // Edit states
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [editingGoal, setEditingGoal] = useState<ProjectGoal | undefined>(undefined);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>(TaskStatus.TODO);

  // --- DATA LOADING (Async) ---
  const loadData = async () => {
      setIsLoading(true);
      try {
          const data = await api.getData();
          setTasks(data.tasks);
          setGoals(data.goals);
          setMembers(data.members);
          setZaloSettings(data.settings);
      } catch (e) {
          console.error("Failed to load data", e);
          alert("Không thể kết nối với máy chủ.");
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- DATA PERSISTENCE (Async Sync) ---
  // Note: In a real React app, we might use React Query or separate save handlers.
  // For this architecture, we sync whenever state changes.
  
  useEffect(() => {
    if (!isLoading) api.saveTasks(tasks);
  }, [tasks, isLoading]);

  useEffect(() => {
    if (!isLoading) api.saveGoals(goals);
  }, [goals, isLoading]);

  useEffect(() => {
    if (!isLoading) api.saveSettings(zaloSettings);
  }, [zaloSettings, isLoading]);
  
  useEffect(() => {
    if (!isLoading) api.saveMembers(members);
  }, [members, isLoading]);

  // --- NOTIFICATION LOOP ---
  useEffect(() => {
    if (!zaloSettings.enabled || isLoading) return;

    const runCheck = async () => {
        // We pass a dummy callback because api handles logic now
        const updatedTasks = await checkAndNotifyTasks(() => {});
        if (updatedTasks) {
            setTasks(updatedTasks);
        }
    };
    
    // Run after a short delay to ensure load is complete
    const timeoutId = setTimeout(runCheck, 5000); 

    const intervalId = setInterval(runCheck, zaloSettings.checkInterval * 60 * 1000);
    
    return () => {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
    };
  }, [zaloSettings, isLoading]); // Removed 'tasks' dependency to avoid loop, backend handles source of truth

  /**
   * Helper to recalculate goal progress based on KRs
   */
  const calculateGoalProgress = (krs: KeyResult[]) => {
    if (krs.length === 0) return 0;
    const totalPercent = krs.reduce((acc, kr) => {
        if (kr.targetValue === 0) return acc;
        let p = (kr.currentValue / kr.targetValue) * 100;
        if (p > 100) p = 100;
        if (p < 0) p = 0;
        return acc + p;
    }, 0);
    return Math.round(totalPercent / krs.length);
  };

  /**
   * Updates OKR progress when a task's status or contribution changes.
   */
  const updateLinkedOKR = (oldTask: Task | undefined, newTask: Task) => {
    if (!newTask.linkedKeyResultId) return;

    let valueToAdd = 0;

    if (newTask.status === TaskStatus.DONE && oldTask?.status !== TaskStatus.DONE) {
        valueToAdd = newTask.contributionValue || 0;
    }
    else if (newTask.status !== TaskStatus.DONE && oldTask?.status === TaskStatus.DONE) {
        valueToAdd = -(newTask.contributionValue || 0);
    }
    else if (newTask.status === TaskStatus.DONE && oldTask?.status === TaskStatus.DONE) {
        valueToAdd = (newTask.contributionValue || 0) - (oldTask.contributionValue || 0);
    }

    if (valueToAdd === 0) return;

    setGoals(prevGoals => {
        return prevGoals.map(goal => {
            const hasKR = goal.keyResults.some(kr => kr.id === newTask.linkedKeyResultId);
            if (!hasKR) return goal;

            const updatedKRs = goal.keyResults.map(kr => {
                if (kr.id === newTask.linkedKeyResultId) {
                    return { ...kr, currentValue: kr.currentValue + valueToAdd };
                }
                return kr;
            });

            return {
                ...goal,
                keyResults: updatedKRs,
                progress: calculateGoalProgress(updatedKRs)
            };
        });
    });
  };

  // Task Handlers
  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      updateLinkedOKR(editingTask, task);
      setTasks(tasks.map(t => t.id === task.id ? task : t));
    } else {
      if (task.status === TaskStatus.DONE) {
         updateLinkedOKR(undefined, task);
      }
      setTasks([...tasks, task]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này không?')) {
      const taskToDelete = tasks.find(t => t.id === taskId);
      if (taskToDelete && taskToDelete.status === TaskStatus.DONE && taskToDelete.linkedKeyResultId) {
         updateLinkedOKR(taskToDelete, { ...taskToDelete, status: TaskStatus.TODO }); 
      }
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
    const oldTask = tasks.find(t => t.id === updatedTask.id);
    updateLinkedOKR(oldTask, updatedTask);
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
    if (window.confirm('Bạn có chắc chắn muốn xóa OKR này?')) {
        setGoals(goals.filter(g => g.id !== id));
    }
  };

  const handleAddGoal = () => {
      setEditingGoal(undefined);
      setIsGoalModalOpen(true);
  };

  const handleDataImported = () => {
      loadData();
      setViewMode('BOARD');
  };

  const openSettings = (tab: 'zalo' | 'team' | 'data' = 'zalo') => {
      setSettingsInitialTab(tab);
      setIsSettingsModalOpen(true);
  };

  // Loading Screen
  if (isLoading) {
      return (
          <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl animate-bounce flex items-center justify-center text-white font-bold text-xl">P</div>
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Đang kết nối đến máy chủ...</span>
              </div>
          </div>
      );
  }

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
          <div className="hidden sm:flex items-center gap-1 ml-3 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium border border-green-100">
            <CloudCheck size={14} />
            <span>Server Online</span>
          </div>
        </div>

        <div className="hidden md:flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('BOARD')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'BOARD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Kanban size={16} />
            Bảng việc
          </button>
          <button
            onClick={() => setViewMode('GOALS')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'GOALS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Target size={16} />
            Quản trị OKR
          </button>
          <button
            onClick={() => setViewMode('DASHBOARD')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'DASHBOARD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutDashboard size={16} />
            Thống kê
          </button>
          <button
            onClick={() => setViewMode('TEAM_HUB')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'TEAM_HUB' ? 'bg-slate-800 text-white shadow-sm hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <MonitorPlay size={16} />
            Team Hub
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openSettings('team')}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative"
            title="Quản lý thành viên"
          >
            <Users size={20} />
          </button>

          <button
            onClick={() => openSettings('zalo')}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative"
            title="Cài đặt hệ thống"
          >
            <Settings size={20} />
          </button>

          <button
            onClick={() => setIsStrategyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg"
            title="Phân tích chiến lược & rủi ro"
          >
            <BrainCircuit size={16} />
            <span className="hidden sm:inline">Chiến lược</span>
          </button>

          {viewMode === 'GOALS' ? (
             <button
               onClick={handleAddGoal}
               className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
             >
               <Plus size={18} />
               <span className="hidden sm:inline">Thêm OKR</span>
             </button>
          ) : viewMode === 'TEAM_HUB' ? (
            <div className="text-xs text-slate-400 font-medium px-2">Chế độ xem công khai</div>
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
            members={members}
            onTaskUpdate={handleUpdateTask}
            onTaskDelete={handleDeleteTask}
            onEditTask={handleEditTask}
            onAddTask={handleAddTask}
          />
        )}
        {viewMode === 'DASHBOARD' && (
          <Dashboard 
            tasks={tasks} 
            onOpenStrategy={() => setIsStrategyModalOpen(true)} 
          />
        )}
        {viewMode === 'GOALS' && (
           <GoalList 
              goals={goals}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
           />
        )}
        {viewMode === 'TEAM_HUB' && (
            <TeamHub tasks={tasks} goals={goals} members={members} />
        )}
      </main>

      {/* Modals & Overlays */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        initialStatus={newTaskStatus}
        goals={goals}
        members={members}
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
        onSaveSettings={setZaloSettings}
        members={members}
        onSaveMembers={setMembers}
        onDataImported={handleDataImported}
        initialTab={settingsInitialTab}
      />

      {/* Pass tasks to AIChat */}
      <AIChat tasks={tasks} />
    </div>
  );
};

export default App;
