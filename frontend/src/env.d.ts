interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly NG_APP_API_URL: string;
  readonly NG_APP_CLOUDINARY_CLOUD_NAME: string;
  readonly NG_APP_CLOUDINARY_UPLOAD_PRESET: string;
  readonly NG_APP_CLOUDINARY_UPLOAD_URL: string;
  [key: string]: string | undefined;
}
