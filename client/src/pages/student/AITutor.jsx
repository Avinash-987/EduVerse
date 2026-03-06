import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPaperAirplane, HiLightBulb, HiSparkles, HiRefresh } from 'react-icons/hi';

const SUGGESTIONS = [
    'Explain React hooks in simple terms',
    'How does async/await work in JavaScript?',
    'What are the key differences between SQL and NoSQL?',
    'Help me understand Big O notation',
];

const AI_RESPONSES = {
    default: "I'm your AI Tutor! I can help you understand any concept from your courses. Ask me anything and I'll provide clear, detailed explanations with examples. What would you like to learn about?",
};

export default function AITutor() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: AI_RESPONSES.default, timestamp: new Date() },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const sendMessage = async (text) => {
        const content = text || input;
        if (!content.trim()) return;

        setMessages(prev => [...prev, { role: 'user', content, timestamp: new Date() }]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response
        await new Promise(r => setTimeout(r, 1500));

        const response = `Great question about "${content}"!\n\nHere's a detailed explanation:\n\n**Key Concepts:**\n1. This is a fundamental topic in Computer Science and programming.\n2. Understanding this will help you build better applications.\n3. Let me break it down step by step.\n\n**Example:**\n\`\`\`javascript\n// Here's a practical example\nconst example = () => {\n  return "Learning is fun!";\n};\n\`\`\`\n\n**Key Takeaway:** Practice implementing these concepts in your projects. The more you practice, the more intuitive it becomes.\n\nWould you like me to explain any part in more detail? 😊`;

        setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }]);
        setIsTyping(false);
    };

    return (
        <div className="page-transition h-[calc(100vh-7rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white">
                        <HiLightBulb className="text-xl" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-text-primary">AI Tutor</h1>
                        <p className="text-xs text-text-muted flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Online & ready to help</p>
                    </div>
                </div>
                <button onClick={() => setMessages([{ role: 'assistant', content: AI_RESPONSES.default, timestamp: new Date() }])} className="p-2 rounded-lg glass hover:scale-105 transition-all" title="New Chat">
                    <HiRefresh className="text-text-muted" />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto glass-card !p-4 space-y-4 mb-4">
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white text-sm ${msg.role === 'assistant' ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'gradient-primary'
                            }`}>
                            {msg.role === 'assistant' ? <HiSparkles /> : 'U'}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${msg.role === 'user'
                                ? 'gradient-primary text-white rounded-tr-md'
                                : 'bg-surface-2 dark:bg-surface-3 text-text-primary rounded-tl-md'
                            }`}>
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                            <p className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-white/60' : 'text-text-muted'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm"><HiSparkles /></div>
                        <div className="bg-surface-2 dark:bg-surface-3 rounded-2xl rounded-tl-md p-4 text-sm">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {SUGGESTIONS.map((s, i) => (
                        <button key={i} onClick={() => sendMessage(s)} className="px-3 py-1.5 rounded-full glass text-xs text-text-secondary hover:text-primary-600 hover:border-primary-300 transition-all">
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask your AI tutor anything..."
                    className="input-field flex-1"
                    disabled={isTyping}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="btn-primary !p-3 disabled:opacity-50"
                >
                    <HiPaperAirplane className="text-lg rotate-90" />
                </button>
            </form>
        </div>
    );
}
