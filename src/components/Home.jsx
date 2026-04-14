import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const BUILDINGS = [
  { id: 'admin-block', label: 'Admin Block',      x: 46, y: 14, w: 7,  h: 6 },
  { id: 'f-block',     label: 'F Block',           x: 37, y: 14, w: 6,  h: 7 },
  { id: 'c-block',     label: 'C Block',           x: 48, y: 25, w: 10, h: 4 },
  { id: 'a-block',     label: 'A Block',           x: 47, y: 30, w: 4,  h: 7 },
  { id: 'b-block',     label: 'B Block',           x: 53, y: 30, w: 4,  h: 7 },
  { id: 'incubation',  label: 'Incubation Center', x: 37, y: 23, w: 6,  h: 8 },
  { id: 'cafeteria',   label: 'Cafeteria',         x: 35, y: 32, w: 7,  h: 5 },
  { id: 'd-block',     label: 'D Block',           x: 35, y: 40, w: 7,  h: 5 },
  { id: 'dsw',         label: 'DSW',               x: 47, y: 40, w: 13, h: 6 },
  { id: 'hostel',      label: 'Hostel Block',      x: 70, y: 15, w: 7,  h: 2 },
  { id: 'hostel',      label: 'Hostel Block',      x: 65, y: 31, w: 3,  h: 5 },
  { id: 'hostel',      label: 'Hostel Block',      x: 74, y: 31, w: 3,  h: 5 },
];

export default function Home() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [zoomed, setZoomed] = useState(false);
  const [wheelZoom, setWheelZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

  useEffect(() => {
    const mapEl = mapRef.current;
    if (!mapEl) return;

    const handleWheel = (e) => {
      if (!zoomed) return;
      e.preventDefault(); // Stop page scrolling while zooming map
      // Modify zoom scale between 1x and 4x
      setWheelZoom((prev) => Math.min(Math.max(1, prev - e.deltaY * 0.003), 4));
    };

    mapEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => mapEl.removeEventListener('wheel', handleWheel);
  }, [zoomed]);

  const handleBuildingClick = (id) => {
    if (zoomed) navigate(`/building/${id}`);
  };

  return (
    <div className="home-container" ref={containerRef}>
      <div className="left-panel">
        <div className="ring-container">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>

          {/* Map wrapper — zoom on hover + wheel zoom + panning via React state */}
          <div
            ref={mapRef}
            className={`map-wrapper${zoomed ? ' map-zoomed' : ''}`}
            style={zoomed ? { 
              transform: `translate(calc(-36% + ${pan.x}px), calc(-50% + ${pan.y}px)) perspective(800px) rotateX(2deg) rotateZ(0deg) scale(${wheelZoom})`,
              cursor: isDragging ? 'grabbing' : 'grab',
              transition: isDragging || wheelZoom > 1 ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.5s ease'
            } : {}}
            onMouseEnter={() => setZoomed(true)}
            onMouseDown={(e) => {
              if (!zoomed) return;
              setIsDragging(true);
              dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => { 
              setZoomed(false); 
              setWheelZoom(1); 
              setIsDragging(false);
              setPan({ x: 0, y: 0 });
              setTooltip({ show: false, text: '', x: 0, y: 0 }); 
            }}
            onMouseMove={(e) => { 
              if (tooltip.show) setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY })); 
              if (isDragging) {
                setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
              }
            }}
          >
            <img src="/map.jpeg" alt="Geeta University campus map" />

            {/* Pseudo-3D building lift SVG — decorative when not zoomed */}
            <svg
              className="map-buildings-overlay"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{ pointerEvents: zoomed ? 'all' : 'none' }}
            >
              {BUILDINGS.map((b, i) => (
                <g
                  key={i}
                  style={{ cursor: zoomed ? 'pointer' : 'default' }}
                  onClick={() => handleBuildingClick(b.id)}
                  onMouseEnter={(e) => zoomed && setTooltip({ show: true, text: b.label, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                >
                  {/* Drop shadow */}
                  <rect x={b.x + 0.4} y={b.y + 0.8} width={b.w} height={b.h}
                    fill="rgba(0,0,0,0.5)" rx="0.3" />
                  {/* Building face */}
                  <rect x={b.x} y={b.y - 1.2} width={b.w} height={b.h}
                    fill={zoomed ? 'rgba(0,229,200,0.22)' : 'rgba(0,229,200,0.12)'}
                    stroke="rgba(0,229,200,0.6)"
                    strokeWidth="0.3" rx="0.3" />
                  {/* Side wall */}
                  <polygon
                    points={`${b.x+b.w},${b.y-1.2} ${b.x+b.w+0.4},${b.y-0.4} ${b.x+b.w+0.4},${b.y+b.h-0.4} ${b.x+b.w},${b.y+b.h-1.2}`}
                    fill="rgba(0,180,160,0.2)" stroke="rgba(0,229,200,0.3)" strokeWidth="0.2" />
                </g>
              ))}
            </svg>

            {/* Zoom hint label */}
            {!zoomed && (
              <div className="map-zoom-hint">Hover to zoom &amp; click buildings</div>
            )}
          </div>

          {/* Tooltip — shown when zoomed and hovering a building */}
          {tooltip.show && (
            <div className="home-map-tooltip" style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}>
              {tooltip.text}
            </div>
          )}
        </div>
      </div>

      {/* Right panel slides out dynamically based on map zoom */}
      <div 
        className="right-panel"
        style={{
          transform: zoomed ? `translateX(${120 + (wheelZoom - 1) * 250}px)` : 'translateX(0)',
          opacity: zoomed ? Math.max(0, 0.6 - (wheelZoom - 1) * 0.4) : 1,
        }}
      >
        <div className="title-block">
          <p className="eyebrow">Panipat, Haryana</p>
          <h1>Geeta<br />University</h1>
          <p className="tagline">Digital Twin Experience</p>
        </div>

        <p className="description">
          Explore the campus in immersive 3D. Hover the map and click any building
          to view its 3D model, facilities, and departments.
        </p>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-number">32+</div><div className="stat-label">Buildings</div></div>
          <div className="stat-card"><div className="stat-number">40 ac</div><div className="stat-label">Campus Area</div></div>
          <div className="stat-card"><div className="stat-number">18+</div><div className="stat-label">Departments</div></div>
          <div className="stat-card"><div className="stat-number">2022</div><div className="stat-label">Established</div></div>
        </div>

        <div className="cta-group">
          <button type="button" className="cta-button primary-button" onClick={() => navigate('/map')}>
            Explore Campus
          </button>
        </div>
      </div>
    </div>
  );
}