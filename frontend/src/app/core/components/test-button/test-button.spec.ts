import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestButton } from './test-button';

describe('TestButton', () => {
  let component: TestButton;
  let fixture: ComponentFixture<TestButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestButton],
    }).compileComponents();

    fixture = TestBed.createComponent(TestButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
