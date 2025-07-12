import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Card } from '../utils/Card';
import { Page } from '../utils/Page';
import { SharedSceneState } from '../utils/SharedSceneState';

// Image URLs for the cards.
const cardImageUrls = [
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=500&q=60',
  'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?w=500&q=60',
  'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=500&q=60',
  'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=500&q=60',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=60'
];

interface CameraSettings {
  screen1: { position: { x: number; y: number }; zoom: number; };
  screen2: { position: { x: number; y: number }; zoom: number; };
}

interface LivePreviewProps {
  settings: CameraSettings;
  activeCamera: 'overview' | 'screen1' | 'screen2';
  className?: string;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ settings, activeCamera, className }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    renderer: THREE.WebGLRenderer;
    cards: Card[];
    pages: Page[];
    animationId: number | null;
    clock: THREE.Clock;
    frustumSize: number;
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const aspect = container.clientWidth / container.clientHeight;
    const frustumSize = 20;

    const camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 100);
    camera.position.z = 50;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
        width: 2.5,
        height: 3.5,
        frontTextureUrl: cardImageUrls[i % cardImageUrls.length],
      }, frustumSize * aspect, frustumSize);
      scene.add(card.mesh);
      return card;
    });

    const page1 = new Page({ width: 8, height: 14, content: 'Screen 1', position: new THREE.Vector2(settings.screen1.position.x, settings.screen1.position.y), backgroundColor: '#1a1a2e', textColor: '#eee' });
    scene.add(page1.mesh);
    const page2 = new Page({ width: 14, height: 8, content: 'Screen 2', position: new THREE.Vector2(settings.screen2.position.x, settings.screen2.position.y), backgroundColor: '#16213e', textColor: '#eee' });
    scene.add(page2.mesh);
    const pages = [page1, page2];

    const clock = new THREE.Clock();
    sceneRef.current = { scene, camera, renderer, cards, pages, animationId: null, clock, frustumSize };

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
      camera.left = frustumSize * newAspect / -2;
      camera.right = frustumSize * newAspect / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        if (sceneRef.current.animationId) cancelAnimationFrame(sceneRef.current.animationId);
        sceneRef.current.cards.forEach(c => c.dispose());
        sceneRef.current.pages.forEach(p => p.dispose());
        if (renderer.domElement.parentElement) {
            renderer.domElement.parentElement.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    const { camera, pages } = sceneRef.current;
    
    pages[0].setPosition(new THREE.Vector2(settings.screen1.position.x, settings.screen1.position.y));
    pages[1].setPosition(new THREE.Vector2(settings.screen2.position.x, settings.screen2.position.y));

    let targetPosition = new THREE.Vector2(0, 0);
    let targetZoom = 1;

    if (activeCamera === 'screen1') {
      targetPosition.copy(settings.screen1.position);
      targetZoom = settings.screen1.zoom;
    } else if (activeCamera === 'screen2') {
      targetPosition.copy(settings.screen2.position);
      targetZoom = settings.screen2.zoom;
    }
    
    camera.position.x = targetPosition.x;
    camera.position.y = targetPosition.y;
    camera.zoom = targetZoom;
    camera.updateProjectionMatrix();

  }, [settings, activeCamera]);

  return <div ref={mountRef} className={`w-full h-full bg-black rounded-xl overflow-hidden ${className || ''}`} style={{ minHeight: '400px' }} />;
};
