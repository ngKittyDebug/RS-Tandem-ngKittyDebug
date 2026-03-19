import { Directive, ElementRef, inject, HostListener } from '@angular/core';

@Directive({
  selector: '[appDataPupil]',
  standalone: true,
})
export class EyeCompassDirective {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private animationFrameId = 0;

  @HostListener('document:mousemove', ['$event'])
  public mouseMoveHandler = (e: MouseEvent): void => {
    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(() => {
        this.updateEye(e.clientX, e.clientY);
        this.animationFrameId = 0;
      });
    }
  };

  private updateEye(mouseX: number, mouseY: number): void {
    const rects = this.el.nativeElement.getBoundingClientRect();

    const rect = rects;
    const eyeX = rect.left + rect.width / 2;
    const eyeY = rect.top + rect.height / 2;

    const dx = mouseX - eyeX;
    const dy = mouseY - eyeY;

    const angle = Math.atan2(dy, dx);
    const distance = 7;

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    this.el.nativeElement.style.transform = `translate(${x}px, ${y}px)`;
  }
}
