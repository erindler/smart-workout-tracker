import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Smart Workout Tracker',
    short_name: 'Workout',
    description: 'Track your workouts smarter.',
    start_url: '/',
    display: 'standalone',
    theme_color: '#68a848',
    background_color: '#020401',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
