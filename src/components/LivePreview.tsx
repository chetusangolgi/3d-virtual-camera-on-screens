import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// --- Card Logic is also INSIDE this component file ---
interface CardOptions {
  width: number;
  height: number;
  position: THREE.Vector2;
  velocity: THREE.Vector2;
  frontTextureUrl?: string;
}

class Card {
  public mesh: THREE.Mesh;
  public velocity: THREE.Vector2;
  private angularVelocity: number;
  private gravity: THREE.Vector2 = new THREE.Vector2(0, -6.0);
  private textureLoader: THREE.TextureLoader;

  constructor(options: CardOptions) {
    this.velocity = options.velocity.clone();
    this.angularVelocity = (Math.random() - 0.5) * 1.5;
    this.textureLoader = new THREE.TextureLoader();
    this.mesh = this.createMesh(options);
  }

  private createMesh(options: CardOptions): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(options.width, options.height);
    const material = new THREE.MeshLambertMaterial({
      map: options.frontTextureUrl ? this.textureLoader.load(options.frontTextureUrl) : undefined,
      color: options.frontTextureUrl ? 0xffffff : 0x3498db,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.98,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(options.position.x, options.position.y, 0);
    mesh.rotation.z = Math.random() * Math.PI * 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  public update(deltaTime: number): void {
    this.velocity.add(this.gravity.clone().multiplyScalar(deltaTime));
    this.mesh.position.x += this.velocity.x * deltaTime;
    this.mesh.position.y += this.velocity.y * deltaTime;
    this.mesh.rotation.z += this.angularVelocity * deltaTime;
    this.velocity.multiplyScalar(0.998);
    this.angularVelocity *= 0.998;
  }

  public reset(viewWidth: number, viewHeight: number): void {
    this.mesh.position.set(
        (Math.random() - 0.5) * viewWidth,
        viewHeight / 2 + 5,
        0
    );
    this.velocity.set(
        (Math.random() - 0.5) * 2,
        -Math.random() * 2 - 1
    );
    this.angularVelocity = (Math.random() - 0.5) * 1.5;
    this.mesh.rotation.z = Math.random() * Math.PI * 2;
  }

  public dispose(): void {
    this.mesh.geometry?.dispose();
    if (this.mesh.material instanceof THREE.Material) {
      this.mesh.material.dispose();
    }
  }
}

// --- Component Definition ---
const LPCardImageUrls = [
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=500&q=60',
  'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?w=500&q=60',
  'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=500&q=60',
  'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=500&q=60',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=60'
];

interface LPCameraSettings {
  screen1: { position: { x: number; y: number }; zoom: number; };
  screen2: { position: { x: number; y: number }; zoom: number; };
}

interface LivePreviewProps {
  settings: LPCameraSettings;
  activeCamera: 'overview' | 'screen1' | 'screen2';
  className?: string;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ settings, activeCamera, className }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    let animationId: number;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    const aspect = container.clientWidth / container.clientHeight;
    const frustumSize = 20;
    const camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const cards: Card[] = [];
    const numCards = 25;
    const viewWidth = frustumSize * aspect;
    const viewHeight = frustumSize;

    for (let i = 0; i < numCards; i++) {
        const card = new Card({
            width: 2.5,
            height: 3.5,
            position: new THREE.Vector2((Math.random() - 0.5) * viewWidth, (Math.random() - 0.5) * viewHeight),
            velocity: new THREE.Vector2((Math.random() - 0.5) * 2, -Math.random() * 3 - 2),
            frontTextureUrl: LPCardImageUrls[i % LPCardImageUrls.length],
        });
        scene.add(card.mesh);
        cards.push(card);
    }
    
    const screen1Geo = new THREE.PlaneGeometry(8, 14);
    const screen1Mat = new THREE.MeshBasicMaterial({ color: '#1a1a2e', transparent: true, opacity: 0.7 });
    const screen1Mesh = new THREE.Mesh(screen1Geo, screen1Mat);
    screen1Mesh.position.z = -1;
    scene.add(screen1Mesh);

    const screen2Geo = new THREE.PlaneGeometry(14, 8);
    const screen2Mat = new THREE.MeshBasicMaterial({ color: '#16213e', transparent: true, opacity: 0.7 });
    const screen2Mesh = new THREE.Mesh(screen2Geo, screen2Mat);
    screen2Mesh.position.z = -1;
    scene.add(screen2Mesh);

    const clock = new THREE.Clock();
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const deltaTime = clock.getDelta();

      cards.forEach(card => {
        card.update(deltaTime);
        if (card.mesh.position.y < -viewHeight / 2 - 5) {
          card.reset(viewWidth, viewHeight);
        }
      });
      
      let targetPosition = new THREE.Vector2(0, 0);
      let targetZoom = 1;
      if (activeCamera === 'screen1') {
        targetPosition.copy(settings.screen1.position);
        targetZoom = settings.screen1.zoom;
      } else if (activeCamera === 'screen2') {
        targetPosition.copy(settings.screen2.position);
        targetZoom = settings.screen2.zoom;
      }
      
      camera.position.x += (targetPosition.x - camera.position.x) * 0.05;
      camera.position.y += (targetPosition.y - camera.position.y) * 0.05;
      camera.zoom += (targetZoom - camera.zoom) * 0.05;
      camera.updateProjectionMatrix();

      screen1Mesh.position.x = settings.screen1.position.x;
      screen1Mesh.position.y = settings.screen1.position.y;
      screen2Mesh.position.x = settings.screen2.position.x;
      screen2Mesh.position.y = settings.screen2.position.y;

      renderer.render(scene, camera);
    };
    
    animate();

    const handleResize = () => {
      const newAspect = container.clientWidth / container.clientHeight;
      camera.left = frustumSize * newAspect / -2;
      camera.right = frustumSize * newAspect / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      cards.forEach(card => card.dispose());
      scene.clear();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [settings, activeCamera]);

  return <div ref={mountRef} className={`w-full h-full bg-black rounded-xl overflow-hidden ${className || ''}`} style={{ minHeight: '400px' }} />;
};
