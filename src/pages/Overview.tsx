import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Monitor, Play, Camera, Zap, Eye } from 'lucide-react';
import { CameraControls } from '../components/CameraControls';
import { LivePreview } from '../components/LivePreview';
import * as THREE from 'three';

interface CameraSettings {
  screen1: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    camera: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
  };
  screen2: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    camera: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
  };
}

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [cameraSettings, setCameraSettings] = React.useState<CameraSettings>({
    screen1: {
      position: { x: 0, y: 10, z: 16 },
      rotation: { x: 0, y: 0, z: 0 },
      camera: { x: 0, y: 10, z: 25 },
      target: { x: 0, y: 10, z: 0 }
    },
    screen2: {
      position: { x: -3, y: -1, z: 16 },
      rotation: { x: 0, y: 0, z: 0 },
      camera: { x: -3, y: -1, z: 21 },
      target: { x: -3, y: -1, z: -13 }
    }
  });
  
  const [previewCamera, setPreviewCamera] = React.useState<'overview' | 'screen1' | 'screen2'>('overview');

  const navigateToScreen = (screen: 'screen1' | 'screen2') => {
    // Store settings in sessionStorage to pass to screen pages
    sessionStorage.setItem('cameraSettings', JSON.stringify(cameraSettings));
    navigate(`/${screen}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Camera className="text-blue-400" size={32} />
            <h1 className="text-4xl font-bold text-white">Virtual Camera Scene</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience 3D cards falling through different camera perspectives. 
            Each screen shows the same scene from its unique virtual camera viewpoint.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          {/* Live Preview */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Eye className="text-green-400" size={24} />
                <h3 className="text-xl font-bold text-white">Live Preview</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewCamera('overview')}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    previewCamera === 'overview'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setPreviewCamera('screen1')}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    previewCamera === 'screen1'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  Screen 1
                </button>
                <button
                  onClick={() => setPreviewCamera('screen2')}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    previewCamera === 'screen2'
                      ? 'bg-green-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  Screen 2
                </button>
              </div>
            </div>
            <LivePreview 
              settings={cameraSettings}
              activeCamera={previewCamera}
              className="h-96"
            />
          </div>

          {/* Camera Controls */}
          <CameraControls 
            settings={cameraSettings}
            onSettingsChange={setCameraSettings}
          />
        </div>

        {/* Screen Navigation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Screen 1 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Monitor className="text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Screen 1</h2>
                <p className="text-gray-300">Portrait View</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Resolution:</span>
                <span className="text-white font-mono">1080×1920</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Orientation:</span>
                <span className="text-white">Portrait</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Camera:</span>
                <span className="text-white font-mono text-xs">
                  ({cameraSettings.screen1.camera.x}, {cameraSettings.screen1.camera.y}, {cameraSettings.screen1.camera.z})
                </span>
              </div>
            </div>

            <button
              onClick={() => navigateToScreen('screen1')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:scale-105 transform duration-200"
            >
              <Play size={16} />
              <span>Enter Screen 1</span>
            </button>
          </div>

          {/* Screen 2 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Monitor className="text-green-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Screen 2</h2>
                <p className="text-gray-300">Landscape View</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Resolution:</span>
                <span className="text-white font-mono">1920×1080</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Orientation:</span>
                <span className="text-white">Landscape</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Camera:</span>
                <span className="text-white font-mono text-xs">
                  ({cameraSettings.screen2.camera.x}, {cameraSettings.screen2.camera.y}, {cameraSettings.screen2.camera.z})
                </span>
              </div>
            </div>

            <button
              onClick={() => navigateToScreen('screen2')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:scale-105 transform duration-200"
            >
              <Play size={16} />
              <span>Enter Screen 2</span>
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="text-purple-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Virtual Cameras</h3>
            <p className="text-gray-400 text-sm">Each screen uses a different camera position and angle to capture the 3D scene</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="text-orange-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Physics Simulation</h3>
            <p className="text-gray-400 text-sm">Realistic card physics with gravity, rotation, and collision detection</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Monitor className="text-cyan-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Responsive Design</h3>
            <p className="text-gray-400 text-sm">Adapts to different screen sizes while maintaining aspect ratios</p>
          </div>
        </div>
      </div>
    </div>
  );
};