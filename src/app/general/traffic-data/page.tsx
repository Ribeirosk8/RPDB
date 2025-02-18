'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState } from 'react';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import { Sprite } from 'three/src/Three.js';
import { split } from 'postcss/lib/list';

// Dynamically import the MapComponent with SSR disabled
const DynamicMapComponent = dynamic(() => import('../../../components/map-arcgis/map'), {
  ssr: false,
});

const TrafficPage = () => {
  // const [districtOptions, setDistrictOptions] = useState([]);
  // const [countyOptions, setCountyOptions] = useState([]);
  // const [highwayOptions, setHighwayOptions] = useState([]);
  // const [selectedDistrict, setSelectedDistrict] = useState('');
  // const [selectedCounty, setSelectedCounty] = useState('');
  // const [selectedHighway, setSelectedHighway] = useState('');

  // const popupTemplate = new PopupTemplate({
  //   title: "<span style='color:rgb(64, 233, 255);'>Feature Information</span>",
  //   content: function(feature) {
  //     let attributes = feature.graphic.attributes;
  //     // Extract table data dynamically (years and their corresponding values)
  //     let tableRows = "";
  //     for (let key in attributes) {
  //       // console.log(key)
  //       if (key.includes('AADT_')) { // Check if key is a year (e.g., 1996, 1997, etc.)
  //         var year = key.split('_')[1]
  //         tableRows += `<tr><td>${year}</td><td>${attributes[key]}</td></tr>`;
  //       }
  //     }
  
  //     return `
  //       <b>Highway:</b> ${attributes.TX_SIGNED_HIGHWAY_RDBD_ID}<br>
  //       <b>Beginning TRM Number:</b> ${attributes.TX_BEG_REF_MARKER_NBR}<br>
  //       <b>Beginning TRM Displacement:</b> ${attributes.TX_BEG_REF_MRKR_DISP}<br>
  //       <b>Ending TRM Number:</b> ${attributes.TX_END_REF_MARKER_NBR}<br>
  //       <b>Ending TRM Displacement:</b> ${attributes.TX_END_REF_MARKER_DISP}<br>
  
  //       <br><b>AADT Data:</b>
  //       <table border="1" style="width:100%; text-align:left; border-collapse:collapse;">
  //         <thead>
  //           <tr><th>Year</th><th>AADT</th></tr>
  //         </thead>
  //         <tbody>
  //           ${tableRows}
  //         </tbody>
  //       </table>
  //     `;
  //   }
  // });
 
  // // Add GeoJSON Layer
  // const geoJSON_Layer = new GeoJSONLayer({
  //   url: '/files/aadt.geojson',
  //   popupTemplate: popupTemplate,
  //   outFields: ["*"], 
  //   name: "AADT",
  //   labelingInfo: [
  //     {
  //       symbol: {
  //         type: 'text',
  //         color: '#000000',
  //         haloColor: '#FFFFFF',
  //         haloSize: '1px',
  //         font: {
  //           size: '12px',
  //           family: 'Arial',
  //           weight: 'bold',
  //         },
  //       },
  //       labelPlacement: 'above-center',
  //       labelExpressionInfo: {
  //         expression: '$feature.MRKR_NBR',
  //       },
  //     },
  //   ],
  // });

  const REFLayer = new FeatureLayer({
    url: 'https://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Reference_Markers/FeatureServer/0',
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


  const AADTLayer = new FeatureLayer({
    url: 'https://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_TPP_Annual_AADT_Data_(SPM_View)/FeatureServer/0',
    outFields: ['*'],
    name: "AADT",
    popupTemplate: {
      title: "<span style='color:rgb(64, 233, 255);'>AADT</span>",
      content: [
        {
          type: "fields",
          fieldInfos: [ { fieldName: "TRFC_STATN_ID", label: "STATION FLAG" },
            { fieldName: "ON_ROAD", label: "Highway Name" },
            { fieldName: "AADT_RPT_QTY", label: "AADT 2023" },
            { fieldName: "AADT_RPT_HIST_01_QTY", label: "AADT 2022" },
            { fieldName: "AADT_RPT_HIST_02_QTY", label: "AADT 2021" },
            { fieldName: "AADT_RPT_HIST_03_QTY", label: "AADT 2020" },
            { fieldName: "AADT_RPT_HIST_04_QTY", label: "AADT 2019" },
            { fieldName: "AADT_RPT_HIST_05_QTY", label: "AADT 2018" },
            { fieldName: "AADT_RPT_HIST_06_QTY", label: "AADT 2017" },
            { fieldName: "AADT_RPT_HIST_07_QTY", label: "AADT 2016" },
            { fieldName: "AADT_RPT_HIST_08_QTY", label: "AADT 2015" },
            { fieldName: "AADT_RPT_HIST_09_QTY", label: "AADT 2014" },
            { fieldName: "AADT_RPT_HIST_10_QTY", label: "AADT 2013" },
            { fieldName: "AADT_RPT_HIST_11_QTY", label: "AADT 2012" },
            { fieldName: "AADT_RPT_HIST_12_QTY", label: "AADT 2011" },
            { fieldName: "AADT_RPT_HIST_13_QTY", label: "AADT 2010" },
            { fieldName: "AADT_RPT_HIST_14_QTY", label: "AADT 2009" },
            { fieldName: "AADT_RPT_HIST_15_QTY", label: "AADT 2008" },
            { fieldName: "AADT_RPT_HIST_16_QTY", label: "AADT 2007" },
            { fieldName: "AADT_RPT_HIST_17_QTY", label: "AADT 2006" },
            { fieldName: "AADT_RPT_HIST_18_QTY", label: "AADT 2005" },
            { fieldName: "AADT_RPT_HIST_19_QTY", label: "AADT 2004" }
          ]
        }
      ]
    },
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-marker',
        size: 6,
        color: 'red',
        outline: { width: 0.5, color: 'black' }
      }
    },
    labelingInfo: [
      {
        labelExpressionInfo: {
          expression: "$feature.LATEST_AADT_QTY + ' ('+Right($feature.LATEST_AADT_YR,2)+')'"
        },
        symbol: {
          type: "text",
          haloSize: 2,
          haloColor: "white"
        }
      }
    ],
    definitionExpression: "ZLEVEL < 7",
    visible: false
  });
  

//   // Fetch unique values for district, county, and road
//   useEffect(() => {
//     const fetchAADTData = async () => {
//       const response = await fetch('https://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_TPP_Annual_AADT_Data_(SPM_View)/FeatureServer/0/query?where=1=1&outFields=DIST_NBR,DIST_NM,CNTY_NBR,CNTY_NM,ON_ROAD&returnGeometry=false&f=json');
//       const data = await response.json();
      
// // Extract unique districts
// const districts = data.features.reduce((acc, feature) => {
//   const { DIST_NBR, DIST_NM } = feature.attributes;
//   if (!acc.some(district => String(district.value) == String(DIST_NBR))) {
//     console.log('test')
//     acc.push({ value: DIST_NBR, label: DIST_NM });
//   }
//   return acc;
// }, []);
// setDistrictOptions(districts);

// // Extract unique counties
// const counties = data.features.reduce((acc, feature) => {
//   const { CNTY_NBR, CNTY_NM } = feature.attributes;
//   if (!acc.some(county => county.value === CNTY_NBR)) {
//     acc.push({ value: CNTY_NBR, label: CNTY_NM });
//   }
//   return acc;
// }, []);
// setCountyOptions(counties);

// // Extract unique highways
// const highways = data.features.reduce((acc, feature) => {
//   const { ON_ROAD } = feature.attributes;
//   if (!acc.some(highway => highway.value === ON_ROAD)) {
//     acc.push({ value: ON_ROAD, label: ON_ROAD });
//   }
//   return acc;
// }, []);
// setHighwayOptions(highways);

//     };

//     fetchAADTData();
//   }, []);

//   const handleFilterChange = () => {
//     // Create an array to hold the individual filter conditions
//     const definitionExpression = [];
    
//     // Check if a district is selected
//     if (selectedDistrict) {
//       definitionExpression.push(`DIST_NBR = '${selectedDistrict}'`);
//     }
    
//     // Check if a county is selected
//     if (selectedCounty) {
//       definitionExpression.push(`CNTY_NBR = '${selectedCounty}'`);
//     }
    
//     // Check if a highway is selected
//     if (selectedHighway) {
//       definitionExpression.push(`ON_ROAD = '${selectedHighway}'`);
//     }
  
//     // Join the filter conditions with ' AND ' and set it as the definitionExpression
//     AADTLayer.definitionExpression = definitionExpression.join(' AND ') || null;
  
//     // If you need to refresh the layer to see the changes, you can call:
//     AADTLayer.refresh(); // Uncomment if needed
//   };
  

  const mapProps = {
    basemapUrl: 'https://tiles.arcgis.com/tiles/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Vector_Tile_Basemap/VectorTileServer',
    theme: "dark",
    searchSources: [],
    uiControls: {  },
    layers: [
      { layer: AADTLayer, name: 'AADT', visible: true },  
      { layer: REFLayer, name: 'Reference Markers', visible: true },  
      ],
      toggle: true
  };

  return (
    <>
      {/* <div>
        <label>
          District:
          <select onChange={(e) => setSelectedDistrict(e.target.value)} value={selectedDistrict}>
            <option value="">Select District</option>
            {districtOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label>
          County:
          <select onChange={(e) => setSelectedCounty(e.target.value)} value={selectedCounty}>
            <option value="">Select County</option>
            {countyOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label>
          Highway:
          <select onChange={(e) => setSelectedHighway(e.target.value)} value={selectedHighway}>
            <option value="">Select Highway</option>
            {highwayOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <button onClick={handleFilterChange}>Apply Filters</button>
      </div> */}
      <DynamicMapComponent {...mapProps} />
    </>
  );
};

export default TrafficPage;