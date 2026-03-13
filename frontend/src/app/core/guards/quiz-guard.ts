import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { QuizService } from '../../components/games/merge-game/services/quiz-service';

export const quizGuard: CanActivateFn = () => {
  const quizService = inject(QuizService);
  const router = inject(Router);

  if (!quizService.activeQuiz()) {
    return router.createUrlTree(['/merge-game/board']);
  }

  return true;
};
