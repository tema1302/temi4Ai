<script setup lang="ts">
import Logo from '@/shared/ui/Logo.vue'
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer bg-obsidian border-t border-white/5 py-12 mt-auto relative z-10">
    <div class="footer__inner container mx-auto px-4">
      <div class="footer__grid grid md:grid-cols-4 gap-8 mb-12">
        <!-- Brand -->
        <div class="footer__brand col-span-1 md:col-span-2">
          <Logo class="footer__logo mb-4" />
          <p class="footer__tagline text-gray-500 max-w-sm">
            Сохраните историю вашей семьи навсегда. Уютный дом для самых важных воспоминаний.
          </p>
        </div>

        <!-- Links -->
        <div class="footer__nav">
          <h4 class="footer__title text-silk font-bold mb-4">Навигация</h4>
          <ul class="footer__list space-y-2 text-sm text-gray-400">
            <li class="footer__item">
              <router-link :to="{ path: '/', hash: '#about' }" class="footer__link hover:text-gold transition-colors">
                О сервисе
              </router-link>
            </li>
            <li class="footer__item">
              <router-link :to="{ path: '/', hash: '#features' }" class="footer__link hover:text-gold transition-colors">
                Возможности
              </router-link>
            </li>
            <li class="footer__item">
              <router-link :to="{ path: '/', hash: '#pricing' }" class="footer__link hover:text-gold transition-colors">
                Тарифы
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Legal -->
        <div class="footer__legal">
          <h4 class="footer__title text-silk font-bold mb-4">Юридическая информация</h4>
          <ul class="footer__list space-y-2 text-sm text-gray-400">
            <li class="footer__item"><router-link to="/offer" class="footer__link hover:text-gold transition-colors">Публичная оферта</router-link></li>
            <li class="footer__item"><router-link to="/pd-policy" class="footer__link hover:text-gold transition-colors">Политика обработки ПД</router-link></li>
            <li class="footer__item"><router-link to="/privacy" class="footer__link hover:text-gold transition-colors">Политика конфиденциальности</router-link></li>
            <li class="footer__item"><router-link to="/pd-consent" class="footer__link hover:text-gold transition-colors">Согласие на обработку ПД</router-link></li>
            <li class="footer__item"><router-link to="/newsletter-consent" class="footer__link hover:text-gold transition-colors">Согласие на рассылку</router-link></li>
            <li class="footer__item"><router-link to="/cookie-rules" class="footer__link hover:text-gold transition-colors">Правила Cookie</router-link></li>
          </ul>
        </div>
      </div>

      <div class="footer__bottom pt-8 border-t border-white/5 text-center text-xs text-gray-600 flex justify-center gap-4">
        <span class="footer__copyright">© {{ currentYear }} FamStory. Все права защищены.</span>
        <router-link to="/admin" class="footer__admin-link opacity-0 hover:opacity-50 transition-opacity">Admin</router-link>
      </div>
    </div>
  </footer>
</template>
