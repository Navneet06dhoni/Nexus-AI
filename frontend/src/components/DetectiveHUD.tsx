'use client';

import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

interface DetectiveHUDProps {
  onOpenStats: () => void;
  onOpenPatterns: () => void;
  onOpenLegend: () => void;
  onOpenCertificate: () => void;
  onBackToCases?: () => void;
  isFullScreenGraph?: boolean;
  patternCount: number;
}

export const DetectiveHUD: React.FC<DetectiveHUDProps> = ({
  onOpenStats,
  onOpenPatterns,
  onOpenLegend,
  onOpenCertificate,
  onBackToCases,
  isFullScreenGraph = false,
  patternCount,
}) => {
  return (
    <footer className="w-full bg-[#F2F2F0] border-t border-[#DADAD8] px-8 py-2.5 flex items-center justify-between text-[11px] font-mono select-none">
      {/* Left: Detroit Controller HUD Icons & Uppercase Grey Labels */}
      <div className="flex items-center gap-8 text-[#8A8A8A]">
        {/* World's Stats */}
        <button
          onClick={onOpenStats}
          className="flex items-center gap-2 hover:text-[#1A1A1A] transition-colors uppercase font-medium tracking-[0.08em]"
        >
          <span className="w-3.5 h-3.5 border border-[#B8B8B6] flex items-center justify-center text-[9px] text-[#1A1A1A]">
            ▲
          </span>
          <span>WORLD'S STATS</span>
        </button>

        {/* Show Legend */}
        <button
          onClick={onOpenLegend}
          className="flex items-center gap-2 hover:text-[#1A1A1A] transition-colors uppercase font-medium tracking-[0.08em]"
        >
          <span className="w-3.5 h-3.5 border border-[#B8B8B6] flex items-center justify-center text-[9px] text-[#1A1A1A]">
            ■
          </span>
          <span>SHOW LEGEND</span>
        </button>

        {/* Suspicious Patterns Alert */}
        <button
          onClick={onOpenPatterns}
          className="flex items-center gap-2 text-[#D6483C] hover:text-[#B91C1C] transition-colors uppercase font-medium tracking-[0.08em]"
        >
          <Activity className="w-3.5 h-3.5 text-[#D6483C]" />
          <span>SUSPICIOUS PATTERNS ({patternCount})</span>
        </button>

        {/* Back to Cases (when in full screen graph mode) */}
        {isFullScreenGraph && onBackToCases && (
          <button
            onClick={onBackToCases}
            className="flex items-center gap-2 text-[#1BA8D1] hover:text-[#00C2E0] transition-colors uppercase font-medium tracking-[0.08em]"
          >
            <span className="w-3.5 h-3.5 rounded-full border border-[#1BA8D1] flex items-center justify-center text-[9px] text-[#1BA8D1]">
              ●
            </span>
            <span>BACK TO CASES</span>
          </button>
        )}
      </div>

      {/* Right: Technical Badges, Legal BSA Admissibility & Pagination */}
      <div className="flex items-center gap-6 text-[#8A8A8A]">
        <button
          onClick={onOpenCertificate}
          className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-[#1BA8D1] hover:underline uppercase tracking-[0.08em]"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#1BA8D1]" />
          <span>[◎ BSA 63(4) CERTIFICATE]</span>
        </button>

        <span className="text-[#DADAD8]">|</span>

        <span className="text-[11px] font-mono tracking-[0.12em] text-[#8A8A8A]">
          1/5
        </span>

        <span className="text-[11px] font-mono tracking-[0.12em] text-[#8A8A8A]">
          IN / EN
        </span>
      </div>
    </footer>
  );
};
