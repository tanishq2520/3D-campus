import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html, Center, Bounds, Environment } from '@react-three/drei';
import { useParams, useNavigate } from 'react-router-dom';
import { buildingsData } from '../data/buildingsData';

function BuildingModel({ glbFile }) {
  // Load model from public directory
  const { scene } = useGLTF(glbFile);
  const modelRef = useRef();

  // Auto-rotate slowly on Y axis
  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.2; // Slow continuous rotation
    }
  });

  // Use Center to automatically center the geometry at [0,0,0]
  return (
    <Center ref={modelRef}>
      <primitive object={scene} />
    </Center>
  );
}

function Loader() {
  return (
    <Html center>
      <div className="loader">Loading model...</div>
    </Html>
  );
}

export default function BuildingViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const building = buildingsData.find(b => b.id === id);

  if (!building) {
    return (
      <div className="building-viewer-container" style={{ justifyContent: 'center', alignItems: 'center', color: 'white' }}>
        <h1>Building not found</h1>
        <button onClick={() => navigate('/')} className="view-btn" style={{ marginLeft: '1rem', padding: '1rem 2rem', cursor: 'pointer' }}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="building-viewer-container">
      {/* Back button */}
      <button className="back-button" onClick={() => navigate('/')}>
        &larr; Home
      </button>

      {/* Left side: Canvas Container */}
      <div className="canvas-section">
        {/* Adjusted camera position further back using Bounds to auto-fit, or just larger positions */}
        <Canvas className="three-canvas" camera={{ position: [60, 50, 80], fov: 45 }}>
          <Suspense fallback={<Loader />}>
            <ambientLight intensity={3} />
            <directionalLight position={[10, 20, 10]} intensity={1} />
            <directionalLight position={[0, 2, 5]} intensity={2} />
            <directionalLight position={[-5, 2, 0]} intensity={1} />
            <Environment preset="city" />
            <Bounds fit clip margin={1.2}>
              <BuildingModel key={building.glbFile} glbFile={building.glbFile} />
            </Bounds>
            <OrbitControls makeDefault />
          </Suspense>
        </Canvas>
      </div>

      {/* Right side: Info Panel */}
      <div className="info-panel">
        <div className="info-content">
          <h1>{building.name}</h1>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1.2rem', lineHeight: 1.6 }}>{building.description}</p>
          <div className="info-details">
            <div className="info-item">
              <span className="label">Building Name:</span>
              <span className="value">{building.name}</span>
            </div>
            <div className="info-item">
              <span className="label">Floors:</span>
              <span className="value">{building.floors}</span>
            </div>
            <div className="info-item">
              <span className="label">Labs:</span>
              <span className="value">{building.labs}</span>
            </div>
            <div className="info-item">
              <span className="label">Dean:</span>
              <span className="value">{building.dean}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
