import React, { useState, useEffect } from 'react';
import { ProjectGoal, KeyResult } from '../types';
import { X, Target, Calendar, Plus, Trash2, TrendingUp } from 'lucide-react';

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
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description);
      setDeadline(goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '');
      setKeyResults(goal.keyResults || []);
    } else {
      resetForm();
    }
  }, [goal, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setKeyResults([{ id: crypto.randomUUID(), title: '', currentValue: 0, targetValue: 100, unit: '%' }]);
  };

  const calculateProgress = (krs: KeyResult[]) => {
    if (krs.length === 0) return 0;
    const totalPercent = krs.reduce((acc, kr) => {
        // Simple logic: if target is 0, avoid division by zero.
        if (kr.targetValue === 0) return acc;
        // Clamp between 0 and 100
        let p = (kr.currentValue / kr.targetValue) * 100;
        if (p > 100) p = 100;
        if (p < 0) p = 0;
        return acc + p;
    }, 0);
    return Math.round(totalPercent / krs.length);
  };

  const handleSave = () => {
    if (!title.trim()) return;

    // Filter out empty KRs
    const validKRs = keyResults.filter(kr => kr.title.trim() !== '');

    const newGoal: ProjectGoal = {
      id: goal?.id || crypto.randomUUID(),
      title,
      description,
      deadline: deadline ? new Date(deadline).getTime() : Date.now(),
      keyResults: validKRs,
      progress: calculateProgress(validKRs),
      createdAt: goal?.createdAt || Date.now(),
    };

    onSave(newGoal);
    onClose();
  };

  const addKeyResult = () => {
      setKeyResults([...keyResults, { id: crypto.randomUUID(), title: '', currentValue: 0, targetValue: 100, unit: 'Đơn vị' }]);
  };

  const updateKeyResult = (id: string, field: keyof KeyResult, value: any) => {
      setKeyResults(keyResults.map(kr => kr.id === id ? { ...kr, [field]: value } : kr));
  };

  const removeKeyResult = (id: string) => {
      setKeyResults(keyResults.filter(kr => kr.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-100 rounded-lg text-red-600">
                <Target size={20} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-800">{goal ? 'Cập nhật OKR' : 'Thiết lập OKR Mới'}</h2>
                <p className="text-xs text-slate-500">Objectives & Key Results</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Objective Section */}
          <div className="space-y-4 border-b border-slate-100 pb-5">
            <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">Mục tiêu (Objective)</label>
                <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Chiếm lĩnh thị trường miền Bắc..."
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-medium"
                autoFocus
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Thời hạn</label>
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả ngắn</label>
                    <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Phạm vi, chiến lược chung..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-red-500 outline-none"
                    />
                </div>
            </div>
          </div>

          {/* Key Results Section */}
          <div>
              <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-bold text-slate-800">Kết quả then chốt (Key Results - KPIs)</label>
                  <button onClick={addKeyResult} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
                      <Plus size={14} /> Thêm KR
                  </button>
              </div>
              
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {keyResults.map((kr, index) => (
                      <div key={kr.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400 w-5">#{index + 1}</span>
                              <input 
                                  type="text" 
                                  value={kr.title}
                                  onChange={(e) => updateKeyResult(kr.id, 'title', e.target.value)}
                                  placeholder="VD: Doanh thu đạt 5 tỷ..."
                                  className="flex-1 text-sm border-none focus:ring-0 p-0 font-medium text-slate-700 placeholder:text-slate-300"
                              />
                              <button onClick={() => removeKeyResult(kr.id)} className="text-slate-300 hover:text-red-500">
                                  <Trash2 size={16} />
                              </button>
                          </div>
                          <div className="flex items-center gap-3 pl-7">
                              <div className="flex-1">
                                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Hiện tại</label>
                                  <input 
                                      type="number" 
                                      value={kr.currentValue}
                                      onChange={(e) => updateKeyResult(kr.id, 'currentValue', Number(e.target.value))}
                                      className="w-full text-sm border-b border-slate-200 focus:border-blue-500 outline-none py-1 text-blue-600 font-bold"
                                  />
                              </div>
                              <div className="text-slate-300">/</div>
                              <div className="flex-1">
                                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Mục tiêu</label>
                                  <input 
                                      type="number" 
                                      value={kr.targetValue}
                                      onChange={(e) => updateKeyResult(kr.id, 'targetValue', Number(e.target.value))}
                                      className="w-full text-sm border-b border-slate-200 focus:border-blue-500 outline-none py-1"
                                  />
                              </div>
                              <div className="w-20">
                                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Đơn vị</label>
                                  <input 
                                      type="text" 
                                      value={kr.unit}
                                      onChange={(e) => updateKeyResult(kr.id, 'unit', e.target.value)}
                                      placeholder="Tỷ, %..."
                                      className="w-full text-sm border-b border-slate-200 focus:border-blue-500 outline-none py-1 text-slate-500"
                                  />
                              </div>
                          </div>
                      </div>
                  ))}
                  {keyResults.length === 0 && (
                      <div className="text-center py-4 text-slate-400 text-sm">Chưa có chỉ số KPI nào. Hãy thêm mới!</div>
                  )}
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
            className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
          >
            <TrendingUp size={18} />
            {goal ? 'Lưu thay đổi' : 'Thiết lập OKR'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;