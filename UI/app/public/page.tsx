'use client'
import React, { useState, useEffect, useRef } from 'react';

import Map from '@/app/ui/public/map'
import PublicSideNav from '@/app/ui/public/public-sidenav'
import { productImageDir } from '../constants';
import { units } from '../constants';
import { products } from '../constants';

export default function Public() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
    const [images, setImages] = useState<string[]>([])
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [unit, setUnit] = useState(units.in)
    const currUnit = useRef(unit);
    const [productPath, setproductPath] = useState(productImageDir.atmosphericForecast.total_precip);
    const [opacity, setOpacity] = useState(1);
    const [colorbar, setColorbar] = useState(productImageDir.atmosphericForecast.total_precip.colorbar.in);
    const [prod_details, SetProdDetails] = useState({
        id: productImageDir.atmosphericForecast.total_precip.id,
        name: 'Precipitation',
        day: '',
        date: '',
        time: ''
    });
    const [productInfo, setProductInfo] = useState(productImageDir.atmosphericForecast.total_precip.info);
    const rainfall_units = [products.radarData.qpe_15min, products.radarData.qpe_1hr, products.radarData.pr,
    products.forecast.pr, products.forecast.tp]
    const forecast_products = [products.radarData.com_nowcast, products.forecast.pr, products.forecast.tp, products.forecast.temp]

    useEffect(() => {
        let details_json_path = '';
        if (rainfall_units.includes(productPath.id)) {
            const temp_unt = (unit == 'in/hr' || unit == 'mm/hr') ? unit.split('/')[0] : unit;
            details_json_path = productPath.details[temp_unt];
        } else if (productPath.id == productImageDir.atmosphericForecast.temp.id) {
            const temp_unt = (unit == productImageDir.atmosphericForecast.temp.unit.F) ? productImageDir.atmosphericForecast.temp.unit.F : 'DEG';
            details_json_path = productPath.details[temp_unt];
        } else {
            details_json_path = productPath.details;
        }
        console.log("details_json_path", details_json_path)
        fetchDetailsJSON(details_json_path);
    }, [productPath]);

    useEffect(() => {
        if (selectedProduct != null) {
            SetProdDetails({
                ...prod_details,
                ['date']: selectedProduct['steps'][currentIndex]['date'],
                ['day']: selectedProduct['steps'][currentIndex]['day'],
                ['time']: selectedProduct['steps'][currentIndex]['time'],
            });
        }
    }, [currentIndex]);

    useEffect(() => {
        if (selectedProduct != null) {
            console.log("selected product changed updating images")
            var productImages = []
            if (rainfall_units.includes(productPath.id)) {
                const temp_unt = (unit == 'in/hr' || unit == 'mm/hr') ? unit.split('/')[0] : unit;
                productImages = selectedProduct.steps.map(step => productPath.images + temp_unt + '/' + step.imageName);
            } else if (productPath.id == productImageDir.atmosphericForecast.temp.id) {
                const temp_unt = (unit == productImageDir.atmosphericForecast.temp.unit.F) ? productImageDir.atmosphericForecast.temp.unit.F : 'Deg';
                productImages = selectedProduct.steps.map(step => productPath.images + temp_unt + '/' + step.imageName);
            } else {
                productImages = selectedProduct.steps.map(step => productPath.images + step.imageName);
            }
            setImages(productImages);
            if (isPlaying) {
                if (intervalId) clearInterval(intervalId);
                setIsPlaying(false);
            }
            if (forecast_products.includes(productPath.id)) {
                setCurrentIndex(0);
                SetProdDetails({
                    id: productPath.id,
                    name: selectedProduct.product,
                    day: selectedProduct.steps[0].day,
                    date: selectedProduct.steps[0].date,
                    time: selectedProduct.steps[0].time,
                });
            } else {
                setCurrentIndex(productImages.length - 1);
                SetProdDetails({
                    id: productPath.id,
                    name: selectedProduct.product,
                    day: selectedProduct.steps[productImages.length - 1].day,
                    date: selectedProduct.steps[productImages.length - 1].date,
                    time: selectedProduct.steps[productImages.length - 1].time,
                });
            }
        }

    }, [selectedProduct])

    const fetchDetailsJSON = (path: string) => {
        fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log("data", data)
                setSelectedProduct(data);
                SetProdDetails({
                    ...prod_details,
                    ['id']: productPath.id,
                    ['date']: data['steps'][data['steps'].length - 1]['date'],
                    ['day']: data['steps'][data['steps'].length - 1]['day'],
                    ['time']: data['steps'][data['steps'].length - 1]['time'],
                })
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    const handleProductChange = (product: string) => {
        console.log("unit", unit)
        if (product == 'radar_pr') {
            setproductPath(productImageDir.radarData.precip_rate);
            setColorbar(productImageDir.radarData.precip_rate.colorbar.in);
            setUnit(productImageDir.radarData.precip_rate.unit.in);
            currUnit.current = productImageDir.radarData.precip_rate.unit.in;
            setProductInfo(productImageDir.radarData.precip_rate.info);
        } else if (product == 'qpe_15min') {
            setproductPath(productImageDir.radarData.qpe_15min);
            setColorbar(productImageDir.radarData.qpe_15min.colorbar.in);
            setUnit(productImageDir.radarData.qpe_15min.unit.in);
            currUnit.current = productImageDir.radarData.qpe_15min.unit.in;
            setProductInfo(productImageDir.radarData.qpe_15min.info);
        } else if (product == 'qpe_1hr') {
            setproductPath(productImageDir.radarData.qpe_1hr);
            setColorbar(productImageDir.radarData.qpe_1hr.colorbar.in);
            setUnit(productImageDir.radarData.qpe_1hr.unit.in);
            currUnit.current = productImageDir.radarData.qpe_1hr.unit.in;
            setProductInfo(productImageDir.radarData.qpe_1hr.info);
        } else if (product == 'pr') {
            setproductPath(productImageDir.atmosphericForecast.precip_rate);
            setColorbar(productImageDir.atmosphericForecast.precip_rate.colorbar.in);
            setUnit(productImageDir.atmosphericForecast.precip_rate.unit.in);
            currUnit.current = productImageDir.atmosphericForecast.precip_rate.unit.in;
            setProductInfo(productImageDir.atmosphericForecast.precip_rate.info);
        } else if (product == 'tp') {
            setproductPath(productImageDir.atmosphericForecast.total_precip);
            setColorbar(productImageDir.atmosphericForecast.total_precip.colorbar.in);
            setUnit(productImageDir.atmosphericForecast.total_precip.unit.in);
            currUnit.current = productImageDir.atmosphericForecast.total_precip.unit.in;
            setProductInfo(productImageDir.atmosphericForecast.total_precip.info);
        } else if (product == 'comp_ref') {
            setproductPath(productImageDir.radarData.comp_ref);
            setColorbar(productImageDir.radarData.comp_ref.colorbar.dbz);
            setUnit(productImageDir.radarData.comp_ref.unit.dbz)
            currUnit.current = productImageDir.radarData.comp_ref.unit.dbz;
            setProductInfo(productImageDir.radarData.comp_ref.info);
        } else if (product == 'comp_now') {
            setproductPath(productImageDir.radarData.comp_now);
            setColorbar(productImageDir.radarData.comp_now.colorbar.dbz);
            setUnit(productImageDir.radarData.comp_now.unit.dbz)
            currUnit.current = productImageDir.radarData.comp_now.unit.dbz;
            setProductInfo(productImageDir.radarData.comp_now.info);
        } else if (product == 'temp') {
            setproductPath(productImageDir.atmosphericForecast.temp);
            setColorbar(productImageDir.atmosphericForecast.temp.colorbar.F);
            setUnit(productImageDir.atmosphericForecast.temp.unit.F)
            currUnit.current = productImageDir.atmosphericForecast.temp.unit.F;
            setProductInfo(productImageDir.atmosphericForecast.temp.info);
        } else if (product == 'water_level') {
            //window.open('https://sfbay-dist.engr.colostate.edu', '_blank');
            setproductPath(productImageDir.cosmos.water_level);
            setColorbar(productImageDir.cosmos.water_level.colorbar.ft);
            setUnit(productImageDir.cosmos.water_level.unit.ft)
            currUnit.current = productImageDir.cosmos.water_level.unit.ft;
            setProductInfo(productImageDir.cosmos.water_level.info);
        } else if (product == 'water_depth') {
            setproductPath(productImageDir.cosmos.water_depth);
            setColorbar(productImageDir.cosmos.water_depth.colorbar.ft);
            setUnit(productImageDir.cosmos.water_depth.unit.ft)
            currUnit.current = productImageDir.cosmos.water_depth.unit.ft;
            setProductInfo(productImageDir.cosmos.water_depth.info);
        } else if (product == 'max_water_level') {
            setproductPath(productImageDir.cosmos.max_water_level);
            setColorbar(productImageDir.cosmos.max_water_level.colorbar.ft);
            setUnit(productImageDir.cosmos.max_water_level.unit.ft)
            currUnit.current = productImageDir.cosmos.max_water_level.unit.ft;
            setProductInfo(productImageDir.cosmos.max_water_level.info);
        } else if (product == 'max_water_depth') {
            setproductPath(productImageDir.cosmos.max_water_depth);
            setColorbar(productImageDir.cosmos.max_water_depth.colorbar.ft);
            setUnit(productImageDir.cosmos.max_water_depth.unit.ft)
            currUnit.current = productImageDir.cosmos.max_water_depth.unit.ft;
            setProductInfo(productImageDir.cosmos.max_water_depth.info);
            window.open('https://sfbay-dist.engr.colostate.edu', '_blank');
        } else if (product == 'stream_reach') {
            setproductPath({
                id: 'stream_reach',
                name: 'Stream Reach',
                images: '',
                details: '',
                colorbar: '', 
                unit: ''
            });
            setImages([]); // this now triggers Map.tsx to clear the layer
            setCurrentIndex(0); 
            setColorbar('');
            setUnit('');
            setProductInfo('Stream reach product');
            SetProdDetails({
                id: 'stream_reach',
                name: 'Stream Reach',
                day: '',
                date: '',
                time: ''
            });
        }
        
    }

    const handleStepBackward = () => {
        setCurrentIndex(0);
        SetProdDetails({
            ...prod_details,
            ['date']: selectedProduct['steps'][0]['date'],
            ['day']: selectedProduct['steps'][0]['day'],
            ['time']: selectedProduct['steps'][0]['time'],
        });
    }
    const handleStepForward = () => {
        setCurrentIndex(images.length - 1);
        SetProdDetails({
            ...prod_details,
            ['date']: selectedProduct['steps'][images.length - 1]['date'],
            ['day']: selectedProduct['steps'][images.length - 1]['day'],
            ['time']: selectedProduct['steps'][images.length - 1]['time'],
        })
    }

    const handlePlayPause = () => {
        if (isPlaying) {
            if (intervalId) clearInterval(intervalId);
            setIsPlaying(false);
        } else {
            const id = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
            }, 700);
            setIntervalId(id);
            setIsPlaying(true);
        }
    };
    const handleBackward = () => {
        setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
        SetProdDetails({
            ...prod_details,
            ['date']: selectedProduct['steps'][currentIndex]['date'],
            ['day']: selectedProduct['steps'][currentIndex]['day'],
            ['time']: selectedProduct['steps'][currentIndex]['time'],
        });
    }
    const handleForward = () => {
        setCurrentIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : images.length - 1));
        SetProdDetails({
            ...prod_details,
            ['date']: selectedProduct['steps'][currentIndex]['date'],
            ['day']: selectedProduct['steps'][currentIndex]['day'],
            ['time']: selectedProduct['steps'][currentIndex]['time'],
        });
    }

    const handleOpacityChange = (opacity: number) => {
        setOpacity(opacity);
    }

    const handleUnitChange = (selUnit: string, selProduct: string) => {
        console.log("selUnit", selUnit)
        let json_path = '';
        currUnit.current = selUnit
        if ([productImageDir.radarData.qpe_15min.id, productImageDir.radarData.qpe_1hr.id, productImageDir.atmosphericForecast.total_precip.id].includes(selProduct)) {
            setUnit(productPath.unit[selUnit]);
            setColorbar(productImageDir.radarData.qpe_15min.colorbar[selUnit]);
            json_path = productPath.details[selUnit]
        } else if (selProduct == productImageDir.radarData.precip_rate.id || selProduct == productImageDir.atmosphericForecast.precip_rate.id) {
            setUnit(productPath.unit[selUnit]);
            setColorbar(productImageDir.radarData.precip_rate.colorbar[selUnit]);
            json_path = productPath.details[selUnit]
        } else if (selProduct == productImageDir.atmosphericForecast.temp.id) {
            const temp_unt = (selUnit == productImageDir.atmosphericForecast.temp.unit.F) ? productImageDir.atmosphericForecast.temp.unit.F : 'DEG';
            setUnit(productPath.unit[temp_unt]);
            setColorbar(productImageDir.atmosphericForecast.temp.colorbar[temp_unt]);
            json_path = productPath.details[temp_unt]
        }
        fetchDetailsJSON(json_path);
        //updateimagePaths();
    }

    useEffect(() => {
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [intervalId]);

    return (
        <div className="flex flex-col md:flex-row md:overflow-hidden lg:overflow-hidden">
            <div className="w-full md:w-64 2xl:w-[20rem] flex-none">
                <PublicSideNav
                    onStepBackward={handleStepBackward}
                    onBackward={handleBackward}
                    onPlayPause={handlePlayPause}
                    onForward={handleForward}
                    onStepForward={handleStepForward}
                    onProductChange={handleProductChange}
                    onOpacityChange={handleOpacityChange}
                    isPlaying={isPlaying}
                    prod_details={prod_details}
                />
            </div>
            <div className="h-screen flex grow w-screen">
                <main className='w-full h-screen'>
                    <Map
                        onUnitChange={handleUnitChange}
                        images={images}
                        currentIndex={currentIndex}
                        prod_details={prod_details}
                        opacity={opacity}
                        colorbar={colorbar}
                        unit={unit}
                        productInfo={productInfo}
                    />
                </main>
            </div>
        </div>
    );
}