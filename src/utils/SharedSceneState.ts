import * as THREE from 'three';

// Defines the state for each card in a 2D space.
export interface CardState {
  position: THREE.Vector2; // Uses a 2D vector for position (x, y).
  rotation: number; // Uses a single number for 2D rotation.
  velocity: THREE.Vector2; // 2D vector for velocity.
  angularVelocity: number; // Single number for rotational speed.
  delay: number;
  startTime: number;
}

// A singleton class to manage the shared state of all cards in the scene.
export class SharedSceneState {
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

  // Initializes the state for a given number of cards within the view dimensions.
  public initializeCards(cardCount: number, viewWidth: number, viewHeight: number): void {
    if (this.isInitialized) return;

    this.cards = [];
    for (let i = 0; i < cardCount; i++) {
      this.cards.push({
        // Start cards higher up, just above the screen view.
        position: new THREE.Vector2(
          (Math.random() - 0.5) * viewWidth,
          viewHeight / 2 + 5 + Math.random() * 5 
        ),
        rotation: Math.random() * Math.PI * 2,
        // Reduced initial velocity for a slower start.
        velocity: new THREE.Vector2(
          (Math.random() - 0.5) * 1,
          -Math.random() * 1.5 - 1
        ),
        angularVelocity: (Math.random() - 0.5) * 0.3,
        // Increased delay for a more staggered, continuous stream.
        delay: i * 0.5,
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

  // Resets a card to a new random state, ready to fall again.
  public resetCard(index: number, viewWidth: number, viewHeight: number): void {
    if (this.cards[index]) {
      // Reset cards to a position just above the screen.
      this.cards[index].position.set(
        (Math.random() - 0.5) * viewWidth,
        viewHeight / 2 + 5
      );
      // Reset with a slow initial velocity.
      this.cards[index].velocity.set(
        (Math.random() - 0.5) * 1,
        -Math.random() * 1.5 - 1
      );
      this.cards[index].angularVelocity = (Math.random() - 0.5) * 0.3;
      this.cards[index].rotation = Math.random() * Math.PI * 2;
      this.cards[index].startTime = this.globalClock.getElapsedTime();
    }
  }
}
