"use client";

import React, { useState } from 'react';
import { soundFx } from '@/lib/audio';

interface BottomBarProps {
  pageNumber: string;
  lang: string;
  onSelectLang: (lang: string) => void;
  timelineTimecode: string;
  blueprintActive?: boolean;
  onToggleBlueprint?: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  pageNumber,
  lang,
  onSelectLang,
  timelineTimecode,
  blueprintActive,
  onToggleBlueprint
}) => {
  const [sfxOn, setSfxOn] = useState(true);
  const [progress, setProgress] = useState(48);

  const handleSfxToggle = () => {
    const next = !sfxOn;
    setSfxOn(next);
    soundFx.setEnabled(next);
    if (next) soundFx.play('chime');
  };

  const handleBarcodeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
    setProgress(pct);
    soundFx.play('hover');
  };

  return (
    <footer className="cyber-bottom-bar">
      {/* Store / CyberLife Branding & Blueprint Prototype Badge (Image 1) */}
      <div className="bottom-brand-col">
        <span className="bottom-store-tag">STORE</span>
        <span className="bottom-cyberlife-logo">CYBERLIFE</span>
        {onToggleBlueprint && (
          <button
            className={`btn-blueprint-bottom-badge ${blueprintActive ? 'active' : ''}`}
            onClick={() => {
              soundFx.play('chime');
              onToggleBlueprint();
            }}
            title="Toggle 12-Column Blueprint Grid Overlay (Image 1)"
          >
            GRID 12
          </button>
        )}
      </div>

      {/* Barcode Audio / Chronometer Timeline (Images 1, 2, 3) */}
      <div className="bottom-timeline-strip" onClick={handleBarcodeClick} title="Scrub Timeline Chronometer">
        <div className="timeline-header-row">
          <span className="timeline-label">TIME LINE</span>
          <span className="timeline-timecode">{timelineTimecode}</span>
        </div>
        <div className="timeline-barcode-canvas">
          <div className="timeline-progress-fill" style={{ width: `${progress}%` }}></div>
          <div className="timeline-cursor-marker" style={{ left: `${progress}%` }}></div>
        </div>
      </div>

      {/* Right Indicators */}
      <div className="bottom-status-col">
        <button
          className={`sfx-toggle-btn ${sfxOn ? 'active' : ''}`}
          onClick={handleSfxToggle}
          title="Toggle Cybernetic Audio SFX"
        >
          {sfxOn ? 'SFX: ON' : 'SFX: OFF'}
        </button>

        <span className="status-page-number">{pageNumber}</span>

        <div className="language-switch-group">
          <button
            className={`lang-btn ${lang === 'RU' ? 'active' : ''}`}
            onClick={() => {
              soundFx.play('click');
              onSelectLang('RU');
            }}
          >
            RU
          </button>
          <button
            className={`lang-btn ${lang === 'EN' ? 'active' : ''}`}
            onClick={() => {
              soundFx.play('click');
              onSelectLang('EN');
            }}
          >
            EN
          </button>
        </div>
      </div>
    </footer>
  );
};
