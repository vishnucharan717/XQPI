'use client'

import React, { useEffect } from 'react';
import {
    Card,
    Typography,
    List,
    ListItem,
    ListItemPrefix,
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";
import {
    Popover,
    PopoverHandler,
    PopoverContent,
    Button,
} from "@material-tailwind/react";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSatelliteDish } from '@fortawesome/free-solid-svg-icons'
import { faCloudShowersHeavy } from '@fortawesome/free-solid-svg-icons'
import { faBackwardStep } from '@fortawesome/free-solid-svg-icons'
import { faBackward } from '@fortawesome/free-solid-svg-icons'
import { faForwardStep } from '@fortawesome/free-solid-svg-icons'
import { faForward } from '@fortawesome/free-solid-svg-icons'
import { faCirclePlay } from '@fortawesome/free-solid-svg-icons'
import { faPause } from "@fortawesome/free-solid-svg-icons";
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { Tooltip } from "@material-tailwind/react";


const marks = [
    {
        value: 0,
        label: '0',
    },
    {
        value: 20,
        label: '20',
    },
    {
        value: 40,
        label: '40',
    },
    {
        value: 60,
        label: '60',
    },
    {
        value: 80,
        label: '80',
    },
    {
        value: 100,
        label: '100',
    },
];

function valuetext(value: number) {
    return `${value}`;
}


export default function PublicSideNav({
    onStepBackward,
    onBackward,
    onPlayPause,
    onForward,
    onStepForward,
    onProductChange,
    onOpacityChange,
    isPlaying,
    prod_details
}: {
    onStepBackward: () => void;
    onBackward: () => void;
    onPlayPause: () => void;
    onForward: () => void;
    onStepForward: () => void;
    onProductChange: (product: string) => void;
    onOpacityChange: (opacity: number) => void;
    isPlaying: boolean;
    prod_details: object;
}) {
    const [open, setOpen] = useState(2);
    const handleOpen = (value: number) => {
        setOpen(open === value ? 0 : value);
    };

    useEffect(() => {
        // Get the slider thumb element
        const thumb = document.querySelector('.MuiSlider-thumb');
        if (thumb) {
            thumb.setAttribute('data-value', valuetext(100)); // Set initial value
        }
    }, []);

    const updateThumbValue = (value: number) => {
        // Function to update the value on the thumb
        onOpacityChange(value / 100);
        const thumb = document.querySelector('.MuiSlider-thumb');
        if (thumb) {
            thumb.setAttribute('data-value', valuetext(value));
        }
    };

    return (
        <div className="flex">
            <div className="flex w-screen h-[48px] grow flex-row justify-between space-x-3 mt-0 p-8 px-4 md:hidden ">
                <div className="flex grow items-center justify-center gap-2">
                    <Popover placement="bottom">
                        <PopoverHandler className="w-full bg-[#1e4d2b4a] text-black p-2">
                            <Button><FontAwesomeIcon icon={faSatelliteDish} size="2x" color="#1e4d2b" /></Button>
                        </PopoverHandler>
                        <PopoverContent className="w-72 justify-center z-10">
                            <div className="mb-4 flex items-center gap-4 border-b border-blue-gray-50 p-2 rounded-lg bg-[#eceff180]">
                                <FontAwesomeIcon icon={faSatelliteDish} size="2x" color="#1e4d2b" />
                                <div>
                                    <Typography variant="h6" color="blue-gray">
                                        Radar Data
                                    </Typography>
                                </div>
                            </div>
                            <List className="p-0">
                                <ListItem onClick={() => onProductChange('qpe_15min')}>
                                    <ListItemPrefix>
                                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                    </ListItemPrefix>
                                    Total Precip, 15 minute QPE
                                </ListItem>
                                <ListItem onClick={() => onProductChange('qpe_1hr')}>
                                    <ListItemPrefix>
                                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                    </ListItemPrefix>
                                    Total Precip, 1 hour QPE
                                </ListItem>
                                <ListItem onClick={() => onProductChange('radar_pr')}>
                                    <ListItemPrefix>
                                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                    </ListItemPrefix>
                                    Precip Rate
                                </ListItem>
                                <ListItem onClick={() => onProductChange('comp_ref')}>
                                    <ListItemPrefix>
                                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                    </ListItemPrefix>
                                    Composite Reflectivity
                                </ListItem>
                                <ListItem onClick={() => onProductChange('comp_now')}>
                                    <ListItemPrefix>
                                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                    </ListItemPrefix>
                                    Composite Nowcast
                                </ListItem>
                            </List>
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="flex grow items-center justify-center gap-2">
                    <Popover placement="bottom-end">
                        <PopoverHandler className="w-full bg-[#1e4d2b4a] text-black p-2">
                            <Button><FontAwesomeIcon icon={faCloudShowersHeavy} size="2x" color="#1e4d2b" /></Button>
                        </PopoverHandler>
                        <PopoverContent className="w-72">
                            <div className="mb-4 flex items-center gap-4 border-b border-blue-gray-50 p-2 rounded-lg bg-[#eceff180]">
                                <FontAwesomeIcon icon={faCloudShowersHeavy} size="2x" color="#1e4d2b" />
                                <div>
                                    <Typography variant="h6" color="blue-gray">
                                        Atmospheric Forecast
                                    </Typography>
                                </div>
                            </div>
                            <List className="p-0">
                                <ListItem onClick={() => onProductChange('tp')}>
                                    <ListItemPrefix>
                                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                    </ListItemPrefix>
                                    Total Precip
                                </ListItem>
                                <ListItem onClick={() => onProductChange('pr')}>
                                    <ListItemPrefix>
                                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                    </ListItemPrefix>
                                    Precip Rate
                                </ListItem>
                                <ListItem onClick={() => onProductChange('temp')}>
                                    <ListItemPrefix>
                                        <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                    </ListItemPrefix>
                                    Temperature
                                </ListItem>
                            </List>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="hidden md:flex min-h-screen w-full mr-5 2xl:mr-0">
                <div className="2xl:w-full">
                    <Card className=" h-full w-full rounded-none shadow-xl shadow-blue-gray-900/5">
                        <List className="text-black">
                            <Accordion
                                open={open === 1}
                                icon={
                                    <ChevronDownIcon
                                        strokeWidth={2.5}
                                        className={`mx-auto h-4 w-4 transition-transform ${open === 1 ? "rotate-180" : ""}`}
                                    />
                                }
                            >
                                <ListItem className={clsx("p-0 hover:bg-[#1e4d2b4a]", { 'bg-[#1e4d2b4a] text-theme_green': open === 1 })} selected={open === 1}>
                                    <AccordionHeader onClick={() => handleOpen(1)} className="border-b-0 p-2">
                                        <ListItemPrefix className="text-black">
                                            {/* <StormIcon fontSize="large" sx={{ color: '1e4d2b4a' }} className="h-5 w-5" /> */}
                                            <FontAwesomeIcon icon={faSatelliteDish} size="xl" color="#1e4d2b" />
                                        </ListItemPrefix>
                                        <Typography color="black" className="mr-auto font-normal">
                                            Radar Data
                                        </Typography>
                                    </AccordionHeader>
                                </ListItem>
                                <AccordionBody className="py-1">
                                    <List className="p-0 text-black">
                                        <ListItem onClick={() => onProductChange('qpe_15min')} className={clsx({ '!bg-[#eceff1cc] text-theme_green': prod_details?.id == 'qpe_15min' })}>
                                            <ListItemPrefix>
                                                <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                            </ListItemPrefix>
                                            Total Precip, 15 minute QPE
                                        </ListItem>
                                        <ListItem onClick={() => onProductChange('qpe_1hr')} className={clsx({ '!bg-[#eceff1cc] text-theme_green': prod_details?.id == 'qpe_1hr' })}>
                                            <ListItemPrefix>
                                                <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                            </ListItemPrefix>
                                            Total Precip, 1 hour QPE
                                        </ListItem>
                                        <ListItem onClick={() => onProductChange('radar_pr')} className={clsx({ '!bg-[#eceff1cc] text-theme_green': prod_details?.id == 'radar_pr' })}>
                                            <ListItemPrefix>
                                                <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                            </ListItemPrefix>
                                            Precip Rate
                                        </ListItem>
                                        <ListItem onClick={() => onProductChange('comp_ref')} className={clsx({ '!bg-[#eceff1cc] text-theme_green': prod_details?.id == 'comp_ref' })}>
                                            <ListItemPrefix>
                                                <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                            </ListItemPrefix>
                                            Composite Reflectivity
                                        </ListItem>
                                        <ListItem onClick={() => onProductChange('comp_now')} className={clsx({ '!bg-[#eceff1cc] text-theme_green': prod_details?.id == 'comp_now' })}>
                                            <ListItemPrefix>
                                                <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                            </ListItemPrefix>
                                            Composite Nowcast
                                        </ListItem>
                                    </List>
                                </AccordionBody>
                            </Accordion>
                            <hr className="my-2 border-blue-gray-50" />
                            <Accordion
                                open={open === 2}
                                icon={
                                    <ChevronDownIcon
                                        strokeWidth={2.5}
                                        className={`mx-auto h-4 w-4 transition-transform ${open === 2 ? "rotate-180" : ""}`}
                                    />
                                }
                            >
                                <ListItem className={clsx("p-0 hover:bg-[#1e4d2b4a]", { 'bg-[#1e4d2b4a] text-theme_green': open === 2 })} selected={open === 2}>
                                    <AccordionHeader onClick={() => handleOpen(2)} className="border-b-0 p-2">
                                        <ListItemPrefix className="text-black">
                                            {/* <ThunderstormIcon fontSize="large" className="h-5 w-5" /> */}
                                            <FontAwesomeIcon icon={faCloudShowersHeavy} size="xl" color="#1e4d2b" />
                                        </ListItemPrefix>
                                        <Typography color="black" className="mr-auto font-normal">
                                            Atmospheric Forecast
                                        </Typography>
                                    </AccordionHeader>
                                </ListItem>
                                <AccordionBody className="py-1">
                                    <List className="p-0 text-black">
                                        <ListItem onClick={() => onProductChange('tp')} className={clsx({ '!bg-[#eceff1cc] text-theme_green': prod_details?.id == 'tp' })}>
                                            <ListItemPrefix>
                                                <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                            </ListItemPrefix>
                                            Total Precip
                                        </ListItem>
                                        <ListItem onClick={() => onProductChange('pr')} className={clsx({ '!bg-[#eceff1cc] text-theme_green': prod_details?.id == 'pr' })}>
                                            <ListItemPrefix>
                                                <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                            </ListItemPrefix>
                                            Precip Rate
                                        </ListItem>
                                        <ListItem onClick={() => onProductChange('temp')} className={clsx({ '!bg-[#eceff1cc] text-theme_green': prod_details?.id == 'temp' })}>
                                            <ListItemPrefix>
                                                <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                                            </ListItemPrefix>
                                            Temperature
                                        </ListItem>
                                    </List>
                                </AccordionBody>
                            </Accordion>
                            <hr className="my-2 border-blue-gray-50" />
                            <div className="flex flex-row justify-start 2xl:justify-center space-x-5">
                                <Tooltip content="Step First" placement="bottom" className="text-xs">
                                    <FontAwesomeIcon icon={faBackwardStep} size="2xl" color="#1e4d2b" opacity={isPlaying ? 0.4 : 1} onClick={isPlaying ? undefined : onStepBackward} />
                                </Tooltip>
                                <Tooltip content="Step Backward" placement="bottom" className="text-xs">
                                    <FontAwesomeIcon icon={faBackward} size="2xl" color="#1e4d2b" opacity={isPlaying ? 0.4 : 1} onClick={isPlaying ? undefined : onBackward} />
                                </Tooltip>
                                {!isPlaying && (
                                    <Tooltip content="Play" placement="bottom" className="text-xs">
                                        <div>
                                            <FontAwesomeIcon icon={faCirclePlay} size="2xl" color="#1e4d2b" onClick={onPlayPause} />
                                        </div>
                                    </Tooltip>
                                )}
                                {isPlaying && (
                                    <Tooltip content="Stop" placement="bottom" className="text-xs">
                                        <div>
                                            <FontAwesomeIcon icon={faPause} size="2xl" color="#1e4d2b" onClick={onPlayPause} />
                                        </div>
                                    </Tooltip>
                                )}
                                <Tooltip content="Step Forward" placement="bottom" className="text-xs">
                                    <FontAwesomeIcon icon={faForward} size="2xl" color="#1e4d2b" opacity={isPlaying ? 0.4 : 1} onClick={isPlaying ? undefined : onForward} />
                                </Tooltip>
                                <Tooltip content="Step Last" placement="bottom" className="text-xs">
                                    <FontAwesomeIcon icon={faForwardStep} size="2xl" color="#1e4d2b" opacity={isPlaying ? 0.4 : 1} onClick={isPlaying ? undefined : onStepForward} />
                                </Tooltip>
                            </div>
                            <hr className="my-2 border-blue-gray-50" />
                            <span className='text-center font-Roboto font-sans-serif font-bold'>Image Opacity</span>
                            <div className="px-2 pr-5">
                                <Box sx={{
                                    color: '#1e4d2b',
                                    '& .MuiSlider-root': {
                                        color: '#1e4d2b',
                                        height: 5,
                                    },
                                    '& .MuiSlider-markLabel': {
                                        color: '#1e4d2b',
                                        paddingTop: 0
                                    },
                                    '& .MuiSlider-thumb': {
                                        color: '#1e4d2b',
                                        height: 25,
                                        width: 25,
                                        '&::before': {
                                            content: 'attr(data-value)',
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            color: '#ffffff', // Text color inside the thumb
                                            fontSize: '12px', // Adjust as needed
                                            fontWeight: 'bold', // Optional for bold text
                                            paddingLeft: '0.3rem',
                                            paddingTop: '0.1rem'
                                        },
                                    },

                                }}>
                                    <Slider
                                        aria-label="Small steps"
                                        defaultValue={100}
                                        getAriaValueText={valuetext}
                                        step={10}
                                        min={0}
                                        max={100}
                                        valueLabelDisplay="off"
                                        marks={marks}
                                        onChange={(event, value) => updateThumbValue(value)}
                                        onChangeCommitted={(event, value) => updateThumbValue(value)}
                                    />
                                </Box>
                            </div>
                        </List>
                    </Card>

                </div>

            </div>
            <div className="flex bg-theme_green flex-row grow justify-center sm:justify-evenly space-x-0 px-0 sm:px-8 sm:px-0 py-2 absolute md:hidden bottom-0 z-10 w-full">
                <div className='border-[1.5px] rounded-3xl border-white p-1 mr-2 sm:mr-0 shadow-white shadow-sm'>
                    <FontAwesomeIcon icon={faBackwardStep} size="xl" color="white" className="md:px-0 px-2" opacity={isPlaying ? 0.4 : 1} onClick={isPlaying ? undefined : onStepBackward} />
                    <FontAwesomeIcon icon={faBackward} size="xl" color="white" className="md:px-0 px-2" opacity={isPlaying ? 0.4 : 1} onClick={isPlaying ? undefined : onBackward} />
                    {!isPlaying && <FontAwesomeIcon icon={faCirclePlay} size="xl" color="white" className="md:px-0 px-2" onClick={isPlaying ? undefined : onPlayPause} />}
                    {isPlaying && <FontAwesomeIcon icon={faPause} size="xl" color="white" className="md:px-0 px-2" onClick={onPlayPause} />}
                    <FontAwesomeIcon icon={faForward} size="xl" color="white" className="md:px-0 px-2" opacity={isPlaying ? 0.4 : 1} onClick={isPlaying ? undefined : onForward} />
                    <FontAwesomeIcon icon={faForwardStep} size="xl" color="white" className="md:px-0 px-2" opacity={isPlaying ? 0.4 : 1} onClick={isPlaying ? undefined : onStepForward} />
                </div>
                <div className="">
                    <Box sx={{
                        color: '#1e4d2b',
                        '& .MuiSlider-root': {
                            color: 'white',
                            height: 5,
                            width: 200,
                            paddingTop: 0,
                            paddingBottom: 0,
                            '@media (max-width: 539px)': {
                                width: 170,  // Width for screens <= 480px
                            },
                        },
                        '& .MuiSlider-markLabel': {
                            color: 'white',
                            paddingTop: 0
                        },
                        '& .MuiSlider-thumb': {
                            color: 'white',
                            height: 25,
                            width: 25,
                            '&::before': {
                                content: 'attr(data-value)',
                                position: 'absolute',
                                top: '64%',
                                left: '54%',
                                transform: 'translate(-50%, -50%)',
                                color: 'black', // Text color inside the thumb
                                fontSize: '12px', // Adjust as needed
                                fontWeight: 'bold', // Optional for bold text
                                padding: '1px',
                            },
                        },

                    }}>
                        <Slider
                            aria-label="Small steps"
                            defaultValue={100}
                            getAriaValueText={valuetext}
                            step={10}
                            min={0}
                            max={100}
                            valueLabelDisplay="auto"
                            onChange={(event, value) => updateThumbValue(value)}
                            onChangeCommitted={(event, value) => updateThumbValue(value)}
                        />
                    </Box>
                </div>
            </div>
        </div>
    )
}
