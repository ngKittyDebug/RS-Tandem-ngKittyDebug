import { Component } from '@angular/core';
import { EyeCompassDirective } from '../../../../core/directive/eye-compass.directive';

@Component({
  selector: 'app-img-cat',
  imports: [EyeCompassDirective],
  templateUrl: './img-cat.html',
  styleUrl: './img-cat.scss',
})
export class ImgCat {}
