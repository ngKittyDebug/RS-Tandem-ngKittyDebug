import { Component, input } from '@angular/core';
import { GitHubData } from '../../cards/github';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-github-cards',
  imports: [TranslocoDirective],
  templateUrl: './github-cards.html',
  styleUrl: './github-cards.scss',
})
export class GithubCards {
  public readonly gitHubSignal = input.required<GitHubData>();
}
