// TEMPORARY DEV TOOL - REMOVE BEFORE FINAL BUILD
import React, { useState, useRef, useEffect } from 'react';
import './CoordinateTool.css';

const INITIAL_BOXES = [
  { id: "admin-block", label: "Admin Block", glb: "Admin_block.glb", x: 45, y: 45, w: 10, h: 10 },
  { id: "f-block", label: "F Block", glb: "F_block.glb", x: 46, y: 46, w: 10, h: 10 },
  { id: "c-block", label: "C Block", glb: "C_block.glb", x: 47, y: 47, w: 10, h: 10 },
  { id: "a-block", label: "A Block", glb: "A_block.glb", x: 48, y: 48, w: 10, h: 10 },
  { id: "b-block", label: "B Block", glb: "B_block.glb", x: 49, y: 49, w: 10, h: 10 },
  { id: "incubation", label: "Incubation Center", glb: "incubation.glb", x: 50, y: 50, w: 10, h: 10 },
  { id: "cafeteria", label: "Cafeteria", glb: "Cafeteria.glb", x: 51, y: 51, w: 10, h: 10 },
  { id: "d-block", label: "D Block", glb: "D_block.glb", x: 52, y: 52, w: 10, h: 10 },
  { id: "dsw", label: "DSW", glb: "dsw.glb", x: 53, y: 53, w: 10, h: 10 },
  { id: "hostel-1", label: "Hostel 1", glb: "B_hostel.glb", x: 54, y: 54, w: 10, h: 10 },
];

export default function CoordinateTool() {
  const [boxes, setBoxes] = useState(INITIAL_BOXES);
  const [hostelCount, setHostelCount] = useState(1);
  const [dragState, setDragState] = useState(null);
  const [jsonOutput, setJsonOutput] = useState(null);
  
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragState) return;
      if (!wrapperRef.current) return;

      const rect = wrapperRef.current.getBoundingClientRect();
      const dx = ((e.clientX - dragState.startX) / rect.width) * 100;
      const dy = ((e.clientY - dragState.startY) / rect.height) * 100;

      setBoxes((prev) => prev.map(b => {
        if (b.id !== dragState.id) return b;
        if (dragState.type === 'move') {
          return { ...b, x: dragState.origX + dx, y: dragState.origY + dy };
        } else {
          return { ...b, w: Math.max(1, dragState.origW + dx), h: Math.max(1, dragState.origH + dy) };
        }
      }));
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState]);

  const startDrag = (e, box, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState({
      id: box.id,
      type,
      startX: e.clientX,
      startY: e.clientY,
      origX: box.x,
      origY: box.y,
      origW: box.w,
      origH: box.h
    });
  };

  const duplicateHostel = (e) => {
    e.stopPropagation();
    const count = hostelCount + 1;
    setHostelCount(count);
    setBoxes([...boxes, {
      id: `hostel-${count}`,
      label: `Hostel ${count}`,
      glb: "B_hostel.glb",
      x: 50, y: 50, w: 10, h: 10
    }]);
  };

  const generateJSON = () => {
    const output = boxes.map(b => ({
      id: b.id,
      label: b.label,
      glb: b.glb,
      x: Number(b.x.toFixed(1)),
      y: Number(b.y.toFixed(1)),
      w: Number(b.w.toFixed(1)),
      h: Number(b.h.toFixed(1))
    }));
    setJsonOutput(JSON.stringify(output, null, 2));
  };

  return (
    <div className="coord-tool-container">
      <div className="coord-wrapper" ref={wrapperRef}>
        <img src="/map.jpeg" alt="Map" draggable={false} className="coord-img" />
        
        {boxes.map(box => (
          <div
            key={box.id}
            className="coord-box"
            style={{
              left: `${box.x}%`,
              top: `${box.y}%`,
              width: `${box.w}%`,
              height: `${box.h}%`
            }}
            onMouseDown={(e) => startDrag(e, box, 'move')}
          >
            <span className="coord-label">{box.label}</span>
            
            {box.id.startsWith('hostel') && (
              <button className="duplicate-btn" onMouseDown={(e) => e.stopPropagation()} onClick={duplicateHostel}>+ Dup</button>
            )}

            <div 
              className="coord-resize-handle"
              onMouseDown={(e) => startDrag(e, box, 'resize')}
            />
          </div>
        ))}
      </div>

      <button className="set-all-btn" onClick={generateJSON}>SET ALL</button>

      {jsonOutput && (
        <div className="json-overlay">
          <div className="json-modal">
            <h3>Generated Coordinates JSON</h3>
            <textarea readOnly value={jsonOutput} />
            <button onClick={() => setJsonOutput(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
