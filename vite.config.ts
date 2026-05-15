import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    open: true,
    proxy: {
      // Legacy booking fallback: /api/create-appointment, send-appointment-email (Vercel-style)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', () => {
            // Vercel dev not running — edge function or deploy handles booking
          });
        },
      },
    },
  },

  build: {
    outDir: 'dist',

    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'maps';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('i18next')) return 'i18n';
            if (id.includes('react-dom') || id.includes('react-router')) return 'vendor';

       
            return 'vendor';
          }
        },
      },
    },
  },

  optimizeDeps: {
    include: ['leaflet', 'react-leaflet', 'recharts', 'date-fns'],
  },
});