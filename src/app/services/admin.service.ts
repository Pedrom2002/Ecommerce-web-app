import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_articles: number;
  total_orders: number;
  total_revenue: number;
  order_status_counts: { [key: string]: number };
}

export interface AdminUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  total_orders: number;
}

export interface AdminArticle {
  id: number;
  name: string;
  content: string;
  image_url: string;
  price: number;
  total_sold: number;
}

export interface AdminOrder {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  order_date: string;
  status: string;
  total: number;
  items_count: number;
  items: Array<{
    id: number;
    article_name: string;
    quantity: number;
    price: number;
  }>;
  shipping_info: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  message?: string;
  stats?: T;
  users?: T;
  articles?: T;
  orders?: T;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:5000/api/admin';

  constructor(private http: HttpClient) {}

  // Dashboard Stats
  getStats(): Observable<AdminStats> {
    return this.http.get<ApiResponse<AdminStats>>(`${this.baseUrl}/stats`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch stats');
        }
        return response.stats!;
      }),
      catchError(this.handleError)
    );
  }

  // User Management
  getAllUsers(): Observable<AdminUser[]> {
    return this.http.get<ApiResponse<AdminUser[]>>(`${this.baseUrl}/users`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch users');
        }
        return response.users!;
      }),
      catchError(this.handleError)
    );
  }

  updateUser(userId: number, userData: Partial<AdminUser>): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/users/${userId}`, userData).pipe(
      tap(response => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to update user');
        }
      }),
      catchError(this.handleError)
    );
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/users/${userId}`).pipe(
      tap(response => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to delete user');
        }
      }),
      catchError(this.handleError)
    );
  }

  // Article Management
  getAllArticles(): Observable<AdminArticle[]> {
    return this.http.get<ApiResponse<AdminArticle[]>>(`${this.baseUrl}/articles`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch articles');
        }
        return response.articles!;
      }),
      catchError(this.handleError)
    );
  }

  createArticle(articleData: Partial<AdminArticle>): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/articles`, articleData).pipe(
      tap(response => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to create article');
        }
      }),
      catchError(this.handleError)
    );
  }

  updateArticle(articleId: number, articleData: Partial<AdminArticle>): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/articles/${articleId}`, articleData).pipe(
      tap(response => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to update article');
        }
      }),
      catchError(this.handleError)
    );
  }

  deleteArticle(articleId: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/articles/${articleId}`).pipe(
      tap(response => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to delete article');
        }
      }),
      catchError(this.handleError)
    );
  }

  // Order Management
  getAllOrders(): Observable<AdminOrder[]> {
    return this.http.get<ApiResponse<AdminOrder[]>>(`${this.baseUrl}/orders`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch orders');
        }
        return response.orders!;
      }),
      catchError(this.handleError)
    );
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/orders/${orderId}/status`, { status }).pipe(
      tap(response => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to update order status');
        }
      }),
      catchError(this.handleError)
    );
  }

  // Helper method for error handling
  private handleError(error: any): Observable<never> {
    console.error('AdminService Error:', error);
    
    let errorMessage = 'Erro desconhecido';
    
    if (error.status === 0) {
      errorMessage = 'Servidor não disponível. Verifique se o Flask está em execução.';
    } else if (error.status === 403) {
      errorMessage = 'Acesso negado. Apenas administradores podem aceder.';
    } else if (error.status === 401) {
      errorMessage = 'Não autorizado. Faça login novamente.';
    } else if (error.status === 404) {
      errorMessage = 'Recurso não encontrado.';
    } else if (error.status === 400) {
      errorMessage = error.error?.error || 'Dados inválidos.';
    } else if (error.status >= 500) {
      errorMessage = 'Erro interno do servidor.';
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    }
    
    return throwError(() => ({ 
      message: errorMessage, 
      status: error.status,
      originalError: error 
    }));
  }
}