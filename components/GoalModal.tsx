import React, { useState, useEffect } from 'react';
import { ProjectGoal } from '../types';
import { X, Target, Calendar } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: ProjectGoal) => void;
  goal?: ProjectGoal;
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSave, goal }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description);
      setDeadline(goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '');
      setProgress(goal.progress);
    } else {
      resetForm();
    }
  }, [goal, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setProgress(0);
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const newGoal: ProjectGoal = {
      id: goal?.id || crypto.randomUUID(),
      title,
      description,
      deadline: deadline ? new Date(deadline).getTime() : Date.now(),
      progress,
      createdAt: goal?.createdAt || Date.now(),
    };

    onSave(newGoal);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-100 rounded-lg text-red-600">
                <Target size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">{goal ? 'Cập nhật Mục tiêu' : 'Thêm Mục tiêu mới'}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên mục tiêu</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Đạt 1 triệu người dùng..."
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả chi tiết</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả cụ thể về mục tiêu này..."
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hạn chót</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-2.5 text-slate-400" />
                  <input 
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 focus:border-red-500 outline-none"
                  />
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tiến độ ({progress}%)</label>
                <input 
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600 mt-3"
                />
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
            className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {goal ? 'Lưu lại' : 'Tạo mục tiêu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;