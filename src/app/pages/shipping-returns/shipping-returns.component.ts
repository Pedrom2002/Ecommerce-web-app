import { Component } from '@angular/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-shipping-returns',
  templateUrl: './shipping-returns.component.html',
  styleUrl: './shipping-returns.component.css'
})
export class ShippingReturnsComponent {

  constructor(private languageService: LanguageService) {}

  getTranslation(key: string): string {
    return this.languageService.getTranslation(key);
  }
}
