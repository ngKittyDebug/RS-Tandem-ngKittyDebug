import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme-service';
import { ThemeNames } from '../../shared/enums/theme-names.enum';
import { STORAGE_KEYS } from '../../shared/constants/storage-constants';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialized with light theme by default', () => {
    expect(service.theme()).toBe(ThemeNames.Light);
  });

  it('should switch theme from light to dark and save to localStorage', () => {
    service.changeTheme();

    expect(service.theme()).toBe(ThemeNames.Dark);
    expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe(ThemeNames.Dark);
  });

  it('should load the initial theme from localStorage when initialized', () => {
    localStorage.setItem(STORAGE_KEYS.THEME, ThemeNames.Dark);
    const newService = TestBed.runInInjectionContext(() => new ThemeService());

    expect(newService.theme()).toBe(ThemeNames.Dark);
  });
});
