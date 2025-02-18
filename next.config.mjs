/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS || false;
let assetPrefix = '';
// let basePath = '/RPDB';
let basePath = '';

if (isGithubActions) {
  const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, '');
  assetPrefix = `/${repo}/`;
  basePath = `/${repo}`;
}

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: basePath, // Add the basePath for GitHub Pages
  assetPrefix: assetPrefix, // Add the assetPrefix for GitHub Pages
  trailingSlash: true, // Ensure trailing slash for static files
  
  webpack: (config) => {
    config.resolve.alias['@arcgis/core'] = '@arcgis/core';
    return config;
  },

  // Additional configuration to handle ArcGIS modules and headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
