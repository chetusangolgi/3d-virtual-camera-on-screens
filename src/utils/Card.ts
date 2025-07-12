import * as THREE from 'three';
import { SharedSceneState } from './SharedSceneState';

interface CardOptions {
  width: number;
  height: number;
  thickness: number;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  delay: number;
  index: number;
  frontTextureUrl?: string;
  backTextureUrl?: string;
}

export class Card {
  public mesh: THREE.Mesh;
  private velocity: THREE.Vector3;
  private angularVelocity: THREE.Vector3;
  private delay: number;
  private gravity: number = -9.8;
  private startTime: number;
  private index: number;
  private sharedState: SharedSceneState;
  private textureLoader: THREE.TextureLoader; // Add texture loader

  constructor(options: CardOptions) {
    this.velocity = options.velocity.clone();
    this.angularVelocity = options.angularVelocity.clone();
    this.delay = options.delay;
    this.startTime = 0;
    this.index = options.index;
    this.sharedState = SharedSceneState.getInstance();
    this.textureLoader = new THREE.TextureLoader(); // Initialize texture loader
    
    this.createMesh(options);
    this.syncWithSharedState();
  }

  private syncWithSharedState(): void {
    const cardStates = this.sharedState.getCardStates();
    if (cardStates[this.index]) {
      const state = cardStates[this.index];
      this.mesh.position.copy(state.position);
      this.mesh.rotation.copy(state.rotation);
      this.velocity.copy(state.velocity);
      this.angularVelocity.copy(state.angularVelocity);
      this.delay = state.delay;
      this.startTime = state.startTime;
    }
  }

  private createMesh(options: CardOptions): void {
    // Create card geometry
    const geometry = new THREE.BoxGeometry(
      options.width, 
      options.height, 
      options.thickness
    );

    const materials = [
      // Right face
      new THREE.MeshLambertMaterial({
        color: 0x2c3e50,
        transparent: true,
        opacity: 0.9
      }),
      // Left face
      new THREE.MeshLambertMaterial({
        color: 0x34495e,
        transparent: true,
        opacity: 0.9
      }),
      // Top face
      new THREE.MeshLambertMaterial({
        color: 0xe74c3c,
        transparent: true,
        opacity: 0.9
      }),
      // Bottom face
      new THREE.MeshLambertMaterial({
        color: 0xc0392b,
        transparent: true,
        opacity: 0.9
      }),
      // Front face
      new THREE.MeshLambertMaterial({
        map: options.frontTextureUrl ? this.textureLoader.load(options.frontTextureUrl) : undefined,
        color: options.frontTextureUrl ? 0xffffff : 0x3498db,
        transparent: true,
        opacity: 0.9
      }),
      // Back face
      new THREE.MeshLambertMaterial({
        map: options.backTextureUrl ? this.textureLoader.load(options.backTextureUrl) : undefined,
        color: options.backTextureUrl ? 0xffffff : 0x2980b9,
        transparent: true,
        opacity: 0.9
      })
    ];

    this.mesh = new THREE.Mesh(geometry, materials);
    this.mesh.position.copy(options.position);
    this.mesh.rotation.copy(options.rotation);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // Add edge highlight
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.3 
    });
    const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
    this.mesh.add(edgeLines);
  }

  public update(deltaTime: number, elapsedTime: number): void {
    // Check if delay period has passed
    const globalTime = this.sharedState.getGlobalTime();
    if (globalTime - this.startTime < this.delay) {
      return;
    }

    const effectiveTime = globalTime - this.startTime - this.delay;
    
    // Apply gravity to velocity
    this.velocity.y += this.gravity * deltaTime;
    
    // Update position
    this.mesh.position.add(
      this.velocity.clone().multiplyScalar(deltaTime)
    );
    
    // Update rotation
    this.mesh.rotation.x += this.angularVelocity.x * deltaTime;
    this.mesh.rotation.y += this.angularVelocity.y * deltaTime;
    this.mesh.rotation.z += this.angularVelocity.z * deltaTime;
    
    // Add some air resistance
    this.velocity.multiplyScalar(0.998);
    this.angularVelocity.multiplyScalar(0.995);

    // Update shared state
    this.sharedState.updateCardState(this.index, {
      position: this.mesh.position.clone(),
      rotation: this.mesh.rotation.clone(),
      velocity: this.velocity.clone(),
      angularVelocity: this.angularVelocity.clone()
    });
  }

  public reset(newPosition: THREE.Vector3): void {
    this.sharedState.resetCard(this.index);
    this.syncWithSharedState();
  }

  public dispose(): void {
    if (this.mesh.geometry) {
      this.mesh.geometry.dispose();
    }
    
    if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach(material => material.dispose());
    } else if (this.mesh.material) {
      this.mesh.material.dispose();
    }
  }
}