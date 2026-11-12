import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LMS Nesaka',
    short_name: 'Nesaka',
    description: 'Learning Management System SMK Negeri 1 Kandanghaur',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/nesaka-app-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/nesaka-app-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/nesaka-app-icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}