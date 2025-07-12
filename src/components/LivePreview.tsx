import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Card } from '../utils/Card';
import { Page } from '../utils/Page';
import { SharedSceneState } from '../utils/SharedSceneState';

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

interface LivePreviewProps {
  settings: CameraSettings;
  activeCamera: 'overview' | 'screen1' | 'screen2';
  className?: string;
}

const cardImageUrls = [
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNwYWNlfGVufDB8fDB8fHww',
  'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHNwYWNlfGVufDB8fDB8fHww',
  'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8c3BhY2V8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHNwYWNlfGVufDB8fDB8fHww',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3BhY2V8ZW58MHx8MHx8fDA%3D'
];

export const LivePreview: React.FC<LivePreviewProps> = ({
  settings,
  activeCamera,
  className
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    cards: Card[];
    pages: Page[];
    animationId: number | null;
    clock: THREE.Clock;
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);

    // Initialize camera
    const aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    
    const container = mountRef.current;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    container.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x4080ff, 0.4);
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);

    const pointLight1 = new THREE.PointLight(0xff6b6b, 0.8, 30);
    pointLight1.position.set(-15, 15, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4ecdc4, 0.8, 30);
    pointLight2.position.set(15, 15, 0);
    scene.add(pointLight2);

    // Create pages
    const pages: Page[] = [];
    
    const page1 = new Page({
      width: 8,
      height: 14,
      content: 'Screen 1\n1080×1920',
      position: new THREE.Vector3(
        settings.screen1.position.x,
        settings.screen1.position.y,
        settings.screen1.position.z
      ),
      rotation: new THREE.Euler(
        settings.screen1.rotation.x,
        settings.screen1.rotation.y,
        settings.screen1.rotation.z
      ),
      backgroundColor: '#1a1a2e',
      textColor: '#eee'
    });
    pages.push(page1);
    scene.add(page1.mesh);

    const page2 = new Page({
      width: 14,
      height: 8,
      content: 'Screen 2\n1920×1080',
      position: new THREE.Vector3(
        settings.screen2.position.x,
        settings.screen2.position.y,
        settings.screen2.position.z
      ),
      rotation: new THREE.Euler(
        settings.screen2.rotation.x,
        settings.screen2.rotation.y,
        settings.screen2.rotation.z
      ),
      backgroundColor: '#16213e',
      textColor: '#eee'
    });
    pages.push(page2);
    scene.add(page2.mesh);

    // Create cards
    const cards: Card[] = [];
    const cardCount = 15;
    const sharedState = SharedSceneState.getInstance();
    sharedState.initializeCards(cardCount);
    const cardStates = sharedState.getCardStates();
    
    for (let i = 0; i < cardCount; i++) {
      const cardState = cardStates[i];
      const card = new Card({
        width: 2,
        height: 3,
        thickness: 0.1,
        position: cardState.position.clone(),
        rotation: cardState.rotation.clone(),
        velocity: cardState.velocity.clone(),
        angularVelocity: cardState.angularVelocity.clone(),
        delay: cardState.delay,
        index: i,
        frontTextureUrl: cardImageUrls[i % cardImageUrls.length],
        backTextureUrl: cardImageUrls[(i + 1) % cardImageUrls.length]
      });
      
      cards.push(card);
      scene.add(card.mesh);
    }

    // Add camera visualization helpers
    const cameraHelpers: THREE.CameraHelper[] = [];
    
    // Screen 1 camera helper
    const screen1Camera = new THREE.PerspectiveCamera(75, 1080/1920, 0.1, 1000);
    screen1Camera.position.set(
      settings.screen1.camera.x,
      settings.screen1.camera.y,
      settings.screen1.camera.z
    );
    screen1Camera.lookAt(
      settings.screen1.target.x,
      settings.screen1.target.y,
      settings.screen1.target.z
    );
    const screen1Helper = new THREE.CameraHelper(screen1Camera);
    screen1Helper.material.color.setHex(0x00ff00);
    scene.add(screen1Helper);
    cameraHelpers.push(screen1Helper);

    // Screen 2 camera helper
    const screen2Camera = new THREE.PerspectiveCamera(75, 1920/1080, 0.1, 1000);
    screen2Camera.position.set(
      settings.screen2.camera.x,
      settings.screen2.camera.y,
      settings.screen2.camera.z
    );
    screen2Camera.lookAt(
      settings.screen2.target.x,
      settings.screen2.target.y,
      settings.screen2.target.z
    );
    const screen2Helper = new THREE.CameraHelper(screen2Camera);
    screen2Helper.material.color.setHex(0xff0000);
    scene.add(screen2Helper);
    cameraHelpers.push(screen2Helper);

    const clock = new THREE.Clock();

    sceneRef.current = {
      scene,
      camera,
      renderer,
      cards,
      pages,
      animationId: null,
      clock
    };

    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      
      const deltaTime = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      
      // Update cards
      cards.forEach(card => {
        card.update(deltaTime, sharedState.getGlobalTime());
        
        if (card.mesh.position.y < -30) {
          card.reset(new THREE.Vector3(0, 0, 0)); // Position will be set by shared state
        }
      });
      
      // Update camera position based on active camera
      if (activeCamera === 'overview') {
        const radius = 35;
        const speed = 0.1;
        camera.position.x = Math.cos(elapsedTime * speed) * radius * 0.8;
        camera.position.y = 15 + Math.sin(elapsedTime * speed * 0.7) * 5;
        camera.position.z = radius + Math.sin(elapsedTime * speed * 0.5) * 10;
        camera.lookAt(0, 0, 0);
      } else if (activeCamera === 'screen1') {
        camera.position.set(
          settings.screen1.camera.x,
          settings.screen1.camera.y,
          settings.screen1.camera.z
        );
        camera.lookAt(
          settings.screen1.target.x,
          settings.screen1.target.y,
          settings.screen1.target.z
        );
      } else if (activeCamera === 'screen2') {
        camera.position.set(
          settings.screen2.camera.x,
          settings.screen2.camera.y,
          settings.screen2.camera.z
        );
        camera.lookAt(
          settings.screen2.target.x,
          settings.screen2.target.y,
          settings.screen2.target.z
        );
      }
      
      renderer.render(scene, camera);
      
      if (sceneRef.current) {
        sceneRef.current.animationId = animationId;
      }
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!sceneRef.current || !mountRef.current) return;
      
      const container = mountRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      sceneRef.current.camera.aspect = width / height;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (sceneRef.current) {
        if (sceneRef.current.animationId) {
          cancelAnimationFrame(sceneRef.current.animationId);
        }
        
        sceneRef.current.cards.forEach(card => card.dispose());
        sceneRef.current.pages.forEach(page => page.dispose());
        sceneRef.current.renderer.dispose();
        
        if (container && sceneRef.current.renderer.domElement) {
          container.removeChild(sceneRef.current.renderer.domElement);
        }
      }
    };
  }, [settings, activeCamera]);

  // Update page positions when settings change
  useEffect(() => {
    if (!sceneRef.current) return;

    const [page1, page2] = sceneRef.current.pages;
    
    if (page1) {
      page1.mesh.position.set(
        settings.screen1.position.x,
        settings.screen1.position.y,
        settings.screen1.position.z
      );
      page1.mesh.rotation.set(
        settings.screen1.rotation.x,
        settings.screen1.rotation.y,
        settings.screen1.rotation.z
      );
    }
    
    if (page2) {
      page2.mesh.position.set(
        settings.screen2.position.x,
        settings.screen2.position.y,
        settings.screen2.position.z
      );
      page2.mesh.rotation.set(
        settings.screen2.rotation.x,
        settings.screen2.rotation.y,
        settings.screen2.rotation.z
      );
    }
  }, [settings]);

  return (
    <div 
      ref={mountRef} 
      className={`w-full h-full bg-black rounded-xl overflow-hidden ${className || ''}`}
      style={{ minHeight: '400px' }}
    />
  );
};