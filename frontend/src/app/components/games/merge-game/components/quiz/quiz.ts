import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Question } from '../../models/data.interface';
import { GameService } from '../../services/game-service';
import { TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'app-quiz',
  imports: [FormsModule, TuiButton],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class Quiz {
  private readonly gameService = inject(GameService);
  private readonly router = inject(Router);
  protected readonly activeQuiz = this.gameService.activeQuiz;
  protected aiFeedback = signal<string>('');

  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  protected isRecording = signal(false);
  // private readonly aiService = inject(AiService);

  // сколько слов спрашивать — берём из настроек, но не больше чем слов в группе
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
    return this.gameService.getRandomQuestion(quiz.groupId, word); // ← gameService
  });

  protected userAnswer = signal('');
  protected result = signal<'correct' | 'wrong' | null>(null);
  protected showAnswer = signal(false);

  protected onSubmit(): void {
    const question = this.currentQuestion();
    if (!question) return;

    const isCorrect = this.gameService.checkAnswer(this.userAnswer(), question.keywords); // ← gameService
    this.result.set(isCorrect ? 'correct' : 'wrong');
    this.showAnswer.set(true);
  }

  // protected async onSubmit(): Promise<void> {
  //   const question = this.currentQuestion();
  //   if (!question) return;

  //   let isCorrect: boolean;

  //   if (this.gameService.gameMode === 'withAI') {
  //     // const result = await this.gameService.checkAnswerAi(
  //     //   this.userAnswer(),
  //     //   question.question,
  //     //   question.answer,
  //     // );
  //     // isCorrect = result.isCorrect;
  //     // this.aiFeedback.set(result.feedback);
  //     isCorrect = this.gameService.checkAnswer(this.userAnswer(), question.keywords);
  //     this.aiFeedback.set('');
  //   } else {
  //     isCorrect = this.gameService.checkAnswer(this.userAnswer(), question.keywords);
  //     this.aiFeedback.set('');
  //   }

  //   this.gameService.submitAnswer(isCorrect);
  //   this.result.set(isCorrect ? 'correct' : 'wrong');
  //   this.showAnswer.set(true);
  // }

  protected onNext(): void {
    const isLast = this.currentIndex() === this.wordsToAsk().length - 1;

    if (isLast) {
      // квиз закончен — возвращаемся на поле
      this.gameService.activeQuiz.set(null);
      this.router.navigate(['/merge-game/board']);
    } else {
      // следующий вопрос
      this.currentIndex.update((i) => i + 1);
      this.userAnswer.set('');
      this.result.set(null);
      this.showAnswer.set(false);
    }
  }

  // protected async startRecording(): Promise<void> {
  //   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //   this.mediaRecorder = new MediaRecorder(stream);
  //   this.audioChunks = [];

  //   this.mediaRecorder.ondataavailable = (event): void => {
  //     this.audioChunks.push(event.data);
  //   };

  //   this.mediaRecorder.onstop = async (): Promise<void> => {
  //     const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
  //     const text = await this.aiService.transcribeAudio(audioBlob);
  //     this.userAnswer.set(text); // вставляем текст в поле ответа
  //     this.isRecording.set(false);
  //   };

  //   this.mediaRecorder.start();
  //   this.isRecording.set(true);
  // }

  // protected stopRecording(): void {
  //   this.mediaRecorder?.stop();
  //   this.mediaRecorder?.stream.getTracks().forEach((track) => track.stop());
  // }
}
