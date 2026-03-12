import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

if (import.meta.env['MODE'] === 'development') {
  console.info('[MeowVault] API_URL from env:', import.meta.env['NG_APP_API_URL']);
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
