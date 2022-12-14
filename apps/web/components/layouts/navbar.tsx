import { Fragment, useState } from 'react';
import { Combobox, Dialog, Disclosure, Menu, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { classes } from 'shared';
import A from '../general/link';
import Link from 'next/link';
import { SessionContextValue, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Logo from '../../assets/logo.png';
import CollegeSelect from '../general/college-select';
import { searchClient } from '../../scripts/meili';
import { getSelectedCollege } from '../../scripts/storage';

const links = [
  { name: 'Home', href: '/' },
  { name: 'Research', href: '/research' },
  { name: 'Compare', href: '/compare' },
];
const profileLinks = [
  { name: 'Your Profile', href: '/profile' },
  // { name: 'Settings', href: '/settings' },
];

export default function Navbar() {
  const session = useSession();
  const path = useRouter().pathname;
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <>
      <Disclosure as="nav" className={classes('z-50 bg-white shadow')}>
        {({ open }) => (
          <>
            <div className="px-2 sm:px-4 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex px-2 lg:px-0">
                  <div className="flex flex-shrink-0 items-center">
                    <A href="/">
                      <Image src={Logo} className="block h-12 w-auto" alt="" />
                    </A>
                  </div>
                  <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
                    {/* Current: "border-indigo-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
                    {links.map(l => (
                      <A
                        key={l.name + ' desktop'}
                        href={l.href}
                        className={classes(
                          ((path.includes(l.href) && l.href !== '/') || (l.href === '/' && path === '/')) &&
                            'border-indigo-500 text-gray-900',
                          'inline-flex items-center border-b-2  px-1 pt-1 text-sm font-medium',
                        )}>
                        {l.name}
                      </A>
                    ))}
                  </div>
                </div>
                <div className="flex flex-1 items-center justify-center px-2 lg:ml-6 lg:justify-end">
                  <CollegeSelect />
                  <SearchBar setCommandPaletteOpen={setCommandOpen} />
                </div>
                <div className="flex items-center lg:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                {session.status === 'authenticated' ? (
                  <div className="hidden lg:ml-4 lg:flex lg:items-center">
                    {/* <button
                    type="button"
                    className="flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button> */}
                    {/* Profile dropdown */}
                    <ProfileMenu session={session} />
                  </div>
                ) : (
                  <div className="hidden lg:ml-4 lg:flex lg:items-center">
                    <A
                      href="/login"
                      className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      Sign In
                    </A>
                  </div>
                )}
              </div>
            </div>
            <Disclosure.Panel className="lg:hidden">
              <div className="flex-col items-center justify-center pt-2 pb-1">
                <CollegeSelect />
              </div>
              <div className="space-y-1 pt-2 pb-3">
                {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800" */}
                {links.map(l => (
                  <Disclosure.Button
                    key={l.name + ' mobile'}
                    as={Link}
                    href={l.href}
                    className={classes(
                      path === l.href
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'hover:bg-gray-100 hover:text-gray-800',
                      'block border-l-4 py-2 pl-3 pr-4 text-base font-medium',
                    )}>
                    {l.name}
                  </Disclosure.Button>
                ))}
              </div>
              <div className="border-t border-gray-200 pb-3">
                {session?.status === 'authenticated' && <MobileProfileMenu session={session} />}
                <div className="mt-1">
                  {session?.status === 'authenticated' ? (
                    <Disclosure.Button
                      as="button"
                      onClick={() => signOut()}
                      className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                      Sign out
                    </Disclosure.Button>
                  ) : (
                    <Disclosure.Button
                      as={Link}
                      href="/login"
                      className={classes(
                        path === '/login'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'hover:bg-gray-100 hover:text-gray-800',
                        'block border-l-4 py-2 pl-3 pr-4 text-base font-medium',
                      )}>
                      Sign in
                    </Disclosure.Button>
                  )}
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <CommandPalette open={commandOpen} setOpen={setCommandOpen} />
    </>
  );
}

function SearchBar({ setCommandPaletteOpen }) {
  return (
    <div className="w-full max-w-lg lg:max-w-xs">
      <label htmlFor="search" className="sr-only">
        Search for a Class!
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          id="search"
          name="search"
          className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          placeholder="Search for a Class!"
          type="search"
          // onChange={search}
          onClick={() => setCommandPaletteOpen(true)}
          onFocus={e => e.target.blur()}
        />
      </div>
    </div>
  );
}

export function CommandPalette({ open, setOpen }: { open?: boolean; setOpen?: (open: boolean) => void }) {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<any>([]);

  async function search(e) {
    setQuery(e.target.value);
    const results = await searchClient
      .index('classes')
      .search(e.target.value, { sort: ['number:asc'], filter: `subject.school.rmpId='${(await getSelectedCollege()) || 'U2Nob29sLTEyMzI='}'` });
    setHits(results.hits);
  }

  const router = useRouter();

  return (
    <Transition.Root show={open} as={Fragment} afterLeave={() => setQuery('')} appear>
      <Dialog as="div" className="relative z-[100]" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-[100] overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95">
            <Dialog.Panel className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              <Combobox
                onChange={r => {
                  // @ts-ignore
                  router.push(`/class/${r.id}`);
                  setOpen(false);
                }}>
                <div className="relative">
                  <MagnifyingGlassIcon
                    className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  <Combobox.Input
                    className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-800 placeholder-gray-400 focus:ring-0 sm:text-sm"
                    placeholder="Search..."
                    onChange={search}
                  />
                </div>

                {hits.length > 0 && (
                  <Combobox.Options static className="max-h-72 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-800">
                    {hits.map(hit => (
                      <Combobox.Option
                        key={hit.id}
                        value={hit}
                        className={({ active }) =>
                          classes('cursor-default select-none px-4 py-2', active && 'bg-indigo-600 text-white')
                        }>
                        {hit.subject.slug} {hit.number} ({hit.name})
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                )}
                {query !== '' && hits.length === 0 && <p className="p-4 text-sm text-gray-500">No classes found.</p>}
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function ProfileMenu({ session }: { session: SessionContextValue<boolean> }) {
  return (
    <Menu as="div" className="relative ml-4 flex-shrink-0">
      <div>
        <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          <div className="relative h-8 w-8 overflow-hidden rounded-full">
            <Image fill src={session?.data?.user?.image} alt="" />
          </div>
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95">
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {profileLinks.map(l => (
            <Menu.Item key={l.name + ' desktop'}>
              {({ active }) => (
                <A
                  href={l.href}
                  className={classes(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}>
                  {l.name}
                </A>
              )}
            </Menu.Item>
          ))}
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => signOut()}
                className={classes(
                  active ? 'bg-gray-100' : '',
                  'block w-full px-4 py-2 text-left text-sm text-gray-700',
                )}>
                Sign Out
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

function MobileProfileMenu({ session }: { session: SessionContextValue<boolean> }) {
  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center px-4">
        <div className="flex-shrink-0">
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <Image fill src={session?.data?.user?.image} alt="" />
          </div>
        </div>
        <div className="ml-3">
          <div className="text-base font-medium text-gray-800">{session?.data?.user?.name}</div>
          <div className="text-sm font-medium text-gray-500">{session?.data?.user?.email}</div>
        </div>
        <button
          type="button"
          className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <span className="sr-only">View notifications</span>
          {/* <BellIcon className="h-6 w-6" aria-hidden="true" /> */}
        </button>
      </div>
      <div className="mt-3 space-y-1">
        {profileLinks.map(l => (
          <Disclosure.Button
            as={Link}
            href={l.href}
            key={l.name + ' mobile'}
            className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800">
            {l.name}
          </Disclosure.Button>
        ))}
      </div>
    </div>
  );
}
