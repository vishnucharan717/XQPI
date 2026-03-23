const userProductsDescription = {
    HRRR_TP: "HRRR Total Precipitation",
    HRRR_PR: "HRRR Precipitation Rate",
    HRRR15_PR: "HRRR 15min Precipitation Rate",
    GFS_TP: "GFS Total Precipitation",
    BLEND_TP: "BLEND Total Precipitation",
    QPE_15m: "15min QPE",
    QPE_1hr: "1hr QPE",
    QPE_PR: "QPE Precipitation rate"
}

const radarCoordinates = {
    XSCV: {
        lat: 37.3989,
        lon: -121.8334,
        range: 40000
    },
    XSCW: {
        lat: 38.5216,
        lon: -122.8022,
        range: 40000
    },
    XSCR: {
        lat: 36.9847,
        lon: -121.9786,
        range: 40000
    },
    XEBY: {
        lat: 37.8156,
        lon: -122.0620,
        range: 40000
    },
    KBBX: {
        lat: 39.4956,
        lon: -121.6316,
        range: 100000
    },
    KDAX: {
        lat: 38.501,
        lon: -121.677,
        range: 100000
    },
    KMUX: {
        lat: 37.1553,
        lon: -121.898,
        range: 100000
    }
}

const units = {
    in: 'in',
    in_per_hr: 'in/hr',
    mm: 'mm',
    mm_per_hr: 'mm/hr',
    dbz: 'dbz',
    F: 'F',
    DEG: '°C'
}

const products = {
    radarData: {
        qpe_15min: 'qpe_15min',
        qpe_1hr: 'qpe_1hr',
        pr: 'radar_pr',
        com_ref: 'comp_ref',
        com_nowcast: 'comp_now'
    },
    forecast: {
        tp: 'tp',
        pr: 'pr',
        temp: 'temp'
    }
}

const productImageDir = {
    radarData: {
        qpe_15min: {
            id: 'qpe_15min',
            unit: {
                in: 'in',
                mm: 'mm'
            },
            images: '/products/qpe_15min/images/',
            details: {
                in: '/products/qpe_15min/details_in.json',
                mm: '/products/qpe_15min/details_mm.json'
            },
            colorbar: {
                in: '/images/colormap_accum_in.png',
                mm: '/images/colormap_accum_mm.png'
            },
            info:'Precipitation accumulations derived from the summation of the Precip Rate product over a 15-minute time interval ending at the file time. The final product is available every 2 minutes. Spatial resolution is 250m by 250m. Units are in mm and inches.'
        },
        qpe_1hr: {
            id: 'qpe_1hr',
            unit: {
                in: 'in',
                mm: 'mm'
            },
            images: '/products/qpe_1hr/images/',
            details: {
                in: '/products/qpe_1hr/details_in.json',
                mm: '/products/qpe_1hr/details_mm.json'
            },
            colorbar: {
                in: '/images/colormap_accum_in.png',
                mm: '/images/colormap_accum_mm.png'
            },
            info:'Precipitation accumulations derived from the summation of the Precip Rate product over a 1-hour time interval ending at the file time. The final product is available every 2 minutes. Spatial resolution is 250m by 250m.  Units are in mm and inches'
        },
        precip_rate: {
            id: 'radar_pr',
            unit: {
                in: 'in/hr',
                mm: 'mm/hr'
            },
            images: '/products/radar_precip_rate/images/',
            details: {
                in: '/products/radar_precip_rate/details_in.json',
                mm: '/products/radar_precip_rate/details_mm.json'
            },
            colorbar: {
                in: '/images/colorbar_prate_in.png',
                mm: '/images/colorbar_prate_mm.png'
            },
            info:'Precipitation rate estimated based on radar observations. Dual-pol X-Band data is used where available and gaps in the domain are filled by the MRMS Surface Precipitation Rate (SPR) product which is available every 2 minutes. The MRMS product is interpolated to 250m by 250m spatial resolution. The final product is available every 2 minutes. Units are mm/h and inches/h.'
        },
        comp_ref: {
            id: 'comp_ref',
            unit: {
                dbz: 'dbz'
            },
            images: '/products/composite_ref/images/',
            details: '/products/composite_ref/details.json',
            colorbar: {
                dbz: '/images/colormap_ref.png',
            },
            info:'Maximum reflectivity in a column. Created by merging observations from 7 radars that are available in the AQPI domain. 3 NEXRADs - KBBX, KDAX, and KMUX and 4 X-Bands - XSCW, XEBY, XSCV, and XSCR. Spatial resolution is 250m by 250m. The final product is available every 2 minutes. Unit is dBZ.'
        },
        comp_now: {
            id: 'comp_now',
            unit: {
                dbz: 'dbz'
            },
            images: '/products/composite_nowcast/images/',
            details: '/products/composite_nowcast/details.json',
            colorbar: {
                dbz: '/images/colormap_ref.png',
            },
            info:'1-hour lead time nowcast of radar reflectivity based on the Composite Reflectivity product. The product is available every 2 minutes.  Unit is dBZ.'
        },
    },
    atmosphericForecast: {
        total_precip: {
            id: 'tp',
            unit: {
                in: 'in',
                mm: 'mm'
            },
            images: '/products/total_precip/images/',
            details: {
                in: '/products/total_precip/details_in.json',
                mm: '/products/total_precip/details_mm.json'
            },
            colorbar: {
                in: '/images/colormap_accum_in.png',
                mm: '/images/colormap_accum_mm.png'
            },
            info:'Total accumulated precipitation (in inches or mm) forecasted over 120 hours, updated every hour. The first 18 hours are forecasted by the HRRR model, and the 19-120-hour forecasts are from the National Blend of Models. The spatial resolution is 3 km, and the temporal resolution is one hour.'
        },
        precip_rate: {
            id: 'pr',
            unit: {
                in: 'in/hr',
                mm: 'mm/hr'
            },
            images: '/products/precip_rate/images/',
            details: {
                in: '/products/precip_rate/details_in.json',
                mm: '/products/precip_rate/details_mm.json'
            },
            colorbar: {
                in: '/images/colorbar_prate_in.png',
                mm: '/images/colorbar_prate_mm.png'  
            },
            info:'Precipitation rate (in inches/hour or mm/hr) forecasted by the HRRR model for 18 hours, updated every hour. The spatial resolution is 3 km, and the temporal resolution is 15 minutes.'
        },
        temp: {
            id: 'temp',
            unit: {
                F: 'F',
                DEG: '°C'
            },
            images: '/products/temperature/images/',
            details: {
                DEG: '/products/temperature/details_Deg.json',
                F: '/products/temperature/details_F.json'
            },
            colorbar: {
                F: '/images/colormap_temp_f.png',
                DEG: '/images/colormap_temp_deg.png'
            },
            info:'Temperature (in Fahrenheit or Degree (Celsius)) forecasted over 120 hours, updated every hour. The first 18 hours are forecasted by the HRRR model, and the 19-120-hour forecasts are from the National Blend of Models. The spatial resolution is 3 km, and the temporal resolution is one hour.'
        },
    },
}

module.exports = {
    userProductsDescription,
    radarCoordinates,
    units,
    products,
    productImageDir
};