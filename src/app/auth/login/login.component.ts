// login.component.ts
import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  
  // Estados da UI
  showPassword = false;
  isLoading = false;
  alertMessage = '';
  alertType = '';
  loginAttempts = 0;
  isBlocked = false;
  blockTimeRemaining = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  // Verificar se o utilizador está bloqueado
  checkIfBlocked(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Não executar no servidor
    }
    
    const blockData = localStorage.getItem('loginBlock');
    if (blockData) {
      const { blockTime, attempts } = JSON.parse(blockData);
      const now = new Date().getTime();
      const timeDiff = now - blockTime;
      
      if (timeDiff < 300000) { // 5 minutos
        this.isBlocked = true;
        this.blockTimeRemaining = Math.ceil((300000 - timeDiff) / 1000);
        this.startBlockCountdown();
      } else {
        localStorage.removeItem('loginBlock');
        this.loginAttempts = 0;
      }
    }
  }

  // Countdown do bloqueio
  startBlockCountdown(): void {
    const interval = setInterval(() => {
      this.blockTimeRemaining--;
      if (this.blockTimeRemaining <= 0) {
        this.isBlocked = false;
        this.loginAttempts = 0;
        localStorage.removeItem('loginBlock');
        clearInterval(interval);
      }
    }, 1000);
  }

  // Getters para acessar campos do formulário
  get username() { return this.loginForm.get('username')!; }
  get password() { return this.loginForm.get('password')!; }
  get rememberMe() { return this.loginForm.get('rememberMe')!; }

  // Verificar se campo tem erro específico
  hasError(field: string, error: string): boolean {
    const control = this.loginForm.get(field);
    return control?.hasError(error) && (control?.dirty || control?.touched) || false;
  }

  // Obter mensagem de erro para o campo
  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.hasError('required')) {
      return `${field === 'username' ? 'Username' : 'Password'} é obrigatório`;
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `${field === 'username' ? 'Username' : 'Password'} deve ter pelo menos ${requiredLength} caracteres`;
    }
    return '';
  }

  // Toggle visibilidade da password
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Verificar se o formulário é válido
  isFormValid(): boolean {
    return this.loginForm.valid && !this.isBlocked;
  }

  // Mostrar alerta
  showAlert(type: 'success' | 'danger' | 'warning', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }

  // Incrementar tentativas de login
  incrementLoginAttempts(): void {
    this.loginAttempts++;
    
    if (this.loginAttempts >= 3) {
      this.isBlocked = true;
      this.blockTimeRemaining = 300; // 5 minutos
      
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('loginBlock', JSON.stringify({
          blockTime: new Date().getTime(),
          attempts: this.loginAttempts
        }));
      }
      
      this.startBlockCountdown();
      this.showAlert('danger', 'Muitas tentativas falhadas. Conta bloqueada por 5 minutos.');
    } else {
      const remaining = 3 - this.loginAttempts;
      this.showAlert('warning', `Credenciais inválidas. ${remaining} tentativa${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}.`);
    }
  }

  // Resetar tentativas após sucesso
  resetLoginAttempts(): void {
    this.loginAttempts = 0;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('loginBlock');
    }
  }

  // Submeter formulário
  onSubmit(): void {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      this.showAlert('danger', 'Por favor, corrija os erros no formulário.');
      return;
    }

    if (this.isBlocked) {
      this.showAlert('danger', `Conta bloqueada. Tente novamente em ${Math.ceil(this.blockTimeRemaining / 60)} minutos.`);
      return;
    }

    this.isLoading = true;
    this.alertMessage = '';

    const formValue = this.loginForm.value;
    this.authService.login(formValue.username.trim(), formValue.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        
        if (res.access_token) {
          this.authService.saveToken(res.access_token);
          this.resetLoginAttempts();
          this.showAlert('success', 'Login realizado com sucesso!');
          
          // Guardar "Remember Me" se selecionado
          if (formValue.rememberMe && isPlatformBrowser(this.platformId)) {
            localStorage.setItem('rememberUser', formValue.username);
          } else if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('rememberUser');
          }
          
          // Redirecionar após breve delay
          setTimeout(() => {
            const redirectUrl = this.authService.redirectUrl || '/';
            this.authService.redirectUrl = null;
            this.router.navigate([redirectUrl]);
          }, 1500);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erro no login:', error);
        
        let errorMessage = 'Erro no login. Tente novamente.';
        
        if (error.status === 0) {
          errorMessage = 'Servidor não disponível. Certifique-se que o backend Flask está rodando na porta 5000.';
        } else if (error.status === 401) {
          errorMessage = 'Username ou password incorretos.';
          this.incrementLoginAttempts();
        } else if (error.status === 500) {
          errorMessage = 'Erro interno do servidor. Verifique se a base de dados está configurada.';
        }
        
        this.showAlert('danger', errorMessage);
        
        // Limpar senha por segurança
        this.loginForm.patchValue({ password: '' });
      }
    });
  }

  // Carregar dados salvos (Remember Me) e verificar bloqueio
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Verificar se está bloqueado
      this.checkIfBlocked();
      
      // Carregar dados do Remember Me
      const rememberedUser = localStorage.getItem('rememberUser');
      if (rememberedUser) {
        this.loginForm.patchValue({
          username: rememberedUser,
          rememberMe: true
        });
      }
    }
  }

  // Ir para página de registo
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  // Simular "Forgot Password"
  forgotPassword(): void {
    const usernameValue = this.loginForm.get('username')?.value;
    if (!usernameValue) {
      this.showAlert('warning', 'Introduza o seu username primeiro.');
      return;
    }
    
    this.showAlert('success', 'Email de recuperação enviado (simulação).');
  }

  // Getters para classes CSS
  getFieldClass(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.valid && (field?.dirty || field?.touched)) return 'is-valid';
    if (field?.invalid && (field?.dirty || field?.touched)) return 'is-invalid';
    return '';
  }

  // Formatação do tempo restante
  getFormattedTimeRemaining(): string {
    const minutes = Math.floor(this.blockTimeRemaining / 60);
    const seconds = this.blockTimeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}