import { Directive, ElementRef, AfterViewInit, inject } from '@angular/core';

@Directive({
  selector: '[appEyeCompass]',
  standalone: true,
})
export class EyeCompassDirective implements AfterViewInit {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  public ngAfterViewInit(): void {
    const pupils = this.el.nativeElement.querySelectorAll<SVGElement>('[data-pupil]');
    document.addEventListener('mousemove', (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      pupils.forEach((pupil) => {
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
    });
  }
}
