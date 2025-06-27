import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Article {
  id: number;
  name: string;
  content: string;
  image_url?: string;  // adiciona a imagem aqui, opcional
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private readonly baseUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.baseUrl}/articles`);
  }

  addArticle(article: { name: string; content: string; image_url?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/articles`, article);
  }

  searchArticles(name: string): Observable<Article[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Article[]>(`${this.baseUrl}/articles/search`, { params });
  }
}
