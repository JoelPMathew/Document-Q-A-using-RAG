import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, AlertCircle, CheckCircle2, Info, ChevronRight, BookOpen, Quote } from 'lucide-react';
import { askKnowledgeBase, KnowledgeResponse } from '../services/knowledgeService';
import TiltedCard from './landing/TiltedCard';
import SplitText from './bits/SplitText';

export default function KnowledgeBase() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KnowledgeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await askKnowledgeBase(query);
      setResult(res);
    } catch (err) {
      setError('Failed to query the knowledge base. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 max-w-6xl mx-auto">
      <div className="mb-12">
        <SplitText 
          text="Neural Knowledge Base" 
          className="text-4xl font-bold text-white mb-4"
          delay={50}
        />
        <p className="text-zinc-500 max-w-2xl">
          Query your organization's policies, manuals, and SOPs using natural language. 
          Our neural engine retrieves exact snippets and provides verifiable citations.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative mb-12">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="text-zinc-500" size={20} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about policies, FAQs, or manuals..."
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-5 pl-16 pr-32 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-xl"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-3 inset-y-3 px-6 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Activity size={18} />
            </motion.div>
          ) : (
            <>Search <ChevronRight size={18} /></>
          )}
        </button>
      </form>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6" />
              <p className="text-zinc-400 font-mono text-sm animate-pulse">Consulting Neural Nodes...</p>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Answer Section */}
              <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <BookOpen size={80} />
                </div>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                    result.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-500' :
                    result.confidence === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {result.confidence === 'high' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    Confidence: {result.confidence}
                  </div>
                </div>

                <div className="text-xl text-zinc-100 leading-relaxed max-w-4xl">
                  {result.answer}
                </div>
              </div>

              {/* Sources Section */}
              {result.sources.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Quote size={16} /> Verifiable Citations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.sources.map((source, i) => (
                      <TiltedCard key={i}>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 h-full flex flex-col">
                          <div className="flex items-center gap-2 mb-4">
                            <FileText size={16} className="text-emerald-500" />
                            <span className="text-xs font-bold text-white truncate">{source.document}</span>
                            <span className="ml-auto text-[10px] font-mono text-zinc-600">Relevance: {Math.round(source.score * 100)}%</span>
                          </div>
                          <p className="text-sm text-zinc-400 italic line-clamp-4 flex-1">
                            "{source.snippet}"
                          </p>
                        </div>
                      </TiltedCard>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center opacity-50"
            >
              <Info size={48} className="text-zinc-700 mb-4" />
              <p className="text-zinc-500">Enter a query above to search the neural knowledge base.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Activity({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
