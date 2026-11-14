<script setup lang="ts">
import { ref } from 'vue';
import { useFarmStore } from '@/stores/farmStore';
import { useAppStore } from '@/stores/appStore';
import { SOURCE_MANIFEST, DatasetManifestEntry } from '@/data/sourceManifest';
import AppBadge from '@/components/common/AppBadge.vue';

const farmStore = useFarmStore();
const appStore = useAppStore();

const activeFilter = ref<'ALL' | 'TIER 1' | 'TIER 2' | 'EXCLUDED'>('ALL');

const filteredManifest = ref<DatasetManifestEntry[]>(SOURCE_MANIFEST);

const setFilter = (tier: 'ALL' | 'TIER 1' | 'TIER 2' | 'EXCLUDED') => {
  activeFilter.value = tier;
  if (tier === 'ALL') {
    filteredManifest.value = SOURCE_MANIFEST;
  } else if (tier === 'TIER 1') {
    filteredManifest.value = SOURCE_MANIFEST.filter((d) => d.tier.includes('TIER 1'));
  } else if (tier === 'TIER 2') {
    filteredManifest.value = SOURCE_MANIFEST.filter((d) => d.tier.includes('TIER 2'));
  } else {
    filteredManifest.value = SOURCE_MANIFEST.filter((d) => d.tier.includes('EXCLUDED'));
  }
};
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
    <!-- Header Banner -->
    <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-3">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-primary font-label-md text-label-md tracking-wider uppercase">
            <span class="material-symbols-outlined text-[18px]">satellite_alt</span>
            <span>Transparence Scientifique &amp; Provenance Spatiale</span>
          </div>
          <h1 class="font-headline-lg text-headline-lg text-on-surface mt-1">
            Sources de Données &amp; Manifeste NASA Earth
          </h1>
          <p class="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            AgroPredict intègre directement les flux satellitaires de la NASA (POWER, IMERG, SMAP, SRTM, MODIS) et les modèles agronomiques de l'IRAD Cameroun pour la zone forestière bimodale (Lékié / Obala).
          </p>
        </div>

        <a
          href="https://www.earthdata.nasa.gov/"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-variant border border-outline-variant/30 text-primary font-body-bold text-label-lg transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <span class="material-symbols-outlined text-[20px]">public</span>
          <span>Portail NASA Earthdata</span>
          <span class="material-symbols-outlined text-[16px]">open_in_new</span>
        </a>
      </div>

      <!-- Mandatory Ethical Notice Banner -->
      <div class="p-3.5 bg-primary-fixed/20 border border-primary-fixed rounded-xl flex items-center gap-3">
        <span class="material-symbols-outlined text-primary text-[24px] shrink-0">verified_user</span>
        <p class="font-body-md text-body-md text-on-surface">
          <strong>Règle d'éthique agronomique :</strong> {{ appStore.t('app.disclaimer') }} Les calculs constituent une évaluation probabiliste d'adéquation agro-climatique.
        </p>
      </div>
    </div>

    <!-- Tier Filter Tabs -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        :class="[
          'px-4 py-2 rounded-xl font-label-md text-label-md transition-all cursor-pointer select-none',
          activeFilter === 'ALL'
            ? 'bg-primary text-on-primary font-bold shadow-sm'
            : 'bg-surface-container hover:bg-surface-container-high text-on-surface',
        ]"
        @click="setFilter('ALL')"
      >
        Toutes les sources ({{ SOURCE_MANIFEST.length }})
      </button>
      <button
        type="button"
        :class="[
          'px-4 py-2 rounded-xl font-label-md text-label-md transition-all cursor-pointer select-none',
          activeFilter === 'TIER 1'
            ? 'bg-primary text-on-primary font-bold shadow-sm'
            : 'bg-surface-container hover:bg-surface-container-high text-on-surface',
        ]"
        @click="setFilter('TIER 1')"
      >
        TIER 1 — Scoring Moteur (8)
      </button>
      <button
        type="button"
        :class="[
          'px-4 py-2 rounded-xl font-label-md text-label-md transition-all cursor-pointer select-none',
          activeFilter === 'TIER 2'
            ? 'bg-primary text-on-primary font-bold shadow-sm'
            : 'bg-surface-container hover:bg-surface-container-high text-on-surface',
        ]"
        @click="setFilter('TIER 2')"
      >
        TIER 2 — Alertes &amp; Contexte (1)
      </button>
      <button
        type="button"
        :class="[
          'px-4 py-2 rounded-xl font-label-md text-label-md transition-all cursor-pointer select-none',
          activeFilter === 'EXCLUDED'
            ? 'bg-primary text-on-primary font-bold shadow-sm'
            : 'bg-surface-container hover:bg-surface-container-high text-on-surface',
        ]"
        @click="setFilter('EXCLUDED')"
      >
        Bases Exclues / Non-applicables (5)
      </button>
    </div>

    <!-- Manifest Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="ds in filteredManifest"
        :key="ds.id"
        :class="[
          'p-5 rounded-2xl border transition-all flex flex-col justify-between',
          ds.status === 'active'
            ? 'bg-surface-container-lowest border-outline-variant/30 shadow-xs hover:border-primary/50'
            : ds.status === 'integrated_baseline'
            ? 'bg-surface-container-lowest border-secondary/30'
            : 'bg-surface-container-low border-dashed border-outline-variant/50 opacity-85',
        ]"
      >
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span
                :class="[
                  'px-2.5 py-0.5 rounded-full font-label-md text-[11px] font-semibold uppercase tracking-wider',
                  ds.tier.includes('TIER 1')
                    ? 'bg-primary-fixed text-primary'
                    : ds.tier.includes('TIER 2')
                    ? 'bg-secondary-fixed text-secondary'
                    : 'bg-surface-container-highest text-on-surface-variant',
                ]"
              >
                {{ ds.tier }}
              </span>
              <h3 class="font-headline-sm text-headline-sm text-on-surface mt-1.5 font-bold">{{ ds.name }}</h3>
              <p class="font-caption text-caption text-on-surface-variant">{{ ds.agency }}</p>
            </div>

            <a
              :href="ds.accessUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
              :title="'Consulter ' + ds.name"
            >
              <span class="material-symbols-outlined text-[18px]">open_in_new</span>
            </a>
          </div>

          <div class="p-3 bg-surface-container-low rounded-xl text-caption space-y-1">
            <div class="flex justify-between">
              <span class="text-on-surface-variant">Résolution spatiale :</span>
              <span class="font-semibold text-on-surface">{{ ds.spatialResolution }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-on-surface-variant">Fréquence temporelle :</span>
              <span class="font-semibold text-on-surface">{{ ds.temporalResolution }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-on-surface-variant">Zone couverte :</span>
              <span class="font-semibold text-on-surface">{{ ds.targetFootprint }}</span>
            </div>
          </div>

          <p class="font-body-md text-body-md text-on-surface">
            {{ ds.relevanceToScoring }}
          </p>

          <div v-if="ds.engineParameters && ds.engineParameters.length > 0" class="flex flex-wrap gap-1">
            <span
              v-for="(param, pIdx) in ds.engineParameters"
              :key="pIdx"
              class="px-2 py-0.5 rounded bg-surface-container font-mono text-[11px] text-on-surface-variant"
            >
              {{ param }}
            </span>
          </div>

          <div class="pt-2 text-caption text-on-surface-variant border-t border-outline-variant/20">
            <p><strong>Limites connues :</strong> {{ ds.knownLimitations }}</p>
            <p class="mt-0.5"><strong>Authentification :</strong> {{ ds.authenticationRequirement }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footprint Calibration Section -->
    <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
      <h2 class="font-headline-md text-headline-md text-on-surface font-bold">
        Calibrage Territorial : Lékié, Obala &amp; Haute-Sanaga
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 rounded-xl bg-surface-container-low">
          <span class="font-label-md text-primary font-bold block mb-1">Régime pluviométrique bimodal</span>
          <p class="font-caption text-caption text-on-surface-variant">
            Deux saisons des pluies distinctes (mars-juin: 670mm cumulés; sept-nov: 750mm cumulés) et deux coupures sèches. IMERG permet de planifier le calage précis des semis.
          </p>
        </div>
        <div class="p-4 rounded-xl bg-surface-container-low">
          <span class="font-label-md text-primary font-bold block mb-1">Pédologie ferrallitique IRAD</span>
          <p class="font-caption text-caption text-on-surface-variant">
            Sols rouges profonds (Ferralsols) acides (pH 5.2 - 5.8) riches en oxydes de fer et aluminium mais carencés en phosphore assimilable. Les légumineuses sont indispensables.
          </p>
        </div>
        <div class="p-4 rounded-xl bg-surface-container-low">
          <span class="font-label-md text-primary font-bold block mb-1">Pente &amp; érosion SRTM</span>
          <p class="font-caption text-caption text-on-surface-variant">
            Topographie ondulée de collines (pentes 3% à 8%). Le couvert végétal dense continu (Landsat NDVI > 0.60) est obligatoire pour empêcher le lessivage superficiel.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
