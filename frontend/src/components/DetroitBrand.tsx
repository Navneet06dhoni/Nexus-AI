'use client';

import React from 'react';
import Link from 'next/link';

interface DetroitBrandProps {
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
}

export const DetroitBrand: React.FC<DetroitBrandProps> = ({
  subtitle = 'BECOME HUMAN',
  size = 'md',
  href = '/',
  className = '',
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const content = (
    <div className={`flex flex-col tracking-wider select-none ${className}`}>
      {/* DETROIT: Always Gotham Ultra / Bold (Heavy Weight) */}
      <span
        className={`font-display font-extrabold uppercase text-[#1A1A1A] leading-none ${
          isSm ? 'text-[11px] tracking-[0.22em]' : isLg ? 'text-lg tracking-[0.26em]' : 'text-sm tracking-[0.24em]'
        }`}
      >
        DETROIT
      </span>
      {/* BECOME HUMAN: Always Gotham Rounded Light / Light, small, letter-spaced, grey */}
      <span
        className={`font-subtitle font-light uppercase text-[#8A8A8A] leading-none mt-0.5 ${
          isSm ? 'text-[7px] tracking-[0.24em]' : isLg ? 'text-[10px] tracking-[0.3em]' : 'text-[8.5px] tracking-[0.28em]'
        }`}
      >
        {subtitle}
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-85 transition-opacity inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
};
