import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Note: SplitText is a paid GSAP plugin. 
// For this environment, we'll use a custom simplified split implementation 
// to ensure it works without the paid plugin while keeping the requested API.

const SplitText = ({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete = () => {}
}) => {
  const ref = useRef(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
    } else {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    }
  }, []);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;
      if (animationCompletedRef.current) return;
      
      const el = ref.current;
      const content = el.innerText;
      el.innerHTML = ''; // Clear for splitting

      let targets: HTMLElement[] = [];
      
      if (splitType.includes('chars')) {
        const chars = content.split('');
        chars.forEach(char => {
          const span = document.createElement('span');
          span.style.display = 'inline-block';
          span.style.whiteSpace = char === ' ' ? 'pre' : 'normal';
          span.innerText = char;
          span.className = 'split-char';
          el.appendChild(span);
          targets.push(span);
        });
      } else if (splitType.includes('words')) {
        const words = content.split(' ');
        words.forEach((word, i) => {
          const span = document.createElement('span');
          span.style.display = 'inline-block';
          span.innerText = word + (i < words.length - 1 ? ' ' : '');
          span.className = 'split-word';
          el.appendChild(span);
          targets.push(span);
        });
      }

      const startPct = (1 - threshold) * 100;
      const start = `top ${startPct}%`;

      gsap.fromTo(
        targets,
        { ...from },
        {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
          },
          onComplete: () => {
            animationCompletedRef.current = true;
            onCompleteRef.current?.();
          },
        }
      );
    },
    {
      dependencies: [text, fontsLoaded],
      scope: ref
    }
  );

  const Tag = tag as any || 'p';
  return (
    <Tag 
      ref={ref} 
      className={`split-parent ${className}`}
      style={{ 
        textAlign, 
        display: 'inline-block',
        whiteSpace: 'normal',
        wordWrap: 'break-word'
      }}
    >
      {text}
    </Tag>
  );
};

export default SplitText;
