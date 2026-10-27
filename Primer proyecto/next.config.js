const MINI_SERVIDOR_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:4000'; // Corregido al puerto 3001

/** @type{import('next').NextConfig} */

module.exports = {
    reactStrictMode: true,
    async rewrites() {
        return [
            { source: '/mini/:path*', destination: `${MINI_SERVIDOR_URL}/:path*` }, // Corregido :path*
            { source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` }   // Corregido :path*
        ]
    }
}