import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Question } from '../../models/data.interface';
import { GameService } from '../../services/game-service';
import { TuiButton } from '@taiga-ui/core';
import { QuizService } from '../../services/quiz-service';

@Component({
  selector: 'app-quiz',
  imports: [FormsModule, TuiButton],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class Quiz {
  private readonly quizService = inject(QuizService);
  private readonly gameService = inject(GameService);
  private readonly router = inject(Router);

  protected readonly activeQuiz = this.quizService.activeQuiz;

  public readonly wordCount = computed(() =>
    Math.min(this.gameService.questionMode(), this.activeQuiz()?.words.length ?? 1),
  );

  // какие слова будем спрашивать — берём случайные N из группы
  private readonly wordsToAsk = computed(() => {
    const words = [...(this.activeQuiz()?.words ?? [])];
    return words.sort(() => Math.random() - 0.5).slice(0, this.wordCount());
  });

  // текущий индекс вопроса
  protected readonly currentIndex = signal(0);

  // текущее слово
  protected readonly currentWord = computed(() => this.wordsToAsk()[this.currentIndex()]);

  // текущий вопрос
  protected readonly currentQuestion = computed((): Question | null => {
    const quiz = this.activeQuiz();
    const word = this.currentWord();
    if (!quiz || !word) return null;
    return this.quizService.getRandomQuestion(quiz.groupId, word);
  });

  protected userAnswer = signal('');
  protected result = signal<'correct' | 'wrong' | null>(null);
  protected showAnswer = signal(false);

  protected onSubmit(): void {
    const question = this.currentQuestion();
    if (!question) return;

    const isCorrect = this.quizService.checkAnswer(this.userAnswer(), question.keywords);
    this.result.set(isCorrect ? 'correct' : 'wrong');
    this.showAnswer.set(true);
  }

  protected onNext(): void {
    const isLast = this.currentIndex() === this.wordsToAsk().length - 1;

    if (isLast) {
      this.quizService.activeQuiz.set(null);
      this.router.navigate(['/merge-game/board']);
    } else {
      this.currentIndex.update((i) => i + 1);
      this.userAnswer.set('');
      this.result.set(null);
      this.showAnswer.set(false);
    }
  }
}
