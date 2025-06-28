import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'saveToken']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('username')).toBeDefined();
    expect(component.loginForm.get('password')).toBeDefined();
    expect(component.loginForm.get('rememberMe')).toBeDefined();
  });

  it('should validate required fields', () => {
    const usernameControl = component.loginForm.get('username');
    const passwordControl = component.loginForm.get('password');

    // Test empty values
    usernameControl?.setValue('');
    passwordControl?.setValue('');
    
    expect(usernameControl?.hasError('required')).toBeTruthy();
    expect(passwordControl?.hasError('required')).toBeTruthy();
    expect(component.loginForm.invalid).toBeTruthy();
  });

  it('should validate minimum length for fields', () => {
    const usernameControl = component.loginForm.get('username');
    const passwordControl = component.loginForm.get('password');
    
    usernameControl?.setValue('ab'); // Less than 3 characters
    passwordControl?.setValue('123'); // Less than 6 characters
    
    expect(usernameControl?.hasError('minlength')).toBeTruthy();
    expect(passwordControl?.hasError('minlength')).toBeTruthy();
    
    usernameControl?.setValue('abc'); // Exactly 3 characters
    passwordControl?.setValue('123456'); // Exactly 6 characters
    
    expect(usernameControl?.hasError('minlength')).toBeFalsy();
    expect(passwordControl?.hasError('minlength')).toBeFalsy();
  });

  it('should login successfully', () => {
    const mockResponse = { 
      access_token: 'mock-token'
    };
    
    mockAuthService.login.and.returnValue(of(mockResponse));
    
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });
    
    component.onSubmit();
    
    expect(mockAuthService.login).toHaveBeenCalledWith('testuser', 'password123');
    expect(mockAuthService.saveToken).toHaveBeenCalledWith('mock-token');
    expect(component.isLoading).toBeFalsy();
  });

  it('should handle login error', () => {
    const errorResponse = { status: 401, error: { message: 'Invalid credentials' } };
    mockAuthService.login.and.returnValue(throwError(() => errorResponse));
    
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'wrongpassword'
    });
    
    component.onSubmit();
    
    expect(component.alertMessage).toContain('Username ou password incorretos');
    expect(component.isLoading).toBeFalsy();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should not submit invalid form', () => {
    component.loginForm.patchValue({
      username: '', // Invalid - required
      password: '123' // Invalid - too short
    });
    
    component.onSubmit();
    
    expect(mockAuthService.login).not.toHaveBeenCalled();
    expect(component.isLoading).toBeFalsy();
    expect(component.alertMessage).toContain('corrija os erros');
  });

  it('should show loading state during login', () => {
    const mockResponse = { access_token: 'token' };
    mockAuthService.login.and.returnValue(of(mockResponse));
    
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });
    
    // Before submit
    expect(component.isLoading).toBeFalsy();
    
    component.onSubmit();
    
    // After submit (loading should be reset to false after successful response)
    expect(component.isLoading).toBeFalsy();
    expect(mockAuthService.login).toHaveBeenCalled();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalsy();
    
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTruthy();
    
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeFalsy();
  });

  it('should validate form correctly', () => {
    // Invalid form
    component.loginForm.patchValue({
      username: '',
      password: ''
    });
    expect(component.isFormValid()).toBeFalsy();
    
    // Valid form
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });
    expect(component.isFormValid()).toBeTruthy();
  });

  it('should get error messages for fields', () => {
    const usernameControl = component.loginForm.get('username');
    const passwordControl = component.loginForm.get('password');
    
    // Make fields touched to trigger validation
    usernameControl?.markAsTouched();
    passwordControl?.markAsTouched();
    
    usernameControl?.setValue('');
    passwordControl?.setValue('');
    
    expect(component.getErrorMessage('username')).toContain('Username é obrigatório');
    expect(component.getErrorMessage('password')).toContain('Password é obrigatório');
    
    usernameControl?.setValue('ab');
    passwordControl?.setValue('123');
    
    expect(component.getErrorMessage('username')).toContain('pelo menos 3 caracteres');
    expect(component.getErrorMessage('password')).toContain('pelo menos 6 caracteres');
  });

  it('should show alert messages', () => {
    component.showAlert('success', 'Test message');
    
    expect(component.alertType).toBe('success');
    expect(component.alertMessage).toBe('Test message');
  });

  it('should handle server unavailable error', () => {
    const errorResponse = { status: 0 };
    mockAuthService.login.and.returnValue(throwError(() => errorResponse));
    
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });
    
    component.onSubmit();
    
    expect(component.alertMessage).toContain('Servidor não disponível');
  });
});