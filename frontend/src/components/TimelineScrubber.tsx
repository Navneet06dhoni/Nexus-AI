'use client';

import React, { useState, useEffect } from 'react';

interface TimelineScrubberProps {
  initialMarkerPos?: number; // 0 to 100 percentage
  timestamp?: string;
  markerColor?: 'yellow' | 'cyan';
  syncWithScroll?: boolean;
  drawIn?: boolean;
  className?: string;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  initialMarkerPos = 42,
  timestamp = '01.34',
  markerColor = 'yellow',
  syncWithScroll = true,
  drawIn = false,
  className = '',
}) => {
  const [markerPercent, setMarkerPercent] = useState<number>(initialMarkerPos);
  const [currentTimestamp, setCurrentTimestamp] = useState<string>(timestamp);

  useEffect(() => {
    if (!syncWithScroll) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        const percent = Math.min(Math.max((scrollY / maxScroll) * 100, 4), 96);
        setMarkerPercent(percent);
        
        // Calculate timestamp format 00.00 -> 03.45
        const totalSeconds = Math.round((percent / 100) * 180);
        const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        setCurrentTimestamp(`${mins}.${secs}`);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [syncWithScroll]);

  const markerBg = markerColor === 'yellow' ? 'bg-[#FFF500]' : 'bg-[#00D1FF]';
  const markerShadow = markerColor === 'yellow' ? 'shadow-[0_0_8px_#FFF500]' : 'shadow-[0_0_8px_#00D1FF]';

  return (
    <div className={`w-full select-none ${drawIn ? 'animate-scrubber-draw' : ''} ${className}`}>
      {/* Timestamp label floating right above the marker */}
      <div className="relative h-4 w-full">
        <span
          style={{ left: `${markerPercent}%` }}
          className="absolute -translate-x-1/2 text-[9px] font-mono tracking-widest text-[#8A8A8A] font-semibold transition-all duration-75"
        >
          {currentTimestamp}
        </span>
      </div>

      {/* Barcode graphic running full width with vertical marker */}
      <div className="relative h-3 w-full barcode-strip opacity-85 border-y border-[#DADAD8]/40">
        {/* Progress marker */}
        <div
          style={{ left: `${markerPercent}%` }}
          className={`absolute top-0 bottom-0 w-[2px] ${markerBg} ${markerShadow} transition-all duration-75`}
        />
      </div>
    </div>
  );
};
