export function getUrl(...paths: string[]): string {
  return [import.meta.env['NG_APP_API_URL'], ...paths].join('');
}
