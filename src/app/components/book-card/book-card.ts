import { Component, Input, ViewChild, ElementRef, Output, EventEmitter, Renderer2 } from '@angular/core';
import confetti from 'confetti-js';

declare module 'confetti-js';

@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.html',
  styleUrl: './book-card.scss',
  standalone: true,
  inputs: ['flipped']
})
export class BookCard {
  @Input() book: any;
  @Input() flipped = false;
  @Output() addToCartEvent = new EventEmitter<any>();
  @Output() flipEvent = new EventEmitter<boolean>();
  @ViewChild('confettiCanvas', { static: false }) confettiCanvas?: ElementRef;

  constructor(private renderer: Renderer2) {}

  flip(state: boolean) {
    this.flipEvent.emit(state);
  }

  addToCart(event: Event) {
    event.stopPropagation();
    this.launchConfetti();
    this.addToCartEvent.emit(this.book);
  }

  launchConfetti() {
    if (this.confettiCanvas) {
      const canvas = this.confettiCanvas.nativeElement as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      const confettiSettings = {
        target: canvas,
        max: 32,
        size: 1.1,
        animate: true,
        props: ['circle', 'square', 'triangle'],
        colors: [
          [180, 200, 255],
          [255, 210, 230],
          [220, 255, 230],
          [255, 245, 180],
          [210, 220, 255],
        ],
        clock: 24,
        rotate: false,
        width: canvas.width,
        height: canvas.height,
        start_from_edge: false,
        respawn: false,
      };
      const confettiInstance = new confetti(confettiSettings);
      confettiInstance.render();
      setTimeout(() => {
        confettiInstance.clear();
      }, 900);
    }
  }

  onCardClick() {
    this.flipEvent.emit(!this.flipped);
  }
}
