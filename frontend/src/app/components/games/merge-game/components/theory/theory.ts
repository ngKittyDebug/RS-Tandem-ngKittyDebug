import { Component, inject, signal, OnInit, computed, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiTextfield } from '@taiga-ui/core';
import { TuiTree, TuiDataListWrapper } from '@taiga-ui/kit';
import { ResponseData, Word } from '../../models/data.interface';
import { TuiSelect } from '@taiga-ui/kit';
import { tap } from 'rxjs';
import { GameService } from '../../services/game-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-theory',
  imports: [TuiTree, FormsModule, TuiTextfield, TuiDataListWrapper, TuiSelect],
  templateUrl: './theory.html',
  styleUrl: './theory.scss',
})
export class Theory implements OnInit {
  private readonly gameService = inject(GameService);
  private readonly destroyRef = inject(DestroyRef);

  private dataResponse = signal<ResponseData>({
    data: [],
    pagination: {
      page: 0,
      limit: 0,
      total: 0,
      totalPages: 0,
    },
  });

  protected categories = computed(() => this.dataResponse().data.map((g) => g.category));
  protected selectedCategory = signal<string>('');

  protected filteredWords = computed<Word[]>(
    () => this.dataResponse().data.find((g) => g.category === this.selectedCategory())?.words ?? [],
  );

  public ngOnInit(): void {
    this.getAllCards();
  }

  public getAllCards(): void {
    this.gameService
      .getAllCards()
      .pipe(
        tap((res: ResponseData) => {
          this.dataResponse.set(res);
          if (res.data.length > 0) {
            this.selectedCategory.set(res.data[0].category);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
