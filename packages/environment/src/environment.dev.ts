import * as versions from './versions.json';

export const environment = {
  production: false,
  name: 'development',
  frontendUrl: 'http://127.0.0.1:8080',
  apiUrl: 'https://127.0.0.1:1234',
  contentUrl: 'https://127.0.0.1:4566/ratemyclasses',
  version: versions.web.development,
};
