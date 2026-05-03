import { ComponentFixture, TestBed } from '@angular/core/testing';

<<<<<<<< HEAD:frontend/src/app/components/abonnement/abonnement.spec.ts
import { Abonnement } from './abonnement';

describe('Abonnement', () => {
  let component: Abonnement;
  let fixture: ComponentFixture<Abonnement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Abonnement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Abonnement);
========
import { BloomerDashboard } from './bloomer-dashboard';

describe('BloomerDashboard', () => {
  let component: BloomerDashboard;
  let fixture: ComponentFixture<BloomerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloomerDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BloomerDashboard);
>>>>>>>> 221be227 (add dashboard client):src/app/components/dashboard/bloomer-dashboard/bloomer-dashboard.spec.ts
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
