import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCatIndicator } from './game-cat-indicator';

class FakeAudio {
  public play = vi.fn(() => Promise.resolve());
  public pause = vi.fn();
  public currentTime = 0;
  public loop = false;
  public preload = '';
  public volume = 1;
}

describe('GameCatIndicator', () => {
  let component: GameCatIndicator;
  let fixture: ComponentFixture<GameCatIndicator>;
  let audio: FakeAudio;
  let AudioMock: ReturnType<typeof vi.fn>;

  const getCat = (): SVGElement => fixture.nativeElement.querySelector('svg');

  beforeEach(async () => {
    vi.useFakeTimers();

    audio = new FakeAudio();
    AudioMock = vi.fn(() => audio as unknown as HTMLAudioElement);
    vi.stubGlobal('Audio', AudioMock);

    await TestBed.configureTestingModule({
      imports: [GameCatIndicator],
    }).compileComponents();

    fixture = TestBed.createComponent(GameCatIndicator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders sleeping state by default', () => {
    expect(getCat().classList.contains('cat--sleep')).toBe(true);
    expect(getCat().classList.contains('cat--awake')).toBe(false);
  });

  it('renders awake state when isChecking=true', () => {
    fixture.componentRef.setInput('isChecking', true);
    fixture.detectChanges();

    expect(getCat().classList.contains('cat--awake')).toBe(true);
    expect(getCat().classList.contains('cat--sleep')).toBe(false);
  });
});
