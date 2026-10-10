"use client";

import React from 'react';
import { LoreItem } from '@/data/cyberlifeData';
import { soundFx } from '@/lib/audio';
import { ThreeDetroitCity } from '@/components/ThreeDetroitCity';

interface LoreViewProps {
  loreItems: LoreItem[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onOpenPanorama: () => void;
  onPlayVideo: () => void;
  onExplore: () => void;
  lang: string;
}

export const LoreView: React.FC<LoreViewProps> = ({
  loreItems,
  currentIndex,
  onPrev,
  onNext,
  onOpenPanorama,
  onPlayVideo,
  onExplore,
  lang
}) => {
  const item = loreItems[currentIndex] || loreItems[0];

  return (
    <section className="view-panel active">
      <div className="lore-view-layout">
        
        {/* Left Narrative Column */}
        <div className="lore-info-column">
          <h1 className="lore-main-title">{item.name}</h1>
          <p className="lore-lead-en">
            {item.textEn.split('\n\n')[0]}
          </p>
          <p className="lore-body-ru">
            {lang === 'RU' ? item.textRu : (item.textEn.split('\n\n')[1] || item.textRu)}
          </p>

          <div className="lore-action-row">
            <button
              className="btn-watch-panorama"
              onClick={() => {
                soundFx.play('click');
                onOpenPanorama();
              }}
            >
              <span className="panorama-icon-eye">&#128065;</span>
              <span>WATCH PANORAMA</span>
            </button>
            <button
              className="btn-cyber-explore"
              onClick={() => {
                soundFx.play('click');
                onExplore();
              }}
            >
              EXPLORE
            </button>
          </div>
        </div>

        {/* Center Triangular Kaleidoscope Aperture Visual (Image 3) */}
        <div className="lore-aperture-stage">
          <div className="hud-lore-coord">{item.highlightCoordinates}</div>
          
          <div className="triangle-mask-container">
            <div className="triangle-visual-frame">
              {/* Procedural 3D Detroit Megacity in Three.js */}
              <ThreeDetroitCity />
            </div>

            {/* Floating Glass Play Button (Image 3) */}
            <button
              className="triangle-play-btn"
              onClick={() => {
                soundFx.play('chime');
                onPlayVideo();
              }}
              title="Play Cinematic Sequence"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
