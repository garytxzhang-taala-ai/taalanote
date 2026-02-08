import React from 'react';
import { X, Book, HelpCircle, Zap } from 'lucide-react';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-8 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-taala-100 rounded-lg text-taala-600">
               <Book size={24} />
             </div>
             <div>
               <h3 className="font-bold text-xl text-gray-900">帮助中心</h3>
               <p className="text-xs text-gray-500">快速了解 TaalaNote 并获取支持</p>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Tool Introduction */}
          <section>
             <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
               <Zap className="text-yellow-500" size={20} />
               工具介绍
             </h4>
             <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 text-gray-700 leading-relaxed space-y-3">
               <p>
                 <strong className="text-gray-900">TaalaNote</strong> 是一款专为小红书运营设计的一站式 AI 辅助工具。我们致力于通过人工智能技术，帮助内容创作者提升效率与质量。
               </p>
               <div className="grid grid-cols-2 gap-4 pt-2">
                 <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                   <div className="font-semibold text-gray-900 mb-1">📝 智能写作</div>
                   <div className="text-xs text-gray-500">基于专项训练的 AI，辅助生成标题、正文与脚本。</div>
                 </div>
                 <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                   <div className="font-semibold text-gray-900 mb-1">🎨 配图生成</div>
                   <div className="text-xs text-gray-500">一键生成符合小红书审美的封面与插图。</div>
                 </div>
                 <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                   <div className="font-semibold text-gray-900 mb-1">🎯 能力评测</div>
                   <div className="text-xs text-gray-500">模拟真实场景，评估并提升你的 Prompt 提示词技巧。</div>
                 </div>
                 <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                   <div className="font-semibold text-gray-900 mb-1">📊 内容审计</div>
                   <div className="text-xs text-gray-500">实时检测内容质量，提供 AI 含量、逻辑性等多维分析。</div>
                 </div>
               </div>
             </div>
          </section>

          {/* FAQ */}
          <section>
             <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
               <HelpCircle className="text-taala-500" size={20} />
               常见问题 (FAQ)
             </h4>
             <div className="space-y-4">
               {[
                 { q: "如何开始一个新的创作项目？", a: "在左侧侧边栏点击“新建项目”，输入项目名称即可创建一个新的工作区。在项目中你可以创建多个具体的任务。" },
                 { q: "能力评测模式有什么用？", a: "该模式用于训练你的 AI 协作能力。系统会随机生成一个任务，你需要引导 AI 完成它。最终系统会根据你的交互过程生成一份详细的能力评估报告。" },
                 { q: "生成的图片可以商用吗？", a: "本工具生成的图片仅供测试与个人使用，商业使用请遵循相关 AI 模型的开源协议或服务条款。" },
                 { q: "如何导出我的笔记？", a: "目前支持在预览区查看完整效果，你可以手动复制文本和保存图片。一键导出功能正在开发中。" }
               ].map((item, index) => (
                 <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                   <h5 className="font-medium text-gray-900 mb-2 flex items-start gap-2">
                     <span className="text-taala-500 font-bold">Q{index + 1}:</span>
                     {item.q}
                   </h5>
                   <p className="text-gray-600 text-sm pl-8 leading-relaxed">
                     {item.a}
                   </p>
                 </div>
               ))}
             </div>
          </section>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t text-center text-xs text-gray-400">
          © 2026 TaalaNote AI. All rights reserved. Version 1.2.0
        </div>
      </div>
    </div>
  );
};
