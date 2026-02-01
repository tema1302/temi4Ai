<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import oldPhotos from '@/assets/oldPhotos.webp'
import heroImage from '@/assets/hero-1.webp'
import { useAnalytics } from '@/composables/useAnalytics'
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
  X,
  Play
} from 'lucide-vue-next'

const router = useRouter()
const { trackCtaClick, trackPageScroll } = useAnalytics()

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        trackPageScroll(entry.target.id, 0)
      }
    })
  }, { threshold: 0.3 })

  document.querySelectorAll('section[id]').forEach(section => {
    observer.observe(section)
  })
})

const handleCtaClick = (location: string, label: string, route: string) => {
  trackCtaClick(location, label)
  router.push(route)
}

// Marquee Images
const marqueeImages = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1474540412665-1cdae210ae6b?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1520342868574-5fa3804e551c?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1542596594-649edbc13630?w=400&h=500&fit=crop',
]

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
    <section id="hero" class="relative min-h-[90vh] flex items-center justify-center px-4 py-20 overflow-hidden bg-obsidian">
      
      <!-- Animated Background Blobs -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-20 -left-20 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[100px] opacity-30 animate-pulse-slow"></div>
        <div class="absolute top-1/2 -right-20 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] opacity-40"></div>
      </div>

      <!-- Hero Image Overlay -->
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop" 
          alt="Уютный дом для воспоминаний" 
          class="w-full h-full object-cover opacity-20 scale-105 animate-slow-zoom"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-obsidian/90 via-obsidian/70 to-obsidian"></div>
      </div>

      <div class="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
        
        <!-- Text Content -->
        <div 
          class="text-center md:text-left md:flex-1"
          v-motion
          :initial="{ x: -50, opacity: 0 }"
          :enter="{ x: 0, opacity: 1, transition: { duration: 800, ease: 'easeOut' } }"
        >
          <div class="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-gold/20 bg-gold/5 text-gold text-xs tracking-widest uppercase font-medium backdrop-blur-sm">
            <Sparkles class="w-3 h-3" /> FamStory
          </div>
          
          <h1 class="text-5xl md:text-7xl lg:text-8xl font-serif text-silk leading-tight mb-8">
            Сохраните <br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-200 to-gold italic pr-2">историю</span>
            семьи
          </h1>
          
          <p class="text-xl md:text-2xl text-gray-300 mb-8 max-w-xl leading-relaxed font-light">
            Фотографии, голоса и воспоминания ваших близких на одной красивой, вечной странице.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <BaseButton size="lg" class="shadow-lg shadow-gold/10" @click="handleCtaClick('hero', 'create_archive', '/auth')">
              Создать страницу памяти
            </BaseButton>
            <BaseButton variant="secondary" size="lg" class="backdrop-blur-sm bg-white/5" @click="handleCtaClick('hero', 'view_example', '/smith-family')">
              <Play class="w-4 h-4 mr-2 fill-current" /> Пример
            </BaseButton>
          </div>
          
          <div class="mt-8 flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
             <div class="flex -space-x-3">
               <img v-for="i in 4" :key="i" :src="`https://i.pravatar.cc/100?img=${i+10}`" class="w-8 h-8 rounded-full border-2 border-obsidian" />
             </div>
             <p>Более 1,000 семей уже с нами</p>
          </div>
        </div>

        <!-- Visual / Floating Card -->
        <div 
          class="md:flex-1 relative hidden md:block"
          v-motion
          :initial="{ x: 50, opacity: 0 }"
          :enter="{ x: 0, opacity: 1, transition: { duration: 1000, delay: 200 } }"
        >
          <div class="absolute inset-0 bg-gold/20 blur-[60px] rounded-full transform rotate-12"></div>
          
          <div class="relative bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
             <img 
               :src="heroImage" 
               class="w-full h-[500px] object-cover rounded-lg filter sepia-[0.2]"
               alt="Family memory"
             />
             <div class="absolute bottom-8 left-8 right-8 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <p class="text-silk font-serif text-lg">"Дедушка всегда говорил, что счастье любит тишину..."</p>
                <p class="text-gold text-xs mt-2 uppercase tracking-wider">— 1964 год</p>
             </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. INFINITE MARQUEE -->
    <section class="py-12 bg-charcoal overflow-hidden border-y border-white/5">
      <div class="relative w-full">
        <div class="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-charcoal to-transparent z-10"></div>
        <div class="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-charcoal to-transparent z-10"></div>
        
        <div class="flex gap-4 animate-scroll-left w-max">
           <div 
             v-for="(img, idx) in [...marqueeImages, ...marqueeImages]" 
             :key="idx"
             class="relative w-48 h-64 rounded-lg overflow-hidden flex-shrink-0 group grayscale hover:grayscale-0 transition-all duration-500"
           >
              <img :src="img" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
              <div class="absolute inset-0 bg-gold/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           </div>
        </div>
      </div>
    </section>

    <!-- 3. WHY IT MATTERS -->
    <section id="about" class="py-32 px-4 bg-charcoal relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>

      <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        <div 
          v-motion
          :initial="{ x: -50, opacity: 0 }"
          :visibleOnce="{ x: 0, opacity: 1, transition: { duration: 600 } }"
          class="order-2 md:order-1 relative group"
        >
          <div class="absolute top-4 left-4 right-4 bottom-4 bg-white/5 border border-white/10 rounded-xl rotate-6 transition-transform group-hover:rotate-12 duration-500"></div>
          <div class="absolute top-2 left-2 right-2 bottom-2 bg-white/5 border border-white/10 rounded-xl -rotate-3 transition-transform group-hover:-rotate-6 duration-500"></div>
          
          <img 
            :src="oldPhotos" 
            alt="Старые фотографии" 
            class="relative z-10 rounded-xl shadow-2xl border border-white/10 transition-all duration-700 hover:scale-[1.02] w-full h-auto grayscale-[0.3] hover:grayscale-0"
          />
          
          <div class="absolute -bottom-10 -right-10 z-20 bg-obsidian p-6 rounded-xl border border-gold/20 shadow-xl max-w-xs hidden md:block">
             <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                   <Heart class="w-5 h-5 fill-current" />
                </div>
                <div>
                   <p class="text-gray-300 text-sm italic">"Мы думали, эти фото потеряны навсегда..."</p>
                   <p class="text-gray-500 text-xs mt-2">— Елена, пользователь</p>
                </div>
             </div>
          </div>
        </div>
        
        <div 
          v-motion
          :initial="{ x: 50, opacity: 0 }"
          :visibleOnce="{ x: 0, opacity: 1, transition: { duration: 600, delay: 200 } }"
          class="order-1 md:order-2"
        >
          <span class="text-gold text-sm tracking-widest uppercase font-bold mb-4 block">Проблема</span>
          <h2 class="text-4xl md:text-6xl font-serif text-silk mb-8 leading-tight">
            Когда уходят <br/> слова
          </h2>
          <div class="h-1 w-20 bg-gold mb-8"></div>
          
          <div class="space-y-8 text-gray-400 text-lg leading-relaxed">
            <p>
              Мы часто думаем, что будем помнить всё. Но детали стираются. 
              Голос бабушки, дедушкины советы, история их знакомства — без записи всё это исчезает за одно поколение.
            </p>
            
            <div class="grid grid-cols-1 gap-4">
              <div class="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/5">
                 <div class="w-2 h-2 rounded-full bg-red-400"></div>
                 <span class="text-gray-300">Фотографии теряются в чатах</span>
              </div>
              <div class="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/5">
                 <div class="w-2 h-2 rounded-full bg-red-400"></div>
                 <span class="text-gray-300">Альбомы пылятся в шкафах</span>
              </div>
            </div>

            <p class="pt-4 text-silk font-serif text-xl italic">
              "Память — это единственная встреча, из которой нельзя уйти."
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. WHAT YOU GET (FEATURES) -->
    <section id="features" class="py-32 px-4 bg-obsidian relative">
      <div class="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-charcoal/50 to-transparent pointer-events-none"></div>

      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-20 max-w-3xl mx-auto">
          <h2 class="text-3xl md:text-5xl font-serif text-silk mb-6">Больше, чем просто фото</h2>
          <p class="text-xl text-gray-400">Мы создаем полноценный цифровой памятник, который рассказывает историю жизни.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <BaseCard 
            v-motion
            :initial="{ y: 50, opacity: 0 }"
            :visibleOnce="{ y: 0, opacity: 1, transition: { duration: 500 } }"
            class="p-8 hover:bg-white/5 transition-all duration-300 group border-white/5 hover:border-gold/30 hover:-translate-y-2"
          >
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-transparent border border-white/10 flex items-center justify-center text-gold mb-8 group-hover:scale-110 transition-transform">
              <BookOpen class="w-7 h-7" />
            </div>
            <h3 class="text-2xl font-serif text-silk mb-4">История жизни</h3>
            <p class="text-gray-400 leading-relaxed">
              Не просто даты. Простая лента событий: от рождения до главных побед. Хронология, которую интересно читать будущим поколениям.
            </p>
          </BaseCard>

          <BaseCard 
            v-motion
            :initial="{ y: 50, opacity: 0 }"
            :visibleOnce="{ y: 0, opacity: 1, transition: { duration: 500, delay: 100 } }"
            class="p-8 hover:bg-white/5 transition-all duration-300 group border-white/5 hover:border-gold/30 hover:-translate-y-2"
          >
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-transparent border border-white/10 flex items-center justify-center text-gold mb-8 group-hover:scale-110 transition-transform">
              <Users class="w-7 h-7" />
            </div>
            <h3 class="text-2xl font-serif text-silk mb-4">Галерея лиц</h3>
            <p class="text-gray-400 leading-relaxed">
              Умная галерея сама адаптирует фотографии. Загружайте любые снимки — мы сделаем так, чтобы они смотрелись великолепно на любом телефоне.
            </p>
          </BaseCard>

          <BaseCard 
            v-motion
            :initial="{ y: 50, opacity: 0 }"
            :visibleOnce="{ y: 0, opacity: 1, transition: { duration: 500, delay: 200 } }"
            class="p-8 hover:bg-white/5 transition-all duration-300 group border-white/5 hover:border-gold/30 hover:-translate-y-2"
          >
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-transparent border border-white/10 flex items-center justify-center text-gold mb-8 group-hover:scale-110 transition-transform">
              <Heart class="w-7 h-7" />
            </div>
            <h3 class="text-2xl font-serif text-silk mb-4">Слова мудрости</h3>
            <p class="text-gray-400 leading-relaxed">
              Самое ценное — это мысли. Запишите их любимые фразы, шутки и советы. Это живой голос, который останется навсегда.
            </p>
          </BaseCard>
        </div>
      </div>
    </section>

    <!-- 5. HOW IT WORKS -->
    <section class="py-32 px-4 bg-charcoal overflow-hidden">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-col md:flex-row gap-16 items-center">
           <div class="md:w-1/2">
              <h2 class="text-3xl md:text-5xl font-serif text-silk mb-8">Как это работает?</h2>
              <div class="space-y-12 relative">
                 <div class="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-gold/50 to-transparent md:hidden"></div>
                 <div class="flex gap-6 relative" v-motion :visibleOnce="{ x: 0, opacity: 1 }" :initial="{ x: -20, opacity: 0 }">
                    <div class="w-12 h-12 rounded-full bg-obsidian border border-gold/50 flex items-center justify-center text-gold font-bold z-10 shrink-0">1</div>
                    <div>
                       <h3 class="text-xl text-silk font-bold mb-2">Создайте страницу</h3>
                       <p class="text-gray-400">Зарегистрируйтесь за 30 секунд. Никаких сложных настроек.</p>
                    </div>
                 </div>
                 <div class="flex gap-6 relative" v-motion :visibleOnce="{ x: 0, opacity: 1 }" :initial="{ x: -20, opacity: 0, transition: { delay: 100 } }">
                    <div class="w-12 h-12 rounded-full bg-obsidian border border-gold/50 flex items-center justify-center text-gold font-bold z-10 shrink-0">2</div>
                    <div>
                       <h3 class="text-xl text-silk font-bold mb-2">Наполните памятью</h3>
                       <p class="text-gray-400">Загрузите фото с телефона, добавьте даты и пару историй.</p>
                    </div>
                 </div>
                 <div class="flex gap-6 relative" v-motion :visibleOnce="{ x: 0, opacity: 1 }" :initial="{ x: -20, opacity: 0, transition: { delay: 200 } }">
                    <div class="w-12 h-12 rounded-full bg-gold text-charcoal flex items-center justify-center font-bold z-10 shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.5)]">3</div>
                    <div>
                       <h3 class="text-xl text-silk font-bold mb-2">Поделитесь с семьей</h3>
                       <p class="text-gray-400">Отправьте красивую ссылку в семейный чат. Все будут в восторге.</p>
                    </div>
                 </div>
              </div>
              <div class="mt-12">
                 <BaseButton @click="handleCtaClick('how_it_works', 'start_now', '/auth')">
                    Попробовать сейчас
                 </BaseButton>
              </div>
           </div>
           <div class="md:w-1/2 relative">
              <div class="relative z-10 grid grid-cols-2 gap-4">
                 <img src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400" class="rounded-lg translate-y-8 shadow-2xl opacity-80" />
                 <img src="https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=1000" class="rounded-lg shadow-2xl" />
              </div>
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gold/10 blur-[80px] rounded-full"></div>
           </div>
        </div>
      </div>
    </section>

    <!-- 6. PRICING -->
    <section id="pricing" class="py-32 px-4 bg-obsidian border-t border-white/5">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-5xl font-serif text-silk mb-6">Сохраните навсегда</h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">
            Честные тарифы для вечной памяти.
          </p>
        </div>
        <div class="grid md:grid-cols-3 gap-8 items-start">
          <div 
            v-for="(plan, index) in pricingPlans" 
            :key="index"
            class="relative flex flex-col p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 group"
            :class="[
              plan.primary 
                ? 'bg-white/5 border-gold/40 shadow-[0_0_40px_rgba(212,175,55,0.1)] scale-105 z-10' 
                : 'bg-transparent border-white/10 hover:bg-white/5'
            ]"
          >
            <div v-if="plan.primary" class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-gold to-amber-300 text-charcoal text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
              Популярный
            </div>
            <h3 class="text-xl font-medium text-silk mb-2">{{ plan.name }}</h3>
            <div class="flex items-baseline gap-1 mb-6">
              <span class="text-4xl font-serif text-white">{{ plan.price }}</span>
              <span class="text-gray-500 text-sm">{{ plan.period }}</span>
            </div>
            <div class="w-full h-px bg-white/10 mb-6"></div>
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

    <!-- 7. FOOTER / FINAL CTA -->
    <section class="py-32 px-4 relative overflow-hidden bg-charcoal">
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div class="relative z-10 max-w-4xl mx-auto text-center">
        <h2 class="text-4xl md:text-7xl font-serif text-silk mb-8 leading-tight">
          Оставьте след <br/> в истории
        </h2>
        <p class="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Создать цифровой памятник — это самый простой способ сказать «спасибо» тем, кто был до нас. 
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <BaseButton :full="false" size="lg" class="min-w-[200px]" @click="handleCtaClick('footer', 'start_free', '/auth')">
            Начать бесплатно
          </BaseButton>
        </div>
        <p class="mt-8 text-xs text-gray-600">
          © 2024 FamStory. Ваша память в надежных руках.
        </p>
      </div>
    </section>

  </MainLayout>
</template>

<style scoped>
@keyframes pulse-slow {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.1); }
}
@keyframes slow-zoom {
  0% { transform: scale(1.05); }
  100% { transform: scale(1.15); }
}
@keyframes scroll-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-pulse-slow {
  animation: pulse-slow 8s infinite ease-in-out;
}
.animate-slow-zoom {
  animation: slow-zoom 20s infinite alternate ease-in-out;
}
.animate-scroll-left {
  animation: scroll-left 40s linear infinite;
}
.text-silk {
  color: #f5f5f7;
}
.bg-obsidian {
  background-color: #1a1a23;
}
.bg-charcoal {
  background-color: #24242d;
}
</style>
