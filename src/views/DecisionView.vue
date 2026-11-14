<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useFarmStore } from '@/stores/farmStore';
import AppCard from '@/components/common/AppCard.vue';
import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';

const router = useRouter();
const farmStore = useFarmStore();

const weightsSum = computed(() => {
  return (
    farmStore.weights.waterSecurity +
    farmStore.weights.fcfaMargin +
    farmStore.weights.soilFertility +
    farmStore.weights.foodSecurity
  );
});

// Calculate radar polygon points from scores:
// Pentagram geometry centered at (150, 150), radius 110
// 1. Water (top): angle -90° (0 rad from vertical)
// 2. Climate / Climat (top-right): angle -18°
// 3. Soil / Sol (bottom-right): angle 54°
// 4. Food / Sécurité (bottom-left): angle 126°
// 5. Margin / FCFA (top-left): angle 198°
const getPolygonPoints = (scores: {
  waterSecurity: number;
  climateMatch: number;
  soilFertility: number;
  foodDiversification: number;
  fcfaMargin: number;
}) => {
  const cx = 150;
  const cy = 150;
  const maxR = 110;

  // normalize 0..100
  const r1 = (scores.waterSecurity / 100) * maxR;
  const r2 = (scores.climateMatch / 100) * maxR;
  const r3 = (scores.soilFertility / 100) * maxR;
  const r4 = (scores.foodDiversification / 100) * maxR;
  const r5 = (scores.fcfaMargin / 100) * maxR;

  // Angles in radians
  const a1 = -Math.PI / 2;
  const a2 = -Math.PI / 2 + (2 * Math.PI) / 5;
  const a3 = -Math.PI / 2 + (4 * Math.PI) / 5;
  const a4 = -Math.PI / 2 + (6 * Math.PI) / 5;
  const a5 = -Math.PI / 2 + (8 * Math.PI) / 5;

  const p1 = `${(cx + r1 * Math.cos(a1)).toFixed(1)},${(cy + r1 * Math.sin(a1)).toFixed(1)}`;
  const p2 = `${(cx + r2 * Math.cos(a2)).toFixed(1)},${(cy + r2 * Math.sin(a2)).toFixed(1)}`;
  const p3 = `${(cx + r3 * Math.cos(a3)).toFixed(1)},${(cy + r3 * Math.sin(a3)).toFixed(1)}`;
  const p4 = `${(cx + r4 * Math.cos(a4)).toFixed(1)},${(cy + r4 * Math.sin(a4)).toFixed(1)}`;
  const p5 = `${(cx + r5 * Math.cos(a5)).toFixed(1)},${(cy + r5 * Math.sin(a5)).toFixed(1)}`;

  return `${p1} ${p2} ${p3} ${p4} ${p5}`;
};

const goToDetail = (id: string) => {
  router.push(`/detail/${id}`);
};
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
    <!-- Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div class="space-y-1 max-w-3xl">
        <div class="flex flex-wrap items-center gap-2 text-caption text-on-surface-variant">
          <AppBadge variant="primary" icon="analytics">Arbitrage Multi-Critères</AppBadge>
          <span>•</span>
          <AppBadge variant="satellite" icon="satellite_alt">NASA SMAP + IMERG (20 ans)</AppBadge>
          <span>•</span>
          <span class="font-body-bold text-on-surface">Campagne 2025/2026</span>
        </div>
        <h1 class="font-display-lg text-headline-lg lg:text-display-lg text-on-surface tracking-tight">
          Comparaison &amp; Arbitrage des Scénarios
        </h1>
        <p class="font-body-md sm:font-body-lg text-body-md sm:text-body-lg text-on-surface-variant">
          Classement multicritère fondé sur les modèles climatiques NASA et l'économie locale en FCFA pour la parcelle d'Obala (3.2 ha).
        </p>
      </div>

      <div class="flex items-center gap-3 self-start lg:self-end">
        <button
          type="button"
          class="inline-flex items-center gap-2 h-12 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-body-bold text-label-lg transition-colors shadow-xs cursor-pointer"
          @click="farmStore.resetWeights"
        >
          <span class="material-symbols-outlined text-[20px] text-primary">restart_alt</span>
          <span>Pondération Recommandée</span>
        </button>
      </div>
    </div>

    <!-- Section 1: Dynamic Criteria Weighting Engine -->
    <div class="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-sm space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary text-[22px]">tune</span>
            <h2 class="font-headline-sm text-headline-sm text-on-surface">
              Ce qui compte le plus pour vous (Pondération des critères)
            </h2>
          </div>
          <p class="font-body-md text-caption sm:text-body-md text-on-surface-variant mt-0.5">
            Ajustez l'importance de chaque levier pour recalculer instantanément le classement adapté à votre trésorerie et vos risques.
          </p>
        </div>

        <div class="inline-flex items-center gap-2 self-start md:self-auto bg-surface-container px-3 py-1.5 rounded-full text-caption font-label-md text-on-surface">
          <span>Total pondéré :</span>
          <span :class="['font-body-bold', weightsSum === 100 ? 'text-primary' : 'text-secondary']">
            {{ weightsSum }}%
          </span>
          <span class="material-symbols-outlined text-[16px] text-primary">check_circle</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        <!-- Slider 1: Eau -->
        <div class="bg-surface-container-low/70 rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-1.5 font-label-lg text-label-lg text-on-surface">
              <span class="material-symbols-outlined text-tertiary text-[18px]">water_drop</span>
              Sécurité hydrique
            </span>
            <span class="font-body-bold text-label-lg text-tertiary bg-tertiary-fixed px-2 py-0.5 rounded-full">
              {{ farmStore.weights.waterSecurity }}%
            </span>
          </div>
          <p class="font-caption text-caption text-on-surface-variant">Résistance aux poches de sécheresse et stress NASA SMAP.</p>
          <input
            v-model.number="farmStore.weights.waterSecurity"
            class="w-full h-2 rounded-lg bg-surface-container-highest accent-primary cursor-pointer"
            type="range"
            min="10"
            max="60"
          />
        </div>

        <!-- Slider 2: FCFA -->
        <div class="bg-surface-container-low/70 rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-1.5 font-label-lg text-label-lg text-on-surface">
              <span class="material-symbols-outlined text-secondary text-[18px]">payments</span>
              Rentabilité en FCFA
            </span>
            <span class="font-body-bold text-label-lg text-secondary bg-secondary-fixed px-2 py-0.5 rounded-full">
              {{ farmStore.weights.fcfaMargin }}%
            </span>
          </div>
          <p class="font-caption text-caption text-on-surface-variant">Marges brutes dégagées par hectare aux marchés urbains.</p>
          <input
            v-model.number="farmStore.weights.fcfaMargin"
            class="w-full h-2 rounded-lg bg-surface-container-highest accent-secondary cursor-pointer"
            type="range"
            min="10"
            max="60"
          />
        </div>

        <!-- Slider 3: Sol -->
        <div class="bg-surface-container-low/70 rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-1.5 font-label-lg text-label-lg text-on-surface">
              <span class="material-symbols-outlined text-primary text-[18px]">compost</span>
              Fertilité du sol
            </span>
            <span class="font-body-bold text-label-lg text-primary bg-primary-fixed px-2 py-0.5 rounded-full">
              {{ farmStore.weights.soilFertility }}%
            </span>
          </div>
          <p class="font-caption text-caption text-on-surface-variant">Fixation biologique de l'azote N₂ et protection ferrallitique.</p>
          <input
            v-model.number="farmStore.weights.soilFertility"
            class="w-full h-2 rounded-lg bg-surface-container-highest accent-primary cursor-pointer"
            type="range"
            min="10"
            max="60"
          />
        </div>

        <!-- Slider 4: Sécurité vivrière -->
        <div class="bg-surface-container-low/70 rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-1.5 font-label-lg text-label-lg text-on-surface">
              <span class="material-symbols-outlined text-on-surface-variant text-[18px]">psychiatry</span>
              Sécurité alimentaire
            </span>
            <span class="font-body-bold text-label-lg text-on-surface bg-surface-container px-2 py-0.5 rounded-full">
              {{ farmStore.weights.foodSecurity }}%
            </span>
          </div>
          <p class="font-caption text-caption text-on-surface-variant">Disponibilité garantie en maïs et tubercules de garde.</p>
          <input
            v-model.number="farmStore.weights.foodSecurity"
            class="w-full h-2 rounded-lg bg-surface-container-highest accent-primary cursor-pointer"
            type="range"
            min="10"
            max="60"
          />
        </div>
      </div>
    </div>

    <!-- Section 2: 3 Comparison Cards Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div
        v-for="s in farmStore.scenarios"
        :key="s.id"
        :class="[
          'rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all relative',
          s.isRecommended
            ? 'bg-surface-container-lowest border-2 border-secondary-container shadow-md ring-2 ring-secondary-container/20'
            : 'bg-surface-container-lowest border border-outline-variant/30 shadow-xs hover:shadow-sm',
        ]"
      >
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span
              :class="[
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-body-bold text-caption',
                s.isRecommended
                  ? 'bg-secondary-fixed text-on-secondary-fixed'
                  : 'bg-surface-container-high text-on-surface-variant',
              ]"
            >
              <span v-if="s.isRecommended" class="material-symbols-outlined text-[16px]">star</span>
              {{ s.isRecommended ? 'Option A • Recommandée' : `Option ${s.tag}` }}
            </span>
            <span class="font-label-md text-caption text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
              Cycle 12 mois
            </span>
          </div>

          <div>
            <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">
              {{ s.name }}
            </h3>
            <p class="font-caption text-caption text-on-surface-variant mt-1">
              {{ s.subtitle }}
            </p>
          </div>

          <!-- Dynamic Score Gauge Row -->
          <div class="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
            <div class="flex items-center gap-3">
              <span class="font-display-lg text-headline-lg font-bold text-primary">
                {{ farmStore.calculateWeightedScore(s) }}
              </span>
              <div>
                <span class="font-label-md text-caption text-on-surface-variant block">Score AgroPredict</span>
                <span class="font-body-bold text-caption text-primary">
                  {{ s.isRecommended ? 'Équilibre Optimal' : 'Vulnérable' }}
                </span>
              </div>
            </div>
            <span class="material-symbols-outlined text-[24px] text-primary">
              {{ s.isRecommended ? 'verified' : 'analytics' }}
            </span>
          </div>

          <!-- Metrics Matrix -->
          <div class="space-y-1.5 pt-1 text-label-md">
            <div class="flex justify-between items-baseline py-1 border-b border-outline-variant/20">
              <span class="text-on-surface-variant">Marge nette estimée</span>
              <span class="font-body-bold text-label-lg text-secondary">
                {{ s.netMarginFcfaHa.toLocaleString('fr-FR') }} FCFA/ha
              </span>
            </div>

            <div class="flex justify-between items-baseline py-1 border-b border-outline-variant/20">
              <span class="text-on-surface-variant">Bilan fertilité sol</span>
              <span
                :class="[
                  'font-body-bold text-label-lg',
                  s.nitrogenBalanceKgHa > 0 ? 'text-primary' : 'text-error',
                ]"
              >
                {{ s.nitrogenBalanceKgHa > 0 ? `+${s.nitrogenBalanceKgHa}` : s.nitrogenBalanceKgHa }} kg N/ha
              </span>
            </div>

            <div class="flex justify-between items-baseline py-1 border-b border-outline-variant/20">
              <span class="text-on-surface-variant">Risque de choc climatique</span>
              <span
                :class="[
                  'font-body-bold text-label-lg',
                  s.failureRiskPercent <= 15 ? 'text-primary' : 'text-error',
                ]"
              >
                {{ s.failureRiskPercent }}%
              </span>
            </div>
          </div>
        </div>

        <div class="pt-5 mt-4 border-t border-outline-variant/20">
          <AppButton
            :variant="s.isRecommended ? 'primary' : 'secondary'"
            size="md"
            :full-width="true"
            icon-right="arrow_forward"
            @click="goToDetail(s.id)"
          >
            {{ s.isRecommended ? 'Choisir ce Scénario' : 'Détail du Scénario' }}
          </AppButton>
        </div>
      </div>
    </div>

    <!-- Section 3: Pentagonal Radar Chart (SVG Tracé) -->
    <div class="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span class="inline-flex items-center gap-1 text-tertiary text-caption font-label-md uppercase tracking-wider">
            <span class="material-symbols-outlined text-[16px]">radar</span>
            Modélisation Pentadimensionnelle
          </span>
          <h3 class="font-headline-sm text-headline-sm text-on-surface">Radar des Arbitrages Stratégiques</h3>
        </div>
        <AppBadge variant="satellite" icon="public">NASA POWER &amp; SMAP</AppBadge>
      </div>

      <div class="flex flex-col lg:flex-row items-center justify-center gap-8 py-4">
        <!-- SVG Radar -->
        <div class="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
          <svg class="w-full h-full overflow-visible" viewBox="-20 -20 340 340">
            <!-- Concentric Grid Pentagons (20%, 40%, 60%, 80%, 100%) -->
            <polygon class="text-surface-container-highest" fill="none" stroke="currentColor" stroke-width="1" points="150,128 171,143 163,167 137,167 129,143" />
            <polygon class="text-surface-container-highest" fill="none" stroke="currentColor" stroke-width="1" points="150,106 192,137 176,184 124,184 108,137" />
            <polygon class="text-surface-container-highest" fill="none" stroke="currentColor" stroke-width="1" points="150,84 213,130 189,201 111,201 87,130" />
            <polygon class="text-surface-container-highest" fill="none" stroke="currentColor" stroke-width="1" points="150,62 234,124 202,218 98,218 66,124" />
            <polygon class="text-surface-container-high" fill="none" stroke="currentColor" stroke-width="1.5" points="150,40 255,117 215,235 85,235 45,117" />

            <!-- Axis radiating from center (150, 150) -->
            <line x1="150" y1="150" x2="150" y2="40" stroke="currentColor" class="text-surface-container-highest" stroke-dasharray="2,2" />
            <line x1="150" y1="150" x2="255" y2="117" stroke="currentColor" class="text-surface-container-highest" stroke-dasharray="2,2" />
            <line x1="150" y1="150" x2="215" y2="235" stroke="currentColor" class="text-surface-container-highest" stroke-dasharray="2,2" />
            <line x1="150" y1="150" x2="85" y2="235" stroke="currentColor" class="text-surface-container-highest" stroke-dasharray="2,2" />
            <line x1="150" y1="150" x2="45" y2="117" stroke="currentColor" class="text-surface-container-highest" stroke-dasharray="2,2" />

            <!-- Labels -->
            <text x="150" y="24" text-anchor="middle" class="fill-on-surface font-label-md text-[11px] font-bold">
              1. Disponibilité Eau
            </text>
            <text x="270" y="118" text-anchor="start" class="fill-on-surface font-label-md text-[11px] font-bold">
              2. Climat NASA
            </text>
            <text x="225" y="255" text-anchor="start" class="fill-on-surface font-label-md text-[11px] font-bold">
              3. Fertilité Sol
            </text>
            <text x="75" y="255" text-anchor="end" class="fill-on-surface font-label-md text-[11px] font-bold">
              4. Sécurité Foyer
            </text>
            <text x="30" y="118" text-anchor="end" class="fill-on-surface font-label-md text-[11px] font-bold">
              5. Marge FCFA
            </text>

            <!-- Scenario C Polygon (Dotted Grey) -->
            <polygon
              :points="getPolygonPoints(farmStore.scenarios[2].radarScores)"
              class="text-outline"
              fill="rgba(112, 122, 111, 0.15)"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-dasharray="4,4"
            />

            <!-- Scenario B Polygon (Blue) -->
            <polygon
              :points="getPolygonPoints(farmStore.scenarios[1].radarScores)"
              class="text-tertiary"
              fill="rgba(0, 70, 134, 0.2)"
              stroke="currentColor"
              stroke-width="2"
            />

            <!-- Scenario A Polygon (Green / Recommended) -->
            <polygon
              :points="getPolygonPoints(farmStore.scenarios[0].radarScores)"
              class="text-primary-container"
              fill="rgba(31, 107, 58, 0.3)"
              stroke="currentColor"
              stroke-width="3"
            />
          </svg>
        </div>

        <!-- Radar Legend & Readout -->
        <div class="space-y-4 max-w-sm">
          <div class="p-3.5 rounded-xl bg-surface-container-low border border-primary flex items-start gap-3">
            <span class="w-3.5 h-3.5 rounded-full bg-primary-container shrink-0 mt-1"></span>
            <div>
              <p class="font-body-bold text-label-lg text-primary">Option A (Recommandée)</p>
              <p class="font-caption text-caption text-on-surface-variant">
                Enveloppe polygonale la plus étendue et stable, garantissant 92% d'adéquation hydrique et 95% de fertilité du sol.
              </p>
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-surface-container-low border border-tertiary/40 flex items-start gap-3">
            <span class="w-3.5 h-3.5 rounded-full bg-tertiary shrink-0 mt-1"></span>
            <div>
              <p class="font-body-bold text-label-lg text-tertiary">Option B (Spéculative)</p>
              <p class="font-caption text-caption text-on-surface-variant">
                Pointe maximale sur la marge en FCFA (95%), mais écrasement critique sur la sécurité en eau (42%).
              </p>
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline/40 flex items-start gap-3">
            <span class="w-3.5 h-3.5 rounded-full bg-outline shrink-0 mt-1"></span>
            <div>
              <p class="font-body-bold text-label-lg text-on-surface">Option C (Monoculture)</p>
              <p class="font-caption text-caption text-on-surface-variant">
                Polygone rétracté au centre. Forte chute de la fertilité minérale (18%) et vulnérabilité maximale.
              </p>
            </div>
          </div>
        </div>

        <!-- Mandatory Legal Disclaimer -->
        <p class="font-caption text-caption text-center text-on-surface-variant pt-2">
          Estimation indicative, pas une prévision de rendement. Données NASA Earth (POWER, SMAP, IMERG) croisées aux référentiels IRAD.
        </p>
      </div>
    </div>
  </div>
</template>
