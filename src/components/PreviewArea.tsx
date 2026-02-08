import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Heart, MessageCircle, Star, GraduationCap } from 'lucide-react';
import { Task } from '../types';

interface PreviewAreaProps {
  task?: Task | null;
  previewImage?: string | null; // Backward compatibility
  images?: string[]; // New support for multiple images
  onReviewTask?: () => void;
  scale?: number;
  isEmptyInitial?: boolean;
  externalContent?: string; // Content injected from outside (e.g. chat import)
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({ 
  task, 
  previewImage, 
  images = [],
  onReviewTask, 
  scale = 1,
  isEmptyInitial = false,
  externalContent
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Normalize images
  const displayImages = images.length > 0 ? images : (previewImage ? [previewImage] : []);

  useEffect(() => {
    // Reset index when images change
    setCurrentImageIndex(0);
  }, [displayImages.length]);

  useEffect(() => {
    if (externalContent) {
      setContent(externalContent);
    }
  }, [externalContent]);

  useEffect(() => {
    if (task) {
      if (isEmptyInitial) {
        // Capability Test Mode: Start empty
        setTitle('');
        setContent(''); 
      } else {
        // Project Mode: Pre-fill
        setTitle(task.title);
        if (task.topic) {
          const { logic } = task.topic;
          setContent(
`💡 痛点：${logic.painPoint}
✨ 方案：${logic.solution}
🔥 效果：${logic.quantifier}

（在这里开始撰写你的笔记内容...）`
          );
        } else {
          setContent('在这里开始撰写你的笔记内容...');
        }
      }
    }
  }, [task, isEmptyInitial]);

  return (
  <div className="w-[400px] h-full bg-gray-100 border-l flex flex-col shrink-0 items-center py-6 overflow-y-auto relative">
    {task && onReviewTask && (
      <button 
        onClick={onReviewTask}
        className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md text-taala-600 hover:bg-taala-50 transition tooltip-trigger"
        title="回顾本次任务表现"
      >
        <GraduationCap size={20} />
      </button>
    )}
    
    <div 
      style={{ 
        transform: `scale(${scale})`, 
        transformOrigin: 'center center',
        width: '375px',
        height: '812px'
      }}
      className="bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col border-[8px] border-gray-900 relative shrink-0"
    >
      {/* Dynamic Island / Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-20"></div>
      
      {/* Status Bar */}
      <div className="h-12 flex items-end justify-between px-6 pb-2 text-xs font-medium z-10 bg-white/80 backdrop-blur-sm absolute top-0 w-full">
         <span>9:41</span>
         <div className="flex gap-1">
            <div className="w-4 h-2.5 bg-black rounded-[1px]"></div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-12 pb-20 no-scrollbar">
         {/* Carousel Indicators - Only show if image exists */}
         {displayImages.length > 0 && (
           <div className="absolute top-14 right-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full z-10">
             {currentImageIndex + 1}/{displayImages.length}
           </div>
         )}
         
         {/* Image Area */}
         <div className="h-[450px] bg-gray-100 flex items-center justify-center text-gray-400 relative overflow-hidden">
             {displayImages.length > 0 ? (
                <img 
                  src={displayImages[currentImageIndex]} 
                  alt={`Preview ${currentImageIndex + 1}`} 
                  className="w-full h-full object-cover transition-opacity duration-300" 
                />
             ) : (
                <ImageIcon size={64} opacity={0.5} />
             )}
             
             {/* Dots Indicator */}
             {displayImages.length > 1 && (
               <div className="absolute bottom-4 left-4 flex gap-1 z-20">
                   {displayImages.map((_, idx) => (
                     <button
                       key={idx}
                       onClick={() => setCurrentImageIndex(idx)}
                       className={`w-1.5 h-1.5 rounded-full transition-all ${
                         idx === currentImageIndex ? 'bg-white w-3' : 'bg-white/50'
                       }`}
                     />
                   ))}
               </div>
             )}
         </div>

         {/* Content */}
         <div className="p-4">
             <input
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               className="font-bold text-lg mb-3 text-gray-900 leading-tight w-full border-none outline-none placeholder-gray-400 bg-transparent"
               placeholder="填写标题"
             />
             <textarea
               value={content}
               onChange={(e) => setContent(e.target.value)}
               className="text-[15px] text-gray-800 leading-relaxed w-full min-h-[200px] border-none outline-none resize-none placeholder-gray-400 bg-transparent"
               placeholder="填写正文..."
             />
             <div className="text-gray-400 text-xs mt-4 mb-6">02-07 编辑于 北京</div>
         </div>

         {/* Comments Section Preview */}
         <div className="border-t px-4 py-3">
             <div className="text-sm font-semibold mb-3">共 128 条评论</div>
             <div className="flex gap-3 mb-4">
                 <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                 <div className="flex-1">
                     <div className="text-xs text-gray-500 mb-0.5">桃子同学</div>
                     <div className="text-sm text-gray-800">蹲一个链接！求求了！</div>
                 </div>
                 <div className="flex flex-col items-center gap-0.5">
                     <Heart size={12} className="text-gray-400" />
                     <span className="text-[10px] text-gray-400">24</span>
                 </div>
             </div>
         </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="h-20 bg-white border-t flex items-center justify-between px-6 absolute bottom-0 w-full pb-4">
         <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2 flex-1 mr-4 text-gray-400 text-sm">
             <span className="text-gray-400">说点什么...</span>
         </div>
         <div className="flex items-center gap-5 text-gray-700">
             <div className="flex flex-col items-center gap-0.5">
                <Heart size={22} />
                <span className="text-[10px] font-medium">1.2k</span>
             </div>
             <div className="flex flex-col items-center gap-0.5">
                <Star size={22} />
                <span className="text-[10px] font-medium">568</span>
             </div>
             <div className="flex flex-col items-center gap-0.5">
                <MessageCircle size={22} />
                <span className="text-[10px] font-medium">128</span>
             </div>
         </div>
      </div>
    </div>
  </div>
  );
};
