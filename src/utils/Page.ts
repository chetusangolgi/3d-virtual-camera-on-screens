import * as THREE from 'three';

// Options for creating a 2D page background.
interface PageOptions {
  width: number;
  height: number;
  content: string;
  position: THREE.Vector2;
  backgroundColor: string;
  textColor: string;
}

// Represents a 2D background plane for a screen.
export class Page {
  public mesh: THREE.Mesh;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;

  constructor(options: PageOptions) {
    this.createCanvas(options);
    this.createMesh(options);
    this.updateContent(options.content, options.backgroundColor, options.textColor);
  }

  private createCanvas(options: PageOptions): void {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = Math.round(512 * (options.height / options.width));
    this.context = this.canvas.getContext('2d')!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;
  }

  private createMesh(options: PageOptions): void {
    const geometry = new THREE.PlaneGeometry(options.width, options.height);
    const material = new THREE.MeshLambertMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide
    });
    this.mesh = new THREE.Mesh(geometry, material);
    // Position it behind the cards on the z-axis.
    this.mesh.position.set(options.position.x, options.position.y, -1);
  }
  
  // Draws the text content onto the canvas texture.
  private updateContent(content: string, backgroundColor: string, textColor: string): void {
    const ctx = this.context;
    const canvas = this.canvas;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = textColor;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, canvas.height / 2 + (i - (lines.length -1)/2) * 45);
    });
    this.texture.needsUpdate = true;
  }

  public setPosition(position: THREE.Vector2) {
      this.mesh.position.set(position.x, position.y, -1);
  }

  public dispose(): void {
    this.mesh.geometry?.dispose();
    (this.mesh.material as THREE.Material)?.dispose();
    this.texture?.dispose();
  }
}
