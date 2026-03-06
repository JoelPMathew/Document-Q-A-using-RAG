import React from 'react';
import { motion } from 'motion/react';

interface CurvedLoopProps {
  items: React.ReactNode[];
  radius?: number;
  duration?: number;
  className?: string;
}

export default function CurvedLoop({ 
  items, 
  radius = 150, 
  duration = 20,
  className = "" 
}: CurvedLoopProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: radius * 2.5, height: radius * 2.5 }}>
      {/* Central Hub */}
      <div className="absolute w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center z-10">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 animate-pulse" />
      </div>

      {/* Orbiting Items */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      >
        {items.map((item, index) => {
          const angle = (index / items.length) * 360;
          return (
            <div
              key={index}
              className="absolute top-1/2 left-1/2"
              style={{
                transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`,
              }}
            >
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration, repeat: Infinity, ease: "linear" }}
                className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl hover:border-emerald-500/50 transition-colors"
              >
                {item}
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      {/* Decorative Rings */}
      <div className="absolute inset-0 border border-zinc-900 rounded-full opacity-50 pointer-events-none" />
      <div className="absolute inset-4 border border-zinc-900 rounded-full opacity-30 pointer-events-none" />
    </div>
  );
}
