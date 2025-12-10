
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { DefectReport } from '../types';
import { XIcon, PaperAirplaneIcon, SparklesIcon, UserIcon, ArrowPathIcon } from './Icons';

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
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  
  // Use ref to hold the latest data without triggering re-initialization automatically
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const initChat = async (isRefresh = false) => {
    setIsLoading(true);
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
          setMessages([{ role: 'model', text: 'Lỗi: Không tìm thấy API Key. Vui lòng kiểm tra cấu hình môi trường.' }]);
          setIsLoading(false);
          return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Prepare context from data (simplified to save tokens)
      const simplifiedData = dataRef.current.slice(0, 200).map(r => ({
          id: r.id,
          sp: r.maSanPham,
          ten: r.tenThuongMai,
          loi: r.noiDungPhanAnh,
          sl_loi: r.soLuongLoi,
          sl_doi: r.soLuongDoi,
          trang_thai: r.trangThai,
          ngay: r.ngayPhanAnh,
          nguyen_nhan: r.nguyenNhan,
          khac_phuc: r.huongKhacPhuc,
          npp: r.nhaPhanPhoi
      }));

      const systemInstruction = `Bạn là trợ lý AI chuyên gia phân tích chất lượng cho hệ thống quản lý khiếu nại (QMS).
Dữ liệu hiện tại (${simplifiedData.length} phiếu đang hiển thị trên màn hình):
${JSON.stringify(simplifiedData)}

QUY TẮC TRẢ LỜI:
1. **Phân tích sâu sắc**: Tìm xu hướng (sản phẩm lỗi nhiều nhất, lỗi lặp lại, nhà phân phối hay gặp vấn đề).
2. **Ngắn gọn & Súc tích**: Trả lời trực tiếp, dùng gạch đầu dòng.
3. **Định dạng**: Dùng Markdown (**in đậm** cho từ khóa, - cho danh sách) để dễ đọc.
4. **Trung thực**: Nếu không tìm thấy thông tin trong dữ liệu được cung cấp, hãy nói "Không có thông tin trong dữ liệu hiện tại".
5. **Tiếng Việt**: Chuyên nghiệp, thân thiện.`;

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemInstruction,
          thinkingConfig: { thinkingBudget: 2048 }, 
        },
      });
      
      setChatSession(chat);
      
      if (isRefresh) {
          setMessages(prev => [...prev, { role: 'model', text: `✅ Đã cập nhật ngữ cảnh với ${simplifiedData.length} phiếu dữ liệu mới nhất.` }]);
      } else {
          setMessages([{ role: 'model', text: `Xin chào! Tôi đã sẵn sàng phân tích ${simplifiedData.length} phiếu khiếu nại đang hiển thị. Bạn muốn biết thông tin gì?` }]);
      }
    } catch (error) {
      console.error("Chat init error:", error);
      setMessages([{ role: 'model', text: 'Xin lỗi, tôi không thể khởi động ngay lúc này. Vui lòng kiểm tra kết nối mạng.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load only
  useEffect(() => {
    initChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const result = await chatSession.sendMessageStream({ message: userMsg });
      
      let fullText = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]); 

      for await (const chunk of result) {
        const chunkText = chunk.text;
        if (chunkText) {
            fullText += chunkText;
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1] = { role: 'model', text: fullText };
                return newMsgs;
            });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Đã xảy ra lỗi khi xử lý yêu cầu (Có thể do mạng hoặc hết hạn ngạch).' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageText = (text: string) => {
      const lines = text.split('\n');
      return lines.map((line, i) => {
          // Check for list item
          const isListItem = /^\s*[\*\-]\s+(.*)/.test(line);
          const isBold = /\*\*(.*?)\*\*/g;
          
          const processInline = (str: string) => {
              const parts = str.split(isBold);
              return parts.map((part, j) => {
                  if (j % 2 === 1) return <strong key={j} className="font-bold text-slate-900">{part}</strong>;
                  return part;
              });
          };

          if (isListItem) {
              const content = line.replace(/^\s*[\*\-]\s+/, '');
              return (
                  <div key={i} className="flex gap-2 ml-1 mb-1.5">
                      <span className="text-blue-500 mt-1.5 text-[8px]">•</span>
                      <span>{processInline(content)}</span>
                  </div>
              );
          }

          return (
              <p key={i} className={`min-h-[1em] mb-1.5 last:mb-0 ${line.trim() === '' ? 'h-2' : ''}`}>
                  {processInline(line)}
              </p>
          );
      });
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[450px] h-[650px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50 animate-fade-in-up ring-1 ring-black/5 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003DA5] to-blue-600 p-4 flex justify-between items-center text-white shrink-0 shadow-md">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner">
                <SparklesIcon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
                <h3 className="font-bold text-sm leading-tight">Trợ lý Chất lượng AI</h3>
                <p className="text-[10px] opacity-90 font-medium text-blue-100">Powered by Gemini 2.5 Flash</p>
            </div>
        </div>
        <div className="flex items-center gap-1">
            <button 
                onClick={() => initChat(true)} 
                className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-95 text-blue-100 hover:text-white"
                title="Cập nhật dữ liệu mới nhất từ màn hình"
            >
                <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-95 text-blue-100 hover:text-white">
                <XIcon className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50 scroll-smooth custom-scrollbar">
        {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-white ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'}`}>
                    {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                </div>
                <div 
                    className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-white text-slate-800 border border-slate-100 rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-blue-100/50 rounded-tl-none shadow-blue-100/50'
                    }`}
                >
                    {renderMessageText(msg.text)}
                </div>
            </div>
        ))}
        {isLoading && (
            <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm border border-white">
                    <SparklesIcon className="w-4 h-4 animate-spin-slow" />
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm rounded-tl-none flex gap-1.5 items-center h-10">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-2 relative bg-white rounded-2xl p-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all shadow-sm">
            <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Hỏi về dữ liệu, xu hướng lỗi..."
                className="flex-1 px-4 py-2.5 bg-transparent border-none text-sm outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                disabled={isLoading}
                autoFocus
            />
            <button 
                type="submit" 
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 bg-[#003DA5] text-white rounded-xl hover:bg-[#002a70] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex-shrink-0 shadow-blue-900/10"
            >
                <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-2 font-medium flex items-center justify-center gap-1">
              <SparklesIcon className="w-3 h-3 text-blue-300"/> 
              AI có thể mắc lỗi. Vui lòng kiểm chứng thông tin.
          </p>
      </div>
    </div>
  );
};

export default ChatInterface;
