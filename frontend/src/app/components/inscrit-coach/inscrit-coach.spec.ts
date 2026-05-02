import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscritCoach } from './inscrit-coach';

describe('InscritCoach', () => {
  let component: InscritCoach;
  let fixture: ComponentFixture<InscritCoach>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscritCoach]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InscritCoach);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
