<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
</script>

<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-24">
      <BaseCard class="p-8 md:p-12 max-w-4xl mx-auto bg-charcoal/80">
        <h1 class="text-3xl font-serif text-silk mb-8">Политика обработки персональных данных</h1>
        
        <div class="prose prose-invert max-w-none text-gray-300">
          <p>Последнее обновление: {{ new Date().toLocaleDateString() }}</p>

          <h3>1. Общие положения</h3>
          <p>Настоящая политика определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных в Сервисе.</p>

          <h3>2. Цели обработки данных</h3>
          <p>Мы обрабатываем данные в целях:</p>
          <ul>
            <li>Идентификации Пользователя в Сервисе.</li>
            <li>Предоставления персонализированных услуг.</li>
            <li>Связи с Пользователем и направления уведомлений.</li>
          </ul>

          <h3>3. Правовые основания</h3>
          <p>Обработка осуществляется на основании Федерального закона №152-ФЗ «О персональных данных» и согласия Пользователя.</p>
          
          <p class="mt-8 italic text-sm">Внимание: Данный текст является шаблоном. Полный текст документов предоставлен в Google Docs владельцем проекта.</p>
        </div>
      </BaseCard>
    </div>
  </MainLayout>
</template>
