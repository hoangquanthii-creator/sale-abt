import { TaskStatus, Priority } from './types';

export const COLUMNS = [
  { id: TaskStatus.TODO, title: 'Cần làm', color: 'bg-slate-100 border-slate-200' },
  { id: TaskStatus.IN_PROGRESS, title: 'Đang thực hiện', color: 'bg-blue-50 border-blue-200' },
  { id: TaskStatus.REVIEW, title: 'Phê duyệt', color: 'bg-purple-50 border-purple-200' },
  { id: TaskStatus.DONE, title: 'Hoàn thành', color: 'bg-green-50 border-green-200' },
];

export const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.LOW]: 'bg-slate-200 text-slate-700',
  [Priority.MEDIUM]: 'bg-blue-200 text-blue-800',
  [Priority.HIGH]: 'bg-orange-200 text-orange-800',
  [Priority.URGENT]: 'bg-red-200 text-red-800',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.LOW]: 'Thấp',
  [Priority.MEDIUM]: 'Vừa',
  [Priority.HIGH]: 'Cao',
  [Priority.URGENT]: 'Khẩn cấp',
};

// Tag Colors Palette
export const TAG_COLORS = [
  'bg-red-100 text-red-700 border-red-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-yellow-100 text-yellow-700 border-yellow-200',
  'bg-lime-100 text-lime-700 border-lime-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
  'bg-sky-100 text-sky-700 border-sky-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-violet-100 text-violet-700 border-violet-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-rose-100 text-rose-700 border-rose-200',
];

// Mock Users for Assignment - Vietnamese Names with Mock Zalo Info
export const TEAM_MEMBERS = [
  { id: 'u1', name: 'Nguyễn Văn An', initials: 'NA', color: 'bg-red-100 text-red-600', phone: '0901xxx111' },
  { id: 'u2', name: 'Trần Thị Bình', initials: 'TB', color: 'bg-green-100 text-green-600', phone: '0902xxx222' },
  { id: 'u3', name: 'Lê Hoàng Minh', initials: 'HM', color: 'bg-blue-100 text-blue-600', phone: '0903xxx333' },
  { id: 'u4', name: 'Phạm Thu Thảo', initials: 'PT', color: 'bg-yellow-100 text-yellow-600', phone: '0904xxx444' },
];

// Gemini Models Configuration
export const MODEL_FAST = 'gemini-2.5-flash-lite-latest'; // High speed, low latency
export const MODEL_SMART = 'gemini-3-pro-preview'; // High intelligence
export const MODEL_CHAT = 'gemini-3-pro-preview'; // Balanced for chat

export const THINKING_BUDGET = 32768; // Max for Gemini 3 Pro