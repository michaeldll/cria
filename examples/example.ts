import "./scss/global.scss";

import './cubes';

// Enable esbuild hot reloading in development
type Window = typeof window & { IS_PRODUCTION: boolean };
if (!(window as Window).IS_PRODUCTION) {
  new EventSource('/esbuild').addEventListener('change', () => location.reload())
};