<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
</script>

<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-24">
      <BaseCard class="p-8 md:p-12 max-w-4xl mx-auto bg-charcoal/80">
        <h1 class="text-3xl font-serif text-silk mb-8">Согласие на обработку персональных данных</h1>
        
        <div class="prose prose-invert max-w-none text-gray-300">
          <p>Я, регистрируясь на сайте FamStory, в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных», даю свое согласие на обработку моих персональных данных.</p>

          <h3>Согласие дается на обработку следующих данных:</h3>
          <ul>
            <li>Фамилия, Имя, Отчество.</li>
            <li>Адрес электронной почты.</li>
            <li>Технические данные (IP-адрес, файлы cookie).</li>
          </ul>

          <p>Настоящее согласие действует бессрочно с момента предоставления данных и может быть отозвано путем направления заявления на электронную почту Сервиса.</p>
          
          <p class="mt-8 italic text-sm">Внимание: Данный текст является шаблоном. Полный текст документов предоставлен в Google Docs владельцем проекта.</p>
        </div>
      </BaseCard>
    </div>
  </MainLayout>
</template>
