import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Use relative asset paths so the app works on GitHub Pages project URLs
  // and continues to work after attaching a custom domain.
  base: './',
  plugins: [react()],
})
