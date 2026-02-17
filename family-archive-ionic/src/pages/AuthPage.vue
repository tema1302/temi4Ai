<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import AuthForm from '@/components/auth/AuthForm.vue'
import Logo from '@/shared/ui/Logo.vue'
</script>

<template>
  <ion-page>
    <ion-content>
      <div class="min-h-screen bg-obsidian flex flex-col items-center justify-center p-4">
        <div class="mb-8">
          <Logo />
        </div>
        <AuthForm class="w-full max-w-md" />
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.bg-obsidian {
  background-color: #1a1a23;
}
</style>
