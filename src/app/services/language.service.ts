import { Injectable, LOCALE_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<string>('pt');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  // Idiomas disponíveis
  public availableLanguages: Language[] = [
    { code: 'pt', name: 'Português', flag: 'assets/images/icons/flags/bandeira-portugal-flag-0.png' },
    { code: 'en', name: 'English', flag: 'assets/images/icons/flags/GB-United-Kingdom-Flag-icon.png' }
  ];

  constructor(@Inject(LOCALE_ID) private currentLocale: string) {
    // Inicializar com o locale atual ou padrão
    const initialLang = this.getStoredLanguage() || (this.currentLocale ? this.currentLocale.split('-')[0] : 'pt') || 'pt';
    this.currentLanguageSubject.next(initialLang);
  }

  /**
   * Obter idioma atual
   */
  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  /**
   * Alterar idioma
   */
  setLanguage(languageCode: string): void {
    if (this.isLanguageSupported(languageCode)) {
      this.currentLanguageSubject.next(languageCode);
      this.storeLanguage(languageCode);
      
      // Recarregar página com novo locale
      this.reloadWithLanguage(languageCode);
    }
  }

  /**
   * Verificar se idioma é suportado
   */
  private isLanguageSupported(languageCode: string): boolean {
    return this.availableLanguages.some(lang => lang.code === languageCode);
  }

  /**
   * Obter dados do idioma atual
   */
  getCurrentLanguageData(): Language {
    const currentCode = this.getCurrentLanguage();
    return this.availableLanguages.find(lang => lang.code === currentCode) || this.availableLanguages[0];
  }

  /**
   * Obter idioma armazenado no localStorage
   */
  private getStoredLanguage(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('selectedLanguage');
    }
    return null;
  }

  /**
   * Armazenar idioma no localStorage
   */
  private storeLanguage(languageCode: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('selectedLanguage', languageCode);
    }
  }

  /**
   * Recarregar página com novo idioma
   */
  private reloadWithLanguage(languageCode: string): void {
    const currentUrl = window.location.pathname + window.location.search;
    
    // Para desenvolvimento e produção: implementar mudança real
    if (typeof window !== 'undefined') {
      // Emitir evento personalizado para atualizar a UI
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { 
          language: languageCode,
          languageData: this.getCurrentLanguageData()
        }
      }));
      
      // Para aplicações i18n reais, seria necessário reconstruir com o novo locale
      // Por agora, vamos emular a mudança através de eventos
      console.log(`✅ Idioma alterado para: ${languageCode} (${this.getCurrentLanguageData().name})`);
      
      // Atualizar o documento HTML lang attribute
      document.documentElement.lang = languageCode;
      
      // Disparar atualização de componentes
      this.updatePageContent(languageCode);
    }
  }

  /**
   * Atualizar conteúdo da página com base no idioma
   */
  private updatePageContent(languageCode: string): void {
    // Disparar evento para componentes se atualizarem
    const event = new CustomEvent('i18nContentUpdate', {
      detail: { locale: languageCode }
    });
    document.dispatchEvent(event);
  }

  /**
   * Obter direção do texto (para idiomas RTL no futuro)
   */
  getTextDirection(): string {
    // Atualmente apenas LTR, mas preparado para RTL
    return 'ltr';
  }

  /**
   * Obter lista de idiomas disponíveis exceto o atual
   */
  getOtherLanguages(): Language[] {
    const currentCode = this.getCurrentLanguage();
    return this.availableLanguages.filter(lang => lang.code !== currentCode);
  }

  /**
   * Formatação de números por idioma
   */
  formatNumber(value: number): string {
    const currentLang = this.getCurrentLanguage();
    return new Intl.NumberFormat(currentLang === 'pt' ? 'pt-PT' : 'en-US').format(value);
  }

  /**
   * Formatação de moeda por idioma
   */
  formatCurrency(value: number): string {
    const currentLang = this.getCurrentLanguage();
    const locale = currentLang === 'pt' ? 'pt-PT' : 'en-US';
    const currency = currentLang === 'pt' ? 'EUR' : 'USD';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(value);
  }

  /**
   * Formatação de data por idioma
   */
  formatDate(date: Date): string {
    const currentLang = this.getCurrentLanguage();
    const locale = currentLang === 'pt' ? 'pt-PT' : 'en-US';
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  /**
   * Obter traduções completas para toda a aplicação
   */
  getTranslation(key: string): string {
    const currentLang = this.getCurrentLanguage();
    
    const translations: {[key: string]: {[lang: string]: string}} = {
      // ===== NAVEGAÇÃO GERAL =====
      'welcome': {
        'pt': 'Bem-vindo',
        'en': 'Welcome'
      },
      'home': {
        'pt': 'Início',
        'en': 'Home'
      },
      'language': {
        'pt': 'Idioma',
        'en': 'Language'
      },
      
      // ===== FOOTER =====
      'footer_home': {
        'pt': 'Página Inicial',
        'en': 'Home'
      },
      'footer_my_account': {
        'pt': 'Minha Conta',
        'en': 'My Account'
      },
      'footer_privacy_policy': {
        'pt': 'Política de Privacidade',
        'en': 'Privacy Policy'
      },
      'footer_terms_of_service': {
        'pt': 'Termos de Uso',
        'en': 'Terms of Service'
      },
      'footer_shipping_returns': {
        'pt': 'Envios e Devoluções',
        'en': 'Shipping & Returns'
      },
      'footer_customer_support': {
        'pt': 'Suporte ao Cliente',
        'en': 'Customer Support'
      },
      'footer_faq': {
        'pt': 'Perguntas Frequentes',
        'en': 'FAQ'
      },
      'footer_headquarters': {
        'pt': 'Sede',
        'en': 'Headquarters'
      },
      'footer_phone': {
        'pt': 'Telefone',
        'en': 'Phone'
      },
      'footer_email': {
        'pt': 'Email',
        'en': 'Email'
      },
      'footer_useful_links': {
        'pt': 'Links Úteis',
        'en': 'Useful Links'
      },
      'footer_latest_news': {
        'pt': 'Últimas Novidades',
        'en': 'Latest News'
      },
      'footer_news_spring_collection': {
        'pt': 'Nova Coleção de Primavera Chegou!',
        'en': 'New Spring Collection Arrived!'
      },
      'footer_news_date_1': {
        'pt': '15 de Janeiro 2025',
        'en': 'January 15, 2025'
      },
      'footer_news_january_promotions': {
        'pt': 'Promoções de Janeiro - Até 50% OFF',
        'en': 'January Promotions - Up to 50% OFF'
      },
      'footer_news_date_2': {
        'pt': '10 de Janeiro 2025',
        'en': 'January 10, 2025'
      },
      'footer_news_free_shipping': {
        'pt': 'Frete Grátis para Compras Acima de €50',
        'en': 'Free Shipping for Orders Over €50'
      },
      'footer_news_date_3': {
        'pt': '5 de Janeiro 2025',
        'en': 'January 5, 2025'
      },
      'footer_total_downloads': {
        'pt': 'Total Downloads',
        'en': 'Total Downloads'
      },
      'footer_clients': {
        'pt': 'Clientes',
        'en': 'Clients'
      },
      'footer_subscribe': {
        'pt': 'Subscrever',
        'en': 'Subscribe'
      },
      'footer_newsletter_text': {
        'pt': 'a nossa Newsletter para receber Novidades, Ofertas Especiais & Promoções Exclusivas',
        'en': 'to our Newsletter to receive News, Special Offers & Exclusive Promotions'
      },
      'footer_email_placeholder': {
        'pt': 'Digite o seu email',
        'en': 'Enter your email'
      },
      'footer_like_page': {
        'pt': 'Curta nossa página',
        'en': 'Like our page'
      },
      'footer_on_facebook': {
        'pt': 'no Facebook',
        'en': 'on Facebook'
      },
      'footer_rss_feed': {
        'pt': 'nosso Feed RSS',
        'en': 'our RSS Feed'
      },
      'footer_copyright': {
        'pt': 'Direitos Autorais © 2025 Todos os Direitos Reservados por E-Commerce PT.',
        'en': 'Copyright © 2025 All Rights Reserved by E-Commerce PT.'
      },
      
      // ===== AUTENTICAÇÃO =====
      'login': {
        'pt': 'Entrar',
        'en': 'Login'
      },
      'register': {
        'pt': 'Registar',
        'en': 'Register'
      },
      'logout': {
        'pt': 'Sair',
        'en': 'Logout'
      },
      'username': {
        'pt': 'Nome de utilizador',
        'en': 'Username'
      },
      'password': {
        'pt': 'Palavra-passe',
        'en': 'Password'
      },
      'email': {
        'pt': 'Email',
        'en': 'Email'
      },
      'name': {
        'pt': 'Nome',
        'en': 'Name'
      },
      'full_name': {
        'pt': 'Nome Completo',
        'en': 'Full Name'
      },
      'phone': {
        'pt': 'Telefone',
        'en': 'Phone'
      },
      'create_account': {
        'pt': 'Criar Conta',
        'en': 'Create Account'
      },
      'sign_in': {
        'pt': 'Entrar',
        'en': 'Sign In'
      },
      'login_subtitle': {
        'pt': 'Introduza as suas credenciais para continuar',
        'en': 'Enter your credentials to continue'
      },
      'username_or_email': {
        'pt': 'Username ou Email',
        'en': 'Username or Email'
      },
      'enter_username_or_email': {
        'pt': 'Introduza username ou email',
        'en': 'Enter username or email'
      },
      'enter_your_password': {
        'pt': 'Introduza a sua palavra-passe',
        'en': 'Enter your password'
      },
      'remember_me': {
        'pt': 'Lembrar-me',
        'en': 'Remember me'
      },
      'forgot_password': {
        'pt': 'Esqueceu a palavra-passe?',
        'en': 'Forgot password?'
      },
      'account_temporarily_blocked': {
        'pt': 'Conta Temporariamente Bloqueada',
        'en': 'Account Temporarily Blocked'
      },
      'too_many_failed_attempts': {
        'pt': 'Muitas tentativas falhadas. Tente novamente em:',
        'en': 'Too many failed attempts. Try again in:'
      },
      'create_new_account': {
        'pt': 'Criar Nova Conta',
        'en': 'Create New Account'
      },
      'secure_login': {
        'pt': 'Login Seguro',
        'en': 'Secure Login'
      },
      
      // ===== PERFIL =====
      'profile': {
        'pt': 'Perfil',
        'en': 'Profile'
      },
      'my_profile': {
        'pt': 'Meu Perfil',
        'en': 'My Profile'
      },
      'personal_data': {
        'pt': 'Dados Pessoais',
        'en': 'Personal Data'
      },
      'order_history': {
        'pt': 'Histórico de Encomendas',
        'en': 'Order History'
      },
      'change_password': {
        'pt': 'Alterar Palavra-passe',
        'en': 'Change Password'
      },
      'current_password': {
        'pt': 'Palavra-passe atual',
        'en': 'Current Password'
      },
      'new_password': {
        'pt': 'Nova palavra-passe',
        'en': 'New Password'
      },
      'confirm_password': {
        'pt': 'Confirmar palavra-passe',
        'en': 'Confirm Password'
      },
      
      // ===== PRODUTOS & E-COMMERCE =====
      'products': {
        'pt': 'Produtos',
        'en': 'Products'
      },
      'search': {
        'pt': 'Pesquisar',
        'en': 'Search'
      },
      'add_to_cart': {
        'pt': 'Adicionar ao Carrinho',
        'en': 'Add to Cart'
      },
      'price': {
        'pt': 'Preço',
        'en': 'Price'
      },
      'quantity': {
        'pt': 'Quantidade',
        'en': 'Quantity'
      },
      'availability': {
        'pt': 'Disponibilidade',
        'en': 'Availability'
      },
      'in_stock': {
        'pt': 'Em stock',
        'en': 'In Stock'
      },
      'out_of_stock': {
        'pt': 'Esgotado',
        'en': 'Out of Stock'
      },
      
      // ===== PRODUTO SINGLE PAGE =====
      'product_loading': {
        'pt': 'A carregar',
        'en': 'Loading'
      },
      'product_back_to_products': {
        'pt': 'Voltar aos Produtos',
        'en': 'Back to Products'
      },
      'product_out_of_stock': {
        'pt': 'Fora de Stock',
        'en': 'Out of Stock'
      },
      'product_sale': {
        'pt': 'Promoção',
        'en': 'Sale'
      },
      'product_reviews': {
        'pt': 'avaliações',
        'en': 'reviews'
      },
      'product_quantity': {
        'pt': 'Quantidade',
        'en': 'Quantity'
      },
      'product_units_in_cart': {
        'pt': 'unidade(s) no carrinho',
        'en': 'unit(s) in cart'
      },
      'product_default_description': {
        'pt': 'Produto de alta qualidade com excelente acabamento e design moderno. Perfeito para o seu estilo de vida.',
        'en': 'High-quality product with excellent finish and modern design. Perfect for your lifestyle.'
      },
      'product_dynamic_color_options': {
        'pt': 'Opções de Cores Dinâmicas',
        'en': 'Dynamic Color Options'
      },
      'product_multiple_sizes_available': {
        'pt': 'Vários Tamanhos Disponíveis',
        'en': 'Multiple Sizes Available'
      },
      'product_30_day_return_policy': {
        'pt': 'Política de Devolução de 30 Dias',
        'en': '30-Day Return Policy'
      },
      'product_in_stock_fast_delivery': {
        'pt': 'Em Stock - Entrega Rápida',
        'en': 'In Stock - Fast Delivery'
      },
      'product_out_of_stock_coming_soon': {
        'pt': 'Fora de Stock - Brevemente Disponível',
        'en': 'Out of Stock - Coming Soon'
      },
      'product_category': {
        'pt': 'Categoria',
        'en': 'Category'
      },
      'product_stock': {
        'pt': 'Stock',
        'en': 'Stock'
      },
      'product_available': {
        'pt': 'Disponível',
        'en': 'Available'
      },
      'product_share': {
        'pt': 'Partilhar',
        'en': 'Share'
      },
      'product_copy_link': {
        'pt': 'Copiar Link',
        'en': 'Copy Link'
      },
      'product_100_original': {
        'pt': '100% Original',
        'en': '100% Original'
      },
      'product_original_brands_guarantee': {
        'pt': 'Garantimos a venda de marcas originais.',
        'en': 'We guarantee the sale of original brands.'
      },
      'product_payment_options': {
        'pt': 'Opções de Pagamento',
        'en': 'Payment Options'
      },
      'product_payment_methods': {
        'pt': 'Aceitamos Visa, MasterCard e American Express.',
        'en': 'We accept Visa, MasterCard and American Express.'
      },
      'product_free_shipping': {
        'pt': 'Envio Grátis',
        'en': 'Free Shipping'
      },
      'product_free_shipping_description': {
        'pt': 'Entrega gratuita para encomendas acima de $40.',
        'en': 'Free delivery for orders over $40.'
      },
      'product_30_day_returns': {
        'pt': 'Devoluções 30 Dias',
        'en': '30-Day Returns'
      },
      'product_returns_description': {
        'pt': 'Devolva ou troque artigos comprados em 30 dias.',
        'en': 'Return or exchange purchased items within 30 days.'
      },
      'product_description': {
        'pt': 'Descrição',
        'en': 'Description'
      },
      'product_information': {
        'pt': 'Informações',
        'en': 'Information'
      },
      'product_about': {
        'pt': 'Sobre',
        'en': 'About'
      },
      'product_detailed_description': {
        'pt': 'Este produto combina qualidade superior com design elegante. Fabricado com materiais de primeira linha e atenção aos detalhes, oferece durabilidade e estilo para o seu dia a dia.',
        'en': 'This product combines superior quality with elegant design. Made with top-quality materials and attention to detail, it offers durability and style for your daily life.'
      },
      'product_versatility_description': {
        'pt': 'Caracteriza-se pela sua versatilidade e conforto, sendo uma excelente adição à sua coleção. O design cuidadoso e a funcionalidade prática fazem deste produto uma escolha inteligente.',
        'en': 'It is characterized by its versatility and comfort, being an excellent addition to your collection. The careful design and practical functionality make this product a smart choice.'
      },
      'product_main_features': {
        'pt': 'Características Principais',
        'en': 'Main Features'
      },
      'product_modern_elegant_design': {
        'pt': 'Design moderno e elegante',
        'en': 'Modern and elegant design'
      },
      'product_high_quality_materials': {
        'pt': 'Materiais de alta qualidade',
        'en': 'High-quality materials'
      },
      'product_comfort_durability': {
        'pt': 'Conforto e durabilidade',
        'en': 'Comfort and durability'
      },
      'product_easy_maintenance': {
        'pt': 'Fácil manutenção',
        'en': 'Easy maintenance'
      },
      'product_multiple_options': {
        'pt': 'Disponível em várias opções',
        'en': 'Available in various options'
      },
      'product_rating': {
        'pt': 'Avaliação',
        'en': 'Rating'
      },
      'product_stars': {
        'pt': 'estrelas',
        'en': 'stars'
      },
      'product_star': {
        'pt': 'Estrela',
        'en': 'Star'
      },
      'product_availability': {
        'pt': 'Disponibilidade',
        'en': 'Availability'
      },
      'product_in_stock': {
        'pt': 'Em Stock',
        'en': 'In Stock'
      },
      'product_discount': {
        'pt': 'Desconto',
        'en': 'Discount'
      },
      'product_warranty': {
        'pt': 'Garantia',
        'en': 'Warranty'
      },
      'product_12_months': {
        'pt': '12 Meses',
        'en': '12 Months'
      },
      'product_return': {
        'pt': 'Devolução',
        'en': 'Return'
      },
      'product_30_days': {
        'pt': '30 Dias',
        'en': '30 Days'
      },
      'product_customer_reviews': {
        'pt': 'Avaliações dos Clientes',
        'en': 'Customer Reviews'
      },
      'product_add_review': {
        'pt': 'Adicionar Avaliação',
        'en': 'Add Review'
      },
      'product_no_reviews_yet': {
        'pt': 'Ainda não há avaliações',
        'en': 'No reviews yet'
      },
      'product_be_first_to_review': {
        'pt': 'Seja o primeiro a avaliar este produto!',
        'en': 'Be the first to review this product!'
      },
      'product_submit_review': {
        'pt': 'Submeter uma Avaliação',
        'en': 'Submit a Review'
      },
      'product_name': {
        'pt': 'Nome',
        'en': 'Name'
      },
      'product_email': {
        'pt': 'Email',
        'en': 'Email'
      },
      'product_select': {
        'pt': 'Selecione',
        'en': 'Select'
      },
      'product_comment': {
        'pt': 'Comentário',
        'en': 'Comment'
      },
      'product_close': {
        'pt': 'Fechar',
        'en': 'Close'
      },
      'product_related_products': {
        'pt': 'Produtos Relacionados',
        'en': 'Related Products'
      },
      'product_not_found': {
        'pt': 'Produto não encontrado',
        'en': 'Product not found'
      },
      'product_load_error': {
        'pt': 'Erro ao carregar produto',
        'en': 'Error loading product'
      },
      'product_added_to_cart': {
        'pt': 'adicionado ao carrinho',
        'en': 'added to cart'
      },
      'product_is_out_of_stock': {
        'pt': 'está fora de stock',
        'en': 'is out of stock'
      },
      'product_fill_required_fields': {
        'pt': 'Por favor, preencha todos os campos obrigatórios',
        'en': 'Please fill in all required fields'
      },
      'product_review_submitted': {
        'pt': 'Review submetida com sucesso!',
        'en': 'Review submitted successfully!'
      },
      'product_check_this_product': {
        'pt': 'Confira este produto',
        'en': 'Check out this product'
      },
      'product_link_copied': {
        'pt': 'Link copiado para a área de transferência!',
        'en': 'Link copied to clipboard!'
      },
      'product_link_copy_failed': {
        'pt': 'Não foi possível copiar o link',
        'en': 'Could not copy link'
      },
      'product_add_to_cart': {
        'pt': 'Adicionar ao Carrinho',
        'en': 'Add to Cart'
      },
      'product_add_more': {
        'pt': 'Adicionar Mais',
        'en': 'Add More'
      },
      'product_in_cart': {
        'pt': 'no carrinho',
        'en': 'in cart'
      },
      
      // ===== CARRINHO =====
      'cart': {
        'pt': 'Carrinho',
        'en': 'Cart'
      },
      'shopping_cart': {
        'pt': 'Carrinho de Compras',
        'en': 'Shopping Cart'
      },
      'empty_cart': {
        'pt': 'O carrinho está vazio',
        'en': 'Your cart is empty'
      },
      'cart_total': {
        'pt': 'Total do Carrinho',
        'en': 'Cart Total'
      },
      'subtotal': {
        'pt': 'Subtotal',
        'en': 'Subtotal'
      },
      'shipping': {
        'pt': 'Envio',
        'en': 'Shipping'
      },
      'tax': {
        'pt': 'Imposto',
        'en': 'Tax'
      },
      'total': {
        'pt': 'Total',
        'en': 'Total'
      },
      'clear': {
        'pt': 'Limpar',
        'en': 'Clear'
      },
      'remove': {
        'pt': 'Remover',
        'en': 'Remove'
      },
      'update': {
        'pt': 'Atualizar',
        'en': 'Update'
      },
      
      // ===== CHECKOUT =====
      'checkout': {
        'pt': 'Finalizar Compra',
        'en': 'Checkout'
      },
      'shipping_address': {
        'pt': 'Endereço de Envio',
        'en': 'Shipping Address'
      },
      'billing_address': {
        'pt': 'Endereço de Faturação',
        'en': 'Billing Address'
      },
      'address': {
        'pt': 'Endereço',
        'en': 'Address'
      },
      'city': {
        'pt': 'Cidade',
        'en': 'City'
      },
      'postal_code': {
        'pt': 'Código Postal',
        'en': 'Postal Code'
      },
      'country': {
        'pt': 'País',
        'en': 'Country'
      },
      'payment_method': {
        'pt': 'Método de Pagamento',
        'en': 'Payment Method'
      },
      'credit_card': {
        'pt': 'Cartão de Crédito',
        'en': 'Credit Card'
      },
      'paypal': {
        'pt': 'PayPal',
        'en': 'PayPal'
      },
      'bank_transfer': {
        'pt': 'Transferência Bancária',
        'en': 'Bank Transfer'
      },
      'place_order': {
        'pt': 'Finalizar Pedido',
        'en': 'Place Order'
      },
      
      // ===== ENCOMENDAS =====
      'order': {
        'pt': 'Encomenda',
        'en': 'Order'
      },
      'order_number': {
        'pt': 'Número da Encomenda',
        'en': 'Order Number'
      },
      'order_date': {
        'pt': 'Data da Encomenda',
        'en': 'Order Date'
      },
      'order_status': {
        'pt': 'Estado da Encomenda',
        'en': 'Order Status'
      },
      'pending': {
        'pt': 'Pendente',
        'en': 'Pending'
      },
      'processing': {
        'pt': 'A processar',
        'en': 'Processing'
      },
      'shipped': {
        'pt': 'Enviado',
        'en': 'Shipped'
      },
      'delivered': {
        'pt': 'Entregue',
        'en': 'Delivered'
      },
      'cancelled': {
        'pt': 'Cancelado',
        'en': 'Cancelled'
      },
      
      // ===== AÇÕES COMUNS =====
      'save': {
        'pt': 'Guardar',
        'en': 'Save'
      },
      'cancel': {
        'pt': 'Cancelar',
        'en': 'Cancel'
      },
      'edit': {
        'pt': 'Editar',
        'en': 'Edit'
      },
      'delete': {
        'pt': 'Eliminar',
        'en': 'Delete'
      },
      'view': {
        'pt': 'Ver',
        'en': 'View'
      },
      'back': {
        'pt': 'Voltar',
        'en': 'Back'
      },
      'next': {
        'pt': 'Seguinte',
        'en': 'Next'
      },
      'previous': {
        'pt': 'Anterior',
        'en': 'Previous'
      },
      'continue': {
        'pt': 'Continuar',
        'en': 'Continue'
      },
      'submit': {
        'pt': 'Submeter',
        'en': 'Submit'
      },
      'confirm': {
        'pt': 'Confirmar',
        'en': 'Confirm'
      },
      
      // ===== ESTADOS & MENSAGENS =====
      'loading': {
        'pt': 'A carregar...',
        'en': 'Loading...'
      },
      'error': {
        'pt': 'Erro',
        'en': 'Error'
      },
      'success': {
        'pt': 'Sucesso',
        'en': 'Success'
      },
      'warning': {
        'pt': 'Aviso',
        'en': 'Warning'
      },
      'info': {
        'pt': 'Informação',
        'en': 'Info'
      },
      'no_data': {
        'pt': 'Sem dados',
        'en': 'No Data'
      },
      'not_found': {
        'pt': 'Não encontrado',
        'en': 'Not Found'
      },
      
      // ===== VALIDAÇÃO =====
      'required': {
        'pt': 'Este campo é obrigatório',
        'en': 'This field is required'
      },
      'invalid_email': {
        'pt': 'Email inválido',
        'en': 'Invalid email'
      },
      'password_mismatch': {
        'pt': 'As palavras-passe não coincidem',
        'en': 'Passwords do not match'
      },
      'min_length': {
        'pt': 'Comprimento mínimo não atingido',
        'en': 'Minimum length not met'
      },
      'max_length': {
        'pt': 'Comprimento máximo excedido',
        'en': 'Maximum length exceeded'
      },
      
      // ===== FOOTER =====
      'privacy_policy': {
        'pt': 'Política de Privacidade',
        'en': 'Privacy Policy'
      },
      'terms_of_service': {
        'pt': 'Termos de Uso',
        'en': 'Terms of Service'
      },
      'shipping_returns': {
        'pt': 'Envios e Devoluções',
        'en': 'Shipping & Returns'
      },
      'customer_support': {
        'pt': 'Suporte ao Cliente',
        'en': 'Customer Support'
      },
      'faq': {
        'pt': 'Perguntas Frequentes',
        'en': 'FAQ'
      },
      'contact_us': {
        'pt': 'Contacte-nos',
        'en': 'Contact Us'
      },
      'about_us': {
        'pt': 'Sobre Nós',
        'en': 'About Us'
      },
      
      // ===== PÁGINAS ESPECÍFICAS =====
      'welcome_message': {
        'pt': 'Bem-vindo à nossa loja online',
        'en': 'Welcome to our online store'
      },
      'featured_products': {
        'pt': 'Produtos em Destaque',
        'en': 'Featured Products'
      },
      'new_arrivals': {
        'pt': 'Novidades',
        'en': 'New Arrivals'
      },
      'best_sellers': {
        'pt': 'Mais Vendidos',
        'en': 'Best Sellers'
      },
      'on_sale': {
        'pt': 'Em Promoção',
        'en': 'On Sale'
      },
      
      // ===== CONFIRMAÇÕES =====
      'confirm_delete': {
        'pt': 'Tem certeza que pretende eliminar?',
        'en': 'Are you sure you want to delete?'
      },
      'confirm_logout': {
        'pt': 'Tem certeza que pretende sair?',
        'en': 'Are you sure you want to logout?'
      },
      'confirm_clear_cart': {
        'pt': 'Tem certeza que pretende limpar o carrinho?',
        'en': 'Are you sure you want to clear the cart?'
      },
      
      // ===== MENSAGENS DE SUCESSO =====
      'login_success': {
        'pt': 'Login efetuado com sucesso',
        'en': 'Login successful'
      },
      'register_success': {
        'pt': 'Conta criada com sucesso',
        'en': 'Account created successfully'
      },
      'profile_updated': {
        'pt': 'Perfil atualizado com sucesso',
        'en': 'Profile updated successfully'
      },
      'password_changed': {
        'pt': 'Palavra-passe alterada com sucesso',
        'en': 'Password changed successfully'
      },
      'item_added_to_cart': {
        'pt': 'Produto adicionado ao carrinho',
        'en': 'Item added to cart'
      },
      'order_placed': {
        'pt': 'Encomenda efetuada com sucesso',
        'en': 'Order placed successfully'
      },
      
      // ===== MENSAGENS DE ERRO =====
      'login_failed': {
        'pt': 'Falha no login',
        'en': 'Login failed'
      },
      'register_failed': {
        'pt': 'Falha no registo',
        'en': 'Registration failed'
      },
      'server_error': {
        'pt': 'Erro do servidor',
        'en': 'Server error'
      },
      'network_error': {
        'pt': 'Erro de rede',
        'en': 'Network error'
      },
      'invalid_credentials': {
        'pt': 'Credenciais inválidas',
        'en': 'Invalid credentials'
      },
      'user_not_found': {
        'pt': 'Utilizador não encontrado',
        'en': 'User not found'
      },
      'email_already_exists': {
        'pt': 'Email já existe',
        'en': 'Email already exists'
      },

      // ===== PESQUISA E FILTROS =====
      'search_products': {
        'pt': 'Pesquisar produtos...',
        'en': 'Search products...'
      },
      'all_categories': {
        'pt': 'Todas as Categorias',
        'en': 'All Categories'
      },
      'dresses': {
        'pt': 'Vestidos',
        'en': 'Dresses'
      },
      'pants': {
        'pt': 'Calças',
        'en': 'Pants'
      },
      'shoes': {
        'pt': 'Sapatos',
        'en': 'Shoes'
      },
      'tshirts': {
        'pt': 'T-Shirts',
        'en': 'T-Shirts'
      },
      'accessories': {
        'pt': 'Acessórios',
        'en': 'Accessories'
      },
      'clear_filters': {
        'pt': 'Limpar Filtros',
        'en': 'Clear Filters'
      },
      'sort_by_name': {
        'pt': 'Nome (A → Z)',
        'en': 'Name (A → Z)'
      },
      'sort_by_price_asc': {
        'pt': 'Preço (Menor → Maior)',
        'en': 'Price (Low → High)'
      },
      'sort_by_price_desc': {
        'pt': 'Preço (Maior → Menor)',
        'en': 'Price (High → Low)'
      },
      'sort_by_rating': {
        'pt': 'Avaliação',
        'en': 'Rating'
      },
      'products_found': {
        'pt': 'Produto(s) encontrado(s)',
        'en': 'Product(s) found'
      },
      'no_products_found': {
        'pt': 'Nenhum produto encontrado',
        'en': 'No products found'
      },
      'no_products_criteria': {
        'pt': 'Não foram encontrados produtos que correspondam aos seus critérios de pesquisa.',
        'en': 'No products were found that match your search criteria.'
      },
      'view_all_products': {
        'pt': 'Ver Todos os Produtos',
        'en': 'View All Products'
      },
      'out_of_stock_label': {
        'pt': 'Fora de Stock',
        'en': 'Out of Stock'
      },
      'promotion_label': {
        'pt': 'Promoção!',
        'en': 'Sale!'
      },
      'in_cart_label': {
        'pt': 'no carrinho',
        'en': 'in cart'
      },

      // ===== PÁGINAS ESPECÍFICAS - PRIVACY POLICY =====
      'privacy_policy_title': {
        'pt': 'Política de Privacidade',
        'en': 'Privacy Policy'
      },
      'last_updated': {
        'pt': 'Última atualização:',
        'en': 'Last updated:'
      },
      'data_collection': {
        'pt': 'Recolha de Dados',
        'en': 'Data Collection'
      },
      'data_usage': {
        'pt': 'Utilização de Dados',
        'en': 'Data Usage'
      },
      'data_protection': {
        'pt': 'Proteção de Dados',
        'en': 'Data Protection'
      },
      'cookies_policy': {
        'pt': 'Política de Cookies',
        'en': 'Cookies Policy'
      },
      'third_party_services': {
        'pt': 'Serviços de Terceiros',
        'en': 'Third Party Services'
      },
      'user_rights': {
        'pt': 'Direitos do Utilizador',
        'en': 'User Rights'
      },
      'contact_privacy': {
        'pt': 'Contactar sobre Privacidade',
        'en': 'Contact About Privacy'
      },

      // ===== PÁGINAS ESPECÍFICAS - TERMS OF SERVICE =====
      'terms_of_service_title': {
        'pt': 'Termos e Condições de Uso',
        'en': 'Terms and Conditions of Use'
      },
      'acceptance_terms': {
        'pt': 'Aceitação dos Termos',
        'en': 'Acceptance of Terms'
      },
      'use_of_service': {
        'pt': 'Utilização do Serviço',
        'en': 'Use of Service'
      },
      'user_accounts': {
        'pt': 'Contas de Utilizador',
        'en': 'User Accounts'
      },
      'prohibited_activities': {
        'pt': 'Atividades Proibidas',
        'en': 'Prohibited Activities'
      },
      'intellectual_property': {
        'pt': 'Propriedade Intelectual',
        'en': 'Intellectual Property'
      },
      'limitation_liability': {
        'pt': 'Limitação de Responsabilidade',
        'en': 'Limitation of Liability'
      },
      'governing_law': {
        'pt': 'Lei Aplicável',
        'en': 'Governing Law'
      },

      // ===== PÁGINAS ESPECÍFICAS - SHIPPING & RETURNS =====
      'shipping_returns_title': {
        'pt': 'Envios e Devoluções',
        'en': 'Shipping & Returns'
      },
      'shipping_info': {
        'pt': 'Informações de Envio',
        'en': 'Shipping Information'
      },
      'shipping_costs': {
        'pt': 'Custos de Envio',
        'en': 'Shipping Costs'
      },
      'delivery_times': {
        'pt': 'Prazos de Entrega',
        'en': 'Delivery Times'
      },
      'international_shipping': {
        'pt': 'Envios Internacionais',
        'en': 'International Shipping'
      },
      'return_policy': {
        'pt': 'Política de Devoluções',
        'en': 'Return Policy'
      },
      'return_process': {
        'pt': 'Processo de Devolução',
        'en': 'Return Process'
      },
      'refund_policy': {
        'pt': 'Política de Reembolsos',
        'en': 'Refund Policy'
      },
      'damaged_items': {
        'pt': 'Artigos Danificados',
        'en': 'Damaged Items'
      },

      // ===== PÁGINAS ESPECÍFICAS - CUSTOMER SUPPORT =====
      'customer_support_title': {
        'pt': 'Suporte ao Cliente',
        'en': 'Customer Support'
      },
      'contact_information': {
        'pt': 'Informações de Contacto',
        'en': 'Contact Information'
      },
      'support_channels': {
        'pt': 'Canais de Suporte',
        'en': 'Support Channels'
      },
      'email_support': {
        'pt': 'Suporte por Email',
        'en': 'Email Support'
      },
      'phone_support': {
        'pt': 'Suporte Telefónico',
        'en': 'Phone Support'
      },
      'support_ticket': {
        'pt': 'Ticket de Suporte',
        'en': 'Support Ticket'
      },
      'response_time': {
        'pt': 'Tempo de Resposta',
        'en': 'Response Time'
      },

      // ===== PÁGINAS ESPECÍFICAS - FAQ =====
      'faq_title': {
        'pt': 'Perguntas Frequentes',
        'en': 'Frequently Asked Questions'
      },
      'general_questions': {
        'pt': 'Perguntas Gerais',
        'en': 'General Questions'
      },
      'account_questions': {
        'pt': 'Questões da Conta',
        'en': 'Account Questions'
      },
      'order_questions': {
        'pt': 'Questões de Encomendas',
        'en': 'Order Questions'
      },
      'payment_questions': {
        'pt': 'Questões de Pagamento',
        'en': 'Payment Questions'
      },
      'shipping_questions': {
        'pt': 'Questões de Envio',
        'en': 'Shipping Questions'
      },
      'return_questions': {
        'pt': 'Questões de Devoluções',
        'en': 'Return Questions'
      },
      'technical_questions': {
        'pt': 'Questões Técnicas',
        'en': 'Technical Questions'
      },
      'still_need_help': {
        'pt': 'Ainda precisa de ajuda?',
        'en': 'Still need help?'
      },

      // ===== FOOTER COMPLETO =====
      'company_description': {
        'pt': 'Oferecemos produtos de Qualidade, com Inovação & Confiança para nossos clientes.',
        'en': 'We offer Quality products with Innovation & Trust for our customers.'
      },
      'headquarters_address': {
        'pt': 'Rua da Inovação, 123, Lisboa, Portugal',
        'en': '123 Innovation Street, Lisbon, Portugal'
      },
      'useful_links': {
        'pt': 'Links Úteis',
        'en': 'Useful Links'
      },
      'homepage': {
        'pt': 'Página Inicial',
        'en': 'Homepage'
      },
      'my_account': {
        'pt': 'Minha Conta',
        'en': 'My Account'
      },
      'latest_news': {
        'pt': 'Últimas Novidades',
        'en': 'Latest News'
      },
      'newsletter_description': {
        'pt': 'Subscreva a nossa Newsletter para receber Novidades, Ofertas Especiais & Promoções Exclusivas:',
        'en': 'Subscribe to our Newsletter to receive News, Special Offers & Exclusive Promotions:'
      },
      'enter_your_email': {
        'pt': 'Digite o seu email',
        'en': 'Enter your email'
      },
      'subscribe': {
        'pt': 'Subscrever',
        'en': 'Subscribe'
      },
      'like_facebook': {
        'pt': 'Curta nossa página no Facebook',
        'en': 'Like our Facebook page'
      },
      'follow_rss': {
        'pt': 'Subscreva nosso Feed RSS',
        'en': 'Follow our RSS Feed'
      },
      'copyright': {
        'pt': 'Direitos Autorais © 2025 Todos os Direitos Reservados por E-Commerce PT.',
        'en': 'Copyright © 2025 All Rights Reserved by E-Commerce PT.'
      },
      'total_downloads': {
        'pt': 'Total Downloads',
        'en': 'Total Downloads'
      },
      'clients': {
        'pt': 'Clientes',
        'en': 'Clients'
      },

      // ===== PRODUCT SINGLE PAGE =====
      'loading_product': {
        'pt': 'A carregar produto...',
        'en': 'Loading product...'
      },
      'back_to_products': {
        'pt': 'Voltar aos Produtos',
        'en': 'Back to Products'
      },
      'promotion': {
        'pt': 'Promoção',
        'en': 'Sale'
      },
      'reviews': {
        'pt': 'avaliações',
        'en': 'reviews'
      },
      'dynamic_color_options': {
        'pt': 'Opções de Cores Dinâmicas',
        'en': 'Dynamic Color Options'
      },
      'multiple_sizes': {
        'pt': 'Vários Tamanhos Disponíveis',
        'en': 'Multiple Sizes Available'
      },
      'return_policy_30': {
        'pt': 'Política de Devolução de 30 Dias',
        'en': '30-Day Return Policy'
      },
      'share': {
        'pt': 'Partilhar:',
        'en': 'Share:'
      },
      'original_100': {
        'pt': '100% Original',
        'en': '100% Original'
      },
      'payment_options': {
        'pt': 'Opções de Pagamento',
        'en': 'Payment Options'
      },
      'free_shipping': {
        'pt': 'Envio Grátis',
        'en': 'Free Shipping'
      },
      'returns_30_days': {
        'pt': 'Devoluções 30 Dias',
        'en': '30-Day Returns'
      },
      'description': {
        'pt': 'Descrição',
        'en': 'Description'
      },
      'information': {
        'pt': 'Informações',
        'en': 'Information'
      },

      // ===== CHECKOUT COMPLETO =====
      'back_to_shopping': {
        'pt': 'Voltar às Compras',
        'en': 'Back to Shopping'
      },
      'shipping_information': {
        'pt': 'Informações de Envio',
        'en': 'Shipping Information'
      },
      'payment': {
        'pt': 'Pagamento',
        'en': 'Payment'
      },
      'order_review': {
        'pt': 'Revisão do Pedido',
        'en': 'Order Review'
      },
      'first_name': {
        'pt': 'Nome',
        'en': 'First Name'
      },
      'last_name': {
        'pt': 'Apelido',
        'en': 'Last Name'
      },
      'required_field': {
        'pt': 'obrigatório',
        'en': 'required'
      },
      'continue_to_payment': {
        'pt': 'Continuar para Pagamento',
        'en': 'Continue to Payment'
      },
      'card_number': {
        'pt': 'Número do Cartão',
        'en': 'Card Number'
      },
      'expiry_date': {
        'pt': 'Data de Validade',
        'en': 'Expiry Date'
      },
      'cvv': {
        'pt': 'CVV',
        'en': 'CVV'
      },
      'cardholder_name': {
        'pt': 'Nome no Cartão',
        'en': 'Cardholder Name'
      },
      'order_items': {
        'pt': 'Artigos do Pedido',
        'en': 'Order Items'
      },
      'order_summary': {
        'pt': 'Resumo do Pedido',
        'en': 'Order Summary'
      },
      'vat_23': {
        'pt': 'IVA (23%):',
        'en': 'VAT (23%):'
      },

      // ===== LOADING E ESTADOS =====
      'loading_page': {
        'pt': 'A carregar página...',
        'en': 'Loading page...'
      },
      'page_not_found': {
        'pt': 'Página não encontrada',
        'en': 'Page not found'
      },
      'go_back': {
        'pt': 'Voltar',
        'en': 'Go Back'
      },
      'try_again': {
        'pt': 'Tentar Novamente',
        'en': 'Try Again'
      },

      // ===== PRIVACY POLICY SPECIFIC =====
      'privacy_policy_intro': {
        'pt': 'A sua privacidade é importante para nós. Esta política de privacidade explica como coletamos, usamos e protegemos as suas informações pessoais.',
        'en': 'Your privacy is important to us. This privacy policy explains how we collect, use and protect your personal information.'
      },
      'information_we_collect': {
        'pt': 'Informações que Coletamos',
        'en': 'Information We Collect'
      },
      'information_collected_intro': {
        'pt': 'Coletamos as seguintes informações quando utiliza os nossos serviços:',
        'en': 'We collect the following information when you use our services:'
      },
      'account_information': {
        'pt': 'Informações de Conta',
        'en': 'Account Information'
      },
      'account_info_details': {
        'pt': 'Nome, email, telefone e morada de entrega',
        'en': 'Name, email, phone and delivery address'
      },
      'purchase_information': {
        'pt': 'Informações de Compra',
        'en': 'Purchase Information'
      },
      'purchase_info_details': {
        'pt': 'Histórico de encomendas e preferências',
        'en': 'Order history and preferences'
      },
      'technical_information': {
        'pt': 'Informações Técnicas',
        'en': 'Technical Information'
      },
      'technical_info_details': {
        'pt': 'Endereço IP, tipo de navegador e dispositivo',
        'en': 'IP address, browser type and device'
      },
      'cookies_details': {
        'pt': 'Para melhorar a experiência de navegação',
        'en': 'To improve browsing experience'
      },
      'how_we_use_information': {
        'pt': 'Como Utilizamos as Suas Informações',
        'en': 'How We Use Your Information'
      },
      'information_usage_intro': {
        'pt': 'Utilizamos as suas informações para:',
        'en': 'We use your information to:'
      },
      'process_orders': {
        'pt': 'Processar e entregar as suas encomendas',
        'en': 'Process and deliver your orders'
      },
      'communicate_order_status': {
        'pt': 'Comunicar sobre o estado das encomendas',
        'en': 'Communicate about order status'
      },
      'improve_services': {
        'pt': 'Melhorar os nossos produtos e serviços',
        'en': 'Improve our products and services'
      },
      'send_promotions': {
        'pt': 'Enviar ofertas especiais e promoções (com o seu consentimento)',
        'en': 'Send special offers and promotions (with your consent)'
      },
      'legal_obligations': {
        'pt': 'Cumprir obrigações legais',
        'en': 'Comply with legal obligations'
      },
      'information_sharing': {
        'pt': 'Partilha de Informações',
        'en': 'Information Sharing'
      },
      'no_selling_info': {
        'pt': 'Não vendemos, trocamos ou transferimos as suas informações pessoais para terceiros, exceto quando necessário para:',
        'en': 'We do not sell, trade or transfer your personal information to third parties, except when necessary to:'
      },
      'process_payments': {
        'pt': 'Processar pagamentos através de fornecedores de pagamento seguros',
        'en': 'Process payments through secure payment providers'
      },
      'deliver_orders': {
        'pt': 'Entregar encomendas através de empresas de transporte',
        'en': 'Deliver orders through shipping companies'
      },
      'legal_requirements': {
        'pt': 'Cumprir requisitos legais ou regulamentares',
        'en': 'Comply with legal or regulatory requirements'
      },
      'data_security': {
        'pt': 'Segurança dos Dados',
        'en': 'Data Security'
      },
      'security_measures': {
        'pt': 'Implementamos medidas de segurança técnicas e organizacionais para proteger as suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.',
        'en': 'We implement technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure or destruction.'
      },
      'your_rights': {
        'pt': 'Os Seus Direitos',
        'en': 'Your Rights'
      },
      'gdpr_rights_intro': {
        'pt': 'De acordo com o RGPD, tem os seguintes direitos:',
        'en': 'Under GDPR, you have the following rights:'
      },
      'right_access': {
        'pt': 'Acesso',
        'en': 'Access'
      },
      'right_access_desc': {
        'pt': 'Solicitar uma cópia das suas informações pessoais',
        'en': 'Request a copy of your personal information'
      },
      'right_rectification': {
        'pt': 'Retificação',
        'en': 'Rectification'
      },
      'right_rectification_desc': {
        'pt': 'Corrigir informações incorretas ou desatualizadas',
        'en': 'Correct incorrect or outdated information'
      },
      'right_erasure': {
        'pt': 'Eliminação',
        'en': 'Erasure'
      },
      'right_erasure_desc': {
        'pt': 'Solicitar a eliminação dos seus dados',
        'en': 'Request the deletion of your data'
      },
      'right_portability': {
        'pt': 'Portabilidade',
        'en': 'Portability'
      },
      'right_portability_desc': {
        'pt': 'Transferir os seus dados para outro fornecedor',
        'en': 'Transfer your data to another provider'
      },
      'right_objection': {
        'pt': 'Oposição',
        'en': 'Objection'
      },
      'right_objection_desc': {
        'pt': 'Opor-se ao processamento dos seus dados',
        'en': 'Object to the processing of your data'
      },
      'cookies_description': {
        'pt': 'Utilizamos cookies para melhorar a funcionalidade do site e a sua experiência. Pode gerir as suas preferências de cookies nas configurações do seu navegador.',
        'en': 'We use cookies to improve site functionality and your experience. You can manage your cookie preferences in your browser settings.'
      },
      'policy_changes': {
        'pt': 'Alterações à Política',
        'en': 'Policy Changes'
      },
      'policy_updates': {
        'pt': 'Reservamo-nos o direito de atualizar esta política de privacidade. Notificaremos sobre alterações significativas através do nosso site ou por email.',
        'en': 'We reserve the right to update this privacy policy. We will notify about significant changes through our website or by email.'
      },
      'privacy_contact_intro': {
        'pt': 'Para questões sobre esta política de privacidade ou para exercer os seus direitos, contacte-nos:',
        'en': 'For questions about this privacy policy or to exercise your rights, contact us:'
      },
      'privacy_email': {
        'pt': 'privacidade@ecommerce.pt',
        'en': 'privacy@ecommerce.pt'
      },
      'support_phone': {
        'pt': '+351 21 123 4567',
        'en': '+351 21 123 4567'
      },
      'company_address': {
        'pt': 'Rua do Comércio, 123, 1000-100 Lisboa, Portugal',
        'en': '123 Commerce Street, 1000-100 Lisbon, Portugal'
      },
      'policy_update_date': {
        'pt': '1 de Janeiro de 2025',
        'en': 'January 1, 2025'
      },

      // ===== TERMS OF SERVICE SPECIFIC =====
      'terms_welcome_message': {
        'pt': 'Bem-vindo ao nosso site de e-commerce. Ao utilizar os nossos serviços, concorda com os seguintes termos e condições.',
        'en': 'Welcome to our e-commerce website. By using our services, you agree to the following terms and conditions.'
      },
      'terms_acceptance_desc': {
        'pt': 'Ao aceder e utilizar este site, aceita estar vinculado a estes termos de uso. Se não concorda com qualquer parte destes termos, não deve utilizar o nosso serviço.',
        'en': 'By accessing and using this website, you agree to be bound by these terms of use. If you do not agree with any part of these terms, you should not use our service.'
      },
      'eligibility': {
        'pt': 'Elegibilidade',
        'en': 'Eligibility'
      },
      'eligibility_intro': {
        'pt': 'Para utilizar os nossos serviços, deve:',
        'en': 'To use our services, you must:'
      },
      'age_requirement': {
        'pt': 'Ter pelo menos 18 anos de idade',
        'en': 'Be at least 18 years old'
      },
      'legal_capacity': {
        'pt': 'Ter capacidade legal para celebrar contratos',
        'en': 'Have legal capacity to enter into contracts'
      },
      'accurate_information': {
        'pt': 'Fornecer informações verdadeiras e precisas',
        'en': 'Provide true and accurate information'
      },
      'account_security': {
        'pt': 'Manter a segurança da sua conta',
        'en': 'Maintain the security of your account'
      },
      'orders_payments': {
        'pt': 'Encomendas e Pagamentos',
        'en': 'Orders and Payments'
      },
      'ordering_process': {
        'pt': 'Processo de Encomenda',
        'en': 'Ordering Process'
      },
      'stock_availability': {
        'pt': 'Todas as encomendas estão sujeitas à disponibilidade de stock',
        'en': 'All orders are subject to stock availability'
      },
      'cancellation_rights': {
        'pt': 'Reservamo-nos o direito de cancelar encomendas por motivos técnicos ou de stock',
        'en': 'We reserve the right to cancel orders for technical or stock reasons'
      },
      'price_changes': {
        'pt': 'Os preços podem ser alterados sem aviso prévio',
        'en': 'Prices may be changed without prior notice'
      },
      'order_confirmation': {
        'pt': 'A confirmação da encomenda será enviada por email',
        'en': 'Order confirmation will be sent by email'
      },
      'payment_methods': {
        'pt': 'Métodos de Pagamento',
        'en': 'Payment Methods'
      },
      'accepted_payments': {
        'pt': 'Aceitamos cartões de crédito/débito e transferências bancárias',
        'en': 'We accept credit/debit cards and bank transfers'
      },
      'payment_timing': {
        'pt': 'O pagamento deve ser efetuado no momento da encomenda',
        'en': 'Payment must be made at the time of ordering'
      },
      'secure_transactions': {
        'pt': 'Todas as transações são processadas de forma segura',
        'en': 'All transactions are processed securely'
      },
      'shipping_delivery': {
        'pt': 'Envio e Entrega',
        'en': 'Shipping and Delivery'
      },
      'delivery_estimates': {
        'pt': 'Os prazos de entrega são estimativas e podem variar',
        'en': 'Delivery times are estimates and may vary'
      },
      'delivery_responsibility': {
        'pt': 'A responsabilidade pela entrega transfere-se no momento da expedição',
        'en': 'Delivery responsibility transfers at the time of shipment'
      },
      'shipping_calculation': {
        'pt': 'Taxas de envio são calculadas com base no peso e destino',
        'en': 'Shipping fees are calculated based on weight and destination'
      },
      'business_day_delivery': {
        'pt': 'Entregas são feitas durante dias úteis',
        'en': 'Deliveries are made during business days'
      },
      'returns_exchanges': {
        'pt': 'Devoluções e Trocas',
        'en': 'Returns and Exchanges'
      },
      'return_policy_14_days': {
        'pt': 'Política de devolução de 14 dias:',
        'en': '14-day return policy:'
      },
      'original_condition': {
        'pt': 'Produtos devem estar em condições originais',
        'en': 'Products must be in original condition'
      },
      'original_packaging': {
        'pt': 'Embalagem original deve estar intacta',
        'en': 'Original packaging must be intact'
      },
      'return_shipping_cost': {
        'pt': 'Cliente responsável pelos custos de devolução',
        'en': 'Customer responsible for return shipping costs'
      },
      'refund_processing_time': {
        'pt': 'Reembolsos processados em 5-10 dias úteis',
        'en': 'Refunds processed in 5-10 business days'
      },
      'warranties': {
        'pt': 'Garantias',
        'en': 'Warranties'
      },
      'manufacturer_warranty': {
        'pt': 'Produtos cobertos pela garantia do fabricante',
        'en': 'Products covered by manufacturer warranty'
      },
      'manufacturing_defects': {
        'pt': 'Defeitos de fabrico são cobertos pela garantia',
        'en': 'Manufacturing defects are covered by warranty'
      },
      'misuse_exclusion': {
        'pt': 'Danos causados pelo uso inadequado não são cobertos',
        'en': 'Damage caused by improper use is not covered'
      },
      'warranty_procedures': {
        'pt': 'Procedimentos de garantia devem ser iniciados por email',
        'en': 'Warranty procedures must be initiated by email'
      },
      'prohibited_use': {
        'pt': 'Uso Proibido',
        'en': 'Prohibited Use'
      },
      'prohibited_activities_intro': {
        'pt': 'É proibido utilizar o nosso site para:',
        'en': 'It is prohibited to use our website for:'
      },
      'illegal_activities': {
        'pt': 'Atividades ilegais ou fraudulentas',
        'en': 'Illegal or fraudulent activities'
      },
      'ip_violations': {
        'pt': 'Violar direitos de propriedade intelectual',
        'en': 'Violate intellectual property rights'
      },
      'malicious_code': {
        'pt': 'Transmitir vírus ou código malicioso',
        'en': 'Transmit viruses or malicious code'
      },
      'site_interference': {
        'pt': 'Interferir com o funcionamento do site',
        'en': 'Interfere with the operation of the site'
      },
      'fake_accounts': {
        'pt': 'Criar contas falsas ou múltiplas',
        'en': 'Create false or multiple accounts'
      },
      'content_ownership': {
        'pt': 'Todo o conteúdo do site, incluindo textos, imagens, logos e design, é propriedade da empresa e está protegido por leis de direitos autorais.',
        'en': 'All website content, including texts, images, logos and design, is company property and is protected by copyright laws.'
      },
      'liability_limitation_desc': {
        'pt': 'A nossa responsabilidade está limitada ao valor da encomenda. Não somos responsáveis por danos indiretos, consequenciais ou incidentais.',
        'en': 'Our liability is limited to the order value. We are not responsible for indirect, consequential or incidental damages.'
      },
      'governing_law_desc': {
        'pt': 'Estes termos são regidos pela lei portuguesa. Qualquer disputa será resolvida nos tribunais de Lisboa, Portugal.',
        'en': 'These terms are governed by Portuguese law. Any dispute will be resolved in the courts of Lisbon, Portugal.'
      },
      'terms_changes': {
        'pt': 'Alterações aos Termos',
        'en': 'Changes to Terms'
      },
      'terms_modification_desc': {
        'pt': 'Reservamo-nos o direito de alterar estes termos a qualquer momento. As alterações entram em vigor imediatamente após a publicação.',
        'en': 'We reserve the right to change these terms at any time. Changes take effect immediately after publication.'
      },
      'terms_contact_intro': {
        'pt': 'Para questões sobre estes termos, contacte-nos:',
        'en': 'For questions about these terms, contact us:'
      },
      'legal_email': {
        'pt': 'legal@ecommerce.pt',
        'en': 'legal@ecommerce.pt'
      },
      'terms_update_date': {
        'pt': '1 de Janeiro de 2025',
        'en': 'January 1, 2025'
      },

      // ===== SHIPPING & RETURNS SPECIFIC =====
      'shipping_returns_intro': {
        'pt': 'Informações sobre envios, entregas e política de devoluções.',
        'en': 'Information about shipping, deliveries and return policy.'
      },
      'shipping_policy': {
        'pt': 'Política de Envios',
        'en': 'Shipping Policy'
      },
      'shipping_methods': {
        'pt': 'Métodos de Envio',
        'en': 'Shipping Methods'
      },
      'standard_shipping': {
        'pt': 'Envio Standard',
        'en': 'Standard Shipping'
      },
      'express_shipping': {
        'pt': 'Envio Expresso',
        'en': 'Express Shipping'
      },
      'standard_delivery_time': {
        'pt': '3-5 dias úteis',
        'en': '3-5 business days'
      },
      'express_delivery_time': {
        'pt': '1-2 dias úteis',
        'en': '1-2 business days'
      },
      'free_shipping_threshold': {
        'pt': 'para encomendas superiores a €50!',
        'en': 'for orders over €50!'
      },
      'delivery_zones': {
        'pt': 'Zonas de Entrega',
        'en': 'Delivery Zones'
      },
      'portugal_mainland': {
        'pt': 'Portugal Continental',
        'en': 'Portugal Mainland'
      },
      'portuguese_islands': {
        'pt': 'Ilhas (Açores/Madeira)',
        'en': 'Islands (Azores/Madeira)'
      },
      'spain': {
        'pt': 'Espanha',
        'en': 'Spain'
      },
      'european_union': {
        'pt': 'União Europeia',
        'en': 'European Union'
      },
      'mainland_delivery_time': {
        'pt': '3-5 dias úteis',
        'en': '3-5 business days'
      },
      'islands_delivery_time': {
        'pt': '5-7 dias úteis',
        'en': '5-7 business days'
      },
      'spain_delivery_time': {
        'pt': '5-7 dias úteis',
        'en': '5-7 business days'
      },
      'eu_delivery_time': {
        'pt': '7-10 dias úteis',
        'en': '7-10 business days'
      },
      'order_processing': {
        'pt': 'Processamento de Encomendas',
        'en': 'Order Processing'
      },
      'processing_time': {
        'pt': 'Encomendas são processadas em 1-2 dias úteis',
        'en': 'Orders are processed in 1-2 business days'
      },
      'same_day_shipping': {
        'pt': 'Encomendas feitas até às 14h são enviadas no mesmo dia',
        'en': 'Orders placed before 2 PM are shipped the same day'
      },
      'no_weekend_processing': {
        'pt': 'Não processamos encomendas aos fins de semana',
        'en': 'We do not process orders on weekends'
      },
      'tracking_confirmation': {
        'pt': 'Receberá email de confirmação e código de seguimento',
        'en': 'You will receive confirmation email and tracking code'
      },
      'return_period_intro': {
        'pt': 'Tem',
        'en': 'You have'
      },
      'fourteen_days': {
        'pt': '14 dias',
        'en': '14 days'
      },
      'return_period_desc': {
        'pt': 'para devolver produtos a partir da data de entrega.',
        'en': 'to return products from the delivery date.'
      },
      'return_conditions': {
        'pt': 'Condições para Devolução',
        'en': 'Return Conditions'
      },
      'tags_attached': {
        'pt': 'Etiquetas e selos não devem ser removidos',
        'en': 'Tags and seals must not be removed'
      },
      'no_custom_returns': {
        'pt': 'Produtos personalizados não podem ser devolvidos',
        'en': 'Customized products cannot be returned'
      },
      'no_hygiene_returns': {
        'pt': 'Produtos de higiene pessoal não podem ser devolvidos',
        'en': 'Personal hygiene products cannot be returned'
      },
      'how_to_return': {
        'pt': 'Como Devolver',
        'en': 'How to Return'
      },
      'return_email_instruction': {
        'pt': 'Envie email para devolver@ecommerce.pt',
        'en': 'Send email to returns@ecommerce.pt'
      },
      'package_product': {
        'pt': 'Embale o Produto',
        'en': 'Package the Product'
      },
      'use_original_packaging': {
        'pt': 'Use a embalagem original',
        'en': 'Use the original packaging'
      },
      'ship_product': {
        'pt': 'Envie o Produto',
        'en': 'Ship the Product'
      },
      'address_provided': {
        'pt': 'Para a morada que forneceremos',
        'en': 'To the address we will provide'
      },
      'return_costs': {
        'pt': 'Custos de Devolução',
        'en': 'Return Costs'
      },
      'defective_product': {
        'pt': 'Produto com defeito',
        'en': 'Defective product'
      },
      'we_cover_costs': {
        'pt': 'Assumimos os custos de devolução',
        'en': 'We cover return costs'
      },
      'change_of_mind': {
        'pt': 'Mudança de ideias',
        'en': 'Change of mind'
      },
      'customer_pays_costs': {
        'pt': 'Cliente paga os custos (€4.99)',
        'en': 'Customer pays costs (€4.99)'
      },
      'wrong_product_sent': {
        'pt': 'Produto errado enviado',
        'en': 'Wrong product sent'
      },
      'refunds': {
        'pt': 'Reembolsos',
        'en': 'Refunds'
      },
      'original_payment_method': {
        'pt': 'Reembolso feito para o método de pagamento original',
        'en': 'Refund made to original payment method'
      },
      'email_confirmation': {
        'pt': 'Receberá confirmação por email',
        'en': 'You will receive email confirmation'
      },
      'no_shipping_refund': {
        'pt': 'Custos de envio original não são reembolsados',
        'en': 'Original shipping costs are not refunded'
      },
      'refund_amount': {
        'pt': 'Valor do Reembolso',
        'en': 'Refund Amount'
      },
      'return_reason': {
        'pt': 'Motivo da Devolução',
        'en': 'Return Reason'
      },
      'refunded_amount': {
        'pt': 'Valor Reembolsado',
        'en': 'Refunded Amount'
      },
      'full_refund_plus_shipping': {
        'pt': '100% + custos envio',
        'en': '100% + shipping costs'
      },
      'free': {
        'pt': 'Grátis',
        'en': 'Free'
      },
      'wrong_product': {
        'pt': 'Produto errado',
        'en': 'Wrong product'
      },
      'product_refund_only': {
        'pt': '100% do produto',
        'en': '100% of product'
      },
      'return_shipping_fee': {
        'pt': '€4.99',
        'en': '€4.99'
      },
      'exchanges': {
        'pt': 'Trocas',
        'en': 'Exchanges'
      },
      'exchange_policy_desc': {
        'pt': 'Oferecemos trocas por tamanho ou cor diferente. O novo produto deve ter o mesmo valor ou superior. Se superior, a diferença será cobrada.',
        'en': 'We offer exchanges for different size or color. The new product must have the same or higher value. If higher, the difference will be charged.'
      },
      'can_i_track_order': {
        'pt': 'Posso rastrear a minha encomenda?',
        'en': 'Can I track my order?'
      },
      'tracking_answer': {
        'pt': 'Sim! Receberá um código de rastreamento por email assim que a encomenda for enviada.',
        'en': 'Yes! You will receive a tracking code by email as soon as the order is shipped.'
      },
      'not_home_delivery': {
        'pt': 'E se não estiver em casa na entrega?',
        'en': 'What if I am not home for delivery?'
      },
      'delivery_notice_answer': {
        'pt': 'O transportador deixará um aviso e tentará entregar novamente no dia seguinte.',
        'en': 'The carrier will leave a notice and attempt delivery again the next day.'
      },
      'shipping_returns_contact_intro': {
        'pt': 'Para questões sobre envios e devoluções:',
        'en': 'For shipping and returns questions:'
      },
      'shipping_email': {
        'pt': 'Email Envios',
        'en': 'Shipping Email'
      },
      'shipping_email_address': {
        'pt': 'envios@ecommerce.pt',
        'en': 'shipping@ecommerce.pt'
      },
      'returns_email': {
        'pt': 'Email Devoluções',
        'en': 'Returns Email'
      },
      'returns_email_address': {
        'pt': 'devolver@ecommerce.pt',
        'en': 'returns@ecommerce.pt'
      },
      'schedule': {
        'pt': 'Horário',
        'en': 'Schedule'
      },
      'business_hours': {
        'pt': 'Segunda a Sexta, 9h-18h',
        'en': 'Monday to Friday, 9am-6pm'
      },

      // ===== CUSTOMER SUPPORT SPECIFIC =====
      'support_intro_message': {
        'pt': 'Estamos aqui para ajudar! Entre em contacto connosco através dos canais disponíveis.',
        'en': 'We are here to help! Contact us through the available channels.'
      },
      'direct_contacts': {
        'pt': 'Contactos Diretos',
        'en': 'Direct Contacts'
      },
      'weekday_hours': {
        'pt': 'Segunda a Sexta: 9h-18h',
        'en': 'Monday to Friday: 9am-6pm'
      },
      'immediate_response': {
        'pt': 'Resposta imediata',
        'en': 'Immediate response'
      },
      'email_response_time': {
        'pt': 'Resposta em 2-4 horas',
        'en': 'Response in 2-4 hours'
      },
      'available_24_7': {
        'pt': '24/7 disponível',
        'en': '24/7 available'
      },
      'online_chat': {
        'pt': 'Chat Online',
        'en': 'Online Chat'
      },
      'live_chat': {
        'pt': 'Chat ao Vivo',
        'en': 'Live Chat'
      },
      'start_chat': {
        'pt': 'Iniciar Chat',
        'en': 'Start Chat'
      },
      'whatsapp': {
        'pt': 'WhatsApp',
        'en': 'WhatsApp'
      },
      'whatsapp_response_time': {
        'pt': 'Resposta em 1-2 horas',
        'en': 'Response in 1-2 hours'
      },
      'send_message': {
        'pt': 'Enviar Mensagem',
        'en': 'Send Message'
      },
      'specialized_departments': {
        'pt': 'Departamentos Especializados',
        'en': 'Specialized Departments'
      },
      'specialties': {
        'pt': 'Especialidades',
        'en': 'Specialties'
      },
      'orders_email': {
        'pt': 'encomendas@ecommerce.pt',
        'en': 'orders@ecommerce.pt'
      },
      'orders_phone': {
        'pt': '+351 21 123 4567 (Extensão 1)',
        'en': '+351 21 123 4567 (Extension 1)'
      },
      'payment_issues': {
        'pt': 'Problemas de pagamento',
        'en': 'Payment issues'
      },
      'order_changes': {
        'pt': 'Alterações de encomenda',
        'en': 'Order changes'
      },
      'cancellations': {
        'pt': 'Cancelamentos',
        'en': 'Cancellations'
      },
      'shipping_phone': {
        'pt': '+351 21 123 4567 (Extensão 2)',
        'en': '+351 21 123 4567 (Extension 2)'
      },
      'order_tracking': {
        'pt': 'Rastreamento de encomendas',
        'en': 'Order tracking'
      },
      'delivery_issues': {
        'pt': 'Problemas de entrega',
        'en': 'Delivery issues'
      },
      'address_change': {
        'pt': 'Alteração de morada',
        'en': 'Address change'
      },
      'special_deliveries': {
        'pt': 'Entregas especiais',
        'en': 'Special deliveries'
      },
      'returns_phone': {
        'pt': '+351 21 123 4567 (Extensão 3)',
        'en': '+351 21 123 4567 (Extension 3)'
      },
      'product_exchanges': {
        'pt': 'Trocas de produtos',
        'en': 'Product exchanges'
      },
      'defective_products': {
        'pt': 'Produtos com defeito',
        'en': 'Defective products'
      },
      'technical_support': {
        'pt': 'Suporte Técnico',
        'en': 'Technical Support'
      },
      'technical_email': {
        'pt': 'tecnico@ecommerce.pt',
        'en': 'technical@ecommerce.pt'
      },
      'technical_phone': {
        'pt': '+351 21 123 4567 (Extensão 4)',
        'en': '+351 21 123 4567 (Extension 4)'
      },
      'website_issues': {
        'pt': 'Problemas no site',
        'en': 'Website issues'
      },
      'login_difficulties': {
        'pt': 'Dificuldades de login',
        'en': 'Login difficulties'
      },
      'mobile_app_issues': {
        'pt': 'Problemas na aplicação móvel',
        'en': 'Mobile app issues'
      },
      'service_hours': {
        'pt': 'Horários de Atendimento',
        'en': 'Service Hours'
      },
      'service': {
        'pt': 'Serviço',
        'en': 'Service'
      },
      'monday_friday': {
        'pt': 'Segunda - Sexta',
        'en': 'Monday - Friday'
      },
      'saturday': {
        'pt': 'Sábado',
        'en': 'Saturday'
      },
      'sunday': {
        'pt': 'Domingo',
        'en': 'Sunday'
      },
      'weekday_schedule': {
        'pt': '9h - 18h',
        'en': '9am - 6pm'
      },
      'saturday_schedule': {
        'pt': '10h - 16h',
        'en': '10am - 4pm'
      },
      'closed': {
        'pt': 'Fechado',
        'en': 'Closed'
      },
      'email_availability': {
        'pt': '24/7 - Resposta em 2-4 horas nos dias úteis',
        'en': '24/7 - Response in 2-4 hours on business days'
      },
      'whatsapp_weekday': {
        'pt': '9h - 20h',
        'en': '9am - 8pm'
      },
      'whatsapp_saturday': {
        'pt': '10h - 18h',
        'en': '10am - 6pm'
      },
      'whatsapp_sunday': {
        'pt': '12h - 18h',
        'en': '12pm - 6pm'
      },
      'contact_form': {
        'pt': 'Formulário de Contacto',
        'en': 'Contact Form'
      },
      'subject': {
        'pt': 'Assunto',
        'en': 'Subject'
      },
      'select_subject': {
        'pt': 'Selecione o assunto',
        'en': 'Select subject'
      },
      'order_question': {
        'pt': 'Questão sobre encomenda',
        'en': 'Order question'
      },
      'delivery_problem': {
        'pt': 'Problema de entrega',
        'en': 'Delivery problem'
      },
      'return_exchange': {
        'pt': 'Devolução/Troca',
        'en': 'Return/Exchange'
      },
      'other': {
        'pt': 'Outro',
        'en': 'Other'
      },
      'order_number_optional': {
        'pt': 'Número da Encomenda (se aplicável)',
        'en': 'Order Number (if applicable)'
      },
      'order_number_example': {
        'pt': 'Ex: EC2025001234',
        'en': 'Ex: EC2025001234'
      },
      'message': {
        'pt': 'Mensagem',
        'en': 'Message'
      },
      'message_placeholder': {
        'pt': 'Descreva a sua questão ou problema...',
        'en': 'Describe your question or problem...'
      },
      'before_contacting': {
        'pt': 'Antes de Contactar',
        'en': 'Before Contacting'
      },
      'tip_check_faq': {
        'pt': 'Dica: Consulte primeiro as nossas FAQ',
        'en': 'Tip: Check our FAQ first'
      },
      'faq_suggestion_text': {
        'pt': 'Muitas questões comuns já têm resposta na nossa secção de',
        'en': 'Many common questions are already answered in our'
      },
      'order_number_ready': {
        'pt': 'Tenha à mão o número da sua encomenda para um atendimento mais rápido.',
        'en': 'Have your order number ready for faster service.'
      },
      'company_information': {
        'pt': 'Informações da Empresa',
        'en': 'Company Information'
      },
      'headquarters': {
        'pt': 'Sede',
        'en': 'Headquarters'
      },
      'company_name': {
        'pt': 'E-Commerce Portugal, Lda.',
        'en': 'E-Commerce Portugal, Ltd.'
      },
      'company_address_full': {
        'pt': 'Rua do Comércio, 123<br>1000-100 Lisboa<br>Portugal',
        'en': '123 Commerce Street<br>1000-100 Lisbon<br>Portugal'
      },
      'tax_information': {
        'pt': 'Informações Fiscais',
        'en': 'Tax Information'
      },
      'tax_number': {
        'pt': 'NIF',
        'en': 'Tax Number'
      },
      'company_tax_number': {
        'pt': '123 456 789',
        'en': '123 456 789'
      },
      'registry': {
        'pt': 'Conservatória',
        'en': 'Registry'
      },
      'company_registry': {
        'pt': 'Lisboa',
        'en': 'Lisbon'
      },
      'share_capital': {
        'pt': 'Capital Social',
        'en': 'Share Capital'
      },
      'company_capital': {
        'pt': '€50.000',
        'en': '€50,000'
      },

      // ===== FAQ SPECIFIC =====
      'faq_intro_message': {
        'pt': 'Encontre respostas para as questões mais comuns sobre os nossos produtos e serviços.',
        'en': 'Find answers to the most common questions about our products and services.'
      },
      'search_question': {
        'pt': 'Pesquisar pergunta...',
        'en': 'Search question...'
      },
      'orders': {
        'pt': 'Encomendas',
        'en': 'Orders'
      },
      'how_to_order': {
        'pt': 'Como faço uma encomenda?',
        'en': 'How do I place an order?'
      },
      'how_to_order_intro': {
        'pt': 'Para fazer uma encomenda:',
        'en': 'To place an order:'
      },
      'browse_products': {
        'pt': 'Navegue pelos nossos produtos',
        'en': 'Browse our products'
      },
      'go_to_checkout': {
        'pt': 'Vá ao carrinho e clique em "Finalizar Compra"',
        'en': 'Go to cart and click "Checkout"'
      },
      'fill_shipping_payment': {
        'pt': 'Preencha os dados de envio e pagamento',
        'en': 'Fill in shipping and payment details'
      },
      'confirm_order': {
        'pt': 'Confirme a encomenda',
        'en': 'Confirm the order'
      },
      'confirmation_email_desc': {
        'pt': 'Receberá um email de confirmação com todos os detalhes.',
        'en': 'You will receive a confirmation email with all details.'
      },
      'can_cancel_order': {
        'pt': 'Posso cancelar a minha encomenda?',
        'en': 'Can I cancel my order?'
      },
      'cancel_order_timeframe': {
        'pt': 'Sim, pode cancelar a sua encomenda até 2 horas após a confirmação, desde que ainda não tenha sido processada.',
        'en': 'Yes, you can cancel your order up to 2 hours after confirmation, as long as it has not been processed yet.'
      },
      'to_cancel': {
        'pt': 'Para cancelar:',
        'en': 'To cancel:'
      },
      'contact_email_orders': {
        'pt': 'Contacte-nos através do email: encomendas@ecommerce.pt',
        'en': 'Contact us via email: orders@ecommerce.pt'
      },
      'phone_contact': {
        'pt': 'Telefone: +351 21 123 4567',
        'en': 'Phone: +351 21 123 4567'
      },
      'include_order_number': {
        'pt': 'Inclua o número da encomenda na comunicação',
        'en': 'Include the order number in the communication'
      },
      'can_change_address': {
        'pt': 'Posso alterar o endereço de entrega após fazer a encomenda?',
        'en': 'Can I change the delivery address after placing the order?'
      },
      'address_change_timeframe': {
        'pt': 'Alterações de endereço são possíveis até 24 horas antes do envio, dependendo do estado da encomenda.',
        'en': 'Address changes are possible up to 24 hours before shipping, depending on the order status.'
      },
      'contact_us_quickly': {
        'pt': 'Contacte-nos o mais rápido possível através de:',
        'en': 'Contact us as soon as possible through:'
      },
      'shipping_email_contact': {
        'pt': 'Email: envios@ecommerce.pt',
        'en': 'Email: shipping@ecommerce.pt'
      },
      'shipping_phone_contact': {
        'pt': 'Telefone: +351 21 123 4567 (Extensão 2)',
        'en': 'Phone: +351 21 123 4567 (Extension 2)'
      },

      // ===== FAQ SHIPPING & DELIVERY =====
      'delivery_timeframe_question': {
        'pt': 'Qual é o prazo de entrega?',
        'en': 'What is the delivery timeframe?'
      },
      'destination': {
        'pt': 'Destino',
        'en': 'Destination'
      },
      'islands_standard_time': {
        'pt': '5-7 dias úteis',
        'en': '5-7 business days'
      },
      'islands_express_time': {
        'pt': '3-4 dias úteis',
        'en': '3-4 business days'
      },
      'spain_standard_time': {
        'pt': '5-7 dias úteis',
        'en': '5-7 business days'
      },
      'spain_express_time': {
        'pt': '3-5 dias úteis',
        'en': '3-5 business days'
      },
      'eu_standard_time': {
        'pt': '7-10 dias úteis',
        'en': '7-10 business days'
      },
      'eu_express_time': {
        'pt': '5-7 dias úteis',
        'en': '5-7 business days'
      },
      'how_track_order': {
        'pt': 'Como posso rastrear a minha encomenda?',
        'en': 'How can I track my order?'
      },
      'after_shipping_email': {
        'pt': 'Após o envio, receberá um email com:',
        'en': 'After shipping, you will receive an email with:'
      },
      'tracking_code': {
        'pt': 'Código de rastreamento',
        'en': 'Tracking code'
      },
      'direct_tracking_link': {
        'pt': 'Link direto para acompanhar o estado',
        'en': 'Direct link to track status'
      },
      'carrier_information': {
        'pt': 'Informações da transportadora',
        'en': 'Carrier information'
      },
      'check_account_orders': {
        'pt': 'Também pode verificar o estado na sua conta, na secção "Minhas Encomendas".',
        'en': 'You can also check the status in your account, in the "My Orders" section.'
      },
      'shipping_cost_question': {
        'pt': 'Quanto custa o envio?',
        'en': 'How much does shipping cost?'
      },
      'standard_cost': {
        'pt': '€4.99',
        'en': '€4.99'
      },
      'express_cost': {
        'pt': '€9.99',
        'en': '€9.99'
      },
      'international_cost_note': {
        'pt': 'Os custos podem variar para destinos internacionais.',
        'en': 'Costs may vary for international destinations.'
      },

      // ===== FAQ RETURNS =====
      'return_timeframe_question': {
        'pt': 'Qual é o prazo para devoluções?',
        'en': 'What is the timeframe for returns?'
      },
      'return_period_answer': {
        'pt': 'Tem 14 dias a partir da data de entrega para devolver produtos.',
        'en': 'You have 14 days from the delivery date to return products.'
      },
      'conditions': {
        'pt': 'Condições',
        'en': 'Conditions'
      },
      'can_exchange_size_color': {
        'pt': 'Posso trocar por um tamanho ou cor diferente?',
        'en': 'Can I exchange for a different size or color?'
      },
      'exchange_answer': {
        'pt': 'Sim! Oferecemos trocas por tamanho ou cor diferente.',
        'en': 'Yes! We offer exchanges for different size or color.'
      },
      'process': {
        'pt': 'Processo',
        'en': 'Process'
      },
      'contact_returns_email': {
        'pt': 'Contacte-nos em devolver@ecommerce.pt',
        'en': 'Contact us at returns@ecommerce.pt'
      },
      'send_original_back': {
        'pt': 'Envie o produto original de volta',
        'en': 'Send the original product back'
      },
      'send_new_product': {
        'pt': 'Enviaremos o novo produto',
        'en': 'We will send the new product'
      },
      'price_difference_note': {
        'pt': 'Se o novo produto tiver valor superior, cobramos a diferença.',
        'en': 'If the new product has higher value, we charge the difference.'
      },
      'refund_time_question': {
        'pt': 'Quanto tempo demora o reembolso?',
        'en': 'How long does the refund take?'
      },
      'refund_processing_answer': {
        'pt': 'Reembolsos são processados em 5-10 dias úteis após recebermos o produto devolvido.',
        'en': 'Refunds are processed in 5-10 business days after we receive the returned product.'
      },
      'refund_email_confirmation': {
        'pt': 'Receberá confirmação por email quando o reembolso for processado.',
        'en': 'You will receive email confirmation when the refund is processed.'
      },

      // ===== FAQ PAYMENTS =====
      'payments': {
        'pt': 'Pagamentos',
        'en': 'Payments'
      },
      'payment_methods_question': {
        'pt': 'Que métodos de pagamento aceitam?',
        'en': 'What payment methods do you accept?'
      },
      'accepted_payment_methods': {
        'pt': 'Aceitamos os seguintes métodos de pagamento:',
        'en': 'We accept the following payment methods:'
      },
      'credit_debit_cards': {
        'pt': 'Cartões de Crédito/Débito',
        'en': 'Credit/Debit Cards'
      },
      'card_brands': {
        'pt': 'Visa, Mastercard, American Express',
        'en': 'Visa, Mastercard, American Express'
      },
      'multibanco': {
        'pt': 'Multibanco',
        'en': 'Multibanco'
      },
      'mb_way': {
        'pt': 'MB Way',
        'en': 'MB Way'
      },
      'payment_security_question': {
        'pt': 'Os meus dados de pagamento estão seguros?',
        'en': 'Are my payment details secure?'
      },
      'security_priority': {
        'pt': 'Sim! A segurança dos seus dados é a nossa prioridade:',
        'en': 'Yes! The security of your data is our priority:'
      },
      'ssl_encryption': {
        'pt': 'Encriptação SSL de 256 bits',
        'en': '256-bit SSL encryption'
      },
      'no_card_storage': {
        'pt': 'Não armazenamos dados do cartão',
        'en': 'We do not store card data'
      },
      'secure_gateways': {
        'pt': 'Processamento através de gateways seguros',
        'en': 'Processing through secure gateways'
      },
      'pci_certification': {
        'pt': 'Certificação PCI DSS',
        'en': 'PCI DSS certification'
      },
      'invoice_question': {
        'pt': 'Recebo fatura da compra?',
        'en': 'Do I receive an invoice for the purchase?'
      },
      'invoice_answer': {
        'pt': 'Sim! Receberá automaticamente:',
        'en': 'Yes! You will automatically receive:'
      },
      'digital_invoice': {
        'pt': 'Fatura digital por email',
        'en': 'Digital invoice by email'
      },
      'valid_tax_document': {
        'pt': 'Documento fiscal válido para efeitos contabilísticos',
        'en': 'Valid tax document for accounting purposes'
      },
      'paper_invoice_option': {
        'pt': 'Pode solicitar fatura em papel (gratuito)',
        'en': 'You can request paper invoice (free)'
      },
      'business_invoice_note': {
        'pt': 'Para empresas, podemos emitir fatura com dados fiscais específicos.',
        'en': 'For businesses, we can issue invoices with specific tax details.'
      },

      // ===== FAQ ACCOUNT =====
      'account_profile': {
        'pt': 'Conta e Perfil',
        'en': 'Account and Profile'
      },
      'need_account_question': {
        'pt': 'Preciso de criar uma conta para comprar?',
        'en': 'Do I need to create an account to buy?'
      },
      'account_optional': {
        'pt': 'Não é obrigatório, mas criar uma conta tem vantagens:',
        'en': 'It is not mandatory, but creating an account has advantages:'
      },
      'shipping_tracking': {
        'pt': 'Rastreamento de envios',
        'en': 'Shipping tracking'
      },
      'faster_checkout': {
        'pt': 'Checkout mais rápido',
        'en': 'Faster checkout'
      },
      'exclusive_offers': {
        'pt': 'Ofertas exclusivas',
        'en': 'Exclusive offers'
      },
      'wishlist': {
        'pt': 'Lista de desejos',
        'en': 'Wishlist'
      },
      'free_registration': {
        'pt': 'O registo é gratuito e leva apenas 2 minutos!',
        'en': 'Registration is free and takes only 2 minutes!'
      },
      'forgot_password_question': {
        'pt': 'Esqueci-me da minha password. O que faço?',
        'en': 'I forgot my password. What do I do?'
      },
      'password_recovery_steps': {
        'pt': 'Para recuperar a sua password:',
        'en': 'To recover your password:'
      },
      'go_to_login': {
        'pt': 'Vá à página de login',
        'en': 'Go to the login page'
      },
      'click_forgot_password': {
        'pt': 'Clique em "Esqueci a password"',
        'en': 'Click "Forgot password"'
      },
      'enter_email': {
        'pt': 'Introduza o seu email',
        'en': 'Enter your email'
      },
      'receive_reset_link': {
        'pt': 'Receberá um link para criar nova password',
        'en': 'You will receive a link to create a new password'
      },
      'check_spam_folder': {
        'pt': 'Se não receber o email, verifique a pasta de spam.',
        'en': 'If you do not receive the email, check your spam folder.'
      },
      'change_personal_data_question': {
        'pt': 'Como altero os meus dados pessoais?',
        'en': 'How do I change my personal data?'
      },
      'change_data_steps': {
        'pt': 'Para alterar os seus dados:',
        'en': 'To change your data:'
      },
      'login_account': {
        'pt': 'Faça login na sua conta',
        'en': 'Login to your account'
      },
      'go_to_profile': {
        'pt': 'Vá ao "Meu Perfil"',
        'en': 'Go to "My Profile"'
      },
      'click_edit_data': {
        'pt': 'Clique em "Editar dados pessoais"',
        'en': 'Click "Edit personal data"'
      },
      'change_information': {
        'pt': 'Altere as informações necessárias',
        'en': 'Change the necessary information'
      },
      'save_changes': {
        'pt': 'Guarde as alterações',
        'en': 'Save the changes'
      },

      // ===== FAQ PRODUCTS =====
      'products_stock': {
        'pt': 'Produtos e Stock',
        'en': 'Products and Stock'
      },
      'out_of_stock_after_order': {
        'pt': 'O que acontece se um produto ficar sem stock após a encomenda?',
        'en': 'What happens if a product goes out of stock after the order?'
      },
      'out_of_stock_answer': {
        'pt': 'Se um produto ficar sem stock após a sua encomenda:',
        'en': 'If a product goes out of stock after your order:'
      },
      'immediate_contact': {
        'pt': 'Contactamos imediatamente por email/telefone',
        'en': 'We contact immediately by email/phone'
      },
      'similar_upgrade_offer': {
        'pt': 'Oferecemos produto similar ou upgrade gratuito',
        'en': 'We offer similar product or free upgrade'
      },
      'wait_restock_option': {
        'pt': 'Pode escolher esperar pela reposição',
        'en': 'You can choose to wait for restock'
      },
      'cancel_full_refund': {
        'pt': 'Ou cancelar e receber reembolso total',
        'en': 'Or cancel and receive full refund'
      },
      'product_warranties_question': {
        'pt': 'Que garantias têm os produtos?',
        'en': 'What warranties do products have?'
      },
      'all_products_have': {
        'pt': 'Todos os produtos têm:',
        'en': 'All products have:'
      },
      'legal_warranty': {
        'pt': 'Garantia legal',
        'en': 'Legal warranty'
      },
      'two_years_defects': {
        'pt': '2 anos (produtos com defeito)',
        'en': '2 years (defective products)'
      },
      'varies_by_product': {
        'pt': 'Varia por produto',
        'en': 'Varies by product'
      },
      'satisfaction_guarantee': {
        'pt': 'Garantia de satisfação',
        'en': 'Satisfaction guarantee'
      },
      'fourteen_days_return': {
        'pt': '14 dias para devolução',
        'en': '14 days for return'
      },
      'warranty_contact_info': {
        'pt': 'Para acionar garantia, contacte tecnico@ecommerce.pt',
        'en': 'To activate warranty, contact technical@ecommerce.pt'
      },

      // ===== FAQ FINAL =====
      'didnt_find_answer': {
        'pt': 'Não encontrou a resposta?',
        'en': 'Did not find the answer?'
      },
      'contact_support_text': {
        'pt': 'Entre em contacto connosco através da nossa página de',
        'en': 'Contact us through our'
      },
      'or_email': {
        'pt': 'ou envie email para',
        'en': 'or send email to'
      },
      'support_email_address': {
        'pt': 'suporte@ecommerce.pt',
        'en': 'support@ecommerce.pt'
      },

      // ===== CHECKOUT SPECIFIC =====
      'checkout_title': {
        'pt': 'Finalizar Compra',
        'en': 'Checkout'
      },
      'checkout_back_to_shopping': {
        'pt': 'Voltar às Compras',
        'en': 'Back to Shopping'
      },
      'checkout_shipping_info': {
        'pt': 'Informações de Envio',
        'en': 'Shipping Information'
      },
      'checkout_payment': {
        'pt': 'Pagamento',
        'en': 'Payment'
      },
      'checkout_order_review': {
        'pt': 'Revisão do Pedido',
        'en': 'Order Review'
      },
      'checkout_shipping_information': {
        'pt': 'Informações de Envio',
        'en': 'Shipping Information'
      },
      'checkout_first_name': {
        'pt': 'Nome',
        'en': 'First Name'
      },
      'checkout_enter_first_name': {
        'pt': 'Introduza o seu nome',
        'en': 'Enter your first name'
      },
      'checkout_last_name': {
        'pt': 'Apelido',
        'en': 'Last Name'
      },
      'checkout_enter_last_name': {
        'pt': 'Introduza o seu apelido',
        'en': 'Enter your last name'
      },
      'checkout_email': {
        'pt': 'Email',
        'en': 'Email'
      },
      'checkout_email_placeholder': {
        'pt': 'email@exemplo.com',
        'en': 'email@example.com'
      },
      'checkout_phone': {
        'pt': 'Telefone',
        'en': 'Phone'
      },
      'checkout_phone_placeholder': {
        'pt': '+351 912 345 678',
        'en': '+351 912 345 678'
      },
      'checkout_address': {
        'pt': 'Morada',
        'en': 'Address'
      },
      'checkout_address_placeholder': {
        'pt': 'Rua, número, andar',
        'en': 'Street, number, floor'
      },
      'checkout_city': {
        'pt': 'Cidade',
        'en': 'City'
      },
      'checkout_city_placeholder': {
        'pt': 'Lisboa',
        'en': 'Lisbon'
      },
      'checkout_postal_code': {
        'pt': 'Código Postal',
        'en': 'Postal Code'
      },
      'checkout_postal_code_placeholder': {
        'pt': '1000-001',
        'en': '1000-001'
      },
      'checkout_country': {
        'pt': 'País',
        'en': 'Country'
      },
      'checkout_country_portugal': {
        'pt': 'Portugal',
        'en': 'Portugal'
      },
      'checkout_country_spain': {
        'pt': 'Espanha',
        'en': 'Spain'
      },
      'checkout_country_france': {
        'pt': 'França',
        'en': 'France'
      },
      'checkout_country_others': {
        'pt': 'Outros',
        'en': 'Others'
      },
      'checkout_continue_to_payment': {
        'pt': 'Continuar para Pagamento',
        'en': 'Continue to Payment'
      },
      'checkout_payment_information': {
        'pt': 'Informações de Pagamento',
        'en': 'Payment Information'
      },
      'checkout_card_number': {
        'pt': 'Número do Cartão',
        'en': 'Card Number'
      },
      'checkout_card_number_placeholder': {
        'pt': '1234 5678 9012 3456',
        'en': '1234 5678 9012 3456'
      },
      'checkout_expiry_date': {
        'pt': 'Data de Validade',
        'en': 'Expiry Date'
      },
      'checkout_expiry_date_placeholder': {
        'pt': 'MM/AA',
        'en': 'MM/YY'
      },
      'checkout_cvv': {
        'pt': 'CVV',
        'en': 'CVV'
      },
      'checkout_cvv_placeholder': {
        'pt': '123',
        'en': '123'
      },
      'checkout_cardholder_name': {
        'pt': 'Nome no Cartão',
        'en': 'Cardholder Name'
      },
      'checkout_cardholder_name_placeholder': {
        'pt': 'Nome como aparece no cartão',
        'en': 'Name as it appears on card'
      },
      'checkout_save_info': {
        'pt': 'Guardar informações para futuros pedidos',
        'en': 'Save information for future orders'
      },
      'checkout_back': {
        'pt': 'Voltar',
        'en': 'Back'
      },
      'checkout_continue_to_review': {
        'pt': 'Continuar para Revisão',
        'en': 'Continue to Review'
      },
      'checkout_order_review_title': {
        'pt': 'Revisão do Pedido',
        'en': 'Order Review'
      },
      'checkout_order_items': {
        'pt': 'Artigos do Pedido',
        'en': 'Order Items'
      },
      'checkout_quantity': {
        'pt': 'Quantidade',
        'en': 'Quantity'
      },
      'checkout_shipping_info_summary': {
        'pt': 'Informações de Envio',
        'en': 'Shipping Information'
      },
      'checkout_name': {
        'pt': 'Nome',
        'en': 'Name'
      },
      'checkout_accept_terms': {
        'pt': 'Aceito os',
        'en': 'I accept the'
      },
      'checkout_terms_conditions': {
        'pt': 'Termos e Condições',
        'en': 'Terms and Conditions'
      },
      'checkout_must_accept_terms': {
        'pt': 'Deve aceitar os termos e condições',
        'en': 'You must accept the terms and conditions'
      },
      'checkout_newsletter_opt_in': {
        'pt': 'Quero receber ofertas especiais por email',
        'en': 'I want to receive special offers by email'
      },
      'checkout_processing': {
        'pt': 'A processar...',
        'en': 'Processing...'
      },
      'checkout_place_order': {
        'pt': 'Finalizar Pedido',
        'en': 'Place Order'
      },
      'checkout_order_summary': {
        'pt': 'Resumo do Pedido',
        'en': 'Order Summary'
      },
      'checkout_qty': {
        'pt': 'Qtd',
        'en': 'Qty'
      },
      'checkout_subtotal': {
        'pt': 'Subtotal',
        'en': 'Subtotal'
      },
      'checkout_shipping': {
        'pt': 'Envio',
        'en': 'Shipping'
      },
      'checkout_free': {
        'pt': 'Grátis',
        'en': 'Free'
      },
      'checkout_vat': {
        'pt': 'IVA (23%)',
        'en': 'VAT (23%)'
      },
      'checkout_total': {
        'pt': 'Total',
        'en': 'Total'
      },
      'checkout_free_shipping_message': {
        'pt': 'Adicione mais',
        'en': 'Add more'
      },

      // ===== PROFILE SPECIFIC =====
      'profile_my_profile': {
        'pt': 'Meu Perfil',
        'en': 'My Profile'
      },
      'profile_personal_data': {
        'pt': 'Dados Pessoais',
        'en': 'Personal Data'
      },
      'profile_change_password': {
        'pt': 'Alterar Password',
        'en': 'Change Password'
      },
      'profile_my_orders': {
        'pt': 'Minhas Encomendas',
        'en': 'My Orders'
      },
      'profile_logout': {
        'pt': 'Sair da Conta',
        'en': 'Logout'
      },
      'profile_full_name': {
        'pt': 'Nome Completo',
        'en': 'Full Name'
      },
      'profile_enter_full_name': {
        'pt': 'Digite seu nome completo',
        'en': 'Enter your full name'
      },
      'profile_username': {
        'pt': 'Username',
        'en': 'Username'
      },
      'profile_enter_username': {
        'pt': 'Digite seu username',
        'en': 'Enter your username'
      },
      'profile_email': {
        'pt': 'Email',
        'en': 'Email'
      },
      'profile_enter_email': {
        'pt': 'Digite seu email',
        'en': 'Enter your email'
      },
      'profile_phone': {
        'pt': 'Telefone',
        'en': 'Phone'
      },
      'profile_enter_phone': {
        'pt': 'Digite seu telefone',
        'en': 'Enter your phone'
      },
      'profile_saving': {
        'pt': 'Guardando...',
        'en': 'Saving...'
      },
      'profile_save_changes': {
        'pt': 'Guardar Alterações',
        'en': 'Save Changes'
      },
      'profile_current_password': {
        'pt': 'Password Atual',
        'en': 'Current Password'
      },
      'profile_enter_current_password': {
        'pt': 'Digite sua password atual',
        'en': 'Enter your current password'
      },
      'profile_new_password': {
        'pt': 'Nova Password',
        'en': 'New Password'
      },
      'profile_enter_new_password': {
        'pt': 'Digite sua nova password',
        'en': 'Enter your new password'
      },
      'profile_confirm_new_password': {
        'pt': 'Confirmar Nova Password',
        'en': 'Confirm New Password'
      },
      'profile_confirm_new_password_placeholder': {
        'pt': 'Confirme sua nova password',
        'en': 'Confirm your new password'
      },
      'profile_password_requirement': {
        'pt': 'A nova password deve ter pelo menos 8 caracteres.',
        'en': 'The new password must have at least 8 characters.'
      },
      'profile_changing': {
        'pt': 'Alterando...',
        'en': 'Changing...'
      },
      'profile_change_password_action': {
        'pt': 'Alterar Password',
        'en': 'Change Password'
      },
      'profile_no_orders_yet': {
        'pt': 'Ainda não fez nenhuma encomenda.',
        'en': 'You haven\'t made any orders yet.'
      },
      'profile_explore_products': {
        'pt': 'Explorar Produtos',
        'en': 'Explore Products'
      },
      'profile_order': {
        'pt': 'Encomenda',
        'en': 'Order'
      },
      'profile_items': {
        'pt': 'Itens',
        'en': 'Items'
      },
      'profile_total': {
        'pt': 'Total',
        'en': 'Total'
      },
      'profile_view_details': {
        'pt': 'Ver Detalhes',
        'en': 'View Details'
      },
      'profile_order_details': {
        'pt': 'Detalhes da Encomenda',
        'en': 'Order Details'
      },
      'profile_order_information': {
        'pt': 'Informações da Encomenda',
        'en': 'Order Information'
      },
      'profile_date': {
        'pt': 'Data',
        'en': 'Date'
      },
      'profile_status': {
        'pt': 'Status',
        'en': 'Status'
      },
      'profile_total_items': {
        'pt': 'Total de Items',
        'en': 'Total Items'
      },
      'profile_total_amount': {
        'pt': 'Valor Total',
        'en': 'Total Amount'
      },
      'profile_shipping_address': {
        'pt': 'Endereço de Envio',
        'en': 'Shipping Address'
      },
      'profile_name': {
        'pt': 'Nome',
        'en': 'Name'
      },
      'profile_address': {
        'pt': 'Endereço',
        'en': 'Address'
      },
      'profile_order_items': {
        'pt': 'Items da Encomenda',
        'en': 'Order Items'
      },
      'profile_product': {
        'pt': 'Produto',
        'en': 'Product'
      },
      'profile_quantity': {
        'pt': 'Quantidade',
        'en': 'Quantity'
      },
      'profile_unit_price': {
        'pt': 'Preço Unitário',
        'en': 'Unit Price'
      },
      'profile_subtotal': {
        'pt': 'Subtotal',
        'en': 'Subtotal'
      },
      'profile_close': {
        'pt': 'Fechar',
        'en': 'Close'
      },
      'profile_print_receipt': {
        'pt': 'Imprimir Recibo',
        'en': 'Print Receipt'
      }
    };

    return translations[key]?.[currentLang] || key;
  }

  /**
   * Obter todas as traduções para o idioma atual
   */
  getAllTranslations(): {[key: string]: string} {
    const currentLang = this.getCurrentLanguage();
    const result: {[key: string]: string} = {};
    
    // Aqui você poderia carregar traduções de um arquivo JSON ou API
    const keys = ['welcome', 'home', 'login', 'register', 'logout', 'profile', 'cart', 'checkout', 'search', 'products', 'language', 'shopping_cart', 'empty_cart', 'total', 'clear', 'remove'];
    
    keys.forEach(key => {
      result[key] = this.getTranslation(key);
    });
    
    return result;
  }
}