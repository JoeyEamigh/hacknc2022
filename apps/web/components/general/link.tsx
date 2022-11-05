import Link from 'next/link';
import { HTMLProps } from 'react';

export default function A({
  external,
  href,
  ...props
}: { external?: boolean; href: string } & HTMLProps<HTMLAnchorElement>) {
  if (external) {
    return <a target="_blank" rel="noopener noreferrer" href={href} {...props}></a>;
  }

  return (
    <Link legacyBehavior href={href}>
      <a {...props}></a>
    </Link>
  );
}
