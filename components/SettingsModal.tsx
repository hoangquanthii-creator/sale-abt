import React from 'react';
import { ZaloSettings } from '../types';
import { X, MessageCircle, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ZaloSettings;
  onSave: (settings: ZaloSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState<ZaloSettings>(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-blue-50">
          <div className="flex items-center gap-2 text-blue-700">
            <MessageCircle size={20} />
            <h2 className="text-lg font-bold">Cài đặt Thông báo Zalo</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
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
             <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Zalo OA ID (Tùy chọn)</label>
                    <input 
                        type="text" 
                        value={localSettings.oaId}
                        onChange={(e) => setLocalSettings({...localSettings, oaId: e.target.value})}
                        placeholder="Nhập ID Official Account..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">* Đây là bản mô phỏng. Tin nhắn sẽ hiển thị dạng thông báo trên trình duyệt.</p>
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={handleSave} 
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Save size={18} />
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;