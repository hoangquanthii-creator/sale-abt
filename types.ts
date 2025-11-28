
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

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  color: string;
  phone?: string; // For Zalo integration
  role?: string; // e.g., 'Admin', 'Member'
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
  assignee?: string;  // Who is doing the task (Name reference)
  meetingWith?: string; // Who to meet (Customer/Partner)
  outcome?: string;   // Result of the task
  quickNote?: string; // Short important note visible on card
  tags: string[];
  imageUrl?: string; // AI Generated Image URL
  lastNotificationSent?: number; // Timestamp of the last notification
  notificationStatus?: 'NONE' | 'UPCOMING' | 'OVERDUE'; // Status of notification
  
  // OKR Linking
  linkedKeyResultId?: string; // ID of the Key Result this task contributes to
  contributionValue?: number; // How much this task adds to the KR (e.g., 1, 100, 5000000)
}

export interface KeyResult {
  id: string;
  title: string; // e.g., "Đạt doanh thu 5 tỷ"
  currentValue: number; // e.g., 2.5
  targetValue: number; // e.g., 5.0
  unit: string; // e.g., "Tỷ VNĐ", "Người dùng", "%"
}

export interface ProjectGoal {
  id: string;
  title: string; // The Objective
  description: string;
  deadline: number;
  keyResults: KeyResult[]; // List of KRs/KPIs
  progress: number; // Calculated automatically (0-100)
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

// Structure for JSON Export/Import
export interface BackupData {
  version: number;
  timestamp: number;
  tasks: Task[];
  goals: ProjectGoal[];
  members: TeamMember[];
  settings: ZaloSettings;
  chatHistory?: ChatMessage[];
  lastStrategyAnalysis?: string;
  lastWorkflowAnalysis?: string;
}

export type ViewMode = 'BOARD' | 'LIST' | 'DASHBOARD' | 'STRATEGY' | 'GOALS' | 'TEAM_HUB';
