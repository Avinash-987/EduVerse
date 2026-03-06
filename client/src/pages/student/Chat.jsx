import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPaperAirplane, HiPaperClip, HiSearch, HiDotsVertical, HiChat } from 'react-icons/hi';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function Chat() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const chatEndRef = useRef(null);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await api.get('/chat/conversations');
                if (res.data.success) {
                    setConversations(res.data.conversations);
                    if (res.data.conversations.length > 0) {
                        setActiveChat(res.data.conversations[0]);
                    }
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchConversations();
    }, []);

    useEffect(() => {
        if (!activeChat) return;
        const fetchMessages = async () => {
            try {
                const res = await api.get(`/chat/${activeChat._id}/messages`);
                if (res.data.success) setMessages(res.data.messages);
            } catch (err) { console.error(err); }
        };
        fetchMessages();
    }, [activeChat]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !activeChat) return;
        const content = input;
        setInput('');
        // Optimistic update
        setMessages(prev => [...prev, { _id: Date.now(), sender: { _id: user._id, name: user.name }, content, createdAt: new Date() }]);
        try {
            await api.post(`/chat/${activeChat._id}/messages`, { content });
        } catch (err) { console.error(err); }
    };

    const filteredConversations = conversations.filter(c => {
        if (!search) return true;
        const name = c.participants?.map(p => p.name).join(', ') || c.courseGroup?.title || '';
        return name.toLowerCase().includes(search.toLowerCase());
    });

    if (loading) return <LoadingSpinner text="Loading messages..." />;

    if (conversations.length === 0) {
        return (
            <div className="page-transition">
                <EmptyState icon={HiChat} title="No conversations yet" message="Start chatting with instructors or classmates once you enroll in a course." />
            </div>
        );
    }

    const getChatName = (conv) => {
        if (conv.courseGroup) return conv.courseGroup.title;
        return conv.participants?.filter(p => p._id !== user._id).map(p => p.name).join(', ') || 'Chat';
    };

    const getChatAvatar = (conv) => {
        if (conv.courseGroup) return '💬';
        return '👤';
    };

    return (
        <div className="page-transition h-[calc(100vh-7rem)]">
            <div className="glass-card !p-0 h-full flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 border-r border-border flex flex-col shrink-0 hidden lg:flex">
                    <div className="p-4 border-b border-border">
                        <h2 className="font-bold text-text-primary mb-3">Messages</h2>
                        <div className="relative">
                            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..." className="input-field !pl-9 !py-2 text-sm" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.map(conv => (
                            <button
                                key={conv._id}
                                onClick={() => setActiveChat(conv)}
                                className={`w-full flex items-center gap-3 p-4 hover:bg-surface-2/50 transition-colors text-left ${activeChat?._id === conv._id ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-lg shrink-0">{getChatAvatar(conv)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-sm text-text-primary truncate">{getChatName(conv)}</span>
                                        <span className="text-[10px] text-text-muted ml-2 shrink-0">{conv.lastMessage ? new Date(conv.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                    </div>
                                    <p className="text-xs text-text-muted truncate">{conv.lastMessage?.content || 'No messages yet'}</p>
                                </div>
                                {(conv.unreadCount || 0) > 0 && (
                                    <span className="w-5 h-5 rounded-full gradient-primary text-white text-[10px] flex items-center justify-center font-bold shrink-0">{conv.unreadCount}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-lg">{activeChat ? getChatAvatar(activeChat) : '💬'}</div>
                            <div>
                                <h3 className="font-semibold text-text-primary text-sm">{activeChat ? getChatName(activeChat) : 'Select a chat'}</h3>
                                <p className="text-xs text-green-500">Online</p>
                            </div>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-surface-2 transition-colors"><HiDotsVertical className="text-text-muted" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                            <p className="text-center text-text-muted text-sm py-12">No messages yet. Say hello!</p>
                        ) : (
                            messages.map(msg => {
                                const isSelf = msg.sender?._id === user._id;
                                return (
                                    <motion.div key={msg._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl p-3 text-sm ${isSelf ? 'gradient-primary text-white rounded-br-md' : 'bg-surface-2 dark:bg-surface-3 text-text-primary rounded-bl-md'}`}>
                                            {!isSelf && <p className="text-[10px] font-semibold mb-1 text-primary-500">{msg.sender?.name}</p>}
                                            <p>{msg.content}</p>
                                            <p className={`text-[10px] mt-1 ${isSelf ? 'text-white/60' : 'text-text-muted'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={sendMessage} className="p-4 border-t border-border flex gap-3">
                        <button type="button" className="p-2 rounded-lg hover:bg-surface-2 transition-colors text-text-muted"><HiPaperClip /></button>
                        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="input-field flex-1" />
                        <button type="submit" disabled={!input.trim()} className="btn-primary !p-3 disabled:opacity-50"><HiPaperAirplane className="rotate-90" /></button>
                    </form>
                </div>
            </div>
        </div>
    );
}
