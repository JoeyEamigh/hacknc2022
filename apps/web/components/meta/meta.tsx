import environment from 'environment';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { cleanBool } from 'shared';

export default function Meta({
  title,
  description = '',
  imgUrl = '',
  noAuthorized,
}: {
  title?: string;
  description?: string;
  imgUrl?: string;
  noAuthorized?: boolean;
}) {
  const router = useRouter();
  const session = useSession();

  if (noAuthorized && session?.status === 'authenticated') router.push('/');
  return (
    <Head>
      <title>{getTitle()}</title>
      <meta name="description" content={description} />

      {/* OpenGraph Tags */}
      <meta property="og:url" content={`https://${environment.frontendUrl}/`} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={getTitle()} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imgUrl} />

      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content={environment.frontendUrl} />
      <meta property="twitter:url" content={`https://${environment.frontendUrl}/${cleanBool(router.asPath)}`} />
      <meta name="twitter:title" content={getTitle()} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imgUrl} />
    </Head>
  );

  function getTitle() {
    return title ? `${title} | Rate My Class` : `Rate My Class`;
  }
}
