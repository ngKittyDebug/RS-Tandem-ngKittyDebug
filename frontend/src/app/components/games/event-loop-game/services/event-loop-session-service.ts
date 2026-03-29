import { Injectable } from '@angular/core';
import { Task } from '../models/task.interface';
import { Difficulty } from '../models/task.enum';
import { shuffle } from '../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class EventLoopSessionService {
  public createSession(tasks: Task[], countPerDifficulty: number): Task[] {
    const easy = this.pickTasksByDifficulty(tasks, Difficulty.EASY, countPerDifficulty);
    const medium = this.pickTasksByDifficulty(tasks, Difficulty.MEDIUM, countPerDifficulty);
    const hard = this.pickTasksByDifficulty(tasks, Difficulty.HARD, countPerDifficulty);

    return [...easy, ...medium, ...hard];
  }

  private pickTasksByDifficulty(tasks: Task[], difficulty: Difficulty, count: number): Task[] {
    return shuffle(tasks.filter((task) => task.difficulty === difficulty)).slice(0, count);
  }
}
