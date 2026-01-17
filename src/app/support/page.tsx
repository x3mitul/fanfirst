'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, Send, Bot, User, Ticket, Calendar,
    UserCircle, HelpCircle, Loader2, Sparkles, X, Zap
} from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    agentType?: string;
    agentDescription?: string;
    isStreaming?: boolean;
    timestamp?: number;
}

const AGENT_ICONS: Record<string, React.ReactNode> = {
    ticket: <Ticket className="w-4 h-4" />,
    event: <Calendar className="w-4 h-4" />,
    account: <UserCircle className="w-4 h-4" />,
    faq: <HelpCircle className="w-4 h-4" />,
};

const AGENT_COLORS: Record<string, string> = {
    ticket: 'from-purple-500 to-pink-500',
    event: 'from-green-500 to-emerald-500',
    account: 'from-blue-500 to-cyan-500',
    faq: 'from-orange-500 to-yellow-500',
};

const QUICK_ACTIONS = [
    { label: "What is FanFirst?", icon: <HelpCircle className="w-4 h-4" /> },
    { label: "I need a refund", icon: <Ticket className="w-4 h-4" /> },
    { label: "Upcoming events", icon: <Calendar className="w-4 h-4" /> },
    { label: "Connect wallet", icon: <UserCircle className="w-4 h-4" /> },
];

// Typing indicator component
const TypingIndicator = () => (
    <div className="flex items-center gap-1 px-3 py-2">
        <motion.div
            className="w-2 h-2 bg-purple-400 rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
        />
        <motion.div
            className="w-2 h-2 bg-purple-400 rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
            className="w-2 h-2 bg-purple-400 rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
        />
    </div>
);

export default function SupportPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [currentAgent, setCurrentAgent] = useState<string | null>(null);
    const [responseTime, setResponseTime] = useState<number | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const streamingMessageRef = useRef<string>('');
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        connectWebSocket();
        return () => { wsRef.current?.close(); };
    }, []);

    const connectWebSocket = useCallback(() => {
        const ws = new WebSocket('ws://localhost:8000/ws/chat');

        ws.onopen = () => {
            console.log('✅ Connected');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'routing') {
                setConversationId(data.conversation_id);
                setCurrentAgent(data.agent_type);
                setIsTyping(true);

                // Add routing indicator
                setMessages(prev => [...prev, {
                    id: `route-${Date.now()}`,
                    role: 'system',
                    content: data.agent_description,
                    agentType: data.agent_type,
                }]);

                // Prepare streaming message
                streamingMessageRef.current = '';
                setMessages(prev => [...prev, {
                    id: `stream-${Date.now()}`,
                    role: 'assistant',
                    content: '',
                    agentType: data.agent_type,
                    agentDescription: data.agent_description,
                    isStreaming: true,
                }]);
            }
            else if (data.type === 'stream') {
                setIsTyping(false);
                streamingMessageRef.current += data.content;

                // Update streaming message
                setMessages(prev => {
                    const newMessages = [...prev];
                    const idx = newMessages.findIndex(m => m.isStreaming);
                    if (idx !== -1) {
                        newMessages[idx] = {
                            ...newMessages[idx],
                            content: streamingMessageRef.current,
                        };
                    }
                    return newMessages;
                });
            }
            else if (data.type === 'complete') {
                const elapsed = Date.now() - startTimeRef.current;
                setResponseTime(elapsed);
                setIsLoading(false);
                setIsTyping(false);
                setMessages(prev => prev.map(m =>
                    m.isStreaming ? { ...m, isStreaming: false } : m
                ));
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            setTimeout(connectWebSocket, 2000);
        };

        ws.onerror = () => setIsConnected(false);
        wsRef.current = ws;
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (text: string) => {
        if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        startTimeRef.current = Date.now();
        setIsLoading(true);
        setResponseTime(null);

        setMessages(prev => [...prev, {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: Date.now(),
        }]);

        wsRef.current.send(JSON.stringify({
            message: text,
            conversation_id: conversationId,
            visitor_id: localStorage.getItem('fanfirst_visitor_id') || undefined,
        }));

        setInput('');
    };

    return (
        <div className="min-h-screen bg-black text-white pt-20">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-16 z-40">
                <div className="max-w-3xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">Support Swarm</h1>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                                    <span className="text-white/50">
                                        {isConnected ? 'Online' : 'Connecting...'}
                                    </span>
                                    {responseTime && (
                                        <span className="text-purple-400 flex items-center gap-1">
                                            <Zap className="w-3 h-3" />
                                            {responseTime}ms
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {currentAgent && (
                            <div className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${AGENT_COLORS[currentAgent]} text-xs font-medium flex items-center gap-1.5`}>
                                {AGENT_ICONS[currentAgent]}
                                <span className="capitalize">{currentAgent}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat */}
            <div className="max-w-3xl mx-auto px-4 pb-32">
                {/* Welcome */}
                {messages.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-16 text-center"
                    >
                        <motion.div
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/30"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Sparkles className="w-8 h-8 text-white" />
                        </motion.div>
                        <h2 className="text-2xl font-bold mb-2">How can I help?</h2>
                        <p className="text-white/50 mb-8 text-sm">Ask about tickets, events, or your account</p>

                        <div className="flex flex-wrap justify-center gap-2">
                            {QUICK_ACTIONS.map((action, i) => (
                                <motion.button
                                    key={i}
                                    onClick={() => sendMessage(action.label)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-xl text-sm transition-all"
                                >
                                    {action.icon}
                                    {action.label}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Messages */}
                <div className="space-y-3 py-4">
                    <AnimatePresence mode="popLayout">
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                layout
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'system' ? (
                                    <motion.div
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full text-xs text-white/50"
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                    >
                                        {AGENT_ICONS[msg.agentType || 'faq']}
                                        {msg.content}
                                    </motion.div>
                                ) : msg.role === 'user' ? (
                                    <div className="max-w-[85%]">
                                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2.5 rounded-2xl rounded-br-sm shadow-lg">
                                            {msg.content}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="max-w-[85%] flex gap-2">
                                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${AGENT_COLORS[msg.agentType || 'faq']} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                            {AGENT_ICONS[msg.agentType || 'faq']}
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-white/5 backdrop-blur border border-white/10 px-4 py-2.5 rounded-2xl rounded-tl-sm">
                                                {msg.content ? (
                                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                        {msg.content}
                                                        {msg.isStreaming && (
                                                            <motion.span
                                                                className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5"
                                                                animate={{ opacity: [1, 0] }}
                                                                transition={{ duration: 0.5, repeat: Infinity }}
                                                            />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <TypingIndicator />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Thinking indicator */}
                    {isTyping && messages[messages.length - 1]?.content === '' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="flex gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2">
                                    <TypingIndicator />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent pt-8 pb-4">
                <div className="max-w-3xl mx-auto px-4">
                    <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask anything..."
                            disabled={!isConnected || isLoading}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || !isConnected || isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </form>
                    <p className="text-center text-[10px] text-white/30 mt-2">
                        Powered by AI • Responses may not always be accurate
                    </p>
                </div>
            </div>
        </div>
    );
}
