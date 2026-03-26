import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { TuiButton } from '@taiga-ui/core';
import { HttpClient } from '@angular/common/http';

interface HangmanWord {
  description: string;
  word: string;
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

  public userAnswer = '';
  public currentQuestion = '';
  public correctAnswer = '';

  public ngOnInit(): void {
    this.loadWords();
  }

  protected addLetter(letter: string): void {
    this.userAnswer += letter;
  }
  protected reset(): void {
    this.userAnswer = '';
  }

  private loadWords(): void {
    this.http.get<HangmanWord[]>('../../data/hangman-words.json').subscribe({
      next: (words) => {
        const randomIndex = Math.floor(Math.random() * words.length);
        const randomWord = words[randomIndex];

        this.currentQuestion = randomWord.description;
        this.correctAnswer = randomWord.word;
      },
      error: (error) => {
        console.error('Error loading hangman words:', error);
      },
    });
  }
}
