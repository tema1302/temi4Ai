<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { computed, ref } from 'vue'
import type { FamilyMember } from '@/modules/family/domain/models'

interface Props {
  data: {
    label?: string
    isFilled?: boolean
    name?: string
    years?: string
    isSelf?: boolean
    role?: string
    member?: FamilyMember
    generation?: number
    displayRole?: string
    photoUrl?: string
    onAddRelative?: (relationType: 'parent' | 'child' | 'spouse' | 'sibling', gender?: 'male' | 'female') => void
  }
}

const props = defineProps<Props>()

const isHovered = ref(false)
const activeMenu = ref<'top' | 'bottom' | 'left' | 'right' | null>(null)

const nodeClasses = computed(() => {
  if (props.data.isFilled) {
    return 'bg-charcoal border-white/10 text-silk'
  }
  return 'bg-white/5 border-white/10 text-gray-500'
})

const borderClasses = computed(() => {
  if (props.data.isFilled) {
    return 'border-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]'
  }
  return 'border-white/10'
})

const displayName = computed(() => {
  return props.data.name || props.data.member?.name || 'Без имени'
})

const displayRole = computed(() => {
  return props.data.displayRole || props.data.member?.displayRole || props.data.member?.relationship || ''
})

const displayYears = computed(() => {
  if (props.data.years) return props.data.years
  const member = props.data.member
  if (!member) return ''
  return `${member.birthDate} ${member.deathDate ? '- ' + member.deathDate : ''}`
})

const displayPhoto = computed(() => {
  return props.data.photoUrl || props.data.member?.photoUrl
})

// Варианты для меню
const topMenuOptions = [
  { label: 'Отец', relationType: 'parent' as const, gender: 'male' as const },
  { label: 'Мать', relationType: 'parent' as const, gender: 'female' as const },
]

const bottomMenuOptions = [
  { label: 'Сын', relationType: 'child' as const, gender: 'male' as const },
  { label: 'Дочь', relationType: 'child' as const, gender: 'female' as const },
]

const sideMenuOptions = [
  { label: 'Супруг', relationType: 'spouse' as const, gender: 'male' as const },
  { label: 'Супруга', relationType: 'spouse' as const, gender: 'female' as const },
  { label: 'Брат', relationType: 'sibling' as const, gender: 'male' as const },
  { label: 'Сестра', relationType: 'sibling' as const, gender: 'female' as const },
]

// Открыть/закрыть меню
const toggleMenu = (position: 'top' | 'bottom' | 'left' | 'right', event: Event) => {
  event.stopPropagation()
  activeMenu.value = activeMenu.value === position ? null : position
}

// Выбрать тип родственника
const selectOption = (option: { label: string; relationType: 'parent' | 'child' | 'spouse' | 'sibling'; gender?: 'male' | 'female' }, event: Event) => {
  event.stopPropagation()
  if (props.data.onAddRelative) {
    props.data.onAddRelative(option.relationType, option.gender)
  }
  activeMenu.value = null
}

// Закрыть меню при уходе курсора
const closeMenu = () => {
  activeMenu.value = null
}
</script>

<template>
  <div
    class="family-node-wrapper relative"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false; closeMenu()"
  >
    <!-- Hover buttons for adding relatives (FigJam-style) -->
    <Transition name="fade">
      <div v-if="isHovered && data.isFilled && data.member" class="add-buttons-container">
        <!-- Parent button (top) -->
        <div class="add-button-top">
          <button
            @click="toggleMenu('top', $event)"
            class="add-button add-button-gold"
            :class="{ 'ring-2 ring-white': activeMenu === 'top' }"
            title="Добавить родителя"
          >
            +
          </button>
          <!-- Dropdown menu for top -->
          <Transition name="menu">
            <div v-if="activeMenu === 'top'" class="dropdown-menu dropdown-menu-top">
              <button
                v-for="option in topMenuOptions"
                :key="option.label"
                @click="selectOption(option, $event)"
                class="dropdown-option"
              >
                {{ option.label }}
              </button>
            </div>
          </Transition>
        </div>

        <!-- Child button (bottom) -->
        <div class="add-button-bottom">
          <button
            @click="toggleMenu('bottom', $event)"
            class="add-button add-button-gold"
            :class="{ 'ring-2 ring-white': activeMenu === 'bottom' }"
            title="Добавить ребёнка"
          >
            +
          </button>
          <!-- Dropdown menu for bottom -->
          <Transition name="menu">
            <div v-if="activeMenu === 'bottom'" class="dropdown-menu dropdown-menu-bottom">
              <button
                v-for="option in bottomMenuOptions"
                :key="option.label"
                @click="selectOption(option, $event)"
                class="dropdown-option"
              >
                {{ option.label }}
              </button>
            </div>
          </Transition>
        </div>

        <!-- Side button (left) -->
        <div class="add-button-left">
          <button
            @click="toggleMenu('left', $event)"
            class="add-button add-button-pink"
            :class="{ 'ring-2 ring-white': activeMenu === 'left' }"
            title="Добавить родственника"
          >
            +
          </button>
          <!-- Dropdown menu for left -->
          <Transition name="menu-left">
            <div v-if="activeMenu === 'left'" class="dropdown-menu dropdown-menu-left">
              <button
                v-for="option in sideMenuOptions"
                :key="option.label"
                @click="selectOption(option, $event)"
                class="dropdown-option dropdown-option-pink"
              >
                {{ option.label }}
              </button>
            </div>
          </Transition>
        </div>

        <!-- Side button (right) -->
        <div class="add-button-right">
          <button
            @click="toggleMenu('right', $event)"
            class="add-button add-button-pink"
            :class="{ 'ring-2 ring-white': activeMenu === 'right' }"
            title="Добавить родственника"
          >
            +
          </button>
          <!-- Dropdown menu for right -->
          <Transition name="menu-right">
            <div v-if="activeMenu === 'right'" class="dropdown-menu dropdown-menu-right">
              <button
                v-for="option in sideMenuOptions"
                :key="option.label"
                @click="selectOption(option, $event)"
                class="dropdown-option dropdown-option-pink"
              >
                {{ option.label }}
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>

    <div
      class="px-4 py-3 rounded-xl border-2 transition-all duration-300 min-w-[160px] text-center cursor-pointer hover:scale-105"
      :class="[nodeClasses, borderClasses]"
    >
    <!-- Filled State -->
    <div v-if="data.isFilled" class="flex flex-col gap-2">
      <!-- Avatar -->
      <div v-if="displayPhoto" class="w-12 h-12 mx-auto rounded-full overflow-hidden border border-white/20">
        <img
          :src="displayPhoto"
          loading="lazy"
          decoding="async"
          class="w-full h-full object-cover"
          alt=""
        />
      </div>
      <div v-else class="w-12 h-12 mx-auto rounded-full bg-gold/10 flex items-center justify-center text-xl text-gold font-serif">
        {{ displayName.charAt(0) }}
      </div>

      <!-- Info -->
      <div class="flex flex-col gap-0.5">
        <span class="text-[8px] uppercase tracking-widest text-gold font-bold opacity-80">{{ displayRole }}</span>
        <span class="text-sm font-serif text-silk font-bold truncate max-w-[140px]">{{ displayName }}</span>
        <span v-if="displayYears" class="text-[9px] text-gray-400 font-mono">{{ displayYears }}</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col gap-1 py-2">
      <span class="text-[10px] uppercase tracking-widest font-bold">{{ data.label || 'Добавить' }}</span>
      <div class="mt-2 text-xs text-gold/60">
        <span class="px-2 py-0.5 rounded-full border border-gold/20">+ добавить</span>
      </div>
    </div>

    <!-- Handles for Vue Flow connections -->
    <Handle type="target" :position="Position.Top" class="!bg-gold/30 !border-none !w-2 !h-2" />
    <Handle type="source" :position="Position.Bottom" class="!bg-gold/30 !border-none !w-2 !h-2" />
    <!-- Side handles for spouse/sibling connections -->
    <Handle type="source" :position="Position.Left" id="left" class="!bg-pink-400/30 !border-none !w-2 !h-2" />
    <Handle type="target" :position="Position.Left" id="left-target" class="!bg-pink-400/30 !border-none !w-2 !h-2" />
    <Handle type="source" :position="Position.Right" id="right" class="!bg-pink-400/30 !border-none !w-2 !h-2" />
    <Handle type="target" :position="Position.Right" id="right-target" class="!bg-pink-400/30 !border-none !w-2 !h-2" />
    </div>
  </div>
</template>

<style scoped>
.vue-flow__handle {
  opacity: 0.5;
}
.vue-flow__handle:hover {
  opacity: 1;
}

/* Container for add buttons - positioned relative to the node */
.add-buttons-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

/* Base button styles */
.add-button {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  pointer-events: auto;
  cursor: pointer;
  border: none;
  opacity: 0;
  animation: pop-in 0.2s ease-out forwards;
}

.add-button:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.add-button-gold {
  background: #d4af37;
  color: #1a1a1f;
}

.add-button-pink {
  background: #f472b6;
  color: white;
}

/* Position buttons centered on edges */
.add-button-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0;
}

.add-button-top .add-button {
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0ms;
}

.add-button-top .add-button:hover {
  transform: translateX(-50%) scale(1.15);
}

.add-button-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0;
}

.add-button-bottom .add-button {
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 50ms;
}

.add-button-bottom .add-button:hover {
  transform: translateX(-50%) scale(1.15);
}

.add-button-left {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
}

.add-button-left .add-button {
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  animation: pop-in-side 0.2s ease-out forwards;
  animation-delay: 100ms;
}

.add-button-left .add-button:hover {
  transform: translateY(-50%) scale(1.15);
}

.add-button-right {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 0;
}

.add-button-right .add-button {
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  animation: pop-in-side 0.2s ease-out forwards;
  animation-delay: 150ms;
}

.add-button-right .add-button:hover {
  transform: translateY(-50%) scale(1.15);
}

/* Animations */
@keyframes pop-in {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.5);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

@keyframes pop-in-side {
  from {
    opacity: 0;
    transform: translateY(-50%) scale(0.5);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
}

/* Dropdown menu base styles */
.dropdown-menu {
  position: absolute;
  background: #1a1a1f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  min-width: 100px;
  z-index: 50;
  pointer-events: auto;
}

.dropdown-option {
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  font-size: 13px;
  color: #f5f5f7;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;
}

.dropdown-option:hover {
  background: rgba(212, 175, 55, 0.2);
}

.dropdown-option-pink:hover {
  background: rgba(244, 114, 182, 0.2);
}

/* Dropdown positions */
.dropdown-menu-top {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.dropdown-menu-bottom {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.dropdown-menu-left {
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
}

.dropdown-menu-right {
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
}

/* Fade transition for the container */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Menu transitions */
.menu-enter-active,
.menu-leave-active {
  transition: all 0.15s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(0.9);
}

.menu-left-enter-active,
.menu-left-leave-active {
  transition: all 0.15s ease;
}

.menu-left-enter-from,
.menu-left-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(-8px) scale(0.9);
}

.menu-right-enter-active,
.menu-right-leave-active {
  transition: all 0.15s ease;
}

.menu-right-enter-from,
.menu-right-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(8px) scale(0.9);
}

/* Family node wrapper */
.family-node-wrapper {
  position: relative;
}
</style>
