'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState } from 'react';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';

// Dynamically import the MapComponent with SSR disabled
const DynamicMapComponent = dynamic(() => import('../components/map-arcgis/map'), {
  ssr: false,
});

const MainMapPage = () => {

  const popupTemplate = new PopupTemplate({
    title: "<span style='color:rgb(64, 233, 255);'>Feature Information</span>",
    content: `
      <b>Highway:</b> {Normalized_RTE}<br>
      <b>Beginning TRM Number:</b> {TX_BEG_REF_MARKER_NBR}<br>
      <b>Beginning TRM Displacement:</b> {TX_BEG_REF_MRKR_DISP}<br>
      <b>Evaluation Start:</b> {Evaluation_start}<br>
      <b>Ending TRM Number:</b> {TX_END_REF_MARKER_NBR}<br>
      <b>Ending TRM Displacement:</b> {TX_END_REF_MARKER_DISP}<br>
      <b>Evaluation End:</b> {Evaluation_End}<br>
      <b>AADT Current:</b> {TX_AADT_CURRENT}<br>
      <b>18KIP ESALS:</b> {TX_CURRENT_18KIP_MEAS}<br>
      <b>Truck AADT Percentage:</b> {TX_TRUCK_AADT_PCT}<br>
      <b>Distress Score:</b> {TX_DISTRESS_SCORE}<br>
      <b>Condition Score:</b> {TX_CONDITION_SCORE}<br>
      <b>Ride Score:</b> {TX_RIDE_SCORE}<br>
      <b>Maintenance Section:</b> {MAINT_SECTION}<br>
      <b>Pavement Type:</b> {BROAD_PAV_TYPE}
    `,
  });

  // Add GeoJSON Layer
  const geoJSON_PMIS_Layer = new GeoJSONLayer({
    url: '/files/pmis_data.geojson',
    popupTemplate: popupTemplate,
    name: "PMIS Data Points",
    labelingInfo: [
      {
        symbol: {
          type: 'text',
          color: '#000000',
          haloColor: '#FFFFFF',
          haloSize: '1px',
          font: {
            size: '12px',
            family: 'Arial',
            weight: 'bold',
          },
        },
        labelPlacement: 'above-center',
        labelExpressionInfo: {
          expression: '$feature.MRKR_NBR',
        },
      },
    ],
  });

  const geoJSON_REF_Layer = new GeoJSONLayer({
    url: '/files/ref_data.geojson',
    name: "Reference Markers",
    popupTemplate: {
      title: "Reference Marker Information",
      content: `
        <b>Route Name:</b> {RTE_NM}<br>
        <b>Reference Marker:</b> {MRKR_NBR}<br>
        <b>Marker Suffix:</b> {MRKR_SFX}<br>
        <b>DFO:</b> {DFO}
      `,
    },
    labelingInfo: [
      {
        symbol: {
          type: 'text',
          color: '#000000',
          haloColor: '#FFFFFF',
          haloSize: '1px',
          font: {
            size: '12px',
            family: 'Arial',
            weight: 'bold',
          },
        },
        labelPlacement: 'above-center',
        labelExpressionInfo: {
          expression: '$feature.MRKR_NBR',
        },
      },
    ],
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-marker',
        color: 'rgba(0, 0, 0, 1)',
        size: 5,
        outline: {
          color: 'rgba(255, 255, 255, 0.4)',
          width: 1,
        },
      },
    },
    definitionExpression: 'MOD(MRKR_NBR, 200) = 0',
  });

  const HighwayLayer = new FeatureLayer({
    url: 'https://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Roadways_Search/FeatureServer/0',
    outFields: ['*'],
    name:"Highways",
    popupTemplate: {
      title: "<span style='color:rgb(64, 233, 255);'>Highway: <b>{RTE_CNTY}</b></span>",
    },
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-line',
        color: 'rgba(0, 0, 0, 0.4)',
        width: 1,
      },
    },
    definitionExpression: "(SUBSTRING(RTE_NM,1,2)='IH' or SUBSTRING(RTE_NM,1,2)='US')",
  });


  const mapProps = {
    basemapUrl: 'https://tiles.arcgis.com/tiles/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Vector_Tile_Basemap/VectorTileServer',
    theme: "dark",
    searchSources: [{
      layer: HighwayLayer,
      searchFields: ['RTE_CNTY'],
      displayField: 'RTE_CNTY',
      exactMatch: false,
      outFields: ['*'],
      name: 'Highways',
      placeholder: 'Search Highway...',
    },
    {
      layer: geoJSON_REF_Layer,
      searchFields: ['RTE_NM'],
      displayField: 'RTE_NM',
      exactMatch: false,
      outFields: ['*'],
      name: 'Reference Markers',
      placeholder: 'Search Reference Marker...',
    }],
    uiControls: {  },
    layers: [
      { layer: geoJSON_PMIS_Layer, name: 'PMIS Data Points', visible: true },  // Include title
      { layer: geoJSON_REF_Layer, name: 'Reference Markers', visible: true },  // Include title
      { layer: HighwayLayer, name: 'Highways' , visible: true}  // Include title
      ],
      toggle: true
  };

  return (
    <>
      <DynamicMapComponent {...mapProps} />
    </>
  );
};

export default MainMapPage;