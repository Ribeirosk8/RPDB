'use client';

import dynamic from 'next/dynamic';

const DynamicMapComponent = dynamic(() => import('../../components/map-arcgis/map'), {
    ssr: false,
});

// Named export function
const MapPage = () => <DynamicMapComponent />;

export default MapPage;