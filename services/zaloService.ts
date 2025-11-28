
import { api } from "./api";
import { Task } from "../types";

/**
 * Trigger the backend to run the notification check.
 * Returns the updated tasks if any changes occurred, and a list of sent notifications for UI display.
 */
export const checkAndNotifyTasks = async (
  // Arguments are no longer used for logic, as data is on "backend"
  // But kept for signature compatibility if needed, or removed.
  // We'll remove them to encourage using the API correctly.
  onNotificationSent: (taskId: string, status: 'UPCOMING' | 'OVERDUE') => void
): Promise<Task[] | null> => {
  
  const result = await api.zalo.checkAndNotify();
  
  if (result.notifications.length > 0) {
    // Show summary alert in UI
    console.log("Notifications Sent:", result.notifications);
    // You could replace this with a nice Toast notification
    if (result.notifications.length < 3) {
        alert(result.notifications.join('\n'));
    } else {
        alert(`Đã gửi ${result.notifications.length} thông báo Zalo nhắc việc.`);
    }
    
    return result.updatedTasks;
  }

  return null;
};
