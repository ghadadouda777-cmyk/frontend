import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscritNutritionist } from './inscrit-nutritionist';

describe('InscritNutritionist', () => {
  let component: InscritNutritionist;
  let fixture: ComponentFixture<InscritNutritionist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscritNutritionist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InscritNutritionist);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
