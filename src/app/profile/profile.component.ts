import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

interface UserData {
  id?: number;
  name: string;
  username: string;
  email: string;
  phone: string;
}

interface Order {
  id: number;
  date: string;
  status: string;
  total: number;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  shipping_info?: {
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
  };
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  // Seções ativas
  activeSection = 'personal'; // personal, password, orders

  // Formulários
  personalForm: FormGroup;
  passwordForm: FormGroup;

  // Estados
  isLoading = false;
  alertMessage = '';
  alertType = '';

  // Dados do utilizador
  userData: UserData = {
    name: '',
    username: '',
    email: '',
    phone: ''
  };

  // Encomendas
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  showOrderModal = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Inicializar formulários
    this.personalForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(9)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadUserOrders();
    
    // Verificar se foi direcionado para seção específica
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'orders') {
        this.setActiveSection('orders');
      }
    });
  }

  // Validador para confirmar passwords
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // Carregar dados do utilizador
  loadUserData(): void {
    this.authService.getProfile().subscribe({
      next: (profileData) => {
        this.userData = profileData;
        // Preencher formulário com dados reais
        this.personalForm.patchValue(this.userData);
      },
      error: (error) => {
        console.error('Erro ao carregar dados do perfil:', error);
        
        let errorMessage = 'Erro ao carregar dados do perfil.';
        if (error.status === 0) {
          errorMessage = 'Servidor não disponível. Certifique-se que o backend Flask está rodando na porta 5000.';
        } else if (error.status === 401) {
          errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
          this.authService.logout();
          return;
        }
        
        this.showAlert('danger', errorMessage);
      }
    });
  }

  // Carregar encomendas do utilizador
  loadUserOrders(): void {
    this.authService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: (error) => {
        console.error('Erro ao carregar encomendas:', error);
        
        let errorMessage = 'Erro ao carregar encomendas.';
        if (error.status === 0) {
          errorMessage = 'Servidor não disponível. Certifique-se que o backend Flask está rodando na porta 5000.';
        } else if (error.status === 401) {
          errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
          this.authService.logout();
          return;
        }
        
        this.showAlert('danger', errorMessage);
      }
    });
  }

  // Mudar seção ativa
  setActiveSection(section: string): void {
    this.activeSection = section;
    this.alertMessage = '';
  }

  // Guardar dados pessoais
  savePersonalData(): void {
    if (!this.personalForm.valid || this.isLoading) {
      this.personalForm.markAllAsTouched();
      this.showAlert('danger', 'Por favor, corrija os erros no formulário.');
      return;
    }

    this.isLoading = true;
    
    const profileData = this.personalForm.value;
    
    this.authService.updateProfile(profileData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.userData = { ...this.userData, ...profileData };
        this.showAlert('success', 'Dados pessoais atualizados com sucesso!');
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erro ao atualizar perfil:', error);
        
        let errorMessage = 'Erro ao atualizar dados. Tente novamente.';
        
        if (error.status === 0) {
          errorMessage = 'Servidor não disponível. Certifique-se que o backend Flask está rodando na porta 5000.';
        } else if (error.status === 409) {
          errorMessage = 'Username ou email já existem.';
        } else if (error.status === 401) {
          errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
          this.authService.logout();
          return;
        } else if (error.status === 400) {
          errorMessage = 'Dados inválidos. Verifique os campos.';
        }
        
        this.showAlert('danger', errorMessage);
      }
    });
  }

  // Mudar password
  changePassword(): void {
    if (!this.passwordForm.valid || this.isLoading) {
      this.passwordForm.markAllAsTouched();
      this.showAlert('danger', 'Por favor, corrija os erros no formulário.');
      return;
    }

    this.isLoading = true;
    
    const passwordData = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.authService.changePassword(passwordData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.passwordForm.reset();
        this.showAlert('success', 'Password alterada com sucesso!');
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erro ao alterar password:', error);
        
        let errorMessage = 'Erro ao alterar password. Tente novamente.';
        
        if (error.status === 0) {
          errorMessage = 'Servidor não disponível. Certifique-se que o backend Flask está rodando na porta 5000.';
        } else if (error.status === 401) {
          if (error.error?.msg === 'Current password is incorrect.') {
            errorMessage = 'Password atual incorreta.';
          } else {
            errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
            this.authService.logout();
            return;
          }
        } else if (error.status === 400) {
          errorMessage = 'Dados inválidos. Verifique os campos.';
        }
        
        this.showAlert('danger', errorMessage);
      }
    });
  }

  // Obter classe CSS para campo
  getFieldClass(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (control?.valid && (control?.dirty || control?.touched)) return 'is-valid';
    if (control?.invalid && (control?.dirty || control?.touched)) return 'is-invalid';
    return '';
  }

  // Verificar se campo tem erro específico
  hasError(form: FormGroup, field: string, error: string): boolean {
    const control = form.get(field);
    return control?.hasError(error) && (control?.dirty || control?.touched) || false;
  }

  // Obter mensagem de erro
  getErrorMessage(form: FormGroup, field: string): string {
    const control = form.get(field);
    
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(field)} é obrigatório`;
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `${this.getFieldLabel(field)} deve ter pelo menos ${requiredLength} caracteres`;
    }
    if (control?.hasError('email')) {
      return 'Email inválido';
    }
    if (control?.hasError('passwordMismatch') || form.hasError('passwordMismatch')) {
      return 'As passwords não coincidem';
    }
    
    return '';
  }

  // Obter label do campo
  getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nome',
      username: 'Username',
      email: 'Email',
      phone: 'Telefone',
      currentPassword: 'Password atual',
      newPassword: 'Nova password',
      confirmPassword: 'Confirmar password'
    };
    return labels[field] || field;
  }

  // Mostrar alerta
  showAlert(type: 'success' | 'danger' | 'warning', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }

  // Obter status badge class
  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'entregue': return 'badge bg-success';
      case 'em trânsito': return 'badge bg-primary';
      case 'processando': return 'badge bg-warning';
      case 'cancelado': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  // Formatar data
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT');
  }

  // Ver detalhes da encomenda
  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.showOrderModal = true;
  }

  // Fechar modal de detalhes
  closeOrderModal(): void {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  // Obter status traduzido
  getTranslatedStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'processando': 'Processando',
      'em trânsito': 'Em Trânsito',
      'entregue': 'Entregue',
      'cancelado': 'Cancelado'
    };
    return statusMap[status.toLowerCase()] || status;
  }

  // Calcular total de items na encomenda
  getTotalItemsInOrder(order: Order): number {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  }

  // Obter nome completo do destinatário
  getFullName(order: Order): string {
    if (order.shipping_info) {
      return `${order.shipping_info.first_name} ${order.shipping_info.last_name}`;
    }
    return 'N/A';
  }

  // Obter endereço completo
  getFullAddress(order: Order): string {
    if (order.shipping_info) {
      const info = order.shipping_info;
      return `${info.address}, ${info.city} ${info.postal_code}, ${info.country}`;
    }
    return 'N/A';
  }

  // Logout
  logout(): void {
    this.authService.logout();
  }
}