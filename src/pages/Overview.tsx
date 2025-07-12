import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Monitor, Play, Camera, Eye } from 'lucide-react';
import { CameraControls } from '../components/CameraControls';
import { LivePreview } from '../components/LivePreview';

interface CameraSettings {
  screen1: { position: { x: number; y: number }; zoom: number; };
  screen2: { position: { x: number; y: number }; zoom: number; };
}

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>({
    screen1: { position: { x: 0, y: 3.5 }, zoom: 1.5 },
    screen2: { position: { x: -3, y: -7.5 }, zoom: 1.7 },
  });
  
  const [previewCamera, setPreviewCamera] = useState<'overview' | 'screen1' | 'screen2'>('overview');

  const navigateToScreen = (screen: 'screen1' | 'screen2') => {
    sessionStorage.setItem('cameraSettings', JSON.stringify(cameraSettings));
    navigate(`/${screen}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 sm:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3"><Camera className="text-blue-400" /> 2D Virtual Camera Scene</h1>
          <p className="text-lg text-gray-300">Control different 2D orthographic cameras viewing the same physics simulation.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2"><Eye className="text-green-400" /> Live Preview</h3>
              <div className="flex gap-2">
                 <button onClick={() => setPreviewCamera('overview')} className={`px-3 py-1 rounded text-xs ${previewCamera === 'overview' ? 'bg-purple-600' : 'bg-white/10'}`}>Overview</button>
                 <button onClick={() => setPreviewCamera('screen1')} className={`px-3 py-1 rounded text-xs ${previewCamera === 'screen1' ? 'bg-blue-600' : 'bg-white/10'}`}>Screen 1</button>
                 <button onClick={() => setPreviewCamera('screen2')} className={`px-3 py-1 rounded text-xs ${previewCamera === 'screen2' ? 'bg-green-600' : 'bg-white/10'}`}>Screen 2</button>
              </div>
            </div>
            <LivePreview settings={cameraSettings} activeCamera={previewCamera} />
          </div>
          <CameraControls settings={cameraSettings} onSettingsChange={setCameraSettings} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Monitor className="text-blue-400" /> Screen 1 (Portrait)</h2>
            <button onClick={() => navigateToScreen('screen1')} className="w-full bg-blue-600 hover:bg-blue-700 py-3 px-6 rounded-lg flex items-center justify-center gap-2">
              <Play size={16} /> Enter Screen 1
            </button>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Monitor className="text-green-400" /> Screen 2 (Landscape)</h2>
            <button onClick={() => navigateToScreen('screen2')} className="w-full bg-green-600 hover:bg-green-700 py-3 px-6 rounded-lg flex items-center justify-center gap-2">
              <Play size={16} /> Enter Screen 2
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
