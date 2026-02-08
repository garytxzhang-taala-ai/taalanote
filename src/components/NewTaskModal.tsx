import React, { useState, useEffect } from 'react';
import { X, Sparkles, TrendingUp, BarChart2, Video, FileText, Zap, CheckCircle, ExternalLink } from 'lucide-react';
import { Topic, Task } from '../types';
import { 
  mockHotspotTool, 
  mockAccountBindingTool, 
  generateTopics, 
  optimizeCustomTopic, 
  generateCrossProjectTopics,
  HotspotData,
  AccountData
} from '../services/mockTools';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: Task) => void;
  projectId: string;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'analyzing' | 'selection'>('analyzing');
  const [hotspots, setHotspots] = useState<HotspotData[]>([]);
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [generatedTopics, setGeneratedTopics] = useState<Topic[]>([]);
  const [crossTopics, setCrossTopics] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      startAnalysis();
    } else {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setStep('analyzing');
    setHotspots([]);
    setAccountData(null);
    setGeneratedTopics([]);
    setCrossTopics([]);
    setCustomInput('');
    setSelectedTopicIndex(null);
    setLogs([]);
  };

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const startAnalysis = async () => {
    setLoading(true);
    setStep('analyzing');
    setLogs([]);

    try {
      addLog("正在调用「小红书热点数据工具」...");
      const hotspotsData = await mockHotspotTool();
      setHotspots(hotspotsData);
      addLog("获取到近7天实时热点话题、关键词热度趋势");

      addLog("正在调用「小红书账号绑定API」...");
      const accData = await mockAccountBindingTool();
      setAccountData(accData);
      addLog("获取到账号高互动标签及偏好");

      addLog("正在生成爆款选题...");
      const topics = await generateTopics(hotspotsData, accData);
      setGeneratedTopics(topics);
      addLog("已生成5个爆款选题");

      addLog("正在分析跨项目联动机会...");
      const cross = await generateCrossProjectTopics();
      setCrossTopics(cross);
      
      setTimeout(() => {
        setStep('selection');
        setLoading(false);
      }, 800);

    } catch (error) {
      console.error(error);
      addLog("发生错误，请重试");
      setLoading(false);
    }
  };

  const handleCustomSubmit = async () => {
    if (!customInput.trim()) return;
    setLoading(true);
    try {
        const optimized = await optimizeCustomTopic(customInput);
        setGeneratedTopics(prev => [optimized, ...prev]); // Add to top
        setSelectedTopicIndex(0); // Select the new one
        setCustomInput('');
        setLoading(false);
    } catch (e) {
        setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedTopicIndex === null) return;
    const topic = generatedTopics[selectedTopicIndex];
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: topic.title,
      status: 'draft',
      lastModified: new Date().toISOString(),
      topic: topic
    };
    
    onCreate(newTask);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[900px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-taala-500" />
            <h2 className="font-semibold text-gray-800">新建爆款任务</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {step === 'analyzing' ? (
            <div className="flex flex-col items-center justify-center h-full py-20 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-taala-100 border-t-taala-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-taala-500" />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-lg font-medium text-gray-900">AI 正在深度分析市场数据...</h3>
                <div className="flex flex-col gap-1 text-sm text-gray-500 items-start bg-white p-4 rounded-lg shadow-sm w-80">
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column: Data & Input */}
              <div className="col-span-4 space-y-4">
                {/* Hotspots Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-3 text-taala-600">
                    <TrendingUp className="w-4 h-4" />
                    <h3 className="font-medium text-sm">近7天热点趋势</h3>
                  </div>
                  <div className="space-y-3">
                    {hotspots.map((h, i) => (
                      <div key={i} className="group">
                        <div className="text-sm font-medium text-gray-800 flex justify-between">
                          #{h.topic}
                          <span className="text-xs text-taala-400 bg-taala-50 px-1.5 py-0.5 rounded">HOT</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {h.keywords.map((k, j) => (
                            <span key={j} className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                              {k.word} <span className="text-green-600 scale-90">{k.increase}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account Card */}
                {accountData && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-3 text-purple-600">
                        <BarChart2 className="w-4 h-4" />
                        <h3 className="font-medium text-sm">账号高互动画像</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="text-xs text-gray-500">核心标签</div>
                        <div className="flex flex-wrap gap-1">
                            {accountData.topTags.map((t, i) => (
                                <span key={i} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">{t}</span>
                            ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">偏好形式</div>
                        <div className="text-sm text-gray-700">{accountData.preference}</div>
                    </div>
                    </div>
                )}

                 {/* Custom Input */}
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-medium text-sm mb-2 text-gray-800">自定义选题优化</h3>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="输入你的想法，如「口红推荐」" 
                            className="flex-1 text-sm border rounded-lg px-3 py-2 focus:ring-2 focus:ring-taala-100 focus:border-taala-400 outline-none"
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                        />
                        <button 
                            onClick={handleCustomSubmit}
                            disabled={loading}
                            className="bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                        >
                            <Sparkles className="w-4 h-4" />
                        </button>
                    </div>
                 </div>
              </div>

              {/* Right Column: Topics */}
              <div className="col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">推荐爆款选题 ({generatedTopics.length})</h3>
                    {crossTopics.length > 0 && (
                        <div className="text-xs text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded cursor-help" title={crossTopics.join('\n')}>
                            <ExternalLink className="w-3 h-3" />
                            已生成{crossTopics.length}个跨账号联动建议
                        </div>
                    )}
                </div>
                
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {generatedTopics.map((topic, index) => (
                        <div 
                            key={index}
                            onClick={() => setSelectedTopicIndex(index)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                                selectedTopicIndex === index 
                                ? 'border-taala-500 bg-taala-50/30 ring-1 ring-taala-500 shadow-md' 
                                : 'border-gray-200 bg-white hover:border-taala-200 hover:shadow-sm'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900 pr-8">{topic.title}</h4>
                                {selectedTopicIndex === index && (
                                    <div className="absolute top-4 right-4 text-taala-500">
                                        <CheckCircle className="w-5 h-5 fill-current text-white" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="text-xs flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded">
                                    热度 {'★'.repeat(topic.hotness)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                                    topic.competition === 'low' ? 'bg-green-50 text-green-600' :
                                    topic.competition === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                                    'bg-taala-50 text-taala-600'
                                }`}>
                                    竞争度: {topic.competition === 'low' ? '低' : topic.competition === 'medium' ? '中' : '高'}
                                </span>
                                <span className="text-xs flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded">
                                    {topic.format === 'video' ? <Video className="w-3 h-3"/> : <FileText className="w-3 h-3"/>}
                                    {topic.format === 'video' ? '视频' : '图文'}
                                </span>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 grid grid-cols-3 gap-2">
                                <div>
                                    <span className="font-semibold text-gray-800 block mb-1">🎯 痛点戳中</span>
                                    {topic.logic.painPoint}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-800 block mb-1">💡 解决方案</span>
                                    {topic.logic.solution}
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-800 block mb-1">📊 数字量化</span>
                                    {topic.logic.quantifier}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg"
            >
                取消
            </button>
            <button 
                disabled={selectedTopicIndex === null || step === 'analyzing'}
                onClick={handleConfirm}
                className="px-6 py-2 text-sm font-medium text-white bg-taala-600 hover:bg-taala-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
            >
                创建任务
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

// Helper for icon
function ChevronRight({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
    )
}
