"use client";

import React from 'react';
import { soundFx } from '@/lib/audio';

interface RightMenuProps {
  onPrev: () => void;
  onNext: () => void;
  viewType: 'characters' | 'lore';
}

export const RightMenu: React.FC<RightMenuProps> = ({ onPrev, onNext, viewType }) => {
  return (
    <aside className="hud-right-side-dock">
      {viewType === 'characters' ? (
        /* Image 2 Character Up/Down Navigation */
        <div className="hud-side-nav-buttons characters-mode">
          <span className="nav-vertical-coord">0.1</span>
          <button
            className="btn-nav-vertical"
            onClick={() => {
              soundFx.play('chime');
              onPrev();
            }}
            title="Previous Android Model"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
          <span className="nav-vertical-code">UD0102AR</span>
          <button
            className="btn-nav-vertical"
            onClick={() => {
              soundFx.play('chime');
              onNext();
            }}
            title="Next Android Model"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      ) : (
        /* Image 3 Lore Up/Down Navigation with LOCATIONS badge */
        <div className="hud-side-nav-buttons lore-mode">
          <button
            className="btn-nav-vertical"
            onClick={() => {
              soundFx.play('chime');
              onPrev();
            }}
            title="Previous Location"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
          <span className="nav-vertical-label">LOCATIONS</span>
          <button
            className="btn-nav-vertical"
            onClick={() => {
              soundFx.play('chime');
              onNext();
            }}
            title="Next Location"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
};
