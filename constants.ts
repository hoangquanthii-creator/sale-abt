
import { TaskStatus, Priority, ProjectGoal, TeamMember } from './types';

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

export const DEPARTMENTS = [
    'Ban Giám Đốc',
    'Kinh Doanh',
    'Marketing',
    'Kỹ Thuật / IT',
    'Nhân Sự / Admin',
    'Kế Toán / Tài Chính'
];

// Default Members (Empty for real usage)
export const DEFAULT_MEMBERS: TeamMember[] = [];

export const MEMBER_COLORS = [
    'bg-red-100 text-red-600',
    'bg-orange-100 text-orange-600',
    'bg-amber-100 text-amber-600',
    'bg-green-100 text-green-600',
    'bg-emerald-100 text-emerald-600',
    'bg-teal-100 text-teal-600',
    'bg-cyan-100 text-cyan-600',
    'bg-blue-100 text-blue-600',
    'bg-indigo-100 text-indigo-600',
    'bg-violet-100 text-violet-600',
    'bg-purple-100 text-purple-600',
    'bg-fuchsia-100 text-fuchsia-600',
    'bg-pink-100 text-pink-600',
    'bg-rose-100 text-rose-600',
];

// Empty OKRs for real usage
export const DEMO_OKRS: ProjectGoal[] = [];

// Gemini Models Configuration
export const MODEL_FAST = 'gemini-2.0-flash-lite-preview-02-05';
export const MODEL_SMART = 'gemini-2.0-flash-thinking-exp-01-21';
export const MODEL_CHAT = 'gemini-2.0-flash';
export const MODEL_IMAGE = 'gemini-2.0-flash-exp';
export const MODEL_IMAGE_REQ = 'gemini-2.0-flash';
export const THINKING_BUDGET = 10240;
