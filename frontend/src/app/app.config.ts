import { provideEventPlugins } from '@taiga-ui/event-plugins';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  isDevMode,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslocoPersistLang } from '@jsverse/transloco-persist-lang';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';
import { AuthService } from './core/services/auth/auth-service';
import { catchError, of, switchMap } from 'rxjs';
import { authInterceptor } from './core/services/auth/auth-interceptor';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import localeEn from '@angular/common/locales/en';
import { UserStore } from './core/stores/user-store/user-store';
import { provideHighlightOptions } from 'ngx-highlightjs';

registerLocaleData(localeRu);
registerLocaleData(localeEn);

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideEventPlugins(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideTransloco({
      config: {
        availableLangs: ['ru', 'en'],
        defaultLang: 'ru',
        fallbackLang: 'ru',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: {
          useFallbackTranslation: true,
        },
      },
      loader: TranslocoHttpLoader,
    }),
    provideTranslocoPersistLang({
      storage: {
        useFactory: () => localStorage,
      },
    }),
    provideHighlightOptions({
      coreLibraryLoader: () => import('highlight.js/lib/core'),
      lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'),
      languages: {
        typescript: () => import('highlight.js/lib/languages/typescript'),
      },
    }),
    provideAppInitializer(() => {
      const authService = inject(AuthService);

      const userStore = inject(UserStore);
      return authService.refresh().pipe(
        switchMap(() => {
          if (!authService.isLoggedIn()) {
            return of(void 0);
          }

          return userStore.loadUser();
        }),
        catchError(() => of(void 0)),
      );
    }),
  ],
};
