export const LOADER_MODE = {
  PAGE: 'page',
  INLINE: 'inline',
} as const;

export type LoaderModes = (typeof LOADER_MODE)[keyof typeof LOADER_MODE];

export const LOADER_SIZES: Record<LoaderModes, string> = {
  page: '15rem',
  inline: '3rem',
};
