<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
</script>

<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-24">
      <BaseCard class="p-8 md:p-12 max-w-4xl mx-auto bg-charcoal/80">
        <h1 class="text-3xl font-serif text-silk mb-8">Согласие на рекламную рассылку</h1>
        
        <div class="prose prose-invert max-w-none text-gray-300">
          <p>Проставляя отметку в соответствующем поле при регистрации, я даю согласие на получение информационно-рекламных рассылок от Сервиса.</p>

          <p>Рассылки могут содержать:</p>
          <ul>
            <li>Информацию о новых функциях платформы.</li>
            <li>Новости и полезные материалы о сохранении семейной истории.</li>
            <li>Специальные предложения и акции.</li>
          </ul>

          <p>Я уведомлен, что могу в любой момент отказаться от получения рассылок, воспользовавшись ссылкой «Отписаться» в тексте письма или изменив настройки в Личном кабинете.</p>
          
          <p class="mt-8 italic text-sm">Внимание: Данный текст является шаблоном. Полный текст документов предоставлен в Google Docs владельцем проекта.</p>
        </div>
      </BaseCard>
    </div>
  </MainLayout>
</template>
