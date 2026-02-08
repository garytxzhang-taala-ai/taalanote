import React, { useState, useEffect } from 'react';
import { Target, ChevronRight, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { EvaluationReport, Task } from '../../types';
import { generateEvaluationReport } from '../../services/evaluationService';
import { generateCapabilityTestTask, CapabilityTestTask } from '../../services/api';
import { EvaluationReportView } from '../EvaluationReportView';
import { ChatArea, Message } from '../ChatArea';
import { ImageGenerator } from '../ImageGenerator';
import { PreviewArea } from '../PreviewArea';

type TestPhase = 'setup' | 'testing' | 'report';

interface CapabilityTestLayoutProps {
  onReportGenerated?: (report: EvaluationReport) => void;
}

export const CapabilityTestLayout: React.FC<CapabilityTestLayoutProps> = ({ onReportGenerated }) => {
  const [phase, setPhase] = useState<TestPhase>('setup');
  const [messages, setMessages] = useState<Message[]>([]);
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [viewMode, setViewMode] = useState<'chat' | 'image-gen'>('chat');
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [importedContent, setImportedContent] = useState<string>('');
  
  // Task State
  const [currentTask, setCurrentTask] = useState<CapabilityTestTask | null>(null);
  const [isLoadingTask, setIsLoadingTask] = useState(true);

  // Derived Task object for PreviewArea
  const [previewTask, setPreviewTask] = useState<Task | null>(null);

  const fetchTask = async () => {
    setIsLoadingTask(true);
    const task = await generateCapabilityTestTask();
    setCurrentTask(task);
    
    setPreviewTask({
      id: 'test-task',
      title: task.title,
      status: 'draft',
      lastModified: new Date().toISOString(),
      topic: {
        title: task.title,
        hotness: 5,
        competition: 'medium',
        format: 'image_text',
        logic: {
          painPoint: task.value,
          solution: task.positioning,
          quantifier: task.goal
        }
      }
    });
    
    setIsLoadingTask(false);
  };

  useEffect(() => {
    fetchTask();
  }, []);

  const getInitialMessages = (): Message[] => {
    if (!currentTask) return [];
    return [{
      id: 'system-init',
      role: 'assistant',
      content: `你好！我是你的通用 AI 助手。
我们要完成的任务是：**${currentTask.title}**。
请告诉我你的想法，或者直接开始创作。在这个模式下，我不会主动引导你，一切由你主导。
你可以要求我生成文本或图片。`,
      type: 'text'
    }];
  };

  const handleStartTest = () => {
    setPhase('testing');
  };

  const handleMessagesChange = (newMessages: Message[]) => {
    setMessages(newMessages);
  };

  const handleAddToPreview = (imageUrl: string) => {
    setPreviewImages(prev => [...prev, imageUrl]);
    setViewMode('chat'); // Switch back to chat after adding image
  };

  const handleImportContent = (content: string) => {
    setImportedContent(content);
  };

  const handleSubmit = async () => {
    if (!currentTask) return;

    // Find last assistant message as potential content
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant' && typeof m.content === 'string');
    const content = lastAssistantMessage ? (lastAssistantMessage.content as string) : '';

    // Generate Report
    const result = await generateEvaluationReport(
        messages.map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : '' })), 
        currentTask,
        {
          title: previewTask?.title,
          content: content,
          image: previewImages[0] || null // Use first image for report
        }
    );
    setReport(result);
    setPhase('report');
    onReportGenerated?.(result);
  };

  if (phase === 'report' && report) {
    return (
      <EvaluationReportView 
        report={report} 
        onClose={() => {
          setPhase('setup');
          setReport(null);
          setMessages([]);
          setPreviewImages([]);
          setImportedContent('');
          fetchTask(); // Generate new task for next round
        }} 
      />
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 font-semibold text-gray-800">
             <Target className="text-taala-500" />
             <span>能力评测模式</span>
           </div>
           {phase === 'testing' && currentTask && (
             <>
               <div className="h-6 w-px bg-gray-200 mx-2"></div>
               <div className="flex items-center gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">当前任务</span>
                    <button 
                      onClick={() => setIsTaskDetailOpen(true)}
                      className="font-medium text-gray-900 hover:text-taala-600 transition text-left"
                    >
                      {currentTask.title}
                    </button>
                  </div>
               </div>
             </>
           )}
        </div>
        
        <div className="flex items-center gap-4">
          {phase === 'testing' && (
             <button 
               onClick={handleSubmit}
               disabled={messages.filter(m => m.role === 'user').length === 0}
               className="px-4 py-2 bg-taala-600 text-white rounded-lg text-sm font-medium hover:bg-taala-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               title={messages.filter(m => m.role === 'user').length === 0 ? "请先与 AI 互动" : "提交任务"}
             >
               <CheckCircle size={16} />
               提交任务
             </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex bg-gray-50">
        {phase === 'setup' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border p-8 space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">准备好接受挑战了吗？</h2>
                <p className="text-gray-500">
                  在本次测试中，你将与一个“通用 AI”合作完成任务。
                  系统不会提供任何引导、质量检测或专用工具。
                  我们将根据你的引导过程和最终结果，评估你的运营能力与 Prompt 技巧。
                </p>
              </div>

              {isLoadingTask ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-4">
                  <Loader2 className="animate-spin text-taala-500" size={32} />
                  <p>正在生成测试题目...</p>
                </div>
              ) : currentTask ? (
                <div className="bg-taala-50 rounded-xl p-6 space-y-4 border border-taala-100 relative group">
                  <button 
                    onClick={fetchTask}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-taala-600 transition opacity-0 group-hover:opacity-100"
                    title="换一题"
                  >
                    <RefreshCw size={16} />
                  </button>
                  
                  <h3 className="font-semibold text-taala-900 flex items-center gap-2">
                    <Target size={18} /> 本次任务目标
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <span className="text-taala-600 font-medium min-w-16">任务：</span>
                      <span className="text-gray-900">{currentTask.title}</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-taala-600 font-medium min-w-16">价值：</span>
                      <span className="text-gray-900">{currentTask.value}</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-taala-600 font-medium min-w-16">定位：</span>
                      <span className="text-gray-900">{currentTask.positioning}</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-taala-600 font-medium min-w-16">目标：</span>
                      <span className="text-gray-900">{currentTask.goal}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-500">任务加载失败，请重试</div>
              )}

              <div className="flex justify-center pt-4">
                <button 
                  onClick={handleStartTest}
                  disabled={isLoadingTask || !currentTask}
                  className="px-8 py-3 bg-taala-600 text-white rounded-xl font-medium hover:bg-taala-700 transition shadow-lg shadow-taala-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  开始测试
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === 'testing' && previewTask && (
          <div className="flex-1 flex h-full overflow-hidden">
             {/* Left Column: Chat or Image Gen */}
             <div className="flex-1 flex flex-col min-w-0 border-r bg-white relative">
                {viewMode === 'chat' ? (
                  <ChatArea 
                    key={currentTask?.title} // Force re-mount on new task
                    initialMessages={getInitialMessages()}
                    onSwitchToImageGen={() => setViewMode('image-gen')}
                    onMessagesChange={handleMessagesChange}
                    onAddToPreview={handleAddToPreview}
                    onImportContent={handleImportContent}
                    enableStreaming={true}
                  />
                ) : (
                  <ImageGenerator 
                    onBack={() => setViewMode('chat')}
                    onAddToPreview={handleAddToPreview}
                  />
                )}
             </div>

             {/* Right Column: Preview */}
             <div className="w-[360px] shrink-0 bg-gray-100 flex flex-col border-l overflow-hidden sticky top-0 h-full">
                <PreviewArea 
                  task={previewTask} 
                  images={previewImages}
                  isEmptyInitial={true}
                  externalContent={importedContent}
                  scale={0.85}
                />
             </div>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {isTaskDetailOpen && currentTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8 backdrop-blur-sm" onClick={() => setIsTaskDetailOpen(false)}>
           <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                <Target className="text-taala-500" size={20} />
                完整任务要求
              </h3>
              <div className="space-y-4 text-sm">
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="font-medium text-gray-900">{currentTask.title}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">核心价值</div>
                  <div className="text-gray-800">{currentTask.value}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">人设定位</div>
                  <div className="text-gray-800">{currentTask.positioning}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">核心目标</div>
                  <div className="text-gray-800">{currentTask.goal}</div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setIsTaskDetailOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                >
                  关闭
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
