import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeSwitcher } from './theme-switcher';

describe('ThemeSwither', () => {
  let component: ThemeSwitcher;
  let fixture: ComponentFixture<ThemeSwitcher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeSwitcher],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeSwitcher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
