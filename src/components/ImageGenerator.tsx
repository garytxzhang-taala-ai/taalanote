import React, { useState } from 'react';
import { ArrowLeft, Image as ImageIcon, Loader2, Download, Plus, AlertCircle } from 'lucide-react';
import { generateImage } from '../services/api';

interface ImageGeneratorProps {
  onBack: () => void;
  onAddToPreview: (imageUrl: string) => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onBack, onAddToPreview }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('3:4');
  const [stylePreset, setStylePreset] = useState('实拍质感');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // 组合 Prompt：描述 + 比例 + 风格
      const finalPrompt = `${prompt}, 风格: ${stylePreset}, 比例: ${aspectRatio}`;
      console.log('Generating with prompt:', finalPrompt);
      
      const imageUrl = await generateImage(finalPrompt);
      setGeneratedImage(imageUrl);
    } catch (err) {
      setError('生成失败，请重试');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col min-w-0 h-full">
      {/* Header */}
      <div className="h-14 border-b flex items-center px-6 justify-between bg-white shrink-0">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition text-gray-600">
               <ArrowLeft size={20} />
            </button>
            <div className="font-semibold text-gray-900 flex items-center gap-2">
               <div className="bg-purple-100 p-1.5 rounded-lg text-purple-600">
                 <ImageIcon size={16} />
               </div>
               AI 配图工作室
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Left Panel - Controls */}
        <div className="w-full md:w-80 bg-white border-r p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">画面描述</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none text-sm resize-none"
                placeholder="描述你想要的画面，例如：夏日海边，清透感，护肤品摆拍，高调摄影..."
              />
              {error && (
                <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {error}
                </div>
              )}
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">图片比例</label>
              <div className="grid grid-cols-3 gap-2">
                 {['3:4', '1:1', '16:9'].map((ratio) => (
                   <button 
                     key={ratio}
                     onClick={() => setAspectRatio(ratio)}
                     className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                       aspectRatio === ratio 
                         ? 'border-purple-500 bg-purple-50 text-purple-700' 
                         : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                     }`}
                   >
                     {ratio} {ratio === '3:4' && '(小红书)'}
                   </button>
                 ))}
              </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">风格预设</label>
              <div className="grid grid-cols-2 gap-2">
                 <div 
                   onClick={() => setStylePreset('实拍质感')}
                   className={`border p-3 rounded-lg cursor-pointer transition-all ${
                     stylePreset === '实拍质感' 
                       ? 'border-purple-500 bg-purple-50' 
                       : 'border-gray-200 hover:bg-gray-50'
                   }`}
                 >
                    <div className={`text-xs font-bold ${stylePreset === '实拍质感' ? 'text-purple-900' : 'text-gray-700'}`}>实拍质感</div>
                    <div className={`text-[10px] mt-0.5 ${stylePreset === '实拍质感' ? 'text-purple-600' : 'text-gray-500'}`}>真实摄影效果</div>
                 </div>
                 <div 
                   onClick={() => setStylePreset('插画风格')}
                   className={`border p-3 rounded-lg cursor-pointer transition-all ${
                     stylePreset === '插画风格' 
                       ? 'border-purple-500 bg-purple-50' 
                       : 'border-gray-200 hover:bg-gray-50'
                   }`}
                 >
                    <div className={`text-xs font-bold ${stylePreset === '插画风格' ? 'text-purple-900' : 'text-gray-700'}`}>插画风格</div>
                    <div className={`text-[10px] mt-0.5 ${stylePreset === '插画风格' ? 'text-purple-600' : 'text-gray-500'}`}>扁平/手绘</div>
                 </div>
              </div>
           </div>

           <div className="mt-auto pt-6">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center gap-2 transition shadow-lg shadow-purple-200"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                {isGenerating ? '生成中...' : '立即生成'}
              </button>
           </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-gray-50 p-8 flex items-center justify-center relative overflow-hidden">
           {/* Background Pattern */}
           <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#6b7280 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

           {generatedImage ? (
             <div className="relative group max-h-full max-w-full shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <img src={generatedImage} alt="Generated" className="max-h-[600px] object-contain bg-white" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                   <button 
                     onClick={() => onAddToPreview(generatedImage)}
                     className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:scale-105 transition transform"
                   >
                     <Plus size={16} />
                     应用到笔记
                   </button>
                   <button className="bg-white/20 text-white px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-white/30 transition backdrop-blur-md">
                     <Download size={16} />
                     下载
                   </button>
                </div>
             </div>
           ) : (
             <div className="text-center text-gray-400 max-w-sm">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                   <ImageIcon size={40} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">等待生成灵感</h3>
                <p className="text-sm">在左侧输入描述词，AI 将为您生成专属的小红书笔记配图</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
