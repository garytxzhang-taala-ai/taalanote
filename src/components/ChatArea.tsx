import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, ArrowRight, Image as ImageIcon, Loader2, Square } from 'lucide-react';
import { chat, chatStream } from '../services/api';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | React.ReactNode;
  type?: 'text' | 'image';
  imageUrl?: string;
}

interface ChatAreaProps {
  initialMessages?: Message[];
  onAddToPreview?: (imageUrl: string) => void;
  onImportContent?: (content: string) => void;
  onSwitchToImageGen: () => void;
  onUserMessage?: (message: string) => void;
  onAssistantMessage?: (message: string) => void;
  onMessagesChange?: (messages: Message[]) => void;
  enableStreaming?: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ 
  initialMessages,
  onAddToPreview, 
  onImportContent,
  onSwitchToImageGen, 
  onUserMessage, 
  onAssistantMessage,
  onMessagesChange,
  enableStreaming = false,
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages || [
    {
      id: '1',
      role: 'user',
      content: '你好，我是你的小红书运营助手',
      type: 'text'
    },
    {
      id: '2',
      role: 'assistant',
      content: '你好！我是 TaalaNote AI，专注于帮你打造爆款小红书笔记。我可以帮你：\n\n1. 策划选题与标题\n2. 生成吸引人的正文文案\n3. 创作高质量配图\n\n请告诉我你想写什么主题的内容？',
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    onMessagesChange?.(messages);
  }, [messages, onMessagesChange]);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsThinking(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isThinking) return;
    
    const userContent = input;
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsThinking(true);
    
    // Create new AbortController
    abortControllerRef.current = new AbortController();
    
    // Trigger prompt evaluation
    onUserMessage?.(userContent);
    
    try {
      // Prepare messages for API
      const apiMessages = messages
        .filter(m => typeof m.content === 'string')
        .map(m => ({ role: m.role, content: m.content as string }));
      
      apiMessages.push({ role: 'user', content: userContent });

      if (enableStreaming) {
        // Streaming Mode
        const assistantMsgId = (Date.now() + 1).toString();
        const initialAssistantMsg: Message = {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          type: 'text'
        };
        setMessages(prev => [...prev, initialAssistantMsg]);

        let fullContent = '';
        await chatStream(
          apiMessages, 
          (chunk) => {
            fullContent += chunk;
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMsgId 
                ? { ...msg, content: fullContent }
                : msg
            ));
          },
          abortControllerRef.current.signal
        );
        
        onAssistantMessage?.(fullContent);
      } else {
        // Standard Mode
        const responseText = await chat(apiMessages);

        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText,
          type: 'text'
        };
        setMessages(prev => [...prev, responseMessage]);
        
        // Trigger content audit
        onAssistantMessage?.(responseText);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
         console.log('Generation stopped');
      } else {
         console.error('Chat error:', error);
         const errorMessage: Message = {
           id: (Date.now() + 1).toString(),
           role: 'assistant',
           content: '抱歉，服务暂时不可用，请检查网络或 API 配置。',
           type: 'text'
         };
         setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsThinking(false);
      abortControllerRef.current = null;
    }
  };

  const handleGenerateImage = () => {
    onSwitchToImageGen();
  };

  return (
    <div className="flex-1 bg-white flex flex-col min-w-0 relative h-full">
      <div className="h-14 border-b flex items-center px-6 justify-between bg-white shrink-0">
         <div className="flex bg-gray-100 rounded-lg p-1">
            <button className="px-4 py-1.5 rounded-md bg-white shadow-sm text-xs font-semibold text-gray-900 border border-gray-200/50">LLM 生成</button>
            <button 
              onClick={handleGenerateImage}
              className="px-4 py-1.5 rounded-md text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-white/50 transition-all flex items-center gap-1"
            >
              <ImageIcon size={12} />
              生图工具
            </button>
         </div>
         
         <div className="flex items-center gap-4">
            <div className="text-xs text-gray-400">DeepSeek-V3</div>
         </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end group'}`}>
             {msg.role === 'user' ? (
                <div className="bg-white border shadow-sm rounded-2xl rounded-tl-none p-4 max-w-[85%] text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
             ) : (
                <div className="flex flex-col items-end gap-2 max-w-[85%]">
                    <div className="bg-taala-50 border border-taala-100 rounded-2xl rounded-tr-none p-4 text-sm text-gray-800 leading-relaxed shadow-sm overflow-hidden whitespace-pre-wrap">
                      {msg.type === 'image' && msg.imageUrl ? (
                        <div className="space-y-2">
                           <p className="mb-2 text-taala-800 font-medium">✨ {msg.content}</p>
                           <img src={msg.imageUrl} alt="Generated content" className="rounded-lg max-w-full h-auto border border-taala-100" />
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                    {/* Action Buttons for Assistant Messages */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity px-2">
                       {msg.type === 'image' && msg.imageUrl && (
                         <button 
                            onClick={() => onAddToPreview?.(msg.imageUrl!)}
                            className="text-xs text-taala-500 font-medium flex items-center gap-1 hover:text-taala-600 bg-taala-50 px-2 py-1 rounded-full cursor-pointer"
                         >
                            添加到预览 <ArrowRight size={12} />
                         </button>
                       )}
                       {msg.type === 'text' && (
                         <button 
                            onClick={() => onImportContent?.(msg.content as string)}
                            className="text-xs text-taala-500 font-medium flex items-center gap-1 hover:text-taala-600 bg-taala-50 px-2 py-1 rounded-full cursor-pointer"
                         >
                            导入预览 <ArrowRight size={12} />
                         </button>
                       )}
                    </div>
                </div>
             )}
          </div>
        ))}
        
        {isThinking && (
          <div className="flex justify-end">
            <div className="bg-taala-50 border border-taala-100 rounded-2xl rounded-tr-none p-4 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-taala-500" />
              <span className="text-sm text-gray-500">正在思考...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t bg-white">
         <div className="border border-gray-300 rounded-xl p-3 flex items-center bg-white shadow-sm focus-within:ring-2 focus-within:ring-taala-100 focus-within:border-taala-400 transition-all">
           <input 
             type="text" 
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && !isThinking && handleSendMessage()}
             className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 disabled:bg-transparent" 
             placeholder={isThinking ? "正在生成中..." : "输入你的指令，例如：生成小红书文案..."} 
             disabled={isThinking}
           />
           <button 
             onClick={isThinking ? handleStopGeneration : handleSendMessage}
             disabled={!isThinking && !input.trim()}
             className={`p-2 text-white rounded-lg ml-2 transition shadow-md ${
               isThinking 
                 ? 'bg-red-500 hover:bg-red-600' 
                 : 'bg-taala-500 hover:bg-taala-600 disabled:bg-gray-300 disabled:cursor-not-allowed'
             }`}
             title={isThinking ? "停止生成" : "发送"}
           >
             {isThinking ? <Square size={18} fill="currentColor" /> : <MessageSquare size={18} />}
           </button>
         </div>
      </div>
    </div>
  );
};
