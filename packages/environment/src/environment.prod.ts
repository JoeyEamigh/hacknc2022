import * as versions from './versions.json';

export const environment = {
  production: true,
  name: 'production',
  frontendUrl: 'https://ratemyclasses.tech',
  apiUrl: 'https://api.ratemyclasses.tech',
  contentUrl: 'https://content.ratemyclasses.tech',
  rmpUrl: 'https://rmp.ratemyclasses.tech',
  lookupUrl: 'https://lookup.ratemyclasses.tech',
  version: versions.web.production,
};
