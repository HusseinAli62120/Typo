<script setup lang="ts">
import type { ShortcutDefinition } from "@/types/ShortcutDefinition.ts";
import Ghost from "../animate-ui/icons/Ghost.vue";
import Info from "../animate-ui/icons/Info.vue";
import Settings from "../animate-ui/icons/Settings.vue";
import HoverCard from "../ui/hover-card/HoverCard.vue";
import HoverCardContent from "../ui/hover-card/HoverCardContent.vue";
import HoverCardTrigger from "../ui/hover-card/HoverCardTrigger.vue";
import Kbd from "../ui/kbd/Kbd.vue";
import KbdGroup from "../ui/kbd/KbdGroup.vue";
import Separator from "../ui/separator/Separator.vue";
import ThemeToggler from "./ThemeToggler.vue";
import type { SelectedCursor } from "@/types/SelectedCursor.ts";
import RadioGroup from "../ui/radio-group/RadioGroup.vue";
import RadioGroupItem from "../ui/radio-group/RadioGroupItem.vue";
import { Label } from "reka-ui";

const emit = defineEmits<{
  (emit: "selectCursor", value: SelectedCursor): void;
}>();

const { selectedCursor } = defineProps<{
  selectedCursor: SelectedCursor;
}>();

const shortcuts: ShortcutDefinition[] = [
  {
    label: "Restart",
    description: "Restart with different words",
    keys: ["Ctrl", "+", "C"],
  },

  {
    label: "Repeat",
    description: "Restart with the same words",
    keys: ["Ctrl", "+", "R"],
  },
];
</script>

<template>
  <div
    class="w-full h-[10vh] px-4 py-2 flex flex-row items-center justify-between border-b border-border/50"
  >
    <h1 class="text-xl font-semibold text-foreground">Typing speed</h1>
    <div class="flex flex-row items-center space-x-7">
      <!-- Hover Card -->
      <HoverCard class="mx-20">
        <HoverCardTrigger as-child>
          <Info class="w-6" animate-on-hover />
        </HoverCardTrigger>
        <HoverCardContent
          :align="'end'"
          class="max-w-150 max-h-150 w-full h-full"
        >
          <!-- Shorcuts -->
          <div class="flex flex-row items-center space-x-1">
            <Ghost animate-on-hover class="W-5 h-5" />
            <p class="text-md font-semibold text-foreground">Shortcuts</p>
          </div>
          <Separator class="my-2" />

          <!-- Shortcuts definitions -->
          <div class="flex flex-col items-center space-y-2 w-full">
            <!-- Shortcuts item -->
            <div
              v-for="value in shortcuts"
              class="flex flex-row space-x-10 items-start justify-between w-full"
            >
              <div class="flex flex-col items-start space-y-1">
                <p class="text-forground">{{ value.label }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ value.description }}
                </p>
              </div>
              <KbdGroup>
                <Kbd>{{ value.keys[0] }}</Kbd>
                <span>{{ value.keys[1] }}</span>
                <Kbd>{{ value.keys[2] }}</Kbd>
              </KbdGroup>
            </div>
          </div>

          <!-- Settings -->
          <div class="flex flex-row items-center space-x-1 mt-5">
            <Settings animate-on-hover class="W-5 h-5" />
            <p class="text-md font-semibold text-foreground">Settings</p>
          </div>
          <Separator class="my-2" />

          <!-- Cursor select -->
          <RadioGroup
            @update:model-value="
              (value) => {
                emit('selectCursor', value as SelectedCursor);
              }
            "
            :default-value="selectedCursor"
          >
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="fluid" value="fluid" />
              <Label for="fluid">Fluid</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="sleekline" value="sleekline" />
              <Label for="sleekline">Sleekline</Label>
            </div>
            <div class="flex items-center space-x-2">
              <RadioGroupItem id="default" value="default" />
              <Label for="default">Default</Label>
            </div>
          </RadioGroup>
        </HoverCardContent>
      </HoverCard>

      <ThemeToggler />
    </div>
  </div>
</template>
