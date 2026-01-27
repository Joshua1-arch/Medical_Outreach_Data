import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'ReachPoint',
        short_name: 'ReachPoint',
        description: 'Professional medical outreach management system',
        start_url: '/',
        display: 'standalone',
        background_color: '#f8f9fa',
        theme_color: '#1e293b',
        icons: [
            {
                src: '/Reach.png',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };
}
