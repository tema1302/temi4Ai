<script setup lang="ts">
import Logo from '@/shared/ui/Logo.vue'
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-obsidian border-t border-white/5 py-12 mt-auto relative z-10">
    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-4 gap-8 mb-12">
        <!-- Brand -->
        <div class="col-span-1 md:col-span-2">
          <Logo class="mb-4" />
          <p class="text-gray-500 max-w-sm">
            Сохраните историю вашей семьи навсегда. Уютный дом для самых важных воспоминаний.
          </p>
        </div>

        <!-- Links -->
        <div>
          <h4 class="text-silk font-bold mb-4">Навигация</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li>
              <router-link :to="{ path: '/', hash: '#about' }" class="hover:text-gold transition-colors">
                О сервисе
              </router-link>
            </li>
            <li>
              <router-link :to="{ path: '/', hash: '#features' }" class="hover:text-gold transition-colors">
                Возможности
              </router-link>
            </li>
            <li>
              <router-link :to="{ path: '/', hash: '#pricing' }" class="hover:text-gold transition-colors">
                Тарифы
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Legal -->
        <div>
          <h4 class="text-silk font-bold mb-4">Юридическая информация</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li><router-link to="/offer" class="hover:text-gold transition-colors">Публичная оферта</router-link></li>
            <li><router-link to="/pd-policy" class="hover:text-gold transition-colors">Политика обработки ПД</router-link></li>
            <li><router-link to="/privacy" class="hover:text-gold transition-colors">Политика конфиденциальности</router-link></li>
            <li><router-link to="/pd-consent" class="hover:text-gold transition-colors">Согласие на обработку ПД</router-link></li>
            <li><router-link to="/newsletter-consent" class="hover:text-gold transition-colors">Согласие на рассылку</router-link></li>
            <li><router-link to="/cookie-rules" class="hover:text-gold transition-colors">Правила Cookie</router-link></li>
          </ul>
        </div>
      </div>

      <div class="pt-8 border-t border-white/5 text-center text-xs text-gray-600 flex justify-center gap-4">
        <span>© {{ currentYear }} FamStory. Все права защищены.</span>
        <router-link to="/admin" class="opacity-0 hover:opacity-50 transition-opacity">Admin</router-link>
      </div>
    </div>
  </footer>
</template>
