import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/temi4Ai/', 
    plugins: [
      VueDevTools(),
      vue()
    ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'editor': [
            './src/pages/EditorDashboard.vue',
            './src/components/editor/EditorPreview.vue',
            './src/components/editor/EditorSidebar.vue'
          ],
          'auth': [
            './src/pages/AuthPage.vue',
            './src/components/auth/AuthForm.vue'
          ],
          'viewer': [
            './src/pages/MemoryViewer.vue',
            './src/components/viewer/HeroSection.vue',
            './src/components/viewer/BentoGrid.vue',
            './src/components/viewer/TimelineSection.vue'
          ],
          'tree': [
            '@vue-flow/core',
            '@vue-flow/background',
            '@vue-flow/controls',
            'dagre'
          ]
        }
      }
    }
  },
  optimizeDeps: {
    include: ['vue-gtag-next']
  }
})
