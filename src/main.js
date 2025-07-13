import { createApp } from 'vue';
import { VueFire, VueFireAuth } from 'vuefire';
import { db } from './services/firebase';
import App from './App.vue';
import router from "./router";

const app = createApp(App);
app.use(VueFire, { firestore: db });
app.use(router);
app.mount('#app');
