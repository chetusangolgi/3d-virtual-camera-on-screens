import * as THREE from 'three';
import { Card } from './Card';
import { Page } from './Page';
import { SharedSceneState } from './SharedSceneState';

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private cards: Card[] = [];
  private pages: Page[] = [];
  private animationId: number | null = null;
  private clock: THREE.Clock;
  private sharedState: SharedSceneState;

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.sharedState = SharedSceneState.getInstance();
    
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initLighting();
    this.initPages();
    this.initCards();
    
    this.handleResize();
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);
    
    // Add fog for depth
    this.scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);
  }

  private initCamera(): void {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    
    // Position camera to capture both pages
    this.camera.position.set(0, 10, 25);
    this.camera.lookAt(0, 0, 0);
  }

  private initRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    this.container.appendChild(this.renderer.domElement);
  }

  private initLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    this.scene.add(directionalLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x4080ff, 0.4);
    fillLight.position.set(-10, 5, -5);
    this.scene.add(fillLight);

    // Point lights for cards
    const pointLight1 = new THREE.PointLight(0xff6b6b, 0.8, 30);
    pointLight1.position.set(-15, 15, 0);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4ecdc4, 0.8, 30);
    pointLight2.position.set(15, 15, 0);
    this.scene.add(pointLight2);
  }

  private initPages(): void {
    // Page 1 (Portrait - 1080x1920)
    const page1 = new Page({
      width: 8,
      height: 14,
      content: 'Screen 1\n1080×1920',
      position: new THREE.Vector3(-12, 0, -5),
      rotation: new THREE.Euler(0, 0.3, 0),
      backgroundColor: '#1a1a2e',
      textColor: '#eee'
    });
    this.pages.push(page1);
    this.scene.add(page1.mesh);

    // Page 2 (Landscape - 1920x1080)
    const page2 = new Page({
      width: 14,
      height: 8,
      content: 'Screen 2\n1920×1080',
      position: new THREE.Vector3(12, -3, -5),
      rotation: new THREE.Euler(0, -0.3, 0),
      backgroundColor: '#16213e',
      textColor: '#eee'
    });
    this.pages.push(page2);
    this.scene.add(page2.mesh);
  }

  private initCards(): void {
    const cardCount = 20;
    this.sharedState.initializeCards(cardCount);
    const cardStates = this.sharedState.getCardStates();
    
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
        index: i
      });
      
      this.cards.push(card);
      this.scene.add(card.mesh);
    }
  }

  public startAnimation(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      
      const deltaTime = this.clock.getDelta();
      const elapsedTime = this.clock.getElapsedTime();
      
      this.updateCards(deltaTime, elapsedTime);
      this.updateCamera(elapsedTime);
      
      this.renderer.render(this.scene, this.camera);
    };
    
    animate();
  }

  private updateCards(deltaTime: number, elapsedTime: number): void {
    this.cards.forEach(card => {
      card.update(deltaTime, this.sharedState.getGlobalTime());
      
      // Reset card if it falls too low
      if (card.mesh.position.y < -30) {
        card.reset(new THREE.Vector3(0, 0, 0)); // Position will be set by shared state
      }
    });
  }

  private updateCamera(elapsedTime: number): void {
    // Gentle camera movement
    const radius = 25;
    const speed = 0.1;
    
    this.camera.position.x = Math.cos(elapsedTime * speed) * radius * 0.3;
    this.camera.position.y = 10 + Math.sin(elapsedTime * speed * 0.7) * 3;
    this.camera.position.z = radius + Math.sin(elapsedTime * speed * 0.5) * 5;
    
    this.camera.lookAt(0, 0, 0);
  }

  public handleResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  public dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.cards.forEach(card => card.dispose());
    this.pages.forEach(page => page.dispose());
    
    this.renderer.dispose();
    
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}