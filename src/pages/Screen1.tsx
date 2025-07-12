// =======================================================================
// FILE: src/pages/Screen1.tsx
// =======================================================================
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Monitor } from 'lucide-react';
import { VirtualScreen } from '../components/VirtualScreen';

export const Screen1: React.FC = () => {
  const savedSettings = sessionStorage.getItem('cameraSettings');
  const cameraSettings = savedSettings 
    ? { zoom: JSON.parse(savedSettings).screen1.zoom }
    : { zoom: 1.5 };

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <Link to="/" className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors">
          <ArrowLeft size={20} />
          <span>Back to Overview</span>
        </Link>
      </div>
      <div className="absolute top-4 right-4 z-10 text-white text-right">
        <h1 className="text-xl font-bold flex items-center gap-2"><Monitor size={20} /> Screen 1</h1>
        <p className="text-sm opacity-80">1080x1920 (Portrait)</p>
      </div>
      <VirtualScreen 
        resolution={{ width: 1080, height: 1920 }} 
        cameraSettings={cameraSettings} 
      />
    </div>
  );
};