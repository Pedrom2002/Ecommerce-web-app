// product-single.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { LanguageService } from '../../services/language.service';
import { Product } from '../../models/product.interface';

interface Review {
  id: number;
  author: string;
  date: string;
  rating: number;
  comment: string;
  avatar: string;
}

@Component({
  selector: 'app-product-single',
  templateUrl: './product-single.component.html',
  styleUrls: ['./product-single.component.css']
})
export class ProductSingleComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  quantity: number = 1;
  activeTab: string = 'description';
  
  // Estados da UI
  isLoading: boolean = true;
  alertMessage: string = '';
  alertType: string = '';
  
  // Reviews mock
  reviews: Review[] = [
    {
      id: 1,
      author: 'John Doe',
      date: 'April 24, 2021 at 10:46AM',
      rating: 4.5,
      comment: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo perferendis aliquid tenetur. Aliquid, tempora, sit aliquam officiis nihil autem eum at repellendus facilis quaerat consequatur commodi laborum saepe non nemo nam maxime quis error tempore possimus est quasi reprehenderit fuga!',
      avatar: 'https://0.gravatar.com/avatar/ad516503a11cd5ca435acc9bb6523536?s=60'
    },
    {
      id: 2,
      author: 'Mary Jane',
      date: 'June 16, 2021 at 6:00PM',
      rating: 3,
      comment: 'Quasi, blanditiis, neque ipsum numquam odit asperiores hic dolor necessitatibus libero sequi amet voluptatibus ipsam velit qui harum temporibus cum nemo iste aperiam explicabo fuga odio ratione sint fugiat consequuntur vitae adipisci delectus eum incidunt possimus tenetur excepturi at accusantium quod doloremque reprehenderit aut expedita labore error atque?',
      avatar: 'https://0.gravatar.com/avatar/ad516503a11cd5ca435acc9bb6523536?s=60'
    }
  ];
  
  // Form de review
  reviewForm = {
    name: '',
    email: '',
    rating: '',
    comment: ''
  };
  
  private routeSubscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      const productId = +params['id'];
      if (productId) {
        this.loadProduct(productId);
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  // Carregar produto
  loadProduct(productId: number): void {
    this.isLoading = true;
    
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        if (product) {
          this.product = product;
          this.loadRelatedProducts();
        } else {
          this.showAlert('danger', this.getTranslation('product_not_found'));
          this.router.navigate(['/']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produto:', error);
        this.showAlert('danger', this.getTranslation('product_load_error'));
        this.isLoading = false;
      }
    });
  }

  // Carregar produtos relacionados
  loadRelatedProducts(): void {
    if (!this.product) return;
    
    this.productService.getProductsByCategory(this.product.category).subscribe({
      next: (products) => {
        // Excluir o produto atual e pegar apenas 4 relacionados
        this.relatedProducts = products
          .filter(p => p.id !== this.product!.id)
          .slice(0, 4);
      },
      error: (error) => {
        console.error('Erro ao carregar produtos relacionados:', error);
      }
    });
  }

  // Atualizar quantidade
  updateQuantity(change: number): void {
    const newQuantity = this.quantity + change;
    if (newQuantity >= 1 && newQuantity <= 99) {
      this.quantity = newQuantity;
    }
  }

  // Definir quantidade diretamente
  setQuantity(value: number): void {
    if (value >= 1 && value <= 99) {
      this.quantity = value;
    }
  }

  // Adicionar ao carrinho
  addToCart(): void {
    if (!this.product) return;
    
    if (!this.product.inStock) {
      this.showAlert('warning', this.getTranslation('product_out_of_stock'));
      return;
    }

    this.cartService.addToCart(this.product, this.quantity);
    this.showAlert('success', `${this.quantity} x ${this.product.name} ${this.getTranslation('product_added_to_cart')}!`);
  }

  // Verificar se produto está no carrinho
  isInCart(): boolean {
    return this.product ? this.cartService.isInCart(this.product.id) : false;
  }

  // Obter quantidade no carrinho
  getCartQuantity(): number {
    return this.product ? this.cartService.getProductQuantity(this.product.id) : 0;
  }

  // Navegar para produto relacionado
  viewRelatedProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  // Adicionar produto relacionado ao carrinho
  addRelatedToCart(product: Product, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!product.inStock) {
      this.showAlert('warning', `${product.name} ${this.getTranslation('product_is_out_of_stock')}`);
      return;
    }

    this.cartService.addToCart(product, 1);
    this.showAlert('success', `${product.name} ${this.getTranslation('product_added_to_cart')}!`);
  }

  // Gerar array de estrelas para rating
  getStarArray(rating: number): string[] {
    return this.productService.getStarArray(rating);
  }

  // Mudar aba ativa
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Submeter review
  submitReview(): void {
    if (!this.reviewForm.name || !this.reviewForm.email || !this.reviewForm.rating || !this.reviewForm.comment) {
      this.showAlert('warning', this.getTranslation('product_fill_required_fields'));
      return;
    }

    // Simular submissão de review
    const newReview: Review = {
      id: this.reviews.length + 1,
      author: this.reviewForm.name,
      date: new Date().toLocaleDateString('pt-PT'),
      rating: +this.reviewForm.rating,
      comment: this.reviewForm.comment,
      avatar: 'https://0.gravatar.com/avatar/default?s=60'
    };

    this.reviews.unshift(newReview);
    this.reviewForm = { name: '', email: '', rating: '', comment: '' };
    this.showAlert('success', this.getTranslation('product_review_submitted'));
  }

  // Mostrar alerta
  showAlert(type: 'success' | 'danger' | 'warning' | 'info', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    
    setTimeout(() => {
      this.alertMessage = '';
    }, 4000);
  }

  // Partilhar produto
  shareProduct(platform: string): void {
    if (!this.product) return;
    
    const url = window.location.href;
    const text = `${this.getTranslation('product_check_this_product')}: ${this.product.name}`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }
    
    if (platform === 'email') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }

  // Copiar link
  copyLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.showAlert('success', this.getTranslation('product_link_copied'));
    }).catch(() => {
      this.showAlert('warning', this.getTranslation('product_link_copy_failed'));
    });
  }

  // Formatar preço
  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  // Calcular desconto percentual
  getDiscountPercentage(): number {
    if (!this.product || !this.product.originalPrice) return 0;
    
    const discount = ((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100;
    return Math.round(discount);
  }

  // Verificar se produto tem desconto
  hasDiscount(): boolean {
    return this.product ? !!this.product.originalPrice && this.product.originalPrice > this.product.price : false;
  }

  // Obter texto do botão do carrinho
  getCartButtonText(): string {
    if (!this.product) return this.getTranslation('product_add_to_cart');
    
    if (!this.product.inStock) {
      return this.getTranslation('product_out_of_stock');
    }
    
    const cartQuantity = this.getCartQuantity();
    return cartQuantity > 0 ? 
      `${this.getTranslation('product_add_more')} (${cartQuantity} ${this.getTranslation('product_in_cart')})` : 
      this.getTranslation('product_add_to_cart');
  }

  // Obter classe CSS do botão do carrinho
  getCartButtonClass(): string {
    if (!this.product || !this.product.inStock) {
      return 'add-to-cart button m-0 disabled';
    }
    
    return this.isInCart() ? 
      'add-to-cart button m-0 button-success' : 
      'add-to-cart button m-0';
  }

  // Calcular rating médio
  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / this.reviews.length;
  }

  // Voltar para lista de produtos
  goBack(): void {
    this.router.navigate(['/']);
  }

  // Obter tradução
  getTranslation(key: string): string {
    return this.languageService.getTranslation(key);
  }
}