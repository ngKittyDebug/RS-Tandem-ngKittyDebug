import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventLoopGame } from './event-loop-game';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { TuiDialogService } from '@taiga-ui/core';

describe('EventLoopGame', () => {
  let component: EventLoopGame;
  let fixture: ComponentFixture<EventLoopGame>;

  const routerMock = {
    navigate: vi.fn(),
  };

  const dialogsMock = {
    open: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EventLoopGame,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: TuiDialogService, useValue: dialogsMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventLoopGame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
