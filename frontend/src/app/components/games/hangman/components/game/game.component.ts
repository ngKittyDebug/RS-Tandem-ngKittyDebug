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
enum HangmanImage {
  MOUSE1 = 'assets/images/mouse11.png',
  MOUSE2 = 'assets/images/mouse22.png',
  MOUSE3 = 'assets/images/mouse33.png',
  MOUSE4 = 'assets/images/mouse44.png',
  MOUSE5 = 'assets/images/mouse55.png',
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
  public wrongLetters: string[] = [];

  public displayedWord = '';
  public mistakes = 0;
  public maxMistakes = 4;
  public isGameOver = false;
  public isWin = false;
  public currentCatImage = HangmanImage.MOUSE1;

  private wordsPool: HangmanWord[] = [];
  private usedWords: HangmanWord[] = [];

  public ngOnInit(): void {
    this.loadWords();
  }

  protected addLetter(letter: string): void {
    if (this.isGameOver || this.isWin) {
      return;
    }
    const upperLetter = letter.toUpperCase();
    //const upperAnswer = this.correctAnswer.toUpperCase();
    if (this.isLetterUsed(upperLetter)) {
      return;
    }
    if (this.correctAnswer.includes(upperLetter)) {
      this.guessedLetters.push(upperLetter);
      this.updateDisplayedWord();
      console.log('Correct letter:', upperLetter);

      if (this.displayedWord.replaceAll(' ', '') === this.correctAnswer) {
        this.isWin = true;
      }
    } else {
      this.wrongLetters.push(upperLetter);
      this.mistakes++;
      this.updateCatImage();
      console.log('error');
    }

    if (this.mistakes > this.maxMistakes) {
      this.isGameOver = true;
    }

    this.cdr.detectChanges();
  }
  protected reset(): void {
    this.guessedLetters = [];
    this.wrongLetters = [];
    this.mistakes = 0;
    this.isGameOver = false;
    this.isWin = false;
    this.currentCatImage = HangmanImage.MOUSE1;
    this.updateDisplayedWord();
    this.cdr.detectChanges();
  }
  protected isLetterUsed(letter: string): boolean {
    return this.guessedLetters.includes(letter) || this.wrongLetters.includes(letter);
  }

  protected isCorrectLetter(letter: string): boolean {
    return this.guessedLetters.includes(letter);
  }

  protected isWrongLetter(letter: string): boolean {
    return this.wrongLetters.includes(letter);
  }

  protected closeModal(): void {
    this.isGameOver = false;
    this.reset();
  }

  protected nextWord(): void {
    this.loadNextWord();
  }

  private loadWords(): void {
    this.http.get<HangmanWordsByLevel>('assets/data/hangman-words.json').subscribe({
      next: (wordsByLevel) => {
        // const words = wordsByLevel.easy;
        this.wordsPool = [...wordsByLevel.easy];
        this.usedWords = [];
        this.loadNextWord();

        // const randomIndex = Math.floor(Math.random() * words.length);
        // const randomWord = words[randomIndex];

        //this.currentQuestion = randomWord.description;
        //  this.correctAnswer = randomWord.word.toUpperCase();

        //   this.updateDisplayedWord();

        //  console.log('Question loaded:', this.currentQuestion);
        //  console.log('Answer loaded:', this.correctAnswer);

        // this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading hangman words:', error);
      },
    });
  }

  private loadNextWord(): void {
    if (this.wordsPool.length === 0) {
      console.log('No more words left. Restarting word pool...');
      this.wordsPool = [...this.usedWords];
      this.usedWords = [];
    }

    const randomIndex = Math.floor(Math.random() * this.wordsPool.length);
    const randomWord = this.wordsPool[randomIndex];

    this.wordsPool.splice(randomIndex, 1);
    this.usedWords.push(randomWord);

    this.currentQuestion = randomWord.description;
    this.correctAnswer = randomWord.word.toUpperCase();

    this.guessedLetters = [];
    this.wrongLetters = [];
    this.mistakes = 0;
    this.isGameOver = false;
    this.isWin = false;
    this.currentCatImage = HangmanImage.MOUSE1;

    this.updateDisplayedWord();

    console.log('Question loaded:', this.currentQuestion);
    console.log('Answer loaded:', this.correctAnswer);

    this.cdr.detectChanges();
  }

  private updateDisplayedWord(): void {
    this.displayedWord = this.correctAnswer
      .split('')
      .map((letter) => (this.guessedLetters.includes(letter) ? letter : '_'))
      .join(' ');
  }
  private updateCatImage(): void {
    switch (this.mistakes) {
      case 0:
        this.currentCatImage = HangmanImage.MOUSE1;
        break;
      case 1:
        this.currentCatImage = HangmanImage.MOUSE2;
        break;
      case 2:
        this.currentCatImage = HangmanImage.MOUSE3;
        break;
      case 3:
        this.currentCatImage = HangmanImage.MOUSE4;
        break;
      case 4:
        this.currentCatImage = HangmanImage.MOUSE5;
        break;
      default:
        this.currentCatImage = HangmanImage.MOUSE1;
        break;
    }
  }
}
