import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentActivity } from './recent-activity';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('RecentActivity', () => {
  let component: RecentActivity;
  let fixture: ComponentFixture<RecentActivity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RecentActivity,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentActivity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show empty state when stats are empty', () => {
    fixture.componentRef.setInput('stats', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.no-activity-text')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.no-activity-image')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.activity-item')).toBeNull();
  });

  it('should render activity items when stats are provided', () => {
    fixture.componentRef.setInput('stats', [
      {
        gameType: 'decrypto',
        playedCount: 2,
        updatedAt: '2026-03-29T00:00:00.000Z',
      },
      {
        gameType: 'mergeGame',
        playedCount: 1,
        updatedAt: '2026-03-28T00:00:00.000Z',
      },
    ]);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.activity-item');

    expect(items.length).toBe(2);
    expect(fixture.nativeElement.querySelector('.no-activity-text')).toBeNull();
  });
});
