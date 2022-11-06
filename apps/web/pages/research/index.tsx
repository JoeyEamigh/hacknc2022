import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Cookies from 'cookies';
import { client, Term } from 'prismas';
import A from '../../components/general/link';
import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import Logo from '../../assets/logo.png';
import SubjectSelect from '../../components/general/subject-select';
import { useRouter } from 'next/router';
import TermSelect from '../../components/general/term-select';
import { getCurrentTerm } from 'shared';

export default function Explore({
  subjects,
  college,
  distinctSubjects,
  term,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Sidebar subjects={distinctSubjects} term={term} />
      <main className="pb-24 lg:pl-64">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-16">
          <div className="pb-12 text-center lg:pt-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Research Subjects at {college.name}</h1>
            <p className="mx-auto mt-4 max-w-3xl text-base text-gray-500">See which class would be the best for YOU!</p>
          </div>

          {/* Product grid */}
          <section aria-labelledby="subjects-heading">
            <h2 id="subjects-heading" className="sr-only">
              Subjects
            </h2>
            <div className="grid grid-cols-1 grid-rows-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {subjects.map(s => (
                <A key={s.id} href={`/research/${s.slug}`}>
                  <div className="h-full overflow-hidden rounded-md border border-gray-100 p-4 shadow-md hover:shadow-lg">
                    <h3 className="text-2xl font-medium">{s.slug}</h3>
                    <p>{s.name}</p>
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

export function Sidebar({ subjects, term }: { subjects: string[]; term: Term }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-40 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full">
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                    <div className="flex flex-shrink-0 items-center px-4">
                      <Image src={Logo} className="h-12 w-auto" alt="" /> <p className="pl-4">Search Options:</p>
                    </div>
                    <SearchAndFilter oTerm={term} subjects={subjects} />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0">{/* Force sidebar to shrink to fit close icon */}</div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <Image src={Logo} className="h-12 w-auto" alt="" /> <p className="pl-4">Search Options:</p>
              </div>
              <SearchAndFilter oTerm={term} subjects={subjects} />
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col lg:pl-64">
          <div className="sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 lg:hidden">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <MagnifyingGlassIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function SearchAndFilter({ subjects, oTerm }: { subjects: string[]; oTerm: Term }) {
  const [subject, setSubject] = useState('Select Subject');
  const [term, setTerm] = useState(oTerm);
  const router = useRouter();
  if (router.query.subject && subject !== router.query.subject) setSubject(router.query.subject as string);

  return (
    <main className="flex w-full flex-col gap-4 overflow-x-clip pt-4">
      <SubjectSelect subjects={subjects} value={subject} onUpdate={updateToSubject} />
      <TermSelect value={term} onUpdate={updateToTerm} />
    </main>
  );

  async function updateToTerm(term: Term) {
    setTerm(term);
    await fetch(`/api/term`, { method: 'POST', body: JSON.stringify({ term }) });
    router.replace(router.asPath);
  }

  function updateToSubject(subject: string) {
    setSubject(subject);
    router.push(`/research/${subject}`);
  }
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req, res } = context;
  const cookies = new Cookies(req, res);
  let college = JSON.parse(Buffer.from(cookies?.get('college') || '', 'base64')?.toString('utf-8') || '{}');
  if (!college?.id) college = defaultCollege;
  const term: Term = cookies?.get('term') || getCurrentTerm();

  const subjectCount = await client.subject.count({ where: { schoolId: college.id, name: { not: null } } });
  const subjects = await client.subject.findMany({
    where: { schoolId: college.id, name: { not: null } },
    skip: Math.floor(Math.random() * (subjectCount - 50)),
    take: 50,
  });
  subjects.forEach(c => (c.createdAt = JSON.stringify(c.createdAt) as unknown as Date));
  const distinctSubjects = (await prisma.subject.findMany({ where: { schoolId: college.id }, distinct: ['slug'] })).map(
    s => s.slug,
  );

  return {
    props: { subjects, college, distinctSubjects, term },
  };
}

const defaultCollege = {
  name: 'The University of North Carolina at Chapel Hill',
  id: 'U2Nob29sLTEyMzI=',
};
