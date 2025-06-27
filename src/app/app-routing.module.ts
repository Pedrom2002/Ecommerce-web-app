// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProductListComponent } from './ecommerce/product-list/product-list.component';
import { ProductSingleComponent } from './ecommerce/product-single/product-single.component';
import { ProfileComponent } from './profile/profile.component';
import { CheckoutComponent } from './ecommerce/checkout/checkout.component';
import { AuthGuard, GuestGuard } from './guards/auth.guard';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './pages/terms-of-service/terms-of-service.component';
import { ShippingReturnsComponent } from './pages/shipping-returns/shipping-returns.component';
import { CustomerSupportComponent } from './pages/customer-support/customer-support.component';
import { FaqComponent } from './pages/faq/faq.component';

const routes: Routes = [
  { path: '', component: ProductListComponent },                                   // Homepage com produtos
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },        // Login (apenas para não autenticados)
  { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },  // Registo (apenas para não autenticados)
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },     // Perfil (protegido)
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },   // Checkout (protegido)
  { path: 'product/:id', component: ProductSingleComponent },                     // Produto individual
  { path: 'privacy-policy', component: PrivacyPolicyComponent },                  // Política de Privacidade
  { path: 'terms-of-service', component: TermsOfServiceComponent },               // Termos de Uso
  { path: 'shipping-returns', component: ShippingReturnsComponent },              // Envios e Devoluções
  { path: 'customer-support', component: CustomerSupportComponent },              // Suporte ao Cliente
  { path: 'faq', component: FaqComponent },                                       // Perguntas Frequentes
  { path: '**', redirectTo: '' }                                                  // Redirect para homepage se rota não encontrada
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }