import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { ThemeSwitcher } from './theme-switcher';
import { ThemeService } from '../../services/theme-service';
import { ThemeNames } from '../../../shared/enums/theme-names.enum';

describe('ThemeSwither', () => {
  let component: ThemeSwitcher;
  let fixture: ComponentFixture<ThemeSwitcher>;
  const themeServiceMock = {
    changeTheme: vi.fn(),
    theme: signal<string>(ThemeNames.Light),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeSwitcher],
      providers: [{ provide: ThemeService, useValue: themeServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeSwitcher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle theme on switcher change', async () => {
    component.onChangeTheme();
    expect(themeServiceMock.changeTheme).toHaveBeenCalled();
  });

  it('should render checkbox as checked when light theme is active', async () => {
    themeServiceMock.theme.set(ThemeNames.Light);
    fixture.detectChanges();
    await fixture.whenStable();

    const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(checkbox.checked).toBe(true);
  });

  it('should render checkbox as unchecked when dark theme is active', async () => {
    themeServiceMock.theme.set(ThemeNames.Dark);
    fixture.detectChanges();
    await fixture.whenStable();

    const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(checkbox.checked).toBe(false);
  });
});
