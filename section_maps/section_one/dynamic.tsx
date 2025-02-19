'use client'

import dynamic from 'next/dynamic';

const DynamicSectionOneMapComponent = dynamic(() => import('./map'), {
    ssr: false,
});

// Named export function
const MapPage = () => <DynamicSectionOneMapComponent />;

export default MapPage;