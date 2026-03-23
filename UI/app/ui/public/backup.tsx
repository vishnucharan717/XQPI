'use client'

import * as React from 'react';
import { useState, useCallback } from 'react';
import { useEffect, useRef } from 'react';
import Map from "ol/Map";
import View from "ol/View";
import Circle from 'ol/geom/Circle.js';
import Feature from 'ol/Feature.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer, Image as ImageLayer } from 'ol/layer.js';
import { Circle as CircleStyle, Fill, Stroke, Style, Icon, Text } from 'ol/style.js';
import { click } from 'ol/events/condition.js';
import { transformExtent, fromLonLat, Projection, transform } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON.js';
import "react-toastify/dist/ReactToastify.css";
import "ol/ol.css";
// import { radarCoordinates } from '../../constants';
import { ImageStatic } from 'ol/source';
import GeoTIFF from 'ol/source/GeoTIFF.js';
import WebGLTileLayer from 'ol/layer/WebGLTile.js';
import {
    epsgLookupMapTiler,
    fromEPSGCode,
    register,
    setEPSGLookup,
} from 'ol/proj/proj4.js';
import { getCenter } from 'ol/extent.js';
import proj4 from 'proj4';
import { fromUrl, fromArrayBuffer } from 'geotiff';
import { ScaleLine } from 'ol/control.js';
import { FitOptions } from "ol/View"
import {
    Popover,
    PopoverHandler,
    PopoverContent,
    Button,
} from "@material-tailwind/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { Chip } from "@material-tailwind/react";



export default function map() {
    const mapRef: any = useRef(null);
    const sourceRef: any = useRef(null);
    const drawRef: any = useRef(null);
    const selectRef: any = useRef(null);

    proj4.defs(
        'EPSG:32610',
        '+proj=utm +zone=10 +datum=WGS84 +units=m +no_defs'
    );

    // Register the projection with OpenLayers
    register(proj4);

    useEffect(() => {
        const styles = {
            'Point': new Style({
                image: new Icon({
                    anchor: [0.5, 46],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: '/location-pin.png',
                    width: 40
                }),
            }),
            'MultiPolygon': new Style({
                stroke: new Stroke({
                    color: 'black',
                    width: 2,
                }),
                fill: new Fill({
                    color: 'rgba(0, 0, 255, 0.1)',
                }),
            }),
            'Polygon': new Style({
                stroke: new Stroke({
                    color: 'black',
                    width: 2,
                }),
                fill: new Fill({
                    color: 'rgba(0, 0, 255, 0.1)',
                }),
            }),
            'aqpi_domain': new Style({
                stroke: new Stroke({
                    color: 'red',
                    width: 2,
                }),
                fill: new Fill({
                    color: 'rgba(0, 0, 0, 0)',
                }),
            }),
            'GeometryCollection': new Style({
                stroke: new Stroke({
                    color: 'magenta',
                    width: 2,
                }),
                fill: new Fill({
                    color: 'magenta',
                }),
                image: new CircleStyle({
                    radius: 10,
                    fill: null,
                    stroke: new Stroke({
                        color: 'magenta',
                    }),
                }),
            }),
        };

        const circltStyle = function (radar: string) {
            return new Style({
                stroke: new Stroke({
                    color: 'black',
                    width: 2,
                }),
                fill: null,
                text: new Text({
                    text: radar, // Your text here
                    font: '15px Calibri,sans-serif',
                    fill: new Fill({ color: 'black' }),
                    stroke: new Stroke({ color: 'white', width: 2 }),
                    offsetY: 0, // Center the text vertically
                    offsetX: 0, // Center the text horizontally
                    textAlign: 'center',
                }),
            });
        }

        const styleFunction = function (feature: any) {
            if (feature.getId() == 'aqpi_domain') {
                return styles[feature.getId()];
            } else if (feature.getGeometry().getType() === 'Circle') {
                return circltStyle(feature.getId());
            } else {
                return styles[feature.getGeometry().getType()];
            }
        };

        sourceRef.current = new VectorSource({ wrapX: false });
        let features = [];
        const aqpiCoord = transformExtent([-124.005, 36.500, -121.195, 39.505], 'EPSG:4326', 'EPSG:3857');
        features.push({
            'id': 'aqpi_domain',
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': [
                    [
                        [aqpiCoord[0], aqpiCoord[1]],
                        [aqpiCoord[2], aqpiCoord[1]],
                        [aqpiCoord[2], aqpiCoord[3]],
                        [aqpiCoord[0], aqpiCoord[3]],
                        [aqpiCoord[0], aqpiCoord[1]]
                    ],
                ],
            },
        });

        const geojsonObject = {
            'type': 'FeatureCollection',
            'crs': {
                'type': 'name',
                'properties': {
                    'name': 'EPSG:3857',
                },
            },
            'features': features
        }

        sourceRef.current = new VectorSource({
            features: new GeoJSON().readFeatures(geojsonObject),
        });

        // const generateRangeRings = function () {
        //     Object.keys(radarCoordinates).map((key, index) => {
        //         let radarRingFeature = new Feature(new Circle(fromLonLat([radarCoordinates[key]['lon'], radarCoordinates[key]['lat']], 'EPSG:3857'), radarCoordinates[key]['range']));
        //         radarRingFeature.setId(key);
        //         sourceRef.current.addFeature(radarRingFeature);
        //     })
        // };

        // generateRangeRings();

        const projection = new Projection({
            code: 'EPSG:32610',
            units: 'm'
        });

        const geoTiffSource = new GeoTIFF({
            normalize: true,
            sources: [
                {
                    url: 'images/temp.tif',
                    nodata: 0,
                },
            ],
            wrapX: true,
            projection: 'EPSG:32610'
        });

        async function getGeoTIFFExtent(url: any) {
            const utmProjection = '+proj=utm +zone=10 +datum=WGS84 +units=m +no_defs';
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const tiff = await fromArrayBuffer(arrayBuffer);
            const image = await tiff.getImage();

            const bbox = image.getBoundingBox();
            const resolution = image.getResolution();

            console.log('Bounding Box:', bbox);
            console.log('resolution:', resolution);

            const topLeft = proj4(utmProjection, 'EPSG:4326', [bbox[0], bbox[3]]);
            const topRight = proj4(utmProjection, 'EPSG:4326', [bbox[2], bbox[3]]);
            const bottomLeft = proj4(utmProjection, 'EPSG:4326', [bbox[0], bbox[1]]);
            const bottomRight = proj4(utmProjection, 'EPSG:4326', [bbox[2], bbox[1]]);


            // Convert Lat/Lon to Web Mercator
            const extent = transformExtent(
                [topLeft[0], bottomRight[1], bottomRight[0], topLeft[1]], // [minLon, minLat, maxLon, maxLat]
                'EPSG:4326', // From Lat/Lon
                'EPSG:3857'  // To Web Mercator
            );

            console.log("extent", extent)

            return bbox; // bbox is typically [minX, minY, maxX, maxY]
        }

        const extent = getGeoTIFFExtent('images/total_precipitation_colored.tif');

        const utmCenter = transform([-122.8022, 38.5216], 'EPSG:4326', 'EPSG:32610');

        const view = new View({
            center: utmCenter,//[-13610058.982783515, 4561655.27023881],
            zoom: 0,
            projection: 'EPSG:32610',
            // extent: [409821, 4039392, 663571, 4373142],
            //resolution: -249
            //  resolutions: [
            //     249.75393700787401,
            //     -249.812874251497,
            //     0
            // ],
            // constrainOnlyCenter: true,
            smoothExtentConstraint: true,
            showFullExtent: true,
        });

        // sourceRef.current.addFeature(new Feature(new Circle(fromLonLat([-122.8022, 38.5216], 'EPSG:3857'), 40000)));
        // const center =  transformExtent([-13610058.982783515, 4561655.27023881], 'EPSG:4326', 'EPSG:32610')//fromLonLat([-124.005, 39.505], 'EPSG:32610');
        // const bottomLeft = fromLonLat([-124.005, 36.500], 'EPSG:32610');       
        // const topRight = fromLonLat([-121.195, 39.505], 'EPSG:32610');
        mapRef.current = new Map({
            target: "map",
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                new VectorLayer({
                    source: sourceRef.current,
                    style: styleFunction
                }),
                new WebGLTileLayer({
                    source: geoTiffSource,
                    opacity: 1,
                    // style: { gamma: 0.7 },
                }),
            ],
            view: new View({
                center: [-13610058.982783515, 4561655.27023881],
                zoom: 7.5,
            }),
        });
        return () => {
            mapRef.current.setTarget(undefined);
        };

    }, [])

    return (
        <div className='overflow-hidden relative'>
            <Popover placement="right">
                <PopoverHandler>
                    <Button className='!absolute rounded-2xl top-[20px] left-[40px] z-10 bg-theme_green bg-none p-0'>
                        <FontAwesomeIcon className='bg-none text-white' icon={faCircleInfo} size="2x" color="white" />
                    </Button>
                </PopoverHandler>
                <PopoverContent className='fixed z-20 p-1'>
                    Decription of product being shown.
                </PopoverContent>
            </Popover>
            <div id="map" className='h-screen pt-2' style={{ width: "100%" }} />
            <Chip className='!absolute sm:w-40 sm:!text-wrap text-center bg-[#bdbdbd82] bottom-[195px] md:bottom-[80px] left-[20px] text-black border-black shadow-black shadow-md z-200 justify-center'
                size='lg' variant="outlined" value={<div className='flex flex-row sm:flex-col'><span>Composite Reflectivity (in) </span><hr className="my-1 border-black" /><span> Wed 06:30 Z 14-Aug-2024</span></div>} />
        </div>
    )
}