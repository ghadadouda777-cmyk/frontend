import { TestBed } from '@angular/core/testing';

import { ObjectifPersonnel } from './objectif-personnel';

describe('ObjectifPersonnel', () => {
  let service: ObjectifPersonnel;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjectifPersonnel);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
