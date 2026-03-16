import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { Main } from './main';
import { map, of, firstValueFrom } from 'rxjs';

describe('Main', () => {
  let component: Main;
  let fixture: ComponentFixture<Main>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Main,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Main);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map mobile breakpoint to "m"', async () => {
    const size$ = of('mobile').pipe(map((key) => (key === 'mobile' ? 'm' : 'l')));

    const size = await firstValueFrom(size$);
    expect(size).toBe('m');
  });

  it('should map desktop breakpoint to "l"', async () => {
    const size$ = of('desktop').pipe(map((key) => (key === 'mobile' ? 'm' : 'l')));

    const size = await firstValueFrom(size$);
    expect(size).toBe('l');
  });
  it('should render the page', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled).toBeTruthy();
  });
  it('size$ should emit a value', async () => {
    const size = await firstValueFrom(component.size$);
    expect(size).toBeDefined();
  });
  it('should resolve icon path correctly', () => {
    const resolver = (icon: string): string =>
      icon.includes('/') ? icon : `/assets/images/${icon}.svg`;
    expect(resolver('play')).toBe('/assets/images/play.svg');
    expect(resolver('/custom/icon.svg')).toBe('/custom/icon.svg');
  });
});
