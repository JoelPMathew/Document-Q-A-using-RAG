import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

export default function Counter({ value, duration = 2 }: { value: number, duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, { duration });
    return controls.stop;
  }, [value, duration]);

  useEffect(() => {
    return rounded.on("change", (v) => setDisplayValue(v));
  }, [rounded]);

  return <span>{displayValue.toLocaleString()}</span>;
}
