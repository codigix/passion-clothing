import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  PlusCircle, 
  HelpCircle,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const FloatingAIBot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hi ${user?.name || 'there'}! I'm your AI Fashion & Clothing Shopping Assistant. 🛍️ How can I help you discover styles, colors, or clothing today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addBotMessage = (text) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'bot',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSend = async (customText = null) => {
    const textToSend = customText || inputVal;
    if (!textToSend.trim()) return;

    // Add user message
    const userMsgId = Date.now();
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    if (!customText) {
      setInputVal('');
    }

    setIsTyping(true);

    try {
      // Map message history to payload
      const historyPayload = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await api.post('/chatbot/message', {
        message: textToSend,
        history: historyPayload
      });

      const replyText = response.data.text;
      const parsedIntent = response.data.parsedIntent;
      const suggestRate = response.data.suggestRate;
      const rate = response.data.rate;
      const item = response.data.item;

      // Append bot response with price suggestion metadata
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'bot',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestRate,
          rate,
          item,
          applied: false
        }
      ]);

      // Handle navigation redirect if requested
      if (parsedIntent && parsedIntent.intent === 'ERP_ACTION' && parsedIntent.action === 'CREATE_REQUIREMENT') {
        const normalized = textToSend.toLowerCase();
        if (normalized.includes('go') || normalized.includes('navigate') || normalized.includes('create') || normalized.includes('form') || normalized.includes('page')) {
          if (!response.data.isActionPrompt) {
            setTimeout(() => {
              navigate('/sales/client-requirement/create');
            }, 1800);
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to get response from chatbot API:', error);
      addBotMessage("Sorry, I ran into an error communicating with the AI server. Please make sure the backend is running correctly.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleApplyRate = async (messageId, item, rate) => {
    try {
      const response = await api.post('/chatbot/apply-rate', { item, rate });
      
      setMessages(prev => prev.map(m => {
        if (m.id === messageId) {
          return { ...m, applied: true };
        }
        return m;
      }));

      addBotMessage(response.data.message || `Successfully applied rate of ₹${rate} to item: ${item}.`);
    } catch (err) {
      console.error('Failed to apply price rate:', err);
      addBotMessage(`❌ Failed to apply rate for **${item}**. Please check database connection.`);
    }
  };

  const handleSuggestionClick = (actionText, messageText) => {
    handleSend(messageText);
  };

  // Convert simple markdown-style bolding and bullets to HTML lists/formatting safely
  const formatMessageText = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, idx) => {
      let content = line;
      // Bold **text**
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic *text*
      content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Check for markdown image tag: ![alt](url)
      const imgMatch = content.match(/!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        const alt = imgMatch[1];
        const src = imgMatch[2];
        return (
          <div key={idx} className="my-2 overflow-hidden rounded-lg border border-slate-200 shadow-sm max-w-full">
            <img 
              src={src} 
              alt={alt} 
              className="w-full h-auto object-cover max-h-48"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://loremflickr.com/500/500/fashion,clothing,style';
              }}
            />
          </div>
        );
      }
      
      // Bullets
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <li key={idx} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: content.substring(2) }} />;
      }
      return <p key={idx} className="min-h-[1.2rem]" dangerouslySetInnerHTML={{ __html: content }} />;
    });
  };

  return (
    <>
      {/* Dynamic Keyframes Injection */}
      <style>{`
        @keyframes float-ai {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse-ai-glow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(99, 102, 241, 0.4), 0 4px 20px rgba(99, 102, 241, 0.2);
          }
          50% {
            box-shadow: 0 0 25px rgba(139, 92, 246, 0.65), 0 8px 30px rgba(139, 92, 246, 0.35);
          }
        }
        @keyframes typing-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-float-ai {
          animation: float-ai 4s ease-in-out infinite;
        }
        .animate-pulse-ai-glow {
          animation: pulse-ai-glow 2.5s infinite ease-in-out;
        }
        .typing-dot {
          animation: typing-bounce 1.4s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
      `}</style>

      {/* Floating Action Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center cursor-pointer text-white z-[99999] transition-all duration-300 hover:scale-110 active:scale-95 animate-float-ai animate-pulse-ai-glow border-2 border-white/40`}
        title="Open AI Assistant"
      >
        {isOpen ? (
          <ChevronDown size={24} className="animate-spin-once" />
        ) : (
          <div className="relative">
            <Bot size={24} className="text-white" />
            <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
            </span>
          </div>
        )}
      </div>

      {/* Chat Interface Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[520px] bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-[0_20px_50px_rgba(99,102,241,0.15)] z-[99999] flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white px-4 py-3.5 flex items-center justify-between shadow-sm relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                <Bot size={20} className="text-indigo-300" />
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-wide flex items-center gap-1.5">
                  AI Fashion Assistant
                  <Sparkles size={12} className="text-pink-400 animate-pulse" />
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-[10px] text-slate-300 font-medium">Online</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors focus:outline-none"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-thin">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <div className="space-y-1">{formatMessageText(msg.text)}</div>
                  
                  {msg.suggestRate && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-2">
                      <span className="text-[11px] text-slate-500 font-medium">Apply this rate (₹{msg.rate}) to the ERP?</span>
                      {msg.applied ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] rounded-lg border border-emerald-200 inline-flex items-center gap-1 font-semibold w-max">
                          ✓ Applied to ERP
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApplyRate(msg.id, msg.item, msg.rate)}
                          className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-[10px] font-bold rounded-lg shadow-sm hover:shadow active:scale-95 transition-all focus:outline-none w-max"
                        >
                          Apply Rate
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-start">
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 typing-dot"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 typing-dot"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 typing-dot"></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-4 py-2 border-t border-slate-100 bg-white flex flex-wrap gap-1.5">
            <button 
              onClick={() => handleSuggestionClick('categories', '👕 Show types of clothing')}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 text-xs rounded-full border border-indigo-100/50 cursor-pointer transition-all duration-200 flex items-center gap-1 focus:outline-none"
            >
              <Sparkles size={11} />
              Clothing Types
            </button>
            <button 
              onClick={() => handleSuggestionClick('tops', '👚 Show top styles')}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100/80 text-amber-800 text-xs rounded-full border border-amber-100/50 cursor-pointer transition-all duration-200 flex items-center gap-1 focus:outline-none"
            >
              <TrendingUp size={11} />
              Top Styles
            </button>
            <button 
              onClick={() => handleSuggestionClick('colors', '🎨 Show popular solid colors')}
              className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100/80 text-pink-700 text-xs rounded-full border border-pink-100/50 cursor-pointer transition-all duration-200 flex items-center gap-1 focus:outline-none"
            >
              <PlusCircle size={11} />
              Solid Colors
            </button>
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <input 
              type="text" 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about fashion, clothing, styles, or colors..."
              className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400 text-slate-800"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!inputVal.trim() || isTyping}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center focus:outline-none shadow-md shadow-indigo-600/10"
            >
              <Send size={16} />
            </button>
          </div>

        </div>
      )}
    </>
  );
};

export default FloatingAIBot;
