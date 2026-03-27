import { Component, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { GitHubData, GitHubs } from './cards/github';
import { GithubCards } from './components/github-cards/github-cards';

@Component({
  selector: 'app-about',
  imports: [TranslocoDirective, GithubCards],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  public readonly gitHubData = signal<GitHubData[]>(GitHubs);
}
