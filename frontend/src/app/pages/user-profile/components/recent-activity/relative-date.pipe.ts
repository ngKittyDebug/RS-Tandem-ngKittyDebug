import { Pipe, PipeTransform } from '@angular/core';
import { formatRelativeDate } from '../../utils/date.util';

@Pipe({
  name: 'relativeDate',
  standalone: true,
})
export class RelativeDatePipe implements PipeTransform {
  public transform(value: string | Date, lang: string): string {
    return formatRelativeDate(value, lang);
  }
}
