// header.component.ts
import { Component, OnInit, OnDestroy, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService, Language } from '../../services/language.service';
import { CartItem, CartSummary } from '../../models/product.interface';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  // Estados do carrinho
  cartOpen = false;
  cartItems: CartItem[] = [];
  totalItems = 0;
  totalPrice = 0;
  
  // Estados da navegação e UI
  mobileMenuOpen = false;
  languageMenuOpen = false;
  
  // Subscription para o carrinho, idioma e autenticação
  private cartSubscription: Subscription = new Subscription();
  private languageSubscription: Subscription = new Subscription();
  private authSubscription: Subscription = new Subscription();

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private languageService: LanguageService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Inscrever-se nas atualizações do carrinho
    this.cartSubscription = this.cartService.getCart().subscribe({
      next: (cartSummary: CartSummary) => {
        this.cartItems = cartSummary.items;
        this.totalItems = cartSummary.totalItems;
        this.totalPrice = cartSummary.totalPrice;
      },
      error: (error) => {
        console.error('Erro ao carregar carrinho:', error);
      }
    });

    // Inscrever-se nas mudanças de autenticação
    this.authSubscription = this.authService.authStatus$.subscribe({
      next: (isLoggedIn) => {
        if (isLoggedIn) {
          // Reset role and check again
          this.userRole = 'user';
          setTimeout(() => this.checkAdminStatus(), 100);
        } else {
          this.userRole = 'user';
        }
      }
    });

    // Verificar role do utilizador quando componente inicializa
    this.checkAdminStatus();

    // Inscrever-se nas mudanças de idioma
    this.languageSubscription = this.languageService.currentLanguage$.subscribe({
      next: (language) => {
        // Language updated
      },
      error: (error) => {
        console.error('Erro ao escutar mudanças de idioma:', error);
      }
    });

    // Simple click outside listener - external JS disabled (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      this.setupSimpleClickOutside();
      this.setupLanguageChangeListener();
    }
  }

  ngOnDestroy(): void {
    // Limpar subscriptions
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // HostListener removido - agora usando overrideExternalCartBehavior()

  // Toggle do carrinho
  toggleCart(): void {
    this.cartOpen = !this.cartOpen;
  }

  // Fechar carrinho
  closeCart(): void {
    this.cartOpen = false;
    
    // Sincronizar com JavaScript externo
    const topCart = document.getElementById('top-cart');
    if (topCart) {
      topCart.classList.remove('top-cart-open');
    }
  }

  // Toggle do menu mobile
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  // Fechar menu mobile
  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  // Métodos de autenticação
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.userRole = 'user'; // Reset role quando faz logout
    this.authService.logout();
    this.closeMobileMenu();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
    this.closeMobileMenu();
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
    this.closeMobileMenu();
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
    this.closeMobileMenu();
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
    this.closeMobileMenu();
  }


  isAdmin(): boolean {
    const loggedIn = this.isLoggedIn();
    const isAdminRole = this.userRole === 'admin';
    return loggedIn && isAdminRole;
  }

  // Método para verificar se o utilizador atual é admin de forma assíncrona
  checkAdminStatus(): void {    
    if (this.isLoggedIn()) {
      this.authService.getProfile().subscribe({
        next: (profile) => {
          this.userRole = profile.role || 'user';
        },
        error: (error) => {
          console.error('Erro ao verificar role do utilizador:', error);
          this.userRole = 'user';
        }
      });
    }
  }

  // Propriedade para armazenar o role do utilizador
  userRole: string = 'user';

  goToHome(): void {
    this.router.navigate(['/']);
    this.closeMobileMenu();
  }

  goToCheckout(): void {
    if (this.isLoggedIn()) {
      this.router.navigate(['/checkout']);
      this.closeCart();
      this.closeMobileMenu();
    } else {
      // Store intended destination and redirect to login
      this.authService.redirectUrl = '/checkout';
      this.router.navigate(['/login']);
      this.closeCart();
      this.closeMobileMenu();
    }
  }

  // Obter total de items
  getTotalItems(): number {
    return this.totalItems;
  }

  // Obter preço total
  getTotalPrice(): number {
    return this.totalPrice;
  }

  // Atualizar quantidade de um item
  updateQuantity(itemId: number, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(itemId);
      return;
    }
    
    this.cartService.updateQuantity(itemId, newQuantity);
  }

  // Remover item do carrinho
  removeItem(itemId: number): void {
    this.cartService.removeFromCart(itemId);
  }

  // Limpar carrinho
  clearCart(): void {
    if (confirm('Tem certeza que deseja limpar o carrinho?')) {
      this.cartService.clearCart();
      this.closeCart();
    }
  }

  // Formatar preço
  formatPrice(price: number): string {
    return price.toFixed(2);
  }


  // Ver carrinho completo
  viewFullCart(): void {
    // Implementar navegação para página do carrinho
    console.log('Ver carrinho completo');
    this.closeCart();
  }

  // Calcular subtotal de um item
  getItemSubtotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  // Verificar se carrinho está vazio
  isCartEmpty(): boolean {
    return this.cartItems.length === 0;
  }

  // Obter mensagem do carrinho vazio
  getEmptyCartMessage(): string {
    return 'O seu carrinho está vazio';
  }

  // Funcionalidades adicionais para futuras implementações
  
  // Adicionar item aos favoritos (placeholder)
  addToWishlist(itemId: number): void {
    console.log('Adicionar aos favoritos:', itemId);
  }

  // Aplicar cupom de desconto (placeholder)
  applyCoupon(couponCode: string): void {
    console.log('Aplicar cupom:', couponCode);
  }

  // Calcular desconto (placeholder)
  getDiscount(): number {
    return 0;
  }

  // Calcular impostos (placeholder)
  getTax(): number {
    return this.totalPrice * 0.1; // 10% de imposto
  }

  // Calcular total final
  getFinalTotal(): number {
    return this.totalPrice + this.getTax() - this.getDiscount();
  }

  // Verificar se há produtos em promoção no carrinho
  hasPromoItems(): boolean {
    return this.cartItems.some(item => {
      // Aqui você verificaria se o item está em promoção
      // Por agora, retornamos false
      return false;
    });
  }

  // Obter economia total (placeholder)
  getTotalSavings(): number {
    let savings = 0;
    this.cartItems.forEach(item => {
      // Calcular economia baseada nos preços originais vs atuais
      // Por agora, retornamos 0
    });
    return savings;
  }

  // Verificar stock de um item
  checkItemStock(itemId: number): boolean {
    // Implementar verificação de stock
    return true;
  }

  // Sugerir produtos relacionados (placeholder)
  getSuggestedProducts(): any[] {
    return [];
  }

  // Calcular tempo estimado de entrega (placeholder)
  getEstimatedDelivery(): string {
    return '2-3 dias úteis';
  }

  // Verificar se o carrinho qualifica para frete grátis
  qualifiesForFreeShipping(): boolean {
    return this.totalPrice >= 50; // Frete grátis acima de $50
  }

  // Calcular quanto falta para frete grátis
  getAmountForFreeShipping(): number {
    const threshold = 50;
    return Math.max(0, threshold - this.totalPrice);
  }

  // ===== MÉTODOS DE IDIOMA =====

  // Toggle do menu de idiomas
  toggleLanguageMenu(): void {
    this.languageMenuOpen = !this.languageMenuOpen;
  }

  // Fechar menu de idiomas
  closeLanguageMenu(): void {
    this.languageMenuOpen = false;
  }

  // Alterar idioma
  changeLanguage(languageCode: string): void {
    this.languageService.setLanguage(languageCode);
    this.closeLanguageMenu();
  }

  // Obter idioma atual
  getCurrentLanguage(): Language {
    return this.languageService.getCurrentLanguageData();
  }

  // Obter outros idiomas disponíveis
  getOtherLanguages(): Language[] {
    return this.languageService.getOtherLanguages();
  }

  // Obter tradução para uma chave
  getTranslation(key: string): string {
    return this.languageService.getTranslation(key);
  }

  private setupSimpleClickOutside(): void {
    document.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      const cartElement = target.closest('#top-cart');
      const languageElement = target.closest('#top-language');
      
      if (!cartElement && this.cartOpen) {
        this.closeCart();
      }
      
      if (!languageElement && this.languageMenuOpen) {
        this.closeLanguageMenu();
      }
    });
  }

  private setupLanguageChangeListener(): void {
    window.addEventListener('languageChanged', (event: any) => {
      // Forçar detecção de mudanças
      setTimeout(() => {
        // Trigger change detection manually if needed
      }, 100);
    });
  }
}