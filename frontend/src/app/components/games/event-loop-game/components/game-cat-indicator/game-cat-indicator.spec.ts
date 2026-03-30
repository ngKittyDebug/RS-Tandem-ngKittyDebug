import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCatIndicator } from './game-cat-indicator';

describe('GameCatIndicator', () => {
  let component: GameCatIndicator;
  let fixture: ComponentFixture<GameCatIndicator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameCatIndicator],
    }).compileComponents();

    fixture = TestBed.createComponent(GameCatIndicator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
