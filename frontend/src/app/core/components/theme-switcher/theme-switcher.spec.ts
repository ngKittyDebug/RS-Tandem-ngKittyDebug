import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeSwitcher } from './theme-switcher';
import { ThemeService } from '../../services/theme-service';

describe('ThemeSwither', () => {
  let component: ThemeSwitcher;
  let fixture: ComponentFixture<ThemeSwitcher>;
  const themeServiceMock = {
    changeTheme: vi.fn(),
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
});
