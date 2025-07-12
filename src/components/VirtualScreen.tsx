import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Card } from '../utils/Card';
import { SharedSceneState } from '../utils/SharedSceneState';

const cardImageUrls = [
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=500&q=60',
  'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?w=500&q=60',
  'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=500&q=60',
  'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=500&q=60',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=60'
];

interface VirtualScreenProps {
  screenId: string;
  resolution: { width: number; height: number };
  cameraSettings: { position: { x: number; y: number; }; zoom: number; };
  className?: string;
}

export const VirtualScreen: React.FC<VirtualScreenProps> = ({ screenId, resolution, cameraSettings, className }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    renderer: THREE.WebGLRenderer;
    cards: Card[];
    animationId: number | null;
    clock: THREE.Clock;
    frustumSize: number;
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    
    const container = mountRef.current;
    const aspect = resolution.width / resolution.height;
    const frustumSize = 20;

    const camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 100);
    camera.position.set(cameraSettings.position.x, cameraSettings.position.y, 50);
    camera.zoom = cameraSettings.zoom;
    camera.updateProjectionMatrix();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const sharedState = SharedSceneState.getInstance();
    sharedState.initializeCards(15, frustumSize * aspect, frustumSize);
    const cardStates = sharedState.getCardStates();
    
    const cards = cardStates.map((state, i) => {
      const card = new Card({
        ...state,
        width: 2,
        height: 3,
        frontTextureUrl: cardImageUrls[i % cardImageUrls.length],
      }, frustumSize * aspect, frustumSize);
      scene.add(card.mesh);
      return card;
    });

    const clock = new THREE.Clock();
    sceneRef.current = { scene, camera, renderer, cards, animationId: null, clock, frustumSize };

    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      if (!sceneRef.current) return;

      const { clock, cards, renderer, scene, camera, frustumSize } = sceneRef.current;
      const deltaTime = clock.getDelta();

      cards.forEach(card => {
        card.update(deltaTime);
        // Correctly check if the card is below the view frustum.
        if (card.mesh.position.y < -frustumSize / 2 - 2) {
          card.reset();
        }
      });
      
      renderer.render(scene, camera);
      sceneRef.current.animationId = animationId;
    };
    animate();

    const handleResize = () => {
      if (!sceneRef.current || !mountRef.current) return;
      const { camera, renderer, frustumSize } = sceneRef.current;
      const newAspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);

      camera.left = frustumSize * newAspect / -2;
      camera.right = frustumSize * newAspect / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
      
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        if (sceneRef.current.animationId) cancelAnimationFrame(sceneRef.current.animationId);
        sceneRef.current.cards.forEach(c => c.dispose());
        if(renderer.domElement.parentElement) {
            renderer.domElement.parentElement.removeChild(renderer.domElement);
        }
      }
    };
  }, [screenId, resolution, cameraSettings]);

  return <div ref={mountRef} className={`w-full h-full ${className || ''}`} style={{ minHeight: '100vh' }} />;
};
