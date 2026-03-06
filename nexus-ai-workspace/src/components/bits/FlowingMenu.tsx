import React, { useRef, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

interface FlowingMenuItemProps {
  text: string;
  image: string;
}

const FlowingMenuItem: React.FC<FlowingMenuItemProps> = ({ text, image }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - 100);
    mouseY.set(e.clientY - rect.top - 100);
  };

  return (
    <div 
      className="group relative py-8 border-b border-zinc-900 cursor-pointer overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <div className="flex items-center justify-between px-6 relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-zinc-500 group-hover:text-white transition-colors duration-500">
          {text}
        </h2>
        <span className="text-zinc-800 group-hover:text-emerald-500 transition-colors duration-500 font-mono text-sm">
          [ EXPLORE ]
        </span>
      </div>

      <motion.div
        style={{ x, y }}
        className="absolute top-0 left-0 w-48 h-48 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
      >
        <img 
          src={image} 
          alt={text}
          className="w-full h-full object-cover rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-700 scale-75 group-hover:scale-100"
          referrerPolicy="no-referrer"
        />
      </motion.div>
    </div>
  );
};

interface FlowingMenuProps {
  items: FlowingMenuItemProps[];
}

export default function FlowingMenu({ items }: FlowingMenuProps) {
  return (
    <div className="w-full max-w-5xl mx-auto">
      {items.map((item, index) => (
        <FlowingMenuItem key={index} text={item.text} image={item.image} />
      ))}
    </div>
  );
}
