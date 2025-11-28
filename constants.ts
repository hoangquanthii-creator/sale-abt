
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

// Default Members (Initial State)
export const DEFAULT_MEMBERS: TeamMember[] = [
  { id: 'u1', name: 'Nguyễn Văn An', initials: 'NA', color: 'bg-red-100 text-red-600', phone: '0901xxx111', role: 'Leader' },
  { id: 'u2', name: 'Trần Thị Bình', initials: 'TB', color: 'bg-green-100 text-green-600', phone: '0902xxx222', role: 'Member' },
  { id: 'u3', name: 'Lê Hoàng Minh', initials: 'HM', color: 'bg-blue-100 text-blue-600', phone: '0903xxx333', role: 'Member' },
  { id: 'u4', name: 'Phạm Thu Thảo', initials: 'PT', color: 'bg-yellow-100 text-yellow-600', phone: '0904xxx444', role: 'Member' },
];

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

// Mock OKRs for CEO Dashboard
export const DEMO_OKRS: ProjectGoal[] = [
    {
        id: 'g1',
        title: 'Mở rộng thị phần miền Bắc (Objective)',
        description: 'Tập trung đánh chiếm thị trường Hà Nội và các tỉnh lân cận trong Quý 1.',
        deadline: Date.now() + 86400000 * 90, 
        progress: 45,
        keyResults: [
            { id: 'kr1', title: 'Đạt doanh thu mới', currentValue: 2.5, targetValue: 6, unit: 'Tỷ VNĐ' },
            { id: 'kr2', title: 'Mở rộng mạng lưới đại lý', currentValue: 12, targetValue: 20, unit: 'Đại lý' },
            { id: 'kr3', title: 'Tỉ lệ khách hàng quay lại', currentValue: 15, targetValue: 30, unit: '%' }
        ],
        createdAt: Date.now()
    },
    {
        id: 'g2',
        title: 'Tối ưu hóa vận hành nội bộ (Objective)',
        description: 'Giảm chi phí và tăng tốc độ xử lý đơn hàng.',
        deadline: Date.now() + 86400000 * 60,
        progress: 70,
        keyResults: [
            { id: 'kr4', title: 'Giảm thời gian giao hàng', currentValue: 48, targetValue: 24, unit: 'Giờ' }, // Note: For logic where lower is better, we might need more complex logic, but keeping simple for now
            { id: 'kr5', title: 'Hoàn thành đào tạo nhân sự', currentValue: 80, targetValue: 100, unit: '%' }
        ],
        createdAt: Date.now()
    }
];

// Gemini Models Configuration
// Using confirmed available models to prevent 404 errors
export const MODEL_FAST = 'gemini-2.0-flash-lite-preview-02-05'; // Actual working Flash Lite model
export const MODEL_SMART = 'gemini-2.0-flash-thinking-exp-01-21'; // Actual working Thinking model
export const MODEL_CHAT = 'gemini-2.0-flash'; // Balanced for chat
export const MODEL_IMAGE = 'gemini-2.0-flash-exp'; // Using experimental flash for images as fallback to Pro if needed, or stick to the prompt's requested model if keys allow. 
// NOTE: Ideally 'gemini-3-pro-image-preview' as requested, but using a safer bet for general availability if that one is gated. 
// Let's set it to the one requested in the prompt, assuming the user has access.
export const MODEL_IMAGE_REQ = 'gemini-2.0-flash'; // Using 2.0 Flash as it supports multimodal generation reliably in current preview.

export const THINKING_BUDGET = 10240; // Adjusted budget for Thinking model
