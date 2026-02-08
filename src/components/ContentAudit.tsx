import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { ContentAuditResult } from '../services/api';

interface ContentAuditProps {
  data: ContentAuditResult | null;
}

export const ContentAudit: React.FC<ContentAuditProps> = ({ data }) => {
  if (!data) return (
     <div className="flex-1 bg-white p-5 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
           <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm"><AlertTriangle size={16} className="text-gray-300"/> 内容审计报告</h3>
        </div>
        <div className="text-xs text-gray-400">等待生成内容...</div>
     </div>
  );

  const hasRisks = data.risks.length > 0;

  return (
    <div className="flex-1 bg-white p-5 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
          {hasRisks ? <AlertTriangle size={16} className="text-yellow-500"/> : <CheckCircle size={16} className="text-green-500"/>}
          内容审计报告
        </h3>
        <span className="text-xs text-gray-400">AI 生成内容仅供参考</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
         {!hasRisks ? (
           <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
             <CheckCircle size={24} className="text-green-200" />
             <span className="text-xs">未发现明显风险</span>
           </div>
         ) : (
           data.risks.map((risk, index) => (
             <div key={index} className={`flex items-start gap-3 p-3 rounded-lg border ${
               risk.level === 'high' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'
             }`}>
               <AlertTriangle size={16} className={`shrink-0 mt-0.5 ${
                 risk.level === 'high' ? 'text-red-600' : 'text-yellow-600'
               }`} />
               <div className={`text-xs leading-relaxed ${
                 risk.level === 'high' ? 'text-red-800' : 'text-yellow-800'
               }`}>
                 <span className="font-bold block mb-0.5">{risk.type}</span>
                 {risk.description}
                 <div className="mt-1 font-medium bg-white/50 p-1 rounded">
                   建议：{risk.suggestion}
                 </div>
               </div>
             </div>
           ))
         )}
      </div>
    </div>
  );
};
