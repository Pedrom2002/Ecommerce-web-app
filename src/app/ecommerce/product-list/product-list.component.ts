// product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.interface';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  selectedCategory: string = 'all';
  sortBy: string = 'name';
  isLoading: boolean = false;
  alertMessage: string = '';
  alertType: string = '';

  // Filtros disponíveis
  categories = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'dress', label: 'Vestidos' },
    { value: 'pants', label: 'Calças' },
    { value: 'shoes', label: 'Sapatos' },
    { value: 'tshirts', label: 'T-Shirts' },
    { value: 'accessories', label: 'Acessórios' }
  ];

  sortOptions = [
    { value: 'name', label: 'Nome' },
    { value: 'price_asc', label: 'Preço (Menor → Maior)' },
    { value: 'price_desc', label: 'Preço (Maior → Menor)' },
    { value: 'rating', label: 'Avaliação' }
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // Carregar todos os produtos
  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.showAlert('danger', 'Erro ao carregar produtos');
        this.isLoading = false;
      }
    });
  }

  // Aplicar filtros e ordenação
  applyFilters(): void {
    let filtered = [...this.products];

    // Filtro por categoria
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === this.selectedCategory);
    }

    // Filtro por termo de pesquisa
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    }

    // Ordenação
    this.applySorting(filtered);
  }

  // Aplicar ordenação
  applySorting(products: Product[]): void {
    switch (this.sortBy) {
      case 'name':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
    }

    this.filteredProducts = products;
  }

  // Pesquisar produtos
  onSearch(): void {
    this.applyFilters();
    
    if (this.filteredProducts.length === 0 && this.searchTerm.trim()) {
      this.showAlert('warning', `Nenhum produto encontrado para "${this.searchTerm}"`);
    }
  }

  // Limpar pesquisa
  clearSearch(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.applyFilters();
    this.hideAlert();
  }

  // Adicionar produto ao carrinho
  addToCart(product: Product, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!product.inStock) {
      this.showAlert('warning', `${product.name} está fora de stock`);
      return;
    }

    this.cartService.addToCart(product, 1);
    this.showAlert('success', `${product.name} adicionado ao carrinho!`);
  }

  // Verificar se produto está no carrinho
  isInCart(productId: number): boolean {
    return this.cartService.isInCart(productId);
  }

  // Obter quantidade do produto no carrinho
  getProductQuantity(productId: number): number {
    return this.cartService.getProductQuantity(productId);
  }

  // Gerar array de estrelas para rating
  getStarArray(rating: number): string[] {
    return this.productService.getStarArray(rating);
  }

  // Formatação de preço
  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  // Mostrar alerta
  showAlert(type: 'success' | 'danger' | 'warning' | 'info', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      this.hideAlert();
    }, 3000);
  }

  // Esconder alerta
  hideAlert(): void {
    this.alertMessage = '';
    this.alertType = '';
  }

  // Ir para página do produto
  viewProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  // Obter classe CSS para botão do carrinho
  getCartButtonClass(product: Product): string {
    if (!product.inStock) {
      return 'btn btn-secondary disabled';
    }
    
    return this.isInCart(product.id) ? 
      'btn btn-success' : 
      'btn btn-dark';
  }

  // Obter texto do botão do carrinho
  getCartButtonText(product: Product): string {
    if (!product.inStock) {
      return 'Fora de Stock';
    }
    
    const quantity = this.getProductQuantity(product.id);
    return quantity > 0 ? 
      `No Carrinho (${quantity})` : 
      'Adicionar ao Carrinho';
  }

  // Obter ícone do botão do carrinho
  getCartButtonIcon(product: Product): string {
    if (!product.inStock) {
      return 'icon-line-ban';
    }
    
    return this.isInCart(product.id) ? 
      'icon-line-check' : 
      'icon-shopping-basket';
  }

  // Filtrar por categoria
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  // Alterar ordenação
  changeSorting(sortBy: string): void {
    this.sortBy = sortBy;
    this.applyFilters();
  }
}