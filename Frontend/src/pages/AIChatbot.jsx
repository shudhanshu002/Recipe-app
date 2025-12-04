import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles, ChefHat } from 'lucide-react';
import api from '../lib/axios';
import useThemeStore from '../store/useThemeStore';
import { useLocation } from 'react-router-dom';

const AIChatbot = () => {
    const { isDarkMode } = useThemeStore();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ role: 'system', content: "Hi! I'm YumBot 👨‍🍳. Ask me anything about cooking!" }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Get current URL to pass context
    const location = useLocation();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Context: Pass current page info (e.g., Recipe ID if on detail page)
            const context = location.pathname.includes('/recipes/') ? { recipeId: location.pathname.split('/').pop() } : null;

            const response = await api.post('/ai/chat', {
                message: userMessage.content,
                context,
            });

            const botMessage = { role: 'system', content: response.data.data.reply };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            setMessages((prev) => [...prev, { role: 'system', content: 'My oven is overheating! Try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Styles
    const cardBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200';
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const inputBg = isDarkMode ? 'bg-[#2d2d2d] text-white' : 'bg-gray-100 text-gray-900';

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className={`w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl border flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 ${cardBg}`}>
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-orange-500 to-pink-500 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-full">
                                <ChefHat size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">YumBot Assistant</h3>
                                <p className="text-[10px] text-white/80 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Online
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                                        msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : `${isDarkMode ? 'bg-[#2d2d2d] text-gray-200' : 'bg-gray-100 text-gray-800'} rounded-bl-none`
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className={`px-4 py-2 rounded-2xl rounded-bl-none flex items-center gap-2 text-xs ${isDarkMode ? 'bg-[#2d2d2d] text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                    <Loader2 size={14} className="animate-spin" /> Chef is thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className={`p-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <div
                            className={`flex items-center gap-2 rounded-full px-4 py-2 border transition-all focus-within:ring-2 focus-within:ring-primary/50 ${inputBg} ${
                                isDarkMode ? 'border-gray-600' : 'border-gray-200'
                            }`}
                        >
                            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about a recipe..." className="flex-1 bg-transparent outline-none text-sm" />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="p-1.5 bg-primary text-white rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-primary transition-colors"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-lg shadow-orange-500/30 transition-all hover:scale-110 active:scale-95 flex items-center justify-center bg-gradient-to-r from-orange-500 to-pink-500 text-white`}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} fill="currentColor" />}

                {/* Notification Dot Animation */}
                {!isOpen && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-bounce" />}
            </button>
        </div>
    );
};

export default AIChatbot;
