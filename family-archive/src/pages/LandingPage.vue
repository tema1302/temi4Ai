<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import oldPhotos from '@/assets/oldPhotos.webp'
import { 
  BookOpen, 
  Users, 
  Heart, 
  GitFork, 
  ShieldCheck, 
  Download,
  Camera,
  PenTool,
  Sparkles,
  Check,
  X
} from 'lucide-vue-next'
import { useAnalytics } from '@/composables/useAnalytics'

const router = useRouter()
const { trackCtaClick, trackPageScroll } = useAnalytics()

// Simple scroll tracking setup
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  // Track initial page view with custom dimensions if needed
  // Setup intersection observer for sections
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        trackPageScroll(entry.target.id, 0) // 0 implies "viewed"
      }
    })
  }, { threshold: 0.5 })

  document.querySelectorAll('section[id]').forEach(section => {
    observer.observe(section)
  })
})

const handleCtaClick = (location: string, label: string, route: string) => {
  trackCtaClick(location, label)
  router.push(route)
}

// Pricing Data
const pricingPlans = [
  {
    name: 'Базовый',
    price: '0 ₽',
    period: 'навсегда',
    description: 'Для начала истории',
    features: [
      { text: '1 Страница памяти', included: true },
      { text: 'До 30 фотографий', included: true },
      { text: 'Семейное древо', included: false },
      { text: 'Ежегодный бэкап', included: false },
      { text: 'Видео и аудио', included: false },
    ],
    cta: 'Начать бесплатно',
    primary: false
  },
  {
    name: 'Хранитель',
    price: '2 990 ₽',
    period: '/ год',
    description: 'Для всей семьи',
    features: [
      { text: 'Безлимитные страницы', included: true },
      { text: 'Безлимитные фото', included: true },
      { text: 'Семейное древо', included: true },
      { text: 'Ежегодный бэкап', included: true },
      { text: 'Видео и аудио', included: false },
    ],
    cta: 'Выбрать тариф',
    primary: true
  },
  {
    name: 'Наследие',
    price: '3 990 ₽',
    period: '/ год',
    description: 'Максимальная защита',
    features: [
      { text: 'Безлимитные страницы', included: true },
      { text: 'Безлимитные фото', included: true },
      { text: 'Семейное древо', included: true },
      { text: 'Ежегодный бэкап (на почту)', included: true },
      { text: 'Видео и аудио', included: true },
    ],
    cta: 'Выбрать тариф',
    primary: false
  }
]
</script>

<template>
  <MainLayout>
    
    <!-- 1. HERO SCREEN -->
    <!-- Image: Cozy living room / warm light -->
    <section id="hero" class="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      <!-- Background Image with Overlay -->
      <div class="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop" 
          alt="Уютный дом для воспоминаний" 
          class="w-full h-full object-cover opacity-30"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-obsidian/80 via-obsidian/60 to-obsidian"></div>
      </div>

      <div class="relative z-10 max-w-4xl mx-auto text-center">
        <div 
          v-motion
          :initial="{ y: 30, opacity: 0 }"
          :enter="{ y: 0, opacity: 1, transition: { duration: 800 } }"
        >
          <span class="inline-block px-4 py-1.5 mb-6 rounded-full border border-gold/30 bg-gold/10 text-gold text-sm tracking-widest uppercase font-medium">
            Семейный архив
          </span>
          <h1 class="text-5xl md:text-7xl lg:text-8xl font-serif text-silk leading-tight mb-8">
            Уютный дом <br/>
            <span class="italic text-gold">для воспоминаний</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-300 mb-6 max-w-2xl mx-auto font-serif">
            Чтобы истории близких не забылись.
          </p>
          <p class="text-lg text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Соберите фотографии, рассказы и важные даты ваших родных на одной красивой странице. 
            Это как семейный альбом, который невозможно потерять.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <BaseButton size="lg" @click="handleCtaClick('hero', 'create_archive', '/auth')">
              Создать страницу памяти
            </BaseButton>
            <BaseButton variant="secondary" size="lg" @click="handleCtaClick('hero', 'view_example', '/smith-family')">
              Посмотреть пример
            </BaseButton>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. WHY IT MATTERS -->
    <section id="about" class="py-24 px-4 bg-charcoal relative">
      <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div 
          v-motion
          :initial="{ x: -50, opacity: 0 }"
          :visibleOnce="{ x: 0, opacity: 1, transition: { duration: 600 } }"
          class="order-2 md:order-1 relative"
        >
          <div class="absolute -inset-4 bg-gold/5 rounded-2xl -z-10 rotate-3"></div>
          <img 
            :src="oldPhotos" 
            alt="Старые фотографии" 
            class="rounded-lg shadow-2xl border border-white/10 transition-all duration-700 hover:scale-[1.02] w-full h-auto"
          />
        </div>
        
        <div 
          v-motion
          :initial="{ x: 50, opacity: 0 }"
          :visibleOnce="{ x: 0, opacity: 1, transition: { duration: 600, delay: 200 } }"
          class="order-1 md:order-2"
        >
          <h2 class="text-3xl md:text-5xl font-serif text-silk mb-8">
            Когда уходят слова
          </h2>
          <p class="text-gold text-lg mb-6 italic font-serif">
            Память — это то, что мы передаем детям.
          </p>
          <div class="space-y-6 text-gray-400 text-lg leading-relaxed">
            <p>
              Мы часто думаем, что будем помнить всё. Но детали стираются. 
              Голос бабушки, дедушкины советы, история их знакомства — всё это может исчезнуть.
            </p>
            <ul class="space-y-3">
              <li class="flex items-center gap-3">
                <span class="w-2 h-2 rounded-full bg-red-500/70"></span>
                Фотографии лежат в разных телефонах.
              </li>
              <li class="flex items-center gap-3">
                <span class="w-2 h-2 rounded-full bg-red-500/70"></span>
                Старые снимки пылятся в коробках.
              </li>
              <li class="flex items-center gap-3">
                <span class="w-2 h-2 rounded-full bg-red-500/70"></span>
                Рассказы забываются.
              </li>
            </ul>
            <p class="pt-4 border-t border-white/10 text-silk">
              Мы помогли уже 1000 семей собрать эти частички в одно целое.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. WHAT YOU GET (FEATURES) -->
    <section id="features" class="py-24 px-4 bg-obsidian">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl font-serif text-silk mb-4">Что вы получите</h2>
          <p class="text-xl text-gray-400">Простая страница о человеке. Всё самое важное в одном месте.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <BaseCard 
            v-motion
            :initial="{ y: 50, opacity: 0 }"
            :visibleOnce="{ y: 0, opacity: 1, transition: { duration: 500 } }"
            class="p-8 hover:bg-white/5 transition-colors group"
          >
            <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-6 group-hover:scale-110 transition-transform">
              <BookOpen class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-medium text-silk mb-4">История жизни</h3>
            <p class="text-gray-400 leading-relaxed">
              Простая лента событий: от рождения до главных побед. Хронология, которую интересно читать.
            </p>
          </BaseCard>

          <!-- Feature 2 -->
          <BaseCard 
            v-motion
            :initial="{ y: 50, opacity: 0 }"
            :visibleOnce="{ y: 0, opacity: 1, transition: { duration: 500, delay: 100 } }"
            class="p-8 hover:bg-white/5 transition-colors group"
          >
            <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-6 group-hover:scale-110 transition-transform">
              <Users class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-medium text-silk mb-4">Галерея лиц</h3>
            <p class="text-gray-400 leading-relaxed">
              Красиво оформленные фотографии, которые приятно листать. Автоматическая обработка и адаптация под любой экран.
            </p>
          </BaseCard>

          <!-- Feature 3 -->
          <BaseCard 
            v-motion
            :initial="{ y: 50, opacity: 0 }"
            :visibleOnce="{ y: 0, opacity: 1, transition: { duration: 500, delay: 200 } }"
            class="p-8 hover:bg-white/5 transition-colors group"
          >
            <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-6 group-hover:scale-110 transition-transform">
              <Heart class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-medium text-silk mb-4">Слова мудрости</h3>
            <p class="text-gray-400 leading-relaxed">
              Запишите их любимые фразы и советы. Это то, что будет поддерживать вас в трудный момент.
            </p>
          </BaseCard>
        </div>
      </div>
    </section>

    <!-- 4. FAMILY TREE -->
    <section class="py-24 px-4 bg-gradient-to-b from-charcoal to-obsidian border-y border-white/5">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div class="md:w-1/2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs uppercase tracking-wider mb-6">
            <GitFork class="w-4 h-4" /> Семейное древо
          </div>
          <h2 class="text-3xl md:text-5xl font-serif text-silk mb-6">
            Связь поколений
          </h2>
          <p class="text-xl text-gray-300 mb-6 italic">Увидьте, откуда вы пришли.</p>
          <div class="space-y-6 text-gray-400 leading-relaxed">
            <p>
              Теперь это не просто список имен. В нашей системе вы можете соединить страницы родственников.
            </p>
            <p>
              Нажимаете на имя — и открывается целая жизнь. Ваши дети увидят не просто схему, а лица и судьбы своих предков.
            </p>
          </div>
        </div>
        <div 
          class="md:w-1/2 relative"
          v-motion
          :initial="{ scale: 0.9, opacity: 0 }"
          :visibleOnce="{ scale: 1, opacity: 1, transition: { duration: 800 } }"
        >
          <!-- Abstract Tree Visualization -->
          <div class="aspect-square relative rounded-full border border-white/5 flex items-center justify-center bg-obsidian/50 p-12">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gold/5 blur-3xl rounded-full"></div>
            
            <!-- Connection Lines (SVG) -->
            <svg class="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 400">
              <path d="M200 60 L200 200 M200 200 L100 320 M200 200 L300 320" stroke="currentColor" class="text-gold" stroke-width="2" fill="none" />
            </svg>

            <img 
              src="https://images.unsplash.com/photo-1513159446162-54eb8bdaf2e0?q=80&w=800&auto=format&fit=crop" 
              class="w-full h-full object-cover rounded-full opacity-40 border-2 border-white/10"
              alt="Семейное древо"
            />
            
            <!-- Nodes (Professional Silhouette/Icons) -->
            <div class="absolute top-0 left-1/2 w-20 h-20 bg-charcoal border border-gold/40 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)]">
               <Users class="w-8 h-8 text-gold" />
            </div>
             <div class="absolute bottom-10 right-0 w-16 h-16 bg-charcoal border border-white/20 rounded-full flex items-center justify-center">
               <Heart class="w-6 h-6 text-silk/50" />
            </div>
             <div class="absolute bottom-10 left-0 w-16 h-16 bg-charcoal border border-white/20 rounded-full flex items-center justify-center">
               <Sparkles class="w-6 h-6 text-silk/50" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. SECURITY -->
    <section class="py-24 px-4 bg-charcoal">
      <div class="max-w-4xl mx-auto text-center">
        <div class="w-16 h-16 mx-auto bg-green-900/20 text-green-400 rounded-2xl flex items-center justify-center mb-8">
          <ShieldCheck class="w-8 h-8" />
        </div>
        
        <h2 class="text-3xl md:text-5xl font-serif text-silk mb-8">
          Ваша безопасность: <br/>
          <span class="text-gold italic">Память не исчезнет</span>
        </h2>
        
        <p class="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Мы храним данные так, чтобы они остались навсегда.
        </p>

        <div class="grid md:grid-cols-2 gap-8 text-left">
          <div class="p-6 bg-white/5 rounded-xl border border-white/5">
            <h3 class="text-lg font-bold text-silk mb-3">Страх потери</h3>
            <p class="text-gray-400">
              Многие боятся: «А что, если сайт закроется?». Это справедливый вопрос для любого сервиса в интернете.
            </p>
          </div>
          <div class="p-6 bg-gold/5 rounded-xl border border-gold/10">
            <h3 class="text-lg font-bold text-gold mb-3">Наше решение</h3>
            <p class="text-gray-300">
              Мы решили эту проблему по-честному. 
              <span class="text-white font-medium">Раз в год мы присылаем вам на почту полный архив.</span>
            </p>
          </div>
        </div>

        <div class="mt-12 p-8 border border-white/10 rounded-2xl bg-obsidian relative overflow-hidden">
          <div class="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-center">
            <Download class="w-10 h-10 text-gold animate-bounce" />
            <p class="text-gray-400 text-lg">
              Это обычный файл со всеми фото и текстами. Даже если интернета не будет или наш сервис перестанет работать — 
              <span class="text-silk">ваша семейная история останется у вас на компьютере.</span> 
              Вы — хозяин своей памяти.
            </p>
          </div>
        </div>

        <div class="mt-12">
          <BaseButton variant="secondary" :center="true" @click="handleCtaClick('security', 'create_safe_archive', '/auth')">
            Создать безопасный архив
          </BaseButton>
        </div>
      </div>
    </section>

    <!-- 6. HOW IT WORKS -->
    <section class="py-24 px-4 bg-obsidian">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl font-serif text-silk mb-4">Как всё устроено</h2>
          <p class="text-xl text-gray-400">Легко и быстро. Справится даже ребенок.</p>
        </div>

        <div class="grid md:grid-cols-4 gap-6 relative">
          <!-- Connecting Line (Desktop) -->
          <div class="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>

          <!-- Step 1 -->
          <div class="relative text-center group">
            <div class="w-24 h-24 mx-auto bg-charcoal border border-gold/30 rounded-full flex items-center justify-center text-gold text-2xl font-serif mb-6 relative z-10 group-hover:bg-gold group-hover:text-charcoal transition-colors duration-300">
              1
            </div>
            <h3 class="text-lg font-medium text-silk mb-2">Зарегистрируйтесь</h3>
            <p class="text-gray-500 text-sm">Нужна только почта.</p>
          </div>

          <!-- Step 2 -->
          <div class="relative text-center group">
             <div class="w-24 h-24 mx-auto bg-charcoal border border-gold/30 rounded-full flex items-center justify-center text-gold mb-6 relative z-10 group-hover:bg-gold group-hover:text-charcoal transition-colors duration-300">
              <Camera class="w-8 h-8" />
            </div>
            <h3 class="text-lg font-medium text-silk mb-2">Добавьте фото</h3>
            <p class="text-gray-500 text-sm">Просто выберите их в телефоне.</p>
          </div>

          <!-- Step 3 -->
          <div class="relative text-center group">
             <div class="w-24 h-24 mx-auto bg-charcoal border border-gold/30 rounded-full flex items-center justify-center text-gold mb-6 relative z-10 group-hover:bg-gold group-hover:text-charcoal transition-colors duration-300">
              <PenTool class="w-8 h-8" />
            </div>
            <h3 class="text-lg font-medium text-silk mb-2">Напишите пару строк</h3>
            <p class="text-gray-500 text-sm">О том, каким был этот человек.</p>
          </div>

          <!-- Step 4 -->
          <div class="relative text-center group">
             <div class="w-24 h-24 mx-auto bg-charcoal border border-gold/30 rounded-full flex items-center justify-center text-gold mb-6 relative z-10 group-hover:bg-gold group-hover:text-charcoal transition-colors duration-300">
              <Sparkles class="w-8 h-8" />
            </div>
            <h3 class="text-lg font-medium text-silk mb-2">Готово!</h3>
            <p class="text-gray-500 text-sm">Система сама сделает страницу красивой. Без дизайнеров и сложностей.</p>
          </div>
        </div>

        <div class="mt-16 text-center">
          <BaseButton size="lg" :center="true" @click="handleCtaClick('how_it_works', 'try_free', '/auth')">
            Попробовать бесплатно
          </BaseButton>
        </div>
      </div>
    </section>

    <!-- 7. PRICING -->
    <section id="pricing" class="py-24 px-4 bg-charcoal">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl font-serif text-silk mb-6">Выберите подходящий вариант</h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">
            Мы сделали честные тарифы, чтобы сервис мог работать долгие годы.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 items-start">
          <div 
            v-for="(plan, index) in pricingPlans" 
            :key="index"
            class="relative flex flex-col p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-2"
            :class="[
              plan.primary 
                ? 'bg-gold/5 border-gold/40 shadow-[0_0_30px_rgba(212,175,55,0.1)] scale-105 z-10' 
                : 'bg-white/5 border-white/10 hover:border-gold/20'
            ]"
          >
            <div v-if="plan.primary" class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold text-charcoal text-xs font-bold uppercase tracking-wider rounded-full">
              Популярный
            </div>

            <h3 class="text-xl font-medium text-silk mb-2">{{ plan.name }}</h3>
            <div class="flex items-baseline gap-1 mb-4">
              <span class="text-4xl font-serif text-white">{{ plan.price }}</span>
              <span class="text-gray-500 text-sm">{{ plan.period }}</span>
            </div>
            <p class="text-gray-400 text-sm mb-8 min-h-[40px]">{{ plan.description }}</p>

            <ul class="space-y-4 mb-8 flex-1">
              <li 
                v-for="(feature, fIndex) in plan.features" 
                :key="fIndex"
                class="flex items-start gap-3 text-sm"
                :class="feature.included ? 'text-gray-300' : 'text-gray-600'"
              >
                <Check v-if="feature.included" class="w-5 h-5 text-gold shrink-0" />
                <X v-else class="w-5 h-5 text-gray-700 shrink-0" />
                <span>{{ feature.text }}</span>
              </li>
            </ul>

            <BaseButton 
              :variant="plan.primary ? 'primary' : 'secondary'" 
              :full="true"
              @click="handleCtaClick('pricing', `select_plan_${plan.name}`, '/auth')"
            >
              {{ plan.cta }}
            </BaseButton>
          </div>
        </div>
      </div>
    </section>

    <!-- 8. FOOTER / FINAL CTA -->
    <section class="py-32 px-4 relative overflow-hidden">
      <!-- Background texture -->
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      
      <div class="relative z-10 max-w-4xl mx-auto text-center">
        <h2 class="text-4xl md:text-6xl font-serif text-silk mb-8">
          Оставьте след
        </h2>
        <p class="text-2xl text-gold italic font-serif mb-8">
          Они заслужили, чтобы их помнили.
        </p>
        <p class="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Создать цифровой памятник — это самый простой способ сказать «спасибо» тем, кто был до нас. 
          Это фундамент вашей семьи.
        </p>
        
                <BaseButton :full="true" size="lg" @click="handleCtaClick('footer', 'start_free', '/auth')">
                      Начать бесплатно за 5 минут
                    </BaseButton>      </div>
    </section>

  </MainLayout>
</template>
