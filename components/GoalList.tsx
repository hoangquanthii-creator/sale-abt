import React from 'react';
import { ProjectGoal } from '../types';
import { Target, Calendar, Edit2, Trash2, TrendingUp } from 'lucide-react';

interface GoalListProps {
  goals: ProjectGoal[];
  onEdit: (goal: ProjectGoal) => void;
  onDelete: (id: string) => void;
}

const GoalList: React.FC<GoalListProps> = ({ goals, onEdit, onDelete }) => {
  return (
    <div className="p-8 max-w-6xl mx-auto overflow-y-auto h-full">
      <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-red-100 rounded-xl text-red-600">
             <Target size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Mục tiêu Dự án</h1>
            <p className="text-slate-500">Theo dõi các cột mốc quan trọng và tiến độ tổng thể</p>
          </div>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <Target size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">Chưa có mục tiêu nào được thiết lập.</p>
            <p className="text-slate-400 text-sm">Hãy tạo mục tiêu đầu tiên để định hướng dự án!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const isOverdue = goal.deadline < Date.now() && goal.progress < 100;
            const daysLeft = Math.ceil((goal.deadline - Date.now()) / (1000 * 60 * 60 * 24));

            return (
              <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative group">
                 {/* Actions */}
                 <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(goal)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-500 rounded-lg">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(goal.id)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 rounded-lg">
                        <Trash2 size={16} />
                    </button>
                 </div>

                 <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${goal.progress === 100 ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mục tiêu</span>
                        <h3 className="font-bold text-lg text-slate-800 leading-tight">{goal.title}</h3>
                    </div>
                 </div>

                 <p className="text-slate-600 text-sm mb-6 line-clamp-3 h-10">
                    {goal.description || "Không có mô tả chi tiết."}
                 </p>

                 {/* Progress Bar */}
                 <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">Tiến độ</span>
                        <span className={`font-bold ${goal.progress === 100 ? 'text-green-600' : 'text-blue-600'}`}>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className={`h-2.5 rounded-full transition-all duration-500 ${goal.progress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`} 
                            style={{ width: `${goal.progress}%` }}
                        ></div>
                    </div>
                 </div>

                 <div className="flex items-center gap-2 text-sm pt-4 border-t border-slate-50">
                    <Calendar size={16} className={isOverdue ? "text-red-500" : "text-slate-400"} />
                    <span className={isOverdue ? "text-red-600 font-medium" : "text-slate-500"}>
                        {new Date(goal.deadline).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="ml-auto text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded-full">
                        {goal.progress === 100 ? 'Đã đạt được' : isOverdue ? 'Quá hạn' : `${daysLeft} ngày nữa`}
                    </span>
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