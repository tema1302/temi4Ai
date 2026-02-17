<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
</script>

<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-24">
      <BaseCard class="p-8 md:p-12 max-w-4xl mx-auto bg-charcoal/80">
        <h1 class="text-3xl font-serif text-silk mb-8">Правила Cookie</h1>
        
        <div class="prose prose-invert max-w-none text-gray-300">
          <p>Настоящие правила объясняют, как мы используем файлы cookie и аналогичные технологии на нашем Сайте.</p>

          <h3>1. Что такое файлы cookie?</h3>
          <p>Файлы cookie — это небольшие текстовые файлы, которые сохраняются в вашем браузере при посещении сайта. Они помогают сайту запомнить информацию о вас.</p>

          <h3>2. Какие типы cookie мы используем?</h3>
          <ul>
            <li><strong>Обязательные:</strong> необходимы для работы авторизации и основных функций.</li>
            <li><strong>Аналитические:</strong> помогают нам понять, как пользователи взаимодействуют с сайтом (Google Analytics).</li>
          </ul>

          <h3>3. Управление cookie</h3>
          <p>Вы можете отключить cookie в настройках своего браузера, однако в этом случае некоторые функции Сервиса могут стать недоступными.</p>
          
          <p class="mt-8 italic text-sm">Внимание: Данный текст является шаблоном. Полный текст документов предоставлен в Google Docs владельцем проекта.</p>
        </div>
      </BaseCard>
    </div>
  </MainLayout>
</template>
