<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useFarmStore } from '@/stores/farmStore';
import { useAppStore } from '@/stores/appStore';
import { Crop } from '@/types';
import { evaluateRotationScenario } from '@/services/scoringEngine';
import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppGauge from '@/components/common/AppGauge.vue';
import AppModal from '@/components/common/AppModal.vue';

const router = useRouter();
const farmStore = useFarmStore();
const appStore = useAppStore();

const activeTab = ref<string>('scenario_a');

const currentScenario = ref(farmStore.scenarios[0]);

const selectScenario = (id: string) => {
  activeTab.value = id;
  const s = farmStore.scenarios.find((item) => item.id === id);
  if (s) {
    currentScenario.value = s;
  }
};

// Modal for changing crop in a phase
const showCropModal = ref(false);
const editingPhaseIndex = ref<number | null>(null);
const modalSearch = ref('');

const filteredModalCrops = computed(() => {
  if (!modalSearch.value) return farmStore.crops;
  const q = modalSearch.value.toLowerCase();
  return farmStore.crops.filter(
    (c) => c.name.toLowerCase().includes(q) || c.variety.toLowerCase().includes(q) || c.family.toLowerCase().includes(q)
  );
});

const openCropSelector = (index: number) => {
  editingPhaseIndex.value = index;
  modalSearch.value = '';
  showCropModal.value = true;
};

const assignCrop = (crop: Crop) => {
  if (editingPhaseIndex.value !== null && currentScenario.value.phases[editingPhaseIndex.value]) {
    currentScenario.value.phases[editingPhaseIndex.value].crop = crop;
    currentScenario.value.phases[editingPhaseIndex.value].waterAdequacyPercent = crop.waterNeedLevel === 'faible' ? 92 : crop.waterNeedLevel === 'modere' ? 82 : 55;
    currentScenario.value.phases[editingPhaseIndex.value].nitrogenBalanceKgHa = crop.nitrogenFixationKgHa;

    // Live evaluate with pure agronomic engine & satellite features!
    const res = evaluateRotationScenario(currentScenario.value.phases, farmStore.weights, farmStore.features);
    currentScenario.value.overallScore = res.score;
    currentScenario.value.nitrogenBalanceKgHa = res.nitrogenBalanceKgHa;
    currentScenario.value.waterStressPercent = res.waterStressRiskPercent;
    currentScenario.value.failureRiskPercent = res.failureRiskPercent;
    currentScenario.value.radarScores = res.radarScores;
    currentScenario.value.scoreExplanation.strengths = res.strengths;
    currentScenario.value.scoreExplanation.weaknesses = res.weaknesses;
    currentScenario.value.scoreExplanation.agronomicSummary = res.agronomicRecommendation;
    currentScenario.value.scoreExplanation.dataSourceWarnings = res.varietyWarnings;
  }
  showCropModal.value = false;
};

const goToDecision = () => {
  router.push('/decision');
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
        <div class="flex items-center gap-2 text-tertiary font-label-md text-label-md uppercase tracking-wider">
          <span class="material-symbols-outlined text-[18px]">satellite_alt</span>
          <span>Télédétection NASA SMAP &amp; IMERG • Modélisation Prédictive</span>
        </div>
        <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          Constructeur de Rotation Pluriannuelle
        </h1>
        <p class="font-body-md text-body-md text-on-surface-variant">
          Simulez l'enchaînement de vos cultures sur 3 saisons pour optimiser l'eau du sol NASA SMAP et la fertilisation naturelle.
        </p>
      </div>

      <div class="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-xl text-on-surface self-start lg:self-auto">
        <span class="material-symbols-outlined text-primary text-[20px]">layers</span>
        <span class="font-label-lg text-label-lg">Parcelle Obala • Sol Ferrallitique Typique</span>
      </div>
    </div>

    <!-- Scenarios Selector Pills -->
    <div class="flex items-center justify-between gap-3 overflow-x-auto pb-1 no-scrollbar">
      <div class="flex items-center gap-3 min-w-max">
        <button
          v-for="s in farmStore.scenarios"
          :key="s.id"
          type="button"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer border',
            activeTab === s.id
              ? s.isRecommended
                ? 'bg-primary text-on-primary border-primary shadow-md'
                : 'bg-primary text-on-primary border-primary shadow-md'
              : 'bg-surface-container-lowest text-on-surface border-outline-variant/30 hover:bg-surface-container-high shadow-xs',
          ]"
          @click="selectScenario(s.id)"
        >
          <span
            :class="[
              'w-2.5 h-2.5 rounded-full',
              s.isRecommended ? 'bg-secondary-container animate-pulse' : 'bg-outline-variant',
            ]"
          ></span>
          <div>
            <span
              :class="[
                'font-label-md text-caption block uppercase tracking-wide',
                activeTab === s.id ? 'text-primary-fixed' : 'text-on-surface-variant',
              ]"
            >
              {{ s.isRecommended ? 'Actif • Recommandé' : `Scénario ${s.tag}` }}
            </span>
            <span class="font-body-bold text-label-lg">{{ s.name }}</span>
          </div>
          <span v-if="s.isRecommended" class="material-symbols-outlined text-[18px] ml-1 opacity-80">
            star
          </span>
        </button>
      </div>

      <div class="hidden xl:flex items-center gap-2 text-on-surface-variant font-caption text-caption shrink-0">
        <span class="w-2 h-2 rounded-full bg-primary"></span>
        <span>Modèle agro-climatique à jour (Centre-Sud Cameroun)</span>
      </div>
    </div>

    <!-- Main Workspace: Timeline (8 cols) & Evaluation Panel (4 cols) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Interactive 3-Season Rotation Timeline (8 cols) -->
      <div class="lg:col-span-8 space-y-4">
        <!-- Stage Header -->
        <div class="flex items-center justify-between bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/30">
          <div class="flex items-center gap-2 text-primary">
            <span class="material-symbols-outlined text-[20px]">timeline</span>
            <span class="font-body-bold text-label-lg">Itinéraire Cultural Sécurisé (3 Phases)</span>
          </div>
          <span class="font-label-md text-caption text-on-surface-variant">Durée cumulée : 365 jours</span>
        </div>

        <!-- Phases List -->
        <div class="space-y-4">
          <div
            v-for="(phase, idx) in currentScenario.phases"
            :key="idx"
            class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-3"
          >
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-outline-variant/20">
              <div class="flex items-center gap-3">
                <span class="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-body-bold text-label-lg shrink-0">
                  {{ idx + 1 }}
                </span>
                <div>
                  <span class="font-label-md text-caption text-tertiary uppercase tracking-wider block">
                    {{ phase.seasonPeriod }}
                  </span>
                  <h3 class="font-headline-sm text-headline-sm text-on-surface">
                    Phase {{ idx + 1 }} : {{ phase.crop.name }} ({{ phase.crop.variety }})
                  </h3>
                </div>
              </div>

              <AppBadge variant="satellite" icon="radar">NASA IMERG • Conforme</AppBadge>
            </div>

            <!-- Content Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="md:col-span-1 rounded-xl overflow-hidden h-36 bg-surface-container relative">
                <img :src="phase.crop.imageUrl" :alt="phase.crop.name" class="w-full h-full object-cover" />
                <div class="absolute bottom-2 left-2 px-2 py-0.5 bg-inverse-surface/80 text-inverse-on-surface text-[10px] rounded backdrop-blur-sm">
                  {{ phase.crop.family.toUpperCase() }}
                </div>
              </div>

              <div class="md:col-span-2 bg-surface-container-low p-3.5 rounded-xl flex flex-col justify-between space-y-2">
                <p class="font-body-md text-caption sm:text-body-md text-on-surface">
                  {{ phase.notes }}
                </p>

                <div class="grid grid-cols-3 gap-2 pt-1 border-t border-outline-variant/20 text-center">
                  <div>
                    <span class="font-caption text-[11px] text-on-surface-variant block">Rendement ciblé</span>
                    <span class="font-body-bold text-label-md text-primary">{{ phase.plannedYieldTonnesHa }} t/ha</span>
                  </div>
                  <div>
                    <span class="font-caption text-[11px] text-on-surface-variant block">Eau NASA</span>
                    <span class="font-body-bold text-label-md text-tertiary">{{ phase.waterAdequacyPercent }}%</span>
                  </div>
                  <div>
                    <span class="font-caption text-[11px] text-on-surface-variant block">Sol (Azote)</span>
                    <span
                      :class="[
                        'font-body-bold text-label-md',
                        phase.crop.nitrogenFixationKgHa > 0 ? 'text-primary' : 'text-error',
                      ]"
                    >
                      {{ phase.crop.nitrogenFixationKgHa > 0 ? `+${phase.crop.nitrogenFixationKgHa}` : phase.crop.nitrogenFixationKgHa }} kg N
                    </span>
                  </div>
                </div>

                <div class="flex justify-end pt-1">
                  <button
                    type="button"
                    class="font-body-bold text-caption text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    @click="openCropSelector(idx)"
                  >
                    <span class="material-symbols-outlined text-[16px]">edit</span>
                    <span>Changer de variété</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Inter-phase warning for pause sèche after season 1 -->
            <div
              v-if="idx === 0"
              class="mt-2 p-2.5 rounded-xl bg-secondary-fixed/30 border border-secondary/40 flex items-center justify-between text-caption text-on-secondary-fixed"
            >
              <span class="flex items-center gap-1.5 font-medium">
                <span class="material-symbols-outlined text-[18px] text-secondary">wb_sunny</span>
                Pause sèche de juillet-août (35 jours) : Paillage conseillé &amp; semis du niébé dès les 1ères pluies de septembre.
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Evaluation Panel (4 cols) -->
      <div class="lg:col-span-4 space-y-4 sticky top-20">
        <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-headline-sm text-headline-sm text-on-surface">Bilan du Scénario</h3>
            <AppBadge v-if="currentScenario.isRecommended" variant="secondary" icon="star">
              Recommandé
            </AppBadge>
          </div>

          <!-- Gauge -->
          <div class="p-4 bg-surface-container-low rounded-xl flex items-center justify-center">
            <AppGauge
              :score="currentScenario.overallScore"
              size="lg"
              label="Indice de Résilience"
              :sublabel="currentScenario.overallScore >= 80 ? 'Équilibré & Rentable' : 'Attention aux stress hydriques'"
            />
          </div>

          <!-- Metrics Matrix -->
          <div class="space-y-2.5 pt-1 text-label-md">
            <div class="flex justify-between items-baseline py-1 border-b border-outline-variant/20">
              <span class="text-on-surface-variant">Marge nette estimée</span>
              <span class="font-body-bold text-label-lg text-secondary">
                {{ currentScenario.netMarginFcfaHa.toLocaleString('fr-FR') }} FCFA / ha
              </span>
            </div>

            <div class="flex justify-between items-baseline py-1 border-b border-outline-variant/20">
              <span class="text-on-surface-variant">Revenu total (3.2 ha)</span>
              <span class="font-body-bold text-label-lg text-on-surface">
                {{ currentScenario.totalIncomePlotFcfa.toLocaleString('fr-FR') }} FCFA
              </span>
            </div>

            <div class="flex justify-between items-baseline py-1 border-b border-outline-variant/20">
              <span class="text-on-surface-variant">Bilan azoté du sol</span>
              <span
                :class="[
                  'font-body-bold text-label-lg flex items-center gap-1',
                  currentScenario.nitrogenBalanceKgHa > 0 ? 'text-primary' : 'text-error',
                ]"
              >
                <span class="material-symbols-outlined text-[16px]">
                  {{ currentScenario.nitrogenBalanceKgHa > 0 ? 'trending_up' : 'trending_down' }}
                </span>
                {{ currentScenario.nitrogenBalanceKgHa > 0 ? `+${currentScenario.nitrogenBalanceKgHa}` : currentScenario.nitrogenBalanceKgHa }} kg N/ha
              </span>
            </div>

            <div class="flex justify-between items-baseline py-1 border-b border-outline-variant/20">
              <span class="text-on-surface-variant">Risque de déficit hydrique</span>
              <span
                :class="[
                  'font-body-bold text-label-lg',
                  currentScenario.waterStressPercent <= 20 ? 'text-primary' : 'text-error',
                ]"
              >
                {{ currentScenario.waterStressPercent }}%
              </span>
            </div>
          </div>

          <div class="space-y-2 pt-2">
            <AppButton
              variant="primary"
              size="lg"
              :full-width="true"
              icon="balance"
              @click="goToDecision"
            >
              Comparer dans le radar multicritère
            </AppButton>
            <AppButton
              variant="secondary"
              size="md"
              :full-width="true"
              icon="visibility"
              @click="goToDetail(currentScenario.id)"
            >
              Voir le détail complet
            </AppButton>
          </div>
        </div>

        <p class="font-caption text-caption text-center text-on-surface-variant">
          Estimation indicative, pas une prévision de rendement.
        </p>
      </div>
    </div>

    <!-- Modal to change crop (24 IRAD Varieties) -->
    <AppModal v-model="showCropModal" title="Catalogue IRAD Cameroun (24 Variétés)">
      <div class="space-y-3">
        <input
          v-model="modalSearch"
          type="text"
          placeholder="Rechercher par nom, variété (ex: CMS 8704, TMS, Lori)..."
          class="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-body-md focus:outline-primary"
        />

        <div class="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
          <div
            v-for="c in filteredModalCrops"
            :key="c.id"
            class="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between cursor-pointer transition-colors"
            @click="assignCrop(c)"
          >
            <div>
              <div class="flex items-center gap-1.5">
                <p class="font-body-bold text-label-lg text-on-surface">{{ c.name }}</p>
                <span v-if="c.iradCatalogCode" class="text-[10px] font-mono px-1.5 py-0.2 bg-surface-container text-primary rounded">
                  {{ c.iradCatalogCode }}
                </span>
              </div>
              <p class="font-caption text-caption text-primary">{{ c.variety }} • {{ c.cycleDays }} jours • {{ c.waterNeedMm }} mm</p>
            </div>
            <span
              :class="[
                'px-2 py-0.5 rounded-full text-caption font-semibold shrink-0 ml-2',
                c.nitrogenFixationKgHa > 0 ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container text-on-surface-variant',
              ]"
            >
              {{ c.nitrogenFixationKgHa > 0 ? `+${c.nitrogenFixationKgHa} N` : `${c.nitrogenFixationKgHa} N` }}
            </span>
          </div>
        </div>
      </div>
    </AppModal>
  </div>
</template>
