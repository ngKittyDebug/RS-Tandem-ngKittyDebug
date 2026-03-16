import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { NotFound } from './not-found';
import { AppRoute, getRoutePath } from '../../app.routes';

describe('NotFound', () => {
  let component: NotFound;
  let fixture: ComponentFixture<NotFound>;
  const routerMock = {
    navigate: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NotFound,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
      providers: [{ provide: Router, useValue: routerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFound);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should render the page', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement;

    expect(compiled).toBeTruthy();
  });
  it('should navigate to home when goHome is called', () => {
    component.goHome();

    expect(routerMock.navigate).toHaveBeenCalledWith([getRoutePath(AppRoute.MAIN)]);
  });
});
