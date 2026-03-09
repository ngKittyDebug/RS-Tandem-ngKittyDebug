/*
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  // Run Prettier on staged CSS and JSON files
  '*.{css,scss,json,md}': ['npm run format'],
  // Run ESLint and Prettier on all staged JavaScript and TypeScript files
  '*.{js,ts,jsx,tsx}': ['npm run lint', 'npm run format'],
};
