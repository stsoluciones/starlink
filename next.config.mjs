import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig = {
  images: {
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/dnbrxpca3/',
    domains: ['localhost', 'res.cloudinary.com'],
    unoptimized: true,
  },
  compress: true,
};

export default withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })(nextConfig);
