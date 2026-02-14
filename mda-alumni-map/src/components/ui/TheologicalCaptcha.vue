<script setup lang="ts">
import { ref, onMounted } from 'vue';

const emit = defineEmits(['verified']);

const questions = [
  { q: 'Сколько Евангелий в Новом Завете?', a: ['4', 'четыре'] },
  { q: 'Имя первого человека?', a: ['адам'] },
  { q: 'Сколько дней длится Великий пост (до Страстной седмицы)?', a: ['40', 'сорок'] },
  { q: 'Как звали брата Моисея?', a: ['аарон'] },
  { q: 'Город, где родился Христос?', a: ['вифлеем'] },
];

const currentQuestion = ref({ q: '', a: [] as string[] });
const answer = ref('');
const error = ref(false);
const isVerified = ref(false);

onMounted(() => {
  const idx = Math.floor(Math.random() * questions.length);
  currentQuestion.value = questions[idx];
});

const checkAnswer = () => {
  const val = answer.value.trim().toLowerCase();
  if (currentQuestion.value.a.includes(val)) {
    isVerified.value = true;
    error.value = false;
    emit('verified', true);
  } else {
    error.value = true;
    answer.value = '';
    emit('verified', false);
  }
};
</script>

<template>
  <div class="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
    <div class="flex items-center gap-2">
      <span class="text-sm font-bold text-gray-700 uppercase tracking-wider">Проверка</span>
      <span v-if="isVerified" class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Успешно</span>
    </div>
    
    <div v-if="!isVerified">
      <label class="block text-sm text-gray-600 mb-2">{{ currentQuestion.q }}</label>
      <div class="flex gap-2">
        <input 
          v-model="answer" 
          @keyup.enter="checkAnswer"
          type="text" 
          class="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-mda-blue outline-none transition-all"
          :class="error ? 'border-red-300 bg-red-50' : 'border-gray-300'"
          placeholder="Ваш ответ"
        />
        <button 
          type="button"
          @click="checkAnswer"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
        >
          OK
        </button>
      </div>
      <p v-if="error" class="text-xs text-red-500 mt-1">Неверно. Попробуйте еще раз.</p>
    </div>
    <div v-else>
      <p class="text-sm text-gray-500">Вы подтвердили, что вы — свой.</p>
    </div>
  </div>
</template>
