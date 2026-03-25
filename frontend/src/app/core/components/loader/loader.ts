import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LOADER_MODE, LOADER_SIZES, LoaderModes } from './constants/loader.constants';

@Component({
  selector: 'app-loader',
  imports: [],
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--app-loader-size]': 'resolvedSize()',
  },
})
export class Loader {
  public readonly mode = input<LoaderModes>(LOADER_MODE.PAGE);
  public readonly size = input<string | null>(null);

  protected readonly resolvedSize = computed(() => this.size() ?? LOADER_SIZES[this.mode()]);
}
