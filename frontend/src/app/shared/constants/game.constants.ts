import { GameLabels } from '../enums/game-labels.enum';

export const GAME_LABEL_TRANSLATION_KEYS: Record<string, string> = {
  [GameLabels.Decrypto]: 'game.decrypto',
  [GameLabels.MergeGame]: 'game.mergegame',
  [GameLabels.EventLoop]: 'game.loopgame',
  [GameLabels.Hangman]: 'game.hangman',
  [GameLabels.CitiesGame]: 'game.wordchain',
};
