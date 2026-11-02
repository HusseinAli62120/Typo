import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/Home.vue";

// Router setup
export const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/", component: Home }],
});
