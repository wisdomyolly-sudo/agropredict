import { CropFamily, WaterNeedLevel } from './index';

export type DataSourceType =
  | 'power'
  | 'gpm_imerg'
  | 'smap'
  | 'srtm'
  | 'landsat'
  | 'modis'
  | 'ecostress'
  | 'gaez'
  | 'era5'
  | 'irad_catalog'
  | 'field_survey';

export type DataQualityGrade = 'high' | 'medium' | 'fallback';

export interface DataTraceabilityMetadata {
  _source: DataSourceType;
  _quality: DataQualityGrade;
  _spatialResolution: string;
  _temporalCoverage: string;
  _lastUpdated: string;
  _citation: string;
  _warning?: string;
}

/**
 * Normalized Climate Features (NASA POWER + GPM IMERG + ERA5 backstop)
 */
export interface ClimateFeatures {
  meta: DataTraceabilityMetadata;
  seasonalRainfallMm: number;        // Accumulated rainfall over 120-day season (IMERG)
  annualRainfallMm: number;          // 12-month accumulated rainfall (IMERG 20-yr mean: ~1560 mm)
  rainyDaysCount: number;            // Number of days with rain > 1mm
  drySpellMaxDays: number;           // Maximum consecutive dry days during season
  heavyRainEventFrequency: number;   // Days with rain > 25mm (flash erosion risk)
  meanTemperatureC: number;          // Mean 2m air temp (POWER: ~24.8°C)
  maxDailyTemperatureC: number;      // Peak daily max temp (POWER: ~31.2°C)
  minDailyTemperatureC: number;      // Peak daily min temp (POWER: ~19.5°C)
  thermalDegreeDays: number;         // Cumulative GDD base 10°C (~1650 GDD)
  solarRadiationMjM2Day: number;     // All-sky surface downward solar irradiance (POWER: ~17.8 MJ/m²/day)
  relativeHumidityPercent: number;   // Mean relative humidity (POWER: ~78%)
  era5ConsistencyIndex: number;      // 0-100 agreement between POWER and ERA5 reanalysis
}

/**
 * Normalized Soil Features (NASA SMAP + IRAD Ferrallitic pedology)
 */
export interface SoilFeatures {
  meta: DataTraceabilityMetadata;
  surfaceMoistureM3M3: number;       // SMAP L3 0-5cm volumetric soil moisture (~0.28 cm³/cm³)
  surfaceMoisturePercent: number;    // Converted to percentage (28%)
  rootZoneMoisturePercent: number;   // SMAP L4 / modeled root zone (0-100cm: ~34%)
  soilType: string;                  // 'Sols ferrallitiques rouges profonds (Oxisols/Ferralsols)'
  soilPh: number;                    // 5.6 (slightly acidic, optimal for tropical tubers/cereals)
  organicMatterPercent: number;      // 2.8%
  nitrogenBaselineKgHa: number;      // 45 kg N/ha initial available inorganic N
  availableWaterCapacityMm: number;  // 110 mm/m
  infiltrationRateMmHr: number;      // 18 mm/hr
}

/**
 * Normalized Terrain Features (SRTM 30m Digital Elevation Model)
 */
export interface TerrainFeatures {
  meta: DataTraceabilityMetadata;
  elevationMeters: number;           // Obala elevation (~520 m a.s.l.)
  meanSlopePercent: number;          // Mean slope (4.2%)
  slopeClass: '<2%' | '2-5%' | '5-10%' | '>10%'; // '2-5%' (gently undulating plateaus)
  erosionRiskIndex: number;          // 0-100 (32: moderate risk without vegetative cover)
  runoffCoefficient: number;         // 0.22 on 4% slope under vegetative cover
}

/**
 * Normalized Cover Continuity Features (Landsat 8/9, Sentinel-2, MODIS/VIIRS)
 */
export interface CoverContinuityFeatures {
  meta: DataTraceabilityMetadata;
  currentNdvi: number;               // 0.68 (vigorous canopy)
  baselineNdvi10y: number;           // 0.64
  bareSoilDurationDays: number;      // Days per year where soil is unshaded / bare
  canopyCoverPercent: number;        // Estimated live ground cover %
  interseasonCoverMaintained: boolean; // Mulch or cover crop between rotations
}

/**
 * Normalized Agronomic Suitability Features (FAO GAEZ v4 + IRAD)
 */
export interface AgronomicSuitabilityFeatures {
  meta: DataTraceabilityMetadata;
  gaezSuitabilityClass: 'Very High' | 'High' | 'Moderate' | 'Marginal' | 'Not Suitable';
  suitabilityScore: number;          // 0-100
  thermalSuitability: boolean;       // Within crop cardinal temps
  waterSuitability: boolean;         // Within water requirements
  lengthOfGrowingPeriodDays: number; // LGP for Lékié bimodal zone (~270 days total across 2 seasons)
}

/**
 * Normalized Market Context Features (Regional Wholesale Observatories)
 */
export interface MarketContextFeatures {
  meta: DataTraceabilityMetadata;
  marketLocality: string;            // 'Mokolo (Yaoundé) & Marché Central Obala'
  currency: 'FCFA';
  inflationBufferPercent: number;    // 5%
  transportCostPerTonneFcfa: number; // 25,000 FCFA/t from Obala to Yaoundé
}

/**
 * Composite Feature Bundle passed into the Scoring Engine
 */
export interface RotationEvaluationFeatures {
  targetFootprint: {
    latitude: number;
    longitude: number;
    locality: string;
    region: string;
    agroEcologicalZone: string;
  };
  climate: ClimateFeatures;
  soil: SoilFeatures;
  terrain: TerrainFeatures;
  cover: CoverContinuityFeatures;
  suitability: AgronomicSuitabilityFeatures;
  market: MarketContextFeatures;
}
