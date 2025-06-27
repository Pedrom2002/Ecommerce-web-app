// register.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  username = '';
  phone = '';
  password = '';
  confirmPassword = '';
  termsAccepted = false;
  
  // Estados de validação
  nameValid = false;
  emailValid = false;
  usernameValid = false;
  phoneValid = false;
  passwordValid = false;
  confirmPasswordValid = false;
  
  // Estados de erro
  nameError = '';
  emailError = '';
  usernameError = '';
  phoneError = '';
  passwordError = '';
  confirmPasswordError = '';
  
  // Estados da UI
  showPassword = false;
  isLoading = false;
  alertMessage = '';
  alertType = '';
  passwordStrength = 0;

  constructor(private authService: AuthService, private router: Router) {}

  // Validação do nome
  validateName(): void {
    const name = this.name.trim();
    this.nameValid = false;
    this.nameError = '';

    if (name.length < 2) {
      this.nameError = 'Nome deve ter pelo menos 2 caracteres';
    } else if (name.length > 100) {
      this.nameError = 'Nome não pode exceder 100 caracteres';
    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
      this.nameError = 'Nome deve conter apenas letras e espaços';
    } else {
      this.nameValid = true;
    }
  }

  // Validação do email
  validateEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailValid = false;
    this.emailError = '';

    if (!emailRegex.test(this.email)) {
      this.emailError = 'Email inválido';
    } else {
      this.emailValid = true;
    }
  }

  // Validação do username
  validateUsername(): void {
    const username = this.username.trim();
    this.usernameValid = false;
    this.usernameError = '';

    if (username.length < 3) {
      this.usernameError = 'Username deve ter pelo menos 3 caracteres';
    } else if (username.length > 20) {
      this.usernameError = 'Username não pode exceder 20 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      this.usernameError = 'Username deve conter apenas letras, números e underscore';
    } else {
      this.usernameValid = true;
    }
  }

  // Validação do telefone
  validatePhone(): void {
    const phoneRegex = /^[0-9+\-\s()]+$/;
    this.phoneValid = false;
    this.phoneError = '';

    if (!phoneRegex.test(this.phone) || this.phone.length < 9) {
      this.phoneError = 'Telefone inválido';
    } else {
      this.phoneValid = true;
    }
  }

  // Validação da password
  validatePassword(): void {
    this.passwordValid = false;
    this.passwordError = '';
    
    const errors = [];
    if (this.password.length < 8) errors.push('8 caracteres');
    if (!/[A-Z]/.test(this.password)) errors.push('1 maiúscula');
    if (!/[a-z]/.test(this.password)) errors.push('1 minúscula');
    if (!/[0-9]/.test(this.password)) errors.push('1 número');

    if (errors.length > 0) {
      this.passwordError = `Falta: ${errors.join(', ')}`;
    } else {
      this.passwordValid = true;
    }

    // Calcular força da password
    this.calculatePasswordStrength();
    
    // Revalidar confirmação se já foi preenchida
    if (this.confirmPassword) {
      this.validateConfirmPassword();
    }
  }

  // Calcular força da password
  calculatePasswordStrength(): void {
    let score = 0;
    if (this.password.length >= 8) score++;
    if (/[A-Z]/.test(this.password)) score++;
    if (/[a-z]/.test(this.password)) score++;
    if (/[0-9]/.test(this.password)) score++;
    if (/[^A-Za-z0-9]/.test(this.password)) score++;
    
    this.passwordStrength = score;
  }

  // Validação da confirmação de password
  validateConfirmPassword(): void {
    this.confirmPasswordValid = false;
    this.confirmPasswordError = '';

    if (this.confirmPassword && this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Passwords não coincidem';
    } else if (this.confirmPassword && this.password === this.confirmPassword) {
      this.confirmPasswordValid = true;
    }
  }

  // Toggle visibilidade da password
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Verificar se o formulário é válido
  isFormValid(): boolean {
    return this.nameValid && 
           this.emailValid && 
           this.usernameValid && 
           this.phoneValid && 
           this.passwordValid && 
           this.confirmPasswordValid && 
           this.termsAccepted;
  }

  // Mostrar alerta
  showAlert(type: 'success' | 'danger', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.alertMessage = '';
    }, 5000);
  }

  // Submeter formulário
  onRegister(): void {
    // Validar todos os campos
    this.validateName();
    this.validateEmail();
    this.validateUsername();
    this.validatePhone();
    this.validatePassword();
    this.validateConfirmPassword();

    if (!this.isFormValid()) {
      this.showAlert('danger', 'Por favor, corrija os erros no formulário antes de continuar.');
      return;
    }

    this.isLoading = true;

    const registerData = {
      name: this.name.trim(),
      email: this.email.trim(),
      username: this.username.trim(),
      phone: this.phone.trim(),
      password: this.password
    };

    this.authService.register(
      registerData.name,
      registerData.email,
      registerData.username,
      registerData.phone,
      registerData.password
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showAlert('success', 'Conta criada com sucesso! Pode agora fazer login.');
        
        // Resetar formulário após sucesso
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erro ao registar:', error);
        
        let errorMessage = 'Erro interno do servidor. Tente novamente.';
        
        if (error.status === 0) {
          errorMessage = 'Servidor não disponível. Certifique-se que o backend Flask está rodando na porta 5000.';
        } else if (error.status === 409) {
          errorMessage = 'Username ou email já existem.';
        } else if (error.status === 400) {
          errorMessage = 'Dados inválidos. Verifique os campos.';
        } else if (error.status === 500) {
          errorMessage = 'Erro interno do servidor. Verifique se a base de dados está configurada.';
        }
        
        this.showAlert('danger', errorMessage);
      }
    });
  }

  // Getters para classes CSS
  getNameClass(): string {
    if (this.name && this.nameValid) return 'is-valid';
    if (this.name && !this.nameValid) return 'is-invalid';
    return '';
  }

  getEmailClass(): string {
    if (this.email && this.emailValid) return 'is-valid';
    if (this.email && !this.emailValid) return 'is-invalid';
    return '';
  }

  getUsernameClass(): string {
    if (this.username && this.usernameValid) return 'is-valid';
    if (this.username && !this.usernameValid) return 'is-invalid';
    return '';
  }

  getPhoneClass(): string {
    if (this.phone && this.phoneValid) return 'is-valid';
    if (this.phone && !this.phoneValid) return 'is-invalid';
    return '';
  }

  getPasswordClass(): string {
    if (this.password && this.passwordValid) return 'is-valid';
    if (this.password && !this.passwordValid) return 'is-invalid';
    return '';
  }

  getConfirmPasswordClass(): string {
    if (this.confirmPassword && this.confirmPasswordValid) return 'is-valid';
    if (this.confirmPassword && !this.confirmPasswordValid) return 'is-invalid';
    return '';
  }

  getPasswordStrengthClass(): string {
    if (this.passwordStrength <= 2) return 'strength-weak';
    if (this.passwordStrength <= 3) return 'strength-medium';
    return 'strength-strong';
  }

  getPasswordStrengthWidth(): string {
    return (this.passwordStrength * 20) + '%';
  }
}