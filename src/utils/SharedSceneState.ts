import * as THREE from 'three';
import { Card } from './Card';

interface CardState {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  delay: number;
  startTime: number;
}

class SharedSceneState {
  private static instance: SharedSceneState;
  private cards: CardState[] = [];
  private globalClock: THREE.Clock;
  private isInitialized: boolean = false;

  private constructor() {
    this.globalClock = new THREE.Clock();
    this.globalClock.start();
  }

  public static getInstance(): SharedSceneState {
    if (!SharedSceneState.instance) {
      SharedSceneState.instance = new SharedSceneState();
    }
    return SharedSceneState.instance;
  }

  public initializeCards(cardCount: number = 20): void {
    if (this.isInitialized) return;

    this.cards = [];
    for (let i = 0; i < cardCount; i++) {
      this.cards.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 40,
          20 + Math.random() * 10,
          (Math.random() - 0.5) * 20
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          -Math.random() * 3 - 2,
          (Math.random() - 0.5) * 2
        ),
        angularVelocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        ),
        delay: i * 0.2,
        startTime: this.globalClock.getElapsedTime()
      });
    }
    this.isInitialized = true;
  }

  public getCardStates(): CardState[] {
    return this.cards;
  }

  public updateCardState(index: number, state: Partial<CardState>): void {
    if (this.cards[index]) {
      Object.assign(this.cards[index], state);
    }
  }

  public getGlobalTime(): number {
    return this.globalClock.getElapsedTime();
  }

  public resetCard(index: number): void {
    if (this.cards[index]) {
      this.cards[index].position.set(
        (Math.random() - 0.5) * 40,
        20 + Math.random() * 10,
        (Math.random() - 0.5) * 20
      );
      this.cards[index].velocity.set(
        (Math.random() - 0.5) * 2,
        -Math.random() * 3 - 2,
        (Math.random() - 0.5) * 2
      );
      this.cards[index].angularVelocity.set(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      );
      this.cards[index].rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      this.cards[index].startTime = this.globalClock.getElapsedTime();
    }
  }
}

export { SharedSceneState };
export type { CardState };