import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html, Center, Bounds, Environment } from '@react-three/drei';
import { useParams, useNavigate } from 'react-router-dom';
import { buildingsData } from '../data/buildingsData';

// Fallback card styles
const fallbackStyles = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Syne', sans-serif",
    color: '#fff',
  },
  card: {
    border: '1px solid #1e1e2e',
    borderRadius: 16,
    background: '#12121c',
    padding: '3rem',
    maxWidth: 440,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    boxShadow: '0 0 40px rgba(0,229,200,0.08)',
  },
  badge: {
    fontSize: 11,
    letterSpacing: 3,
    color: '#00e5c8',
    textTransform: 'uppercase',
  },
  h1: { fontSize: 36, fontWeight: 800, margin: 0, lineHeight: 1 },
  desc: { color: '#777', fontSize: 15, lineHeight: 1.75, margin: 0 },
  statsRow: { display: 'flex', gap: 12 },
  stat: {
    flex: 1,
    background: '#0d0d14',
    border: '0.5px solid #252535',
    borderRadius: 8,
    padding: '0.8rem 1rem',
  },
  statNum: { fontSize: 24, fontWeight: 700 },
  statLabel: { fontSize: 10, color: '#555', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 3 },
  btn: {
    padding: '13px 30px',
    border: '1px solid rgba(0,229,200,0.3)',
    borderRadius: 6,
    background: 'transparent',
    color: '#00e5c8',
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: "'Syne', sans-serif",
    alignSelf: 'flex-start',
  },
};

function FallbackCard({ building, navigate }) {
  const name = building
    ? building.name
    : 'Unknown Building';
  const floors = building?.floors ?? '—';
  const labs = building?.labs ?? '—';
  const dean = building?.dean ?? '—';
  const description = building?.description ?? 'No description available.';

  return (
    <div style={fallbackStyles.container}>
      <div style={fallbackStyles.card}>
        <p style={fallbackStyles.badge}>3D Model Unavailable</p>
        <h1 style={fallbackStyles.h1}>{name}</h1>
        <p style={fallbackStyles.desc}>{description}</p>
        <div style={fallbackStyles.statsRow}>
          <div style={fallbackStyles.stat}>
            <div style={fallbackStyles.statNum}>{floors}</div>
            <div style={fallbackStyles.statLabel}>Floors</div>
          </div>
          <div style={fallbackStyles.stat}>
            <div style={fallbackStyles.statNum}>{labs}</div>
            <div style={fallbackStyles.statLabel}>Labs</div>
          </div>
        </div>
        <div style={fallbackStyles.stat}>
          <div style={{ fontSize: 13, color: '#aaa' }}>Dean / Head</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{dean}</div>
        </div>
        <button style={fallbackStyles.btn} onClick={() => navigate('/')}>
          ← Home
        </button>
      </div>
    </div>
  );
}

function BuildingModel({ glbFile, onError }) {
  const { scene } = useGLTF(glbFile);
  const modelRef = useRef();

  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.2;
    }
  });

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

// Error boundary to catch GLB load failures
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
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

  const fallback = <FallbackCard building={building} navigate={navigate} />;

  return (
    <div className="building-viewer-container">
      <button className="back-button" onClick={() => navigate('/')}>
        &larr; Home
      </button>

      <div className="canvas-section">
        <ModelErrorBoundary fallback={fallback}>
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
        </ModelErrorBoundary>
      </div>

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
