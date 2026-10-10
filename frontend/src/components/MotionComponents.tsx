'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * CalibratingText:
 * Simulates high-precision scientific instruments calibrating on boot or scroll entry.
 * Over ~800ms, counts numeric tokens from 0 up to their final value with 0% bounce (ease-out deceleration).
 */
interface CalibratingTextProps {
  finalText: string; // e.g. "85.9 // VECTOR 45°", "05.05 // LAT 42.3314 N", "0.1 // 00010263"
  duration?: number; // ms, default 800ms
  triggerOnScroll?: boolean;
  className?: string;
}

export const CalibratingText: React.FC<CalibratingTextProps> = ({
  finalText,
  duration = 800,
  triggerOnScroll = false,
  className = '',
}) => {
  const [displayText, setDisplayText] = useState<string>(() => {
    // Initial zeroed state
    return zeroOutText(finalText);
  });
  const [hasTriggered, setHasTriggered] = useState<boolean>(!triggerOnScroll);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!triggerOnScroll) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [triggerOnScroll]);

  useEffect(() => {
    if (!hasTriggered) return;

    let startTime: number | null = null;
    let frameId: number;

    const animate = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Deceleration curve cubic-bezier(0.2, 0, 0, 1) approximation: 1 - (1 - p)^3
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayText(interpolateText(finalText, eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setDisplayText(finalText);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [hasTriggered, finalText, duration]);

  return (
    <span ref={containerRef} className={`font-mono select-none ${className}`}>
      {displayText}
    </span>
  );
};

// Helper: zeros out all numbers in the string matching format
function zeroOutText(text: string): string {
  return text.replace(/(\d+(?:\.\d+)?)/g, (match) => {
    if (match.includes('.')) {
      const parts = match.split('.');
      return `${'0'.repeat(parts[0].length)}.${'0'.repeat(parts[1].length)}`;
    }
    return '0'.repeat(match.length);
  });
}

// Helper: smoothly interpolates numeric values while preserving prefix/suffix formatting
function interpolateText(targetText: string, progress: number): string {
  return targetText.replace(/(\d+(?:\.\d+)?)/g, (match) => {
    const targetVal = parseFloat(match);
    const currentVal = targetVal * progress;

    if (match.includes('.')) {
      const decimals = match.split('.')[1].length;
      const integerDigits = match.split('.')[0].length;
      const formatted = currentVal.toFixed(decimals);
      const [intPart, decPart] = formatted.split('.');
      return `${intPart.padStart(integerDigits, '0')}.${decPart}`;
    }

    const intDigits = match.length;
    const rounded = Math.floor(currentVal);
    return rounded.toString().padStart(intDigits, '0');
  });
}

/**
 * ScrollReveal:
 * Viewport entrance fade-up + in (translateY 20px -> 0, opacity 0 -> 1)
 * Trigger once, 400-500ms ease-out, with optional stagger delay.
 */
interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number; // ms
  duration?: number; // ms
  className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  duration = 450,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = domRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
      }}
      className={`transition-all ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      } ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * ScrollHairline:
 * Thin hairline section divider that draws itself left-to-right (width 0% -> 100%)
 * when scrolling into view.
 */
interface ScrollHairlineProps {
  className?: string;
  duration?: number;
}

export const ScrollHairline: React.FC<ScrollHairlineProps> = ({
  className = '',
  duration = 800,
}) => {
  const [isDrawn, setIsDrawn] = useState<boolean>(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = domRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={domRef} className={`w-full overflow-hidden ${className}`}>
      <div
        style={{
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
        }}
        className={`h-[1px] bg-[#DADAD8] w-full transform origin-left transition-transform ${
          isDrawn ? 'scale-x-100' : 'scale-x-0'
        }`}
      />
    </div>
  );
};
