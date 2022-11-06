import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Cookies from 'cookies';
import { client, Term } from 'prismas';
import A from '../../components/general/link';
import { Sidebar } from '.';
import { getCurrentTerm } from 'shared';

export default function ResearchSubject({
  college,
  classes,
  subject,
  subjects,
  term,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Sidebar subjects={subjects} term={term} />
      <main className="pb-24 lg:pl-64">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-16">
          <div className="pb-12 text-center lg:pt-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              {subject.name ? subject.name : subject.slug}
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base text-gray-500">See which class would be the best for YOU!</p>
          </div>

          {/* Product grid */}
          <section aria-labelledby="classes-heading">
            <h2 id="classes-heading" className="sr-only">
              Classes
            </h2>
            <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {classes.map(c => (
                <A key={c.id} href={`/class/${c.id}`}>
                  <div className="flex h-full flex-row overflow-hidden rounded-md border border-gray-100 p-4 shadow-md hover:shadow-lg">
                    <div className="mr-4 flex aspect-[1] h-full items-center justify-center rounded-md bg-green-300 p-2 text-center text-3xl font-bold">
                      5.0
                    </div>
                    <div className="grow">
                      <h3 className="text-2xl font-medium">
                        {subject.slug} {c.number}
                      </h3>
                      <p>{c.name}</p>
                    </div>
                  </div>
                </A>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req, res } = context;
  const cookies = new Cookies(req, res);
  let college = JSON.parse(Buffer.from(cookies?.get('college') || '', 'base64')?.toString('utf-8') || '{}');
  if (!college?.id) college = defaultCollege;
  const term: Term = cookies?.get('term') || getCurrentTerm();

  const subject = await client.subject.findUnique({
    where: { slug_schoolId: { schoolId: college.id, slug: String(context.params.subject) } },
  });
  subject.createdAt = String(subject.createdAt) as unknown as Date;
  const classes = await client.class.findMany({
    where: { subject: { schoolId: college.id, slug: String(context.params.subject) }, term },
    include: { sections: true, _count: true },
    orderBy: { number: 'asc' },
  });

  classes.forEach(c => {
    c.createdAt = JSON.stringify(c.createdAt) as unknown as Date;
    c.sections.forEach(s => (s.createdAt = JSON.stringify(s.createdAt) as unknown as Date));
  });

  const subjects = (await prisma.subject.findMany({ where: { schoolId: college.id }, distinct: ['slug'] })).map(
    s => s.slug,
  );

  return {
    props: { college, classes, subject, subjects, term },
  };
}

const defaultCollege = {
  name: 'The University of North Carolina at Chapel Hill',
  id: 'U2Nob29sLTEyMzI=',
};
