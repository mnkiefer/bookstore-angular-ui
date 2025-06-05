import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  standalone: true,
})
export class Cart {
  @Input() items: any[] = [];

  get total() {
    return this.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  }

  remove(index: number) {
    this.quantityChange(index, 0);
  }

  quantityChange(index: number, newQty: number) {
    newQty = Math.max(0, Math.floor(Number(newQty) || 0));
    if (newQty <= 0) {
      this.items.splice(index, 1);
    } else {
      this.items[index].quantity = newQty;
    }
  }
}
