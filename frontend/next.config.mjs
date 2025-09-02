/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });
    return config;
  },
  
  // 👇 This makes Next.js generate the static "out/" folder on build
  output: 'export',
};

export default nextConfig;
