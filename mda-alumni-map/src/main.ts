import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import './style.css';
import App from './App.vue';
import { logger } from './services/logger';

const app = createApp(App);

app.config.errorHandler = (err, _instance, info) => {
  logger.error(`Global Vue Error: ${info}`, err);
};

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise Rejection', event.reason);
});

app.use(createPinia());
app.use(router);
app.mount('#app');