import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ServiceInitializerService {
  private isInitialized = false;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  initialize(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isInitialized) {
        resolve();
        return;
      }

      if (isPlatformBrowser(this.platformId)) {
        // Browser environment - can safely use localStorage, fetch, etc.
        this.initializeBrowserServices().then(() => {
          this.isInitialized = true;
          resolve();
        });
      } else {
        // Server environment - minimal initialization
        this.isInitialized = true;
        resolve();
      }
    });
  }

  private async initializeBrowserServices(): Promise<void> {
    try {
      // Initialize any browser-specific services here
      console.log('🚀 Initializing browser services...');
      
      // Add any async initialization logic here
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure DOM is ready
      
      console.log('✅ Browser services initialized');
    } catch (error) {
      console.error('❌ Error initializing browser services:', error);
    }
  }

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  isServerSide(): boolean {
    return !isPlatformBrowser(this.platformId);
  }
}