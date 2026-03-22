import { ComponentFixture, TestBed } from '@angular/core/testing';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DecryptoRules } from './decrypto-rules';

describe('DecryptoRules', () => {
  let component: DecryptoRules;
  let fixture: ComponentFixture<DecryptoRules>;

  const mockContext = {
    completeWith: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should contain an embedded context', () => {
    expect(component.context).toBeDefined();
    expect(component.context).toBe(mockContext);
  });

  it('should render the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')).toBeTruthy();
  });
});
