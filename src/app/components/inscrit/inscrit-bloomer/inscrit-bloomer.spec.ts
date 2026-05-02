import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscritBloomer } from './inscrit-bloomer';

describe('InscritBloomer', () => {
  let component: InscritBloomer;
  let fixture: ComponentFixture<InscritBloomer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscritBloomer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InscritBloomer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
