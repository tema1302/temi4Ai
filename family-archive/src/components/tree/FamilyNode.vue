<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { computed, ref, onMounted, onUnmounted } from 'vue'
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
const isMobile = ref(false)

// Detect mobile device
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768 || 'ontouchstart' in window
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Show add buttons: always on mobile, on hover on desktop
const showAddButtons = computed(() => {
  return isMobile.value || (isHovered.value && props.data.isFilled && props.data.member)
})

const isSelf = computed(() => {
  const rel = props.data.member?.relationship?.toLowerCase() || ''
  return rel.includes('это вы') || rel.includes('self')
})

const isComplete = computed(() => {
  const m = props.data.member
  if (!m) return false
  // Check completion: needs name, photo, and biography or dates
  const hasPhoto = !!m.photoUrl
  const hasBio = !!m.biography && m.biography.length > 20
  const hasDates = !!m.birthDate
  
  // High weight for photo and bio
  return hasPhoto && (hasBio || hasDates)
})

const nodeClasses = computed(() => {
  if (props.data.isFilled) {
    // Optimized: use specific transitions instead of transition-all
    let classes = 'bg-charcoal border-white/10 text-silk transition-[opacity,transform,border-color] duration-300 will-change-transform '
    // Note: removed grayscale filter - very expensive on older hardware

    if (isSelf.value) {
      // Simplified shadow - smaller blur radius
      classes += 'ring-4 ring-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.3)] '
    } else if (!isComplete.value) {
      classes += 'opacity-40 hover:opacity-100 '
    }

    return classes
  }
  return 'bg-white/5 border-white/10 text-gray-500'
})

const borderClasses = computed(() => {
  if (props.data.isFilled) {
    if (isSelf.value) return 'border-gold scale-110 z-10'
    return 'border-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
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
    class="family-node"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false; closeMenu()"
  >
    <!-- Hover buttons for adding relatives (FigJam-style) -->
    <Transition name="fade">
      <div v-show="showAddButtons" class="family-node__add-container">
        <!-- Parent button (top) -->
        <div class="family-node__add-wrapper family-node__add-wrapper--top">
          <button
            @click="toggleMenu('top', $event)"
            class="family-node__add-btn family-node__add-btn--gold"
            :class="{ 'family-node__add-btn--active': activeMenu === 'top' }"
            title="Добавить родителя"
          >
            +
          </button>
          <!-- Dropdown menu for top -->
          <Transition name="menu">
            <div v-show="activeMenu === 'top'" class="family-node__dropdown family-node__dropdown--top">
              <button
                v-for="option in topMenuOptions"
                :key="option.label"
                @click="selectOption(option, $event)"
                class="family-node__dropdown-item"
              >
                {{ option.label }}
              </button>
            </div>
          </Transition>
        </div>

        <!-- Child button (bottom) -->
        <div class="family-node__add-wrapper family-node__add-wrapper--bottom">
          <button
            @click="toggleMenu('bottom', $event)"
            class="family-node__add-btn family-node__add-btn--gold"
            :class="{ 'family-node__add-btn--active': activeMenu === 'bottom' }"
            title="Добавить ребёнка"
          >
            +
          </button>
          <!-- Dropdown menu for bottom -->
          <Transition name="menu">
            <div v-show="activeMenu === 'bottom'" class="family-node__dropdown family-node__dropdown--bottom">
              <button
                v-for="option in bottomMenuOptions"
                :key="option.label"
                @click="selectOption(option, $event)"
                class="family-node__dropdown-item"
              >
                {{ option.label }}
              </button>
            </div>
          </Transition>
        </div>

        <!-- Side button (left) -->
        <div class="family-node__add-wrapper family-node__add-wrapper--left">
          <button
            @click="toggleMenu('left', $event)"
            class="family-node__add-btn family-node__add-btn--pink"
            :class="{ 'family-node__add-btn--active': activeMenu === 'left' }"
            title="Добавить родственника"
          >
            +
          </button>
          <!-- Dropdown menu for left -->
          <Transition name="menu-left">
            <div v-show="activeMenu === 'left'" class="family-node__dropdown family-node__dropdown--left">
              <button
                v-for="option in sideMenuOptions"
                :key="option.label"
                @click="selectOption(option, $event)"
                class="family-node__dropdown-item family-node__dropdown-item--pink"
              >
                {{ option.label }}
              </button>
            </div>
          </Transition>
        </div>

        <!-- Side button (right) -->
        <div class="family-node__add-wrapper family-node__add-wrapper--right">
          <button
            @click="toggleMenu('right', $event)"
            class="family-node__add-btn family-node__add-btn--pink"
            :class="{ 'family-node__add-btn--active': activeMenu === 'right' }"
            title="Добавить родственника"
          >
            +
          </button>
          <!-- Dropdown menu for right -->
          <Transition name="menu-right">
            <div v-show="activeMenu === 'right'" class="family-node__dropdown family-node__dropdown--right">
              <button
                v-for="option in sideMenuOptions"
                :key="option.label"
                @click="selectOption(option, $event)"
                class="family-node__dropdown-item family-node__dropdown-item--pink"
              >
                {{ option.label }}
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>

    <div
      class="family-node__content px-4 py-3 rounded-xl border-2 min-w-[160px] text-center cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
      :class="[nodeClasses, borderClasses]"
    >
    <!-- Filled State -->
    <div v-if="data.isFilled" class="family-node__info-wrapper flex flex-col gap-2">
      <!-- Avatar -->
      <div v-if="displayPhoto" class="family-node__avatar-container w-12 h-12 mx-auto rounded-full overflow-hidden border border-white/20">
        <img
          :src="displayPhoto"
          loading="lazy"
          decoding="async"
          class="family-node__avatar-img w-full h-full object-cover"
          alt=""
        />
      </div>
      <div v-else class="family-node__avatar-placeholder w-12 h-12 mx-auto rounded-full bg-gold/10 flex items-center justify-center text-xl text-gold font-serif">
        {{ displayName.charAt(0) }}
      </div>

      <!-- Info -->
      <div class="family-node__details flex flex-col gap-0.5">
        <span class="family-node__role text-[8px] uppercase tracking-widest text-gold font-bold opacity-80">{{ displayRole }}</span>
        <span class="family-node__name text-sm font-serif text-silk font-bold truncate max-w-[140px]">{{ displayName }}</span>
        <span v-if="displayYears" class="family-node__years text-[9px] text-gray-400 font-mono">{{ displayYears }}</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="family-node__empty flex flex-col gap-1 py-2">
      <span class="family-node__empty-label text-[10px] uppercase tracking-widest font-bold">{{ data.label || 'Добавить' }}</span>
      <div class="family-node__empty-action mt-2 text-xs text-gold/60">
        <span class="family-node__empty-btn px-2 py-0.5 rounded-full border border-gold/20">+ добавить</span>
      </div>
    </div>

    <!-- Handles for Vue Flow connections -->
    <Handle type="target" :position="Position.Top" id="top" class="!bg-gold/30 !border-none !w-2 !h-2" />
    <Handle type="source" :position="Position.Bottom" id="bottom" class="!bg-gold/30 !border-none !w-2 !h-2" />
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
.family-node__add-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

/* Base button styles */
.family-node__add-btn {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 20px;
  line-height: 1;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0 1px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  pointer-events: auto;
  cursor: pointer;
  border: none;
  opacity: 1;
  will-change: transform;
}

/* On desktop, animate in on hover */
@media (hover: hover) and (pointer: fine) {
  .family-node__add-btn {
    opacity: 0;
    animation: family-node-pop-in 0.2s ease-out forwards;
  }
}

.family-node__add-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.family-node__add-btn--active {
  ring: 2px solid white;
}

.family-node__add-btn--gold {
  background: #d4af37;
  color: #1a1a1f;
}

.family-node__add-btn--pink {
  background: #f472b6;
  color: white;
}

/* Position buttons centered on edges */
.family-node__add-wrapper--top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0;
}

.family-node__add-wrapper--top .family-node__add-btn {
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0ms;
}

.family-node__add-wrapper--top .family-node__add-btn:hover {
  transform: translateX(-50%) scale(1.15);
}

.family-node__add-wrapper--bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0;
}

.family-node__add-wrapper--bottom .family-node__add-btn {
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 50ms;
}

.family-node__add-wrapper--bottom .family-node__add-btn:hover {
  transform: translateX(-50%) scale(1.15);
}

.family-node__add-wrapper--left {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
}

.family-node__add-wrapper--left .family-node__add-btn {
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  animation: family-node-pop-in-side 0.2s ease-out forwards;
  animation-delay: 100ms;
}

.family-node__add-wrapper--left .family-node__add-btn:hover {
  transform: translateY(-50%) scale(1.15);
}

.family-node__add-wrapper--right {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 0;
}

.family-node__add-wrapper--right .family-node__add-btn {
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  animation: family-node-pop-in-side 0.2s ease-out forwards;
  animation-delay: 150ms;
}

.family-node__add-wrapper--right .family-node__add-btn:hover {
  transform: translateY(-50%) scale(1.15);
}

/* Animations */
@keyframes family-node-pop-in {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.5);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

@keyframes family-node-pop-in-side {
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
.family-node__dropdown {
  position: absolute;
  background: #1a1a1f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  min-width: 100px;
  z-index: 50;
  pointer-events: auto;
}

.family-node__dropdown-item {
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

.family-node__dropdown-item:hover {
  background: rgba(212, 175, 55, 0.2);
}

.family-node__dropdown-item--pink:hover {
  background: rgba(244, 114, 182, 0.2);
}

/* Dropdown positions */
.family-node__dropdown--top {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.family-node__dropdown--bottom {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.family-node__dropdown--left {
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
}

.family-node__dropdown--right {
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

/* Menu transitions - optimized */
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(0.95);
}

.menu-left-enter-active,
.menu-left-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.menu-left-enter-from,
.menu-left-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(-6px) scale(0.95);
}

.menu-right-enter-active,
.menu-right-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.menu-right-enter-from,
.menu-right-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(6px) scale(0.95);
}

.family-node {
  position: relative;
}
</style>
