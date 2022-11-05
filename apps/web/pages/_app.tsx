import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import DefaultLayout from '../components/layouts/default-layout';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DynamicLayoutEngine>
      <Component {...pageProps} />
    </DynamicLayoutEngine>
  );
}

function DynamicLayoutEngine({ children }: { children: React.ReactNode }) {
  const path = useRouter().pathname;

  // if (path === '')
  return <DefaultLayout>{children}</DefaultLayout>;
}
