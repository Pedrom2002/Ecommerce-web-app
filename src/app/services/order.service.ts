import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { 
  Order, 
  CreateOrderRequest, 
  CreateOrderResponse, 
  OrdersResponse 
} from '../models/order.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = 'http://localhost:5000/api';
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  createOrder(orderData: CreateOrderRequest): Observable<CreateOrderResponse> {
    if (!isPlatformBrowser(this.platformId)) {
      return of({ success: false, message: 'Orders only available in browser' });
    }

    this.loadingSubject.next(true);
    
    return this.http.post<CreateOrderResponse>(`${this.baseUrl}/orders`, orderData).pipe(
      tap(() => this.loadingSubject.next(false)),
      catchError(error => {
        this.loadingSubject.next(false);
        console.error('Error creating order:', error);
        
        let errorMessage = 'Erro ao criar pedido';
        
        if (error.status === 0) {
          errorMessage = 'Servidor não disponível. Verifique se o Flask está rodando.';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Dados do pedido inválidos';
        } else if (error.status === 401) {
          errorMessage = 'Não autorizado. Faça login novamente.';
        } else if (error.status === 500) {
          errorMessage = 'Erro interno do servidor';
        }
        
        return of({
          success: false,
          message: errorMessage
        });
      })
    );
  }

  getUserOrders(): Observable<Order[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }

    this.loadingSubject.next(true);
    
    return this.http.get<OrdersResponse>(`${this.baseUrl}/orders`).pipe(
      map(response => {
        if (response.success) {
          return response.orders || [];
        }
        return [];
      }),
      tap(orders => {
        this.ordersSubject.next(orders);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        console.error('Error fetching orders:', error);
        
        if (error.status === 0) {
          console.log('Servidor Flask não está disponível');
        }
        
        return of([]);
      })
    );
  }

  getOrderById(orderId: number): Observable<Order | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }

    return this.http.get<{ success: boolean, order?: Order }>(`${this.baseUrl}/orders/${orderId}`).pipe(
      map(response => response.success ? response.order || null : null),
      catchError(error => {
        console.error('Error fetching order:', error);
        return of(null);
      })
    );
  }

  refreshOrders(): void {
    this.getUserOrders().subscribe();
  }

  clearOrders(): void {
    this.ordersSubject.next([]);
  }

  isLoading(): Observable<boolean> {
    return this.loading$;
  }

  getOrders(): Observable<Order[]> {
    return this.orders$;
  }

  validateOrderData(orderData: CreateOrderRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!orderData.shipping_info) {
      errors.push('Informações de envio são obrigatórias');
      return { valid: false, errors };
    }

    const { shipping_info, items, totals } = orderData;

    if (!shipping_info.first_name?.trim()) errors.push('Nome é obrigatório');
    if (!shipping_info.last_name?.trim()) errors.push('Sobrenome é obrigatório');
    if (!shipping_info.email?.trim()) errors.push('Email é obrigatório');
    if (!shipping_info.phone?.trim()) errors.push('Telefone é obrigatório');
    if (!shipping_info.address?.trim()) errors.push('Endereço é obrigatório');
    if (!shipping_info.city?.trim()) errors.push('Cidade é obrigatória');
    if (!shipping_info.postal_code?.trim()) errors.push('Código postal é obrigatório');
    if (!shipping_info.country?.trim()) errors.push('País é obrigatório');

    if (!items || items.length === 0) {
      errors.push('Pelo menos um item é obrigatório');
    } else {
      items.forEach((item, index) => {
        if (!item.name?.trim()) errors.push(`Item ${index + 1}: Nome é obrigatório`);
        if (!item.price || item.price <= 0) errors.push(`Item ${index + 1}: Preço deve ser maior que zero`);
        if (!item.quantity || item.quantity <= 0) errors.push(`Item ${index + 1}: Quantidade deve ser maior que zero`);
      });
    }

    if (!totals) {
      errors.push('Totais são obrigatórios');
    } else {
      if (totals.subtotal <= 0) errors.push('Subtotal deve ser maior que zero');
      if (totals.total <= 0) errors.push('Total deve ser maior que zero');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (shipping_info.email && !emailRegex.test(shipping_info.email)) {
      errors.push('Email tem formato inválido');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}