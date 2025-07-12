import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Card } from '../utils/Card';
import { Page } from '../utils/Page';
import { SceneManager } from '../utils/SceneManager';

interface ThreeSceneProps {
  className?: string;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({ className }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize scene manager
    sceneManagerRef.current = new SceneManager(mountRef.current);
    
    // Start animation loop
    sceneManagerRef.current.startAnimation();

    // Handle window resize
    const handleResize = () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.handleResize();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
      }
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className={`w-full h-full ${className || ''}`}
      style={{ minHeight: '100vh' }}
    />
  );
};