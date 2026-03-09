import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';

import { LaguageSwitcher } from './language-switcher';

describe('LaguageSwitcher', () => {
  let component: LaguageSwitcher;
  let fixture: ComponentFixture<LaguageSwitcher>;
  const mockTranslocoService = {
    getActiveLang: vi.fn().mockReturnValue('ru'),
    getAvailableLangs: vi.fn().mockReturnValue(['ru', 'en']),
    setActiveLang: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LaguageSwitcher,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
      providers: [{ provide: TranslocoService, useValue: mockTranslocoService }],
    }).compileComponents();

    fixture = TestBed.createComponent(LaguageSwitcher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change language', () => {
    const newLang = 'en';
    component.onChangeLanguage(newLang);
    expect(mockTranslocoService.setActiveLang).toHaveBeenCalledWith(newLang);
    expect(component.currentLang).toBe(newLang);
  });
});
