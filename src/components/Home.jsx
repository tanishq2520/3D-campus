import React from 'react';
import { useNavigate } from 'react-router-dom';
import CampusMap from './CampusMap';

export default function Home() {
  const navigate = useNavigate();

  const handleBuildingClick = ({ id }) => {
    navigate(`/building/${id}`);
  };

  return (
    <div className="landing-wrapper">
      <CampusMap onBuildingClick={handleBuildingClick} />
      <div className="right-panel">
        <h1>Geeta University</h1>
        <h3>Digital Twin Experience</h3>
        <p>Explore the campus in 3D. Click any building on the map to view its model.</p>
      </div>
    </div>
  );
}
