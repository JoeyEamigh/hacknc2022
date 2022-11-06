import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Meta from '../components/meta/meta';

export default function Profile() {
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
    </main>
  );
}
