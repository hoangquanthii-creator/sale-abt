import { Task, TaskStatus, ZaloSettings, TeamMember } from "../types";

// Mock function to simulate sending a Zalo ZNS/Message
// In a real app, this would call your backend which holds the Zalo Secret Key
const callZaloApi = async (phone: string, message: string): Promise<boolean> => {
  console.log(`[ZALO API MOCK] Sending to ${phone}: ${message}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return true;
};

export const checkAndNotifyTasks = async (
  tasks: Task[], 
  members: TeamMember[],
  settings: ZaloSettings,
  onNotificationSent: (taskId: string, status: 'UPCOMING' | 'OVERDUE') => void
) => {
  if (!settings.enabled) return;

  const now = Date.now();
  const ONE_DAY_MS = 86400000;

  for (const task of tasks) {
    if (task.status === TaskStatus.DONE) continue;
    if (!task.dueDate) continue;
    if (!task.assignee) continue;

    const assigneeInfo = members.find(m => m.name === task.assignee);
    if (!assigneeInfo || !assigneeInfo.phone) continue;

    const timeDiff = task.dueDate - now;
    
    // Check Overdue
    if (timeDiff < 0 && settings.notifyOverdue) {
        // Only notify if we haven't notified for OVERDUE yet
        if (task.notificationStatus !== 'OVERDUE') {
            const message = `⚠️ CẢNH BÁO QUÁ HẠN: Công việc "${task.title}" đã quá hạn! Vui lòng cập nhật tiến độ ngay.`;
            const sent = await callZaloApi(assigneeInfo.phone, message);
            if (sent) {
                // Show a browser notification/toast for demo purposes
                alert(`[Zalo Giả Lập] Đã gửi tin nhắn đến ${task.assignee}:\n${message}`);
                onNotificationSent(task.id, 'OVERDUE');
            }
        }
    }
    // Check Upcoming (e.g., due within 24 hours)
    else if (timeDiff > 0 && timeDiff < ONE_DAY_MS && settings.notifyUpcoming) {
        // Only notify if we haven't notified for UPCOMING yet
        if (task.notificationStatus !== 'UPCOMING') {
            const message = `📅 NHẮC NHỞ: Công việc "${task.title}" sẽ đến hạn trong vòng 24h tới.`;
            const sent = await callZaloApi(assigneeInfo.phone, message);
            if (sent) {
                 // Show a browser notification/toast for demo purposes
                 // We use a less intrusive console log or custom UI event usually, but for demo:
                 console.log(`[Zalo Giả Lập] Đã gửi tin nhắn đến ${task.assignee}: ${message}`);
                 onNotificationSent(task.id, 'UPCOMING');
            }
        }
    }
  }
};