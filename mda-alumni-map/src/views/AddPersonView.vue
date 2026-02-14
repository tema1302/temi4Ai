<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ChevronLeft, Info, UserPlus, ShieldCheck, MapPin, Loader2, Check, AlertCircle } from 'lucide-vue-next';
import Logo from '../components/ui/Logo.vue';
import { RANKS } from '../data/constants';
import TheologicalCaptcha from '../components/ui/TheologicalCaptcha.vue';
import { usePeopleStore } from '../store/peopleStore';
import { searchAddresses, type GeocodeResult } from '../utils/geocoder';
import { alumniApi } from '../api/alumniApi';

const router = useRouter();
const route = useRoute();
const store = usePeopleStore();

const form = ref({
  originalId: null as number | null,
  fullName: '',
  rank: '',
  church: '',
  address: '',
  coordinates: null as [number, number] | null,
  contact: '',
  consent: false
});

const fieldErrors = ref<Record<string, string>>({});
const apiError = ref('');
const isVerified = ref(false);
const isSubmitting = ref(false);
const isSearching = ref(false);
const suggestions = ref<GeocodeResult[]>([]);
const userLocation = ref<{ lat: number, lon: number } | null>(null);
const showSuggestions = ref(false);

let debounceTimeout: number | null = null;

const validateField = (field: string) => {
  fieldErrors.value[field] = '';
  apiError.value = '';
  
  if (field === 'fullName') {
    if (!form.value.fullName) fieldErrors.value.fullName = 'Введите ФИО';
    else if (form.value.fullName.length < 5) fieldErrors.value.fullName = 'ФИО слишком короткое';
  }
  
  if (field === 'rank') {
    if (!form.value.rank) fieldErrors.value.rank = 'Выберите статус или сан';
  }
  
  if (field === 'church') {
    if (!form.value.church) fieldErrors.value.church = 'Укажите название храма или организации';
  }
  
  if (field === 'address') {
    if (!form.value.address) fieldErrors.value.address = 'Укажите адрес';
    else if (!form.value.coordinates) fieldErrors.value.coordinates = 'Выберите адрес из списка для определения координат';
  }
};

onMounted(() => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((pos) => {
      userLocation.value = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    });
  }

  if (route.query.edit) {
    const person = store.people.find(p => p.slug === route.query.edit);
    if (person) {
      form.value = {
        originalId: person.id,
        fullName: person.fullName,
        rank: person.rank,
        church: person.address,
        address: person.address,
        coordinates: person.coordinates,
        contact: person.contacts.tg || person.contacts.phone || '',
        consent: false
      };
    }
  }
});

const handleAddressInput = () => {
  showSuggestions.value = true;
  fieldErrors.value.address = '';
  fieldErrors.value.coordinates = '';
  
  if (debounceTimeout) clearTimeout(debounceTimeout);
  
  if (form.value.address.length < 3) {
    suggestions.value = [];
    return;
  }

  debounceTimeout = window.setTimeout(async () => {
    isSearching.value = true;
    suggestions.value = await searchAddresses(form.value.address, userLocation.value || undefined);
    isSearching.value = false;
    if (suggestions.value.length === 0) {
      fieldErrors.value.coordinates = 'Адрес не найден. Попробуйте уточнить запрос.';
    }
  }, 500);
};

const selectSuggestion = (s: GeocodeResult) => {
  form.value.address = s.displayName;
  form.value.coordinates = [s.lat, s.lon];
  suggestions.value = [];
  showSuggestions.value = false;
  fieldErrors.value.coordinates = '';
};

const handleCaptcha = (val: boolean) => {
  isVerified.value = val;
};

const handleSubmit = async () => {
  fieldErrors.value = {};
  apiError.value = '';
  
  // Front-end pre-validation
  validateField('fullName');
  validateField('rank');
  validateField('church');
  validateField('address');
  
  if (!form.value.consent) {
    fieldErrors.value.consentAccepted = 'Необходимо ваше согласие';
  }

  if (Object.values(fieldErrors.value).some(err => err)) {
    apiError.value = 'Пожалуйста, исправьте ошибки в полях выше';
    return;
  }

  if (!isVerified.value) {
    apiError.value = 'Пожалуйста, пройдите проверку (капчу)';
    return;
  }

  isSubmitting.value = true;
  
  const response = await alumniApi.submitAlumni({
    originalId: form.value.originalId || undefined,
    fullName: form.value.fullName,
    rank: form.value.rank as any,
    church: form.value.church,
    address: form.value.address,
    coordinates: form.value.coordinates || undefined as any,
    consentAccepted: form.value.consent,
    lastUpdated: new Date().toISOString(),
    isVerified: false
  });

  if (response.success) {
    alert('Спасибо! Ваша анкетa отправлена на модерацию и появится в очереди админа.');
    router.push('/');
  } else if (response.fieldErrors) {
    fieldErrors.value = { ...fieldErrors.value, ...response.fieldErrors };
    apiError.value = 'Пожалуйста, проверьте правильность заполнения всех полей';
  } else {
    apiError.value = response.error || 'Произошла ошибка при отправке';
  }
  
  isSubmitting.value = false;
};

onMounted(() => {
  const handler = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.address-container')) {
      showSuggestions.value = false;
    }
  };
  window.addEventListener('click', handler);
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
    <nav class="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 sticky top-0 z-20">
      <button @click="router.back()" class="flex items-center text-slate-900 hover:text-mda-blue transition-all font-bold text-sm group">
        <ChevronLeft class="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
        <span>Назад</span>
      </button>
    </nav>

    <div class="flex-1 flex items-start justify-center p-0 md:p-12">
      <div class="w-full max-w-2xl bg-white md:rounded-[2rem] md:shadow-2xl md:shadow-slate-200/50 md:border md:border-slate-100 overflow-hidden min-h-full md:min-h-0">
        <div class="bg-slate-900 p-10 text-white relative overflow-hidden">
          <div class="relative z-10">
            <div class="flex items-center gap-4 mb-6">
              <Logo size="md" />
              <span class="text-[10px] font-black uppercase tracking-[0.2em] text-mda-blue">Участие в проекте</span>
            </div>
            <h1 class="text-3xl font-black tracking-tight">Добавить выпускника</h1>
            <p class="text-slate-400 text-sm mt-3 leading-relaxed max-w-md">Станьте частью сообщества. Координаты определятся автоматически по адресу.</p>
          </div>
          <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-mda-blue/10 rounded-full blur-3xl"></div>
        </div>

        <form @submit.prevent="handleSubmit" class="p-8 md:p-12 space-y-10">
          <div class="space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ФИО полностью</label>
                <input 
                  v-model="form.fullName" 
                  @blur="validateField('fullName')"
                  @input="fieldErrors.fullName = ''"
                  type="text" 
                  class="w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-mda-blue/5 focus:border-mda-blue outline-none transition-all placeholder:text-slate-300" 
                  :class="fieldErrors.fullName ? 'border-red-200 bg-red-50' : 'border-slate-200'"
                  placeholder="Иванов Иван Иванович" 
                />
                <p v-if="fieldErrors.fullName" class="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" /> {{ fieldErrors.fullName }}
                </p>
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Статус / Сан</label>
                <div class="relative">
                  <select 
                    v-model="form.rank" 
                    @change="validateField('rank')"
                    class="w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-mda-blue/5 focus:border-mda-blue outline-none transition-all appearance-none"
                    :class="fieldErrors.rank ? 'border-red-200 bg-red-50' : 'border-slate-200'"
                  >
                    <option value="" disabled>Выберите из списка...</option>
                    <option v-for="rank in RANKS" :key="rank.slug" :value="rank.slug">{{ rank.label }}</option>
                  </select>
                </div>
                <p v-if="fieldErrors.rank" class="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1">
                  <AlertCircle class="h-3 w-3" /> {{ fieldErrors.rank }}
                </p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Название Храма / Организации</label>
              <input 
                v-model="form.church" 
                @blur="validateField('church')"
                @input="fieldErrors.church = ''"
                type="text" 
                class="w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-mda-blue/5 focus:border-mda-blue outline-none transition-all placeholder:text-slate-300" 
                :class="fieldErrors.church ? 'border-red-200 bg-red-50' : 'border-slate-200'"
                placeholder="Собор Рождества Богородицы" 
              />
              <p v-if="fieldErrors.church" class="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1">
                <AlertCircle class="h-3 w-3" /> {{ fieldErrors.church }}
              </p>
            </div>

            <div class="space-y-2 address-container relative">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Точный адрес (для карты)</label>
              <div class="relative group">
                <input 
                  v-model="form.address" 
                  @input="handleAddressInput"
                  @blur="validateField('address')"
                  @focus="showSuggestions = true"
                  type="text" 
                  class="w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-mda-blue/5 focus:border-mda-blue outline-none transition-all placeholder:text-slate-300" 
                  :class="fieldErrors.address ? 'border-red-200 bg-red-50' : 'border-slate-200'"
                  placeholder="г. Москва, ул. Тверская, 1" 
                />
                <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                   <Loader2 v-if="isSearching" class="h-4 w-4 text-mda-blue animate-spin" />
                   <div v-else-if="form.coordinates" class="h-2 w-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                </div>
              </div>

              <!-- Suggestions Dropdown -->
              <div v-if="showSuggestions && suggestions.length > 0" class="absolute z-30 left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden">
                <div 
                  v-for="(s, idx) in suggestions" 
                  :key="idx"
                  @click="selectSuggestion(s)"
                  class="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors flex gap-3 items-start"
                >
                  <MapPin class="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span class="text-xs text-slate-600 font-medium leading-relaxed">{{ s.displayName }}</span>
                </div>
              </div>

              <p v-if="fieldErrors.address" class="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1">
                <AlertCircle class="h-3 w-3" /> {{ fieldErrors.address }}
              </p>
              <p v-if="fieldErrors.coordinates" class="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1">
                <AlertCircle class="h-3 w-3" /> {{ fieldErrors.coordinates }}
              </p>
              <p v-if="form.coordinates && !fieldErrors.coordinates" class="text-[10px] text-green-600 font-bold mt-1 ml-1 flex items-center gap-1">
                <Check class="h-3 w-3" /> Адрес подтвержден
              </p>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Контакт (TG или Телефон)</label>
              <input v-model="form.contact" type="text" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-mda-blue/5 focus:border-mda-blue outline-none transition-all placeholder:text-slate-300" placeholder="@username" />
            </div>
          </div>

          <div class="pt-6 border-t border-slate-100">
             <TheologicalCaptcha @verified="handleCaptcha" />
          </div>

          <div class="space-y-6">
            <div class="p-6 bg-slate-50 rounded-2xl flex gap-4 border border-slate-100 items-start" :class="fieldErrors.consentAccepted ? 'bg-red-50 border-red-100' : ''">
              <div class="p-2 bg-white rounded-xl shadow-sm">
                <ShieldCheck class="h-5 w-5" :class="fieldErrors.consentAccepted ? 'text-red-500' : 'text-mda-blue'" />
              </div>
              <p class="text-[11px] text-slate-500 leading-relaxed font-medium">
                Нажимая кнопку «Отправить», вы подтверждаете согласие на обработку персональных данных согласно <router-link to="/privacy" class="text-mda-blue underline font-bold" target="_blank">152-ФЗ</router-link>.
              </p>
            </div>

            <label class="flex items-start gap-4 px-2 cursor-pointer group/consent">
              <div class="relative flex items-center shrink-0">
                <input 
                  v-model="form.consent" 
                  type="checkbox" 
                  class="peer h-6 w-6 opacity-0 absolute cursor-pointer z-10" 
                />
                <div class="h-6 w-6 border-2 rounded-lg peer-checked:bg-mda-blue peer-checked:border-mda-blue transition-all flex items-center justify-center" :class="fieldErrors.consentAccepted ? 'border-red-300' : 'border-slate-200'">
                   <div class="w-2 h-3 border-r-2 border-b-2 border-white rotate-45 mb-1 opacity-0 peer-checked:opacity-100 transition-opacity !border-white"></div>
                </div>
              </div>
              <span class="text-xs text-slate-500 font-medium select-none pt-1 group-hover/consent:text-slate-700 transition-colors">
                Я подтверждаю, что указанные данные верны.
              </span>
            </label>

            <div v-if="apiError" class="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <AlertCircle class="h-5 w-5 text-red-500 shrink-0" />
              <p class="text-xs text-red-600 font-bold leading-tight">{{ apiError }}</p>
            </div>

            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="w-full py-5 bg-mda-blue text-white rounded-[1.25rem] font-black uppercase tracking-[0.15em] hover:bg-blue-800 disabled:opacity-30 transition-all transform active:scale-[0.98] shadow-2xl shadow-blue-900/20 text-xs"
            >
              <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                <Loader2 class="h-4 w-4 animate-spin" /> Обработка...
              </span>
              <span v-else>Отправить на модерацию</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
