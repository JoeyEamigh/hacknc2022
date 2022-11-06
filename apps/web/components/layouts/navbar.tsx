import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { classes } from 'shared';
import A from '../general/link';
import Link from 'next/link';
import { SessionContextValue, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Logo from '../../assets/logo.png';

const links = [{ name: 'Home', href: '/' }];
const profileLinks = [
  { name: 'Your Profile', href: '/profile' },
  // { name: 'Settings', href: '/settings' },
];

export default function Navbar() {
  const session = useSession();
  const path = useRouter().pathname;

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
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
                        path === l.href && 'border-indigo-500 text-gray-900',
                        'inline-flex items-center border-b-2  px-1 pt-1 text-sm font-medium',
                      )}>
                      {l.name}
                    </A>
                  ))}
                </div>
              </div>
              <div className="flex flex-1 items-center justify-center px-2 lg:ml-6 lg:justify-end">
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
                    />
                  </div>
                </div>
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
