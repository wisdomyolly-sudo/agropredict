// Standalone test suite for AgroPredict Feature-Driven Scoring Engine (Node ESM)

const IRAD_VARIETIES = [
  {
    id: 'crop_maize_cms8704',
    name: 'Maïs CMS 8704',
    variety: 'CMS 8704 (IRAD Nkolbisson)',
    family: 'cereale',
    cycleDays: 110,
    waterNeedMm: 520,
    nitrogenFixationKgHa: -60,
    agronomicWarnings: ['Risque de chenille légionnaire d’automne en monoculture.'],
  },
  {
    id: 'crop_cowpea_lori',
    name: 'Niébé Lori (B301)',
    variety: 'Lori / B301 Fixateur N2',
    family: 'legumineuse',
    cycleDays: 70,
    waterNeedMm: 320,
    nitrogenFixationKgHa: 45,
    agronomicWarnings: ['Surveiller les thrips à la floraison.'],
  },
  {
    id: 'crop_cassava_tms961414',
    name: 'Manioc TMS 96/1414',
    variety: 'TMS 96/1414 (IRAD / IITA)',
    family: 'tubercule',
    cycleDays: 330,
    waterNeedMm: 750,
    nitrogenFixationKgHa: -20,
    agronomicWarnings: ['Sensible à l’engorgement si pente SRTM < 1%.'],
  },
  {
    id: 'crop_peanut_jl24',
    name: 'Arachide JL 24',
    variety: 'JL 24 Type Spanish',
    family: 'legumineuse',
    cycleDays: 88,
    waterNeedMm: 450,
    nitrogenFixationKgHa: 36,
    agronomicWarnings: [],
  },
  {
    id: 'crop_tomato_riogrande',
    name: 'Tomate Rio Grande',
    variety: 'Rio Grande Déterminée',
    family: 'maraichage',
    cycleDays: 80,
    waterNeedMm: 620,
    nitrogenFixationKgHa: -45,
    agronomicWarnings: ['Proscrire après culture de piment ou aubergine.'],
  },
];

const DEFAULT_FEATURES = {
  climate: {
    seasonalRainfallMm: 670,
    meanTemperatureC: 24.8,
    maxDailyTemperatureC: 31.2,
  },
  soil: {
    surfaceMoisturePercent: 28,
    soilPh: 5.6,
  },
  terrain: {
    meanSlopePercent: 4.2,
    slopeClass: '2-5%',
  },
};

function evaluateRotationScenario(
  phases,
  weights = { waterSecurity: 25, fcfaMargin: 25, soilFertility: 20, foodSecurity: 10, climateMatch: 10, coverContinuity: 5, pestBreak: 5 },
  features = DEFAULT_FEATURES
) {
  if (!phases || phases.length === 0) return { score: 0 };

  const families = phases.map((p) => p.crop.family);
  const hasMonoculture = families.some((fam, idx) => idx > 0 && fam === families[idx - 1]);
  const hasLegume = families.includes('legumineuse');
  const hasCereal = families.includes('cereale');
  const hasTubercule = families.includes('tubercule');
  const hasMaraichage = families.includes('maraichage');

  const warnings = [];
  phases.forEach((p) => {
    if (p.crop.agronomicWarnings) {
      p.crop.agronomicWarnings.forEach((w) => {
        if (!warnings.includes(w)) warnings.push(`[${p.crop.variety}] ${w}`);
      });
    }
  });

  // 1. Nitrogen balance
  const rawCropN = phases.reduce((acc, p) => acc + p.crop.nitrogenFixationKgHa, 0);
  const organicBonus = hasLegume && !hasMonoculture ? 70 : 0;
  const nitrogenBalance = rawCropN + organicBonus;

  let soilScore = 55 + Math.round(nitrogenBalance * 0.6);
  if (hasLegume) soilScore += 15;
  if (hasMonoculture) soilScore = Math.min(soilScore, 20);
  soilScore = Math.max(10, Math.min(98, soilScore));

  // 2. Water & climate
  let waterSecurity = 80;
  let waterStressRisk = 12;
  if (hasMaraichage) {
    waterSecurity = 42;
    waterStressRisk = 38;
  } else if (hasTubercule && hasLegume) {
    waterSecurity = 92;
    waterStressRisk = 12;
  } else if (hasMonoculture) {
    waterSecurity = 50;
    waterStressRisk = 45;
  }

  let climateMatch = Math.round(waterSecurity * 0.95 + (hasLegume ? 3 : 0));
  if (features.climate.maxDailyTemperatureC > 33) climateMatch -= 8;
  climateMatch = Math.max(15, Math.min(98, climateMatch));

  // 3. Cover continuity & terrain
  let coverContinuity = 75;
  if (features.terrain.meanSlopePercent > 4.0) {
    coverContinuity = (hasLegume || hasTubercule) ? 88 : 45;
  }

  // 4. Pest break
  let pestRisk = 'faible';
  let pestBreak = 80;
  if (hasMonoculture) {
    pestRisk = 'eleve';
    pestBreak = 25;
  } else if (hasCereal && hasLegume) {
    pestRisk = 'faible';
    pestBreak = 92;
  } else {
    pestRisk = 'modere';
    pestBreak = 60;
  }

  // 5. Food diversification
  let foodDiversification = 70;
  if (hasCereal && hasLegume && hasTubercule) foodDiversification = 85;
  else if (hasMonoculture) foodDiversification = 20;

  // 6. FCFA Margin
  let fcfaMargin = 75;
  if (hasMaraichage) fcfaMargin = 95;
  else if (hasCereal && hasLegume && hasTubercule) fcfaMargin = 80;
  else if (hasMonoculture) fcfaMargin = 55;

  const totalWeight =
    weights.waterSecurity +
    weights.fcfaMargin +
    weights.soilFertility +
    weights.foodSecurity +
    weights.climateMatch +
    weights.coverContinuity +
    weights.pestBreak;

  const finalScore = Math.round(
    (waterSecurity * weights.waterSecurity +
      fcfaMargin * weights.fcfaMargin +
      soilScore * weights.soilFertility +
      foodDiversification * weights.foodSecurity +
      climateMatch * weights.climateMatch +
      coverContinuity * weights.coverContinuity +
      pestBreak * weights.pestBreak) /
      totalWeight
  );

  return {
    score: finalScore,
    nitrogenBalance,
    waterStressRisk,
    pestRisk,
    radarScores: {
      waterSecurity,
      climateMatch,
      soilFertility: soilScore,
      foodDiversification,
      fcfaMargin,
      coverContinuity,
      pestBreak,
    },
    warnings,
  };
}

console.log("==================================================================");
console.log("   AGROPREDICT — SUITE DE TESTS DU MOTEUR SCORING RÉALISTE (IRAD) ");
console.log("==================================================================");

const mais = IRAD_VARIETIES[0];
const niebe = IRAD_VARIETIES[1];
const manioc = IRAD_VARIETIES[2];
const arachide = IRAD_VARIETIES[3];
const tomate = IRAD_VARIETIES[4];

// [TEST 1] Scénario A (Maïs CMS 8704 -> Niébé Lori -> Manioc TMS 96/1414)
const resA = evaluateRotationScenario([
  { crop: mais, seasonIndex: 1 },
  { crop: niebe, seasonIndex: 2 },
  { crop: manioc, seasonIndex: 3 },
]);
console.log(`[TEST 1] Scénario A Agro-Écologique Régénératif (IRAD) :`);
console.log(`  - Score global : ${resA.score}/100 (attendu ~87-88)`);
console.log(`  - Bilan Azote N2 : +${resA.nitrogenBalance} kg/ha (positif)`);
console.log(`  - Risque ravageurs : ${resA.pestRisk} (rupture biologique)`);
console.log(`  - Avertissements variétaux collectés : ${resA.warnings.length}`);
if (resA.score >= 85 && resA.score <= 90 && resA.pestRisk === 'faible' && resA.nitrogenBalance > 0) {
  console.log("  => SUCCÈS : Validation agronomique confirmée pour Scénario A.");
} else {
  console.error("  => ÉCHEC Scénario A");
  process.exit(1);
}

// [TEST 2] Scénario C (Monoculture de Maïs continu)
const resC = evaluateRotationScenario([
  { crop: mais, seasonIndex: 1 },
  { crop: mais, seasonIndex: 2 },
  { crop: mais, seasonIndex: 3 },
]);
console.log(`\n[TEST 2] Scénario C Monoculture de Maïs (Déconseillé) :`);
console.log(`  - Score global : ${resC.score}/100 (attendu ~38-42)`);
console.log(`  - Risque ravageurs : ${resC.pestRisk} (pullulation foreurs)`);
console.log(`  - Fertilité sol : ${resC.radarScores.soilFertility}/100`);
if (resC.score <= 45 && resC.pestRisk === 'eleve' && resC.radarScores.soilFertility <= 25) {
  console.log("  => SUCCÈS : Forte pénalité monoculture appliquée.");
} else {
  console.error("  => ÉCHEC Scénario C");
  process.exit(1);
}

// [TEST 3] Scénario B (Spéculatif Maraîcher Tomate)
const resB = evaluateRotationScenario([
  { crop: arachide, seasonIndex: 1 },
  { crop: mais, seasonIndex: 2 },
  { crop: tomate, seasonIndex: 3 },
]);
console.log(`\n[TEST 3] Scénario B Spéculatif Marchand (Tomate Rio Grande) :`);
console.log(`  - Score global : ${resB.score}/100 (attendu ~67-72)`);
console.log(`  - Marge FCFA : ${resB.radarScores.fcfaMargin}/100`);
console.log(`  - Risque stress hydrique : ${resB.waterStressRisk}%`);
if (resB.score >= 65 && resB.score <= 75 && resB.radarScores.fcfaMargin >= 90) {
  console.log("  => SUCCÈS : Détection adéquate de la haute rentabilité et du risque hydrique.");
} else {
  console.error("  => ÉCHEC Scénario B");
  process.exit(1);
}

console.log("\n==================================================================");
console.log("  TOUS LES TESTS UNITAIRES SONT VALIDÉS AVEC SUCCÈS ! ");
console.log("==================================================================");
