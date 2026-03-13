import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GameService } from '../../components/games/merge-game/services/game-service';

export const quizGuard: CanActivateFn = () => {
  const gameService = inject(GameService);
  const router = inject(Router);

  if (!gameService.activeQuiz()) {
    return router.createUrlTree(['/merge-game/board']);
  }

  return true;
};
