// services/cart.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product, CartItem, CartSummary } from '../models/product.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartSummary>(this.getCartSummary());

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCartFromStorage();
    }
  }

  // Observable para componentes se inscreverem
  getCart(): Observable<CartSummary> {
    return this.cartSubject.asObservable();
  }

  // Adicionar produto ao carrinho
  addToCart(product: Product, quantity: number = 1): void {
    if (!product.inStock) {
      console.warn('Produto fora de Stock');
      return;
    }

    const existingItemIndex = this.cartItems.findIndex(item => item.id === product.id);
    
    if (existingItemIndex > -1) {
      // Produto já existe, aumentar quantidade
      this.cartItems[existingItemIndex].quantity += quantity;
    } else {
      // Novo produto
      const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      };
      this.cartItems.push(cartItem);
    }

    this.updateCart();
  }

  // Remover item do carrinho
  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(item => item.id !== productId);
    this.updateCart();
  }

  // Atualizar quantidade de um item
  updateQuantity(productId: number, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const itemIndex = this.cartItems.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
      this.cartItems[itemIndex].quantity = newQuantity;
      this.updateCart();
    }
  }

  // Limpar carrinho
  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  // Obter resumo do carrinho
  private getCartSummary(): CartSummary {
    const totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
      totalItems,
      totalPrice,
      items: [...this.cartItems]
    };
  }

  // Atualizar carrinho e notificar observadores
  private updateCart(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.saveCartToStorage();
    }
    this.cartSubject.next(this.getCartSummary());
  }

  // Salvar carrinho no localStorage
  private saveCartToStorage(): void {
    try {
      localStorage.setItem('shopping_cart', JSON.stringify(this.cartItems));
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
    }
  }

  // Carregar carrinho do localStorage
  private loadCartFromStorage(): void {
    try {
      const savedCart = localStorage.getItem('shopping_cart');
      if (savedCart) {
        this.cartItems = JSON.parse(savedCart);
        this.cartSubject.next(this.getCartSummary());
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      this.cartItems = [];
    }
  }

  // Verificar se produto está no carrinho
  isInCart(productId: number): boolean {
    return this.cartItems.some(item => item.id === productId);
  }

  // Obter quantidade de um produto no carrinho
  getProductQuantity(productId: number): number {
    const item = this.cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  }
}