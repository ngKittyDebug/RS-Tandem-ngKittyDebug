import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeGame } from './merge-game';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { GameService } from './services/game-service';
import { TuiDialogService } from '@taiga-ui/core';

const routerMock = { navigate: vi.fn() };

const gameServiceMock = {
  statusGame: signal('idle'),
  resetGame: vi.fn(),
};

const dialogsMock = {
  open: vi.fn(() => of(true)),
};

describe('MergeGame', () => {
  let component: MergeGame;
  let fixture: ComponentFixture<MergeGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MergeGame,
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
        { provide: GameService, useValue: gameServiceMock },
        { provide: TuiDialogService, useValue: dialogsMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MergeGame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to theory', () => {
    component['goToTheory']();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/merge-game/theory']);
  });

  it('should navigate to main when status is not playing', () => {
    gameServiceMock.statusGame.set('idle');
    component['goToMain']();
    expect(gameServiceMock.resetGame).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith([component['mainRouterPath']]);
  });

  it('should open dialog when navigating to main during playing', () => {
    gameServiceMock.statusGame.set('playing');
    component['goToMain']();
    expect(dialogsMock.open).toHaveBeenCalled();
  });

  it('should navigate to main after confirming dialog', () => {
    gameServiceMock.statusGame.set('playing');
    dialogsMock.open.mockReturnValue(of(true));
    component['goToMain']();
    expect(routerMock.navigate).toHaveBeenCalledWith([component['mainRouterPath']]);
  });

  it('should navigate to settings when status is not playing', () => {
    gameServiceMock.statusGame.set('idle');
    component['goToSettingsGame']();
    expect(gameServiceMock.resetGame).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/merge-game/settings']);
  });

  it('should open dialog when navigating to settings during playing', () => {
    gameServiceMock.statusGame.set('playing');
    component['goToSettingsGame']();
    expect(dialogsMock.open).toHaveBeenCalled();
  });

  it('should navigate to settings after confirming dialog', () => {
    gameServiceMock.statusGame.set('playing');
    dialogsMock.open.mockReturnValue(of(true));
    component['goToSettingsGame']();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/merge-game/settings']);
  });
});
