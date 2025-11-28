
import React from 'react';
import { Task, ProjectGoal, TaskStatus, TeamMember } from '../types';
import { Trophy, CheckCircle2, Activity, Users, Star, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface TeamHubProps {
  tasks: Task[];
  goals: ProjectGoal[];
  members: TeamMember[]; // Received from App
}

const TeamHub: React.FC<TeamHubProps> = ({ tasks, goals, members }) => {
  // 1. Calculate Overall Company Progress based on Goals
  const overallProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) 
    : 0;

  // 2. Leaderboard Logic (Who completed the most tasks)
  const leaderboard = members.map(member => {
    const completedCount = tasks.filter(t => t.status === TaskStatus.DONE && t.assignee === member.name).length;
    return { ...member, score: completedCount };
  }).sort((a, b) => b.score - a.score).slice(0, 3); // Top 3

  // 3. Recent Activity (Last 5 completed tasks)
  const recentActivities = tasks
    .filter(t => t.status === TaskStatus.DONE)
    .sort((a, b) => (b.dueDate || 0) - (a.dueDate || 0)) // Using dueDate as proxy for completion time in demo
    .slice(0, 5);

  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.DONE).length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;

  return (
    <div className="h-full overflow-y-auto bg-slate-900 text-white p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <Activity className="text-blue-400 animate-pulse" size={28} />
             <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Team Pulse</h1>
           </div>
           <p className="text-slate-400">Bảng theo dõi mục tiêu & hiệu suất chung toàn công ty</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-2xl border border-slate-700">
           <div className="text-right">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Tiến độ OKR Tổng</p>
              <p className="text-3xl font-bold text-white">{overallProgress}%</p>
           </div>
           {/* Fixed dimensions for small chart */}
           <div className="w-16 h-16 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{value: overallProgress}, {value: 100 - overallProgress}]}
                    innerRadius={25}
                    outerRadius={32}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#8b5cf6" />
                    <Cell fill="#334155" />
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center">
                <Target size={16} className="text-purple-400" />
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Goals Snapshot */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <Target className="text-red-400" />
                 Mục tiêu Chiến lược (OKRs)
              </h2>
              <div className="space-y-6">
                 {goals.map(goal => (
                    <div key={goal.id} className="group">
                       <div className="flex justify-between items-end mb-2">
                          <div>
                             <h3 className="font-semibold text-lg text-slate-200 group-hover:text-blue-400 transition-colors">{goal.title}</h3>
                             <p className="text-sm text-slate-500 line-clamp-1">{goal.description}</p>
                          </div>
                          <span className={`text-xl font-bold ${goal.progress >= 100 ? 'text-green-400' : 'text-blue-400'}`}>
                             {goal.progress}%
                          </span>
                       </div>
                       <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
                          <div 
                             className={`h-full rounded-full transition-all duration-1000 ${goal.progress >= 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                             style={{ width: `${goal.progress}%` }}
                          ></div>
                       </div>
                    </div>
                 ))}
                 {goals.length === 0 && <p className="text-slate-500 italic">Chưa có mục tiêu nào được công bố.</p>}
              </div>
           </div>

           <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <CheckCircle2 className="text-green-400" />
                 Hoạt động gần đây
              </h2>
              <div className="space-y-4">
                 {recentActivities.map(task => (
                    <div key={task.id} className="flex items-center gap-4 bg-slate-700/50 p-4 rounded-xl border border-slate-700">
                       <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={20} />
                       </div>
                       <div className="flex-1">
                          <p className="font-medium text-slate-200">{task.title}</p>
                          <p className="text-xs text-slate-400 mt-1">
                             Hoàn thành bởi <span className="text-blue-400 font-semibold">{task.assignee || 'Anonymous'}</span>
                             {task.outcome && ` • Kết quả: ${task.outcome}`}
                          </p>
                       </div>
                       {task.imageUrl && (
                          <img src={task.imageUrl} alt="Proof" className="w-12 h-12 rounded-lg object-cover border border-slate-600" />
                       )}
                    </div>
                 ))}
                 {recentActivities.length === 0 && <p className="text-slate-500 italic">Chưa có công việc nào hoàn thành gần đây.</p>}
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Leaderboard & Stats */}
        <div className="space-y-8">
           {/* Leaderboard */}
           <div className="bg-gradient-to-b from-indigo-900 to-slate-800 rounded-2xl p-6 border border-indigo-700/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Trophy size={100} />
              </div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                 <Trophy className="text-yellow-400" />
                 Bảng Vinh Danh
              </h2>
              <div className="space-y-4 relative z-10">
                 {leaderboard.map((user, index) => (
                    <div key={user.id} className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                       <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${
                          index === 0 ? 'bg-yellow-500 text-yellow-900' : 
                          index === 1 ? 'bg-slate-300 text-slate-900' :
                          index === 2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-700 text-slate-400'
                       }`}>
                          {index + 1}
                       </div>
                       <div className="flex-1">
                          <p className="font-bold text-white">{user.name}</p>
                          <p className="text-xs text-indigo-300">{user.score} nhiệm vụ hoàn thành</p>
                       </div>
                       {index === 0 && <Star className="text-yellow-400 fill-yellow-400 animate-pulse" size={20} />}
                    </div>
                 ))}
                 {leaderboard.length === 0 && <p className="text-slate-500 italic">Chưa có dữ liệu thành viên.</p>}
              </div>
           </div>

           {/* Quick Stats */}
           <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <Users className="text-blue-400" />
                 Thống kê nhanh
              </h2>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-700/50 p-4 rounded-xl text-center">
                    <p className="text-3xl font-bold text-white">{tasks.length}</p>
                    <p className="text-xs text-slate-400 uppercase mt-1">Tổng việc</p>
                 </div>
                 <div className="bg-slate-700/50 p-4 rounded-xl text-center">
                    <p className="text-3xl font-bold text-green-400">{completedTasks}</p>
                    <p className="text-xs text-slate-400 uppercase mt-1">Đã xong</p>
                 </div>
                 <div className="bg-slate-700/50 p-4 rounded-xl text-center">
                    <p className="text-3xl font-bold text-orange-400">
                       {tasks.filter(t => t.priority === 'URGENT' && t.status !== 'DONE').length}
                    </p>
                    <p className="text-xs text-slate-400 uppercase mt-1">Khẩn cấp</p>
                 </div>
                 <div className="bg-slate-700/50 p-4 rounded-xl text-center">
                    <p className="text-3xl font-bold text-purple-400">{members.length}</p>
                    <p className="text-xs text-slate-400 uppercase mt-1">Thành viên</p>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default TeamHub;
