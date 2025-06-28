import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Observable, throwError, from, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrls = [
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:5001',
    'http://127.0.0.1:5001'
  ];
  private currentBaseUrl = this.baseUrls[0];
  private platformId = inject(PLATFORM_ID);
  redirectUrl: string | null = null;

  // BehaviorSubject para notificar mudanças na autenticação
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  public authStatus$ = this.authStatusSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Only detect URL in browser environment
    if (typeof window !== 'undefined') {
      this.detectWorkingUrl();
      // Initialize auth status
      this.authStatusSubject.next(this.isLoggedIn());
    }
  }

  // Detecta automaticamente qual URL está funcionando
  private async detectWorkingUrl() {
    for (const url of this.baseUrls) {
      try {
        const response = await fetch(`${url}/`, { 
          method: 'GET',
          mode: 'cors',
          signal: AbortSignal.timeout(2000) // 2 segundo timeout
        });
        if (response.ok) {
          this.currentBaseUrl = url;
          // Flask API detectado
          return;
        }
      } catch (error) {
        console.log(`❌ Flask API não encontrado em: ${url}`);
      }
    }
    console.warn('⚠️ Nenhum Flask API encontrado. Usando URL padrão.');
  }

  // Método para testar conectividade
  testConnection(): Observable<any> {
    return this.http.get(`${this.currentBaseUrl}/`);
  }

  // Método com retry automático em caso de falha
  private makeRequest<T>(request: Observable<T>): Observable<T> {
    return request.pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('🚨 Erro na requisição HTTP:', error);
        console.error('📊 Status:', error.status);
        console.error('🌐 URL:', error.url);
        console.error('📋 Detalhes:', error.error);
        
        // Se erro de conexão, tenta próxima URL
        if (error.status === 0) {
          const currentIndex = this.baseUrls.indexOf(this.currentBaseUrl);
          const nextIndex = (currentIndex + 1) % this.baseUrls.length;
          
          if (nextIndex !== currentIndex) {
            this.currentBaseUrl = this.baseUrls[nextIndex];
            console.log(`🔄 Tentando URL alternativa: ${this.currentBaseUrl}`);
            return request;
          }
        }
        return throwError(() => error);
      })
    );
  }

  register(name: string, email: string, username: string, phone: string, password: string): Observable<any> {
    const request = this.http.post(`${this.currentBaseUrl}/api/register`, { 
      name, email, username, phone, password 
    });
    return this.makeRequest(request);
  }

  login(username: string, password: string): Observable<{ access_token: string; user: any }> {
    const request = this.http.post<{ access_token: string; user: any }>(`${this.currentBaseUrl}/api/login`, { 
      username, password 
    }).pipe(
      tap(response => {
        // Notify auth status change
        this.authStatusSubject.next(true);
      })
    );
    return this.makeRequest(request);
  }

  saveToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', token);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const hasToken = !!token;
    
    console.log('🔍 AuthService.isLoggedIn:', hasToken ? 'SIM' : 'NÃO');
    if (hasToken) {
      console.log('🎫 Token encontrado:', token?.substring(0, 20) + '...');
    }
    
    return hasToken;
  }

  logout() {
    console.log('🚪 AuthService: Iniciando logout...');
    
    if (isPlatformBrowser(this.platformId)) {
      // Limpar todos os dados relacionados à autenticação
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('shopping_cart');
      console.log('🗑️ Dados do localStorage limpos');
    }
    
    // Notify auth status change
    this.authStatusSubject.next(false);
    
    // Limpar URL de redirecionamento
    this.redirectUrl = null;
    
    console.log('🔄 Redirecionando para login...');
    this.router.navigate(['/login']).then(() => {
      console.log('✅ Redirecionamento para login concluído');
    });
  }

  // Profile methods
  getProfile(): Observable<any> {
    console.log('🔍 AuthService: Carregando profile...');
    const request = this.http.get<any>(`${this.currentBaseUrl}/api/profile`);
    return this.makeRequest(request);
  }

  updateProfile(profileData: any): Observable<any> {
    const request = this.http.put<any>(`${this.currentBaseUrl}/api/profile`, profileData);
    return this.makeRequest(request);
  }

  changePassword(passwordData: any): Observable<any> {
    const request = this.http.put<any>(`${this.currentBaseUrl}/api/profile/password`, passwordData);
    return this.makeRequest(request);
  }

  // Order methods (deprecated - use OrderService instead)
  createOrder(orderData: any): Observable<any> {
    console.warn('⚠️ AuthService.createOrder is deprecated. Use OrderService.createOrder instead.');
    const request = this.http.post<any>(`${this.currentBaseUrl}/api/orders`, orderData);
    return this.makeRequest(request);
  }

  getUserOrders(): Observable<any[]> {
    console.warn('⚠️ AuthService.getUserOrders is deprecated. Use OrderService.getUserOrders instead.');
    const request = this.http.get<any[]>(`${this.currentBaseUrl}/api/orders`);
    return this.makeRequest(request);
  }

  // Método para obter a URL atual sendo usada
  getCurrentUrl(): string {
    return this.currentBaseUrl;
  }
}