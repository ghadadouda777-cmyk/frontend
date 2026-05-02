import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Authentification } from './authentification';

describe('Authentification', () => {
  let component: Authentification;
  let fixture: ComponentFixture<Authentification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Authentification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Authentification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
