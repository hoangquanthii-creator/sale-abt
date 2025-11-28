import React from 'react';
import { ProjectGoal } from '../types';
import { Target, Calendar, Edit2, Trash2, TrendingUp, ChevronRight } from 'lucide-react';

interface GoalListProps {
  goals: ProjectGoal[];
  onEdit: (goal: ProjectGoal) => void;
  onDelete: (id: string) => void;
}

const GoalList: React.FC<GoalListProps> = ({ goals, onEdit, onDelete }) => {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto overflow-y-auto h-full">
      <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl text-white shadow-lg">
             <Target size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Quản trị Mục tiêu (OKRs)</h1>
            <p className="text-slate-500">Giám sát hiệu suất và các kết quả then chốt (KPIs)</p>
          </div>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                 <Target size={32} />
            </div>
            <p className="text-slate-600 text-lg font-medium">Chưa có OKR nào được thiết lập.</p>
            <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">Với vai trò CEO, hãy bắt đầu bằng việc xác định các Mục tiêu (Objectives) và các Kết quả then chốt (Key Results) để định hướng đội ngũ.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const isOverdue = goal.deadline < Date.now() && goal.progress < 100;
            const daysLeft = Math.ceil((goal.deadline - Date.now()) / (1000 * 60 * 60 * 24));

            return (
              <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow relative group flex flex-col h-full">
                 {/* Header & Actions */}
                 <div className="flex justify-between items-start mb-4">
                     <div className="flex gap-3">
                        <div className={`mt-1 p-2 rounded-lg h-fit ${goal.progress >= 100 ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Objective</span>
                            <h3 className="font-bold text-xl text-slate-800 leading-tight">{goal.title}</h3>
                            <p className="text-slate-500 text-sm mt-1">{goal.description}</p>
                        </div>
                     </div>
                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(goal)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-500 rounded-lg" title="Cập nhật tiến độ">
                            <Edit2 size={18} />
                        </button>
                        <button onClick={() => onDelete(goal.id)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 rounded-lg">
                            <Trash2 size={18} />
                        </button>
                     </div>
                 </div>

                 {/* Key Results Scorecard */}
                 <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 flex-1">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
                        Kết quả then chốt (Key Results)
                    </h4>
                    <div className="space-y-4">
                        {goal.keyResults && goal.keyResults.map(kr => {
                            const percent = kr.targetValue > 0 ? Math.min(100, Math.max(0, (kr.currentValue / kr.targetValue) * 100)) : 0;
                            return (
                                <div key={kr.id}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-700 font-medium">{kr.title}</span>
                                        <span className="text-slate-900 font-bold">
                                            {kr.currentValue} / {kr.targetValue} <span className="text-xs font-normal text-slate-500">{kr.unit}</span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className={`h-2 rounded-full transition-all duration-500 ${percent >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                        {(!goal.keyResults || goal.keyResults.length === 0) && (
                            <p className="text-xs text-slate-400 italic">Chưa thiết lập KR cụ thể.</p>
                        )}
                    </div>
                 </div>

                 {/* Overall Progress & Footer */}
                 <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className={isOverdue ? "text-red-500" : "text-slate-400"} />
                        <span className={isOverdue ? "text-red-600 font-medium" : "text-slate-500"}>
                            {new Date(goal.deadline).toLocaleDateString('vi-VN')}
                        </span>
                        {!isOverdue && (
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                Còn {daysLeft} ngày
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-xs text-slate-400 uppercase font-semibold">Tổng quan</div>
                            <div className={`font-bold text-lg ${goal.progress >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                                {goal.progress}%
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full border-4 border-slate-100 flex items-center justify-center text-xs font-bold text-slate-300 relative">
                             {/* Circular progress visual hack */}
                             <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className={`${goal.progress >= 100 ? 'text-green-500' : 'text-blue-500'}`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeDasharray={`${goal.progress}, 100`}
                                />
                             </svg>
                        </div>
                    </div>
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoalList;