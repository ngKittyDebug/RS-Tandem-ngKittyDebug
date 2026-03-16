import { Directive, ElementRef, AfterViewInit, inject, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appEyeCompass]',
  standalone: true,
})
export class EyeCompassDirective implements AfterViewInit, OnDestroy {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);

  private mouseMoveHandler = (e: MouseEvent): void => {
    const pupils = this.el.nativeElement.querySelectorAll<SVGElement>('[data-pupil]');
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    pupils.forEach((pupil): void => {
      const rect = pupil.getBoundingClientRect();

      const eyeX = rect.left + rect.width / 2;
      const eyeY = rect.top + rect.height / 2;

      const dx = mouseX - eyeX;
      const dy = mouseY - eyeY;

      const angle = Math.atan2(dy, dx);
      const distance = 7;

      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      pupil.style.transform = `translate(${x}px, ${y}px)`;
    });
  };

  public ngAfterViewInit(): void {
    document.addEventListener('mousemove', this.mouseMoveHandler);
  }

  public ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.mouseMoveHandler);
  }
}
