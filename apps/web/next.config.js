const { join } = require('path');

// const withTM = require('next-transpile-modules')([]);

const NextEnv = process.env.NODE_ENV;
const myEnv = process.env.ENV;
const isProdBuild = NextEnv === 'production';
const isProd = myEnv === 'production';

const imageDomains = [
  'avatars.githubusercontent.com',
  'lh3.googleusercontent.com',
  'scontent-iad3-2.xx.fbcdn.net',
  '*',
];
const devImageDomains = [...imageDomains, 'localhost', '127.0.0.1'];
const prodImageDomains = [...imageDomains, ''];

console.log(`> Building for ${myEnv}`);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: isProdBuild ? prodImageDomains : devImageDomains,
  },
  compiler: {
    removeConsole: isProd
      ? {
          exclude: ['error'],
        }
      : false,
  },
  experimental: {
    outputStandalone: isProdBuild,
    outputFileTracingRoot: join(__dirname, '../../'),
  },
  env: {
    ENV: myEnv,
  },
  swcMinify: isProdBuild,
  compress: false,
};

// module.exports = withTM(nextConfig);
module.exports = nextConfig;
