import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { EvaluationReport, ScoreItem } from '../types';

interface EvaluationReportViewProps {
  report: EvaluationReport;
  onClose?: () => void;
}

export const EvaluationReportView: React.FC<EvaluationReportViewProps> = ({ report, onClose }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8 h-full">
      <div className="max-w-4xl mx-auto space-y-6">
         {/* Header Score */}
         <div className="bg-white rounded-2xl p-8 shadow-sm border flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">能力评测报告</h2>
              <p className="text-gray-500 mt-1">生成时间: {report.date}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">综合评分</div>
              <div className="text-5xl font-bold text-taala-600">{report.aiCapability.overallScore}</div>
            </div>
         </div>

         {/* 3 Dimensions Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dimension 1: Content Quality */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border flex flex-col">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                 <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                 小红书内容评价
               </h3>
               <div className="flex items-center gap-4 mb-6">
                  <div className="text-3xl font-bold text-gray-900">{report.contentScore.total}</div>
                  <div className="text-sm text-gray-500">/ 100分</div>
               </div>
               
               <div className="space-y-4 mb-6 flex-1">
                 <ScoreCard 
                    label="AI 使用痕迹 (AI Trace)" 
                    data={report.contentScore.dimensions.aiTrace}
                    color="red"
                 />
                 <ScoreCard 
                    label="目标一致性 (Goal Alignment)" 
                    data={report.contentScore.dimensions.goalAlignment}
                    color="red"
                 />
                 <ScoreCard 
                    label="人设定位 (Positioning)" 
                    data={report.contentScore.dimensions.positioning}
                    color="red"
                 />
               </div>

               <div className="bg-gray-50 p-4 rounded-lg mt-auto">
                 <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">总体评价</h4>
                 <p className="text-gray-600 text-sm leading-relaxed">
                   {report.contentScore.analysis}
                 </p>
               </div>
            </div>

            {/* Dimension 3: Prompt Style */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border flex flex-col">
               <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                 <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                 Prompt 风格分析
               </h3>
               <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {report.promptStyle.type === 'comprehensive' ? '面面俱到型' : 
                     report.promptStyle.type === 'conversational' ? '多轮对话型' : '混合型'}
                  </span>
               </div>
               <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg mb-6 flex-1">
                 {report.promptStyle.analysis}
               </p>

               {report.promptStyle.evidence && (
                 <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                    <h4 className="text-xs font-semibold text-blue-800 mb-2 uppercase flex items-center gap-1">
                      <AlertCircle size={12} /> Evidence
                    </h4>
                    <ul className="space-y-1">
                      {report.promptStyle.evidence.map((e, i) => (
                        <li key={i} className="text-xs text-blue-700 flex items-start gap-2">
                          <span className="mt-1 w-1 h-1 bg-blue-400 rounded-full shrink-0"></span>
                          {e}
                        </li>
                      ))}
                    </ul>
                 </div>
               )}
            </div>
         </div>

         {/* Dimension 2: AI Core Capability (Detailed) */}
         <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
              AI 核心协作能力评价
            </h3>
            
            <div className="space-y-4">
              <ScoreCard 
                label="问题建模 (Problem Framing)" 
                data={report.aiCapability.problemFraming}
                color="purple"
              />
              <ScoreCard 
                label="任务拆解 (Task Decomposition)" 
                data={report.aiCapability.taskDecomposition}
                color="purple"
              />
              <ScoreCard 
                label="质量判断 (Quality Evaluation)" 
                data={report.aiCapability.qualityEvaluation}
                color="purple"
              />
              <ScoreCard 
                label="上下文控制 (Context Engineering)" 
                data={report.aiCapability.contextEngineering}
                color="purple"
              />
              <ScoreCard 
                label="人机边界 (Human-AI Boundary)" 
                data={report.aiCapability.humanAIBoundary}
                color="purple"
              />
              <ScoreCard 
                label="反思与迭代 (Reflection & Iteration)" 
                data={report.aiCapability.reflectionIteration}
                color="purple"
              />
            </div>

            <div className="mt-8 pt-6 border-t">
              <h4 className="font-semibold text-gray-900 mb-2">总结建议</h4>
              <p className="text-gray-600 text-sm">{report.aiCapability.summary}</p>
            </div>
         </div>

         {onClose && (
           <div className="flex justify-center pb-8">
             <button 
               onClick={onClose}
               className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
             >
               返回
             </button>
           </div>
         )}
      </div>
    </div>
  );
};

interface ScoreCardProps {
  label: string;
  data: ScoreItem;
  color: 'red' | 'purple' | 'blue';
}

const ScoreCard: React.FC<ScoreCardProps> = ({ label, data, color }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const colorClasses = {
    red: { bar: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50' },
    purple: { bar: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50' },
    blue: { bar: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' },
  };

  const theme = colorClasses[color];

  return (
    <div 
      className={`border rounded-xl transition-all duration-200 ${isExpanded ? 'bg-gray-50 border-gray-300 shadow-sm' : 'bg-white border-transparent hover:bg-gray-50'}`}
    >
      <div 
        className="p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
             <span className={`font-medium text-sm ${isExpanded ? 'text-gray-900' : 'text-gray-700'}`}>{label}</span>
             {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
          </div>
          <span className={`font-bold ${theme.text}`}>{data.score}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden">
          <div 
            className={`h-1.5 rounded-full transition-all duration-1000 ${theme.bar}`} 
            style={{ width: `${data.score}%` }}
          ></div>
        </div>
        
        {!isExpanded && (
          <p className="text-xs text-gray-500 line-clamp-1">{data.comment}</p>
        )}
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-0 animate-in slide-in-from-top-2 duration-200">
           <p className="text-sm text-gray-700 mb-3 bg-white p-2 rounded border border-gray-100">{data.comment}</p>
           
           {data.evidence && data.evidence.length > 0 && (
             <div className="bg-white/50 rounded-lg border border-gray-200/50 p-3">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                   <CheckCircle2 size={10} /> Evidence
                </h5>
                <ul className="space-y-1.5">
                  {data.evidence.map((item, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                       <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${theme.bar}`}></span>
                       {item}
                    </li>
                  ))}
                </ul>
             </div>
           )}
        </div>
      )}
    </div>
  );
};
