import { Component } from '@angular/core';
import { EyeCompassDirective } from '../../../../../core/directive/eye-compass.directive';

@Component({
  selector: 'app-cat',
  imports: [EyeCompassDirective],
  templateUrl: './cat.html',
  styleUrl: './cat.scss',
})
export class Cat {}
