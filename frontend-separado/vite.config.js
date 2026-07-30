import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'url'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

/** Emite dist/version.json en cada build para que el cliente detecte nuevos despliegues */
function deployVersionPlugin() {
  return {
    name: 'deploy-version-json',
    writeBundle(options) {
      const dir = options.dir
      if (!dir) return
      const v = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      const payload = JSON.stringify({
        v,
        builtAt: new Date().toISOString()
      })
      writeFileSync(join(dir, 'version.json'), payload, 'utf8')
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'logo-dark.png'],
      manifest: {
        name: 'FinzBPP',
        short_name: 'FinzBPP',
        description: 'Sistema de gestión de cobranza y administración de rutas para asesores',
        theme_color: '#1e293b',
        background_color: '#1e293b',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        scope: '.',
        icons: [
          { src: '/logo.png', sizes: '192x192', type: 'image/png' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,png,svg,ico}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/sistema-cobranza-backend\.onrender\.com\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
              networkTimeoutSeconds: 5
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts', expiration: { maxAgeSeconds: 86400 * 30 } }
          }
        ]
      }
    }),
    deployVersionPlugin()
  ],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild'
  }
})
