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
export type Level = 'easy' | 'medium' | 'hard' | 'expert' | 'god';

interface HangmanWordsByLevel {
  easy: HangmanWord[];
  medium: HangmanWord[];
  hard: HangmanWord[];
  expert: HangmanWord[];
  god: HangmanWord[];
}
enum HangmanImage {
  MOUSE1 = 'assets/images/mouse11.png',
  MOUSE2 = 'assets/images/mouse22.png',
  MOUSE3 = 'assets/images/mouse33.png',
  MOUSE4 = 'assets/images/mouse44.png',
  MOUSE5 = 'assets/images/mouse55.png',
}
export interface GameStats {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  expert: number;
  god: number;
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
  public isLevelCompleted = false;
  public currentCatImage = HangmanImage.MOUSE1;

  public currentLevel: Level = 'easy';
  private wordsByLevel: HangmanWordsByLevel | null = null;
  private readonly statsStorageKey = 'hangman_game_stats';
  public usedWords: Record<Level, string[]> = {
    easy: [],
    medium: [],
    hard: [],
    expert: [],
    god: [],
  };

  public stats: GameStats = {
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0,
    god: 0,
  };

  public ngOnInit(): void {
    this.loadStats();
    this.loadWordsData();
  }
  private loadStats(): void {
    const savedStats = localStorage.getItem(this.statsStorageKey);

    if (savedStats) {
      this.stats = JSON.parse(savedStats);
    }
  }

  private saveStats(): void {
    localStorage.setItem(this.statsStorageKey, JSON.stringify(this.stats));
  }

  private updateStats(): void {
    this.stats.total++;
    this.stats[this.currentLevel]++;
    this.saveStats();
  }
  protected addLetter(letter: string): void {
    if (this.isGameOver || this.isWin || this.isLevelCompleted) {
      return;
    }
    const upperLetter = letter.toUpperCase();

    if (this.isLetterUsed(upperLetter)) {
      return;
    }
    if (this.correctAnswer.includes(upperLetter)) {
      this.guessedLetters.push(upperLetter);
      this.updateDisplayedWord();
    } else {
      this.wrongLetters.push(upperLetter);
      this.mistakes++;
      this.updateCatImage();
    }

    if (this.mistakes > this.maxMistakes) {
      this.isGameOver = true;
    }
    if (this.displayedWord.replaceAll(' ', '') === this.correctAnswer) {
      this.isWin = true;
      this.updateStats();
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
  protected selectLevel(level: Level): void {
    this.currentLevel = level;
    this.isLevelCompleted = false;
    this.isWin = false;
    this.isGameOver = false;
    this.loadRandomWordForLevel();
    this.cdr.detectChanges();
  }
  protected isActiveLevel(level: Level): boolean {
    return this.currentLevel === level;
  }
  protected nextWord(): void {
    this.isWin = false;
    this.isGameOver = false;
    this.isLevelCompleted = false;
    this.loadRandomWordForLevel();
  }
  protected goToNextLevel(): void {
    const nextLevelMap: Record<Level, Level | null> = {
      easy: 'medium',
      medium: 'hard',
      hard: 'expert',
      expert: 'god',
      god: null,
    };
    const nextLevel = nextLevelMap[this.currentLevel];
    if (nextLevel) {
      this.currentLevel = nextLevel;
      this.isLevelCompleted = false;
      this.loadRandomWordForLevel();
    } else {
      this.isLevelCompleted = false;
      this.currentLevel = 'easy';
      this.cdr.detectChanges();
    }
  }

  private loadWordsData(): void {
    this.http.get<HangmanWordsByLevel>('assets/data/hangman-words.json').subscribe({
      next: (wordsByLevel) => {
        this.wordsByLevel = wordsByLevel;
        this.loadRandomWordForLevel();
      },
      error: (error) => {
        console.error('Error loading hangman words:', error);
      },
    });
  }
  private loadRandomWordForLevel(): void {
    if (!this.wordsByLevel) {
      return;
    }
    const words = this.wordsByLevel[this.currentLevel];
    const usedWordsForLevel = this.usedWords[this.currentLevel];

    const availableWords = words.filter(
      (word: HangmanWord) => !usedWordsForLevel.includes(word.word),
    );
    if (availableWords.length === 0) {
      this.isLevelCompleted = true;
      this.cdr.detectChanges();
      return;
    }
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const randomWord = availableWords[randomIndex];

    this.usedWords[this.currentLevel].push(randomWord.word);

    this.currentQuestion = randomWord.description;
    this.correctAnswer = randomWord.word.toUpperCase();

    this.guessedLetters = [];
    this.wrongLetters = [];
    this.mistakes = 0;
    this.isGameOver = false;
    this.isWin = false;
    this.currentCatImage = HangmanImage.MOUSE1;

    this.updateDisplayedWord();
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
