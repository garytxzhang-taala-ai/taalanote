import React from 'react';
import { CheckCircle } from 'lucide-react';
import { PromptEvaluationResult } from '../services/api';

interface PromptEvaluationProps {
  data: PromptEvaluationResult | null;
}

export const PromptEvaluation: React.FC<PromptEvaluationProps> = ({ data }) => {
  if (!data) return (
     <div className="flex-1 bg-white border-r p-5 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
           <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm"><CheckCircle size={16} className="text-gray-300"/> Prompt 评价</h3>
        </div>
        <div className="text-xs text-gray-400">等待输入...</div>
     </div>
  );

  return (
    <div className="flex-1 bg-white border-r p-5 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
          <CheckCircle size={16} className={data.score >= 80 ? "text-green-500" : "text-yellow-500"}/> 
          Prompt 评价
        </h3>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
          data.score >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {data.score}分 - {data.score >= 80 ? '优秀' : '待改进'}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        <div className="text-xs text-gray-600 leading-relaxed">
          <p className="mb-2">{data.analysis}</p>
        </div>
        {data.suggestions.map((suggestion, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs space-y-2">
            <div>
              <span className="text-gray-500 font-medium">原描述：</span>
              <span className="text-gray-400 line-through">{suggestion.original}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">建议修改：</span>
              <span className="text-green-700 font-medium">{suggestion.improved}</span>
            </div>
            <div className="text-gray-400 text-[10px] mt-1">
              💡 {suggestion.reason}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
