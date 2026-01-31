import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/temi4Ai/', 
    plugins: [vue()],
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
          ]
        }
      }
    }
  }
})
