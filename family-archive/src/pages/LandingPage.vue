<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()

const faqItems = ref([
  {
    q: 'Как это работает?',
    a: 'Создайте архив, добавьте фотографии и биографию — мы автоматически создадим красивую страницу с уникальной ссылкой.',
    open: false
  },
  {
    q: 'Это безопасно?',
    a: 'Все данные хранятся в защищенной облачной базе Supabase с шифрованием. Редактировать может только владелец.',
    open: false
  },
  {
    q: 'Можно ли поделиться с родственниками?',
    a: 'Да! Каждый архив имеет публичную ссылку, которой можно делиться с кем угодно.',
    open: false
  },
  {
    q: 'Сколько фотографий можно загрузить?',
    a: 'Без ограничений. Храните столько воспоминаний, сколько хотите.',
    open: false
  }
])

const toggleFaq = (index: number) => {
  faqItems.value[index].open = !faqItems.value[index].open
}
</script>

<template>
  <MainLayout>
    
    <!-- HERO SECTION -->
    <section class="relative min-h-screen flex items-center justify-center px-4 py-20">
      <div class="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent opacity-40"></div>
      
      <div class="relative z-10 max-w-5xl mx-auto text-center">
        <div class="inline-block mb-6 px-5 py-2 rounded-full border border-gold/30 bg-gold/5 backdrop-blur-sm">
          <span class="text-gold font-medium tracking-wide uppercase text-sm">Цифровое наследие вашей семьи</span>
        </div>
        
        <h1 class="text-5xl md:text-7xl lg:text-8xl font-serif leading-tight mb-8">
          <span class="block text-silk">Сохраните</span>
          <span class="block bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent italic">
            их историю навсегда
          </span>
        </h1>
        
        <p class="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Создайте элегантный цифровой мемориал за 5 минут. <br class="hidden md:block"/>
          Фотографии, биография, хронология — всё на одной красивой странице.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16">
          <BaseButton size="lg" @click="router.push('/auth')">
            Создать архив бесплатно
          </BaseButton>
          <BaseButton variant="secondary" size="lg" @click="router.push('/smith-family')">
            Посмотреть пример →
          </BaseButton>
        </div>

        <!-- Social Proof -->
        <div class="flex items-center justify-center gap-8 text-gray-400 text-sm">
          <div class="flex items-center gap-2">
            <span class="text-gold text-xl">★★★★★</span>
            <span>4.9/5 отзывов</span>
          </div>
          <div class="hidden md:block w-px h-6 bg-white/10"></div>
          <div>Более 1000 семейных архивов</div>
        </div>
      </div>
    </section>

    <!-- PROBLEM SECTION -->
    <section class="py-32 px-4 bg-gradient-to-b from-transparent to-charcoal/30">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl md:text-5xl font-serif text-silk mb-8">
          Знакомая боль?
        </h2>
        
        <div class="grid md:grid-cols-3 gap-6 mt-12">
          <BaseCard class="p-8 text-center">
            <div class="text-4xl mb-4">📸</div>
            <p class="text-gray-300 leading-relaxed">
              Фотографии разбросаны по телефонам, дискам и старым альбомам
            </p>
          </BaseCard>
          
          <BaseCard class="p-8 text-center">
            <div class="text-4xl mb-4">⏳</div>
            <p class="text-gray-300 leading-relaxed">
              Истории теряются — некому передать память о предках
            </p>
          </BaseCard>
          
          <BaseCard class="p-8 text-center">
            <div class="text-4xl mb-4">🔗</div>
            <p class="text-gray-300 leading-relaxed">
              Сложно поделиться: нужен сайт, но это дорого и трудно
            </p>
          </BaseCard>
        </div>
      </div>
    </section>

    <!-- SOLUTION SECTION -->
    <section class="py-32 px-4">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-6xl font-serif text-silk mb-6">
            Решение за 5 минут
          </h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">
            Без программистов. Без дизайнеров. Просто добавьте фото и текст.
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <BaseCard class="p-2 bg-gradient-to-br from-gold/10 to-purple-500/10">
              <div class="aspect-video bg-charcoal rounded-lg overflow-hidden flex items-center justify-center">
                <span class="text-gray-500 text-sm">[Скриншот редактора]</span>
              </div>
            </BaseCard>
          </div>

          <div class="space-y-8">
            <div class="flex gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold">1</div>
              <div>
                <h3 class="text-xl font-serif text-silk mb-2">Регистрация за 30 секунд</h3>
                <p class="text-gray-400">Просто email и пароль — ничего лишнего.</p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold">2</div>
              <div>
                <h3 class="text-xl font-serif text-silk mb-2">Заполните биографию</h3>
                <p class="text-gray-400">Имя, даты, история жизни. Всё в простом редакторе.</p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold">3</div>
              <div>
                <h3 class="text-xl font-serif text-silk mb-2">Загрузите фотографии</h3>
                <p class="text-gray-400">Наша система автоматически создаст красивую галерею.</p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold">4</div>
              <div>
                <h3 class="text-xl font-serif text-silk mb-2">Поделитесь ссылкой</h3>
                <p class="text-gray-400">Отправьте родственникам — память доступна всегда.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="py-32 px-4 bg-gradient-to-b from-charcoal/30 to-transparent">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-6xl font-serif text-silk mb-6">
            Что внутри?
          </h2>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <BaseCard class="p-8">
            <div class="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6 text-gold">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-2xl font-serif text-silk mb-4">Bento-галерея</h3>
            <p class="text-gray-400 leading-relaxed">
              Фотографии выложены в стиле Apple — современно, стильно, с эффектом размытия при загрузке.
            </p>
          </BaseCard>

          <BaseCard class="p-8">
            <div class="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-2xl font-serif text-silk mb-4">Временная линия</h3>
            <p class="text-gray-400 leading-relaxed">
              Визуализация жизненного пути — от рождения до ухода. С датами и важными событиями.
            </p>
          </BaseCard>

          <BaseCard class="p-8">
            <div class="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 class="text-2xl font-serif text-silk mb-4">Цитаты и мудрость</h3>
            <p class="text-gray-400 leading-relaxed">
              Сохраните их слова, советы, любимые выражения — то, что важно помнить.
            </p>
          </BaseCard>
        </div>
      </div>
    </section>

    <!-- PRICING -->
    <section class="py-32 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl md:text-6xl font-serif text-silk mb-6">
          Доступно каждому
        </h2>
        <p class="text-xl text-gray-400 mb-16">
          Сейчас — полностью бесплатно. Навсегда.
        </p>

        <BaseCard class="p-12 max-w-lg mx-auto bg-gradient-to-br from-gold/5 to-purple-500/5 border-gold/20">
          <div class="text-6xl font-serif text-gold mb-4">0₽</div>
          <p class="text-gray-400 mb-8">Без подписок, без скрытых платежей</p>
          
          <ul class="text-left space-y-4 mb-10">
            <li class="flex items-start gap-3">
              <span class="text-gold mt-1">✓</span>
              <span class="text-silk">Неограниченное количество архивов</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-gold mt-1">✓</span>
              <span class="text-silk">Без лимита на фотографии</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-gold mt-1">✓</span>
              <span class="text-silk">Уникальная ссылка для каждой семьи</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-gold mt-1">✓</span>
              <span class="text-silk">Премиум дизайн из коробки</span>
            </li>
          </ul>

          <BaseButton size="lg" class="w-full" @click="router.push('/auth')">
            Начать прямо сейчас
          </BaseButton>
        </BaseCard>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-32 px-4 bg-gradient-to-b from-transparent to-charcoal/30">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-4xl md:text-5xl font-serif text-silk mb-16 text-center">
          Частые вопросы
        </h2>

        <div class="space-y-4">
          <BaseCard 
            v-for="(item, index) in faqItems" 
            :key="index"
            class="p-6 cursor-pointer transition-all"
            @click="toggleFaq(index)"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-silk pr-4">{{ item.q }}</h3>
              <span class="text-gold text-2xl transition-transform" :class="{ 'rotate-45': item.open }">+</span>
            </div>
            <div 
              v-if="item.open"
              class="mt-4 pt-4 border-t border-white/10 text-gray-400 leading-relaxed"
            >
              {{ item.a }}
            </div>
          </BaseCard>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="py-32 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl md:text-6xl font-serif text-silk mb-8">
          Они заслуживают <br class="hidden md:block"/>
          <span class="text-gold italic">быть запомненными</span>
        </h2>
        <p class="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Создайте цифровой памятник, который переживёт века. <br/>
          Простой. Красивый. Вечный.
        </p>
        
        <BaseButton size="lg" @click="router.push('/auth')">
          Создать архив за 5 минут
        </BaseButton>
      </div>
    </section>

  </MainLayout>
</template>
