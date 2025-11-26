import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority, Subtask } from '../types';
import { suggestSubtasks, suggestDescription } from '../services/geminiService';
import { TEAM_MEMBERS, PRIORITY_LABELS, COLUMNS } from '../constants';
import { X, Sparkles, Plus, CheckSquare, Calendar, User, Loader2, Tag, Handshake, Award } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task?: Task; // If provided, we are editing
  initialStatus?: TaskStatus;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task, initialStatus }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [assignee, setAssignee] = useState<string>('');
  const [meetingWith, setMeetingWith] = useState<string>('');
  const [outcome, setOutcome] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setAssignee(task.assignee || '');
      setMeetingWith(task.meetingWith || '');
      setOutcome(task.outcome || '');
      setStartDate(task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setSubtasks(task.subtasks);
      setTags(task.tags || []);
    } else {
      resetForm();
      if (initialStatus) setStatus(initialStatus);
    }
  }, [task, isOpen, initialStatus]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus(TaskStatus.TODO);
    setPriority(Priority.MEDIUM);
    setAssignee('');
    setMeetingWith('');
    setOutcome('');
    setStartDate('');
    setDueDate('');
    setSubtasks([]);
    setTags([]);
    setTagInput('');
  };

  const handleSave = () => {
    if (!title.trim()) return;
    
    const updatedTask: Task = {
      id: task?.id || crypto.randomUUID(),
      title,
      description,
      status,
      priority,
      subtasks,
      assignee: assignee || undefined,
      meetingWith: meetingWith || undefined,
      outcome: outcome || undefined,
      startDate: startDate ? new Date(startDate).getTime() : undefined,
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      createdAt: task?.createdAt || Date.now(),
      tags: tags,
    };
    
    onSave(updatedTask);
    onClose();
  };

  const handleGenerateSubtasks = async () => {
    if (!title.trim()) return;
    setIsGeneratingSubtasks(true);
    try {
      const suggestions = await suggestSubtasks(title, description);
      const newSubtasks: Subtask[] = suggestions.map(s => ({
        id: crypto.randomUUID(),
        title: s,
        completed: false
      }));
      setSubtasks([...subtasks, ...newSubtasks]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!title.trim()) return;
    setIsGeneratingDesc(true);
    try {
        const suggestedDesc = await suggestDescription(title);
        setDescription(prev => prev ? prev + "\n" + suggestedDesc : suggestedDesc);
    } catch (e) {
        console.error(e);
    } finally {
        setIsGeneratingDesc(false);
    }
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, { id: crypto.randomUUID(), title: '', completed: false }]);
  };

  const updateSubtask = (id: string, text: string) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, title: text } : s));
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">{task ? 'Chỉnh sửa công việc' : 'Tạo việc mới'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên công việc / Việc cần làm</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Họp với khách hàng A..."
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
              >
                {COLUMNS.map(col => (
                  <option key={col.id} value={col.id}>{col.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Độ ưu tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
              >
                {Object.keys(PRIORITY_LABELS).map(p => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p as Priority]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee & Meeting With */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Người thực hiện</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-2.5 text-slate-400" />
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none appearance-none"
                >
                  <option value="">Chưa giao</option>
                  {TEAM_MEMBERS.map(member => (
                    <option key={member.id} value={member.name}>{member.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gặp ai / Đối tác</label>
              <div className="relative">
                <Handshake size={18} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={meetingWith}
                  onChange={(e) => setMeetingWith(e.target.value)}
                  placeholder="KH, Đối tác..."
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Timeframe */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ngày bắt đầu</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-2.5 text-slate-400" />
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hạn chót</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-2.5 text-slate-400" />
                  <input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                  />
                </div>
             </div>
          </div>

           {/* Tags */}
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Thẻ phân loại (Tags)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-sm border border-indigo-100">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={14} /></button>
                </span>
              ))}
            </div>
            <div className="relative">
              <Tag size={18} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Nhập thẻ và nhấn Enter (VD: Marketing, Backend...)"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Nội dung chi tiết</label>
                <button
                    onClick={handleGenerateDescription}
                    disabled={!title || isGeneratingDesc}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                >
                    {isGeneratingDesc ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Gợi ý nội dung
                </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập nội dung công việc, agenda cuộc họp..."
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all h-24 resize-none"
            />
          </div>

           {/* Outcome - New Field */}
           <div>
            <div className="flex items-center gap-2 mb-1">
                <Award size={16} className="text-amber-500"/>
                <label className="block text-sm font-medium text-slate-700">Kết quả đạt được</label>
            </div>
            <textarea
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="Ghi lại kết quả sau khi thực hiện..."
              className="w-full px-4 py-2 rounded-lg border border-amber-200 bg-amber-50/30 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all h-20 resize-none"
            />
          </div>

          {/* Subtasks */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-700">Các bước thực hiện (Checklist)</label>
              <button
                onClick={handleGenerateSubtasks}
                disabled={!title || isGeneratingSubtasks}
                className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
              >
                {isGeneratingSubtasks ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Gợi ý bằng AI
              </button>
            </div>
            
            <div className="space-y-2">
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center gap-2 group">
                   <button 
                    onClick={() => toggleSubtask(st.id)}
                    className={`p-1 rounded transition-colors ${st.completed ? 'text-green-500' : 'text-slate-300 hover:text-slate-400'}`}
                   >
                     <CheckSquare size={18} className={st.completed ? 'fill-current' : ''} />
                   </button>
                   <input
                    type="text"
                    value={st.title}
                    onChange={(e) => updateSubtask(st.id, e.target.value)}
                    className={`flex-1 bg-transparent border-b border-transparent focus:border-slate-300 outline-none text-sm py-1 ${st.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}
                    placeholder="Tên việc nhỏ..."
                   />
                   <button onClick={() => removeSubtask(st.id)} className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                     <X size={16} />
                   </button>
                </div>
              ))}
              <button onClick={addSubtask} className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mt-2 px-1">
                <Plus size={16} /> Thêm bước
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
            Hủy
          </button>
          <button 
            onClick={handleSave} 
            disabled={!title.trim()}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {task ? 'Lưu thay đổi' : 'Tạo mới'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;