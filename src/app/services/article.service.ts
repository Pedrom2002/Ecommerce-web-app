import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface Article {
  id: number;
  name: string;
  content: string;
  image_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private baseUrls = [
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:5001',
    'http://127.0.0.1:5001'
  ];
  private currentBaseUrl = this.baseUrls[0];

  constructor(private http: HttpClient) {
    // Only detect URL in browser environment
    if (typeof window !== 'undefined') {
      this.detectWorkingUrl();
    }
  }

  // Detecta automaticamente qual URL está funcionando
  private async detectWorkingUrl() {
    for (const url of this.baseUrls) {
      try {
        const response = await fetch(`${url}/`, { 
          method: 'GET',
          mode: 'cors',
          signal: AbortSignal.timeout(2000)
        });
        if (response.ok) {
          this.currentBaseUrl = url;
          console.log(`✅ Article Service usando: ${url}`);
          return;
        }
      } catch (error) {
        // Continue tentando outras URLs
      }
    }
  }

  // Método com retry automático
  private makeRequest<T>(request: Observable<T>): Observable<T> {
    return request.pipe(
      retry(2), // Tenta 2 vezes
      catchError((error: HttpErrorResponse) => {
        console.error('Erro no ArticleService:', error);
        return throwError(() => error);
      })
    );
  }

  getArticles(): Observable<Article[]> {
    const request = this.http.get<Article[]>(`${this.currentBaseUrl}/articles`);
    return this.makeRequest(request);
  }

  addArticle(article: { name: string; content: string; image_url?: string }): Observable<any> {
    const request = this.http.post(`${this.currentBaseUrl}/articles`, article);
    return this.makeRequest(request);
  }

  searchArticles(name: string): Observable<Article[]> {
    const params = new HttpParams().set('name', name);
    const request = this.http.get<Article[]>(`${this.currentBaseUrl}/articles/search`, { params });
    return this.makeRequest(request);
  }

  // Método para obter a URL atual sendo usada
  getCurrentUrl(): string {
    return this.currentBaseUrl;
  }
}
