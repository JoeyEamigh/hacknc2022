import { StarIcon } from '@heroicons/react/20/solid';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ClassAggregations, client } from 'prismas';
import { useEffect, useState } from 'react';
import { classes, cloneDeep, capitalize } from 'shared';
import A from '../../components/general/link';
import Meta from '../../components/meta/meta';
import environment from 'environment';

export default function SingleClassView({
  singleClass,
  professors,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const session = useSession();

  return (
    <main className="pt-12 pb-24">
      <Meta title={singleClass.name} />
      <section className="mx-auto flex max-w-3xl flex-col">
        <h1 className="text-center text-3xl font-semibold">
          {singleClass.subject.slug} {singleClass.number}: {singleClass.name}
        </h1>
        {/* <p className="text-center">{singleClass.term}</p> */}
      </section>
      <section className="mx-auto flex max-w-5xl bg-white">
        <div className="mx-auto max-w-2xl px-4 pt-16 sm:px-6 sm:pt-24 lg:grid lg:max-w-7xl lg:grid-cols-12 lg:gap-y-8 lg:gap-x-6 lg:px-8 lg:pt-8">
          <div className="lg:col-span-4">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Student Reviews</h2>

            <div className="mt-3 flex items-center">
              <div>
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map(rating => (
                    <StarIcon
                      key={rating}
                      className={classes(
                        singleClass.aggregations.cumRating / singleClass.aggregations.numRatings > rating
                          ? 'text-yellow-400'
                          : 'text-gray-300',
                        'h-5 w-5 flex-shrink-0',
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="sr-only">
                  {singleClass.aggregations.cumRating / singleClass.aggregations.numRatings} out of 5 stars
                </p>
              </div>
              <p className="ml-2 text-sm text-gray-900">Based on {singleClass.aggregations.numRatings} reviews</p>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Review data</h3>

              <dl className="space-y-3">
                {[0, 1, 2, 3, 4].reverse().map(count => (
                  <div key={count} className="flex items-center text-sm">
                    <dt className="flex flex-1 items-center">
                      <p className="w-3 font-medium text-gray-900">
                        {singleClass.aggregations[translateNumbersToStars(count)]}
                        <span className="sr-only"> star reviews</span>
                      </p>
                      <div aria-hidden="true" className="ml-1 flex flex-1 items-center">
                        <StarIcon
                          className={classes(
                            singleClass.aggregations[translateNumbersToStars(count)] > 0
                              ? 'text-yellow-400'
                              : 'text-gray-300',
                            'h-5 w-5 flex-shrink-0',
                          )}
                          aria-hidden="true"
                        />

                        <div className="relative ml-3 flex-1">
                          <div className="h-3 rounded-full border border-gray-200 bg-gray-100" />
                          {singleClass.aggregations[translateNumbersToStars(count)] > 0 ? (
                            <div
                              className="absolute inset-y-0 rounded-full border border-yellow-400 bg-yellow-400"
                              style={{
                                width: `calc(${singleClass.aggregations[translateNumbersToStars(count)]} / ${
                                  singleClass.aggregations.numRatings
                                } * 100%)`,
                              }}
                            />
                          ) : null}
                        </div>
                      </div>
                    </dt>
                    <dd className="ml-3 w-10 text-right text-sm tabular-nums text-gray-900">
                      {Math.round(
                        (singleClass.aggregations[translateNumbersToStars(count)] /
                          singleClass.aggregations.numRatings) *
                          100,
                      ) || 0}
                      %
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="mt-10">
              <h3 className="text-lg font-medium text-gray-900">Share your thoughts</h3>
              <p className="mt-1 text-sm text-gray-600">
                If you&#39;ve had this class, take a minute and share your thoughts with other students
              </p>
            </div>
          </div>

          <section className="w-full lg:col-span-7 lg:col-start-6">
            {session?.status !== 'authenticated' ? (
              <div className="flex flex-col items-center gap-4">
                <p>You must be logged in to post</p>
                <A
                  href="/login"
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  Login Now
                </A>
              </div>
            ) : (
              <PostComment session={session} />
            )}
          </section>

          <div className="w-full lg:col-span-4 lg:row-start-2">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Recent Professors</h2>
            <div className="flex flex-col space-y-1.5">
              {professors?.map(p =>
                p?.avgRating ? (
                  <A
                    key={p?.id}
                    href={`https://www.ratemyprofessors.com/search/teachers?sid=${p?.school.rmpId}&query=${p?.firstName}+${p?.lastName}`}>
                    <span className="underline">
                      {capitalize(`${p?.firstName} ${p?.lastName}`)}
                    </span>{' '}
                    has a <span className="font-semibold">{p?.avgRating}</span> on RMP
                  </A>
                ) : null,
              )}
            </div>
          </div>
          <div className="mt-16 lg:col-span-7 lg:col-start-6 lg:row-start-2 lg:mt-0">
            <h3 className="sr-only">Recent reviews</h3>
            <div className="flow-root">
              <div className="-my-12 divide-y divide-gray-200">
                {singleClass?.comments?.map(c => (
                  <div key={c.id} className="py-6">
                    <div className="flex items-center">
                      <div className="relative h-12 w-12 overflow-hidden rounded-full">
                        <Image src={c.user?.image} alt="" fill />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-bold text-gray-900">{c.user.name}</h4>
                        <div className="mt-1 flex items-center">
                          {[0, 1, 2, 3, 4].map(rating => (
                            <StarIcon
                              key={rating}
                              className={classes(
                                c.rating > rating ? 'text-yellow-400' : 'text-gray-300',
                                'h-5 w-5 flex-shrink-0',
                              )}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <p className="sr-only">{c.rating} out of 5 stars</p>
                      </div>
                    </div>

                    <pre className="mt-4 space-y-6 text-base italic text-gray-600">{c.text}</pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const singleClass = await client.class.findUnique({
    where: { id: String(context.params.id) },
    include: {
      subject: true,
      sections: {
      	include: {
	  teachers: {
	    include: {
	      school: true,
	    }
	  }
	}
      },
      aggregations: true,
      comments: {
        include: { user: { select: { image: true, name: true } } },
        take: 20,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const professors = singleClass.sections.flatMap(s => s.teachers);

  // const professors = await Promise.all(
  //   Array.from(
  //     singleClass.sections
  //       .map(s => s.instructor)
  //       .reduce((acc, curr) => acc.add(curr), new Set<string>())
  //       .values(),
  //   )
  //     .flatMap(i => i.split(';'))
  //     .map(i => i.split(',').map(s => s.trim()))
  //     .map(async names => {
  //       let lastName = names[0];
  //       let firstName = names[1]?.split(' ')?.[0];

  //       let teacher = await client.teacher.findFirst({
  //         where: { firstName, lastName, schoolId: singleClass.subject.schoolId },
  //         include: { school: true },
  //       });

  //       if (!firstName || !lastName) return null;

  //       if (teacher === null) {
  //         // console.log(
  //         //   `${environment.rmpUrl}/${Buffer.from(singleClass.subject.schoolId, 'base64')
  //         //     .toString('utf-8')
  //         //     .replace(/[^0-9]+/g, '')}/${encodeURIComponent(`${firstName} ${lastName}`).replace('-', '%2D')}`,
  //         // );
  //         // return await(
  //         //   await fetch(
  //         //     `${environment.rmpUrl}/${Buffer.from(singleClass.subject.schoolId, 'base64')
  //         //       .toString('utf-8')
  //         //       .slice(-4)}/${encodeURIComponent(`${firstName} ${lastName}`).replace('-', '%2D')}`,
  //         //   ),
  //         // ).json()[0];
  //       } else {
  //         return teacher;
  //       }
  //     })
  //     .filter(p => p !== null),
  // );

  singleClass.comments?.forEach(c => {
    c.user.name = c.user.name
      .split(' ')
      .map(n => n[0])
      .join('');
  });

  // if (!singleClass?.aggregations?.numRatings) {
  //   singleClass.aggregations = {
  //     numRatings: 0,
  //     rating: 0,
  //     difficulty: 0,
  //     wouldRecommend: 0,
  //     totalFive: 0,
  //     totalFour: 0,
  //     totalThree: 0,
  //     totalTwo: 0,
  //     totalOne: 0,
  //     class: { connect: { id: singleClass.id } },
  //   } as ClassAggregations;
  // }

  return {
    props: { singleClass: cloneDeep(singleClass), professors: cloneDeep(professors) },
  };
}

function PostComment({ session }: { session: ReturnType<typeof useSession> }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [recommend, setRecommend] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) setError('');
  }, [rating, difficulty, recommend, text]);

  return (
    <main className="flex flex-col px-4">
      <section className="mb-4 flex justify-center gap-8">
        <div className="flex flex-col items-center">
          <p>Overall Rating</p>
          <div className="mt-1 flex">
            {[0, 1, 2, 3, 4].map(r => (
              <button key={r} onClick={() => setRating(r + 1)}>
                <StarIcon
                  className={classes(rating >= r + 1 ? 'text-yellow-400' : 'text-gray-300', 'h-6 w-6 flex-shrink-0')}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <p>Difficulty Rating</p>
          <div className="mt-1 flex">
            {[0, 1, 2, 3, 4].map(r => (
              <button key={r} onClick={() => setDifficulty(r + 1)}>
                <StarIcon
                  className={classes(
                    difficulty >= r + 1 ? 'text-yellow-400' : 'text-gray-300',
                    'h-6 w-6 flex-shrink-0',
                  )}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="relative flex items-start pl-8 pb-4">
        <div className="flex h-5 items-center">
          <input
            id="comments"
            aria-describedby="comments-description"
            name="comments"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            checked={recommend}
            onChange={e => setRecommend(e.target.checked)}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="recommendation" className="font-medium text-gray-700">
            Recommendation
          </label>
          <p id="recommendation-description" className="text-gray-500">
            I would recommend this class to someone else.
          </p>
        </div>
      </section>
      <section className="flex flex-row items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="relative inline-block h-10 w-10 overflow-hidden rounded-full">
            <Image src={session?.data?.user?.image} alt="" fill />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <form onSubmit={e => e.preventDefault()} className="relative">
            <div className="overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
              <label htmlFor="comment" className="sr-only">
                Add your comment
              </label>
              <textarea
                rows={3}
                name="comment"
                id="comment"
                className="block w-full resize-none border-0 py-3 focus:ring-0 sm:text-sm"
                placeholder="Add your comment..."
                defaultValue={''}
                value={text}
                onChange={e => setText(e.target.value)}
              />

              {/* Spacer element to match the height of the toolbar */}
              <div className="py-2" aria-hidden="true">
                {/* Matches height of button in toolbar (1px border + 36px content height) */}
                <div className="py-px">
                  <div className="h-9" />
                </div>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
              <div className="flex items-center space-x-5"></div>
              <div className="flex-shrink-0">
                <button
                  onClick={submit}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  Post
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
      <p className="text-center text-sm text-red-500">{error}</p>
    </main>
  );

  async function submit() {
    if (!rating || !difficulty) {
      setError('Please rate the class.');
      return;
    }

    if (!text) {
      setError('Please write a comment.');
      return;
    }

    await fetch('/api/comment', {
      method: 'POST',
      body: JSON.stringify({ comment: { rating, difficulty, recommend, text }, classId: String(router.query.id) }),
    });
    router.reload();
  }
}

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
