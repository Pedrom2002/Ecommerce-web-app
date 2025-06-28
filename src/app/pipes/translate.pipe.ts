import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../services/language.service';

@Pipe({
  name: 'translate',
  pure: false // Importante: pipe impura para reagir a mudanças
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription: Subscription;
  private lastLanguage: string = '';

  constructor(private languageService: LanguageService) {
    // Escutar mudanças de idioma
    this.subscription = this.languageService.currentLanguage$.subscribe(
      (language) => {
        this.lastLanguage = language;
      }
    );
  }

  transform(key: string): string {
    return this.languageService.getTranslation(key);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}