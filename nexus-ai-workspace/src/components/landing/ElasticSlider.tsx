import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  title: string;
  description: string;
  image: string;
}

export default function ElasticSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % slides.length);
  const prev = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-0"
        >
          <img 
            src={slides[index].image} 
            alt={slides[index].title}
            className="w-full h-full object-cover opacity-50"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent p-12 flex flex-col justify-end">
            <motion.h3 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-bold text-white mb-2"
            >
              {slides[index].title}
            </motion.h3>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-zinc-400 max-w-md"
            >
              {slides[index].description}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-8 right-8 flex gap-2">
        <button onClick={prev} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white">
          <ChevronLeft size={20} />
        </button>
        <button onClick={next} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
