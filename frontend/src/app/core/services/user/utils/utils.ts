export function getUrl(baseUrl: string, ...paths: string[]): string {
  return [baseUrl, ...paths].join('');
}
