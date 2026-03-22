import { ComponentFixture, TestBed } from '@angular/core/testing';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DecryptoRules } from './decrypto-rules';

describe('DecryptoRules', () => {
  let component: DecryptoRules;
  let fixture: ComponentFixture<DecryptoRules>;

  // Создаем мок для контекста диалога
  const mockContext = {
    completeWith: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Так как компонент standalone, добавляем его в imports
      imports: [
        DecryptoRules,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: { availableLangs: ['ru', 'en'], defaultLang: 'ru' },
        }),
      ],
      providers: [
        {
          provide: POLYMORPHEUS_CONTEXT,
          useValue: mockContext,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DecryptoRules);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('должен быть создан', () => {
    expect(component).toBeTruthy();
  });

  it('должен содержать внедренный контекст', () => {
    expect(component.context).toBeDefined();
    // Проверяем, что это именно наш мок
    expect(component.context).toBe(mockContext);
  });

  it('должен отрендерить шаблон', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // Проверь наличие конкретного тега или класса из твоего шаблона
    expect(compiled.querySelector('p')).toBeTruthy();
  });
});
