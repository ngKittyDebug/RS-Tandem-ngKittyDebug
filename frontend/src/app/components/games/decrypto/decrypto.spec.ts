// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { Decrypto } from './decrypto';
// import { TranslocoTestingModule } from '@jsverse/transloco';

// describe('Decrypto', () => {
//   let component: Decrypto;
//   let fixture: ComponentFixture<Decrypto>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [
//         Decrypto,
//         TranslocoTestingModule.forRoot({
//           langs: { en: {}, ru: {} },
//           translocoConfig: {
//             availableLangs: ['ru', 'en'],
//             defaultLang: 'ru',
//           },
//         }),
//       ],
//     }).compileComponents();

//     fixture = TestBed.createComponent(Decrypto);
//     component = fixture.componentInstance;
//     await fixture.whenStable();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });

import { TestBed } from '@angular/core/testing';
import { Decrypto } from './decrypto';
import { KeyStorageService } from '../../../core/services/key-storage/key-storage-service';
import { DecryptoGameService } from './services/decrypto-game-service';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CONFIG } from './services/models/decrypto.constants';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('Decrypto Component - newGame', () => {
  let component: Decrypto;
  let gameService: DecryptoGameService;

  // Создаем мок данных, которые приходят с "сервера"
  const mockServerData = {
    storage: {
      gameCards: ['Card 1', 'Card 2', 'Card 3'],
    },
  };

  // Создаем мок-объект для сервиса
  const keyStorageMock = {
    getData: vi.fn(() => of(mockServerData)),
    // Если используются другие методы, их тоже нужно добавить:
    sentData: vi.fn(() => of({})),
    removeData: vi.fn(() => of({})),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Если компонент Standalone, добавляем его в imports
      imports: [
        Decrypto,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
      providers: [DecryptoGameService, { provide: KeyStorageService, useValue: keyStorageMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Decrypto);
    component = fixture.componentInstance;
    gameService = TestBed.inject(DecryptoGameService);
  });

  it('должен сбросить состояние игры и загрузить новые данные с сервера', () => {
    // 1. Шпионим за методами сервиса, чтобы проверить их вызов
    const resetCardsSpy = vi.spyOn(gameService, 'resetGameCards');
    const resetHintsSpy = vi.spyOn(gameService, 'resetGameHints');

    // 2. Вызываем тестируемый метод
    // Используем ['newGame'], так как метод protected
    component['newGame']();

    // 3. Проверяем вызовы методов сброса в DecryptoGameService
    expect(resetCardsSpy).toHaveBeenCalled();
    expect(resetHintsSpy).toHaveBeenCalled();

    // 4. Проверяем состояние сигналов (Signals)
    expect(component['gameStarted']()).toBe(false);
    expect(gameService.gamePeriod()).toBe(CONFIG.startRound);
    expect(gameService.gameAttempts()).toBe(CONFIG.attempts);

    // 5. Проверяем форму
    expect(component.decryptoForm.controls.code1.disabled).toBe(true);
    // Проверка, что форма очищена (reset)
    expect(component.decryptoForm.pristine).toBe(true);

    // 6. ПРОВЕРКА ЗАПРОСА К СЕРВЕРУ
    expect(keyStorageMock.getData).toHaveBeenCalled();
    // Проверяем, что данные из подписки попали в сервис
    expect(gameService.gameCardsFromServer).toEqual(mockServerData.storage.gameCards);
  });
});
