<template>
  <div class="flex items-center gap-2 select-none">
    <!-- Icon -->
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      class="text-gold"
    >
      <path 
        d="M8 6C8 6 11 4 16 4C21 4 24 6 24 6V26C24 26 21 24 16 24C11 24 8 26 8 26V6Z" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path 
        d="M16 6V24" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        class="opacity-50"
      />
      <!-- Leaf element suggesting growth/family tree -->
      <path 
        d="M16 14C16 14 19 12 21 13C23 14 23 16 22 17" 
        stroke="currentColor" 
        stroke-width="1.5" 
        stroke-linecap="round"
        class="text-white"
      />
    </svg>
    
    <!-- Text -->
    <div class="flex flex-col leading-tight">
      <span class="text-xl font-serif font-bold text-silk tracking-wide">
        Fam<span class="text-gold">Story</span>
      </span>
      <span class="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium">
        История семьи
      </span>
    </div>
  </div>
</template>
