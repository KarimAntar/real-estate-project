// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'plus.unsplash.com', // add this to allow premium images
    ],
  },
};

module.exports = nextConfig;
