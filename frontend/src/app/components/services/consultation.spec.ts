import { TestBed } from '@angular/core/testing';

import { Consultation } from './consultation';

describe('Consultation', () => {
  let service: Consultation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Consultation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
