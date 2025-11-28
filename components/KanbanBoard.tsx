
import React, { useState } from 'react';
import { Task, TaskStatus, Priority, TeamMember } from '../types';
import { COLUMNS, PRIORITY_LABELS } from '../constants';
import TaskCard from './TaskCard';
import WorkflowAnalysisModal from './WorkflowAnalysisModal';
import { Plus, Search, Filter, X, User, Calendar, AlertCircle, GitMerge } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  members: TeamMember[]; // Received from App
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, members, onTaskUpdate, onTaskDelete, onEditTask, onAddTask }) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Advanced Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  // Workflow Analysis Modal
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    // Required for Firefox
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const task = tasks.find(t => t.id === draggedTaskId);
    if (task && task.status !== status) {
      onTaskUpdate({ ...task, status });
    }
    setDraggedTaskId(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterAssignee('');
    setFilterPriority('');
    setFilterDateStart('');
    setFilterDateEnd('');
  };

  // Filter tasks logic
  const filteredTasks = tasks.filter(task => {
    // 1. Text Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      const matchesSearch = (
        task.title.toLowerCase().includes(lowerTerm) ||
        task.description?.toLowerCase().includes(lowerTerm) ||
        task.tags?.some(tag => tag.toLowerCase().includes(lowerTerm)) ||
        task.assignee?.toLowerCase().includes(lowerTerm)
      );
      if (!matchesSearch) return false;
    }

    // 2. Assignee Filter
    if (filterAssignee && task.assignee !== filterAssignee) {
      return false;
    }

    // 3. Priority Filter
    if (filterPriority && task.priority !== filterPriority) {
      return false;
    }

    // 4. Date Range Filter (Based on Due Date)
    if (filterDateStart) {
      const startTs = new Date(filterDateStart).getTime();
      // If task has no due date, or due date is before start date, exclude it
      if (!task.dueDate || task.dueDate < startTs) return false;
    }
    if (filterDateEnd) {
      // Include the whole end day (23:59:59 approximately)
      const endTs = new Date(filterDateEnd).getTime() + 86400000;
      if (!task.dueDate || task.dueDate >= endTs) return false;
    }

    return true;
  });

  const activeFiltersCount = [
    searchTerm,
    filterAssignee,
    filterPriority,
    filterDateStart,
    filterDateEnd
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Header Controls */}
      <div className="px-6 pt-4 pb-2 space-y-3 flex-shrink-0 z-10">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
             <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
             <input
               type="text"
               placeholder="Tìm kiếm theo tên, thẻ, mô tả..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-sm"
             />
          </div>

          <div className="flex gap-2">
             {/* Optimize Flow Button */}
             <button
               onClick={() => setIsWorkflowModalOpen(true)}
               className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-all shadow-sm"
               title="Phân tích và tối ưu luồng công việc"
             >
               <GitMerge size={18} />
               <span className="hidden sm:inline">Tối ưu luồng</span>
             </button>

             {/* Filter Toggle */}
             <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                showFilters || activeFiltersCount > 0
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
                <Filter size={18} />
                <span>Bộ lọc</span>
                {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {activeFiltersCount}
                </span>
                )}
            </button>
          </div>
        </div>

        {/* Expanded Filters Panel */}
        {showFilters && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Assignee */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <User size={12} /> Người thực hiện
                </label>
                <select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                >
                  <option value="">Tất cả</option>
                  {members.map(member => (
                    <option key={member.id} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <AlertCircle size={12} /> Độ ưu tiên
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                >
                  <option value="">Tất cả</option>
                  {Object.keys(PRIORITY_LABELS).map(key => (
                    <option key={key} value={key}>{PRIORITY_LABELS[key as Priority]}</option>
                  ))}
                </select>
              </div>

              {/* Date Start */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Calendar size={12} /> Hạn chót từ
                </label>
                <input
                  type="date"
                  value={filterDateStart}
                  onChange={(e) => setFilterDateStart(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                />
              </div>

              {/* Date End */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Calendar size={12} /> Đến ngày
                </label>
                <input
                  type="date"
                  value={filterDateEnd}
                  onChange={(e) => setFilterDateEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                />
              </div>

              {/* Reset Action */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  disabled={activeFiltersCount === 0}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFiltersCount > 0
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-red-600'
                      : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <X size={16} />
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="h-full flex gap-6 p-6 min-w-[1000px]">
          {COLUMNS.map(column => {
            const columnTasks = filteredTasks.filter(t => t.status === column.id);
            
            return (
              <div 
                key={column.id}
                className={`flex-1 min-w-[280px] max-w-[350px] flex flex-col rounded-2xl ${column.color} bg-opacity-30 border border-opacity-50`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="p-4 flex items-center justify-between sticky top-0 bg-inherit rounded-t-2xl z-10 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-slate-700">{column.title}</h2>
                    <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-medium text-slate-500">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button 
                    onClick={() => onAddTask(column.id)}
                    className="p-1.5 hover:bg-white/60 rounded-lg text-slate-500 transition-colors"
                    title="Thêm thẻ mới"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {columnTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      members={members}
                      onEdit={onEditTask}
                      onDelete={onTaskDelete}
                      onDragStart={handleDragStart}
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-slate-300/50 rounded-xl flex items-center justify-center text-slate-400 text-sm flex-col gap-2">
                       <span>{filteredTasks.length === 0 && activeFiltersCount > 0 ? 'Không tìm thấy kết quả' : 'Trống'}</span>
                       {activeFiltersCount > 0 && tasks.some(t => t.status === column.id) && (
                           <button onClick={clearFilters} className="text-xs text-blue-500 hover:underline">Xóa bộ lọc</button>
                       )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Modals */}
      <WorkflowAnalysisModal 
         isOpen={isWorkflowModalOpen}
         onClose={() => setIsWorkflowModalOpen(false)}
         tasks={tasks}
      />
    </div>
  );
};

export default KanbanBoard;
