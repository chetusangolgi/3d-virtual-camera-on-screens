import React from 'react';
import * as THREE from 'three';
import { VirtualScreen } from '../components/VirtualScreen';
import { Link } from 'react-router-dom';
import { ArrowLeft, Monitor } from 'lucide-react';

export const Screen2: React.FC = () => {
  // Get camera settings from sessionStorage
  const savedSettings = sessionStorage.getItem('cameraSettings');
  const cameraSettings = savedSettings ? JSON.parse(savedSettings) : {
    screen2: {
      position: { x: 12, y: -3, z: -5 },
      rotation: { x: 0, y: -0.3, z: 0 },
      camera: { x: 25, y: 8, z: 15 },
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
          <h1 className="text-xl font-bold">Screen 2</h1>
        </div>
        <div className="text-sm opacity-80">
          <div>Resolution: 1920×1080</div>
          <div>Orientation: Landscape</div>
          <div>Camera: ({cameraSettings.screen2.camera.x}, {cameraSettings.screen2.camera.y}, {cameraSettings.screen2.camera.z})</div>
        </div>
      </div>

      {/* Virtual Screen */}
      <VirtualScreen
        screenId="Screen 2"
        resolution={{ width: 1920, height: 1080 }}
        cameraPosition={new THREE.Vector3(
          cameraSettings.screen2.camera.x,
          cameraSettings.screen2.camera.y,
          cameraSettings.screen2.camera.z
        )}
        cameraTarget={new THREE.Vector3(
          cameraSettings.screen2.target.x,
          cameraSettings.screen2.target.y,
          cameraSettings.screen2.target.z
        )}
        className="w-full h-full"
      />

      {/* Status Info */}
      <div className="absolute bottom-4 left-4 z-10 text-white text-xs opacity-60">
        <div>Camera: Side View</div>
        <div>Cards: Physics Enabled</div>
        <div>Lighting: Dynamic</div>
      </div>

      {/* Navigation to Screen 1 */}
      <div className="absolute bottom-4 right-4 z-10">
        <Link 
          to="/screen1" 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <span>View Screen 1</span>
          <Monitor size={16} />
        </Link>
      </div>
    </div>
  );
};