import { createApp } from "vue";
import "./style.css";
import { router } from "./router";
import App from "./App.vue";

import { injectSpeedInsights } from "@vercel/speed-insights";

injectSpeedInsights();

createApp(App).use(router).mount("#app");
