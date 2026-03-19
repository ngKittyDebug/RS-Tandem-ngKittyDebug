import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Question } from '../../models/data.interface';
import { GameService } from '../../services/game-service';
import { TuiButton } from '@taiga-ui/core';
import { QuizService } from '../../services/quiz-service';
import { TranslocoDirective } from '@jsverse/transloco';
import { AiService } from '../../services/ai-service';
import { ResponseCheckAnswerAi } from '../../models/ai-metods.interface';
import { tap } from 'rxjs';
import { BoardService } from '../../services/board-service';

@Component({
  selector: 'app-quiz',
  imports: [TranslocoDirective, FormsModule, TuiButton],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class Quiz {
  private readonly quizService = inject(QuizService);
  public readonly gameService = inject(GameService);
  private readonly boardService = inject(BoardService);
  private readonly aiService = inject(AiService);
  private readonly router = inject(Router);
  protected aiFeedback = signal<string | null>(null);

  protected readonly activeQuiz = this.quizService.activeQuiz;

  public readonly wordCount = computed(() =>
    Math.min(this.gameService.questionMode(), this.activeQuiz()?.words.length ?? 1),
  );

  private readonly wordsToAsk = computed(() => {
    const words = [...(this.activeQuiz()?.words ?? [])];
    return words.sort(() => Math.random() - 0.5).slice(0, this.wordCount());
  });

  protected readonly currentIndex = signal(0);
  protected readonly currentWord = computed(() => this.wordsToAsk()[this.currentIndex()]);

  protected readonly currentQuestion = computed((): Question | null => {
    const quiz = this.activeQuiz();
    const word = this.currentWord();
    if (!quiz || !word) return null;
    return this.quizService.getRandomQuestion(word);
  });

  protected userAnswer = signal('');
  protected result = signal<'correct' | 'wrong' | null>(null);
  protected showAnswer = signal(false);

  protected onSubmit(): void {
    const question = this.currentQuestion();
    if (!question) return;
    if (this.gameService.gameMode() === 'withAI') {
      console.log('ai');
      this.aiService
        .checkAnswerAi({
          userAnswer: this.userAnswer(),
          question: question.question,
          answer: question.answer,
          personality: this.gameService.personalityMode(),
        })
        .pipe(
          tap((res: ResponseCheckAnswerAi) => {
            this.quizService.submitAnswer(res.isCorrect);
            this.result.set(res.isCorrect ? 'correct' : 'wrong');
            this.aiFeedback.set(res.feedback);
            this.showAnswer.set(true);
          }),
        )
        .subscribe();
    } else {
      const isCorrect = this.quizService.checkAnswer(this.userAnswer(), question.keywords);
      this.quizService.submitAnswer(isCorrect);
      this.result.set(isCorrect ? 'correct' : 'wrong');
      this.showAnswer.set(true);
    }
  }

  protected onNext(): void {
    const isLast = this.currentIndex() === this.wordsToAsk().length - 1;

    if (isLast) {
      this.currentIndex.set(0);
      this.quizService.activeQuiz.set(null);
      if (this.boardService.allRowsCompleted()) {
        this.gameService.finishGame();
      }
      this.router.navigate(['/merge-game/board']);
    } else {
      this.currentIndex.update((i) => i + 1);
      this.userAnswer.set('');
      this.result.set(null);
      this.aiFeedback.set(null);
      this.showAnswer.set(false);
    }
  }
}
