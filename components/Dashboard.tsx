import React from 'react';
import { Task, TaskStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { PRIORITY_COLORS, PRIORITY_LABELS, COLUMNS } from '../constants';
import { BrainCircuit, Sparkles, ArrowRight } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  onOpenStrategy: () => void;
}

const COLORS = ['#94a3b8', '#60a5fa', '#a78bfa', '#4ade80'];

const Dashboard: React.FC<DashboardProps> = ({ tasks, onOpenStrategy }) => {
  const statusData = [
    { name: 'Cần làm', value: tasks.filter(t => t.status === TaskStatus.TODO).length },
    { name: 'Đang làm', value: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length },
    { name: 'Phê duyệt', value: tasks.filter(t => t.status === TaskStatus.REVIEW).length },
    { name: 'Xong', value: tasks.filter(t => t.status === TaskStatus.DONE).length },
  ];

  const priorityData = Object.keys(PRIORITY_COLORS).map(p => ({
    name: PRIORITY_LABELS[p as keyof typeof PRIORITY_LABELS],
    value: tasks.filter(t => t.priority === p).length
  }));

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto overflow-y-auto h-full space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Tổng quan Dự án</h1>
      </div>

      {/* AI Strategy CTA Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl p-6 md:p-8 shadow-lg text-white">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
             <div className="flex items-center gap-2 mb-2 text-indigo-200 font-medium text-sm uppercase tracking-wide">
                <BrainCircuit size={16} />
                <span>Trí tuệ nhân tạo Gemini 3 Pro</span>
             </div>
             <h2 className="text-2xl font-bold mb-2">Phân tích Chiến lược & Rủi ro</h2>
             <p className="text-indigo-100 leading-relaxed">
                Yêu cầu AI rà soát toàn bộ {totalTasks} công việc để tìm ra điểm nghẽn, cảnh báo rủi ro chậm tiến độ và đề xuất phương án tối ưu nguồn lực ngay lập tức.
             </p>
          </div>
          <button 
            onClick={onOpenStrategy}
            className="group flex-shrink-0 flex items-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-md active:scale-95"
          >
            <Sparkles size={18} className="text-amber-500" />
            <span>Phân tích ngay</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-500 opacity-20 rounded-full blur-3xl"></div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs md:text-sm text-slate-500 font-medium uppercase tracking-wider">Tổng công việc</p>
          <p className="text-2xl md:text-4xl font-bold text-slate-800 mt-2">{totalTasks}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs md:text-sm text-slate-500 font-medium uppercase tracking-wider">Hoàn thành</p>
          <p className="text-2xl md:text-4xl font-bold text-green-600 mt-2">{progress}%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs md:text-sm text-slate-500 font-medium uppercase tracking-wider">Đang thực hiện</p>
          <p className="text-2xl md:text-4xl font-bold text-blue-600 mt-2">{statusData[1].value}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs md:text-sm text-slate-500 font-medium uppercase tracking-wider">Ưu tiên cao</p>
          <p className="text-2xl md:text-4xl font-bold text-orange-500 mt-2">
            {tasks.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8">
        {/* Status Chart */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6 shrink-0">Phân bố trạng thái</h3>
          {/* Added min-w-0 to ensure flex child handles width correctly */}
          <div className="flex-1 w-full min-h-0 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Chart */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6 shrink-0">Khối lượng theo độ ưu tiên</h3>
          {/* Added min-w-0 to ensure flex child handles width correctly */}
          <div className="flex-1 w-full min-h-0 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;