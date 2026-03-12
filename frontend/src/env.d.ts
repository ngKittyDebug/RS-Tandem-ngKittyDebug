interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly NG_APP_API_URL: string;
  // Добавляй новые переменные сюда по мере необходимости
  [key: string]: string | undefined;
}
