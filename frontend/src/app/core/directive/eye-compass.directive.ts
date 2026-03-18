import { Directive, ElementRef, AfterViewInit, inject, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appEyeCompass]',
  standalone: true,
})
export class EyeCompassDirective implements AfterViewInit, OnDestroy {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private pupils?: NodeListOf<SVGElement>;
  private animationFrameId = 0;
  private mouseX = 0;
  private mouseY = 0;

  public ngAfterViewInit(): void {
    this.pupils = this.el.nativeElement.querySelectorAll<SVGElement>('[data-pupil]');
    document.addEventListener('mousemove', this.mouseMoveHandler);
  }
  public ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.mouseMoveHandler);
  }

  private mouseMoveHandler = (e: MouseEvent): void => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(() => {
        this.updateEyes();
        this.animationFrameId = 0;
      });
    }
  };

  private updateEyes(): void {
    if (!this.pupils) return;

    const rects = Array.from(this.pupils).map((pupil) => pupil.getBoundingClientRect());
    this.pupils.forEach((pupil, i) => {
      const rect = rects[i];
      const eyeX = rect.left + rect.width / 2;
      const eyeY = rect.top + rect.height / 2;

      const dx = this.mouseX - eyeX;
      const dy = this.mouseY - eyeY;

      const angle = Math.atan2(dy, dx);
      const distance = 7;

      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      pupil.style.transform = `translate(${x}px, ${y}px)`;
    });
  }
}
