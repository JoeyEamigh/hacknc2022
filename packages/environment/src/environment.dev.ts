import * as versions from './versions.json';

export const environment = {
  production: false,
  name: 'development',
  frontendUrl: 'http://localhost:8080',
  apiUrl: 'https://localhost:1234',
  contentUrl: 'https://localhost:4566/ratemyclasses',
  version: versions.web.development,
};
