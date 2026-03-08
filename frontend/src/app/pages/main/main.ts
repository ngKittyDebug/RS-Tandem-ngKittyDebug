import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiTitle } from '@taiga-ui/core';
import { TuiLink } from '@taiga-ui/core';
import { TuiElasticContainer } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';

@Component({
  standalone: true,
  selector: 'app-main',
  imports: [TuiHeader, TuiTitle, TuiElasticContainer, TuiLink],
  templateUrl: './main.html',
  styleUrls: ['./main.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Main {
  protected readonly more =
    "MeowVault is a system helping students to prepare for their FrontEnd interviews. It conists of funny games, playing which helps them practice their skills in a fun and engaging way. MeowVault is a soft and comfortable way to learn, as soft as a cat's paws which is the symbol of our project. We believe that learning should be enjoyable and stress-free, just like the gentle touch of a cat's paws. So, get ready to have fun while sharpening your FrontEnd skills with MeowVault!";

  protected readonly less =
    'MeowVault is a system helping students to prepare for their FrontEnd interviews. It conists of funny games, playing which helps them practice their skills in a fun and engaging way.';

  protected current = this.less;

  protected toggle(): void {
    this.current = this.current === this.less ? this.more : this.less;
  }
}
