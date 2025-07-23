import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/parse-intent': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/parse-intent', '/parse-intent')
      },
      '/api/generate-plan': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/generate-plan', '/generate-plan')
      },
      '/api/execute-plan': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/execute-plan', '/execute-plan')
      },
      '/api/missions': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/missions', '/missions')
      }
    }
  }
})
