import { TestBed } from '@angular/core/testing';
import { TuiDialogService, TuiDialogOptions } from '@taiga-ui/core';
import { of } from 'rxjs';
import { expect, it, describe, vi, beforeEach, MockInstance } from 'vitest';
import { POPUP_SIZES } from './models/popup.enum';
import { PopupService } from './popup-service';

describe('PopupService', () => {
  let service: PopupService;
  const dialogServiceMock: Partial<Record<keyof TuiDialogService, MockInstance>> = {
    open: vi.fn(),
  };

  beforeEach(() => {
    dialogServiceMock.open?.mockReturnValue(of({}));

    TestBed.configureTestingModule({
      providers: [PopupService, { provide: TuiDialogService, useValue: dialogServiceMock }],
    });

    service = TestBed.inject(PopupService);
  });

  it('should call dialogs.open with default parameters', () => {
    const content = 'Test Content';

    service.openPopup(content);

    expect(dialogServiceMock.open).toHaveBeenCalledWith(content, {
      label: '',
      appearance: 'flat',
      size: POPUP_SIZES.MEDIUM,
    } as Partial<TuiDialogOptions<unknown>>);
  });

  it('should correctly transmit custom parameters', () => {
    const content = 'Custom Content';
    const label = 'My Label';
    const appearance = 'white-paper';
    const size = POPUP_SIZES.LARGE;
    service.openPopup(content, label, appearance, size);

    expect(dialogServiceMock.open).toHaveBeenCalledWith(content, {
      label,
      appearance,
      size,
    });
  });
});
