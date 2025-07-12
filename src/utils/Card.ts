import * as THREE from 'three';
import { SharedSceneState } from './SharedSceneState';

// Options for creating a 2D card.
interface CardOptions {
  width: number;
  height: number;
  position: THREE.Vector2;
  rotation: number;
  velocity: THREE.Vector2;
  angularVelocity: number;
  delay: number;
  index: number;
  frontTextureUrl?: string;
}

// Represents a single 2D card with physics.
export class Card {
  public mesh: THREE.Mesh;
  private velocity: THREE.Vector2;
  private angularVelocity: number;
  private delay: number;
  // Reduced gravity for a slower falling effect.
  private gravity: number = -2.0; 
  private startTime: number;
  private index: number;
  private sharedState: SharedSceneState;
  private textureLoader: THREE.TextureLoader;
  private viewWidth: number;
  private viewHeight: number;

  constructor(options: CardOptions, viewWidth: number, viewHeight: number) {
    this.velocity = options.velocity.clone();
    this.angularVelocity = options.angularVelocity;
    this.delay = options.delay;
    this.startTime = 0;
    this.index = options.index;
    this.sharedState = SharedSceneState.getInstance();
    this.textureLoader = new THREE.TextureLoader();
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    
    this.createMesh(options);
    this.syncWithSharedState();
  }

  // Syncs the card's state with the global shared state.
  private syncWithSharedState(): void {
    const cardStates = this.sharedState.getCardStates();
    if (cardStates[this.index]) {
      const state = cardStates[this.index];
      this.mesh.position.set(state.position.x, state.position.y, 0);
      this.mesh.rotation.z = state.rotation; // Rotation is now around the Z axis.
      this.velocity.copy(state.velocity);
      this.angularVelocity = state.angularVelocity;
      this.delay = state.delay;
      this.startTime = state.startTime;
    }
  }

  // Creates the card mesh using a flat plane.
  private createMesh(options: CardOptions): void {
    const geometry = new THREE.PlaneGeometry(options.width, options.height);
    const material = new THREE.MeshLambertMaterial({
      map: options.frontTextureUrl ? this.textureLoader.load(options.frontTextureUrl) : undefined,
      color: options.frontTextureUrl ? 0xffffff : 0x3498db,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(options.position.x, options.position.y, 0);
    this.mesh.rotation.z = options.rotation;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }

  // Updates the card's position and rotation based on 2D physics.
  public update(deltaTime: number): void {
    const globalTime = this.sharedState.getGlobalTime();
    if (globalTime - this.startTime < this.delay) {
      return;
    }
    
    this.velocity.y += this.gravity * deltaTime;
    this.mesh.position.x += this.velocity.x * deltaTime;
    this.mesh.position.y += this.velocity.y * deltaTime;
    this.mesh.rotation.z += this.angularVelocity * deltaTime;
    
    // Slightly reduced air resistance to maintain momentum longer.
    this.velocity.multiplyScalar(0.999);
    this.angularVelocity *= 0.998;

    this.sharedState.updateCardState(this.index, {
      position: new THREE.Vector2(this.mesh.position.x, this.mesh.position.y),
      rotation: this.mesh.rotation.z,
      velocity: this.velocity.clone(),
      angularVelocity: this.angularVelocity
    });
  }

  public reset(): void {
    this.sharedState.resetCard(this.index, this.viewWidth, this.viewHeight);
    this.syncWithSharedState();
  }

  public dispose(): void {
    this.mesh.geometry?.dispose();
    if (Array.isArray(this.mesh.material)) {
        this.mesh.material.forEach(m => m.dispose());
    } else {
        (this.mesh.material as THREE.Material)?.dispose();
    }
  }
}
