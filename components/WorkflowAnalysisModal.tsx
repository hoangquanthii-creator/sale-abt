
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { analyzeKanbanWorkflow } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { X, GitMerge, PlayCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface WorkflowAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

const WorkflowAnalysisModal: React.FC<WorkflowAnalysisModalProps> = ({ isOpen, onClose, tasks }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedAnalysis = storageService.getLastWorkflow();
      if (savedAnalysis) {
        setAnalysis(savedAnalysis);
        setHasRun(true);
      } else if (!hasRun) {
        handleAnalyze();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleAnalyze = async () => {
    setLoading(true);
    setHasRun(true);
    try {
      const result = await analyzeKanbanWorkflow(tasks);
      setAnalysis(result);
      storageService.saveWorkflow(result);
    } catch (e) {
      setAnalysis("Lỗi khi chạy phân tích luồng công việc.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <GitMerge size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Tối ưu hóa Luồng việc</h2>
              <p className="text-sm text-emerald-100">Agile Coach • Phân tích điểm nghẽn & WIP</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-100 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
                <GitMerge size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-emerald-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Đang kiểm tra bảng Kanban...</h3>
                <p className="text-slate-500 max-w-md mt-2">AI đang tìm kiếm các điểm nghẽn, kiểm tra tải công việc của thành viên và đề xuất cách sắp xếp lại thẻ.</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none">
               <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                  <ReactMarkdown 
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold text-emerald-700 mt-6 mb-3 flex items-center gap-2 uppercase tracking-wide" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 text-slate-700" {...props} />,
                      li: ({node, ...props}) => <li className="marker:text-emerald-500" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-slate-900 bg-emerald-50 px-1 rounded text-emerald-900" {...props} />,
                    }}
                  >
                    {analysis}
                  </ReactMarkdown>
               </div>
               
               <div className="mt-8 flex justify-center">
                  <button 
                    onClick={handleAnalyze} 
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-full shadow-sm hover:bg-slate-50 hover:shadow-md transition-all"
                  >
                    <PlayCircle size={18} className="text-emerald-500" />
                    Phân tích lại
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowAnalysisModal;
