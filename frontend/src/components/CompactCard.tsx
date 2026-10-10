'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, User } from 'lucide-react';
import { StatusDiode } from './StatusDiode';

export interface CompactCardData {
  id: string;
  badgeId: string; // e.g. IDSMARTPHONE, IDCASESTUDY, IDBROKER
  coordinate?: string; // e.g. 12.5
  title: string;
  subtitle: string;
  imageSrc: string;
  ctaText: string;
  ctaHref?: string;
  pagination: string; // e.g. 1/5, 2/5
}

interface CompactCardProps {
  card: CompactCardData;
  onCtaClick?: () => void;
}

export const CompactCard: React.FC<CompactCardProps> = ({ card, onCtaClick }) => {
  return (
    <div className="flex flex-col items-center select-none">
      {/* Phone-frame Card Container: Fixed ~320px width, sharp corners, hairline border */}
      <div className="w-[320px] bg-white border border-[#DADAD8] flex flex-col justify-between overflow-hidden shadow-none rounded-[1px] relative compact-card-container">
        {/* Faint corner brackets */}
        <div className="corner-bracket-tl" />
        <div className="corner-bracket-tr" />
        <div className="corner-bracket-bl" />
        <div className="corner-bracket-br" />

        {/* 1. Mini Nav Header inside the card */}
        <div className="px-4 py-2.5 border-b border-[#DADAD8]/60 bg-[#FAF9F7] flex items-center justify-between">
          <div className="flex flex-col leading-none">
            <span className="font-display font-extrabold text-[10px] tracking-[0.2em] text-[#1A1A1A] uppercase">
              DETROIT
            </span>
            <span className="font-subtitle font-light text-[6.5px] tracking-[0.24em] text-[#8A8A8A] uppercase mt-0.5">
              BECOME HUMAN
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#8A8A8A]">
            <Search className="w-2.5 h-2.5" />
            <User className="w-2.5 h-2.5" />
            <StatusDiode size="sm" interactive={false} />
          </div>
        </div>

        {/* Mini Sub-Nav Links */}
        <div className="px-4 py-1.5 border-b border-[#DADAD8]/40 bg-white flex items-center justify-between text-[8px] font-mono tracking-wider text-[#8A8A8A] uppercase">
          <span className="text-[#1A1A1A] font-semibold">LORE</span>
          <span className="hover:text-[#1A1A1A]">CHARACTERS</span>
          <span className="hover:text-[#1A1A1A]">GALLERY</span>
        </div>

        {/* 2. Title + One-line Description */}
        <div className="p-4 bg-white">
          <h4 className="font-display text-lg font-bold uppercase tracking-wide text-[#1A1A1A]">
            {card.title}
          </h4>
          <p className="text-[10.5px] text-[#8A8A8A] mt-0.5 leading-snug line-clamp-2">
            {card.subtitle}
          </p>
        </div>

        {/* 3. Full-bleed Image Container */}
        <div className="relative w-full h-[290px] bg-[#ECECE8] overflow-hidden">
          <Image
            src={card.imageSrc}
            alt={card.title}
            fill
            className="object-cover object-center duotone-cyberlife card-image-desaturate hover:scale-105 transition-all duration-300"
          />

          {/* CTA Button Overlay with Triangle-Fold Corner Accent */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            {card.ctaHref ? (
              <Link
                href={card.ctaHref}
                className="w-full py-2.5 px-4 btn-folded-faceted flex items-center justify-center font-mono font-medium text-[11px] uppercase tracking-[0.14em] text-white shadow-none"
              >
                <span>{card.ctaText}</span>
              </Link>
            ) : (
              <button
                onClick={onCtaClick}
                className="w-full py-2.5 px-4 btn-folded-faceted flex items-center justify-center font-mono font-medium text-[11px] uppercase tracking-[0.14em] text-white shadow-none"
              >
                <span>{card.ctaText}</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. Footer Strip inside Card */}
        <div className="px-4 py-2 bg-[#FAF9F7] border-t border-[#DADAD8] flex items-center justify-between text-[8.5px] font-mono text-[#8A8A8A] uppercase">
          <div className="flex flex-col">
            <span className="font-semibold text-[#1A1A1A] tracking-wider">CYBERLIFE</span>
            {/* Small yellow accent underline */}
            <div className="w-10 h-[1.5px] bg-[#FFF500] mt-0.5" />
          </div>

          <span className="font-mono text-[#8A8A8A]">{card.pagination}</span>

          <span className="tracking-widest">
            RU <strong className="text-[#1A1A1A]">EN</strong>
          </span>
        </div>
      </div>

      {/* 5. Small ID + Product-Type Label beneath the card */}
      <div className="mt-2.5 flex items-center justify-between w-full px-1 text-[10px] font-mono tracking-widest text-[#00D1FF] uppercase font-medium">
        <span>{card.badgeId}</span>
        {card.coordinate && (
          <span className="text-[#8A8A8A] text-[9px]">{card.coordinate}</span>
        )}
      </div>
    </div>
  );
};
