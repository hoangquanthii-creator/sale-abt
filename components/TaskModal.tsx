
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority, Subtask, ProjectGoal, TeamMember } from '../types';
import { suggestSubtasks, suggestDescription, generateTaskImage } from '../services/geminiService';
import { PRIORITY_LABELS, COLUMNS } from '../constants';
import { X, Sparkles, Plus, CheckSquare, Calendar, User, Loader2, Tag, Handshake, Award, StickyNote, Image as ImageIcon, Wand2, Target, Link } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task?: Task;
  initialStatus?: TaskStatus;
  goals: ProjectGoal[];
  members: TeamMember[]; // New prop
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task, initialStatus, goals, members }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'okr'>('info');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quickNote, setQuickNote] = useState('');
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
  const [imageUrl, setImageUrl] = useState<string>('');
  
  // OKR Linking
  const [linkedKeyResultId, setLinkedKeyResultId] = useState<string>('');
  const [contributionValue, setContributionValue] = useState<number>(0);

  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setQuickNote(task.quickNote || '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssignee(task.assignee || '');
      setMeetingWith(task.meetingWith || '');
      setOutcome(task.outcome || '');
      setStartDate(task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setSubtasks(task.subtasks);
      setTags(task.tags || []);
      setImageUrl(task.imageUrl || '');
      setLinkedKeyResultId(task.linkedKeyResultId || '');
      setContributionValue(task.contributionValue || 0);
      setActiveTab('info');
    } else {
      resetForm();
      if (initialStatus) setStatus(initialStatus);
    }
  }, [task, isOpen, initialStatus]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setQuickNote('');
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
    setImageUrl('');
    setImagePrompt('');
    setLinkedKeyResultId('');
    setContributionValue(0);
    setActiveTab('info');
  };

  const handleSave = () => {
    if (!title.trim()) return;
    
    const updatedTask: Task = {
      id: task?.id || crypto.randomUUID(),
      title,
      description,
      quickNote: quickNote || undefined,
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
      imageUrl: imageUrl || undefined,
      linkedKeyResultId: linkedKeyResultId || undefined,
      contributionValue: contributionValue || undefined,
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

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    try {
        const url = await generateTaskImage(imagePrompt);
        if (url) {
            setImageUrl(url);
        } else {
            alert("Không thể tạo ảnh. Vui lòng thử lại sau hoặc đổi mô tả.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsGeneratingImage(false);
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

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
            <button 
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'info' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Thông tin chung
            </button>
            <button 
                onClick={() => setActiveTab('media')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2 ${activeTab === 'media' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <ImageIcon size={16} />
                Hình ảnh & AI
            </button>
            <button 
                onClick={() => setActiveTab('okr')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2 ${activeTab === 'okr' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <Target size={16} />
                Liên kết OKR
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          
          {/* TAB 1: INFO */}
          {activeTab === 'info' && (
             <div className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên công việc / Việc cần làm</label>
                    <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Họp với khách hàng A..."
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-lg"
                    autoFocus
                    />
                </div>

                {/* Quick Note */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <StickyNote size={14} className="text-amber-500" />
                        <label className="block text-sm font-medium text-slate-700">Ghi chú nhanh (Hiển thị ngoài thẻ)</label>
                    </div>
                    <input
                    type="text"
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    placeholder="VD: Pass wifi: 12345678, Gọi gấp..."
                    className="w-full px-4 py-2 rounded-lg border border-amber-200 bg-amber-50 focus:border-amber-400 outline-none text-sm text-slate-700"
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
                        {members.map(member => (
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

                {/* Outcome */}
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
          )}

          {/* TAB 2: MEDIA */}
          {activeTab === 'media' && (
              <div className="space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Hình ảnh minh họa</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center min-h-[200px] bg-slate-50 relative overflow-hidden group">
                        {imageUrl ? (
                            <>
                                <img src={imageUrl} alt="Task visualization" className="w-full h-full object-contain rounded-lg" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                     <button onClick={() => setImageUrl('')} className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm">
                                        <X size={20} />
                                     </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-slate-400">
                                <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Chưa có hình ảnh</p>
                            </div>
                        )}
                    </div>
                 </div>

                 <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                     <div className="flex items-center gap-2 mb-2 text-indigo-800">
                         <Wand2 size={18} />
                         <h3 className="font-semibold text-sm">AI Image Generator</h3>
                     </div>
                     <p className="text-xs text-indigo-600 mb-3">Mô tả ý tưởng của bạn và AI sẽ vẽ nó (VD: Logo cho dự án coffee shop, biểu đồ tăng trưởng...)</p>
                     
                     <div className="flex gap-2">
                        <input
                            type="text"
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            placeholder="Nhập mô tả ảnh muốn tạo..."
                            className="flex-1 px-3 py-2 rounded-lg border border-indigo-200 text-sm focus:border-indigo-500 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerateImage()}
                        />
                        <button 
                            onClick={handleGenerateImage}
                            disabled={isGeneratingImage || !imagePrompt}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isGeneratingImage ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            Tạo ảnh
                        </button>
                     </div>
                 </div>
              </div>
          )}

          {/* TAB 3: OKR LINKING */}
          {activeTab === 'okr' && (
              <div className="space-y-6">
                 <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                     <div className="flex items-center gap-2 mb-4 text-slate-800">
                         <Link size={20} className="text-blue-500" />
                         <h3 className="font-bold">Liên kết Kết quả then chốt (KR)</h3>
                     </div>
                     <p className="text-sm text-slate-500 mb-4">
                        Liên kết công việc này với một mục tiêu KPI cụ thể. Khi công việc hoàn thành (DONE), hệ thống sẽ tự động cập nhật tiến độ cho KR tương ứng.
                     </p>
                     
                     <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Chọn Key Result</label>
                            <select
                                value={linkedKeyResultId}
                                onChange={(e) => setLinkedKeyResultId(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none bg-white"
                            >
                                <option value="">-- Không liên kết --</option>
                                {goals.map(goal => (
                                    <optgroup key={goal.id} label={goal.title}>
                                        {goal.keyResults.map(kr => (
                                            <option key={kr.id} value={kr.id}>
                                                {kr.title} (Hiện tại: {kr.currentValue}/{kr.targetValue} {kr.unit})
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        {linkedKeyResultId && (
                             <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Giá trị đóng góp (Contribution)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={contributionValue}
                                        onChange={(e) => setContributionValue(Number(e.target.value))}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                                        placeholder="0"
                                    />
                                    <span className="text-sm text-slate-500 shrink-0">
                                        đơn vị
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    * Ví dụ: Nếu KR là "Doanh thu", nhập số tiền công việc này mang lại. Nếu KR là "Số lượng bài viết", nhập 1.
                                </p>
                             </div>
                        )}
                     </div>
                 </div>
              </div>
          )}

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
