<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
</script>

<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-24">
      <BaseCard class="p-8 md:p-12 max-w-4xl mx-auto bg-charcoal/80">
        <h1 class="text-3xl font-serif text-silk mb-8">Пользовательское соглашение</h1>
        
        <div class="prose prose-invert max-w-none text-gray-300">
          <p>Последнее обновление: {{ new Date().toLocaleDateString() }}</p>

          <h3>1. Общие положения</h3>
          <p>Используя сервис FamilyArchive, вы соглашаетесь с данными условиями.</p>

          <h3>2. Права и обязанности</h3>
          <p>Вы обязуетесь загружать только тот контент, на который у вас есть права. Мы оставляем за собой право удалять контент, нарушающий законодательство.</p>

          <h3>3. Отказ от ответственности</h3>
          <p>Сервис предоставляется "как есть". Мы стараемся обеспечить максимальную надежность, но не несем ответственности за возможные технические сбои.</p>

          <h3>4. Подписки</h3>
          <p>Условия тарифных планов "Хранитель" и "Наследие" описаны на странице тарифов. Оплата производится через защищенный платежный шлюз.</p>
        </div>
      </BaseCard>
    </div>
  </MainLayout>
</template>
