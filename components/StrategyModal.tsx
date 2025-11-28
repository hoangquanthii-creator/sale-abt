
import React, { useState, useEffect } from 'react';
import { Task, ProjectGoal } from '../types';
import { analyzeProjectStrategy } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { X, BrainCircuit, Loader2, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DEMO_OKRS } from '../constants';

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

const StrategyModal: React.FC<StrategyModalProps> = ({ isOpen, onClose, tasks }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedAnalysis = storageService.getLastStrategy();
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
      // Fetch current goals from local storage to ensure fresh data
      const savedGoals = localStorage.getItem('planai-goals');
      const currentGoals: ProjectGoal[] = savedGoals ? JSON.parse(savedGoals) : DEMO_OKRS;

      const result = await analyzeProjectStrategy(tasks, currentGoals);
      setAnalysis(result);
      storageService.saveStrategy(result);
    } catch (e) {
      setAnalysis("Lỗi khi chạy phân tích.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <BrainCircuit size={24} className="text-purple-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Phân tích Chiến lược & OKRs</h2>
              <p className="text-sm text-slate-400">Tư duy sâu (Thinking Mode) bởi Gemini 3 Pro</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
                <BrainCircuit size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Đang suy nghĩ...</h3>
                <p className="text-slate-500 max-w-md mt-2">Tôi đang rà soát sự liên kết giữa Công việc hàng ngày và Mục tiêu OKR, tìm điểm nghẽn và rủi ro.</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none">
               <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                  <ReactMarkdown 
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-slate-800 mt-6 mb-3 flex items-center gap-2" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 text-slate-700" {...props} />,
                      li: ({node, ...props}) => <li className="marker:text-purple-500" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-slate-900 bg-yellow-50 px-1 rounded" {...props} />,
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
                    <Lightbulb size={18} className="text-yellow-500" />
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

export default StrategyModal;
