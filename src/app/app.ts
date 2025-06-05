import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BookCard } from './components/book-card/book-card';
import { Cart } from './components/cart/cart';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SAMPLE_BOOKS } from './sample-books';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BookCard, Cart, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'bookstore-frontend';
  books: any[] = [];
  visibleBooks: any[] = [];
  flippedBooks: { [id: string]: boolean } = {};
  cartItems: any[] = [];
  currentSlide = 0;
  cardsPerView = 3;
  searchTerm = '';
  touchStartX = 0;
  touchEndX = 0;
  isDragging = false;
  dragStartX = 0;
  dragCurrentX = 0;
  dragDelta = 0;
  dragThreshold = 60;
  cartOpen = false;
  dragOffset = 0;
  showFireworks = false;
  fireworksTimeout: any;
  fireworksStyle: any = {};
  fireworksBurst1: {x: number, y: number}[] = [];
  fireworksBurst2: {x: number, y: number}[] = [];

  public Math = Math;

  constructor(private http: HttpClient) {
    this.books = SAMPLE_BOOKS;
    this.currentSlide = 0;
    this.cardsPerView = 3;
    this.updateVisibleBooks();
    for (let c = 0; c < 8; c++) {
      this.fireworksBurst1.push({
        x: 60 + 48 * Math.cos((c / 8) * 2 * Math.PI),
        y: 60 + 48 * Math.sin((c / 8) * 2 * Math.PI)
      });
      this.fireworksBurst2.push({
        x: 60 + 32 * Math.cos((c / 8) * 2 * Math.PI + 0.4),
        y: 60 + 32 * Math.sin((c / 8) * 2 * Math.PI + 0.4)
      });
    }
  }

  fetchBooks() {
    this.http.get<any[]>('/api/books').subscribe(data => {
      this.books = data;
    });
  }

  prevSlide(event?: Event) {
    if (event) event.preventDefault();
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updateVisibleBooks();
    }
  }

  nextSlide(event?: Event) {
    if (event) event.preventDefault();
    const maxSlide = Math.max(this.filteredBooks().length - this.cardsPerView, 0);
    if (this.currentSlide < maxSlide) {
      this.currentSlide++;
      this.updateVisibleBooks();
    }
  }

  onDragStart(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    this.dragStartX = (event instanceof TouchEvent) ? event.touches[0].clientX : event.clientX;
    this.dragCurrentX = this.dragStartX;
    this.dragOffset = 0;
  }

  onDragMove(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;
    this.dragCurrentX = (event instanceof TouchEvent) ? event.touches[0].clientX : event.clientX;
    this.dragOffset = this.dragCurrentX - this.dragStartX;
  }

  onDragEnd(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.dragOffset < -this.dragThreshold && this.currentSlide < this.filteredBooks().length - this.cardsPerView) {
      this.currentSlide++;
    } else if (this.dragOffset > this.dragThreshold && this.currentSlide > 0) {
      this.currentSlide--;
    }
    this.updateVisibleBooks();
    this.dragOffset = 0;
  }

  addToCart(book: any) {
    const bookId = String(book.id);
    const existingItem = this.cartItems.find(item => String(item.id) === bookId);
    if (existingItem) {
      existingItem.quantity = Number(existingItem.quantity || 0) + 1;
      this.cartItems = [...this.cartItems];
    } else {
      const { id, title, author, price, image, cover } = book;
      this.cartItems = [
        ...this.cartItems,
        {
          id,
          title,
          author,
          price,
          image: image || cover || '/assets/default-cover.png',
          cover: cover || image || '/assets/default-cover.png',
          quantity: 1
        }
      ];
    }
    this.cartItems = [...this.cartItems];
    this.triggerFireworks();
  }

  triggerFireworks(event?: MouseEvent) {
    if (event) {
      const cardElem = (event.target as HTMLElement).closest('.carousel-slide');
      if (cardElem) {
        const rect = cardElem.getBoundingClientRect();
        this.fireworksStyle = {
          position: 'fixed',
          left: rect.left + rect.width / 2 + 'px',
          top: rect.top + rect.height / 2 + 'px',
          transform: 'translate(-50%, -50%)',
          width: '0',
          height: '0',
          zIndex: 1000
        };
      } else {
        this.fireworksStyle = { left: '50vw', top: '50vh', transform: 'translate(-50%,-50%)' };
      }
    } else {
      this.fireworksStyle = { left: '50vw', top: '50vh', transform: 'translate(-50%,-50%)' };
    }
    this.showFireworks = true;
    if (this.fireworksTimeout) clearTimeout(this.fireworksTimeout);
    this.fireworksTimeout = setTimeout(() => {
      this.showFireworks = false;
    }, 1200);
  }

  onCardDblClick(event: Event, card: any) {
    if (event) event.stopPropagation();
    card.flipped = !card.flipped;
  }

  setFlipped(bookId: string, flipped: boolean) {
    this.flippedBooks[bookId] = flipped;
  }

  onSearch() {
    this.currentSlide = 0;
    this.updateVisibleBooks();
  }

  filteredBooks() {
    if (!this.searchTerm.trim()) return this.books;
    const term = this.searchTerm.toLowerCase();
    return this.books.filter(book =>
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term)
    );
  }

  updateVisibleBooks() {
    const filtered = this.filteredBooks();
    if (filtered.length <= this.cardsPerView) {
      this.currentSlide = 0;
      const emptySlots = this.cardsPerView - filtered.length;
      const leftPad = Math.floor(emptySlots / 2);
      const rightPad = emptySlots - leftPad;
      this.visibleBooks = [
        ...Array(leftPad).fill(null),
        ...filtered.map(book => ({ ...book })),
        ...Array(rightPad).fill(null)
      ];
    } else {
      const maxSlide = Math.max(filtered.length - this.cardsPerView, 0);
      if (this.currentSlide > maxSlide) {
        this.currentSlide = maxSlide;
      }
      if (this.currentSlide < 0) {
        this.currentSlide = 0;
      }
      const left = Math.floor(this.cardsPerView / 2);
      let start = this.currentSlide;
      let end = this.currentSlide + this.cardsPerView;
      if (start < 0) {
        end += -start;
        start = 0;
      }
      if (end > filtered.length) {
        start -= (end - filtered.length);
        end = filtered.length;
        if (start < 0) start = 0;
      }
      this.visibleBooks = filtered.slice(start, end).map(book => ({ ...book }));
      const padLeft = Math.max(0, 0 - start);
      const padRight = Math.max(0, this.cardsPerView - this.visibleBooks.length - padLeft);
      this.visibleBooks = [
        ...Array(padLeft).fill(null),
        ...this.visibleBooks,
        ...Array(padRight).fill(null)
      ];
    }
    const fallbackImg = '/assets/default-cover.png';
    this.visibleBooks = this.visibleBooks.map(book => {
      if (book && !book.image) {
        return { ...book, image: fallbackImg };
      }
      return book;
    });
  }

  toggleCart() {
    this.cartOpen = !this.cartOpen;
  }

  removeFromCart(book: any) {
    const index = this.cartItems.findIndex(item => item.id === book.id);
    if (index !== -1) {
      this.cartItems.splice(index, 1);
    }
  }

  clearCart() {
    this.cartItems = [];
  }

  get totalPrice() {
    return this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  goToSlide(idx: number) {
    const maxSlide = Math.max(this.filteredBooks().length - this.cardsPerView, 0);
    this.currentSlide = Math.max(0, Math.min(idx, maxSlide));
    this.updateVisibleBooks();
  }

  get paginationArray() {
    const total = Math.max(this.filteredBooks().length - this.cardsPerView + 1, 1);
    return Array.from({ length: total });
  }

  get cartBadgeCount() {
    return this.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }
}
