import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Card } from '../utils/Card';
import { SharedSceneState } from '../utils/SharedSceneState';

interface VirtualScreenProps {
  screenId: string;
  resolution: { width: number; height: number };
  cameraPosition: THREE.Vector3;
  cameraTarget: THREE.Vector3;
  className?: string;
}

const cardImageUrls = [
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNwYWNlfGVufDB8fDB8fHww',
  'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHNwYWNlfGVufDB8fDB8fHww',
  'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8c3BhY2V8ZW58MHx8MHx8fDA%3D',
  'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHNwYWNlfGVufDB8fDB8fHww',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3BhY2V8ZW58MHx8MHx8fDA%3D'
];

export const VirtualScreen: React.FC<VirtualScreenProps> = ({
  screenId,
  resolution,
  cameraPosition,
  cameraTarget,
  className
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    cards: Card[];
    animationId: number | null;
    clock: THREE.Clock;
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 100);

    // Initialize camera with specific position and target
    const aspect = resolution.width / resolution.height;
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.copy(cameraPosition);
    camera.lookAt(cameraTarget);

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    
    const container = mountRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    renderer.setSize(containerWidth, containerHeight);
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

    // Add colored point lights
    const pointLight1 = new THREE.PointLight(0xff6b6b, 0.8, 30);
    pointLight1.position.set(-15, 15, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4ecdc4, 0.8, 30);
    pointLight2.position.set(15, 15, 0);
    scene.add(pointLight2);

    // Create cards
    const cards: Card[] = [];
    const cardCount = 15;
    const sharedState = SharedSceneState.getInstance();
    sharedState.initializeCards(cardCount);
    const cardStates = sharedState.getCardStates();
    
    for (let i = 0; i < cardCount; i++) {
      const cardState = cardStates[i];
      const card = new Card({
        width: 1.5,
        height: 2,
        thickness: 0.08,
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

    // Add screen identifier text
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    
    context.fillStyle = '#1a1a2e';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = '#ffffff';
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.fillText(screenId, canvas.width / 2, canvas.height / 2 - 20);
    
    context.font = '24px Arial';
    context.fillStyle = '#cccccc';
    context.fillText(`${resolution.width}×${resolution.height}`, canvas.width / 2, canvas.height / 2 + 30);
    
    const texture = new THREE.CanvasTexture(canvas);
    const textGeometry = new THREE.PlaneGeometry(8, 4);
    const textMaterial = new THREE.MeshLambertMaterial({ map: texture });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, -8, -10);
    scene.add(textMesh);

    const clock = new THREE.Clock();

    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      
      const deltaTime = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      
      // Update cards
      cards.forEach(card => {
        card.update(deltaTime, sharedState.getGlobalTime());
        
        // Reset card if it falls too low
        if (card.mesh.position.y < -20) {
          card.reset(new THREE.Vector3(0, 0, 0)); // Position will be set by shared state
        }
      });
      
      renderer.render(scene, camera);
      
      if (sceneRef.current) {
        sceneRef.current.animationId = animationId;
      }
    };

    sceneRef.current = {
      scene,
      camera,
      renderer,
      cards,
      animationId: null,
      clock
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
        sceneRef.current.renderer.dispose();
        
        if (container && sceneRef.current.renderer.domElement) {
          container.removeChild(sceneRef.current.renderer.domElement);
        }
      }
    };
  }, [screenId, resolution, cameraPosition, cameraTarget]);

  return (
    <div 
      ref={mountRef} 
      className={`w-full h-full ${className || ''}`}
      style={{ minHeight: '100vh' }}
    />
  );
};