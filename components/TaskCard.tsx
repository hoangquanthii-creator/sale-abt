
import React from 'react';
import { Task, TeamMember } from '../types';
import { PRIORITY_COLORS, PRIORITY_LABELS, TAG_COLORS } from '../constants';
import { CheckSquare, AlignLeft, Calendar, MessageCircle, BellRing, Handshake, Award, StickyNote, Clock, AlertOctagon, Target, AlertTriangle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  members: TeamMember[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, members, onEdit, onDelete, onDragStart }) => {
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  
  const assigneeMember = members.find(m => m.name === task.assignee);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' });
  };

  const getTagColor = (tag: string) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % TAG_COLORS.length;
    return TAG_COLORS[index];
  };

  // Status Calculation
  const now = Date.now();
  const isDone = task.status === 'DONE';
  const isOverdue = !isDone && task.dueDate && task.dueDate < now;
  // Due soon: within next 24 hours (86400000 ms)
  const isDueSoon = !isDone && !isOverdue && task.dueDate && (task.dueDate - now < 86400000) && (task.dueDate > now);

  const handleShareZalo = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const lines = [
      `🚀 *NHẮC VIỆC: ${task.title.toUpperCase()}*`,
      `----------------`,
      `📅 Hạn chót: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Không có'}`,
      `👤 Người làm: ${task.assignee || 'Chưa giao'}`,
      task.meetingWith ? `🤝 Gặp: ${task.meetingWith}` : '',
      `⚠️ Mức độ: ${PRIORITY_LABELS[task.priority]}`,
      `📝 Trạng thái: ${task.status}`,
      `🏷️ Tags: ${task.tags && task.tags.length ? task.tags.join(', ') : 'Không có'}`,
      task.quickNote ? `📌 Note: ${task.quickNote}` : '',
      `----------------`,
      `${task.description ? `Nội dung: ${task.description}` : ''}`,
      task.outcome ? `🏆 Kết quả: ${task.outcome}` : ''
    ];
    
    const message = lines.filter(l => l).join('\n');
    
    navigator.clipboard.writeText(message).then(() => {
        const confirm = window.confirm("Đã sao chép nội dung nhắc việc!\n\nBạn có muốn mở Zalo để gửi ngay không?");
        if (confirm) {
            window.open('https://chat.zalo.me/', '_blank');
        }
    });
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onEdit(task)}
      className={`group bg-white rounded-xl shadow-sm border hover:shadow-md transition-all cursor-grab active:cursor-grabbing mb-3 relative overflow-hidden ${isOverdue ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-100'}`}
    >
      {/* Cover Image (AI Generated) */}
      {task.imageUrl && (
          <div className="h-24 w-full bg-slate-100 overflow-hidden relative">
              <img src={task.imageUrl} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
            <div className="flex flex-wrap items-center gap-1.5">
                {/* Priority Label */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${PRIORITY_COLORS[task.priority]} flex items-center gap-1`}>
                    {task.priority === 'URGENT' && <AlertTriangle size={10} />}
                    {PRIORITY_LABELS[task.priority]}
                </span>

                {/* Overdue Indicator */}
                {isOverdue && (
                   <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-bold animate-pulse shadow-sm">
                       <AlertOctagon size={10} /> Quá hạn
                   </span>
                )}

                {/* Due Soon Indicator */}
                {isDueSoon && (
                   <span className="text-[10px] bg-amber-400 text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-bold shadow-sm">
                       <Clock size={10} /> Gấp
                   </span>
                )}
                
                {/* Notification Status (System state) */}
                {task.notificationStatus === 'OVERDUE' && (
                    <span className="text-[10px] bg-red-50 text-red-400 border border-red-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5" title="Hệ thống đã gửi cảnh báo">
                        <BellRing size={8} /> Đã báo
                    </span>
                )}
                {task.notificationStatus === 'UPCOMING' && (
                    <span className="text-[10px] bg-blue-50 text-blue-400 border border-blue-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5" title="Hệ thống đã nhắc nhở">
                        <BellRing size={8} /> Đã nhắc
                    </span>
                )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handleShareZalo}
                    className="text-blue-500 hover:bg-blue-50 p-1 rounded"
                    title="Sao chép & Gửi Zalo"
                >
                    <MessageCircle size={14} />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task.id);
                    }}
                    className="text-slate-400 hover:text-red-500 p-1 rounded"
                    title="Xóa"
                >
                    &times;
                </button>
            </div>
        </div>

        <h3 className={`font-semibold mb-2 leading-tight ${isOverdue ? 'text-red-700' : 'text-slate-800'}`}>{task.title}</h3>
        
        {/* Quick Note */}
        {task.quickNote && (
            <div className="mb-2 px-2 py-1.5 bg-yellow-50 border border-yellow-100 rounded-md text-xs text-slate-700 flex items-start gap-1.5">
                <StickyNote size={12} className="mt-0.5 text-yellow-500 shrink-0 fill-yellow-100" />
                <span className="font-medium">{task.quickNote}</span>
            </div>
        )}

        {/* OKR Linked Indicator */}
        {task.linkedKeyResultId && (
            <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-700 rounded text-[10px] font-bold" title="Công việc này đóng góp cho OKR">
                <Target size={10} />
                <span>OKR Linked</span>
                {task.contributionValue ? <span className="bg-white px-1 rounded text-purple-800 border border-purple-100">+{task.contributionValue}</span> : null}
            </div>
        )}

        {/* Meeting With Info */}
        {task.meetingWith && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5 bg-slate-50 px-2 py-1 rounded inline-flex mt-1">
                <Handshake size={12} className="text-blue-500"/>
                <span>Gặp: {task.meetingWith}</span>
            </div>
        )}

        {task.description && !task.quickNote && (
            <p className="text-xs text-slate-500 line-clamp-2 mb-2 mt-1">{task.description}</p>
        )}

        {/* Outcome Highlight */}
        {task.outcome && (
            <div className="mb-2 p-2 bg-amber-50 rounded border border-amber-100 text-xs text-amber-900">
                <div className="flex items-center gap-1 font-semibold mb-0.5">
                    <Award size={12} className="text-amber-600"/>
                    <span>Kết quả:</span>
                </div>
                <p className="line-clamp-2">{task.outcome}</p>
            </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.map(tag => (
                <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded border ${getTagColor(tag)}`}>
                {tag}
                </span>
            ))}
            </div>
        )}

        {/* Subtasks Progress */}
        <div className="flex items-center gap-2 mb-3">
            {totalSubtasks > 0 ? (
                <div className={`flex items-center gap-1 text-xs ${completedSubtasks === totalSubtasks ? 'text-green-600' : 'text-slate-500'}`}>
                <CheckSquare size={14} />
                <span>{completedSubtasks}/{totalSubtasks}</span>
                </div>
            ) : task.description && !task.quickNote ? (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                <AlignLeft size={14} />
                <span>Chi tiết</span>
                </div>
            ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-1">
            <div className="flex items-center gap-1 text-xs text-slate-400">
            {(task.startDate || task.dueDate) && (
                <>
                <Calendar size={14} className={isOverdue ? 'text-red-500' : isDueSoon ? 'text-amber-500' : ''} />
                <span className={isOverdue ? 'text-red-600 font-bold' : isDueSoon ? 'text-amber-600 font-medium' : ''}>
                    {task.startDate ? formatDate(task.startDate) : ''} 
                    {task.startDate && task.dueDate ? ' - ' : ''} 
                    {task.dueDate ? formatDate(task.dueDate) : ''}
                </span>
                </>
            )}
            </div>
            
            {assigneeMember ? (
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${assigneeMember.color}`} title={task.assignee}>
                {assigneeMember.initials}
            </div>
            ) : task.assignee ? (
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500" title={task.assignee}>
                {task.assignee.substring(0, 2).toUpperCase()}
            </div>
            ) : (
            <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                <span className="text-[10px]">+</span>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
