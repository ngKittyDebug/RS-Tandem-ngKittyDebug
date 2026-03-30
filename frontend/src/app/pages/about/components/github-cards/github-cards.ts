import { Component, input } from '@angular/core';
import { GitHubData } from '../../cards/github';
import { TranslocoDirective } from '@jsverse/transloco';
import { TuiAvatar, TuiBadge } from '@taiga-ui/kit';

@Component({
  selector: 'app-github-cards',
  imports: [TranslocoDirective, TuiAvatar, TuiBadge],
  templateUrl: './github-cards.html',
  styleUrl: './github-cards.scss',
})
export class GithubCards {
  public readonly gitHubSignal = input.required<GitHubData>();
}
