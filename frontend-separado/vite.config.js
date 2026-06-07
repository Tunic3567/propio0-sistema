import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
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
  plugins: [vue(), deployVersionPlugin()],
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
