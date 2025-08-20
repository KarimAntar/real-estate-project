// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'plus.unsplash.com',
      'cdn-icons-png.flaticon.com', // add this to allow premium images
    ],
  },
};

module.exports = nextConfig;
