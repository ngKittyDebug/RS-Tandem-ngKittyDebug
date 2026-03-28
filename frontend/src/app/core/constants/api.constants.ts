const rawApiBaseUrl = (import.meta.env['NG_APP_API_URL'] as string | undefined)?.trim();
export const API_BASE_URL = rawApiBaseUrl ? rawApiBaseUrl.replace(/\/+$/, '') : '/api';
export const AUTH_ENDPOINT = '/auth';
export const STORAGE_ENDPOINT = '/key-storage';
