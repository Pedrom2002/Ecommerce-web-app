import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    // Verificar se está logado
    if (!this.authService.isLoggedIn()) {
      console.log('🚫 AdminGuard: Utilizador não está logado');
      this.router.navigate(['/login']);
      return of(false);
    }

    // Verificar role do utilizador através do perfil
    return this.authService.getProfile().pipe(
      map(profile => {
        if (profile.role === 'admin') {
          console.log('✅ AdminGuard: Acesso de admin autorizado');
          return true;
        } else {
          console.log('🚫 AdminGuard: Utilizador não é admin');
          this.router.navigate(['/']);
          return false;
        }
      }),
      catchError(error => {
        console.error('❌ AdminGuard: Erro ao verificar perfil:', error);
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}