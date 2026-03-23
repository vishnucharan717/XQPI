'use client'

import * as React from 'react';
import { useState, useCallback } from 'react';
import './style.css'
import { useEffect, useRef } from 'react';
import "ol/ol.css";
import Draw, {
    createBox,
} from 'ol/interaction/Draw.js';
import Select from 'ol/interaction/Select.js';
import Map from "ol/Map";
import View from "ol/View";
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { Circle as CircleStyle, Fill, Stroke, Style, Icon } from 'ol/style.js';
import { click } from 'ol/events/condition.js';
import {
    PencilSquareIcon,
    TrashIcon,
    // CheckCircleIcon,
    MapPinIcon,
    XCircleIcon,
    XMarkIcon,
    ArrowPathIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import { transformExtent } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON.js';
import { Tooltip, Alert, Button } from "@material-tailwind/react";
import { updateAreaAndPoint } from '@/app/lib/actions';
import { useSession } from 'next-auth/react';
import { getAreaAndPoints } from '@/app/lib/actions';
import Feature from 'ol/Feature.js';
import Circle from 'ol/geom/Circle.js';
import {
    Collapse,
    Card,
    Typography,
    CardBody,
} from "@material-tailwind/react";
import { redirect } from 'next/navigation'
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

// import {
//     IconButton,
//     SpeedDial,
//     SpeedDialHandler,
//     SpeedDialContent,
//     SpeedDialAction,
// } from "@material-tailwind/react";

import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import { toast, Zoom, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

export default function UserArea() {

    const [dialOpen, setDialOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [userMapData, setUserMapData] = useState(null);
    const [error, setError] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [onHover, setOnHover] = useState(false);
    const { data: session } = useSession();

    const mapRef: any = useRef(null);
    const sourceRef: any = useRef(null);
    const drawRef: any = useRef(null);
    const selectRef: any = useRef(null);

    if (!session || !session?.user) {
        redirect('/api/auth/signin?callback=/client')
    }

    const notify = () => {

        toast.success("Area and points updated successfully !", {
            position: "top-right"
        });
        // toast("Custom Style Notification with css class!", {
        //     position: "bottom-right",
        //     className: 'foo-bar'
        // });
    };

    const styles = [
        new Style({
            stroke: new Stroke({
                color: 'black',
                width: 2,
            }),
            fill: new Fill({
                color: 'rgba(0, 0, 255, 0.1)',
            }),
        }),
        new Style({
            image: new Icon({
                anchor: [0.5, 46],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                src: '/location-pin.png',
                width: 40
            })
        }),
    ];

    useEffect(() => {
        const fetchAreaAndPoints = async () => {
            try {
                const response = await getAreaAndPoints();
                console.log("response data", response);
                setUserMapData(response)
                //return response.data;
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }; fetchAreaAndPoints();
    }, [refresh]); // Run once on component mount

    useEffect(() => {
        //console.log("userMapData", userMapData)

        if (!userMapData) {
            return; // Exit if userMapData is not yet fetched
        }

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
            }),
        };

        const styleFunction = function (feature: any) {
            if (feature.getId() == 'aqpi_domain') {
                return styles[feature.getId()];
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

        if (userMapData?.isAreaExist || userMapData?.isPointsExist) {
            console.log("Point and area exist")
            const areaCoord = transformExtent(userMapData?.area.coord, 'EPSG:4326', 'EPSG:3857');
            if (userMapData?.isAreaExist) {
                console.log("userMapData?.area.coord", userMapData?.area.coord)
                // const areaCoord = transformExtent(userMapData?.area.coord, 'EPSG:4326', 'EPSG:3857');
                let areaFeature = {
                    'id': 'user_area',
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [
                            [
                                [areaCoord[0], areaCoord[1]],
                                [areaCoord[2], areaCoord[1]],
                                [areaCoord[2], areaCoord[3]],
                                [areaCoord[0], areaCoord[3]],
                                [areaCoord[0], areaCoord[1]]
                            ],
                        ],
                    },
                }
                features.push(areaFeature);
            }

            if (userMapData?.isPointsExist) {
                for (let i in userMapData?.points) {
                    let pointFeature = {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': transformExtent(userMapData?.points[i].coord, 'EPSG:4326', 'EPSG:3857'),
                        },
                    }
                    features.push(pointFeature);
                }
            }

        }

        const geojsonObject = {
            'type': 'FeatureCollection',
            'crs': {
                'type': 'name',
                'properties': {
                    'name': 'EPSG:4326',
                },
            },
            'features': features
        }
        sourceRef.current = new VectorSource({
            features: new GeoJSON().readFeatures(geojsonObject),
        });

        mapRef.current = new Map({
            target: "map",
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                new VectorLayer({
                    source: sourceRef.current,
                    style: styleFunction
                })
            ],
            view: new View({
                center: [-13610058.982783515, 4561655.27023881],
                zoom: 7.5,
            }),
        });
        return () => {
            mapRef.current.setTarget(undefined);
        };
    }, [userMapData]);

    useEffect(() => {
        selectRef.current = new Select({
            condition: click,
            // style: selectStyle,
        });
    }, [userMapData]);

    const selected = new Style({
        fill: new Fill({
            color: '#eeeeee',
        }),
        stroke: new Stroke({
            color: 'rgba(255, 255, 255, 0.7)',
            width: 2,
        }),
    });

    function selectStyle(feature: any) {
        const color = feature.get('COLOR') || '#eeeeee';
        selected?.getFill().setColor(color);
        return selected;
    }

    const selectClick = new Select({
        condition: click,
        // style: selectStyle,
    });

    let select = selectClick;

    function addInteraction(mode: any): any {
        // document.getElementById("map").style.cursor = "pointer"; 
        mapRef.current.removeInteraction(drawRef.current);
        console.log("layes", mapRef.current.getLayers())
        let geometryFunction;

        if (mode == "Circle") {
            geometryFunction = createBox();
        } else {
            geometryFunction = undefined;
        }

        drawRef.current = new Draw({
            source: sourceRef.current,
            type: mode,
            geometryFunction: geometryFunction
        });
        mapRef.current.addInteraction(drawRef.current);
    }

    async function updateSelection() {
        setOpen(!open);
        let coordinates = {
            'username': session?.user?.username,
            'area': {
                'coord': undefined
            },
            'points': {}
        }
        let features = sourceRef.current.getFeatures();
        let areaCount = 0;
        let pointsCount: number = 0;
        if (features.length > 0 && features[0] != null) {
            for (let f in features) {
                const geometryType = features[f].getGeometry().getType();
                if (geometryType === 'Point') {
                    pointsCount = pointsCount + 1;
                    let pointName = 'P' + pointsCount;
                    let point: any = { 'coord': transformExtent(features[f].getGeometry()?.getExtent(), 'EPSG:3857', 'EPSG:4326') }

                    coordinates['points'][pointName] = point
                } else if (geometryType === 'Polygon' && features[f].getId() != 'aqpi_domain') {
                    console.log("area", features[f].getId())
                    areaCount = areaCount + 1;
                    coordinates['area']['coord'] = transformExtent(features[f].getGeometry()?.getExtent(), 'EPSG:3857', 'EPSG:4326');
                }
            }
            console.log("count", areaCount)
            console.log("coordinates", coordinates)
            if (areaCount > 1) {
                setError(true);
            }

        } else {
            coordinates['area']['coord'] = [];
        }
        if (!error) {
            try {

                const result: any = await updateAreaAndPoint(coordinates);
                console.log("result", result)
                if (result?.message == "Area and points updated successfully") {
                    notify();
                    setUpdateSuccess(true);
                }

            } catch (error) {
                console.log("Error occured", error)
            }
        }

    }

    function clearSelection(event: any): void {
        //const xCursor = `url("data:image/svg+xml,${encodeURIComponent(renderToString(<XCircleIcon />))}"), auto`;
        //document.getElementById("map").style.cursor = xCursor;
        mapRef.current.removeInteraction(drawRef.current);
        let features = sourceRef.current.getFeatures();
        console.log("no of features", features.length);

        if (select !== null) {
            mapRef.current.addInteraction(selectRef.current);
            selectRef.current.on('select', function (e: any) {
                if (e?.selected[0]?.id_ != 'aqpi_domain') {
                    sourceRef.current.removeFeature(e.selected[0]);
                }                
            });
        }

        // draw.removeLastPoint();
    }

    function clearAllSelection(event: any): void {
        let features = sourceRef.current.getFeatures();
        if (features != null && features.length > 0) {
            for (let x in features) {
                if (features[x].getId() !== 'aqpi_domain') {
                    sourceRef.current.removeFeature(features[x]);
                }                
            }
        }
    }

    // const toggleOpen = () => setOpen((cur) => !cur);
    function toggleOpen() {
        if (open) {
            mapRef.current.removeInteraction(drawRef.current);
        }
        setOpen(!open)
    }

    function reloadMap() {
        console.log("Inreload function")
        setOpen(false)
        setRefresh(!refresh)
    }

    const labelProps = {
        variant: "small",
        color: "white",
        className:
            "text-white !text-nowrap absolute top-2/4 -left-2/4 -translate-y-2/4 -translate-x-[88%] font-normal bg-black px-2 rounded-lg",
    };

    const actions = [
        { icon: <PencilSquareIcon className="w-6 sm:w-7 text-black" onClick={() => addInteraction("Circle")} />, name: 'Add area' },
        { icon: <MapPinIcon className="w-6 sm:w-7 text-black" onClick={() => addInteraction("Point")} />, name: 'Add point' },
        { icon: <XCircleIcon className="w-6 sm:w-7 text-black" onClick={clearSelection} />, name: 'Clear Area / Point' },
        { icon: <TrashIcon className="w-6 sm:w-7 text-black" onClick={clearAllSelection} />, name: 'Clear all Area / Points' },
        { icon: <CheckCircleIcon className="w-6 sm:w-7 text-black" onClick={updateSelection} />, name: 'Save Changes' },
    ];

    function handleHover() {
        setOnHover(!onHover);
    }


    return (
        <div className='overflow-hidden'>
            <div>
                <Alert open={error}
                    action={
                        <Button
                            variant="text"
                            color="white"
                            size="sm"
                            className="!absolute top-3 right-10"
                            onClick={() => setError(false)}
                        >
                            Close
                        </Button>
                    }
                    // onClose={() => setError(false)}
                    animate={{
                        mount: { y: 0 },
                        unmount: { y: 100 },
                    }} color="red">
                    Multiple areas selected please select single area.
                </Alert>
            </div>

            <ToastContainer autoClose={1000} transition={Zoom} hideProgressBar={true} />

            <div id="map" className='h-screen' style={{ width: "100%" }} />
            <Tooltip content="Reload Map" placement="top">
                <ArrowPathIcon onClick={reloadMap} className="p-1 sm:p-3 bg-theme_green absolute top-[10.2rem] right-20 sm:top-[10.2rem] md:top-[5.3rem] sm:right-28 md:right-24 mr-1 text-white w-8 sm:w-[54px] rounded-full" />
            </Tooltip>
            {onHover && (
                <div className='absolute text-sm text-white bg-black rounded-lg z-10 px-2 py-[0.1rem] top-[8.2rem] right-0 sm:top-[8.2rem] sm:right-0 md:top-[3.5rem] md:right-0 mr-1'><p>Update Area / Points </p></div>
            )}
            <div className='controls absolute top-[7.5rem] right-5 sm:top-[11.8rem] sm:right-8 md:top-[7rem] md:right-5'>
                <Box sx={{ height: 320, transform: 'translateZ(0px)', flexGrow: 1 }}>
                    <SpeedDial
                        ariaLabel="SpeedDial openIcon example"
                        sx={{ position: 'absolute', bottom: 16, right: 16 }}
                        icon={<SpeedDialIcon />}
                        direction='down'
                        onClick={toggleOpen}
                        open={open}
                        onMouseEnter={handleHover}
                        onMouseLeave={handleHover}
                    >
                        {actions.map((action) => (
                            <SpeedDialAction
                                key={action.name}
                                icon={action.icon}
                                tooltipTitle={action.name}
                                onClick={e => {
                                    e.stopPropagation();
                                }}
                            />
                        ))}
                    </SpeedDial>
                </Box>
            </div>
        </div>
    );
}

