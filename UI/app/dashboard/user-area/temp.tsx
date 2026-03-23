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

// import Box from '@mui/material/Box';
// import SpeedDial from '@mui/material/SpeedDial';
// import SpeedDialIcon from '@mui/material/SpeedDialIcon';
// import SpeedDialAction from '@mui/material/SpeedDialAction';

export default function UserArea() {

    const [dialOpen, setDialOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [userMapData, setUserMapData] = useState(null);
    const [error, setError] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const { data: session } = useSession();

    const mapRef = useRef(null);
    const sourceRef = useRef(null);
    const drawRef = useRef(null);
    const selectRef = useRef(null);

    if (!session || !session?.user) {
        redirect('/api/auth/signin?callback=/client')
    }

    let source: any; //new VectorSource({ wrapX: false });
    let map: any;
    let draw: any; // global so we can remove it later


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
            return styles[feature.getGeometry().getType()];
        };

        sourceRef.current = new VectorSource({ wrapX: false });


        if (userMapData?.isAreaExist && userMapData?.isPointsExist) {
            console.log("Point and area exist")
            let features = [];
            const areaCoord = transformExtent(userMapData?.area.coord, 'EPSG:4326', 'EPSG:3857');
            if (userMapData?.isAreaExist) {
                console.log("userMapData?.area.coord", userMapData?.area.coord)
                // const areaCoord = transformExtent(userMapData?.area.coord, 'EPSG:4326', 'EPSG:3857');
                let areaFeature = {
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
        }
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
                zoom: 8,
            }),
        });
        return () => {
            mapRef.current.setTarget(undefined);
        };
    }, [userMapData]);

    useEffect(() => {
        selectRef.current = new Select({
            condition: click,
            style: selectStyle,
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
        style: selectStyle,
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
            'points': []
        }
        let features = sourceRef.current.getFeatures();
        let areaCount = 0
        if (features.length > 0 && features[0] != null) {
            for (let f in features) {
                const geometryType = features[f].getGeometry().getType();
                if (geometryType === 'Point') {
                    let point = { 'coord': transformExtent(features[f].getGeometry()?.getExtent(), 'EPSG:3857', 'EPSG:4326') }
                    coordinates['points'].push(point)
                } else if (geometryType === 'Polygon') {
                    areaCount = areaCount + 1;
                    coordinates['area']['coord'] = transformExtent(features[f].getGeometry()?.getExtent(), 'EPSG:3857', 'EPSG:4326');
                }
            }
            console.log("count", areaCount)
            console.log("coordinates", coordinates)
            if (areaCount > 1) {
                setError(true);
            } else {
                try {
                    const result: any = await updateAreaAndPoint(coordinates);
                    console.log("result", result)
                    if (result?.message == "Area and points updated successfully") {
                        setUpdateSuccess(true);
                    }

                } catch (error) {
                    console.log("Error occured", error)
                }
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
            selectRef.current.on('select', function (e) {
                sourceRef.current.removeFeature(e.selected[0])
            });
        }

        // draw.removeLastPoint();
    }

    function clearAllSelection(event: any): void {
        let features = sourceRef.current.getFeatures();
        if (features != null && features.length > 0) {
            for (let x in features) {
                console.log(x)
                sourceRef.current.removeFeature(features[x]);
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
        { icon: <PencilSquareIcon className="w-6 sm:w-7" onClick={() => addInteraction("Circle")}/>, name: 'Add area' },
        { icon: <MapPinIcon className="w-6 sm:w-7" onClick={() => addInteraction("Point")}/>, name: 'Add point'},
        { icon: <XCircleIcon className="w-6 sm:w-7" onClick={clearSelection}/>, name: 'Clear Area / Point'},
        { icon: <TrashIcon className="w-6 sm:w-7" onClick={clearAllSelection}/>, name: 'Clear all Area / Points' },
        { icon: <CheckCircleIcon className="w-6 sm:w-7" onClick={updateSelection}/>, name: 'Save Changes' },
    ];

    function handleHover(e: Event) {
        setDialOpen(!dialOpen)

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
            {/* <div>
                <Alert open={updateSuccess}
                    className='absolute bottom-0 z-10 py-2'
                    action={
                        <Button
                            variant="text"
                            color="white"
                            size="sm"
                            className="!absolute top-3 right-10"
                            onClick={() => setUpdateSuccess(false)}
                        >
                            Close
                        </Button>
                    }
                    // onClose={() => setError(false)}
                    animate={{
                        mount: { y: 0 },
                        unmount: { y: 100 },
                    }} color="green">
                    Area and Points updated Successfully.
                </Alert>
            </div> */}

            <div id="map" className='h-screen' style={{ width: "100%" }} />
            <Tooltip content="Reload Map" placement="top">
                <ArrowPathIcon onClick={reloadMap} className="p-1 bg-theme_green absolute top-40 sm:top-40 md:top-20 right-24 mr-1 text-white w-7 sm:w-12 rounded-lg" />
            </Tooltip>
            <div className="absolute top-20 right-14  md:top-24 sm:right-4 h-80 w-full">
                <div className="absolute top-4 right-0 md:right-0">
                    {/* <Box sx={{ height: 320, transform: 'translateZ(0px)', flexGrow: 1}}>
                        <SpeedDial 
                            ariaLabel="SpeedDial openIcon example"
                            sx={{ position: 'absolute', bottom: 16, right: 16 }}
                            icon={<SpeedDialIcon />}
                            direction='down'
                            onClick={toggleOpen}
                            open={open}
                        >
                            {actions.map((action) => (
                                <SpeedDialAction
                                    key={action.name}
                                    icon={action.icon}
                                    tooltipTitle={action.name}
                                    onClick={e => {
                                        //addInteraction("Circle")
                                        //e.stopPropagation();
                                        addInteraction("Circle")
                                      }}
                                />
                            ))}
                        </SpeedDial>
                    </Box> */}

                    {/* <SpeedDial  placement='bottom' open={dialOpen} handler={setDialOpen} >
                        <SpeedDialHandler onClick={() => setDialOpen(!dialOpen)} className='temp'>
                            <IconButton size='lg' className="rounded-full border border-blue-gray-50 shadow-xl h-7 w-7 sm:h-36 sm:w-36 pointer-events-auto" >
                                <PlusIcon className="w-7 sm:w-10 transition-transform group-hover:rotate-45" />
                            </IconButton>
                        </SpeedDialHandler>
                        <SpeedDialContent className="rounded-full border border-blue-gray-50 bg-white shadow-xl shadow-black/10">
                            <SpeedDialAction className='bg-[#1e4d2b4a] min-w-9 min-h-9 sm:min-h-[48px] sm:min-w-[48px]'>
                                <PencilSquareIcon className="w-6 sm:w-7" onClick={() => addInteraction("Circle")} />
                                <Typography {...labelProps}>Add Area</Typography>
                            </SpeedDialAction>
                            <SpeedDialAction className='bg-[#1e4d2b4a] min-h-9 sm:min-h-[48px] min-w-9 sm:min-w-[48px]'>
                                <MapPinIcon className="w-6 sm:w-7" onClick={() => addInteraction("Point")} />
                                <Typography {...labelProps}>Add Point</Typography>
                            </SpeedDialAction>
                            <SpeedDialAction className='bg-[#1e4d2b4a] min-h-9 sm:min-h-[48px] min-w-9 sm:min-w-[48px]'>
                                <XCircleIcon className="w-6 sm:w-7" onClick={clearSelection} />
                                <Typography {...labelProps}>Remove Area / Point</Typography>
                            </SpeedDialAction>
                            <SpeedDialAction className='bg-[#1e4d2b4a] min-h-9 sm:min-h-[48px] min-w-9 sm:min-w-[48px]'>
                                <TrashIcon className="w-6 sm:w-7" onClick={clearAllSelection} />
                                <Typography {...labelProps}>Remove all Area / Points</Typography>
                            </SpeedDialAction>
                            <SpeedDialAction className='bg-[#1e4d2b4a] min-h-9 sm:min-h-[48px] min-w-9 sm:min-w-[48px]'>
                                <CheckCircleIcon className=" w-6 sm:w-7" onClick={updateSelection} />
                                <Typography {...labelProps}>Save Changes</Typography>
                            </SpeedDialAction>
                        </SpeedDialContent>
                    </SpeedDial> */}
                </div>
            </div>
            <div className='controls absolute top-40 sm:top-40 md:top-20 right-8'>
                    <Tooltip content="Edit Area and Points" placement="top">
                        <Button className={clsx(
                            'p-2 sm:p-4 bg-theme_green',
                            { 'sm:py-2': open === true },
                        )} onClick={toggleOpen}>{open ? <XMarkIcon className="w-6 sm:w-8" /> : 'Edit'}</Button>
                    </Tooltip>
                    <Collapse open={open}>
                        <Card className="my-1 mx-auto w-9 sm:my-2 sm:mx-auto sm:w-12">
                            <CardBody className='pl-1 pt-0 pb-0 sm:p-1'>
                                <Tooltip content="Add Area" placement="left">
                                    <PencilSquareIcon className="text-theme_green w-7 sm:w-10" onClick={() => addInteraction("Circle")} />
                                </Tooltip>
                                <Tooltip content="Add Point" placement="left">
                                    <MapPinIcon className="text-theme_green mt-1 sm:mt-2 w-7 sm:w-10" onClick={() => addInteraction("Point")} />
                                </Tooltip>
                                <Tooltip content="Remove Area / Point" placement="left">
                                    <XCircleIcon className="text-theme_green mt-1 sm:mt-2 w-7 sm:w-10" onClick={clearSelection} />
                                </Tooltip>
                                <Tooltip content="Remove all Area / Points" placement="left">
                                    <TrashIcon className="text-theme_green mt-1 sm:mt-2 w-7 sm:w-10" onClick={clearAllSelection} />
                                </Tooltip>
                                <Tooltip content="Save Changes" placement="left">
                                    <CheckCircleIcon className="text-theme_green mt-1 sm:mt-2 w-7 sm:w-10" onClick={updateSelection} />
                                </Tooltip>
                            </CardBody>
                        </Card>
                    </Collapse>

                {/* <Tooltip content="Select Area" placement="left">
                    <PencilSquareIcon className="w-10" onClick={() => addInteraction("Circle")} />
                </Tooltip>
                <Tooltip content="Select Point" placement="left">
                    <MapPinIcon className="mt-2 w-10" onClick={() => addInteraction("Point")} />
                </Tooltip>
                <Tooltip content="Clear Selection" placement="left">
                    <XCircleIcon className="mt-2 w-10" onClick={clearSelection} />
                </Tooltip>
                <Tooltip content="Clear All Selections" placement="left">
                    <TrashIcon className="mt-2 w-10" onClick={clearAllSelection} />
                </Tooltip>
                <Tooltip content="Confirm Selection" placement="left">
                    <CheckCircleIcon className="mt-2 w-10" onClick={updateSelection} />
                </Tooltip> */}
            </div>
        </div>
    );
}

