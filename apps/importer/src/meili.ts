import { MeiliSearch } from 'meilisearch';
import { client } from 'prismas';
const searchClient = new MeiliSearch({ host: 'http://localhost:7700' });

(async () => {
  const classesCount = await client.class.count();

  for (let i = 0; i < classesCount; i += 1000) {
    const classes = await client.class.findMany({
      skip: i,
      take: 1000,
      include: {
        sections: true,
        subject: { include: { school: true } },
      },
    });

    const index = searchClient.index('classes');
    await index.addDocuments(classes);
    index.updateSettings({
      filterableAttributes: ['subject.school.id'],
    });
  }
})();
