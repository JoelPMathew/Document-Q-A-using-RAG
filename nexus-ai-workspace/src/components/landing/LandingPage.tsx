import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Bot, Database, Activity, Sparkles, Shield, Cpu, Zap, Globe, Lock, Terminal } from 'lucide-react';
import TiltedCard from './TiltedCard';
import Counter from './Counter';
import GridScan from './GridScan';
import Stepper from './Stepper';
import ElasticSlider from './ElasticSlider';
import SplitText from '../bits/SplitText';
import FlowingMenu from '../bits/FlowingMenu';
import CurvedLoop from '../bits/CurvedLoop';
import Prism from '../bits/Prism';
import Particles from '../bits/Particles';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-emerald-500/30 overflow-x-hidden">
      <GridScan 
        enableWebcam={false} 
        showPreview={false} 
        scanOnClick={true}
        bloomIntensity={0.5}
      />
      
      {/* Hero Section */}
      <header className="relative pt-32 pb-40 px-6 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          <Prism />
        </div>
        
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Particles
            particleCount={300}
            particleSpread={12}
            speed={0.15}
            particleColors={['#10b981', '#3b82f6', '#ffffff']}
            moveParticlesOnHover={true}
            particleHoverFactor={1.5}
            alphaParticles={true}
            particleBaseSize={80}
            sizeRandomness={0.8}
            cameraDistance={25}
          />
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium mb-8"
          >
            <Sparkles size={14} />
            <span>Nexus v1.0 is now live</span>
          </motion.div>

          <SplitText
            text="The Future of Neural Workspaces"
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent"
            delay={40}
            tag="h1"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            A unified platform for AI-driven development, knowledge management, and real-time analytics. Built for the next generation of engineers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button 
              onClick={() => onNavigate('workspace')}
              className="px-8 py-4 rounded-2xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Launch Workspace <ArrowRight size={18} />
            </button>
            <button className="px-8 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white font-semibold hover:bg-zinc-800 transition-all">
              View Documentation
            </button>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 max-w-4xl mx-auto">
            <Stat label="Active Nodes" value={1240} suffix="+" />
            <Stat label="Neural Links" value={850} suffix="k" />
            <Stat label="Uptime" value={99} suffix=".9%" />
            <Stat label="Latency" value={12} suffix="ms" />
          </div>
        </div>
      </header>

      {/* Flowing Menu Section */}
      <section className="py-32 px-6 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-4">Neural Modules</h2>
          <p className="text-zinc-500 max-w-xl">Explore the core components of the Nexus ecosystem, designed for seamless integration and maximum throughput.</p>
        </div>
        <FlowingMenu 
          items={[
            { text: "Core Intelligence", image: "https://picsum.photos/seed/ai1/800/800" },
            { text: "Vector Memory", image: "https://picsum.photos/seed/ai2/800/800" },
            { text: "Neural Analytics", image: "https://picsum.photos/seed/ai3/800/800" },
            { text: "Secure Protocols", image: "https://picsum.photos/seed/ai4/800/800" }
          ]}
        />
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TiltedCard className="md:col-span-2 h-[400px]">
            <div className="h-full w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Bot size={120} />
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                  <Bot size={24} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Advanced AI Workspace</h3>
                <p className="text-zinc-400 max-w-md">
                  Experience the power of Gemini 3 Flash with our optimized neural interface. Real-time reasoning, multi-modal support, and persistent memory.
                </p>
              </div>
              <button 
                onClick={() => onNavigate('workspace')}
                className="flex items-center gap-2 text-emerald-500 font-medium hover:gap-3 transition-all"
              >
                Enter Workspace <ArrowRight size={16} />
              </button>
            </div>
          </TiltedCard>

          <TiltedCard className="h-[400px]">
            <div className="h-full w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                  <Database size={24} className="text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Knowledge Base</h3>
                <p className="text-zinc-400">
                  Secure, encrypted storage for your neural data. Persistent history and vector-search ready.
                </p>
              </div>
              <button 
                onClick={() => onNavigate('knowledge')}
                className="flex items-center gap-2 text-blue-500 font-medium hover:gap-3 transition-all"
              >
                Explore Data <ArrowRight size={16} />
              </button>
            </div>
          </TiltedCard>
        </div>
      </section>

      {/* Slider Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Neural Infrastructure</h2>
          <p className="text-zinc-500">Scale your operations with our distributed neural network.</p>
        </div>
        <ElasticSlider 
          slides={[
            {
              title: "Distributed Compute",
              description: "Harness the power of thousands of edge nodes for lightning-fast inference.",
              image: "https://picsum.photos/seed/tech1/1200/600"
            },
            {
              title: "Quantum Encryption",
              description: "Your data is protected by state-of-the-art post-quantum cryptographic standards.",
              image: "https://picsum.photos/seed/tech2/1200/600"
            },
            {
              title: "Real-time Sync",
              description: "Seamlessly synchronize your workspace across all your neural interfaces.",
              image: "https://picsum.photos/seed/tech3/1200/600"
            }
          ]}
        />
      </section>

      {/* Stepper & Analytics Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20">
        <div>
          <h2 className="text-3xl font-bold text-white mb-8">Onboarding Protocol</h2>
          <Stepper 
            steps={[
              { title: "Neural Linkage", description: "Establish a secure connection to the Nexus Core." },
              { title: "Identity Verification", description: "Biometric and cryptographic handshake." },
              { title: "Workspace Provisioning", description: "Allocating dedicated neural compute resources." },
              { title: "Operational Status", description: "Full system access granted." }
            ]}
            currentStep={2}
          />
        </div>
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-white">System Analytics</h2>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard icon={<Zap size={18} />} label="Throughput" value="1.2 GB/s" />
            <MetricCard icon={<Cpu size={18} />} label="Core Load" value="42%" />
            <MetricCard icon={<Shield size={18} />} label="Security" value="Optimal" />
            <MetricCard icon={<Activity size={18} />} label="Stability" value="99.99%" />
          </div>
          <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
            <p className="text-zinc-400 text-sm leading-relaxed italic">
              "Nexus has transformed our development workflow. The neural workspace is unlike anything we've used before."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800" />
              <div>
                <p className="text-sm font-bold text-white">Dr. Aris Thorne</p>
                <p className="text-xs text-zinc-500">Chief Neural Architect</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curved Loop Section */}
      <section className="py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-6">Neural Ecosystem</h2>
            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
              Our distributed network architecture ensures that your neural operations are always synchronized, secure, and highly available across the globe.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-500">
                <Globe size={20} />
                <span className="font-medium">Global Edge Distribution</span>
              </div>
              <div className="flex items-center gap-3 text-blue-500">
                <Lock size={20} />
                <span className="font-medium">End-to-End Neural Encryption</span>
              </div>
              <div className="flex items-center gap-3 text-purple-500">
                <Terminal size={20} />
                <span className="font-medium">Programmable Neural Interfaces</span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <CurvedLoop 
              radius={180}
              items={[
                <Bot key="1" className="text-emerald-500" />,
                <Database key="2" className="text-blue-500" />,
                <Activity key="3" className="text-purple-500" />,
                <Shield key="4" className="text-red-500" />,
                <Cpu key="5" className="text-amber-500" />,
                <Zap key="6" className="text-yellow-500" />
              ]}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-zinc-900 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-sm rotate-45"></div>
            </div>
            <span className="text-white font-bold tracking-tight">NEXUS</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
          </div>
          <p className="text-xs text-zinc-600 font-mono">© 2026 NEXUS NEURAL SYSTEMS</p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string, value: number, suffix: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-bold text-white mb-1">
        <Counter value={value} />{suffix}
      </p>
      <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">{label}</p>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
      <div className="text-zinc-500 mb-4">{icon}</div>
      <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}
