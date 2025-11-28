
import React, { useState, useRef } from 'react';
import { ZaloSettings, TeamMember } from '../types';
import { MEMBER_COLORS } from '../constants';
import { storageService } from '../services/storageService';
import { X, MessageCircle, Save, Users, Database, Upload, Download, Trash2, Plus, RefreshCw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ZaloSettings;
  onSaveSettings: (settings: ZaloSettings) => void;
  members: TeamMember[];
  onSaveMembers: (members: TeamMember[]) => void;
  onDataImported: () => void;
  initialTab?: 'zalo' | 'team' | 'data'; // New prop
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, settings, onSaveSettings, members, onSaveMembers, onDataImported, initialTab = 'zalo'
}) => {
  const [activeTab, setActiveTab] = useState<'zalo' | 'team' | 'data'>('zalo');
  
  // Local states
  const [localSettings, setLocalSettings] = useState<ZaloSettings>(settings);
  const [localMembers, setLocalMembers] = useState<TeamMember[]>(members);
  
  // New Member Input
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setLocalSettings(settings);
    setLocalMembers(members);
  }, [settings, members, isOpen]);

  // Sync active tab with initialTab prop when modal opens
  React.useEffect(() => {
    if (isOpen) {
        setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleSaveAll = () => {
    onSaveSettings(localSettings);
    onSaveMembers(localMembers);
    onClose();
  };

  // Team Management
  const addMember = () => {
      if (!newMemberName.trim()) return;
      const initials = newMemberName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const randomColor = MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)];
      
      const newMember: TeamMember = {
          id: crypto.randomUUID(),
          name: newMemberName,
          phone: newMemberPhone,
          initials: initials,
          color: randomColor,
          role: 'Member'
      };
      setLocalMembers([...localMembers, newMember]);
      setNewMemberName('');
      setNewMemberPhone('');
  };

  const removeMember = (id: string) => {
      if (confirm('Xóa thành viên này sẽ không xóa các công việc cũ của họ, nhưng họ sẽ không xuất hiện trong danh sách giao việc. Tiếp tục?')) {
          setLocalMembers(localMembers.filter(m => m.id !== id));
      }
  };

  // Data Management
  const handleExport = () => {
      const dataStr = storageService.exportData();
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `planai_backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const json = event.target?.result as string;
          if (storageService.importData(json)) {
              alert('Khôi phục dữ liệu thành công! Ứng dụng sẽ tải lại.');
              onDataImported();
              onClose();
          } else {
              alert('File không hợp lệ hoặc bị lỗi.');
          }
      };
      reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800">Cấu hình Hệ thống</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
            <button 
                onClick={() => setActiveTab('zalo')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2 ${activeTab === 'zalo' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <MessageCircle size={16} />
                Thông báo Zalo
            </button>
            <button 
                onClick={() => setActiveTab('team')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2 ${activeTab === 'team' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <Users size={16} />
                Đội ngũ
            </button>
            <button 
                onClick={() => setActiveTab('data')}
                className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 flex items-center justify-center gap-2 ${activeTab === 'data' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <Database size={16} />
                Dữ liệu
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
            
            {/* TAB ZALO */}
            {activeTab === 'zalo' && (
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-slate-800">Tự động gửi thông báo</h3>
                            <p className="text-xs text-slate-500">Hệ thống sẽ quét và gửi tin nhắn nhắc việc</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={localSettings.enabled}
                            onChange={(e) => setLocalSettings({...localSettings, enabled: e.target.checked})}
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {localSettings.enabled && (
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Zalo OA ID</label>
                                <input 
                                    type="text" 
                                    value={localSettings.oaId}
                                    onChange={(e) => setLocalSettings({...localSettings, oaId: e.target.value})}
                                    placeholder="Nhập ID Official Account..."
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={localSettings.notifyUpcoming}
                                        onChange={(e) => setLocalSettings({...localSettings, notifyUpcoming: e.target.checked})}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700">Nhắc nhở sắp đến hạn (trước 24h)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={localSettings.notifyOverdue}
                                        onChange={(e) => setLocalSettings({...localSettings, notifyOverdue: e.target.checked})}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700">Cảnh báo khi quá hạn</span>
                                </label>
                            </div>
                        </div>
                    )}
                 </div>
            )}

            {/* TAB TEAM */}
            {activeTab === 'team' && (
                <div className="space-y-6">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            placeholder="Tên thành viên mới..."
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                        />
                        <input 
                            type="text" 
                            value={newMemberPhone}
                            onChange={(e) => setNewMemberPhone(e.target.value)}
                            placeholder="SĐT/Zalo..."
                            className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                        />
                        <button onClick={addMember} disabled={!newMemberName} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {localMembers.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${member.color}`}>
                                        {member.initials}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800 text-sm">{member.name}</p>
                                        <p className="text-xs text-slate-500">{member.phone || 'Chưa có SĐT'}</p>
                                    </div>
                                </div>
                                <button onClick={() => removeMember(member.id)} className="text-slate-400 hover:text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB DATA */}
            {activeTab === 'data' && (
                <div className="space-y-6">
                     <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                        <Database className="text-blue-500 mt-1" size={20} />
                        <div>
                            <h3 className="font-semibold text-blue-900">Sao lưu & Đóng gói</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Xuất toàn bộ dữ liệu (công việc, mục tiêu, cấu hình team) ra file JSON. 
                                Bạn có thể dùng file này để chuyển dữ liệu sang máy khác hoặc khôi phục khi cần.
                            </p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={handleExport}
                            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                            <Download size={32} className="text-slate-400 group-hover:text-blue-600" />
                            <span className="font-semibold text-slate-700 group-hover:text-blue-700">Xuất dữ liệu (Backup)</span>
                        </button>

                        <button 
                            onClick={handleImportClick}
                            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                        >
                            <Upload size={32} className="text-slate-400 group-hover:text-emerald-600" />
                            <span className="font-semibold text-slate-700 group-hover:text-emerald-700">Nhập dữ liệu (Restore)</span>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".json" 
                                onChange={handleFileChange}
                            />
                        </button>
                     </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
             onClick={handleSaveAll}
             className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Save size={18} />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
