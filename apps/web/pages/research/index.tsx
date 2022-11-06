import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Cookies from 'cookies';
import { client } from 'prismas';
import A from '../../components/general/link';

export default function Explore({ subjects, college }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <main>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="pb-24 pt-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Research Subjects at {college.name}</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-gray-500">See which class would be the best for YOU!</p>
        </div>

        {/* Product grid */}
        <section aria-labelledby="subjects-heading" className="mt-8">
          <h2 id="subjects-heading" className="sr-only">
            Subjects
          </h2>
          <div>
            {subjects.map(s => (
              <A key={s.id} href={`/research/${s.slug}`}>
                <div>
                  <h3>{s.slug}</h3>
                  <p>{s.name}</p>
                </div>
              </A>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req, res } = context;
  const cookies = new Cookies(req, res);
  const college = JSON.parse(Buffer.from(cookies.get('college') || '', 'base64').toString('utf-8')) || defaultCollege;

  const subjectCount = await client.subject.count({ where: { schoolId: college.id } });
  const subjects = await client.subject.findMany({
    where: { schoolId: college.id },
    skip: Math.floor(Math.random() * (subjectCount - 20)),
    take: 20,
  });
  subjects.forEach(c => (c.createdAt = JSON.stringify(c.createdAt) as unknown as Date));

  return {
    props: { subjects, college },
  };
}

const defaultCollege = {
  name: 'The University of North Carolina at Chapel Hill',
  id: 'U2Nob29sLTEyMzI=',
};
