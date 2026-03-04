import { TestBed } from '@angular/core/testing';

import { AppErrorService } from './app-error-service';
import { of } from 'rxjs';
import { TuiAlertService } from '@taiga-ui/core';
import { ErrorTosterAppearances, ErrorTosterLabels } from '../../shared/constants/enum';

describe('AppErrorService', () => {
  let service: AppErrorService;

  const alertServiceMock = {
    open: vi.fn().mockReturnValue(of({})),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppErrorService, { provide: TuiAlertService, useValue: alertServiceMock }],
    });
    service = TestBed.inject(AppErrorService);
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call open with success parameters when showPositiveToster', () => {
    const message = 'Positive!';
    service.showPositiveToster(message);

    expect(alertServiceMock.open).toHaveBeenCalledWith(message, {
      label: ErrorTosterLabels.Positive,
      appearance: ErrorTosterAppearances.Positive,
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
