import { useEffect, useState } from 'react';
import './DepartmentSelector.css';

export default function DepartmentSelector({ departments, onSelect }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="department-selector-page">
      <div className="explore-bg-grid" aria-hidden="true"></div>
      <div className={`department-selector-panel ${mounted ? 'is-visible' : ''}`}>
        <p className="selector-kicker">Select a block or facility to explore</p>
        <h1>Explore Campus</h1>

        <div className="department-card-grid">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="department-select-card"
              style={{
                '--dept-color': dept.color,
              }}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(dept)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(dept);
                }
              }}
            >
              <span className="department-select-dot" aria-hidden="true"></span>
              <span>{dept.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
