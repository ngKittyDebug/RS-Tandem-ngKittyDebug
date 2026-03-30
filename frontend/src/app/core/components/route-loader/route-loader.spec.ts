import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';

import { RouteLoader } from './route-loader';
import { RouteLoaderService } from '../../services/route-loader/route-loader-service';

describe('RouteLoader', () => {
  let component: RouteLoader;
  let fixture: ComponentFixture<RouteLoader>;
  let isLoading: WritableSignal<boolean>;

  beforeEach(async () => {
    isLoading = signal(false);

    await TestBed.configureTestingModule({
      imports: [RouteLoader],
      providers: [
        {
          provide: RouteLoaderService,
          useValue: { isLoading },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RouteLoader);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render loader when route loading is inactive', () => {
    const hostElement: HTMLElement = fixture.nativeElement;

    expect(hostElement.querySelector('.route-loader')).toBeNull();
    expect(hostElement.querySelector('app-loader')).toBeNull();
  });

  it('should render page loader when route loading is active', () => {
    isLoading.set(true);
    fixture.detectChanges();

    const hostElement: HTMLElement = fixture.nativeElement;

    expect(hostElement.querySelector('.route-loader')).toBeTruthy();
    expect(hostElement.querySelector('app-loader')).toBeTruthy();
    expect(hostElement.querySelector('.loader_page')).toBeTruthy();
  });

  it('should react to route loading state changes', () => {
    const hostElement: HTMLElement = fixture.nativeElement;

    expect(hostElement.querySelector('.route-loader')).toBeNull();

    isLoading.set(true);
    fixture.detectChanges();
    expect(hostElement.querySelector('.route-loader')).toBeTruthy();

    isLoading.set(false);
    fixture.detectChanges();
    expect(hostElement.querySelector('.route-loader')).toBeNull();
  });
});
