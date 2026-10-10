"use client";

import React from 'react';

interface BlueprintOverlayProps {
  active: boolean;
}

export const BlueprintOverlay: React.FC<BlueprintOverlayProps> = ({ active }) => {
  return (
    <div className={`blueprint-grid-overlay ${active ? 'active' : ''}`} id="blueprintGridOverlay">
      <div className="blueprint-inner-frame">
        <div className="grid-column-guides">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="grid-col-line"></div>
          ))}
        </div>

        {/* Technical Calipers from Image 1 Wireframe */}
        <div className="grid-crosshair caliper-top-left hud-measure-badge">60.0 // 13.0</div>
        <div className="grid-crosshair caliper-top-right hud-measure-badge">02.3</div>
        <div className="grid-crosshair caliper-mid-left hud-measure-badge">13.0</div>
        <div className="grid-crosshair caliper-mid-center hud-measure-badge">43.7</div>
        <div className="grid-crosshair caliper-mid-right hud-measure-badge">17.0</div>
        <div className="grid-crosshair caliper-bottom-left hud-measure-badge">15.0 // TIME LINE</div>
        <div className="grid-crosshair caliper-bottom-right hud-measure-badge">IDPROTOTYPE 12 Columns / 1240 px</div>

        {/* Image 1 Interactive Reticle Block Wireframe */}
        <div className="hud-interactive-block-blueprint">
          <div className="hud-block-label">INTERACTIVE BLOCK</div>
          <div className="hud-red-corner"></div>
        </div>
      </div>
    </div>
  );
};
