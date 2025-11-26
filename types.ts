export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  subtasks: Subtask[];
  createdAt: number;
  startDate?: number; // When the task starts
  dueDate?: number;   // When the task ends
  assignee?: string;  // Who is doing the task
  tags: string[];
  lastNotificationSent?: number; // Timestamp of the last notification
  notificationStatus?: 'NONE' | 'UPCOMING' | 'OVERDUE'; // Status of notification
}

export interface ProjectGoal {
  id: string;
  title: string;
  description: string;
  deadline: number;
  progress: number; // 0 to 100
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface ZaloSettings {
  enabled: boolean;
  oaId: string; // Zalo Official Account ID
  checkInterval: number; // In minutes
  notifyUpcoming: boolean; // Notify before due date
  notifyOverdue: boolean; // Notify when overdue
}

export type ViewMode = 'BOARD' | 'LIST' | 'DASHBOARD' | 'STRATEGY' | 'GOALS';