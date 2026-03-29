import { inject, Injectable } from '@angular/core';
import { KeyStorageService } from '../../../../core/services/key-storage/key-storage-service';
import { Task } from '../models/task.interface';
import { map, Observable } from 'rxjs';

interface EventLoopGameData {
  tasks: Task[];
}

const EVENT_LOOP_DATA_KEY = 'event-loop-data';
const dataToServer = {
  key: EVENT_LOOP_DATA_KEY,
  storage: { tasks: [] },
};

@Injectable({
  providedIn: 'root',
})
export class EventLoopGameApiService {
  private readonly storage = inject(KeyStorageService<EventLoopGameData>);

  public getTasks(): Observable<Task[]> {
    return this.storage
      .getData(dataToServer)
      .pipe(map((response) => response.storage?.tasks ?? []));
  }
}
