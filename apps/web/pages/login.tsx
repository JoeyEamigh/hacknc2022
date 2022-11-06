import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { signIn } from 'next-auth/react';
import Meta from '../components/meta/meta';
import Logo from '../assets/logo.png';
import Image from 'next/image';

const signInWith = [
  { provider: 'google', logo: <FontAwesomeIcon icon={faGoogle} />, name: 'Google' },
  { provider: 'facebook', logo: <FontAwesomeIcon icon={faFacebook} />, name: 'Facebook' },
  { provider: 'github', logo: <FontAwesomeIcon icon={faGithub} />, name: 'GitHub' },
];

export default function Login() {
  return (
    <>
      <Meta noAuthorized />
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Image src={Logo} className="relative mx-auto h-12 w-auto overflow-hidden" alt="" />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">Or proceed to create one!</p>
          </div>
          <div className="flex flex-col gap-4 md:flex-row">
            {signInWith.map(provider => (
              <button
                onClick={() => signIn(provider.provider)}
                className="rounded-md p-4 text-center hover:bg-gray-100"
                key={provider.provider}>
                <div className="sm:flex-shrink-0">
                  <div className="flow-root">{provider.logo}</div>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3 lg:mt-3 lg:ml-0">
                  <h3 className="text-sm font-medium text-gray-900">Sign In With {provider.name}</h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
