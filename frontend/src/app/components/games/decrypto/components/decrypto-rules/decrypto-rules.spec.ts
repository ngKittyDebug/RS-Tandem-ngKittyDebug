import { ComponentFixture, TestBed } from '@angular/core/testing';
import { injectContext } from '@taiga-ui/polymorpheus';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DecryptoRules } from './decrypto-rules';

vi.mock('@taiga-ui/polymorpheus', () => ({
  injectContext: vi.fn(),
}));

describe('DecryptoRules', () => {
  let component: DecryptoRules;
  let fixture: ComponentFixture<DecryptoRules>;

  const mockContext = {
    completeWith: vi.fn(),
    $implicit: {},
  };

  beforeEach(async () => {
    vi.mocked(injectContext).mockReturnValue(mockContext);

    await TestBed.configureTestingModule({
      imports: [DecryptoRules],
    }).compileComponents();

    fixture = TestBed.createComponent(DecryptoRules);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have access to context', () => {
    expect(component.context).toBeDefined();
    expect(component.context).toEqual(mockContext);
  });
});
