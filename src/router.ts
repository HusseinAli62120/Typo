import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/Home.vue";
import Results from "./pages/Results/Results.vue";

// Router setup
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/results", component: Results },
  ],
});
