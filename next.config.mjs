import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig = {
  images: {
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/dnbrxpca3/',
    domains: ['localhost', 'res.cloudinary.com','starlink-beta.vercel.app'],
    unoptimized: true,
  },
  compress: true,
  api: {
    bodyParser: false, // MercadoPago envía `x-www-form-urlencoded`
  },
};

export default withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })(nextConfig);
