import { createRouter, createWebHistory } from "vue-router";
import ChatView from "@/views/ChatView.vue";
import AuthView from "@/views/AuthView.vue";
import { auth } from "@/services/firebase";

const routes = [
  { path: "/", component: AuthView },
  { 
    path: "/chat", 
    component: ChatView,
    beforeEnter: (to, from, next) => {
      if (!auth.currentUser) {
        next("/");
      } else {
        next();
      }
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;