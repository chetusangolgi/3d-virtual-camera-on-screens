import * as THREE from 'three';

interface PageOptions {
  width: number;
  height: number;
  content: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  backgroundColor: string;
  textColor: string;
}

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
    this.texture.magFilter = THREE.LinearFilter;
  }

  private createMesh(options: PageOptions): void {
    const geometry = new THREE.PlaneGeometry(options.width, options.height);
    
    // Create material with the canvas texture
    const material = new THREE.MeshLambertMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide
    });

    // Add a slight emissive property for better visibility
    material.emissive = new THREE.Color(0x111111);

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(options.position);
    this.mesh.rotation.copy(options.rotation);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // Add border frame
    const borderGeometry = new THREE.EdgesGeometry(geometry);
    const borderMaterial = new THREE.LineBasicMaterial({ 
      color: 0x444444,
      linewidth: 2
    });
    const borderLines = new THREE.LineSegments(borderGeometry, borderMaterial);
    this.mesh.add(borderLines);
  }

  private updateContent(content: string, backgroundColor: string, textColor: string): void {
    const ctx = this.context;
    const canvas = this.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fill background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, backgroundColor);
    gradient.addColorStop(1, this.darkenColor(backgroundColor, 0.3));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle border
    ctx.strokeStyle = this.lightenColor(backgroundColor, 0.2);
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    // Draw text content
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const lines = content.split('\n');
    const lineHeight = 60;
    const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
    
    lines.forEach((line, index) => {
      if (index === 0) {
        // Title
        ctx.font = 'bold 48px Arial, sans-serif';
      } else {
        // Subtitle
        ctx.font = '32px Arial, sans-serif';
        ctx.fillStyle = this.lightenColor(textColor, -0.3);
      }
      
      ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
    });
    
    // Add decorative elements
    this.addDecorations(backgroundColor);
    
    // Update texture
    this.texture.needsUpdate = true;
  }

  private addDecorations(backgroundColor: string): void {
    const ctx = this.context;
    const canvas = this.canvas;
    
    // Add corner decorations
    ctx.fillStyle = this.lightenColor(backgroundColor, 0.1);
    
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(60, 20);
    ctx.lineTo(20, 60);
    ctx.closePath();
    ctx.fill();
    
    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(canvas.width - 20, canvas.height - 20);
    ctx.lineTo(canvas.width - 60, canvas.height - 20);
    ctx.lineTo(canvas.width - 20, canvas.height - 60);
    ctx.closePath();
    ctx.fill();
    
    // Add some tech-like grid lines
    ctx.strokeStyle = this.lightenColor(backgroundColor, 0.05);
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 5; i++) {
      const y = 100 + i * 40;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(canvas.width - 40, y);
      ctx.stroke();
    }
  }

  private lightenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.round(255 * amount));
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.round(255 * amount));
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.round(255 * amount));
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  private darkenColor(color: string, amount: number): string {
    return this.lightenColor(color, -amount);
  }

  public dispose(): void {
    if (this.mesh.geometry) {
      this.mesh.geometry.dispose();
    }
    
    if (this.mesh.material) {
      (this.mesh.material as THREE.MeshLambertMaterial).dispose();
    }
    
    if (this.texture) {
      this.texture.dispose();
    }
  }
}