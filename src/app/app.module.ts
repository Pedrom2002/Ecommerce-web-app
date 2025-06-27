import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';
import { ProductSingleComponent } from './ecommerce/product-single/product-single.component';
import { ProductListComponent } from './ecommerce/product-list/product-list.component';

import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { LoadingSkeletonComponent } from './shared/loading-skeleton/loading-skeleton.component';
import { CheckoutComponent } from './ecommerce/checkout/checkout.component';
import { ProfileComponent } from './profile/profile.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './pages/terms-of-service/terms-of-service.component';
import { ShippingReturnsComponent } from './pages/shipping-returns/shipping-returns.component';
import { CustomerSupportComponent } from './pages/customer-support/customer-support.component';
import { FaqComponent } from './pages/faq/faq.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HeaderComponent,
    FooterComponent,
    ProductSingleComponent,
    ProductListComponent,
    LoadingSkeletonComponent,
    CheckoutComponent,
    ProfileComponent,
    PrivacyPolicyComponent,
    TermsOfServiceComponent,
    ShippingReturnsComponent,
    CustomerSupportComponent,
    FaqComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: JwtInterceptor, 
      multi: true 
    },
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: ErrorInterceptor, 
      multi: true 
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
