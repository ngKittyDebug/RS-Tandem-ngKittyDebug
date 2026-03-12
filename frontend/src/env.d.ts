interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly NG_APP_API_URL: string;
  [key: string]: string | undefined;
}
