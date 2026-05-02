import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestMail } from './request-mail';

describe('RequestMail', () => {
  let component: RequestMail;
  let fixture: ComponentFixture<RequestMail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestMail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestMail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
