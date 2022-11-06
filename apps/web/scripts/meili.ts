import environment from 'environment';
import searchClient from 'meilisearch';

declare global {
  var meili: searchClient | undefined;
}

let client = (globalThis.meili || undefined) as searchClient;
client = globalThis.meili || new searchClient({ host: environment.searchUrl });
globalThis.meili = client;
client
  .index('classes')
  .updateSearchableAttributes([
    'subject.slug',
    'number',
    'name',
    'subject.name',
    'equivalencies',
    'sections.instructor',
    'sections.number',
    'sections.room',
  ]);
client.index('classes').updateSettings({ filterableAttributes: ['subject.schoolId', 'subject.slug'] });
client.index('classes').updateDistinctAttribute('name');

export { client as searchClient };
export * from 'meilisearch';
