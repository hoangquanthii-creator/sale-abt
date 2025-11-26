import React from 'react';
import { Task, Priority } from '../types';
import { PRIORITY_COLORS, TEAM_MEMBERS, PRIORITY_LABELS, TAG_COLORS } from '../constants';
import { CheckSquare, AlignLeft, Calendar, MessageCircle, BellRing } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onDragStart }) => {
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  
  const assigneeMember = TEAM_MEMBERS.find(m => m.name === task.assignee);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' });
  };

  // Helper to generate a consistent color based on string content
  const getTagColor = (tag: string) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % TAG_COLORS.length;
    return TAG_COLORS[index];
  };

  const handleShareZalo = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Format message for Zalo
    const lines = [
      `🚀 *NHẮC VIỆC: ${task.title.toUpperCase()}*`,
      `----------------`,
      `📅 Hạn chót: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Không có'}`,
      `👤 Người làm: ${task.assignee || 'Chưa giao'}`,
      `⚠️ Mức độ: ${PRIORITY_LABELS[task.priority]}`,
      `📝 Trạng thái: ${task.status}`,
      `🏷️ Tags: ${task.tags && task.tags.length ? task.tags.join(', ') : 'Không có'}`,
      `----------------`,
      `${task.description ? `Nội dung: ${task.description}` : ''}`
    ];
    
    const message = lines.filter(l => l).join('\n');
    
    // Copy to clipboard
    navigator.clipboard.writeText(message).then(() => {
        // In a real app with backend, we would call an API. 
        // Here we simulate by opening Zalo Web and letting user paste.
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
      className="group bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-grab active:cursor-grabbing mb-3 relative"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${PRIORITY_COLORS[task.priority]}`}>
            {PRIORITY_LABELS[task.priority]}
            </span>
            {task.notificationStatus === 'OVERDUE' && (
                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5" title="Đã gửi cảnh báo quá hạn">
                    <BellRing size={10} /> Đã báo
                </span>
            )}
            {task.notificationStatus === 'UPCOMING' && (
                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5" title="Đã nhắc việc">
                    <BellRing size={10} /> Đã nhắc
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

      <h3 className="font-semibold text-slate-800 mb-1 leading-tight">{task.title}</h3>
      
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-2">{task.description}</p>
      )}

      {/* Tags Display */}
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
          ) : task.description ? (
             <div className="flex items-center gap-1 text-xs text-slate-400">
               <AlignLeft size={14} />
               <span>Chi tiết</span>
             </div>
          ) : null}
      </div>

      {/* Footer: Date & Assignee */}
      <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-1">
        <div className="flex items-center gap-1 text-xs text-slate-400">
           {(task.startDate || task.dueDate) && (
             <>
               <Calendar size={14} />
               <span className={task.dueDate && task.dueDate < Date.now() && task.status !== 'DONE' ? 'text-red-500 font-medium' : ''}>
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
  );
};

export default TaskCard;