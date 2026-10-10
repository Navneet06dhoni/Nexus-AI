'use client';

import React from 'react';
import Link from 'next/link';
import { Search, User } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F0F0EE] p-[28px] flex flex-col justify-center items-center select-none font-sans">
      {/* Outer Floating Panel with 1px Border */}
      <div className="relative w-full h-full bg-[#FFFFFF] border border-[#DADAD8] flex flex-col justify-between overflow-hidden shadow-none">
        
        {/* Camera Viewfinder L-Corner Marks */}
        <div className="corner-bracket-tl" />
        <div className="corner-bracket-tr" />
        <div className="corner-bracket-bl" />
        <div className="corner-bracket-br" />

        {/* =========================================================================
            1. BACKGROUND TEXTURE LAYER
            ========================================================================= */}
        {/* Faceted Crystal / Polygon Shards in Background (Faint Geometric Mesh) */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40" 
          viewBox="0 0 1600 900" 
          preserveAspectRatio="none"
        >
          <polygon points="0,0 450,150 200,450 0,380" fill="#F4F4F2" stroke="#E6E6E3" strokeWidth="0.8" />
          <polygon points="450,150 820,80 680,480 200,450" fill="#F7F7F5" stroke="#E6E6E3" strokeWidth="0.8" />
          <polygon points="820,80 1250,220 1100,520 680,480" fill="#EFEFEA" stroke="#E6E6E3" strokeWidth="0.8" />
          <polygon points="1250,220 1600,100 1600,420 1100,520" fill="#F4F4F2" stroke="#E6E6E3" strokeWidth="0.8" />
          <polygon points="200,450 680,480 520,780 0,680" fill="#F0F0EC" stroke="#E6E6E3" strokeWidth="0.8" />
          <polygon points="680,480 1100,520 980,850 520,780" fill="#F6F6F3" stroke="#E6E6E3" strokeWidth="0.8" />
          <polygon points="1100,520 1600,420 1600,820 980,850" fill="#ECECE7" stroke="#E6E6E3" strokeWidth="0.8" />
          <polygon points="0,680 520,780 320,900 0,900" fill="#F4F4F2" stroke="#E6E6E3" strokeWidth="0.8" />
          <polygon points="520,780 980,850 850,900 320,900" fill="#EFEFEA" stroke="#E6E6E3" strokeWidth="0.8" />
          <polygon points="980,850 1600,820 1600,900 850,900" fill="#F3F3F0" stroke="#E6E6E3" strokeWidth="0.8" />
        </svg>

        {/* Faint Red/Pink Blueprint Grid Lines & Glitch Coordinate Lines */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none" 
          viewBox="0 0 1600 900" 
          preserveAspectRatio="none"
        >
          {/* Subtle Horizontal Red Grid Lines */}
          <line x1="0" y1="260" x2="1600" y2="260" stroke="#E8453C" strokeOpacity="0.1" strokeWidth="1" />
          <line x1="0" y1="460" x2="1600" y2="460" stroke="#E8453C" strokeOpacity="0.14" strokeWidth="1" />
          <line x1="0" y1="680" x2="1600" y2="680" stroke="#E8453C" strokeOpacity="0.1" strokeWidth="1" />

          {/* Subtle Vertical Red Grid Lines */}
          <line x1="420" y1="0" x2="420" y2="900" stroke="#E8453C" strokeOpacity="0.12" strokeWidth="1" />
          <line x1="800" y1="0" x2="800" y2="900" stroke="#E8453C" strokeOpacity="0.16" strokeWidth="1" />
          <line x1="1180" y1="0" x2="1180" y2="900" stroke="#E8453C" strokeOpacity="0.12" strokeWidth="1" />
        </svg>

        {/* Floating Red Glitch Coordinate Numbers */}
        <div className="absolute top-[448px] left-[375px] font-mono text-[11px] text-[#E8453C] opacity-85 pointer-events-none tracking-wider">
          34.9
        </div>
        <div className="absolute bottom-[205px] right-[405px] font-mono text-[11px] text-[#E8453C] opacity-85 pointer-events-none tracking-wider">
          00:2er0;
        </div>

        {/* Large Faint Ghost Text "EIROR" Bleeding in the Background */}
        <div 
          className="absolute top-[425px] right-[24%] text-[56px] font-mono tracking-[0.2em] text-[#C0C0BA] opacity-35 pointer-events-none uppercase font-light"
        >
          EIROR
        </div>

        {/* Subtle Pixel Glitch Noise Blocks behind 404 block */}
        <div className="absolute top-[340px] left-[50%] -translate-x-[50%] w-[580px] h-[160px] pointer-events-none opacity-20 flex flex-wrap gap-2 overflow-hidden">
          {Array.from({ length: 48 }).map((_, i) => (
            <div 
              key={i} 
              className="bg-[#E8453C]" 
              style={{ 
                width: `${(i % 5 + 2) * 8}px`, 
                height: `${(i % 3 + 1) * 6}px`, 
                opacity: (i % 4) * 0.15 
              }} 
            />
          ))}
        </div>

        {/* =========================================================================
            2. TOP NAV BAR (Glitched Detroit Interface)
            ========================================================================= */}
        <header className="relative z-10 h-16 border-b border-[#DADAD8] bg-white/75 backdrop-blur-[1px] px-8 flex items-center justify-between">
          {/* Left: Detroit Wordmark with Glitched Subtitle */}
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-[0.25em] text-[#1A1A1A] uppercase">
              DETROIT
            </span>
            <span className="text-[9px] font-mono tracking-[0.22em] text-[#8A8A8A] uppercase">
              8 E C 0 R 3   H U W A N
            </span>
          </div>

          {/* Center: Glitched Nav Links ("L0ve", "Charac;er5", "6a1lary") */}
          <nav className="flex items-center gap-12 text-xs font-mono tracking-[0.14em] uppercase text-[#9A9A9A]">
            <span className="cursor-default hover:text-[#1A1A1A] transition-colors">
              L0ve
            </span>
            <span className="cursor-default hover:text-[#1A1A1A] transition-colors">
              Charac;er5
            </span>
            <span className="cursor-default hover:text-[#1A1A1A] transition-colors">
              6a1lary
            </span>
          </nav>

          {/* Right: Search, User Profile, and Malfunctioning Overheating Status Indicator */}
          <div className="flex items-center gap-6 text-[#1A1A1A]">
            <Search className="w-4 h-4 text-[#8A8A8A]" />
            <User className="w-4 h-4 text-[#8A8A8A]" />

            {/* Overheating Ring: Red/Orange Gradient Stroke, Hollow Ring */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="malfunctionRing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E8453C" />
                  <stop offset="100%" stopColor="#FF7A00" />
                </linearGradient>
              </defs>
              <circle 
                cx="12" 
                cy="12" 
                r="9" 
                fill="none" 
                stroke="url(#malfunctionRing)" 
                strokeWidth="2.5" 
                className="animate-pulse"
              />
            </svg>
          </div>
        </header>

        {/* =========================================================================
            3. CENTER CONTENT BLOCK
            ========================================================================= */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center -mt-6">
          <div className="w-[560px] flex flex-col items-center">
            
            {/* Top Solid Red Rule (2px, #E8453C) */}
            <div className="w-full h-[2px] bg-[#E8453C]" />

            {/* Headline: "404" Bold Red + "NOT FOUND" Regular Weight Light Grey */}
            <div className="my-5 flex items-baseline justify-center tracking-tight select-none">
              <span className="text-[64px] font-bold text-[#E8453C] leading-none">
                404
              </span>
              <span className="text-[64px] font-light text-[#C4C4BF] leading-none tracking-[0.02em] ml-4 uppercase">
                NOT FOUND
              </span>
            </div>

            {/* Bottom Red Rule with Coordinate Tag Floating Just Above Right End */}
            <div className="relative w-full">
              <span className="absolute -top-4 right-0 font-mono text-[10px] text-[#E8453C] tracking-wider">
                083.5
              </span>
              <div className="w-full h-[2px] bg-[#E8453C]" />
            </div>

            {/* Diagonal Red-Striped Caution Hazard Band (45° Stripes, ~30px Tall) */}
            <div 
              className="w-full h-[32px] mt-4 opacity-80"
              style={{
                background: `repeating-linear-gradient(
                  45deg,
                  #E8453C 0px,
                  #E8453C 6px,
                  transparent 6px,
                  transparent 15px
                )`
              }}
            />

            {/* CTA Button with Dev-Mode Selection State Overlay */}
            <div className="mt-8 relative inline-block">
              {/* Cyan Dev Selection Outline with 4 Corner Square Resize Handles */}
              <div className="absolute -inset-[5px] border border-[#00C2E0] pointer-events-none">
                {/* 4 Corner Resize Dots */}
                <div className="absolute -top-[3px] -left-[3px] w-[6px] h-[6px] bg-[#00C2E0]" />
                <div className="absolute -top-[3px] -right-[3px] w-[6px] h-[6px] bg-[#00C2E0]" />
                <div className="absolute -bottom-[3px] -left-[3px] w-[6px] h-[6px] bg-[#00C2E0]" />
                <div className="absolute -bottom-[3px] -right-[3px] w-[6px] h-[6px] bg-[#00C2E0]" />
              </div>

              {/* Tiny Cyan Mono Layer Placeholder Tag Below-Left */}
              <div className="absolute -bottom-5 left-0 font-mono text-[9px] text-[#00C2E0] opacity-80 tracking-wider pointer-events-none">
                ndikvbmt
              </div>

              {/* The Actual HOME Button */}
              <Link
                href="/"
                className="block bg-[#2B2B2B] hover:bg-[#1A1A1A] text-white px-10 py-2.5 text-xs font-mono font-medium tracking-[0.18em] uppercase rounded-[1px] transition-colors"
              >
                HOME
              </Link>
            </div>

          </div>
        </main>

        {/* =========================================================================
            4. FOOTER (Glitched CyberLife Brand, Barcode with Red Pin, RU / 3N)
            ========================================================================= */}
        <footer className="relative z-10 h-14 border-t border-[#DADAD8] bg-white/80 px-8 flex items-center justify-between">
          {/* Left: Glitched CyberLife Wordmark ("CY;B3RL1FE") */}
          <div className="text-xs font-bold tracking-[0.2em] text-[#1A1A1A] uppercase font-mono">
            CY;B3RL1FE
          </div>

          {/* Center: Full-Width Literal Barcode with Corrupted Red/Orange Segment & Pin */}
          <div className="relative flex-1 max-w-[580px] mx-8 flex items-center h-4">
            {/* Left Black Barcode Segment */}
            <div 
              className="flex-1 h-3"
              style={{
                background: `repeating-linear-gradient(
                  90deg,
                  #1A1A1A 0px,
                  #1A1A1A 2px,
                  transparent 2px,
                  transparent 4px,
                  #1A1A1A 4px,
                  #1A1A1A 6px,
                  transparent 6px,
                  transparent 9px,
                  #1A1A1A 9px,
                  #1A1A1A 12px,
                  transparent 12px,
                  transparent 14px
                )`
              }}
            />

            {/* Corrupted Red/Orange Barcode Segment */}
            <div 
              className="w-16 h-3 relative mx-1"
              style={{
                background: `repeating-linear-gradient(
                  90deg,
                  #E8453C 0px,
                  #E8453C 2px,
                  transparent 2px,
                  transparent 4px,
                  #FF7A00 4px,
                  #FF7A00 7px,
                  transparent 7px,
                  transparent 9px
                )`
              }}
            >
              {/* Red Vertical Marker / Pin Dropped at Corrupted Point */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[2px] h-3 bg-[#E8453C]" />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#E8453C]" />
            </div>

            {/* Right Black Barcode Segment */}
            <div 
              className="flex-1 h-3"
              style={{
                background: `repeating-linear-gradient(
                  90deg,
                  #1A1A1A 0px,
                  #1A1A1A 2px,
                  transparent 2px,
                  transparent 4px,
                  #1A1A1A 4px,
                  #1A1A1A 7px,
                  transparent 7px,
                  transparent 9px
                )`
              }}
            />
          </div>

          {/* Right: "RU" in Grey + "3N" in Bold Black */}
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest">
            <span className="text-[#9A9A9A]">RU</span>
            <span className="text-[#1A1A1A] font-bold">3N</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
