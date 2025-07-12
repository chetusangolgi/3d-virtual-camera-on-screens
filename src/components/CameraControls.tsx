import React, { useState } from 'react';
import { Camera, Monitor, RotateCcw, Settings, Hash } from 'lucide-react';

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

interface CameraControlsProps {
  settings: CameraSettings;
  onSettingsChange: (settings: CameraSettings) => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  settings,
  onSettingsChange
}) => {
  const [activeTab, setActiveTab] = useState<'screen1' | 'screen2'>('screen1');
  const [controlType, setControlType] = useState<'position' | 'camera'>('position');
  const [showNumbers, setShowNumbers] = useState(true);

  const defaultSettings: CameraSettings = {
    screen1: {
      position: { x: -12, y: 0, z: -5 },
      rotation: { x: 0, y: 0.3, z: 0 },
      camera: { x: 0, y: 5, z: 20 },
      target: { x: 0, y: 0, z: 0 }
    },
    screen2: {
      position: { x: 12, y: -3, z: -5 },
      rotation: { x: 0, y: -0.3, z: 0 },
      camera: { x: 25, y: 8, z: 15 },
      target: { x: 0, y: 0, z: 0 }
    }
  };

  const updateSetting = (
    screen: 'screen1' | 'screen2',
    category: 'position' | 'rotation' | 'camera' | 'target',
    axis: 'x' | 'y' | 'z',
    value: number
  ) => {
    const newSettings = {
      ...settings,
      [screen]: {
        ...settings[screen],
        [category]: {
          ...settings[screen][category],
          [axis]: value
        }
      }
    };
    onSettingsChange(newSettings);
  };

  const resetToDefaults = () => {
    onSettingsChange(defaultSettings);
  };

  const currentScreen = settings[activeTab];

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="text-blue-400" size={24} />
          <h3 className="text-xl font-bold text-white">Scene Controls</h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNumbers(!showNumbers)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
              showNumbers 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            <Hash size={16} />
            Numbers
          </button>
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Screen Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('screen1')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'screen1'
              ? 'bg-blue-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          <Monitor size={16} />
          Screen 1
        </button>
        <button
          onClick={() => setActiveTab('screen2')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'screen2'
              ? 'bg-green-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          <Monitor size={16} />
          Screen 2
        </button>
      </div>

      {/* Control Type Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setControlType('position')}
          className={`px-4 py-2 rounded-lg transition-colors text-sm ${
            controlType === 'position'
              ? 'bg-purple-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Screen Position
        </button>
        <button
          onClick={() => setControlType('camera')}
          className={`px-4 py-2 rounded-lg transition-colors text-sm ${
            controlType === 'camera'
              ? 'bg-purple-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Camera View
        </button>
      </div>

      {/* Controls */}
      <div className="space-y-6">
        {controlType === 'position' && (
          <>
            {/* Screen Position */}
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Monitor size={16} />
                Screen Position
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <div key={axis}>
                    <label className="block text-gray-300 text-sm mb-2 uppercase">
                      {axis}-axis
                    </label>
                    <input
                      type="range"
                      min={axis === 'y' ? -10 : -30}
                      max={axis === 'y' ? 10 : 30}
                      step="0.5"
                      value={currentScreen.position[axis]}
                      onChange={(e) =>
                        updateSetting(activeTab, 'position', axis, parseFloat(e.target.value))
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    {showNumbers && (
                      <div className="text-center text-gray-400 text-xs mt-1">
                        {currentScreen.position[axis].toFixed(1)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Screen Rotation */}
            <div>
              <h4 className="text-white font-semibold mb-3">Screen Rotation</h4>
              <div className="grid grid-cols-3 gap-4">
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <div key={axis}>
                    <label className="block text-gray-300 text-sm mb-2 uppercase">
                      {axis}-rotation
                    </label>
                    <input
                      type="range"
                      min="-3.14"
                      max="3.14"
                      step="0.1"
                      value={currentScreen.rotation[axis]}
                      onChange={(e) =>
                        updateSetting(activeTab, 'rotation', axis, parseFloat(e.target.value))
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    {showNumbers && (
                      <div className="text-center text-gray-400 text-xs mt-1">
                        {(currentScreen.rotation[axis] * 180 / Math.PI).toFixed(0)}°
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {controlType === 'camera' && (
          <>
            {/* Camera Position */}
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Camera size={16} />
                Camera Position
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <div key={axis}>
                    <label className="block text-gray-300 text-sm mb-2 uppercase">
                      {axis}-axis
                    </label>
                    <input
                      type="range"
                      min={axis === 'y' ? 0 : -50}
                      max={50}
                      step="1"
                      value={currentScreen.camera[axis]}
                      onChange={(e) =>
                        updateSetting(activeTab, 'camera', axis, parseFloat(e.target.value))
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    {showNumbers && (
                      <div className="text-center text-gray-400 text-xs mt-1">
                        {currentScreen.camera[axis].toFixed(0)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Camera Target */}
            <div>
              <h4 className="text-white font-semibold mb-3">Camera Target</h4>
              <div className="grid grid-cols-3 gap-4">
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <div key={axis}>
                    <label className="block text-gray-300 text-sm mb-2 uppercase">
                      {axis}-target
                    </label>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      step="0.5"
                      value={currentScreen.target[axis]}
                      onChange={(e) =>
                        updateSetting(activeTab, 'target', axis, parseFloat(e.target.value))
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    {showNumbers && (
                      <div className="text-center text-gray-400 text-xs mt-1">
                        {currentScreen.target[axis].toFixed(1)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Current Values Display */}
      {showNumbers && (
        <div className="mt-6 p-4 bg-black/20 rounded-lg">
          <h5 className="text-white font-semibold mb-2">Current {activeTab} Settings</h5>
          <div className="text-xs text-gray-300 space-y-1">
            <div>Position: ({currentScreen.position.x.toFixed(1)}, {currentScreen.position.y.toFixed(1)}, {currentScreen.position.z.toFixed(1)})</div>
            <div>Rotation: ({(currentScreen.rotation.x * 180 / Math.PI).toFixed(0)}°, {(currentScreen.rotation.y * 180 / Math.PI).toFixed(0)}°, {(currentScreen.rotation.z * 180 / Math.PI).toFixed(0)}°)</div>
            <div>Camera: ({currentScreen.camera.x.toFixed(0)}, {currentScreen.camera.y.toFixed(0)}, {currentScreen.camera.z.toFixed(0)})</div>
            <div>Target: ({currentScreen.target.x.toFixed(1)}, {currentScreen.target.y.toFixed(1)}, {currentScreen.target.z.toFixed(1)})</div>
          </div>
        </div>
      )}
    </div>
  );
};