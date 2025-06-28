import { Component } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-order-diagnostic',
  template: `
    <div class="diagnostic-panel" *ngIf="showDiagnostic">
      <div class="diagnostic-header">
        <h4>🔧 Diagnóstico de Orders</h4>
        <button (click)="toggleDiagnostic()" class="btn-close">×</button>
      </div>
      
      <div class="diagnostic-content">
        <div class="test-section">
          <h5>🧪 Testes de Conectividade</h5>
          <button (click)="testAPI()" class="btn-test">Testar API Base</button>
          <button (click)="testAuth()" class="btn-test">Testar Autenticação</button>
          <button (click)="testOrders()" class="btn-test">Testar Orders Endpoint</button>
        </div>
        
        <div class="test-section">
          <h5>📊 URLs de Teste</h5>
          <p><strong>Base URL:</strong> http://localhost:5000/api</p>
          <p><strong>Status:</strong> <span [ngClass]="getStatusClass()">{{ connectionStatus }}</span></p>
        </div>
        
        <div class="results" *ngIf="results.length > 0">
          <h5>📋 Resultados</h5>
          <div *ngFor="let result of results" [ngClass]="'result-' + result.type">
            <strong>{{ result.test }}:</strong> {{ result.message }}
            <small *ngIf="result.details">{{ result.details }}</small>
          </div>
        </div>
        
        <div class="test-section">
          <h5>🛠️ Ações Rápidas</h5>
          <button (click)="clearResults()" class="btn-action">Limpar Resultados</button>
          <button (click)="runAllTests()" class="btn-action">Executar Todos os Testes</button>
        </div>
      </div>
    </div>
    
    <button (click)="toggleDiagnostic()" class="diagnostic-toggle" 
            [title]="showDiagnostic ? 'Fechar Diagnóstico' : 'Abrir Diagnóstico de Orders'">
      🔧
    </button>
  `,
  styles: [`
    .diagnostic-toggle {
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #007bff;
      color: white;
      border: none;
      font-size: 20px;
      cursor: pointer;
      z-index: 9998;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    
    .diagnostic-panel {
      position: fixed;
      bottom: 80px;
      left: 20px;
      width: 400px;
      max-height: 500px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 9999;
      overflow-y: auto;
    }
    
    .diagnostic-header {
      background: #007bff;
      color: white;
      padding: 10px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 8px 8px 0 0;
    }
    
    .diagnostic-header h4 {
      margin: 0;
      font-size: 16px;
    }
    
    .btn-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
    }
    
    .diagnostic-content {
      padding: 15px;
    }
    
    .test-section {
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    
    .test-section h5 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #333;
    }
    
    .btn-test, .btn-action {
      background: #28a745;
      color: white;
      border: none;
      padding: 5px 10px;
      margin: 2px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
    }
    
    .btn-action {
      background: #6c757d;
    }
    
    .results {
      margin-top: 15px;
    }
    
    .result-success {
      color: #28a745;
      padding: 5px;
      background: #d4edda;
      border-radius: 4px;
      margin: 5px 0;
    }
    
    .result-error {
      color: #dc3545;
      padding: 5px;
      background: #f8d7da;
      border-radius: 4px;
      margin: 5px 0;
    }
    
    .result-warning {
      color: #856404;
      padding: 5px;
      background: #fff3cd;
      border-radius: 4px;
      margin: 5px 0;
    }
    
    .status-connected {
      color: #28a745;
      font-weight: bold;
    }
    
    .status-disconnected {
      color: #dc3545;
      font-weight: bold;
    }
    
    .status-unknown {
      color: #6c757d;
      font-weight: bold;
    }
    
    small {
      display: block;
      opacity: 0.8;
    }
    
    p {
      margin: 5px 0;
      font-size: 12px;
    }
  `]
})
export class OrderDiagnosticComponent {
  showDiagnostic = false;
  connectionStatus = 'Desconhecido';
  results: Array<{test: string, type: string, message: string, details?: string}> = [];

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  toggleDiagnostic() {
    this.showDiagnostic = !this.showDiagnostic;
  }

  getStatusClass(): string {
    switch (this.connectionStatus) {
      case 'Conectado': return 'status-connected';
      case 'Desconectado': return 'status-disconnected';
      default: return 'status-unknown';
    }
  }

  addResult(test: string, type: 'success' | 'error' | 'warning', message: string, details?: string) {
    this.results.unshift({ test, type, message, details });
    if (this.results.length > 10) {
      this.results = this.results.slice(0, 10);
    }
  }

  testAPI() {
    this.connectionStatus = 'Testando...';
    
    fetch('http://localhost:5000/')
      .then(response => {
        if (response.ok) {
          this.connectionStatus = 'Conectado';
          this.addResult('API Base', 'success', 'Conectado com sucesso', 'Flask API rodando');
        } else {
          this.connectionStatus = 'Desconectado';
          this.addResult('API Base', 'error', 'Resposta inválida', `Status: ${response.status}`);
        }
      })
      .catch(error => {
        this.connectionStatus = 'Desconectado';
        this.addResult('API Base', 'error', 'Falha na conexão', 'Flask API não está rodando');
      });
  }

  testAuth() {
    if (!this.authService.isLoggedIn()) {
      this.addResult('Autenticação', 'warning', 'Usuário não está logado');
      return;
    }

    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.addResult('Autenticação', 'success', 'Profile carregado', `User: ${profile.username}`);
      },
      error: (error) => {
        this.addResult('Autenticação', 'error', 'Erro ao carregar profile', `Status: ${error.status}`);
      }
    });
  }

  testOrders() {
    if (!this.authService.isLoggedIn()) {
      this.addResult('Orders', 'warning', 'Precisa estar logado para testar orders');
      return;
    }

    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.addResult('Orders', 'success', `${orders.length} orders encontradas`, 'Endpoint funcionando');
      },
      error: (error) => {
        this.addResult('Orders', 'error', 'Endpoint de orders com problema', `Erro: ${error.message || 'Desconhecido'}`);
      }
    });
  }

  clearResults() {
    this.results = [];
  }

  runAllTests() {
    this.clearResults();
    this.testAPI();
    setTimeout(() => this.testAuth(), 500);
    setTimeout(() => this.testOrders(), 1000);
  }
}