import { GameLabels } from '../../../shared/enums/game-labels.enum';
import { getListItemVariant } from './list-item-variant.util';

describe('getListItemVariant', () => {
  it('should return icon by game type', () => {
    expect(getListItemVariant(GameLabels.Decrypto).icon).toBe('@tui.cat');
    expect(getListItemVariant(GameLabels.MergeGame).icon).toBe('@tui.paw-print');
    expect(getListItemVariant(GameLabels.EventLoop).icon).toBe('@tui.repeat');
  });

  it('should return default icon for unknown game type', () => {
    expect(getListItemVariant('unknown').icon).toBe('@tui.gamepad-2');
  });
});
