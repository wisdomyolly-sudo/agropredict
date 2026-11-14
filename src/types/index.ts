export * from './features';

export type CropFamily = 'cereale' | 'legumineuse' | 'tubercule' | 'maraichage' | 'perenne';

export type WaterNeedLevel = 'faible' | 'modere' | 'eleve';
export type CycleDuration = 'court' | 'moyen' | 'long'; // <90j, 90-120j, >150j

export interface Crop {
  id: string;
  name: string;
  scientificName?: string;
  variety: string;
  family: CropFamily;
  cycleDays: number;
  waterNeedMm: number;
  waterNeedLevel: WaterNeedLevel;
  nitrogenFixationKgHa: number; // e.g. +45 kg N/ha for legumes, -60 for maize
  yieldPotentialKgHa: number;
  marketPriceFcfaKg: number;
  imageUrl: string;
  description: string;
  favorableSeasons: ('mars_juin' | 'sept_nov')[];
  stressTolerance: string;
  // Extended IRAD variety attributes
  iradCatalogCode?: string;
  breedingInstitution?: string; // 'IRAD Cameroun' | 'IITA' | 'AfricaRice' | 'CIMMYT'
  criticalWaterStage?: string;
  diseaseResistance?: string[];
  agronomicWarnings?: string[];
  localSuitabilityScore?: number; // 0-100
  _source?: string;
  _quality?: 'high' | 'medium' | 'fallback';
}

export interface PlotCoordinates {
  lat: number;
  lng: number;
  locality: string;
  region: string;
  zoneAgroEcologique: string;
  polygon: [number, number][]; // SVG coordinates or GPS points
}

export interface FarmPlot {
  id: string;
  name: string;
  code: string;
  surfaceHa: number;
  soilType: string;
  soilPh: number;
  soilMoisturePercent: number;
  slopePercent: number;
  availableWaterCapacityMm: number;
  cooperativeName: string;
  advisorName: string;
  previousCrop: {
    cropName: string;
    variety: string;
    harvestDate: string;
    yieldTonnesHa: number;
    residualNitrogenKgHa: number;
  };
  coordinates: PlotCoordinates;
}

export interface SatelliteSource {
  id: 'gpm_imerg' | 'smap' | 'power' | 'modis' | 'srtm' | 'landsat' | 'gaez' | 'era5' | 'ecostress';
  name: string;
  fullName: string;
  metric: string;
  currentValue: string;
  unit: string;
  status: 'valid' | 'syncing' | 'cached';
  lastPassAgo: string;
  resolution: string;
  badgeColor: string;
  portalUrl?: string;
  provider?: string;
}

export interface ClimateTelemetry {
  rainfall7dMm: number;
  rainfall10yDiffPercent: number;
  temperatureAvgC: number;
  soilMoistureSmapPercent: number;
  soilMoistureRootPercent: number;
  ndviVigorIndex: number;
  nextSeedingWindow: string;
  drySpellWarning: boolean;
  drySpellDates: string;
  monthlyRainfallData: {
    month: string;
    rain20yAvgMm: number;
    rainCurrentYearMm: number;
    cropDemandMm: number;
  }[];
  _source?: string;
  _quality?: 'high' | 'medium' | 'fallback';
}

export interface RotationPhase {
  seasonIndex: number; // 1, 2, 3
  seasonName: string;
  seasonPeriod: string;
  crop: Crop;
  plannedYieldTonnesHa: number;
  grossMarginFcfaHa: number;
  waterAdequacyPercent: number;
  nitrogenBalanceKgHa: number;
  diseaseBreakRisk: 'faible' | 'modere' | 'eleve';
  notes: string;
}

export interface RotationScenario {
  id: string;
  tag: 'A' | 'B' | 'C' | 'CUSTOM';
  name: string;
  subtitle: string;
  isRecommended: boolean;
  overallScore: number;
  netMarginFcfaHa: number;
  totalIncomePlotFcfa: number;
  nitrogenBalanceKgHa: number;
  waterStressPercent: number;
  failureRiskPercent: number;
  phases: RotationPhase[];
  radarScores: {
    waterSecurity: number;       // 0-100
    climateMatch: number;        // 0-100
    soilFertility: number;       // 0-100
    foodDiversification: number; // 0-100
    fcfaMargin: number;          // 0-100
    coverContinuity?: number;    // 0-100 (new)
    pestBreak?: number;          // 0-100 (new)
  };
  scoreExplanation: {
    strengths: string[];
    weaknesses: string[];
    agronomicSummary: string;
    dataSourceWarnings?: string[];
  };
  _source?: string;
}

export interface ScoringWeights {
  waterSecurity: number;      // e.g. 25-35%
  fcfaMargin: number;         // e.g. 20-30%
  soilFertility: number;      // e.g. 15-20%
  foodSecurity: number;       // e.g. 10-15%
  climateMatch?: number;      // e.g. 10-15%
  coverContinuity?: number;   // e.g. 5-10% (erosion & bare ground penalty)
  pestBreak?: number;         // e.g. 5-10% (disease interruption)
}

export interface UserProfile {
  name: string;
  role: string;
  matricule: string;
  organization: string;
  phone: string;
  whatsappActive: boolean;
  parcellesCount: number;
  sectorCovered: string;
  language: 'fr' | 'en';
  currency: 'FCFA' | 'USD';
  surfaceUnit: 'ha' | 'piquet';
  offlineStorage: {
    usedMb: number;
    totalMb: number;
    packLekieDownloaded: boolean;
  };
}
