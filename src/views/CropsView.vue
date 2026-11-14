<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFarmStore } from '@/stores/farmStore';
import { useAppStore } from '@/stores/appStore';
import { Crop } from '@/types';
import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';

const farmStore = useFarmStore();
const appStore = useAppStore();

const searchQuery = ref('');
const selectedFamily = ref<string>('all');
const selectedWater = ref<string>('all');
const selectedCycle = ref<string>('all');

const selectedCrop = ref<Crop>(farmStore.crops[0]);

const families = [
  { id: 'all', label: 'Toutes' },
  { id: 'cereale', label: 'Céréales' },
  { id: 'legumineuse', label: 'Légumineuses N₂' },
  { id: 'tubercule', label: 'Tubercules' },
  { id: 'maraichage', label: 'Maraîchage' },
  { id: 'perenne', label: 'Pérennes & Plantain' },
];

const filteredCrops = computed(() => {
  return farmStore.crops.filter((crop) => {
    // Search query match
    if (
      searchQuery.value &&
      !crop.name.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
      !crop.variety.toLowerCase().includes(searchQuery.value.toLowerCase())
    ) {
      return false;
    }
    // Family match
    if (selectedFamily.value !== 'all' && crop.family !== selectedFamily.value) {
      return false;
    }
    // Water need match
    if (selectedWater.value !== 'all' && crop.waterNeedLevel !== selectedWater.value) {
      return false;
    }
    // Cycle duration match
    if (selectedCycle.value === 'court' && crop.cycleDays >= 90) return false;
    if (selectedCycle.value === 'moyen' && (crop.cycleDays < 90 || crop.cycleDays > 120)) return false;
    if (selectedCycle.value === 'long' && crop.cycleDays <= 120) return false;

    return true;
  });
});
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
    <!-- Header with Background Graphic -->
    <div class="relative overflow-hidden bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-sm">
      <div class="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary-fixed/25 blur-3xl pointer-events-none"></div>
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1 max-w-3xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-label-md">
            <span class="material-symbols-outlined text-[16px]">eco</span>
            <span>Région Agro-écologique IV • Zone Forestière Bimodale</span>
          </div>
          <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Bibliothèque des Cultures Locales
          </h1>
          <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Fiches agronomiques adaptées au secteur d'Obala &amp; Lékié, étalonnées sur les données de précipitations NASA IMERG et les cycles phénologiques réels de l'IRAD.
          </p>
        </div>
        <AppBadge variant="satellite" icon="satellite_alt">
          NASA IMERG &amp; POWER
        </AppBadge>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/30 shadow-sm space-y-3">
      <!-- Search input -->
      <div class="relative">
        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[22px]">search</span>
        <input
          v-model="searchQuery"
          class="w-full h-12 pl-12 pr-4 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/30"
          placeholder="Rechercher une culture (ex: maïs, manioc, arachide, niébé...)"
          type="text"
        />
      </div>

      <!-- Family Filters Chips -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span class="text-on-surface-variant font-body-bold text-label-md mr-1 whitespace-nowrap">Famille :</span>
        <button
          v-for="f in families"
          :key="f.id"
          type="button"
          :class="[
            'px-3.5 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors cursor-pointer',
            selectedFamily === f.id
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest',
          ]"
          @click="selectedFamily = f.id"
        >
          {{ f.label }}
        </button>
      </div>

      <!-- Water & Duration Filters -->
      <div class="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 border-t border-outline-variant/20">
        <!-- Water filter -->
        <div class="flex items-center gap-2 text-label-md font-label-md">
          <span class="text-on-surface-variant flex items-center gap-1 font-body-bold">
            <span class="material-symbols-outlined text-[16px] text-tertiary">water_drop</span>
            Besoin en eau :
          </span>
          <div class="inline-flex rounded-lg p-0.5 bg-surface-container">
            <button
              v-for="opt in [
                { id: 'all', label: 'Tous' },
                { id: 'faible', label: 'Faible' },
                { id: 'modere', label: 'Modéré' },
                { id: 'eleve', label: 'Élevé' },
              ]"
              :key="opt.id"
              type="button"
              :class="[
                'px-2.5 py-0.5 rounded-md text-caption cursor-pointer transition-colors',
                selectedWater === opt.id
                  ? 'bg-surface-container-lowest text-primary font-body-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface',
              ]"
              @click="selectedWater = opt.id"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- Cycle duration -->
        <div class="flex items-center gap-2 text-label-md font-label-md">
          <span class="text-on-surface-variant flex items-center gap-1 font-body-bold">
            <span class="material-symbols-outlined text-[16px] text-secondary">schedule</span>
            Durée du cycle :
          </span>
          <div class="inline-flex rounded-lg p-0.5 bg-surface-container">
            <button
              v-for="opt in [
                { id: 'all', label: 'Toutes' },
                { id: 'court', label: '< 90 j' },
                { id: 'moyen', label: '90 - 120 j' },
                { id: 'long', label: '> 150 j' },
              ]"
              :key="opt.id"
              type="button"
              :class="[
                'px-2.5 py-0.5 rounded-md text-caption cursor-pointer transition-colors',
                selectedCycle === opt.id
                  ? 'bg-surface-container-lowest text-primary font-body-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface',
              ]"
              @click="selectedCycle = opt.id"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Workspace: Crop Cards Mosaic + Detailed Panel (12 cols) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Cards list (7 cols) -->
      <div class="lg:col-span-7 space-y-3">
        <div class="flex items-center justify-between text-caption text-on-surface-variant px-1">
          <span>{{ filteredCrops.length }} variétés trouvées</span>
          <span>Cliquez pour afficher la fiche détaillée</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="crop in filteredCrops"
            :key="crop.id"
            :class="[
              'bg-surface-container-lowest rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden',
              selectedCrop.id === crop.id
                ? 'border-primary ring-2 ring-primary/20 shadow-md'
                : 'border-outline-variant/30 hover:border-primary/50 shadow-xs',
            ]"
            @click="selectedCrop = crop"
          >
            <div>
              <div class="h-32 w-full rounded-xl overflow-hidden mb-3 bg-surface-container">
                <img :src="crop.imageUrl" :alt="crop.name" class="w-full h-full object-cover" />
              </div>

              <div class="flex items-center justify-between mb-1">
                <span class="font-body-bold text-label-lg text-on-surface">{{ crop.name }}</span>
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full text-[11px] font-semibold',
                    crop.nitrogenFixationKgHa > 0
                      ? 'bg-primary-fixed text-on-primary-fixed-variant'
                      : 'bg-surface-container text-on-surface-variant',
                  ]"
                >
                  {{ crop.nitrogenFixationKgHa > 0 ? `+${crop.nitrogenFixationKgHa} N₂` : `${crop.nitrogenFixationKgHa} N₂` }}
                </span>
              </div>
              <p class="font-caption text-caption text-primary font-medium">{{ crop.variety }}</p>
              <p class="font-caption text-caption text-on-surface-variant mt-1 line-clamp-2">
                {{ crop.description }}
              </p>
            </div>

            <div class="flex items-center justify-between pt-3 mt-2 border-t border-outline-variant/20 text-caption">
              <span class="flex items-center gap-1 text-on-surface-variant">
                <span class="material-symbols-outlined text-[16px]">schedule</span>
                {{ crop.cycleDays }} jours
              </span>
              <span class="flex items-center gap-1 text-tertiary font-semibold">
                <span class="material-symbols-outlined text-[16px]">water_drop</span>
                {{ crop.waterNeedMm }} mm
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Detailed Agronomic Drawer (5 cols) -->
      <div class="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-sm space-y-4 sticky top-20">
        <div class="h-44 w-full rounded-xl overflow-hidden relative shadow-sm">
          <img :src="selectedCrop.imageUrl" :alt="selectedCrop.name" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-transparent to-transparent flex items-end p-4">
            <div class="text-inverse-on-surface">
              <span class="text-caption px-2 py-0.5 rounded bg-surface-container-lowest/30 backdrop-blur-sm">
                Fiche IRAD Nkolbisson
              </span>
              <h3 class="font-headline-sm text-headline-sm mt-1 font-bold">{{ selectedCrop.name }}</h3>
              <p class="font-label-md text-secondary-fixed">{{ selectedCrop.variety }}</p>
              <p v-if="selectedCrop.scientificName" class="text-caption italic opacity-80">{{ selectedCrop.scientificName }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <!-- Institution & Catalog Reference -->
          <div v-if="selectedCrop.iradCatalogCode" class="flex items-center justify-between px-3 py-1.5 bg-surface-container rounded-lg text-caption">
            <span class="font-mono text-primary font-bold">{{ selectedCrop.iradCatalogCode }}</span>
            <span class="text-on-surface-variant">{{ selectedCrop.breedingInstitution || 'IRAD Cameroun' }}</span>
          </div>

          <div class="p-3 bg-surface-container-low rounded-xl space-y-1">
            <span class="font-caption text-caption text-on-surface-variant uppercase tracking-wider block">Description agronomique</span>
            <p class="font-body-md text-body-md text-on-surface">{{ selectedCrop.description }}</p>
          </div>

          <!-- Key Metrics Grid -->
          <div class="grid grid-cols-2 gap-2.5">
            <div class="p-3 rounded-xl bg-surface-container-low">
              <span class="font-caption text-caption text-on-surface-variant block">Rendement potentiel</span>
              <span class="font-body-bold text-label-lg text-primary">
                {{ (selectedCrop.yieldPotentialKgHa / 1000).toFixed(1) }} t/ha
              </span>
            </div>
            <div class="p-3 rounded-xl bg-surface-container-low">
              <span class="font-caption text-caption text-on-surface-variant block">Prix indicatif Obala/Ydé</span>
              <span class="font-body-bold text-label-lg text-secondary">
                {{ selectedCrop.marketPriceFcfaKg }} FCFA / kg
              </span>
            </div>
            <div class="p-3 rounded-xl bg-surface-container-low">
              <span class="font-caption text-caption text-on-surface-variant block">Besoin en eau global</span>
              <span class="font-body-bold text-label-lg text-tertiary">
                {{ selectedCrop.waterNeedMm }} mm
              </span>
            </div>
            <div class="p-3 rounded-xl bg-surface-container-low">
              <span class="font-caption text-caption text-on-surface-variant block">Bilan Azote N₂</span>
              <span
                :class="[
                  'font-body-bold text-label-lg',
                  selectedCrop.nitrogenFixationKgHa > 0 ? 'text-primary' : 'text-error',
                ]"
              >
                {{ selectedCrop.nitrogenFixationKgHa > 0 ? `+${selectedCrop.nitrogenFixationKgHa}` : selectedCrop.nitrogenFixationKgHa }} kg N/ha
              </span>
            </div>
          </div>

          <!-- Critical water stage -->
          <div v-if="selectedCrop.criticalWaterStage" class="p-2.5 rounded-xl bg-surface-container-low text-caption flex items-start gap-2">
            <span class="material-symbols-outlined text-tertiary text-[18px] shrink-0">water_drop</span>
            <div>
              <span class="font-semibold text-on-surface block">Stade critique d'alimentation en eau :</span>
              <span class="text-on-surface-variant">{{ selectedCrop.criticalWaterStage }}</span>
            </div>
          </div>

          <!-- Disease resistances -->
          <div v-if="selectedCrop.diseaseResistance && selectedCrop.diseaseResistance.length > 0" class="space-y-1">
            <span class="font-caption text-caption text-on-surface-variant block">Résistances variétales IRAD :</span>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="(dis, idx) in selectedCrop.diseaseResistance"
                :key="idx"
                class="px-2 py-0.5 rounded-md bg-primary-fixed/20 text-primary font-label-md text-[11px]"
              >
                ✓ {{ dis }}
              </span>
            </div>
          </div>

          <!-- Specific Agronomic Warnings -->
          <div v-if="selectedCrop.agronomicWarnings && selectedCrop.agronomicWarnings.length > 0" class="p-3 rounded-xl bg-error-container/20 border border-error/30 text-caption space-y-1">
            <div class="flex items-center gap-1.5 text-error font-semibold">
              <span class="material-symbols-outlined text-[16px]">warning</span>
              <span>Avertissements de terrain :</span>
            </div>
            <ul class="list-disc list-inside text-on-surface space-y-0.5">
              <li v-for="(warn, wIdx) in selectedCrop.agronomicWarnings" :key="wIdx">{{ warn }}</li>
            </ul>
          </div>
        </div>

        <AppButton
          variant="primary"
          size="md"
          :full-width="true"
          icon="add"
          @click="$router.push('/scenarios')"
        >
          Intégrer dans mon scénario de rotation
        </AppButton>

        <!-- Mandatory Legal Disclaimer -->
        <p class="font-caption text-caption text-center text-on-surface-variant pt-2 border-t border-outline-variant/20">
          {{ appStore.t('app.disclaimer') }}
        </p>
      </div>
    </div>
  </div>
</template>
