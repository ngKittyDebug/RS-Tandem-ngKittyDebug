import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiTextfield } from '@taiga-ui/core';
import { TuiTree, TuiDataListWrapper } from '@taiga-ui/kit';
import data from '../../mock-data/mock-data.json';
import { Data, Word } from '../../models/data.interface';
import { TuiSelect } from '@taiga-ui/kit';

@Component({
  selector: 'app-theory',
  imports: [TuiTree, FormsModule, TuiTextfield, TuiDataListWrapper, TuiSelect],
  templateUrl: './theory.html',
  styleUrl: './theory.scss',
})
export class Theory {
  private readonly data: Data[] = data.mockData;
  protected readonly categories = this.data.map((g) => g.category);
  protected selectedCategory = this.categories[0];

  protected get filteredWords(): Word[] {
    return this.data.find((g) => g.category === this.selectedCategory)?.words ?? [];
  }
}
