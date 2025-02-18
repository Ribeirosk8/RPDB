'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import SideNavSheet from "@/components/side-nav/sidenavsheet";

// Dynamically import the MapComponent with SSR disabled
const DynamicMapComponent = dynamic(() => import('../../components/map-arcgis/map'), {
  ssr: false,
});

const SectionOneMap = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [rows, setRows] = useState([]);
  // useState<{ index: number; sectionId: string; highway: string }[]>([]);
  const handleSectionClick = () => {
    setIsOpen(true); // Open the SideNavSheet
  };
  // Fetch and parse GeoJSON data
  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const response = await fetch('/files/start_points.geojson');
        if (!response.ok) throw new Error('Failed to load GeoJSON');
        
        const data = await response.json();
        if (data.features) {
          const extractedRows = data.features.map((feature, index) => ({
            index: index + 1,
            sectionId: feature.properties?.["Test Section"] || `Unknown-${index}`,
            highway: feature.properties?.["Highway"] || "N/A",
          }));
          setRows(extractedRows);
        }
      } catch (error) {
        console.error('Error fetching GeoJSON:', error);
      }
    };

    fetchGeoJSON();
  }, []);

  // Add GeoJSON Layer
  const sectionOne_Point_Layer = new GeoJSONLayer({
    url: '/files/start_points.geojson',
    name: "Section One Data Points",
    popupTemplate: {
      title: "Feature Information",
      content: `<b>Test Section:</b> {Test Section}<br>`,
    },
  });

  const mapProps = {
    basemapUrl: 'https://tiles.arcgis.com/tiles/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Vector_Tile_Basemap/VectorTileServer',
    theme: "dark",
    searchSources: [],
    uiControls: {},
    layers: [
      { layer: sectionOne_Point_Layer, name: 'Section One Data Points', visible: true },
    ],
    toggle: true
  };

  return (
    <>
      <SideNavSheet isOpen={isOpen} onClose={() => setIsOpen(false)} rows={rows} />
      <DynamicMapComponent {...mapProps} />
    </>
  );
};

export default SectionOneMap;