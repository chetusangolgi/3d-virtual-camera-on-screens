import * as THREE from 'three';

interface CardOptions {
  width: number;
  height: number;
  position: THREE.Vector2;
  velocity: THREE.Vector2;
  frontTextureUrl?: string;
}

/**
 * Represents a single 2D card. It is completely self-contained.
 */
export class Card {
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
