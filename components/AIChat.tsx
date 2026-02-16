import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { ChatMessage } from '../types';
import { geminiService } from '../services/geminiService';

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'سلام! 👋 من هوش مصنوعی دیجی‌نکست هستم. چطور می‌تونم تو خرید بهتون کمک کنم؟',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const responseText = await geminiService.sendMessage(inputValue);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed z-50 bottom-20 left-4 md:bottom-8 md:left-8 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed z-50 bottom-0 left-0 w-full md:w-96 md:bottom-24 md:left-8 bg-white dark:bg-gray-800 md:rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ease-in-out border border-gray-200 dark:border-gray-700
        ${isOpen ? 'h-[80vh] md:h-[600px] translate-y-0 opacity-100' : 'h-0 translate-y-10 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">دستیار هوشمند</h3>
              <p className="text-[10px] text-white/80">پاسخگویی آنلاین</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div 
                className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-br-none' 
                  : 'bg-indigo-600 text-white rounded-bl-none shadow-md'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-end">
              <div className="bg-indigo-600 text-white rounded-2xl rounded-bl-none p-3 shadow-md flex gap-1">
                 <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></span>
                 <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-2">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="سوالی بپرسید..."
              className="flex-1 bg-transparent border-none outline-none text-sm dark:text-white placeholder-gray-400"
            />
            <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="text-indigo-600 dark:text-indigo-400 disabled:opacity-50 hover:scale-110 transition-transform"
            >
              <Send className="w-5 h-5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChat;
