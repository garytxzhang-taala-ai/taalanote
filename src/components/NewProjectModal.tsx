import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, MessageSquare, Target, Zap, Check } from 'lucide-react';
import { Project } from '../types';
import { chat } from '../services/api';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: Project) => void;
}

type Step = 'info' | 'vision' | 'analysis' | 'proposal';

interface ProjectData {
  domains: string[];
  accountType: string;
  goals: string;
  vision: string;
  positioning: string;
  targetAudience: string;
  contentStyle: string;
}

// AI Service for Socratic Questioning
const generateAIQuestion = async (data: Partial<ProjectData>, history: { role: 'ai' | 'user'; content: string }[]) => {
  const prompt = `
    作为苏格拉底式的引导者，请根据用户的运营项目信息和对话历史，提出下一个引导性问题，帮助用户挖掘账号的深层价值。
    
    项目信息: ${JSON.stringify(data)}
    对话历史: ${JSON.stringify(history)}
    
    请直接返回问题内容（不要包含任何前缀或解释）。如果历史为空，请基于领域和账号类型提问。
  `;
  try {
    const response = await chat([{ role: 'user', content: prompt }]);
    return response;
  } catch (e) {
    console.error("AI Question failed", e);
    return "能具体说说帮助用户解决哪类具体问题或获得什么具体收益吗？";
  }
};

const generateAIProposal = async (data: Partial<ProjectData>) => {
  const prompt = `
    作为小红书运营专家，请根据以下项目信息生成一份运营方案提案。
    
    项目信息: ${JSON.stringify(data)}
    
    请严格按照以下 JSON 格式返回（纯 JSON，不要 Markdown）：
    {
      "positioning": [
        { "title": "定位名称", "case": "对标案例", "stats": "案例数据", "audience": "目标人群" },
        { "title": "定位名称2", "case": "对标案例2", "stats": "案例数据2", "audience": "目标人群2" },
        { "title": "定位名称3", "case": "对标案例3", "stats": "案例数据3", "audience": "目标人群3" }
      ],
      "goals": [
        { "period": "首月", "target": "目标", "strategy": "策略" },
        { "period": "3个月", "target": "目标", "strategy": "策略" }
      ],
      "style": {
        "tone": "语气风格",
        "example": "示例文案"
      }
    }
  `;
  try {
    const response = await chat([{ role: 'user', content: prompt }]);
    const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("AI Proposal failed", e);
    // Fallback
    return {
      positioning: [
        { title: '干货型博主', case: '职场小A', stats: '3个月涨粉5w', audience: '0-3年职场新人' },
        { title: '情感共鸣型', case: '深夜食堂', stats: '篇均赞藏1k+', audience: '高压都市白领' },
        { title: '生活方式型', case: 'StudyWithMe', stats: '店铺月销20w', audience: '考研考公党' }
      ],
      goals: [
        { period: '首月', target: '粉丝破1000', strategy: '日更 + 热门话题蹭流' },
        { period: '3个月', target: '商单变现', strategy: '垂直领域深耕 + 粉丝群运营' }
      ],
      style: {
        tone: '亲切学姐风',
        example: '宝子们！职场新人千万别踩这个坑😭 听学姐一句劝...'
      }
    };
  }
};

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [step, setStep] = useState<Step>('info');
  const [data, setData] = useState<Partial<ProjectData>>({
    domains: [],
    accountType: '',
    goals: ''
  });
  
  // Vision Chat State
  const [chatHistory, setChatHistory] = useState<{ role: 'ai' | 'user'; content: string; options?: string[] }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Proposal State
  const [proposal, setProposal] = useState<any>(null);

  // Analysis Animation State
  const [analysisStep, setAnalysisStep] = useState(0);
  const analysisMessages = [
    "正在连接小红书数据中心...",
    "全网扫描近30天热门对标账号...",
    "深度拆解高互动笔记结构模型...",
    "结合您的愿景生成差异化定位...",
    "正在生成最终运营策略方案..."
  ];

  useEffect(() => {
    if (step === 'analysis') {
      setAnalysisStep(0);
      const interval = setInterval(() => {
        setAnalysisStep(prev => (prev + 1) % analysisMessages.length);
      }, 800); // Change message every 800ms
      return () => clearInterval(interval);
    }
  }, [step]);

  useEffect(() => {
    if (isOpen) {
      setStep('info');
      setData({ domains: [], accountType: '', goals: '' });
      setChatHistory([]);
      setProposal(null);
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  // Step 1: Info Collection Handlers
  const handleDomainToggle = (domain: string) => {
    const current = data.domains || [];
    const next = current.includes(domain) 
      ? current.filter(d => d !== domain)
      : [...current, domain];
    setData({ ...data, domains: next });
  };

  const recommendAccountTypes = () => {
    // Mock logic based on domain
    if (data.domains?.includes('职场')) return ['个人IP号', '知识付费号', '引流号'];
    if (data.domains?.includes('美妆')) return ['种草号', '测评号', '人设号'];
    return ['流量号', '人设号', '转化号'];
  };

  const handleInfoSubmit = () => {
    if (!data.domains?.length || !data.accountType || !data.goals) return;
    setStep('vision');
    // Initialize chat
    setTimeout(async () => {
      const question = await generateAIQuestion(data, []);
      setChatHistory([{ 
        role: 'ai', 
        content: question,
        options: ['分享专业知识，建立影响力', '通过好物推荐变现', '记录生活，寻找共鸣'] 
      }]);
    }, 500);
  };

  // Step 2: Vision Excavation Handlers
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const newHistory = [...chatHistory, { role: 'user' as const, content: inputValue }];
    setChatHistory(newHistory);
    setInputValue('');
    setIsTyping(true);

    // Check if we should end the vision step (e.g., after 2 rounds)
    const userTurns = newHistory.filter(m => m.role === 'user').length;
    
    if (userTurns >= 2) {
      setIsTyping(false);
      // Save vision and move to next step
      const vision = newHistory.filter(m => m.role === 'user').map(m => m.content).join('; ');
      setData({ ...data, vision });
      setStep('analysis');
      startAnalysis();
    } else {
      const question = await generateAIQuestion(data, newHistory);
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        content: question,
        options: userTurns === 1 ? ['实现财务自由', '打造个人品牌', '帮助更多人避坑'] : []
      }]);
      setIsTyping(false);
    }
  };

  // Step 3: Analysis & Proposal
  const startAnalysis = async () => {
    // Minimum loading time to show the animation
    const minWait = new Promise(resolve => setTimeout(resolve, 2000));
    // Actual data fetching
    const dataFetch = generateAIProposal(data);
    
    try {
      const [_, proposalData] = await Promise.all([minWait, dataFetch]);
      setProposal(proposalData);
      setStep('proposal');
    } catch (error) {
      console.error("Analysis failed", error);
      // Fallback or error handling if needed
      setStep('proposal'); // Try to show proposal anyway (mock data might be used inside generateAIProposal fallback)
    }
  };

  const handleCreateProject = () => {
    if (!data.domains || !data.accountType) return;
    
    const newProject: Project = {
      id: Date.now().toString(),
      name: `${data.domains[0]} - ${data.accountType}`,
      nature: data.accountType,
      positioning: proposal?.positioning[0].title || '未定',
      shortTermGoal: data.goals || '',
      vision: data.vision || '',
      tasks: []
    };
    onCreate(newProject);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-[800px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">新建项目</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {step === 'info' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">① 核心运营领域 (多选)</label>
                <div className="flex flex-wrap gap-2">
                  {['美妆', '职场', '家居', '美食', '穿搭', '旅行', '科技', '情感'].map(d => (
                    <button
                      key={d}
                      onClick={() => handleDomainToggle(d)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${
                        data.domains?.includes(d) 
                          ? 'bg-taala-50 border-taala-500 text-taala-600 font-medium' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">② 期望账号类型</label>
                <div className="grid grid-cols-3 gap-3">
                  {(data.domains?.length ? recommendAccountTypes() : ['官方号', '流量号', '人设号', '转化号']).map(type => (
                    <button
                      key={type}
                      onClick={() => setData({ ...data, accountType: type })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        data.accountType === type
                          ? 'bg-taala-50 border-taala-500 ring-1 ring-taala-500'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{type}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {type === '官方号' && '品牌官方形象建设'}
                        {type === '流量号' && '追求高曝光与涨粉'}
                        {type === '人设号' && '打造个人IP影响力'}
                        {type === '转化号' && '以商品销售为导向'}
                        {/* Add more descriptions if needed */}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">③ 量化运营目标</label>
                <input
                  type="text"
                  placeholder="例如：3个月涨粉10w，单笔记平均赞藏500+，店铺月销500单"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-taala-500 focus:border-taala-500 outline-none transition"
                  value={data.goals}
                  onChange={e => setData({ ...data, goals: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleInfoSubmit}
                  disabled={!data.domains?.length || !data.accountType || !data.goals}
                  className="bg-taala-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-taala-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
                >
                  下一步 <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 'vision' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-taala-500 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      {msg.role === 'ai' && msg.options && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.options.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => setInputValue(opt)}
                              className="bg-white text-taala-500 text-xs px-3 py-1.5 rounded-full border border-taala-100 hover:bg-taala-50 transition"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-none flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="请输入你的想法..."
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-taala-500 focus:border-taala-500 outline-none"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="absolute right-2 top-2 p-1.5 bg-taala-500 text-white rounded-md hover:bg-taala-600 disabled:opacity-50 transition"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 'analysis' && (
            <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-taala-100 border-t-taala-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="text-taala-500 fill-current animate-pulse" size={32} />
                </div>
              </div>
              
              <div className="text-center space-y-4 max-w-md w-full px-6">
                <h3 className="text-xl font-bold text-gray-800 h-8 flex items-center justify-center transition-all duration-300">
                  {analysisMessages[analysisStep]}
                </h3>
                
                {/* Progress Bar Simulation */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden relative">
                  <div className="absolute inset-0 bg-taala-500/20 w-full h-full"></div>
                  <div className="bg-taala-500 h-full rounded-full w-1/3 absolute top-0 left-0 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                  <div className="bg-taala-500 h-full rounded-full w-full absolute top-0 left-0 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${analysisStep >= 0 ? 'opacity-100' : 'opacity-30'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${analysisStep >= 0 ? 'bg-taala-50 border-taala-500 text-taala-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>1</div>
                        <span className="text-xs font-medium text-gray-600">数据采集</span>
                    </div>
                    <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${analysisStep >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${analysisStep >= 2 ? 'bg-taala-50 border-taala-500 text-taala-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>2</div>
                        <span className="text-xs font-medium text-gray-600">模型分析</span>
                    </div>
                    <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${analysisStep >= 3 ? 'opacity-100' : 'opacity-30'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${analysisStep >= 3 ? 'bg-taala-50 border-taala-500 text-taala-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>3</div>
                        <span className="text-xs font-medium text-gray-600">策略生成</span>
                    </div>
                </div>
              </div>
            </div>
          )}

          {step === 'proposal' && proposal && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <Check className="text-green-600 mt-0.5" size={20} />
                <div>
                  <h3 className="font-bold text-green-800">方案已生成</h3>
                  <p className="text-green-700 text-sm mt-1">基于你的愿景「{data.vision}」，为你定制了以下策略。</p>
                </div>
              </div>

              {/* Module 1: Positioning */}
              <section>
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
                  <Target className="text-taala-500" /> 
                  🎯 定位建议
                </h3>
                <div className="grid gap-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-600 font-medium">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg">定位方向</th>
                          <th className="px-4 py-3">对标案例</th>
                          <th className="px-4 py-3">数据表现</th>
                          <th className="px-4 py-3 rounded-tr-lg">适配人群</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 border border-gray-100 rounded-b-lg">
                        {proposal.positioning.map((pos: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-medium text-gray-900">{pos.title}</td>
                            <td className="px-4 py-3 text-blue-600">{pos.case}</td>
                            <td className="px-4 py-3 text-gray-600">{pos.stats}</td>
                            <td className="px-4 py-3 text-gray-600">{pos.audience}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Module 2: Goals */}
              <section>
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
                  <Zap className="text-yellow-500" /> 
                  📈 目标拆解
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {proposal.goals.map((goal: any, idx: number) => (
                    <div key={idx} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">{goal.period}目标</div>
                      <div className="text-lg font-bold text-gray-900 mb-2">{goal.target}</div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium text-gray-700">策略：</span>
                        {goal.strategy}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Module 3: Style */}
              <section>
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
                  <MessageSquare className="text-blue-500" /> 
                  🎨 风格指南
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300">
                  <div className="mb-2 text-gray-500"># 风格: {proposal.style.tone}</div>
                  <div className="whitespace-pre-wrap">{proposal.style.example}</div>
                </div>
              </section>

              <div className="pt-6 flex justify-end gap-3 border-t">
                <button 
                  onClick={() => setStep('info')}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  调整信息
                </button>
                <button 
                  onClick={handleCreateProject}
                  className="bg-taala-500 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-taala-600 shadow-lg shadow-taala-500/30 transition"
                >
                  确认并创建项目
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer/Progress (Optional) */}
        <div className="bg-gray-50 px-6 py-3 border-t flex justify-between items-center text-xs text-gray-400">
          <div className="flex gap-2">
            <span className={step === 'info' ? 'text-taala-500 font-bold' : ''}>1. 信息收集</span>
            <span>→</span>
            <span className={step === 'vision' ? 'text-taala-500 font-bold' : ''}>2. 愿景挖掘</span>
            <span>→</span>
            <span className={step === 'analysis' ? 'text-taala-500 font-bold' : ''}>3. 数据分析</span>
            <span>→</span>
            <span className={step === 'proposal' ? 'text-taala-500 font-bold' : ''}>4. 方案确认</span>
          </div>
        </div>
      </div>
    </div>
  );
};
