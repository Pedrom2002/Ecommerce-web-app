import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { OrderService } from '../../services/order.service';
import { CreateOrderRequest, OrderItem } from '../../models/order.interface';
import { CartItem, CartSummary } from '../../models/product.interface';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  checkoutForm: FormGroup;
  cartItems: CartItem[] = [];
  totalItems = 0;
  totalPrice = 0;
  isLoading = false;
  isProcessing = false;
  alertMessage = '';
  alertType = '';
  
  currentStep = 1; // 1: Shipping, 2: Payment, 3: Review
  
  private cartSubscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private authService: AuthService,
    private languageService: LanguageService,
    private orderService: OrderService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      // Shipping Information
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{4}-[0-9]{3}$/)]],
      country: ['Portugal', Validators.required],
      
      // Payment Information
      cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/[0-9]{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
      cardholderName: ['', [Validators.required, Validators.minLength(2)]],
      
      // Options
      saveInfo: [false],
      newsletterOptIn: [false],
      termsAccepted: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Load cart data
    this.loadCartData();
    
    // Check if cart is empty
    if (this.cartItems.length === 0) {
      this.router.navigate(['/']);
      return;
    }
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  loadCartData(): void {
    this.cartSubscription = this.cartService.getCart().subscribe({
      next: (cartSummary: CartSummary) => {
        this.cartItems = cartSummary.items;
        this.totalItems = cartSummary.totalItems;
        this.totalPrice = cartSummary.totalPrice;
      },
      error: (error) => {
        console.error('Erro ao carregar carrinho:', error);
        this.showAlert('danger', 'Erro ao carregar dados do carrinho');
      }
    });
  }

  // Navigation between steps
  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Form validation helpers
  hasError(field: string, error: string): boolean {
    const control = this.checkoutForm.get(field);
    return control?.hasError(error) && (control?.dirty || control?.touched) || false;
  }

  getErrorMessage(field: string): string {
    const control = this.checkoutForm.get(field);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(field)} é obrigatório`;
    }
    if (control?.hasError('email')) {
      return 'Email inválido';
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `${this.getFieldLabel(field)} deve ter pelo menos ${requiredLength} caracteres`;
    }
    if (control?.hasError('pattern')) {
      return `${this.getFieldLabel(field)} tem formato inválido`;
    }
    return '';
  }

  getFieldLabel(field: string): string {
    const labels: {[key: string]: string} = {
      firstName: 'Nome',
      lastName: 'Apelido',
      email: 'Email',
      phone: 'Telefone',
      address: 'Morada',
      city: 'Cidade',
      postalCode: 'Código Postal',
      country: 'País',
      cardNumber: 'Número do Cartão',
      expiryDate: 'Data de Validade',
      cvv: 'CVV',
      cardholderName: 'Nome no Cartão'
    };
    return labels[field] || field;
  }

  // Step validation
  isStepValid(step: number): boolean {
    if (step === 1) {
      return ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode', 'country']
        .every(field => this.checkoutForm.get(field)?.valid);
    }
    if (step === 2) {
      return ['cardNumber', 'expiryDate', 'cvv', 'cardholderName']
        .every(field => this.checkoutForm.get(field)?.valid);
    }
    if (step === 3) {
      return this.checkoutForm.get('termsAccepted')?.valid || false;
    }
    return false;
  }

  // Checkout process
  processOrder(): void {
    if (!this.checkoutForm.valid) {
      this.checkoutForm.markAllAsTouched();
      this.showAlert('danger', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    this.isProcessing = true;
    
    // Simulate order processing
    setTimeout(() => {
      this.completeOrder();
    }, 2000);
  }

  completeOrder(): void {
    // Converter items do carrinho para OrderItems
    const orderItems: OrderItem[] = this.cartItems.map(item => ({
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));

    // Preparar dados da encomenda
    const orderData: CreateOrderRequest = {
      shipping_info: {
        first_name: this.checkoutForm.value.firstName,
        last_name: this.checkoutForm.value.lastName,
        email: this.checkoutForm.value.email,
        phone: this.checkoutForm.value.phone,
        address: this.checkoutForm.value.address,
        city: this.checkoutForm.value.city,
        postal_code: this.checkoutForm.value.postalCode,
        country: this.checkoutForm.value.country
      },
      items: orderItems,
      totals: {
        subtotal: this.calculateSubtotal(),
        shipping: this.calculateShipping(),
        tax: this.calculateTax(),
        total: this.calculateTotal()
      }
    };

    // Validar dados antes de enviar
    const validation = this.orderService.validateOrderData(orderData);
    if (!validation.valid) {
      this.showAlert('danger', 'Erro de validação: ' + validation.errors.join(', '));
      this.isProcessing = false;
      return;
    }

    console.log('🛒 Processando encomenda:', orderData);

    // Salvar encomenda na base de dados usando OrderService
    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        console.log('✅ Encomenda criada com sucesso:', response);
        
        if (response.success) {
          // Clear cart
          this.cartService.clearCart();
          
          // Show success message
          const orderId = response.order_id ? `#${response.order_id}` : '';
          this.showAlert('success', `🎉 Pedido ${orderId} realizado com sucesso!`);
          
          // Redirect to profile orders section after delay
          setTimeout(() => {
            this.router.navigate(['/profile'], { fragment: 'orders' });
          }, 3000);
        } else {
          this.showAlert('danger', response.message || 'Erro ao processar pedido');
        }
        
        this.isProcessing = false;
      },
      error: (error) => {
        console.error('❌ Erro ao criar encomenda:', error);
        
        let errorMessage = 'Erro ao processar encomenda. Tente novamente.';
        
        if (error && typeof error === 'object') {
          if (error.status === 401) {
            this.authService.logout();
            return;
          }
          errorMessage = error.message || errorMessage;
        }
        
        this.showAlert('danger', errorMessage);
        this.isProcessing = false;
      }
    });
  }

  // Cart operations
  updateQuantity(itemId: number, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(itemId);
      return;
    }
    this.cartService.updateQuantity(itemId, newQuantity);
  }

  removeItem(itemId: number): void {
    this.cartService.removeFromCart(itemId);
  }

  // Calculations
  calculateSubtotal(): number {
    return this.totalPrice;
  }

  calculateShipping(): number {
    return this.totalPrice >= 50 ? 0 : 5.99;
  }

  calculateTax(): number {
    return this.totalPrice * 0.23; // 23% IVA
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.calculateShipping() + this.calculateTax();
  }

  // Utility methods
  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  showAlert(type: 'success' | 'danger' | 'warning' | 'info', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  getTranslation(key: string): string {
    return this.languageService.getTranslation(key);
  }

  // Format postal code input
  formatPostalCode(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 4) {
      value = value.substring(0, 4) + '-' + value.substring(4, 7);
    }
    this.checkoutForm.patchValue({ postalCode: value });
  }

  // Format card number input
  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    this.checkoutForm.patchValue({ cardNumber: value });
  }

  // Format expiry date input
  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.checkoutForm.patchValue({ expiryDate: value });
  }
}