import { GameLabels } from '../../../shared/enums/game-labels.enum';

export interface ListItemVariant {
  icon: string;
}

const DEFAULT_LIST_ITEM_VARIANT: ListItemVariant = {
  icon: '@tui.gamepad-2',
};

const LIST_ITEM_VARIANTS_BY_GAME_TYPE: Readonly<Record<string, ListItemVariant>> = {
  [GameLabels.Decrypto]: { icon: '@tui.cat' },
  [GameLabels.MergeGame]: { icon: '@tui.paw-print' },
  [GameLabels.EventLoop]: { icon: '@tui.repeat' },
  [GameLabels.Hangman]: { icon: '@tui.whole-word' },
  [GameLabels.CitiesGame]: { icon: '@tui.building' },
};

export function getListItemVariant(gameType: string): ListItemVariant {
  return LIST_ITEM_VARIANTS_BY_GAME_TYPE[gameType] ?? DEFAULT_LIST_ITEM_VARIANT;
}
