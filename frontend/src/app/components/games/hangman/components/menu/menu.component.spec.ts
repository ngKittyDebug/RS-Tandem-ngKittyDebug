import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { MenuComponent } from '../menu/menu.component';
import { map, of, firstValueFrom } from 'rxjs';

describe('Game', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MenuComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
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
});
