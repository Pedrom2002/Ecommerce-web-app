import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retryWhen, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface ApiError {
  message: string;
  status: number;
  error?: any;
  isRetryable?: boolean;
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const apiError: ApiError = {
          message: this.getErrorMessage(error),
          status: error.status,
          error: error.error,
          isRetryable: this.isRetryableError(error)
        };

        // Handle specific error cases
        this.handleSpecificErrors(error);

        // Enhanced logging
        console.group('🚨 API Error Details');
        console.error('Status:', error.status);
        console.error('URL:', error.url);
        console.error('Message:', apiError.message);
        console.error('Full Error:', error);
        console.groupEnd();

        // Show user-friendly notification
        this.showErrorNotification(apiError);

        return throwError(() => apiError);
      })
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    // Handle different types of errors
    if (error.error instanceof ErrorEvent) {
      return `Erro de rede: ${error.error.message}`;
    }

    // Check for connection errors
    if (error.status === 0) {
      return '🔌 Não foi possível conectar ao servidor Flask. Verifique se está rodando em:\n• http://localhost:5000\n• http://127.0.0.1:5000\n• Ou inicie com: python app.py';
    }

    // Check for specific Flask patterns
    if (error.url?.includes('localhost:5000') || error.url?.includes('127.0.0.1:5000')) {
      if (error.status === 0) {
        return '🐍 Flask API não está rodando. Execute: python app.py';
      }
    }

    // Server-side error responses
    switch (error.status) {
      case 400:
        return this.extractErrorMessage(error, 'Dados inválidos enviados para o servidor');
      case 401:
        return 'Credenciais inválidas ou sessão expirada';
      case 403:
        return 'Acesso negado. Não tem permissões suficientes';
      case 404:
        return error.url?.includes('/api/') 
          ? 'Endpoint da API não encontrado' 
          : 'Recurso não encontrado';
      case 409:
        return this.extractErrorMessage(error, 'Conflito de dados (ex: email já existe)');
      case 422:
        return 'Dados não processáveis. Verifique os campos enviados';
      case 429:
        return 'Muitas tentativas. Tente novamente mais tarde';
      case 500:
        return 'Erro interno do servidor Flask. Verifique os logs do servidor';
      case 502:
        return 'Servidor Flask temporariamente indisponível';
      case 503:
        return 'Serviço Flask temporariamente indisponível';
      default:
        return this.extractErrorMessage(error, `Erro inesperado: ${error.status}`);
    }
  }

  private extractErrorMessage(error: HttpErrorResponse, fallback: string): string {
    return error.error?.error || 
           error.error?.msg || 
           error.error?.message || 
           fallback;
  }

  private isRetryableError(error: HttpErrorResponse): boolean {
    // Only connection errors are retryable
    return error.status === 0 || error.status >= 500;
  }

  private handleSpecificErrors(error: HttpErrorResponse): void {
    switch (error.status) {
      case 0:
        // Connection error - don't redirect, just log
        console.warn('🔌 Erro de conexão - Flask API provavelmente não está rodando');
        break;
      case 401:
        // Token expired or invalid
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('access_token');
        }
        this.router.navigate(['/login']);
        break;
      case 403:
        console.warn('🚫 Acesso negado');
        break;
      case 404:
        console.warn('🔍 Recurso não encontrado:', error.url);
        break;
      case 500:
        console.error('💥 Erro interno do servidor Flask');
        break;
    }
  }

  private showErrorNotification(apiError: ApiError): void {
    // Simple console notification for now
    // In a real app, you might use a toast notification service
    if (apiError.status === 0) {
      console.log('%c💡 DICA: Para corrigir, execute no terminal:', 'color: #2196F3; font-weight: bold;');
      console.log('%ccd C:\\Users\\P02\\Downloads\\pw-2-pl\\pw-2-pl', 'color: #4CAF50;');
      console.log('%cpython app.py', 'color: #4CAF50;');
    }
  }
}