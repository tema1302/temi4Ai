<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import CookieConsent from '@/shared/ui/CookieConsent.vue'
</script>

<template>
  <ion-app>
    <ion-router-outlet />
    <CookieConsent />
  </ion-app>
</template>

<style>
/* Any global styles if needed */
</style>
