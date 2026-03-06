import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import { generateResponse } from '../services/gemini';

interface Message {
  id?: number;
  role: 'user' | 'model';
  content: string;
  timestamp?: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setMessages(data.map((m: any) => ({ ...m, role: m.role === 'assistant' ? 'model' : m.role })));
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Save user message to DB
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content: input }),
      });

      const responseText = await generateResponse(input, messages.map(m => ({ role: m.role, content: m.content })));
      
      const aiMessage: Message = { role: 'model', content: responseText || 'No response' };
      setMessages(prev => [...prev, aiMessage]);

      // Save AI message to DB
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'assistant', content: responseText }),
      });
    } catch (err) {
      console.error('Chat error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm('Clear all messages?')) return;
    await fetch('/api/messages', { method: 'DELETE' });
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-zinc-100 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Bot size={20} className="text-black" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Nexus Core</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Status: Operational</p>
          </div>
        </div>
        <button 
          onClick={clearHistory}
          className="p-2 text-zinc-500 hover:text-red-400 transition-colors rounded-md hover:bg-red-400/10"
          title="Clear History"
        >
          <Trash2 size={18} />
        </button>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                <Bot size={32} className="text-zinc-400" />
              </div>
              <h2 className="text-xl font-medium text-zinc-300">Welcome to Nexus</h2>
              <p className="text-zinc-500 max-w-xs text-sm">
                Your high-performance AI workspace. Ask anything to begin.
              </p>
            </motion.div>
          )}
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-zinc-800' : 'bg-emerald-500/10 border border-emerald-500/20'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-emerald-500" />}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-zinc-800 text-zinc-100 rounded-tr-none' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Loader2 size={16} className="text-emerald-500 animate-spin" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce"></span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-zinc-800 bg-zinc-900/30">
        <form 
          onSubmit={handleSend}
          className="relative max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your command..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.2)]"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-[10px] text-center text-zinc-600 mt-4 font-mono uppercase tracking-widest">
          Nexus v1.0.4 // Neural Link Active
        </p>
      </div>
    </div>
  );
}
