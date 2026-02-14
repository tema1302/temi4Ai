<script setup lang="ts">
import { ref } from 'vue';
import { Heart, Users, Map as MapIcon, X } from 'lucide-vue-next';
import Logo from './ui/Logo.vue';

const isVisible = ref(true);
</script>

<template>
  <Transition
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="transform -translate-y-full opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-400 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform -translate-y-full opacity-0"
  >
    <div v-if="isVisible" class="absolute top-4 left-4 right-4 lg:left-auto lg:right-10 lg:w-[500px] z-20">
      <div class="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white p-8 lg:p-10 relative overflow-hidden">
        <!-- Close button -->
        <button @click="isVisible = false" class="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X class="h-5 w-5 text-slate-400" />
        </button>

        <div class="relative z-10">
          <div class="flex items-center gap-4 mb-8">
            <Logo size="md" />
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-mda-blue bg-mda-blue/5 px-3 py-1 rounded-full">Братство МДА</span>
          </div>

          <h1 class="text-3xl lg:text-4xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
            Служение разделило нас по епархиям, но <span class="text-mda-blue">Академия</span> объединила навсегда.
          </h1>

          <p class="text-slate-600 text-sm lg:text-base leading-relaxed mb-8">
            Мы знаем, как легко потеряться в суете приходских будней или затеряться в далекой глубинке. Годы, проведенные у преподобного Сергия, не должны стать просто воспоминанием. Мы создали это место, чтобы вы могли найти своих братьев, протянуть руку помощи или просто сказать «Радуйся!».
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div class="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
              <Heart class="h-5 w-5 text-red-500 shrink-0 mt-1" />
              <p class="text-[11px] text-slate-500 font-bold leading-snug uppercase">Больше не в одиночку</p>
            </div>
            <div class="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
              <Users class="h-5 w-5 text-mda-blue shrink-0 mt-1" />
              <p class="text-[11px] text-slate-500 font-bold leading-snug uppercase">Горизонтальные связи</p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <button @click="isVisible = false" class="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">
              Открыть карту
            </button>
            <router-link to="/add" class="flex-1 py-4 border-2 border-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all text-center">
              Я тоже здесь
            </router-link>
          </div>
        </div>

        <!-- Decorative background element -->
        <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-mda-blue/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  </Transition>
</template>
