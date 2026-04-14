import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './CampusMap.css';

const BUILDINGS_DATA = [
  { id:"admin-block",  label:"Admin Block",       glb:"Admin_block.glb", x:46.4, y:14.7, w:6.9,  h:6.1 },
  { id:"f-block",      label:"F Block",            glb:"F_block.glb",     x:37,   y:14.6, w:6.2,  h:6.7 },
  { id:"c-block",      label:"C Block",            glb:"C_block.glb",     x:48.6, y:25.1, w:9.6,  h:3.5 },
  { id:"a-block",      label:"A Block",            glb:"A_block.glb",     x:47.6, y:30.9, w:3.7,  h:6.5 },
  { id:"b-block",      label:"B Block",            glb:"B_block.glb",     x:53.9, y:30.2, w:3.5,  h:6.6 },
  { id:"incubation",   label:"Incubation Center",  glb:"incubation.glb",  x:37.2, y:23.2, w:5.5,  h:8   },
  { id:"cafeteria",    label:"Cafeteria",           glb:"Cafeteria.glb",   x:35.6, y:32.6, w:7.3,  h:5.1 },
  { id:"d-block",      label:"D Block",             glb:"D_block.glb",     x:35.7, y:40,   w:6.9,  h:5.1 },
  { id:"dsw",          label:"DSW",                 glb:"dsw.glb",         x:47.2, y:40.9, w:13.4, h:6.1 },
  { id:"hostel",       label:"Hostel Block",        glb:"B_hostel.glb",    x:70.4, y:15.1, w:7.3,  h:2   },
  { id:"hostel",       label:"Hostel Block",        glb:"B_hostel.glb",    x:65.9, y:31,   w:3.1,  h:5.2 },
  { id:"hostel",       label:"Hostel Block",        glb:"B_hostel.glb",    x:74.8, y:31.8, w:3,    h:5   },
  { id:"hostel",       label:"Hostel Block",        glb:"B_hostel.glb",    x:70.4, y:31.1, w:3,    h:4.8 },
  { id:"hostel",       label:"Hostel Block",        glb:"B_hostel.glb",    x:70.2, y:18.4, w:7.5,  h:2.1 },
  { id:"hostel",       label:"Hostel Block",        glb:"B_hostel.glb",    x:73.7, y:39.9, w:3.1,  h:6.6 },
  { id:"hostel",       label:"Hostel Block",        glb:"B_hostel.glb",    x:65.2, y:40.5, w:2.8,  h:6.9 },
];

export default function CampusMap({ onBuildingClick }) {
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  const containerRef = useRef(null);


  const handleMouseMove = (e) => {
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
    <div className="campus-map-fullscreen" ref={containerRef} onMouseMove={handleMouseMove}>
      
      <img 
        src="/map.jpeg" 
        alt="Campus Map" 
        className="map-image-core" 
      />

      <div 
        className="map-shared-container" 
      >
        <svg className="map-svg-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
          {BUILDINGS_DATA.map((b, index) => (
            <rect
              key={index}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              className="svg-hotspot"
              onMouseEnter={(e) => {
                handleMouseEnter(e, b.label);
                gsap.to(e.target, { z: 35, duration: 0.3, ease: 'power2.out' });
              }}
              onMouseLeave={(e) => {
                handleMouseLeave();
                gsap.to(e.target, { z: 20, duration: 0.3 });
              }}
              onClick={() => onBuildingClick({ id: b.id, label: b.label, glb: b.glb })}
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
