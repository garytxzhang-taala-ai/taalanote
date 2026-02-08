import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/volcengine-proxy': {
        target: 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
        changeOrigin: true,
        rewrite: (path) => ''
      }
    }
  }
})