import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Cookies from 'cookies';
import { client, Term } from 'prismas';
import A from '../../components/general/link';
import { Sidebar } from '.';
import { getCurrentTerm, classes as joinCSS, cloneDeep } from 'shared';
import { PlusIcon, XMarkIcon } from '@heroicons/react/20/solid';
import cookie from 'js-cookie';
import { useEffect, useState } from 'react';
import Meta from '../../components/meta/meta';

export default function ResearchSubject({
  college,
  classes,
  subject,
  subjects,
  term,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [myClasses, setMyClasses] = useState(JSON.parse(cookie.get('classes') || '[]'));
  const colors = [
    'bg-red-300',
    'bg-red-300',
    'bg-red-300',
    'bg-yellow-300',
    'bg-lime-300',
    'bg-green-300',
    'bg-gray-300',
  ];

  useEffect(() => {
    setMyClasses(JSON.parse(cookie.get('classes') || '[]'));
  }, []);

  return (
    <>
      <Meta title={subject.slug} />
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
            <div className="grid auto-rows-fr grid-cols-1 gap-6 lg:grid-cols-2">
              {classes.map(c => (
                <A key={c.id} href={`/class/${c.id}`}>
                  <div className="relative flex h-full flex-row overflow-hidden rounded-md border border-gray-100 p-4 shadow-md hover:shadow-lg">
                    <button
                      onClick={e => handleAddClass(e, c)}
                      className={joinCSS(
                        'absolute top-4 right-4 cursor-pointer font-semibold text-gray-400',
                        myClasses.includes(c.id) ? 'hover:text-red-500' : 'hover:text-green-500',
                      )}
                      title="Add to Compare">
                      {myClasses.includes(c.id) ? <XMarkIcon className="h-6 w-6" /> : <PlusIcon className="h-6 w-6" />}
                    </button>
                    <div
                      className={joinCSS(
                        colors[
                          Math.round(
                            c.aggregations?.numRatings ? c.aggregations?.cumRating / c.aggregations?.numRatings : 6,
                          )
                        ],
                        'mr-4 flex aspect-[1] h-full items-center justify-center rounded-md p-2 text-center text-3xl font-bold',
                      )}>
                      {c.aggregations?.numRatings
                        ? (c.aggregations?.cumRating / c.aggregations?.numRatings || 0).toFixed(1)
                        : 'N/A'}
                    </div>
                    <div className="grow">
                      <h3 className="text-2xl font-semibold">
                        {subject.slug} {c.number}
                      </h3>
                      <h4 className="text-xl">{c.name}</h4>
                      <p>
                        Difficulty:{' '}
                        <span className="font-semibold">
                          {c.aggregations?.numRatings
                            ? (c.aggregations?.difficulty / c.aggregations?.numRatings || 0).toFixed(1)
                            : 'N/A'}
                        </span>
                      </p>
                      <p>
                        {c.aggregations?.numRatings ? (
                          <>
                            <span className="font-semibold">
                              {Math.round((c.aggregations?.wouldRecommend / c.aggregations?.numRatings || 0) * 100) +
                                '%'}
                            </span>{' '}
                            would recommend
                          </>
                        ) : null}
                      </p>
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

  function handleAddClass(e, c) {
    e.preventDefault();
    e.stopPropagation();
    let nMyClasses = cloneDeep(myClasses);
    if (nMyClasses.includes(c.id)) nMyClasses = nMyClasses.filter(id => id !== c.id);
    else nMyClasses.push(c.id);
    setMyClasses(nMyClasses);
    cookie.set('classes', JSON.stringify(nMyClasses));
  }
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req, res } = context;
  const cookies = new Cookies(req, res);
  let college = JSON.parse(Buffer.from(cookies?.get('college') || '', 'base64')?.toString('utf-8') || '{}');
  if (!college?.id) {
    college = defaultCollege;
    college.id = (await client.school.findUnique({where: {rmpId: college.rmpId}, select: {id: true}})).id;
  }

  const term: Term = cookies?.get('term') || getCurrentTerm();

  const subject = await client.subject.findUnique({
    where: { schoolId_slug: { schoolId: college.id, slug: String(context.params.subject) } },
    include: { classes: true },
  });
  const classes = await client.class.findMany({
    where: { subject: { schoolId: college.id, slug: String(context.params.subject) } },
    include: { sections: true, _count: true, aggregations: true },
    orderBy: { number: 'asc' },
  });

  const subjects = (await prisma.subject.findMany({ where: { schoolId: college.id }, distinct: ['slug'] })).map(
    s => s.slug,
  );

  return {
    props: {
      college: cloneDeep(college),
      classes: cloneDeep(classes),
      subject: cloneDeep(subject),
      subjects: cloneDeep(subjects),
      term: cloneDeep(term),
    },
  };
}

const defaultCollege = {
  name: 'The University of North Carolina at Chapel Hill',
  rmpId: 'U2Nob29sLTEyMzI=',
};
