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
import Papa from "papaparse"; // install via: npm install papaparse
import Overlay from "ol/Overlay";
import Point from "ol/geom/Point.js";

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
import { get as getProjection } from 'ol/proj.js';
import GeoTIFFSource from 'ol/source/GeoTIFF'; // Adjust the path if necessary
import { units } from '../../constants';
import { products } from '../../constants';

export default function map({ onUnitChange, images, currentIndex, prod_details, opacity, colorbar, unit, productInfo }:
    { onUnitChange: (seUnit: string, selProduct: string) => void; images: string[]; currentIndex: number; prod_details: object; opacity: number, colorbar: string, unit: string, productInfo:string }) {
    const mapRef: any = useRef(null);
    const sourceRef: any = useRef(null);
    const layerRef: any = useRef(null);//useRef<WebGLTileLayer | null>(null);
    const selectRef: any = useRef(null);
    const [preloadedImages, setPreloadedImages] = useState([]); //useState<WebGLTileLayer[]>([]);
    const [layers, setLayers] = useState([]);
    const [isSetup, setIsSetup] = useState(false);

    const [streamLayers, setStreamLayers] = useState<VectorLayer[]>([]);

    const rainfall_units = [products.radarData.qpe_15min, products.radarData.qpe_1hr, products.radarData.pr,
    products.forecast.pr, products.forecast.tp]
    const cosmos_products = [products.cosmos.water_level, products.cosmos.water_depth, products.cosmos.max_water_level, products.cosmos.max_water_depth]


    let baseLayer: any = new TileLayer({
        source: new OSM(),
        id: 'baseLayer'
    });

    proj4.defs(
        'EPSG:32610',
        '+proj=utm +zone=10 +datum=WGS84 +units=m +no_defs'
    );

    // Register the projection with OpenLayers
    register(proj4);

    useEffect(() => {
        const preloadImages = async () => {
            // const preloaded = await Promise.all(images.map(async (url, index) => {
            //     return new WebGLTileLayer({
            //         source: new GeoTIFFSource({ // Create GeoTIFFSource from GeoTIFF
            //             sources: [{ url: url, nodata: 0 }],
            //             normalize: true,
            //             wrapX: true,
            //         }),
            //         visible: true,//index === currentIndex, // Only make the current index layer visible
            //         opacity: index === currentIndex ? 1 : 0,
            //         id: `geoTiffLayer_${index}`, // Assign an ID for easier identification
            //     });
            // }));
            const imageExtent:any = cosmos_products.includes(prod_details['id']) ? [-122.64270782470703, 37.33298492390895, -121.85090639124974, 38.3444389345703] : [-124.005, 36.500, -121.195, 39.505];

            const preloaded = await Promise.all(images.map(async (url, index) => {
                return new ImageStatic({
                    url: images[index], // Image path
                    projection: 'EPSG:4326', // Coordinate reference system
                    //imageExtent: [-124.005, 36.500, -121.195, 39.505], // Extent from your world file
                    //imageExtent: [-122.64181, 37.333286, -121.850006, 38.34174]
                    //interpolate: true,
                    //cosmos extent
                    imageExtent:imageExtent //[-122.64270782470703, 37.33298492390895, -121.85090639124974, 38.3444389345703]
                })
            }));            
            setPreloadedImages(preloaded);
        };
        preloadImages();
    }, [images]);

    useEffect(() => {
        if (preloadedImages.length > 0) {
            //const allLayers = preloadedImages//[baseLayer, ...preloadedImages];
            //setLayers(preloadedImages);
            setIsSetup(!isSetup);
            if (mapRef.current) {
                layerRef.current.setSource(preloadedImages[currentIndex]);                
            }
        }
    }, [preloadedImages]);

    useEffect(() => {
        if (layerRef.current) {
            layerRef.current.setOpacity(opacity);
        }
    }, [opacity])

    // useEffect(() => {
    //     if (mapRef.current) {
    //         mapRef.current.getAllLayers().forEach(mapLayer => {
    //             if (mapLayer.get('id') !== "baseLayer") {
    //                 mapRef.current.removeLayer(mapLayer);
    //             }
    //         });
    //         layers.forEach(layer => mapRef.current.addLayer(layer));
    //     }
    // }, [layers])

    useEffect(() => {
        layerRef.current = new ImageLayer({
            visible: true,
            opacity: 1,
            id: `imageLayer`, // Assign an ID for easier identification
        })
        mapRef.current = new Map({
            target: "map",
            layers: [baseLayer, layerRef.current],
            view: new View({
                center: [-13610058.982783515, 4561655.27023881],
                //center: [-122.245908, 37.837513],
                //cosmos center
                //center: [-122.25, 37.84],
                zoom: 7.5,
            }),
        });
        return () => {
            mapRef.current.setTarget(undefined);
        };
    }, []);

    useEffect(() => {
        if (layerRef.current) {
            if (!images || images.length === 0) {
                // Clear the layer when there are no images
                layerRef.current.setSource(null);
            } else if (preloadedImages.length > 0) {
                layerRef.current.setSource(preloadedImages[currentIndex]);
            }
        }
    }, [currentIndex, images, preloadedImages]);
    

    useEffect(() => {
        if (prod_details.id === 'stream_reach') {
            // URLs to your GeoJSON files
            const shp1Url = '/geojson/flowlines.geojson'; // replace with your file paths
            const shp2Url = '/geojson/watersheds.geojson';
    
            const loadShpLayers = async () => {
                const shp1 = await fetch(shp1Url).then(res => res.json());
                const shp2 = await fetch(shp2Url).then(res => res.json());
    
                const layer1 = new VectorLayer({
                    source: new VectorSource({
                        features: new GeoJSON().readFeatures(shp1, {
                            featureProjection: 'EPSG:3857',
                        }),
                    }),
                    style: new Style({
                        stroke: new Stroke({
                            color: '#FFA500',
                            width: 1,
                        }),
                    }),
                    zIndex: 10,
                });
    
                const layer2 = new VectorLayer({
                    source: new VectorSource({
                        features: new GeoJSON().readFeatures(shp2, {
                            featureProjection: 'EPSG:3857',
                        }),
                    }),
                    style: new Style({
                        stroke: new Stroke({
                            color: '#00BFFF',
                            width: 3,
                        }),
                    }),
                    zIndex: 11,
                });
    
                // Remove old stream layers if any
                streamLayers.forEach(l => mapRef.current.removeLayer(l));
    
                // Add new layers
                mapRef.current.addLayer(layer1);
                mapRef.current.addLayer(layer2);
    
                setStreamLayers([layer1, layer2]);
            };
    
            loadShpLayers();
        } else {
            // Remove stream layers when switching away
            streamLayers.forEach(l => mapRef.current.removeLayer(l));
            setStreamLayers([]);
        }
    }, [prod_details]);
    
    useEffect(() => {
        if (prod_details.id !== 'stream_reach') {
            // Remove site layer if it exists
            mapRef.current.getLayers().forEach((l: any) => {
                if (l.get('id') === 'siteLayer') {
                    mapRef.current.removeLayer(l);
                }
            });
            return; // skip loading CSV
        }
    
        const csvUrl = "/data/stream_data.csv";
    
        fetch(csvUrl)
            .then(res => res.text())
            .then(text => {
                Papa.parse(text, {
                    header: true,
                    complete: (result: any) => {
                        const features = result.data
                            .filter((row: any) => row.LatSite && row.LonSite)
                            .map((row: any) => {
                                const feature = new Feature({
                                    geometry: new Point(fromLonLat([parseFloat(row.LonSite), parseFloat(row.LatSite)])),
                                    COMID: row.COMID,
                                });
    
                                feature.setStyle(
                                    new Style({
                                        image: new CircleStyle({
                                            radius: 3,
                                            fill: new Fill({ color: "#000000" }),
                                            stroke: new Stroke({ color: "#FFFFFF", width: 2 }),
                                        }),
                                    })
                                );
    
                                return feature;
                            });
    
                        const siteLayer = new VectorLayer({
                            source: new VectorSource({ features }),
                            zIndex: 100,
                        });
    
                        siteLayer.set('id', 'siteLayer');
    
                        // Remove old site layer if exists
                        mapRef.current.getLayers().forEach((l: any) => {
                            if (l.get('id') === 'siteLayer') {
                                mapRef.current.removeLayer(l);
                            }
                        });
    
                        mapRef.current.addLayer(siteLayer);
    
                        // Tooltip
                        const tooltip = document.createElement("div");
                        tooltip.className = "tooltip bg-white px-2 py-1 rounded shadow text-sm";
                        const overlay = new Overlay({
                            element: tooltip,
                            offset: [10, 0],
                            positioning: "center-left",
                        });
                        mapRef.current.addOverlay(overlay);
    
                        mapRef.current.on("pointermove", (evt: any) => {
                            const feature = mapRef.current.forEachFeatureAtPixel(evt.pixel, f => f);
                            if (feature && feature.get("COMID")) {
                                tooltip.innerHTML = feature.get("COMID");
                                overlay.setPosition(evt.coordinate);
                                tooltip.style.display = "block";
                            } else {
                                tooltip.style.display = "none";
                            }
                        });
                    },
                });
            });
    }, [prod_details.id]); // runs when the product changes
    
      

    return (
        <div className='overflow-hidden relative'>
            <Popover placement="right">
                <PopoverHandler>
                    <Button className='!absolute rounded-2xl top-[20px] left-[40px] z-10 bg-theme_green bg-none p-0'>
                        <FontAwesomeIcon className='bg-none text-white' icon={faCircleInfo} size="2x" color="white" />
                    </Button>
                </PopoverHandler>
                <PopoverContent className='fixed z-20 p-1 text-white bg-theme_green leading-4'>
                    {productInfo}
                </PopoverContent>
            </Popover>
            {rainfall_units.includes(prod_details['id']) && (
                <div className='flex gap-0 bg-white absolute z-10 top-[1rem] right-5 sm:top-[0.8rem] sm:right-[0.5rem] md:top-[1rem] md:right-[0.5rem]'>
                    <Chip onClick={() => onUnitChange(units.in, prod_details['id'])} variant={(unit == units.in || unit == units.in_per_hr) ? "" : "outlined"} size='md' value="in" />
                    <Chip onClick={() => onUnitChange(units.mm, prod_details['id'])} variant={(unit == units.mm || unit == units.mm_per_hr) ? "" : "outlined"} size='md' value="mm" />
                </div>
            )}
            {(prod_details['id'] == products.forecast.temp) && (
                <div className='flex gap-0 bg-white absolute z-10 top-[1rem] right-5 sm:top-[0.8rem] sm:right-[0.5rem] md:top-[1rem] md:right-[0.5rem]'>
                    <Chip onClick={() => onUnitChange(units.F, prod_details['id'])} variant={(unit == units.F) ? "" : "outlined"} size='md' value="F" />
                    <Chip onClick={() => onUnitChange(units.DEG, prod_details['id'])} variant={(unit == units.DEG) ? "" : "outlined"} size='md' value="°C" />
                </div>
            )}
            <div className='!absolute top-[80px] 2xl:top-[10rem] left-[10px] z-10'>
                <img className="h-[25rem] 2xl:h-[35rem] w-auto" src={colorbar} alt="" />
            </div>
            <div id="map" className='h-screen pt-2' style={{ width: "100%" }} />
            <Chip className='!absolute sm:w-40 sm:!text-wrap text-center bg-[#bdbdbd82] bottom-[195px] md:bottom-[80px] left-[20px] text-black border-black shadow-black shadow-md z-200 justify-center'
                size='lg' variant="outlined" value={<div className='flex flex-row sm:flex-col'><span>{prod_details['name']} ({unit}) </span><hr className="my-1 border-black" /><span> {prod_details['day']} {prod_details['time']} Z {prod_details['date']}</span></div>} />

        </div>
    )
}