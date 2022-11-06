import { StarIcon } from '@heroicons/react/20/solid';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { client } from 'prismas';
import { classes, cloneDeep } from 'shared';
import Meta from '../components/meta/meta';
import { authOptions } from './api/auth/[...nextauth]';

export default function Profile({ comments }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const session = useSession();

  return (
    <main className="flex w-full flex-col items-center py-10">
      <Meta title="Profile" authorized />
      <section className="w-full max-w-3xl">
        {/* Page header */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
          <div className="flex items-center space-x-5">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="relative h-16 w-16 overflow-hidden rounded-full">
                  <Image src={session?.data?.user?.image} alt="" fill />
                </div>
                <span className="absolute inset-0 rounded-full shadow-inner" aria-hidden="true" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{session?.data?.user?.name}</h1>
              <p className="text-sm font-medium text-gray-500">{session?.data?.user?.email}</p>
            </div>
          </div>
        </div>
      </section>
      <div className="pt-16 lg:col-span-7 lg:col-start-6 lg:row-start-2 lg:mt-0">
        <h3>Recent reviews</h3>
        <div className="flow-root">
          <div className="divide-y divide-gray-200">
            {comments?.map(c => (
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
    </main>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req, res } = context;
  const session = await unstable_getServerSession(req, res, authOptions);

  const comments = await client.comment.findMany({
    where: { user: { email: session?.user?.email } },
    include: { user: true },
  });

  return { props: { comments: cloneDeep(comments) } };
}
