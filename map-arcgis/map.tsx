'use client';

import React, { useEffect, useRef, useState } from 'react'
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import esriConfig from '@arcgis/core/config';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
// import '@arcgis/core/assets/esri/themes/light/main.css'; // Adjust the path as necessary
import '@arcgis/core/assets/esri/themes/dark/main.css'; // Adjust the path as necessary

import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import Layer from '@arcgis/core/layers/Layer';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import Search from '@arcgis/core/widgets/Search';

esriConfig.apiKey = 'AAPKdec314cf645a408e8d7fefaad73d1b04D_VHPN-eK0x0Mqx9tLkfn-4f0Hb3BJBNfuzVUvqkNkTdkmZfB_vmkJUcqrSkdNE_'; // Replace with your actual API key

const MapComponent = () => {
  const mapRef = useRef(null);
  const searchRef = useRef(null);
  const [showReferenceMarkers, setShowReferenceMarkers] = useState(true);
  const [showHighway, setShowHighway] = useState(true);
  const geoJSON_REF_Layer = useRef(null);
  const HighwayLayer = useRef(null);

  useEffect(() => {
    let view = null;

    // Create the map and view
    const map = new Map({
      basemap: {
        baseLayers: [
          new VectorTileLayer({
            url: 'https://tiles.arcgis.com/tiles/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Vector_Tile_Basemap/VectorTileServer'
          })
        ]
      }
    });

    // PopupTemplate for GeoJSONLayer
    const popupTemplate = new PopupTemplate({
      title: "<span style='color:rgb(64, 233, 255);'>Feature Information</span> ",
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
      `
    });

    // Add GeoJSON Layer
    const geoJSON_PMIS_Layer = new GeoJSONLayer({
      url: '/files/pmis_data.geojson', // Path to your GeoJSON file in the public directory
      popupTemplate: popupTemplate,
      labelingInfo: [
        {
          symbol: {
            type: 'text', // Label type
            color: '#000000', // Text color
            haloColor: '#FFFFFF', // Halo color around the text
            haloSize: '1px',
            font: {
              size: '12px',
              family: 'Arial',
              weight: 'bold'
            }
          },
          labelPlacement: 'above-center', // Position of the label relative to the point
          labelExpressionInfo: {
            expression: '$feature.MRKR_NBR' // Field to display as the label
          }
        }
      ]
    });

    geoJSON_REF_Layer.current = new GeoJSONLayer({
      url: '/files/ref_data.geojson', // Path to your GeoJSON file in the public directory
      popupTemplate: {
        title: "Reference Marker Information",
        content: `
      <b>Route Name:</b> {RTE_NM}<br>
      <b>Reference Marker:</b> {MRKR_NBR}<br>
      <b>Marker Suffix:</b> {MRKR_SFX}<br>
      <b>DFO:</b> {DFO}
    `
      },
      labelingInfo: [
        {
          symbol: {
            type: 'text', // Label type
            color: '#000000', // Text color
            haloColor: '#FFFFFF', // Halo color around the text
            haloSize: '1px',
            font: {
              size: '12px',
              family: 'Arial',
              weight: 'bold'
            }
          },
          labelPlacement: 'above-center', // Position of the label relative to the point
          labelExpressionInfo: {
            expression: '$feature.MRKR_NBR' // Field to display as the label
          }
        }
      ],
      renderer: {
        // @ts-ignore
        type: 'simple', // Use a simple renderer
        symbol: {
          type: 'simple-marker', // Specify marker type
          color: 'rgba(0, 0, 0, 1)',
          size: 5, // Size of the marker
          outline: {
            color: 'rgba(255, 255, 255, 0.4)', // White outline with 70% transparency
            width: 1 // Outline width
          }
        }
      }

      ,
      definitionExpression: 'MOD(MRKR_NBR, 200) = 0' // Show only markers with number > 500 initially
    });
    // Add Feature Layer
    const referenceMarkerLayer = new FeatureLayer({
      url: 'https://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Reference_Markers/FeatureServer/0',
      outFields: ['*'], // Specify all fields to fetch
      popupTemplate: {
        title: "Reference Marker Information",
        content: `
      <b>Route Name:</b> {RTE_NM}<br>
      <b>Reference Marker:</b> {MRKR_NBR}<br>
      <b>Marker Suffix:</b> {MRKR_SFX}<br>
      <b>DFO:</b> {DFO}
    `
      },
      labelingInfo: [
        {
          symbol: {
            type: 'text', // Text symbol for labeling
            color: '#808080', // Gray color for labels
            haloColor: '#FFFFFF', // White halo
            haloSize: '1px',
            font: {
              size: '10px',
              family: 'Arial',
              weight: 'bold'
            }
          },
          labelPlacement: 'above-center', // Label position
          labelExpressionInfo: {
            expression: '$feature.MRKR_NBR' // Field to display as label
          }
        }
      ],
      renderer: {
        // @ts-ignore
        type: 'simple', // Use a simple renderer
        symbol: {
          type: 'simple-marker', // Specify marker type
          color: 'rgba(0, 0, 0, 0.5)', // Gray color with 50% transparency
          size: 5, // Size of the marker
          outline: {
            color: 'rgba(255, 255, 255, 0.4)', // White outline with 70% transparency
            width: 1 // Outline width
          }
        }
      }

      ,
      definitionExpression: 'MOD(MRKR_NBR, 200) = 0' // Show only markers with number > 500 initially
    });

    HighwayLayer.current = new FeatureLayer({
      url: 'https://services.arcgis.com/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Roadway_Inventory_RB_OnSystem/FeatureServer/0/',
      outFields: ['*'], // Specify all fields to fetch
      popupTemplate: {
        title:  "<span style='color:rgb(64, 233, 255);'>Highway:<b>{HWY}</b></span> ",
      },
      renderer: {
        // @ts-ignore
        type: 'simple', // Use a simple renderer
        symbol: {
          type: 'simple-line', // Specify marker type
          color: 'rgba(0, 0, 0, 0.4)', // Gray color with 50% transparency
          width: 1, // Size of the marker
          // outline: {
          //   color: 'rgba(255, 255, 255, 0.5)', // White outline with 70% transparency
          //   width: 0.5 // Outline width
          // }
        }
      },
    });

    // map.add(geoJSONLayer);
    // map.addMany([geoJSONLayer, referenceMarkerLayer, HighwayLayer]);
    map.addMany([geoJSON_PMIS_Layer, geoJSON_REF_Layer.current, HighwayLayer.current]);

    if (mapRef.current) {
      view = new MapView({
        container: mapRef.current,
        map: map,
        center: [-99.1332, 31.9686], // Texas coordinates (Longitude, Latitude)
        zoom: 6,
        // highlightOptions: {
        //   // @ts-ignore
        // color: '#0000ff', // Change this to your desired highlight color
        // width: 3
        // }
      });
      let currentZoomLevel = view.zoom;

      view.watch('zoom', (newZoom) => {
        currentZoomLevel = newZoom;
        if (currentZoomLevel <= 4) {
          geoJSON_REF_Layer.current.definitionExpression = "MOD(MRKR_NBR, 400) = 0"; // No features shown
        } else if (currentZoomLevel <= 6) {
          geoJSON_REF_Layer.current.definitionExpression = "MOD(MRKR_NBR, 200) = 0"; // No features shown
        } else if (currentZoomLevel <= 8) {
          geoJSON_REF_Layer.current.definitionExpression = "MOD(MRKR_NBR, 100) = 0"; // No features shown
        } else {
          geoJSON_REF_Layer.current.definitionExpression = "1=1"; // Show all
        }
      });
    }
// Create controls container
const controlsContainer = document.createElement("div");
controlsContainer.style.padding = "10px";
controlsContainer.style.backgroundColor = "#f0f0f0"; // Light gray background for the container
controlsContainer.style.borderRadius = "5px";
controlsContainer.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)"; // Subtle shadow for depth
controlsContainer.style.display = "flex";
controlsContainer.style.flexDirection = "column"; // Stack items vertically
controlsContainer.style.gap = "8px"; // Space between items

// Create Reference Markers Checkbox
const checkbox_ref = document.createElement("input");
checkbox_ref.type = "checkbox";
checkbox_ref.checked = showReferenceMarkers;
checkbox_ref.id = "toggle-ref-markers";

const label_ref = document.createElement("label");
label_ref.innerText = "Show Reference Markers";
label_ref.htmlFor = "toggle-ref-markers";
label_ref.style.marginLeft = "5px"; // Space between checkbox and label
label_ref.style.fontWeight = "bold"; // Bold text for emphasis

const refContainer = document.createElement("div");
refContainer.style.display = "flex";
refContainer.style.alignItems = "center"; // Center items vertically
refContainer.appendChild(checkbox_ref);
refContainer.appendChild(label_ref);
controlsContainer.appendChild(refContainer);

// Create Highway Checkbox
const checkbox_hw = document.createElement("input");
checkbox_hw.type = "checkbox";
checkbox_hw.checked = showHighway;
checkbox_hw.id = "toggle-hw-markers";

const label_hw = document.createElement("label");
label_hw.innerText = "Show Highway";
label_hw.htmlFor = "toggle-hw-markers";
label_hw.style.marginLeft = "5px"; // Space between checkbox and label
label_hw.style.fontWeight = "bold"; // Bold text for emphasis

const hwContainer = document.createElement("div");
hwContainer.style.display = "flex";
hwContainer.style.alignItems = "center"; // Center items vertically
hwContainer.appendChild(checkbox_hw);
hwContainer.appendChild(label_hw);
controlsContainer.appendChild(hwContainer);
// Add controls container to the top-right of the UI
view.ui.add(controlsContainer, "top-right");

// Event listener to toggle visibility
checkbox_ref.addEventListener("change", (event) => {
  setShowReferenceMarkers(event.target.checked);
  geoJSON_REF_Layer.current.visible = event.target.checked;
});

checkbox_hw.addEventListener("change", (event) => {
  setShowHighway(event.target.checked);
  HighwayLayer.current.visible = event.target.checked;
});
        // Add Search Widget
        searchRef.current = new Search({
          view,
          visible: true,
          includeDefaultSources: true,
          sources: [
            {
              layer: HighwayLayer.current,
              searchFields: ['HWY'],
              displayField: 'HWY',
              exactMatch: false,
              outFields: ['*'],
              name: 'Highways',
              placeholder: 'Search Highway...'
            },
            {
              layer: geoJSON_REF_Layer.current,
              searchFields: ['RTE_NM'],
              displayField: 'RTE_NM',
              exactMatch: false,
              outFields: ['*'],
              name: 'Reference Markers',
              placeholder: 'Search Reference Marker...'
            }
          ]
        });
        view.ui.add(searchRef.current, 'top-left');

          // Create a div for the zoom level display
  const zoomCoordsDiv = document.createElement("div");
  zoomCoordsDiv.style.position = "absolute";
  zoomCoordsDiv.style.bottom = "20px";
  zoomCoordsDiv.style.left = "10px";
  zoomCoordsDiv.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  zoomCoordsDiv.style.color = "white";
  zoomCoordsDiv.style.padding = "5px";
  zoomCoordsDiv.style.borderRadius = "5px";
  zoomCoordsDiv.innerText = `Zoom: ${view.zoom.toFixed(2)}, Coords: --, --`;
  
  // Append the zoom level div to the view's container
  view.ui.add(zoomCoordsDiv, "manual");
 // Update zoom level on zoom change
 view.watch('zoom', (zoom) => {
  zoomCoordsDiv.innerText = `Zoom: ${zoom.toFixed(2)}, Coords: --, --`;
});

// Update coordinates on pointer-move
view.on('pointer-move', (event) => {
  const point = view.toMap({ x: event.x, y: event.y });
  if (point) {
    zoomCoordsDiv.innerText = `Zoom: ${view.zoom.toFixed(2)}, Coords: ${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`;
  }
});

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, []);
  useEffect(() => {
    if (geoJSON_REF_Layer.current) {
      geoJSON_REF_Layer.current.visible = showReferenceMarkers;
    }
    if (HighwayLayer.current) {
      HighwayLayer.current.visible = showHighway;
    }
  }, [showReferenceMarkers, showHighway]);

  return (
      <div ref={mapRef} style={{ width: '100%', height: '93vh' }}></div>
  );
};

export default MapComponent;