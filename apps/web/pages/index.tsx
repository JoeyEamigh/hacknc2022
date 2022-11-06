import Meta from '../components/meta/meta';
import Logo from '../assets/logo.png';
import Image from 'next/image';

export default function Home() {
  return (
    <main>
      <Meta />
      <div className="w-full border-b border-gray-100">
        <Image
          src={Logo}
          alt="rate my classes logo"
          className="mx-auto max-h-[40vh] max-w-4xl object-cover object-center"
        />
      </div>
      <h1 className="mt-12 text-center text-6xl font-bold">Rate My Classes</h1>
      <p className="mx-auto mt-6 max-w-4xl text-center text-3xl font-medium">
        Rate My Classes is an easy-to-use crowd-sourced rating system for college classes at UNC. We strive to enable
        students to make informed decisions about their classes and make their voices heard.
      </p>
    </main>
  );
}
