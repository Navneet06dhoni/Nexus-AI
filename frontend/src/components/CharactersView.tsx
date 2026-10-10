"use client";

import React, { useState } from 'react';
import { CharacterItem } from '@/data/cyberlifeData';
import { soundFx } from '@/lib/audio';
import { ThreeAndroidViewer } from '@/components/ThreeAndroidViewer';

interface CharactersViewProps {
  characters: CharacterItem[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  lang: string;
}

export const CharactersView: React.FC<CharactersViewProps> = ({
  characters,
  currentIndex,
  onPrev,
  onNext,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'specs'>('info');
  const character = characters[currentIndex] || characters[0];

  const handleDownload = () => {
    soundFx.play('chime');
    alert(`[CYBERLIFE PROTOCOL] Initiating secure download of dossier: ${character.dossierFilename}\nAll telemetry and biometric keys verified.`);
  };

  return (
    <section className="view-panel active">
      <div className="characters-view-layout">
        
        {/* Left Info Column */}
        <div className="character-info-column">
          <h1 className="character-main-title">{character.name}</h1>
          <p className="character-bio-text">
            {lang === 'RU' ? character.bioRu : character.bioEn}
          </p>

          <div className="character-action-row">
            <button className="btn-download-dossier" onClick={handleDownload}>
              <span className="download-icon-box">&#8595;</span>
              <span>DOWNLOAD</span>
            </button>
          </div>

          {/* Segmented Information vs Specifications Tabs with Connecting Line & Red Marker (Image 2) */}
          <div className="character-tab-selectors-container">
            <div className="character-tab-selectors">
              <button
                className={`tab-btn ${activeTab === 'info' ? 'active-info' : 'spec-tab'}`}
                onClick={() => {
                  soundFx.play('click');
                  setActiveTab('info');
                }}
              >
                INFORMATION
              </button>

              {/* Connecting Line with Red Square Accent (Image 2) */}
              <div className="tabs-connecting-line">
                <div className="tab-red-square-indicator"></div>
              </div>

              <button
                className={`tab-btn spec-tab ${activeTab === 'specs' ? 'active' : ''}`}
                onClick={() => {
                  soundFx.play('click');
                  setActiveTab('specs');
                }}
              >
                SPECIFICATIONS
              </button>
            </div>
          </div>

          {/* Specifications Drawer Panel */}
          {activeTab === 'specs' && (
            <div className="character-specs-panel">
              <div className="spec-grid">
                {character.specs.map((s, idx) => (
                  <div key={idx} className="spec-item">
                    <span className="spec-label">{s.label}</span>
                    <span className="spec-val">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center/Right 3D Visual Stage (Three.js WebGL Model) */}
        <div className="character-visual-column">
          <ThreeAndroidViewer
            characterId={character.id}
            ledColor={character.ledColor}
          />

          {/* Telemetry & Reticle Overlays (Image 2) */}
          <div className="hud-telemetry-overlay">
            <div className="hud-telemetry-box">{character.portraitTelemetry.coord}</div>
            <div className="hud-telemetry-box">{character.portraitTelemetry.code}</div>
            <div className="hud-ocular-reticle"></div>
          </div>
        </div>

      </div>
    </section>
  );
};
