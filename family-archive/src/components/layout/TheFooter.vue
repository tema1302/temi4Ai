<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-obsidian border-t border-white/5 py-12 mt-auto relative z-10">
    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-4 gap-8 mb-12">
        <!-- Brand -->
        <div class="col-span-1 md:col-span-2">
          <div class="text-xl font-serif font-bold text-silk flex items-center gap-2 mb-4">
            <span class="text-2xl">🏛️</span>
            <span>Family<span class="text-gold">Archive</span></span>
          </div>
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
          <h4 class="text-silk font-bold mb-4">Документы</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li><router-link to="/privacy" class="hover:text-gold transition-colors">Политика конфиденциальности</router-link></li>
            <li><router-link to="/terms" class="hover:text-gold transition-colors">Пользовательское соглашение</router-link></li>
          </ul>
        </div>
      </div>

      <div class="pt-8 border-t border-white/5 text-center text-xs text-gray-600">
        © {{ currentYear }} FamilyArchive. Все права защищены.
      </div>
    </div>
  </footer>
</template>
