import * as versions from './versions.json';

export const environment = {
  production: false,
  name: 'development',
  frontendUrl: 'http://localhost:8080',
  apiUrl: 'http://localhost:8080/api',
  contentUrl: 'http://localhost:4566/ratemyclasses',
  rmpUrl: 'http://localhost:3000',
  lookupUrl: 'http://localhost:8000',
  version: versions.web.development,
};
