import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  MOCK_PLOT,
  MOCK_CROPS,
  MOCK_CLIMATE,
  MOCK_SCENARIOS,
  MOCK_USER,
  MOCK_SATELLITE_SOURCES,
} from '@/data/mockData';
import { FarmPlot, Crop, RotationScenario, ScoringWeights, UserProfile, SatelliteSource, RotationEvaluationFeatures } from '@/types';
import { FeatureExtractor } from '@/services/featureExtractor';

export const useFarmStore = defineStore('farm', () => {
  const activePlot = ref<FarmPlot>({ ...MOCK_PLOT });
  const crops = ref<Crop[]>([...MOCK_CROPS]);
  const climate = ref({ ...MOCK_CLIMATE });
  const scenarios = ref<RotationScenario[]>([...MOCK_SCENARIOS]);
  const satelliteSources = ref<SatelliteSource[]>([...MOCK_SATELLITE_SOURCES]);
  const user = ref<UserProfile>({ ...MOCK_USER });
  const features = ref<RotationEvaluationFeatures>(FeatureExtractor.getDefaultFeatures());
  const isLoadingTelemetry = ref(false);

  // Configurable weights for decision comparator
  const weights = ref<ScoringWeights>({
    waterSecurity: 25,
    fcfaMargin: 25,
    soilFertility: 20,
    foodSecurity: 10,
    climateMatch: 10,
    coverContinuity: 5,
    pestBreak: 5,
  });

  const activeScenarioId = ref<string>('scenario_a');

  const activeScenario = computed(() => {
    return scenarios.value.find((s) => s.id === activeScenarioId.value) || scenarios.value[0];
  });

  const recommendedScenario = computed(() => {
    return scenarios.value.find((s) => s.isRecommended) || scenarios.value[0];
  });

  // Calculate dynamically weighted score for any scenario based on current sliders
  const calculateWeightedScore = (scenario: RotationScenario) => {
    const wWater = weights.value.waterSecurity || 25;
    const wMargin = weights.value.fcfaMargin || 25;
    const wSoil = weights.value.soilFertility || 20;
    const wFood = weights.value.foodSecurity || 10;
    const wClimate = weights.value.climateMatch || 10;
    const wCover = weights.value.coverContinuity || 5;
    const wPest = weights.value.pestBreak || 5;

    const totalWeight = wWater + wMargin + wSoil + wFood + wClimate + wCover + wPest;
    if (totalWeight === 0) return scenario.overallScore;

    const coverScore = scenario.radarScores.coverContinuity || 75;
    const pestScore = scenario.radarScores.pestBreak || 80;

    const weighted =
      (scenario.radarScores.waterSecurity * wWater +
        scenario.radarScores.fcfaMargin * wMargin +
        scenario.radarScores.soilFertility * wSoil +
        scenario.radarScores.foodDiversification * wFood +
        scenario.radarScores.climateMatch * wClimate +
        coverScore * wCover +
        pestScore * wPest) /
      totalWeight;

    return Math.round(weighted);
  };

  const setWeights = (newWeights: Partial<ScoringWeights>) => {
    weights.value = { ...weights.value, ...newWeights };
  };

  const resetWeights = () => {
    weights.value = {
      waterSecurity: 25,
      fcfaMargin: 25,
      soilFertility: 20,
      foodSecurity: 10,
      climateMatch: 10,
      coverContinuity: 5,
      pestBreak: 5,
    };
  };

  const updatePlot = (updated: Partial<FarmPlot>) => {
    activePlot.value = { ...activePlot.value, ...updated };
  };

  /**
   * Refresh telemetry by executing live queries to NASA POWER and calibrated layers
   */
  const refreshLiveTelemetry = async () => {
    isLoadingTelemetry.value = true;
    try {
      const extracted = await FeatureExtractor.extractFeatures(
        activePlot.value.coordinates.lat,
        activePlot.value.coordinates.lng
      );
      features.value = extracted;

      climate.value.temperatureAvgC = extracted.climate.meanTemperatureC;
      climate.value.rainfall7dMm = Math.round(extracted.climate.seasonalRainfallMm / 14);
      climate.value.soilMoistureSmapPercent = extracted.soil.surfaceMoisturePercent;
      climate.value.soilMoistureRootPercent = extracted.soil.rootZoneMoisturePercent;
      climate.value.ndviVigorIndex = extracted.cover.currentNdvi;
    } finally {
      isLoadingTelemetry.value = false;
    }
  };

  return {
    activePlot,
    crops,
    climate,
    scenarios,
    satelliteSources,
    user,
    features,
    isLoadingTelemetry,
    weights,
    activeScenarioId,
    activeScenario,
    recommendedScenario,
    calculateWeightedScore,
    setWeights,
    resetWeights,
    updatePlot,
    refreshLiveTelemetry,
  };
});
