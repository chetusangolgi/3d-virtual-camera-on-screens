import React from 'react';
import * as THREE from 'three';
import { VirtualScreen } from '../components/VirtualScreen';
import { Link } from 'react-router-dom';
import { ArrowLeft, Monitor } from 'lucide-react';

export const Screen1: React.FC = () => {
  // Get camera settings from sessionStorage
  const savedSettings = sessionStorage.getItem('cameraSettings');
  const cameraSettings = savedSettings ? JSON.parse(savedSettings) : {
    screen1: {
      position: { x: -12, y: 0, z: -5 },
      rotation: { x: 0, y: 0.3, z: 0 },
      camera: { x: 0, y: 5, z: 20 },
      target: { x: 0, y: 0, z: 0 }
    }
  };

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* Navigation */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Overview</span>
        </Link>
      </div>

      {/* Screen Info */}
      <div className="absolute top-4 right-4 z-10 text-white text-right">
        <div className="flex items-center gap-2 mb-2">
          <Monitor size={20} />
          <h1 className="text-xl font-bold">Screen 1</h1>
        </div>
        <div className="text-sm opacity-80">
          <div>Resolution: 1080×1920</div>
          <div>Orientation: Portrait</div>
          <div>Camera: ({cameraSettings.screen1.camera.x}, {cameraSettings.screen1.camera.y}, {cameraSettings.screen1.camera.z})</div>
        </div>
      </div>

      {/* Virtual Screen */}
      <VirtualScreen
        screenId="Screen 1"
        resolution={{ width: 1080, height: 1920 }}
        cameraPosition={new THREE.Vector3(
          cameraSettings.screen1.camera.x,
          cameraSettings.screen1.camera.y,
          cameraSettings.screen1.camera.z
        )}
        cameraTarget={new THREE.Vector3(
          cameraSettings.screen1.target.x,
          cameraSettings.screen1.target.y,
          cameraSettings.screen1.target.z
        )}
        className="w-full h-full"
      />

      {/* Status Info */}
      <div className="absolute bottom-4 left-4 z-10 text-white text-xs opacity-60">
        <div>Camera: Front View</div>
        <div>Cards: Physics Enabled</div>
        <div>Lighting: Dynamic</div>
      </div>

      {/* Navigation to Screen 2 */}
      <div className="absolute bottom-4 right-4 z-10">
        <Link 
          to="/screen2" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <span>View Screen 2</span>
          <Monitor size={16} />
        </Link>
      </div>
    </div>
  );
};