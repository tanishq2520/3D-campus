import React from 'react';
import { useNavigate } from 'react-router-dom';
import CampusMap from './CampusMap';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  const handleBuildingClick = ({ id }) => {
    navigate(`/building/${id}`);
  };

  return (
    <div className="landing-wrapper">
      <div className="left-panel">
        <div className="ring-wrapper">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>
          <div className="ring ring-4"></div>
          <CampusMap onBuildingClick={handleBuildingClick} />
        </div>
      </div>
      <div className="right-panel">
        <h1>Geeta University</h1>
        <h3>Digital Twin Experience</h3>
        <p>Explore the campus in 3D. Click any building on the map to view its model.</p>
      </div>
    </div>
  );
}
