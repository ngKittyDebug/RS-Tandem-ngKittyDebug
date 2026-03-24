import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSettings } from './profile-settings';
import { TranslocoTestingModule } from '@jsverse/transloco';

describe('ProfileSettings', () => {
  let component: ProfileSettings;
  let fixture: ComponentFixture<ProfileSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProfileSettings,
        TranslocoTestingModule.forRoot({
          langs: { en: {}, ru: {} },
          translocoConfig: {
            availableLangs: ['ru', 'en'],
            defaultLang: 'ru',
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
