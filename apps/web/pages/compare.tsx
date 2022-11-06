import { PlusIcon, StarIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Cookies from 'cookies';
import { ClassAggregations, client, Term } from 'prismas';
import A from '../components/general/link';
import { getCurrentTerm, classes as joinCSS, cloneDeep } from 'shared';
import Meta from '../components/meta/meta';
import { useEffect, useState } from 'react';
import cookie from 'js-cookie';
import { useRouter } from 'next/router';

export default function Compare({ classes }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
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
      <Meta title="Compare Classes" />
      <main className="pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-16">
          <div className="pb-12 text-center lg:pt-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Compare Classes</h1>
            {classes.length === 0 ? (
              <p className="mx-auto mt-4 max-w-3xl text-base text-gray-500">
                Hit the plus in the top right of any class on the Research page to get started!
              </p>
            ) : null}
          </div>

          {/* Product grid */}
          <section aria-labelledby="classes-heading">
            <h2 id="classes-heading" className="sr-only">
              Classes
            </h2>
            <div className="grid auto-rows-fr grid-cols-1 gap-6 lg:grid-cols-2">
              {classes.map(c => (
                <A key={c.id} href={`/class/${c.id}`}>
                  <div className="relative flex h-full flex-col overflow-hidden rounded-md border border-gray-100 p-4 shadow-md hover:shadow-lg">
                    <button
                      onClick={e => handleAddClass(e, c)}
                      className={joinCSS(
                        'absolute top-4 right-4 cursor-pointer font-semibold text-gray-400',
                        myClasses.includes(c.id) ? 'hover:text-red-500' : 'hover:text-green-500',
                      )}
                      title="Remove from Compare">
                      {myClasses.includes(c.id) ? <XMarkIcon className="h-6 w-6" /> : <PlusIcon className="h-6 w-6" />}
                    </button>
                    <div className="flex flex-row ">
                      <div
                        className={joinCSS(
                          colors[
                            Math.round(
                              c.aggregations?.numRatings ? c.aggregations?.rating / c.aggregations?.numRatings : 6,
                            )
                          ],
                          'mr-4 flex aspect-[1] h-full items-center justify-center rounded-md p-2 text-center text-3xl font-bold',
                        )}>
                        {c.aggregations?.numRatings
                          ? (c.aggregations?.rating / c.aggregations?.numRatings || 0).toFixed(1)
                          : 'N/A'}
                      </div>
                      <div className="grow">
                        <h3 className="text-2xl font-semibold">
                          {c.subject.slug} {c.number}
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
                    <div className="mt-6">
                      <h3 className="sr-only">Review data</h3>
                      <dl className="space-y-3">
                        {[0, 1, 2, 3, 4].reverse().map(count => (
                          <div key={count} className="flex items-center text-sm">
                            <dt className="flex flex-1 items-center">
                              <p className="w-2 font-medium text-gray-900">
                                {c.aggregations[translateNumbersToStars(count)]}
                                <span className="sr-only"> star reviews</span>
                              </p>
                              <div aria-hidden="true" className="ml-1 flex flex-1 items-center">
                                <StarIcon
                                  className={joinCSS(
                                    c.aggregations[translateNumbersToStars(count)] > 0
                                      ? 'text-yellow-400'
                                      : 'text-gray-300',
                                    'h-5 w-5 flex-shrink-0',
                                  )}
                                  aria-hidden="true"
                                />
                                <div className="relative ml-3 flex-1">
                                  <div className="h-3 rounded-full border border-gray-200 bg-gray-100" />
                                  {c.aggregations[translateNumbersToStars(count)] > 0 ? (
                                    <div
                                      className="absolute inset-y-0 rounded-full border border-yellow-400 bg-yellow-400"
                                      style={{
                                        width: `calc(${c.aggregations[translateNumbersToStars(count)]} / ${
                                          c.aggregations.numRatings
                                        } * 100%)`,
                                      }}
                                    />
                                  ) : null}
                                </div>
                              </div>
                            </dt>
                            <dd className="ml-2 w-8 text-right text-sm tabular-nums text-gray-900">
                              {Math.round(
                                (c.aggregations[translateNumbersToStars(count)] / c.aggregations.numRatings) * 100,
                              ) || 0}
                              %
                            </dd>
                          </div>
                        ))}
                      </dl>
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
    router.reload();
  }
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req, res } = context;
  const cookies = new Cookies(req, res);
  let college = JSON.parse(Buffer.from(cookies?.get('college') || '', 'base64')?.toString('utf-8') || '{}');
  if (!college?.id) college = defaultCollege;
  const term: Term = cookies?.get('term') || getCurrentTerm();

  const classIds = JSON.parse(unescape(cookies?.get('classes') || '') || '[]');
  const classes = await Promise.all(
    classIds.map(id => client.class.findUnique({ where: { id }, include: { aggregations: true, subject: true } })),
  );

  classes.forEach(c => {
    if (!c?.aggregations?.numRatings) {
      c.aggregations = {
        numRatings: 0,
        rating: 0,
        difficulty: 0,
        wouldRecommend: 0,
        totalFive: 0,
        totalFour: 0,
        totalThree: 0,
        totalTwo: 0,
        totalOne: 0,
      } as ClassAggregations;
    }
  });

  return {
    props: {
      college: cloneDeep(college),
      classes: cloneDeep(classes),
      term: cloneDeep(term),
    },
  };
}

const defaultCollege = {
  name: 'The University of North Carolina at Chapel Hill',
  id: 'U2Nob29sLTEyMzI=',
};

function translateNumbersToStars(number: number) {
  switch (number) {
    case 0:
      return 'totalOne';
    case 1:
      return 'totalTwo';
    case 2:
      return 'totalThree';
    case 3:
      return 'totalFour';
    case 4:
      return 'totalFive';
  }
}
