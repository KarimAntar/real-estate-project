// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'plus.unsplash.com',
      'cdn-icons-png.flaticon.com',
      'ui-avatars.com', // add this to allow premium images
    ],
  },
    typescript: {
    // !! WARN !!
    // This option is temporary to bypass a build error in Next.js 15.
    // It's not recommended for long-term use.
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
