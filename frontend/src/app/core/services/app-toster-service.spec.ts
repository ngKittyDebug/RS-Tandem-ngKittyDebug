import { TestBed } from '@angular/core/testing';

import { AppTosterService, TosterAppearances, TosterLabels } from './app-toster-service';
import { of } from 'rxjs';
import { TuiAlertService } from '@taiga-ui/core';

describe('AppTosterService', () => {
  let service: AppTosterService;

  const alertServiceMock = {
    open: vi.fn().mockReturnValue(of({})),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppTosterService, { provide: TuiAlertService, useValue: alertServiceMock }],
    });
    service = TestBed.inject(AppTosterService);
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call open with success parameters when showPositiveToster', () => {
    const message = 'Positive!';
    service.showPositiveToster(message);

    expect(alertServiceMock.open).toHaveBeenCalledWith(message, {
      label: TosterLabels.Positive,
      appearance: TosterAppearances.Positive,
      autoClose: 4000,
    });
  });

  it('should call open with success parameters when showWarningToster', () => {
    const message = 'Warning!';
    service.showWarningToster(message);

    expect(alertServiceMock.open).toHaveBeenCalledWith(message, {
      label: TosterLabels.Warning,
      appearance: TosterAppearances.Warning,
      autoClose: 4000,
    });
  });

  it('should call open with success parameters when showErrorToster', () => {
    const message = 'Error!';
    service.showErrorToster(message);

    expect(alertServiceMock.open).toHaveBeenCalledWith(message, {
      label: TosterLabels.Error,
      appearance: TosterAppearances.Error,
      autoClose: 4000,
    });
  });

  it('must call subscribe on the returned Observable', () => {
    const subscribeSpy = vi.fn();
    alertServiceMock.open.mockReturnValue({ subscribe: subscribeSpy });
    service.showErrorToster('Error');

    expect(subscribeSpy).toHaveBeenCalled();
  });
});
