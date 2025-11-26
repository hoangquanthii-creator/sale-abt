import React from 'react';
import { Task, TaskStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { PRIORITY_COLORS, PRIORITY_LABELS, COLUMNS } from '../constants';

interface DashboardProps {
  tasks: Task[];
}

const COLORS = ['#94a3b8', '#60a5fa', '#a78bfa', '#4ade80'];

const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
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
    <div className="p-8 max-w-6xl mx-auto overflow-y-auto h-full">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Tổng quan Dự án</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Tổng công việc</p>
          <p className="text-4xl font-bold text-slate-800 mt-2">{totalTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Hoàn thành</p>
          <p className="text-4xl font-bold text-green-600 mt-2">{progress}%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Đang thực hiện</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">{statusData[1].value}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Ưu tiên cao</p>
          <p className="text-4xl font-bold text-orange-500 mt-2">
            {tasks.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Status Chart */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Phân bố trạng thái</h3>
          <ResponsiveContainer width="100%" height="85%">
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

        {/* Priority Chart */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Khối lượng theo độ ưu tiên</h3>
          <ResponsiveContainer width="100%" height="85%">
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
  );
};

export default Dashboard;