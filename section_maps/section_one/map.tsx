'use client'

import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import Map from '@arcgis/core/Map';
import WebMap from '@arcgis/core/WebMap';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import MapView from '@arcgis/core/views/MapView';
import React, { useEffect, useRef } from 'react';
import esriConfig from '@arcgis/core/config';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';

esriConfig.apiKey = 'AAPTxy8BH1VEsoebNVZXo8HurFuwAAfy3orq2CP9UswiP-yyVsRXEeMdGwi38hgT_Axf3vuiESzlYjFHSEiLpGcPtpGnJvBXMhE0XpHq4vLdcbdCzeAGWt8kflF01ZcHyvNjqRDzdpD5D6RfT1hdnGB6KBP-yV29tCIbq4zy9lHDZR8Yn-UGG5qjhnX15ubaOLaYfSRH4KPhto4wLsse3zOznnCI4usmwbgGYrl7l5OJnrM';
// esriConfig.apiKey = 'AT1_SkOM5Hg8';

const SectionOneMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    let view = null;

    const map = new WebMap({
        basemap: {
            baseLayers: [
                new VectorTileLayer({
                    url: 'https://tiles.arcgis.com/tiles/KTcxiTD9dsQw4r7Z/arcgis/rest/services/TxDOT_Vector_Tile_Basemap/VectorTileServer'
                })
            ]
        }
        // portalItem: {
        //   id: "0fe322e8e4784d85921301a7b52300ed"
        // }
    });

    // const map = new Map({
    //   basemap: "streets-navigation-vector"
    // })

    const popupTemplate = new PopupTemplate({
        title: "Feature Information",
        content: `
          <b>Test Section:</b> {Test Section}<br>
        `
      });

    const renderer = new SimpleRenderer({
      symbol: new SimpleMarkerSymbol({
        size: 4,
        color: [0, 255, 255],
        outline: {
          style: 'dash'
        }
      })
    })

    const geoJSONLayer = new GeoJSONLayer({
        url: '/files/geojson/section_one.geojson',
        popupTemplate: popupTemplate,
        geometryType: 'point',
        renderer: renderer
    });

    geoJSONLayer.when(() => console.log("GeoJSON Layer Loaded", geoJSONLayer), () => console.log("Error loading GeoJSON Layer"));

    map.add(geoJSONLayer);

    // const map = new WebMap({

    // })

    if (mapRef.current) {
        view = new MapView({
            container: mapRef.current,
            map: map,
            center: [-99.1332, 31.9686], // Texas coordinates (Longitude, Latitude)
            zoom: 6
        });
    }

    return () => {
        if (view) {
          view.destroy();
        }
    };
  }, [])

  return (
    <div style={{ height: '100vh', width: '100%' }} ref={mapRef}></div>
  )
}

export default SectionOneMap