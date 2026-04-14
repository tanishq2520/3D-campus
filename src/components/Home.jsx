import React from 'react';
import { useNavigate } from 'react-router-dom';
import CampusMap from './CampusMap';

export default function Home() {
  const navigate = useNavigate();

  const handleBuildingClick = ({ id }) => {
    navigate(`/building/${id}`);
  };

  return (
    <CampusMap onBuildingClick={handleBuildingClick} />
  );
}
