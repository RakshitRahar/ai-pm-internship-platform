import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { aiAPI } from '@/services/api';
import toast from 'react-hot-toast';

const WELCOME_MESSAGE = {
    role: 'assistant',
    content: "Hi! I'm your AI career advisor 👋 I can help you understand your application scores, improve your CV, or prepare for PM interviews. What would you like to know?",
};

export default function AIChatWidget({ onClose }) {
    const [messages, setMessages] = useState([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        const userMsg = { role: 'user', content: trimmed };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const history = messages.slice(-8);
            const { data } = await aiAPI.chat(trimmed, history);
            setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (error) {
            // Only show error on genuine network failure (server is always expected to reply)
            setMessages((prev) => [...prev, {
                role: 'assistant',
                content: "Network issue — please check your connection and try again! 🔌",
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const quickPrompts = [
        "How can I improve my score?",
        "What skills should I learn?",
        "Tips for PM interview?",
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 flex flex-col bg-surface-800 border border-surface-600 rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-700 bg-gradient-to-r from-primary-600/20 to-accent-600/20">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-white">AI Career Advisor</p>
                    <p className="text-xs text-emerald-400">● Online</p>
                </div>
                <button onClick={onClose} className="ml-auto text-slate-400 hover:text-white transition-colors">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72 no-scrollbar">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`
              max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed
              ${msg.role === 'user'
                                ? 'bg-primary-600 text-white rounded-br-sm'
                                : 'bg-surface-700 text-slate-200 rounded-bl-sm'
                            }
            `}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-surface-700 text-slate-400 px-4 py-2 rounded-2xl rounded-bl-sm text-sm">
                            <span className="animate-pulse">AI is thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                    {quickPrompts.map((prompt) => (
                        <button
                            key={prompt}
                            onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                            className="text-xs px-2.5 py-1 rounded-full bg-surface-700 border border-surface-600 text-slate-400 hover:text-white hover:border-primary-500/50 transition-all"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="flex items-end gap-2 p-3 border-t border-surface-700">
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything..."
                    rows={1}
                    className="flex-1 bg-surface-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none no-scrollbar"
                    style={{ maxHeight: '80px' }}
                />
                <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="btn btn-primary p-2.5 rounded-xl disabled:opacity-40"
                >
                    <PaperAirplaneIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
