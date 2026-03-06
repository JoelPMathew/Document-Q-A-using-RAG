import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface Step {
  title: string;
  description: string;
}

export default function Stepper({ steps, currentStep }: { steps: Step[], currentStep: number }) {
  return (
    <div className="space-y-8">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <motion.div
              initial={false}
              animate={{
                backgroundColor: i <= currentStep ? '#10b981' : '#27272a',
                scale: i === currentStep ? 1.2 : 1
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black z-10"
            >
              {i < currentStep ? <Check size={16} /> : i + 1}
            </motion.div>
            {i < steps.length - 1 && (
              <div className="w-[2px] h-full bg-zinc-800 -mt-1" />
            )}
          </div>
          <div className="pb-8">
            <h3 className={`text-sm font-semibold ${i <= currentStep ? 'text-zinc-100' : 'text-zinc-500'}`}>
              {step.title}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
