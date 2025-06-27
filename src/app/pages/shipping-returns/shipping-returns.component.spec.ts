import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingReturnsComponent } from './shipping-returns.component';

describe('ShippingReturnsComponent', () => {
  let component: ShippingReturnsComponent;
  let fixture: ComponentFixture<ShippingReturnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShippingReturnsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingReturnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
