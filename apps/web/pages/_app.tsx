import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import DefaultLayout from '../components/layouts/default-layout';
import { SessionProvider } from 'next-auth/react';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <DynamicLayoutEngine>
        <Component {...pageProps} />
      </DynamicLayoutEngine>
    </SessionProvider>
  );
}

function DynamicLayoutEngine({ children }: { children: React.ReactNode }) {
  const path = useRouter().pathname;

  // if (path === '')
  return <DefaultLayout>{children}</DefaultLayout>;
}
