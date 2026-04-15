import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DepartmentSelector from '../components/DepartmentSelector';
import OrbitalGallery from '../components/OrbitalGallery';
import './ExploreCampus.css';

const DEPARTMENTS = [
  { id:'admin',     label:'Admin Block',      color:'#00f5c4', folder:'admin',     prefix:'admin',  count:4 },
  { id:'f-block',   label:'F Block',           color:'#b450ff', folder:'f-block',   prefix:'f',      count:4 },
  { id:'c-block',   label:'C Block',           color:'#00b4ff', folder:'c-block',   prefix:'c',      count:4 },
  { id:'a-block',   label:'A Block',           color:'#ff50dc', folder:'a-block',   prefix:'a',      count:4 },
  { id:'b-block',   label:'B Block',           color:'#ffaa00', folder:'b-block',   prefix:'b',      count:4 },
  { id:'d-block',   label:'D Block',           color:'#00f5c4', folder:'d-block',   prefix:'d',      count:4 },
  { id:'dsw',       label:'DSW',               color:'#ff6b6b', folder:'dsw',       prefix:'dsw',    count:4 },
  { id:'incubator', label:'Incubation Center', color:'#a8ff78', folder:'incubator', prefix:'i',      count:4 },
  { id:'cafeteria', label:'Cafeteria',         color:'#ffd700', folder:'cafeteria', prefix:'cafe',   count:4 },
  { id:'hostel',    label:'Hostel Block',      color:'#87ceeb', folder:'hostel',    prefix:'hostel', count:4 },
  { id:'sports',    label:'Sports Complex',    color:'#ff8c00', folder:'sports',    prefix:'sports', count:4 },
  { id:'events',    label:'Events',            color:'#ff4500', folder:'events',    prefix:'event',  count:4 },
];

export default function ExploreCampus() {
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState(null);

  const handleSelect = (dept) => setSelectedDept(dept);
  const handleBack = () => setSelectedDept(null);

  return (
    <div className="explore-root">
      <button
        type="button"
        className="explore-home-btn"
        onClick={() => navigate('/')}
      >
        &larr; Home
      </button>
      {!selectedDept
        ? <DepartmentSelector departments={DEPARTMENTS} onSelect={handleSelect} />
        : <OrbitalGallery dept={selectedDept} onBack={handleBack} />
      }
    </div>
  );
}
