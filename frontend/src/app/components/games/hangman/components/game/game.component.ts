import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { TuiButton } from '@taiga-ui/core';
import { HttpClient } from '@angular/common/http';

interface HangmanWord {
  description: string;
  word: string;
}

interface HangmanWordsByLevel {
  easy: HangmanWord[];
  medium: HangmanWord[];
  hard: HangmanWord[];
  expert: HangmanWord[];
  insane: HangmanWord[];
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [TuiButton],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent implements OnInit {
  @Output() public back = new EventEmitter<void>();
  @Output() public results = new EventEmitter<void>();

  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  public currentQuestion = '';
  public correctAnswer = '';

  public guessedLetters: string[] = [];

  public displayedWord = '';

  public ngOnInit(): void {
    this.loadWords();
  }

  protected addLetter(letter: string): void {
    const upperLetter = letter.toUpperCase();
    const upperAnswer = this.correctAnswer.toUpperCase();
    if (this.guessedLetters.includes(upperLetter)) {
      return;
    }
    if (upperAnswer.includes(upperLetter)) {
      this.guessedLetters.push(upperLetter);
      this.updateDisplayedWord();
      console.log('Correct letter:', upperLetter);
    } else {
      console.log('error');
    }
    this.cdr.detectChanges();
  }
  protected reset(): void {
    this.guessedLetters = [];
    this.updateDisplayedWord();
    this.cdr.detectChanges();
  }

  private loadWords(): void {
    this.http.get<HangmanWordsByLevel>('assets/data/hangman-words.json').subscribe({
      next: (wordsByLevel) => {
        const words = wordsByLevel.easy;

        const randomIndex = Math.floor(Math.random() * words.length);
        const randomWord = words[randomIndex];

        this.currentQuestion = randomWord.description;
        this.correctAnswer = randomWord.word.toUpperCase();

        this.updateDisplayedWord();

        console.log('Question loaded:', this.currentQuestion);
        console.log('Answer loaded:', this.correctAnswer);

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading hangman words:', error);
      },
    });
  }
  private updateDisplayedWord(): void {
    this.displayedWord = this.correctAnswer
      .split('')
      .map((letter) => (this.guessedLetters.includes(letter) ? letter : '_'))
      .join(' ');
  }
}
