<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePeopleStore } from '../store/peopleStore';
import { useAuthStore } from '../store/authStore';
import { Check, X, ShieldCheck, LogOut, Trash2 } from 'lucide-vue-next';
import Logo from '../components/ui/Logo.vue';
import { RANKS } from '../data/constants';

const store = usePeopleStore();
const auth = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const loginError = ref(false);

const handleLogin = async () => {
  const success = await auth.login(username.value, password.value);
  if (success) {
    loginError.value = false;
    await store.fetchPendingPeople();
  } else {
    loginError.value = true;
  }
};

const handleLogout = () => {
  auth.logout();
  router.push('/');
};

const getRankLabel = (slug: string) => {
  return RANKS.find(r => r.slug === slug)?.label || slug;
};

const approve = async (id: number) => {
  await store.approvePerson(id);
};

const reject = async (id: number) => {
  if (confirm('Удалить эту заявку?')) {
    await store.rejectPerson(id);
  }
};

onMounted(() => {
  if (auth.isAuthenticated) {
    store.fetchPendingPeople();
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
    <!-- Login Screen -->
    <div v-if="!auth.isAuthenticated" class="flex-1 flex items-center justify-center p-6">
      <div class="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-10 border border-slate-100">
        <div class="flex flex-col items-center mb-10">
          <Logo size="lg" class="mb-6" />
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Вход для модераторов</h1>
          <p class="text-slate-400 text-sm mt-2">Введите пароль для управления анкетами</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Логин</label>
            <input 
              v-model="username" 
              type="text" 
              class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-mda-blue/5 focus:border-mda-blue outline-none transition-all"
              placeholder="admin_mda"
            />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Пароль</label>
            <input 
              v-model="password" 
              type="password" 
              class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-mda-blue/5 focus:border-mda-blue outline-none transition-all"
              placeholder="••••••••"
            />
            <p v-if="loginError" class="text-[10px] text-red-500 font-bold ml-1">Неверный пароль</p>
          </div>
          <button 
            type="submit"
            class="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] text-xs"
          >
            Войти в панель
          </button>
        </form>
      </div>
    </div>

    <!-- Admin Panel -->
    <template v-else>
      <nav class="bg-slate-900 text-white px-8 py-4 flex justify-between items-center sticky top-0 z-30">
        <div class="flex items-center gap-4">
          <Logo size="sm" />
          <h1 class="text-lg font-black tracking-tight">Панель модератора</h1>
        </div>
        <div class="flex items-center gap-4">
          <button @click="router.push('/')" class="text-xs font-bold bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">
            На карту
          </button>
          <button @click="handleLogout" class="p-2 text-slate-400 hover:text-white transition-colors">
            <LogOut class="h-5 w-5" />
          </button>
        </div>
      </nav>

      <div class="p-8 max-w-5xl mx-auto w-full">
        <div class="mb-10 flex justify-between items-end">
          <div>
            <h2 class="text-3xl font-black text-slate-900 tracking-tight">Очередь модерации</h2>
            <p class="text-slate-400 mt-2">Новые анкеты выпускников, ожидающие проверки.</p>
          </div>
          <div class="bg-mda-blue/5 text-mda-blue px-4 py-2 rounded-xl font-black text-sm">
            Всего: {{ store.pendingPeople.length }}
          </div>
        </div>

        <div v-if="store.pendingPeople.length === 0" class="bg-white p-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center">
          <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck class="h-8 w-8 text-slate-200" />
          </div>
          <p class="text-slate-400 font-bold">Новых заявок пока нет.</p>
        </div>

        <div v-else class="grid gap-6">
          <div 
            v-for="item in store.pendingPeople" 
            :key="item.id"
            class="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-3 mb-3">
                <span class="text-[10px] font-black bg-mda-blue/5 text-mda-blue px-3 py-1 rounded-full uppercase tracking-widest border border-mda-blue/10">
                  {{ getRankLabel(item.rank) }}
                </span>
                <span v-if="item.graduationYear" class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Выпуск {{ item.graduationYear }}</span>
              </div>
              <h3 class="text-xl font-black text-slate-900 tracking-tight mb-2">{{ item.fullName }}</h3>
              <p class="text-sm text-slate-500 leading-relaxed">{{ item.address }}</p>
            </div>

            <div class="flex gap-3 w-full md:w-auto">
              <button 
                @click="reject(item.id)"
                class="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-50 rounded-2xl transition-all active:scale-[0.98]"
              >
                <Trash2 class="h-4 w-4" />
                <span class="text-xs font-black uppercase tracking-widest">Отклонить</span>
              </button>
              <button 
                @click="approve(item.id)"
                class="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] text-xs"
              >
                <Check class="h-4 w-4" />
                Одобрить
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
