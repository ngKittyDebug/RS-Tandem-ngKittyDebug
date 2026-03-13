import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GameService } from '../../components/games/merge-game/services/game-service';

export const boardGuard: CanActivateFn = () => {
  const gameService = inject(GameService);
  const router = inject(Router);

  if (gameService.statusGame() !== 'playing') {
    return router.createUrlTree(['/merge-game/settings']);
  }

  return true;
};
