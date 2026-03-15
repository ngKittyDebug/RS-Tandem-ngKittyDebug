import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

console.info(`[MeowVault] API_URL: ${import.meta.env?.['NG_APP_API_URL']}`);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
