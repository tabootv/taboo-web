import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TabooTV',
    short_name: 'TabooTV',
    description:
      'Discover premium video content, educational courses, and connect with creators on TabooTV.',
    id: '/',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      { src: '/icon-16x.png', sizes: '16x16', type: 'image/png' },
      { src: '/icon-32x.png', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
