import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface ApiError {
  message: string;
  status: number;
  error?: any;
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
          error: error.error
        };

        // Handle specific error cases
        this.handleSpecificErrors(error);

        // Log error for debugging
        console.error('API Error:', apiError);

        return throwError(() => apiError);
      })
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    // Handle different types of errors
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      return `Erro de rede: ${error.error.message}`;
    }

    // Server-side error
    switch (error.status) {
      case 400:
        return error.error?.msg || 'Dados inválidos enviados para o servidor';
      case 401:
        return 'Credenciais inválidas ou sessão expirada';
      case 403:
        return 'Acesso negado. Não tem permissões suficientes';
      case 404:
        return 'Recurso não encontrado';
      case 409:
        return error.error?.msg || 'Conflito de dados (ex: email já existe)';
      case 422:
        return 'Dados não processáveis. Verifique os campos enviados';
      case 429:
        return 'Muitas tentativas. Tente novamente mais tarde';
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde';
      case 502:
        return 'Servidor temporariamente indisponível';
      case 503:
        return 'Serviço temporariamente indisponível';
      default:
        return error.error?.msg || `Erro inesperado: ${error.status}`;
    }
  }

  private handleSpecificErrors(error: HttpErrorResponse): void {
    switch (error.status) {
      case 401:
        // Token expired or invalid - redirect to login
        localStorage.removeItem('access_token');
        this.router.navigate(['/login']);
        break;
      case 403:
        // Forbidden - could redirect to unauthorized page
        console.warn('Access forbidden');
        break;
      case 404:
        // Not found - could redirect to 404 page
        console.warn('Resource not found');
        break;
    }
  }
}