import React from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Home from './components/Home'
import CampusMap from './components/CampusMap'
import BuildingViewer from './components/BuildingViewer'
import CoordinatePicker from './components/CoordinatePicker'
import ExploreCampus from './pages/ExploreCampus'
import './index.css'

function CampusMapPage() {
  const navigate = useNavigate()

  return <CampusMap onBuildingClick={({ id }) => navigate(`/building/${id}`)} />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<ExploreCampus />} />
        <Route path="/map" element={<CampusMapPage />} />
        <Route path="/building/:id" element={<BuildingViewer />} />
        <Route path="/picker" element={<CoordinatePicker />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
