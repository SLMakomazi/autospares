import { TestBed } from '@angular/core/testing';

import { Sanity } from './sanity';

describe('Sanity', () => {
  let service: Sanity;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sanity);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
