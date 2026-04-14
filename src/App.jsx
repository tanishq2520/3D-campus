import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import BuildingViewer from './components/BuildingViewer'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/building/:id" element={<BuildingViewer />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
