import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, TrendingUp, MessageSquare, Clock, Cpu } from 'lucide-react';
import SplitText from './bits/SplitText';
import BlurText from './bits/BlurText';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

interface Message {
  id: number;
  role: string;
  content: string;
  timestamp: string;
}

export default function Analytics() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Process data for charts
  const roleData = [
    { name: 'User', value: messages.filter(m => m.role === 'user').length },
    { name: 'Nexus', value: messages.filter(m => m.role === 'assistant' || m.role === 'model').length },
  ];

  const COLORS = ['#10b981', '#3b82f6'];

  // Group by date (mocking some variation if data is sparse)
  const timeData = messages.reduce((acc: any[], msg) => {
    const date = new Date(msg.timestamp).toLocaleDateString();
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ date, count: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-zinc-100 font-sans p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Activity size={20} className="text-emerald-500" />
          </div>
          <SplitText
            text="System Analytics"
            className="text-2xl font-bold tracking-tight text-white"
            delay={50}
            tag="h1"
            textAlign="left"
          />
        </div>
        <BlurText
          text="Real-time performance metrics and neural interaction data."
          className="text-zinc-500 text-sm"
          delay={40}
        />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard icon={<MessageSquare size={18} />} label="Total Messages" value={messages.length} />
        <MetricCard icon={<TrendingUp size={18} />} label="Growth Rate" value="+12.5%" />
        <MetricCard icon={<Clock size={18} />} label="Avg Response" value="1.2s" />
        <MetricCard icon={<Cpu size={18} />} label="Neural Load" value="42%" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-6 text-zinc-400 uppercase tracking-widest font-mono">Interaction Volume</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeData.length > 0 ? timeData : [{date: 'No Data', count: 0}]}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-6 text-zinc-400 uppercase tracking-widest font-mono">Role Distribution</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold">{messages.length}</span>
              <span className="text-[10px] text-zinc-500 uppercase">Total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
      <div className="text-zinc-500 mb-4">{icon}</div>
      <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
