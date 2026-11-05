<script setup lang="ts">
import ChevronDown from "@/components/animate-ui/icons/ChevronDown.vue";
import StatsCard from "@/components/StatsCard.vue";
import type { AreaChartItem } from "@/types/AreaChartItem";
import type { ResultCardValue } from "@/types/ResultCardValue";
import { RippleButton } from "@animate-ui/vue/primitives/buttons/ripple";
import { Magnetic } from "@animate-ui/vue/primitives/effects/magnetic";

import {
  LegendPosition,
  AreaChart,
  type BulletLegendItemInterface,
} from "vue-chrts";

const {
  wpm,
  accuracy,
  wpmArray,
  time,
  correctWords,
  totalWords,
  correctCharacters,
  totalCharacters,
} = defineProps<{
  wpm: number;
  wpmArray: number[];
  accuracy: number;
  time: string;
  elapsedSeconds: number;
  correctWords: number;
  totalWords: number;
  correctCharacters: number;
  totalCharacters: number;
}>();

const emit = defineEmits<{ (emit: "restart"): void }>();

// Get the document object to scroll
const document = window.document;

const scrollToScreen2 = () => {
  document.getElementById("screen-2")?.scrollIntoView({ behavior: "smooth" });
};

const AreaChartData: AreaChartItem[] = wpmArray.map((value, index) => {
  return {
    seconds: index + 1,
    wpm: value,
  };
});

const categories: Record<string, BulletLegendItemInterface> = {
  wpm: { name: "WPM", color: "var(--color-brand)" },
};

const xFormatter = (tick: number): string => {
  if (typeof tick === "number" && AreaChartData[tick]?.seconds) {
    return AreaChartData[tick].seconds.toString();
  }
  return String(tick);
};

const fastest = Math.max(...wpmArray);
const slowest = Math.min(...wpmArray);

// Screen-2 Cards
const DetailedResults: ResultCardValue[] = [
  {
    label: "Peak Speed",
    value: `${fastest}`,
    metric: "WPM",
  },
  {
    label: "Average",
    value: `${wpm}`,
    metric: "WPM",
  },
  {
    label: "Slowest",
    value: `${slowest}`,
    metric: "WPM",
  },
  {
    label: "Words",
    value: `${correctWords}/${totalWords}`,
  },
  {
    label: "Mistakes",
    value: `8`,
  },
  {
    label: "Consistency",
    value: "88%",
  },
];
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- Screen-1 -->
    <div class="screen">
      <div class="flex flex-col items-center justify-center space-y-3 mb-16">
        <p
          class="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
        >
          TEST COMPLETE
        </p>
        <div class="flex flex-row items-baseline gap-3">
          <p class="text-[164px] font-bold text-emerald-700 leading-none">
            {{ wpm }}
          </p>
          <p
            class="text-3xl font-bold text-zinc-700 dark:text-zinc-300 leading-none"
          >
            WPM
          </p>
        </div>
      </div>

      <!-- Cards -->
      <div class="flex flex-row items-stretch space-x-5">
        <StatsCard
          label="Accuracy"
          :value="`${accuracy.toString()}%`"
          show-progress
          :progress-value="accuracy"
        />
        <StatsCard label="Time" :value="`${time}`" />
        <StatsCard
          label="Characters"
          :value="`${correctCharacters}/${totalCharacters}`"
        />
      </div>

      <Magnetic class="mt-10 mb-5" :strength="0.4" :range="150">
        <RippleButton
          @click="emit('restart')"
          :tapScale="0.97"
          className="bg-primary text-primary-foreground h-10 rounded-full px-10 
          text-sm font-medium cursor-pointer [--ripple-button-ripple-color:var(--primary-foreground)]"
        >
          Try again
          <RippleButtonRipples />
        </RippleButton>
      </Magnetic>

      <button
        class="flex flex-row items-center space-x-2 cursor-pointer"
        @click="scrollToScreen2"
      >
        <p class="text-muted-foreground">See Your Progress</p>
        <ChevronDown class="w-5 text-muted-foreground" animate-on-hover />
      </button>
    </div>

    <!-- Screen-2 -->
    <div id="screen-2" class="screen">
      <!-- Chart -->
      <div
        class="w-full max-w-7xl flex flex-col items-center space-y-4 bg-card py-5 px-5 rounded-md border border-border"
      >
        <div class="w-full flex flex-row items-center justify-between">
          <p class="text-foreground font-semibold text-xl">Speed Over Time</p>
          <p class="text-muted-foreground text-md">Peak {{ fastest }} WPM</p>
        </div>
        <AreaChart
          :class="'w-full'"
          :data="AreaChartData"
          :height="250"
          class=""
          y-label="WPM"
          x-label="Seconds"
          :tooltip-title-formatter="
            (value: AreaChartItem) => {
              if (value.seconds > 1) {
                return `${value.seconds} Seconds`;
              }
              return `${value.seconds} Second`;
            }
          "
          :categories="categories"
          :y-num-ticks="4"
          :x-num-ticks="wpmArray.length"
          :y-grid-line="true"
          :legend-position="LegendPosition.TopRight"
          :hide-legend="false"
          :marker-config="{
            id: 'areaChart',
            config: {
              wpm: {
                type: 'circle',
                size: 6,
                strokeWidth: 2,
                color: 'var(--color-brand)',
              },
            },
          }"
          :x-formatter="xFormatter"
        />
      </div>

      <!-- Cards -->
      <div class="flex flex-row items-center justify-center space-x-5 my-10">
        <!-- First three elements of the array -->
        <StatsCard
          v-for="(value, index) in DetailedResults.slice(0, 3)"
          :key="index"
          :label="value.label"
          :value="value.value"
          :metric="value.metric"
        />
      </div>

      <!-- Cards -->
      <div class="flex flex-row items-center justify-center space-x-5">
        <!-- Last three elements of the array -->
        <StatsCard
          v-for="(value, index) in DetailedResults.slice(3)"
          :key="index"
          :label="value.label"
          :value="value.value"
        />
      </div>
    </div>
  </div>
</template>
