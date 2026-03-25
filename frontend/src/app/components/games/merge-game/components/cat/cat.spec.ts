import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cat } from './cat';

describe('Cat', () => {
  let component: Cat;
  let fixture: ComponentFixture<Cat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cat],
    }).compileComponents();

    fixture = TestBed.createComponent(Cat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
