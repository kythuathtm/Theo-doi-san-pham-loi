
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { DefectReport } from '../types';
import { XIcon, PaperAirplaneIcon, SparklesIcon } from './Icons';

interface ChatInterfaceProps {
  onClose: () => void;
  data: DefectReport[];
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose, data }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatSession, setChatSession] = useState<any>(null);

  // Initialize Chat Session on Mount
  useEffect(() => {
    const initChat = async () => {
      try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            setMessages([{ role: 'model', text: 'Lỗi: Không tìm thấy API Key. Vui lòng kiểm tra cấu hình.' }]);
            return;
        }

        const ai = new GoogleGenAI({ apiKey });
        
        // Prepare context from data (simplified to save tokens)
        const simplifiedData = data.slice(0, 50).map(r => ({
            id: r.id,
            sp: r.maSanPham,
            ten: r.tenThuongMai,
            loi: r.noiDungPhanAnh,
            sl_loi: r.soLuongLoi,
            trang_thai: r.trangThai,
            ngay: r.ngayPhanAnh
        }));

        const systemInstruction = `Bạn là trợ lý AI cho Hệ thống Theo dõi Khiếu nại Chất lượng Sản phẩm.
Dưới đây là dữ liệu 50 phiếu khiếu nại gần nhất (đã được rút gọn):
${JSON.stringify(simplifiedData)}

Nhiệm vụ của bạn:
1. Trả lời các câu hỏi về dữ liệu này (ví dụ: "Có bao nhiêu lỗi?", "Sản phẩm nào lỗi nhiều nhất?").
2. Nếu người dùng hỏi chung chung, hãy trả lời dựa trên kiến thức quản lý chất lượng.
3. Luôn trả lời ngắn gọn, súc tích bằng tiếng Việt.
4. Nếu không tìm thấy thông tin trong dữ liệu được cung cấp, hãy nói rõ.`;

        const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: systemInstruction,
          },
        });
        
        setChatSession(chat);
        setMessages([{ role: 'model', text: 'Xin chào! Tôi là trợ lý ảo AI. Tôi có thể giúp gì cho bạn về dữ liệu khiếu nại hôm nay?' }]);
      } catch (error) {
        console.error("Chat init error:", error);
        setMessages([{ role: 'model', text: 'Xin lỗi, tôi không thể khởi động ngay lúc này. Vui lòng thử lại sau.' }]);
      }
    };

    initChat();
  }, [data]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !chatSession || isLoading) return;

    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await chatSession.sendMessageStream(userMsg);
      
      let fullText = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]); // Placeholder

      for await (const chunk of result) {
        const chunkText = chunk.text();
        fullText += chunkText;
        
        setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = { role: 'model', text: fullText };
            return newMsgs;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Đã xảy ra lỗi khi xử lý yêu cầu của bạn.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-[90vw] sm:w-[400px] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50 animate-fade-in-up ring-1 ring-black/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003DA5] to-blue-600 p-4 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 animate-pulse" />
            <h3 className="font-bold text-sm">Trợ lý AI</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <XIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth custom-scrollbar">
        {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-white text-slate-700 border border-slate-200 shadow-sm rounded-bl-none'
                    }`}
                >
                    {msg.text}
                </div>
            </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm rounded-bl-none flex gap-1 items-center">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
        <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Hỏi về dữ liệu..."
            className="flex-1 px-4 py-2.5 bg-slate-100 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl text-sm outline-none transition-all"
            disabled={isLoading}
        />
        <button 
            type="submit" 
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
        >
            <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
