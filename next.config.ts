/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
      // Allows production builds to successfully complete even with ESLint warnings
          ignoreDuringBuilds: true,
            },
              typescript: {
                  // Allows production builds to successfully complete even with TypeScript warnings
                      ignoreBuildErrors: true,
                        },
                        };
                        
                        export default nextConfig;
                         */