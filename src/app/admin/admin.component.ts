import { Component, OnInit } from '@angular/core';
import { AdminService, AdminStats, AdminUser, AdminArticle, AdminOrder } from '../services/admin.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  // Seções ativas
  activeSection = 'dashboard'; // dashboard, users, articles, orders

  // Estados
  isLoading = false;
  alertMessage = '';
  alertType = '';

  // Dashboard data
  stats: AdminStats | null = null;

  // Users data
  users: AdminUser[] = [];
  selectedUser: AdminUser | null = null;
  showUserModal = false;

  // Articles data
  articles: AdminArticle[] = [];
  selectedArticle: AdminArticle | null = null;
  showArticleModal = false;
  isEditingArticle = false;

  // Orders data
  orders: AdminOrder[] = [];
  selectedOrder: AdminOrder | null = null;
  showOrderModal = false;

  // Modal states
  showDeleteConfirm = false;
  deleteTarget: { type: string; id: number; name: string } | null = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  // === NAVIGATION ===
  setActiveSection(section: string): void {
    this.activeSection = section;
    this.alertMessage = '';
    
    switch (section) {
      case 'dashboard':
        this.loadDashboardData();
        break;
      case 'users':
        this.loadUsers();
        break;
      case 'articles':
        this.loadArticles();
        break;
      case 'orders':
        this.loadOrders();
        break;
    }
  }

  // === DASHBOARD ===
  loadDashboardData(): void {
    this.isLoading = true;
    
    this.adminService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoading = false;
        console.log('✅ Dashboard stats carregadas:', stats);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Erro ao carregar stats:', error);
        this.showAlert('danger', error.message || 'Erro ao carregar estatísticas');
      }
    });
  }

  // === USER MANAGEMENT ===
  loadUsers(): void {
    this.isLoading = true;
    
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
        console.log('✅ Utilizadores carregados:', users);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Erro ao carregar utilizadores:', error);
        this.showAlert('danger', error.message || 'Erro ao carregar utilizadores');
      }
    });
  }

  editUser(user: AdminUser): void {
    this.selectedUser = { ...user };
    this.showUserModal = true;
  }

  saveUser(): void {
    if (!this.selectedUser) return;

    this.isLoading = true;
    
    this.adminService.updateUser(this.selectedUser.id, this.selectedUser).subscribe({
      next: () => {
        this.showAlert('success', 'Utilizador atualizado com sucesso!');
        this.closeUserModal();
        this.loadUsers();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Erro ao atualizar utilizador:', error);
        this.showAlert('danger', error.message || 'Erro ao atualizar utilizador');
      }
    });
  }

  confirmDeleteUser(user: AdminUser): void {
    this.deleteTarget = {
      type: 'user',
      id: user.id,
      name: user.name
    };
    this.showDeleteConfirm = true;
  }

  // === ARTICLE MANAGEMENT ===
  loadArticles(): void {
    this.isLoading = true;
    
    this.adminService.getAllArticles().subscribe({
      next: (articles) => {
        this.articles = articles;
        this.isLoading = false;
        console.log('✅ Artigos carregados:', articles);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Erro ao carregar artigos:', error);
        this.showAlert('danger', error.message || 'Erro ao carregar artigos');
      }
    });
  }

  createArticle(): void {
    this.selectedArticle = {
      id: 0,
      name: '',
      content: '',
      image_url: '',
      price: 0.0,
      total_sold: 0
    };
    this.isEditingArticle = false;
    this.showArticleModal = true;
  }

  editArticle(article: AdminArticle): void {
    this.selectedArticle = { ...article };
    this.isEditingArticle = true;
    this.showArticleModal = true;
  }

  saveArticle(): void {
    if (!this.selectedArticle) return;

    this.isLoading = true;
    
    const request = this.isEditingArticle 
      ? this.adminService.updateArticle(this.selectedArticle.id, this.selectedArticle)
      : this.adminService.createArticle(this.selectedArticle);

    request.subscribe({
      next: () => {
        const action = this.isEditingArticle ? 'atualizado' : 'criado';
        this.showAlert('success', `Artigo ${action} com sucesso!`);
        this.closeArticleModal();
        this.loadArticles();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Erro ao salvar artigo:', error);
        this.showAlert('danger', error.message || 'Erro ao salvar artigo');
      }
    });
  }

  confirmDeleteArticle(article: AdminArticle): void {
    this.deleteTarget = {
      type: 'article',
      id: article.id,
      name: article.name
    };
    this.showDeleteConfirm = true;
  }

  // === ORDER MANAGEMENT ===
  loadOrders(): void {
    this.isLoading = true;
    
    this.adminService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
        console.log('✅ Encomendas carregadas:', orders);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Erro ao carregar encomendas:', error);
        this.showAlert('danger', error.message || 'Erro ao carregar encomendas');
      }
    });
  }

  viewOrder(order: AdminOrder): void {
    this.selectedOrder = order;
    this.showOrderModal = true;
  }

  onOrderStatusChange(order: AdminOrder, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;
    this.updateOrderStatus(order, newStatus);
  }

  updateOrderStatus(order: AdminOrder, newStatus: string): void {
    this.isLoading = true;
    
    this.adminService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        this.showAlert('success', 'Status da encomenda atualizado!');
        this.loadOrders();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Erro ao atualizar status:', error);
        this.showAlert('danger', error.message || 'Erro ao atualizar status');
      }
    });
  }

  // === MODAL MANAGEMENT ===
  closeUserModal(): void {
    this.showUserModal = false;
    this.selectedUser = null;
  }

  closeArticleModal(): void {
    this.showArticleModal = false;
    this.selectedArticle = null;
    this.isEditingArticle = false;
  }

  closeOrderModal(): void {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  // === DELETE CONFIRMATION ===
  executeDelete(): void {
    if (!this.deleteTarget) return;

    this.isLoading = true;
    
    let deleteObservable;
    
    if (this.deleteTarget.type === 'user') {
      deleteObservable = this.adminService.deleteUser(this.deleteTarget.id);
    } else if (this.deleteTarget.type === 'article') {
      deleteObservable = this.adminService.deleteArticle(this.deleteTarget.id);
    }

    if (deleteObservable) {
      deleteObservable.subscribe({
        next: () => {
          this.showAlert('success', `${this.deleteTarget!.type === 'user' ? 'Utilizador' : 'Artigo'} eliminado com sucesso!`);
          this.closeDeleteConfirm();
          
          // Reload appropriate data
          if (this.deleteTarget!.type === 'user') {
            this.loadUsers();
          } else if (this.deleteTarget!.type === 'article') {
            this.loadArticles();
          }
          
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Erro ao eliminar:', error);
          this.showAlert('danger', error.message || 'Erro ao eliminar');
        }
      });
    }
  }

  // === UTILITY METHODS ===
  showAlert(type: 'success' | 'danger' | 'warning', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'entregue': return 'badge bg-success';
      case 'em trânsito': return 'badge bg-primary';
      case 'processando': return 'badge bg-warning';
      case 'cancelado': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  logout(): void {
    this.authService.logout();
  }

  // Helper method para order status entries
  getOrderStatusEntries(): Array<{key: string, value: number}> {
    if (!this.stats?.order_status_counts) {
      return [];
    }
    
    return Object.entries(this.stats.order_status_counts).map(([key, value]) => ({
      key,
      value
    }));
  }
}