import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5000';
  private platformId = inject(PLATFORM_ID);
  redirectUrl: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  register(name: string, email: string, username: string, phone: string, password: string) {
    return this.http.post(`${this.baseUrl}/register`, { name, email, username, phone, password });
  }

  login(username: string, password: string) {
    return this.http.post<{ access_token: string }>(`${this.baseUrl}/login`, { username, password });
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
    return !!this.getToken();
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
    }
    this.router.navigate(['/login']);
  }

  // Profile methods
  getProfile() {
    return this.http.get<any>(`${this.baseUrl}/profile`);
  }

  updateProfile(profileData: any) {
    return this.http.put<any>(`${this.baseUrl}/profile`, profileData);
  }

  changePassword(passwordData: any) {
    return this.http.put<any>(`${this.baseUrl}/profile/password`, passwordData);
  }

  // Order methods
  createOrder(orderData: any) {
    return this.http.post<any>(`${this.baseUrl}/orders`, orderData);
  }

  getUserOrders() {
    return this.http.get<any[]>(`${this.baseUrl}/orders`);
  }
}
