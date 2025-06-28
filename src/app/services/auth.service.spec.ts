import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login user successfully', () => {
    const mockUser = {
      username: 'testuser',
      password: 'testpass'
    };
    
    const mockResponse = {
      access_token: 'mock-jwt-token'
    };

    service.login(mockUser.username, mockUser.password).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:5000/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockResponse);
  });

  it('should register user successfully', () => {
    const mockUser = {
      name: 'Test User',
      email: 'test@test.com',
      username: 'testuser',
      phone: '123456789',
      password: 'testpass'
    };
    
    const mockResponse = {
      message: 'User registered successfully'
    };

    service.register(mockUser.name, mockUser.email, mockUser.username, mockUser.phone, mockUser.password)
      .subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

    const req = httpMock.expectOne('http://localhost:5000/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUser);
    req.flush(mockResponse);
  });

  it('should save and get token', () => {
    const mockToken = 'mock-jwt-token';
    
    service.saveToken(mockToken);
    expect(localStorage.getItem('access_token')).toBe(mockToken);
    expect(service.getToken()).toBe(mockToken);
  });

  it('should check if user is logged in', () => {
    // Initially not logged in
    expect(service.isLoggedIn()).toBe(false);
    
    // Set token
    localStorage.setItem('access_token', 'mock-token');
    expect(service.isLoggedIn()).toBe(true);
    
    // Remove token
    localStorage.removeItem('access_token');
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should logout user', () => {
    // Set up logged in state
    localStorage.setItem('access_token', 'mock-token');
    
    service.logout();
    
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return null when no token exists', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should handle login error', () => {
    const mockUser = {
      username: 'testuser',
      password: 'wrongpass'
    };

    service.login(mockUser.username, mockUser.password).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(401);
      }
    });

    const req = httpMock.expectOne('http://localhost:5000/login');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should handle registration error', () => {
    const mockUser = {
      name: 'Test User',
      email: 'test@test.com',
      username: 'testuser',
      phone: '123456789',
      password: 'testpass'
    };

    service.register(mockUser.name, mockUser.email, mockUser.username, mockUser.phone, mockUser.password)
      .subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(409);
        }
      });

    const req = httpMock.expectOne('http://localhost:5000/register');
    req.flush('Username already exists', { status: 409, statusText: 'Conflict' });
  });
});