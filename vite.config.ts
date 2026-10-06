import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dynamicImport from 'vite-plugin-dynamic-import'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    babel: {
      plugins: [
        'babel-plugin-macros'
      ]
    }
  }),
  dynamicImport()],
  assetsInclude: ['**/*.md'],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Chunking mínimo y conservador: solo aislamos librerías grandes que
        // YA se cargan en el arranque (firebase, react/redux). Al tener su
        // propio chunk con hash estable, un deploy que solo cambia código de
        // la app NO obliga a re-descargarlas (quedan en caché del navegador).
        // El resto lo maneja Vite/Rollup con su splitting por ruta (lazy),
        // que ya funcionaba bien, para no volver eager nada que sea perezoso.
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }
          if (id.includes('/firebase/') || id.includes('/@firebase/')) {
            return 'vendor-firebase'
          }
          if (
            id.includes('/react-dom/') ||
            id.includes('/react-router') ||
            id.includes('/react-redux/') ||
            id.includes('/@reduxjs/') ||
            id.includes('/redux-persist/')
          ) {
            return 'vendor-react'
          }
          return undefined
        },
      },
    },
  },
});
