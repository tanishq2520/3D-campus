import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  const handleMapNavigation = () => {
    navigate('/map');
  };

  const handleExploreNavigation = () => {
    navigate('/explore');
  };

  return (
    <div className="home-container">
      <div className="left-panel">
        <div className="ring-container">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
          <div className="map-wrapper">
            <img src="/map.jpeg" alt="Geeta University campus map" />
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="title-block">
          <p className="eyebrow">Panipat, Haryana</p>
          <h1>
            Geeta
            <br />
            University
          </h1>
          <p className="tagline">Digital Twin Experience</p>
        </div>

        <p className="description">
          Explore the campus in immersive 3D. Click any building on the interactive map
          to view its model, facilities, and departments.
        </p>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">32+</div>
            <div className="stat-label">Buildings</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">40 ac</div>
            <div className="stat-label">Campus Area</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">18+</div>
            <div className="stat-label">Departments</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">2022</div>
            <div className="stat-label">Established</div>
          </div>
        </div>

        <div className="cta-group">
          <button type="button" className="explore-btn" onClick={handleExploreNavigation}>
            Explore Campus →
          </button>
          <button type="button" className="cta-button outline-button" onClick={handleMapNavigation}>
            View Full Map
          </button>
        </div>
      </div>
    </div>
  );
}
