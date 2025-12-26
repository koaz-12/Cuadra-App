import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Cuadra - Finanzas Personales',
        short_name: 'Cuadra',
        description: 'Administra tus tarjetas, préstamos y gastos fijos.',
        start_url: '/',
        display: 'standalone',
        background_color: '#F8FAFC',
        theme_color: '#0F172A',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
