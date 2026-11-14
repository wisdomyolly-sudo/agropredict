<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useFarmStore } from '@/stores/farmStore';
import { useAppStore } from '@/stores/appStore';
import AppCard from '@/components/common/AppCard.vue';
import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';

const router = useRouter();
const farmStore = useFarmStore();
const appStore = useAppStore();

const navigateTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
    <!-- Greeting & Status Bar Header -->
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div class="space-y-1.5">
        <div class="flex items-center gap-2 flex-wrap">
          <AppBadge variant="success" :pulse="true">
            {{ appStore.t('dashboard.campaign') }}
          </AppBadge>
          <button
            type="button"
            class="cursor-pointer transition-transform active:scale-95"
            @click="farmStore.refreshLiveTelemetry"
            :title="'Cliquer pour interroger en direct les serveurs NASA POWER pour Obala'"
          >
            <AppBadge variant="satellite" icon="satellite_alt" :pulse="farmStore.isLoadingTelemetry">
              {{ farmStore.isLoadingTelemetry ? 'Interrogation NASA POWER...' : 'NASA POWER & GPM IMERG (Live Sync)' }}
            </AppBadge>
          </button>
        </div>
        <h1 class="font-display-lg text-headline-lg lg:text-display-lg text-on-surface tracking-tight">
          {{ appStore.t('dashboard.greeting', { name: farmStore.user.name.split(' ')[0] }) }}
        </h1>
        <p class="font-body-md text-body-md text-on-surface-variant max-w-3xl">
          {{ appStore.t('dashboard.heroText') }}
        </p>
      </div>

      <!-- Quick Regional Micro Indicator -->
      <div class="hidden xl:flex flex-col items-end text-right bg-surface-container-lowest p-4 rounded-2xl shadow-xs min-w-[220px] border border-outline-variant/20">
        <span class="font-caption text-caption text-on-surface-variant uppercase tracking-wider">{{ appStore.t('dashboard.agroZone') }}</span>
        <span class="font-headline-sm text-headline-sm text-primary font-bold">{{ appStore.t('dashboard.zoneName') }}</span>
        <span class="font-label-md text-label-md text-on-surface-variant mt-0.5">Obala, Cameroun • 4°10'N 11°32'E</span>
      </div>
    </div>

    <!-- Top Grid: Parcelle active & NASA Earth Telemetry Widget -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Current Farm Summary Card (5 cols) -->
      <div class="lg:col-span-5 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-primary/5 pointer-events-none"></div>

        <div class="space-y-4 relative z-10">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[24px]">verified</span>
              <span class="font-label-md text-label-md text-primary font-semibold uppercase tracking-wider">
                {{ appStore.t('dashboard.selectedPlot') }}
              </span>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-caption">
              ID #{{ farmStore.activePlot.code }}
            </span>
          </div>

          <div>
            <h2 class="font-headline-md text-headline-md text-on-surface">
              {{ farmStore.activePlot.name }}
            </h2>
            <p class="font-caption text-caption text-on-surface-variant mt-0.5">
              Exploitant référent : {{ farmStore.activePlot.cooperativeName }}
            </p>
          </div>

          <!-- Soil & Land Metrics Grid -->
          <div class="grid grid-cols-2 gap-2.5 pt-1">
            <div class="p-3 rounded-xl bg-surface-container-low flex flex-col">
              <span class="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px]">straighten</span> {{ appStore.t('dashboard.surface') }}
              </span>
              <span class="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">
                {{ farmStore.activePlot.surfaceHa }} ha
              </span>
              <span class="font-caption text-caption text-primary mt-0.5">{{ appStore.t('dashboard.cultivable') }}</span>
            </div>

            <div class="p-3 rounded-xl bg-surface-container-low flex flex-col">
              <span class="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px]">compost</span> {{ appStore.t('dashboard.soilType') }}
              </span>
              <span class="font-body-bold text-label-lg text-on-surface mt-1 truncate">
                {{ farmStore.activePlot.soilType.split(' ')[0] }}
              </span>
              <span class="font-caption text-caption text-secondary mt-0.5">pH {{ farmStore.activePlot.soilPh }} • {{ appStore.t('dashboard.balanced') }}</span>
            </div>

            <div class="p-3 rounded-xl bg-surface-container-low flex flex-col col-span-2">
              <div class="flex items-center justify-between">
                <span class="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                  <span class="material-symbols-outlined text-[15px]">history_edu</span> {{ appStore.t('dashboard.previousCrop') }}
                </span>
                <span class="font-label-md text-caption text-on-surface-variant">
                  {{ farmStore.activePlot.previousCrop.harvestDate }}
                </span>
              </div>
              <div class="flex items-center justify-between mt-1">
                <span class="font-body-bold text-label-lg text-on-surface">
                  {{ farmStore.activePlot.previousCrop.cropName }} ({{ farmStore.activePlot.previousCrop.variety }})
                </span>
                <span class="text-caption font-caption bg-surface-container-highest px-2 py-0.5 rounded text-on-surface">
                  Rendement : {{ farmStore.activePlot.previousCrop.yieldTonnesHa }} t/ha
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-4 mt-2 flex items-center justify-between border-t border-outline-variant/20 relative z-10">
          <RouterLink
            to="/exploitation"
            class="inline-flex items-center gap-1.5 font-body-bold text-label-lg text-primary hover:text-primary-container transition-colors min-h-[48px]"
          >
            <span>Consulter le registre agronomique</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </RouterLink>
          <button
            class="w-11 h-11 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-variant transition-colors cursor-pointer"
            title="Modifier la parcelle"
            type="button"
            @click="navigateTo('/exploitation')"
          >
            <span class="material-symbols-outlined text-[20px]">edit_location_alt</span>
          </button>
        </div>
      </div>

      <!-- Weather & NASA Satellite Telemetry Widget (7 cols) -->
      <div class="lg:col-span-7 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-5 sm:p-6 flex flex-col justify-between">
        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-tertiary text-[24px]">satellite</span>
              <h3 class="font-headline-sm text-headline-sm text-on-surface">Indicateurs Hydro-Climatiques Directs</h3>
            </div>
            <AppBadge variant="satellite" icon="sensors">
              NASA IMERG + SMAP
            </AppBadge>
          </div>

          <!-- Real-Time Satellite Gauges 3-col -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Rain 7 days -->
            <div class="bg-surface-container-low p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span class="font-caption text-caption text-on-surface-variant block">Cumul 7 derniers jours</span>
                <div class="flex items-baseline gap-1 mt-1">
                  <span class="font-display-lg text-headline-lg text-tertiary font-bold">
                    {{ farmStore.climate.rainfall7dMm }}
                  </span>
                  <span class="font-label-lg text-label-lg text-on-surface">mm</span>
                </div>
              </div>
              <div class="mt-3 flex items-center gap-1 text-primary font-label-md text-caption">
                <span class="material-symbols-outlined text-[16px]">trending_up</span>
                <span>+{{ farmStore.climate.rainfall10yDiffPercent }}% vs moy. 10 ans</span>
              </div>
            </div>

            <!-- Soil Moisture SMAP -->
            <div class="bg-surface-container-low p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span class="font-caption text-caption text-on-surface-variant block">Humidité sol SMAP (0-5cm)</span>
                <div class="flex items-baseline gap-1 mt-1">
                  <span class="font-display-lg text-headline-lg text-primary font-bold">
                    {{ farmStore.climate.soilMoistureSmapPercent }}
                  </span>
                  <span class="font-label-lg text-label-lg text-on-surface">%</span>
                </div>
              </div>
              <div class="mt-3 flex items-center gap-1 text-primary font-label-md text-caption">
                <span class="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Idéale pour semis de maïs</span>
              </div>
            </div>

            <!-- Temperature POWER -->
            <div class="bg-surface-container-low p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span class="font-caption text-caption text-on-surface-variant block">Température air (POWER)</span>
                <div class="flex items-baseline gap-1 mt-1">
                  <span class="font-display-lg text-headline-lg text-secondary font-bold">
                    {{ farmStore.climate.temperatureAvgC }}
                  </span>
                  <span class="font-label-lg text-label-lg text-on-surface">°C</span>
                </div>
              </div>
              <div class="mt-3 flex items-center gap-1 text-on-surface-variant font-label-md text-caption">
                <span class="material-symbols-outlined text-[16px]">device_thermostat</span>
                <span>Évaporation modérée</span>
              </div>
            </div>
          </div>

          <!-- Synthetic Agro Advice Callout -->
          <div class="p-4 rounded-xl bg-primary-fixed/20 border border-primary-fixed flex items-start gap-3">
            <span class="material-symbols-outlined text-primary text-[24px] shrink-0 mt-0.5">tips_and_updates</span>
            <div>
              <p class="font-body-bold text-label-lg text-primary">
                Fenêtre de semis recommandée : {{ farmStore.climate.nextSeedingWindow }}
              </p>
              <p class="font-body-md text-caption sm:text-body-md text-on-surface-variant mt-0.5">
                La nappe superficielle est rechargée. Privilégiez des variétés demi-tardives certifiées IRAD (Maïs CMS 8704) pour exploiter le pic pluviométrique d'avril avant la coupure d'août.
              </p>
            </div>
          </div>
        </div>

        <div class="pt-4 mt-3 flex items-center justify-between border-t border-outline-variant/20">
          <RouterLink
            to="/climat"
            class="inline-flex items-center gap-1.5 font-body-bold text-label-lg text-tertiary hover:underline min-h-[48px]"
          >
            <span>Voir l'analyse agro-climatique complète</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </RouterLink>
          <AppBadge variant="neutral" icon="history">Historique 20 ans</AppBadge>
        </div>
      </div>
    </div>

    <!-- Quick Action Bento Grid -->
    <div>
      <h3 class="font-headline-sm text-headline-sm text-on-surface mb-3">
        Actions Majeures d'Arbitrage
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Action 1: Constructeur -->
        <AppCard
          variant="default"
          :interactive="true"
          @click="navigateTo('/scenarios')"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
              <span class="material-symbols-outlined text-2xl">autorenew</span>
            </div>
            <span class="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_forward</span>
          </div>
          <h4 class="font-headline-sm text-headline-sm text-on-surface">Simulateur de Rotations</h4>
          <p class="font-body-md text-caption sm:text-body-md text-on-surface-variant mt-1">
            Testez l'enchaînement de vos cultures sur 3 saisons culturales et visualisez l'impact sur l'azote et l'eau.
          </p>
        </AppCard>

        <!-- Action 2: Décision & Radar -->
        <AppCard
          variant="recommended"
          :interactive="true"
          @click="navigateTo('/decision')"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-xs">
              <span class="material-symbols-outlined text-2xl">balance</span>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-md text-caption uppercase font-bold">
              3 Scénarios
            </span>
          </div>
          <h4 class="font-headline-sm text-headline-sm text-on-surface">Comparateur &amp; Décision</h4>
          <p class="font-body-md text-caption sm:text-body-md text-on-surface-variant mt-1">
            Ajustez vos critères (eau, rentabilité FCFA, sol) et observez le radar multicritère pour choisir le meilleur compromis.
          </p>
        </AppCard>

        <!-- Action 3: Bibliothèque Semences -->
        <AppCard
          variant="default"
          :interactive="true"
          @click="navigateTo('/cultures')"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shadow-xs">
              <span class="material-symbols-outlined text-2xl">psychiatry</span>
            </div>
            <span class="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_forward</span>
          </div>
          <h4 class="font-headline-sm text-headline-sm text-on-surface">Bibliothèque des Semences</h4>
          <p class="font-body-md text-caption sm:text-body-md text-on-surface-variant mt-1">
            Explorez les 24 fiches variétales certifiées IRAD avec coefficients culturaux et tolérances aux stress.
          </p>
        </AppCard>
      </div>
    </div>

    <!-- Local Newsfeed & Activities -->
    <div class="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-xs">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-headline-sm text-headline-sm text-on-surface">Activités &amp; Alertes Terrain</h3>
        <span class="font-label-md text-label-md text-primary font-semibold">Obala &amp; Lékié</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- Item 1 -->
        <div class="bg-surface-container-low p-3.5 rounded-xl flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[20px]">cloud_sync</span>
          </div>
          <div class="min-w-0">
            <p class="font-body-bold text-label-lg text-on-surface truncate">Pack Hors-Ligne Prêt</p>
            <p class="font-caption text-caption text-on-surface-variant truncate">Cartes satellites Lékié en cache (14.8 Mo)</p>
          </div>
        </div>

        <!-- Item 2 -->
        <div class="bg-surface-container-low p-3.5 rounded-xl flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[20px]">trending_up</span>
          </div>
          <div class="min-w-0">
            <p class="font-body-bold text-label-lg text-on-surface truncate">Manioc à Yaoundé : +15%</p>
            <p class="font-caption text-caption text-on-surface-variant truncate">Marché du 8ème : 18 500 FCFA / sac 100kg</p>
          </div>
        </div>

        <!-- Item 3 -->
        <div class="bg-surface-container-low p-3.5 rounded-xl flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[20px]">groups</span>
          </div>
          <div class="min-w-0">
            <p class="font-body-bold text-label-lg text-on-surface truncate">Visite de Terrain IRAD</p>
            <p class="font-caption text-caption text-on-surface-variant truncate">Démonstration semences maïs CMS 8704</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mandatory Legal Disclaimer -->
    <p class="font-caption text-caption text-center text-on-surface-variant pt-2">
      {{ appStore.t('app.disclaimer') }} NASA Earth observations × IRAD Cameroon models.
    </p>
  </div>
</template>
