import { Component } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { TuiLink } from '@taiga-ui/core';
@Component({
  selector: 'app-not-found',
  imports: [TuiLink],
  standalone: true,
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
