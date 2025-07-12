import React, { useState } from 'react';
import { Camera, Monitor, RotateCcw, Settings, Hash } from 'lucide-react';

// Defines the settings for the 2D cameras.
interface CameraSettings {
  screen1: {
    position: { x: number; y: number };
    zoom: number;
  };
  screen2: {
    position: { x: number; y: number };
    zoom: number;
  };
}

interface CameraControlsProps {
  settings: CameraSettings;
  onSettingsChange: (settings: CameraSettings) => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  settings,
  onSettingsChange
}) => {
  const [activeTab, setActiveTab] = useState<'screen1' | 'screen2'>('screen1');
  const [showNumbers, setShowNumbers] = useState(true);

  const defaultSettings: CameraSettings = {
    screen1: { position: { x: -10, y: 0 }, zoom: 1.5 },
    screen2: { position: { x: 10, y: 0 }, zoom: 1.5 },
  };

  const updateSetting = (
    screen: 'screen1' | 'screen2',
    category: 'position' | 'zoom',
    axis: 'x' | 'y' | null,
    value: number
  ) => {
    const newSettings = { ...settings };
    if (category === 'position' && axis) {
      newSettings[screen].position[axis] = value;
    } else if (category === 'zoom') {
      newSettings[screen].zoom = value;
    }
    onSettingsChange(newSettings);
  };

  const resetToDefaults = () => {
    onSettingsChange(defaultSettings);
  };

  const currentScreen = settings[activeTab];

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2"><Settings className="text-blue-400" /> 2D Scene Controls</h3>
        <button onClick={resetToDefaults} className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm"><RotateCcw size={16} /> Reset</button>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('screen1')} className={`flex-1 py-2 rounded-lg ${activeTab === 'screen1' ? 'bg-blue-600' : 'bg-white/10'}`}><Monitor size={16} className="inline mr-2" />Screen 1</button>
        <button onClick={() => setActiveTab('screen2')} className={`flex-1 py-2 rounded-lg ${activeTab === 'screen2' ? 'bg-green-600' : 'bg-white/10'}`}><Monitor size={16} className="inline mr-2" />Screen 2</button>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-semibold mb-3">Camera Pan (Position)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['x', 'y'] as const).map((axis) => (
              <div key={axis}>
                <label className="block text-sm mb-2 uppercase">Pan {axis}</label>
                <input type="range" min="-20" max="20" step="0.5" value={currentScreen.position[axis]} onChange={(e) => updateSetting(activeTab, 'position', axis, parseFloat(e.target.value))} className="w-full" />
                {showNumbers && <div className="text-center text-xs mt-1">{currentScreen.position[axis].toFixed(1)}</div>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Camera Zoom</h4>
          <input type="range" min="0.2" max="5" step="0.1" value={currentScreen.zoom} onChange={(e) => updateSetting(activeTab, 'zoom', null, parseFloat(e.target.value))} className="w-full" />
          {showNumbers && <div className="text-center text-xs mt-1">{currentScreen.zoom.toFixed(1)}x</div>}
        </div>
      </div>
    </div>
  );
};
