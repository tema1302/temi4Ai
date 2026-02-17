<script setup lang="ts">
import { computed } from 'vue'
import type { DailyStats } from '../api/repository'

const props = defineProps<{
  data: DailyStats[]
  color?: string
  height?: number
  label?: string
}>()

const chartHeight = props.height || 200
const chartColor = props.color || '#d4af37' // gold

const maxVal = computed(() => Math.max(...props.data.map(d => d.count), 1))

// Calculate points for polyline
const points = computed(() => {
  if (props.data.length === 0) return ''
  
  const stepX = 100 / (props.data.length - 1 || 1)
  
  return props.data.map((d, index) => {
    const x = index * stepX
    const y = 100 - (d.count / maxVal.value * 80) // Leave some padding top/bottom
    return `${x},${y}`
  }).join(' ')
})

// Calculate fill path (close the loop at bottom)
const fillPath = computed(() => {
  if (!points.value) return ''
  return `0,100 ${points.value} 100,100`
})
</script>

<template>
  <div class="w-full">
    <div class="flex justify-between items-end mb-4 px-1">
      <h3 class="text-silk font-serif text-lg">{{ label }}</h3>
      <span class="text-xs text-gray-500">Последние 7 дней</span>
    </div>
    
    <div class="relative w-full bg-white/5 rounded-xl overflow-hidden p-4" :style="{ height: chartHeight + 'px' }">
      <!-- Grid Lines -->
      <div class="absolute inset-0 flex flex-col justify-between py-4 px-4 opacity-10 pointer-events-none">
        <div class="w-full h-px bg-white"></div>
        <div class="w-full h-px bg-white"></div>
        <div class="w-full h-px bg-white"></div>
      </div>

      <!-- SVG Chart -->
      <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <!-- Gradient definition -->
        <defs>
          <linearGradient :id="`grad-${label}`" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" :stop-color="chartColor" stop-opacity="0.3" />
            <stop offset="100%" :stop-color="chartColor" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- Area Fill -->
        <polygon :points="fillPath" :fill="`url(#grad-${label})`" />

        <!-- Line -->
        <polyline 
          :points="points" 
          fill="none" 
          :stroke="chartColor" 
          stroke-width="2" 
          stroke-linecap="round"
          stroke-linejoin="round"
          vector-effect="non-scaling-stroke"
        />
        
        <!-- Dots -->
        <circle 
          v-for="(d, i) in data" 
          :key="i"
          :cx="(i * (100 / (data.length - 1 || 1)))" 
          :cy="100 - (d.count / maxVal * 80)" 
          r="1.5" 
          :fill="chartColor"
          vector-effect="non-scaling-stroke"
          class="hover:r-2 transition-all"
        />
      </svg>
    </div>

    <!-- X Axis Labels -->
    <div class="flex justify-between mt-2 px-1">
      <span 
        v-for="(d, i) in data" 
        :key="i" 
        class="text-[10px] text-gray-500"
      >
        {{ new Date(d.date).getDate() }}
      </span>
    </div>
  </div>
</template>
