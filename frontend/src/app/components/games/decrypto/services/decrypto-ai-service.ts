import { Injectable } from '@angular/core';
import { HfInference } from '@huggingface/inference';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DecryptoAiService {
  private hf = new HfInference('');

  public chatWithQwen(userMessage: string): Observable<string> {
    // Оборачиваем вызов в Observable
    const promise = this.hf.chatCompletion({
      model: 'Qwen/Qwen3-32B',
      messages: [
        {
          role: 'system',
          content: 'Отвечай прямо и кратко. Не используй теги <think>.',
        },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 1500,
      temperature: 0.1, // Низкая температура делает ответ более конкретным и менее творческим
    });

    return from(promise).pipe(
      map((response) => {
        const fullText = response?.choices?.[0]?.message?.content ?? '';
        const answer = fullText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        // Регулярное выражение удаляет всё между <think> и </think>, включая сами теги
        // Флаг 's' (dotAll) позволяет точке соответствовать символам переноса строки
        // return fullText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        return answer
          .replace(/```/g, '')
          .replace(/^\s*javascript\s*/i, '')
          .trim();
        // return answer;
      }),
      catchError((err) => {
        console.error('Ошибка API:', err);
        return throwError(() => new Error('Не удалось получить ответ от ИИ'));
      }),
    );
  }
}
