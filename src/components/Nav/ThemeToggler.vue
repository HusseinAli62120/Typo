<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from "vue";
import { useDark, useToggle } from "@vueuse/core";
import { Moon, Sun } from "@lucide/vue";

export type TransitionVariant =
  | "circle"
  | "square"
  | "triangle"
  | "diamond"
  | "hexagon"
  | "rectangle"
  | "star";

const props = withDefaults(
  defineProps<{
    duration?: number;
    variant?: TransitionVariant;
    /** When true, the transition expands from the viewport center instead of the button center. */
    fromCenter?: boolean;
  }>(),
  {
    duration: 400,
    variant: "circle",
    fromCenter: false,
  },
);

const buttonRef = ref<HTMLButtonElement | null>(null);

// Start from whatever the page currently is, then let useToggle own the state.
// const [isDark, toggleDark] = useToggle(
//   typeof document !== "undefined" &&
//     document.documentElement.classList.contains("dark"),
// );

const isDark = useDark();
const toggleDark = useToggle(isDark);

let isTransitioning = false;
let activeAnim: Animation | null = null;

function cancelAnim() {
  activeAnim?.cancel();
  activeAnim = null;
}

onBeforeUnmount(() => {
  cancelAnim();
  const root = document.documentElement;
  if (root.dataset.magicuiThemeVt !== "active") return;
  delete root.dataset.magicuiThemeVt;
  root.style.removeProperty("--magicui-theme-toggle-vt-duration");
  root.style.removeProperty("--magicui-theme-vt-clip-from");
});

function polygonCollapsed(point: string, vertexCount: number): string {
  const pairs = Array.from({ length: vertexCount }, () => point).join(", ");
  return `polygon(${pairs})`;
}

// All coordinates are percentages of the snapshot reference box: Chrome 150
// renders absolute px clip-path coordinates on ::view-transition-new(root)
// unscaled on fractional display scales (e.g. Windows 150%) for the first
// transition after load, so px values land at the wrong position.
function getThemeTransitionClipPaths(
  variant: TransitionVariant,
  cx: number,
  cy: number,
  maxRadius: number,
  viewportWidth: number,
  viewportHeight: number,
): [string, string] {
  const toX = (x: number) => `${(x / viewportWidth) * 100}%`;
  const toY = (y: number) => `${(y / viewportHeight) * 100}%`;
  const point = (x: number, y: number) => `${toX(x)} ${toY(y)}`;
  // circle() percentage radii resolve against hypot(w, h) / sqrt(2) of the reference box.
  const toRadius = (r: number) =>
    `${(r / (Math.hypot(viewportWidth, viewportHeight) / Math.SQRT2)) * 100}%`;

  switch (variant) {
    case "circle":
      return [
        `circle(0% at ${point(cx, cy)})`,
        `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`,
      ];
    case "square": {
      const halfW = Math.max(cx, viewportWidth - cx);
      const halfH = Math.max(cy, viewportHeight - cy);
      const halfSide = Math.max(halfW, halfH) * 1.05;
      const end = [
        point(cx - halfSide, cy - halfSide),
        point(cx + halfSide, cy - halfSide),
        point(cx + halfSide, cy + halfSide),
        point(cx - halfSide, cy + halfSide),
      ].join(", ");
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`];
    }
    case "triangle": {
      const scale = maxRadius * 2.2;
      const dx = (Math.sqrt(3) / 2) * scale;
      const verts = [
        point(cx, cy - scale),
        point(cx + dx, cy + 0.5 * scale),
        point(cx - dx, cy + 0.5 * scale),
      ].join(", ");
      return [polygonCollapsed(point(cx, cy), 3), `polygon(${verts})`];
    }
    case "diamond": {
      // Slightly larger than the view-transition circle radius so axis-aligned coverage matches the circle reveal.
      const R = maxRadius * Math.SQRT2;
      const end = [
        point(cx, cy - R),
        point(cx + R, cy),
        point(cx, cy + R),
        point(cx - R, cy),
      ].join(", ");
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`];
    }
    case "hexagon": {
      const R = maxRadius * Math.SQRT2;
      const verts: string[] = [];
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 3;
        verts.push(point(cx + R * Math.cos(a), cy + R * Math.sin(a)));
      }
      return [
        polygonCollapsed(point(cx, cy), 6),
        `polygon(${verts.join(", ")})`,
      ];
    }
    case "rectangle": {
      const halfW = Math.max(cx, viewportWidth - cx);
      const halfH = Math.max(cy, viewportHeight - cy);
      const end = [
        point(cx - halfW, cy - halfH),
        point(cx + halfW, cy - halfH),
        point(cx + halfW, cy + halfH),
        point(cx - halfW, cy + halfH),
      ].join(", ");
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`];
    }
    case "star": {
      // Small overscan so the last frames never leave a 1px seam before the transition group ends.
      const R = maxRadius * Math.SQRT2 * 1.03;
      const innerRatio = 0.42;
      const starPolygon = (radius: number) => {
        const verts: string[] = [];
        for (let i = 0; i < 5; i++) {
          const outerA = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
          verts.push(
            point(
              cx + radius * Math.cos(outerA),
              cy + radius * Math.sin(outerA),
            ),
          );
          const innerA = outerA + Math.PI / 5;
          verts.push(
            point(
              cx + radius * innerRatio * Math.cos(innerA),
              cy + radius * innerRatio * Math.sin(innerA),
            ),
          );
        }
        return `polygon(${verts.join(", ")})`;
      };
      const startR = Math.max(2, R * 0.025);
      return [starPolygon(startR), starPolygon(R)];
    }
    default:
      return [
        `circle(0% at ${point(cx, cy)})`,
        `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`,
      ];
  }
}

function toggleTheme() {
  const button = buttonRef.value;
  if (
    !button ||
    isTransitioning ||
    document.documentElement.dataset.magicuiThemeVt === "active"
  )
    return;

  // innerWidth/innerHeight (not visualViewport): percentages must resolve
  // against the snapshot reference box, which includes classic scrollbars.
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let x: number;
  let y: number;
  if (props.fromCenter) {
    x = viewportWidth / 2;
    y = viewportHeight / 2;
  } else {
    const { top, left, width, height } = button.getBoundingClientRect();
    x = left + width / 2;
    y = top + height / 2;
  }

  const maxRadius = Math.hypot(
    Math.max(x, viewportWidth - x),
    Math.max(y, viewportHeight - y),
  );

  const applyTheme = () => {
    toggleDark();
    // Toggle the class synchronously so the View Transitions API
    // snapshots the new theme inside the startViewTransition callback.
    document.documentElement.classList.toggle("dark", isDark.value);
  };

  if (typeof document.startViewTransition !== "function") {
    applyTheme();
    return;
  }

  const clipPath = getThemeTransitionClipPaths(
    props.variant,
    x,
    y,
    maxRadius,
    viewportWidth,
    viewportHeight,
  );

  const root = document.documentElement;
  root.dataset.magicuiThemeVt = "active";
  root.style.setProperty(
    "--magicui-theme-toggle-vt-duration",
    `${props.duration}ms`,
  );
  // Pin the collapsed clip-path via CSS so Firefox does not paint the new
  // theme unclipped between snapshot and the ready.then() JS animation.
  root.style.setProperty("--magicui-theme-vt-clip-from", clipPath[0]);
  const cleanup = () => {
    isTransitioning = false;
    delete root.dataset.magicuiThemeVt;
    root.style.removeProperty("--magicui-theme-toggle-vt-duration");
    root.style.removeProperty("--magicui-theme-vt-clip-from");
    cancelAnim();
  };

  isTransitioning = true;
  // Vue's equivalent of React's flushSync: apply the change, then wait for
  // the DOM to update before the browser captures the "new" snapshot.
  const transition = document.startViewTransition(async () => {
    applyTheme();
    await nextTick();
  });

  if (typeof transition?.finished?.finally === "function") {
    transition.finished.finally(cleanup).catch(() => {});
  } else {
    cleanup();
  }

  const ready = transition?.ready;
  if (ready && typeof ready.then === "function") {
    ready
      .then(() => {
        activeAnim = document.documentElement.animate(
          { clipPath },
          {
            duration: props.duration,
            // Star: linear avoids easing overshoot that fights polygon interpolation at t→1.
            easing: props.variant === "star" ? "linear" : "ease-in-out",
            fill: "forwards",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {});
  }
}
</script>

<template>
  <!-- class and other attrs fall through to the button automatically -->
  <button ref="buttonRef" type="button" @click="toggleTheme">
    <Sun v-if="isDark" />
    <Moon v-else />
    <span class="sr-only">Toggle theme</span>
  </button>
</template>
