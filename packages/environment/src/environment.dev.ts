import * as versions from './versions.json';

export const environment = {
  production: false,
  name: 'development',
  frontendUrl: 'http://localhost:8080',
  apiUrl: 'http://localhost:8080/api',
  contentUrl: 'http://localhost:4566/ratemyclasses',
  rmpUrl: 'http://127.0.0.1:3000',
  lookupUrl: 'http://127.0.0.1:8000',
  searchUrl: 'http://127.0.0.1:7700',
  version: versions.web.development,
};
