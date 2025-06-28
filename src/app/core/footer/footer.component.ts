import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit, AfterViewInit {

  totalDownloads = 0;
  totalClients = 0;
  
  private targetDownloads = 15065421;
  private targetClients = 18465;
  
  @ViewChild('downloadsCounter', { static: false }) downloadsElement!: ElementRef;
  @ViewChild('clientsCounter', { static: false }) clientsElement!: ElementRef;

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    // Start animations after view is initialized
    this.startCounterAnimations();
  }

  private startCounterAnimations(): void {
    // Animate downloads counter
    this.animateCounter(
      this.targetDownloads,
      3000, // 3 seconds
      (value) => {
        this.totalDownloads = value;
        if (this.downloadsElement?.nativeElement) {
          this.downloadsElement.nativeElement.textContent = this.formatNumber(value);
        }
      }
    );

    // Animate clients counter (start with slight delay)
    setTimeout(() => {
      this.animateCounter(
        this.targetClients,
        2000, // 2 seconds
        (value) => {
          this.totalClients = value;
          if (this.clientsElement?.nativeElement) {
            this.clientsElement.nativeElement.textContent = this.formatNumber(value);
          }
        }
      );
    }, 500);
  }

  private animateCounter(target: number, duration: number, callback: (value: number) => void): void {
    const start = 50; // Start from 50 as specified in the data attributes
    const increment = (target - start) / (duration / 16); // ~60fps
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      
      callback(Math.floor(current));
    }, 16); // ~60fps
  }

  private formatNumber(num: number): string {
    return num.toLocaleString('pt-PT');
  }

  // Method to check if element is in viewport (for triggering animation on scroll)
  private isElementInViewport(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  getTranslation(key: string): string {
    return this.languageService.getTranslation(key);
  }
}
