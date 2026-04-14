import React, { useState } from 'react';
import { buildingsData } from '../data/buildingsData';
import './CampusMap.css';

export default function CampusMap({ onBuildingClick }) {
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  const handleMouseMove = (e) => {
    // Only update position if tooltip is showing to avoid unnecessary re-renders
    if (tooltip.show) {
      setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
    }
  };

  const handleMouseEnter = (e, label) => {
    setTooltip({ show: true, text: label, x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, show: false }));
  };

  return (
    <div className="campus-map-fullscreen" onMouseMove={handleMouseMove}>
      <div className="campus-map-image-wrapper">
        <img src="/map.jpeg" alt="Campus Map" className="map-image-contain" />
        <div className="map-overlay-dark"></div>
        
        <svg className="map-svg-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
          {buildingsData.map((b) => (
            <rect
              key={b.id}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              className="svg-hotspot"
              onMouseEnter={(e) => handleMouseEnter(e, b.label)}
              onMouseLeave={handleMouseLeave}
              onClick={() => onBuildingClick({ id: b.id, label: b.label, glb: b.glbFile })}
            />
          ))}
        </svg>
      </div>

      {tooltip.show && (
        <div 
          className="svg-tooltip" 
          style={{ left: tooltip.x + 15, top: tooltip.y + 15 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
