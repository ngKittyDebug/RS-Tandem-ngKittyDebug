import { Component, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { GitHubData, GitHubs, AiData, AiAssistants } from './cards/github';
import { GithubCards } from './components/github-cards/github-cards';
import { AiCards } from './components/ai-cards/ai-cards';

@Component({
  selector: 'app-about',
  imports: [TranslocoDirective, GithubCards, AiCards],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  public readonly gitHubData = signal<GitHubData[]>(GitHubs);
  public readonly aiAssistants = signal<AiData[]>(AiAssistants);
}
