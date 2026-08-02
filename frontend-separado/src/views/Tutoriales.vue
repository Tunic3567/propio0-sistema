<template>
  <div class="min-h-screen w-full max-w-full overflow-x-clip bg-neutral-100 dark:bg-slate-900 transition-theme">
    <NavbarAdmin @logout="logout" />
    <div class="p-4 md:p-6 max-w-5xl mx-auto pt-20 space-y-6">
      <div class="rounded-xl border-2 border-blue-500/80 bg-blue-100/90 dark:bg-blue-950/40 dark:border-blue-600 p-4 text-blue-950 dark:text-blue-100">
        <h1 class="text-lg font-bold">Tutoriales</h1>
        <p class="text-sm mt-2 leading-relaxed">
          Crea tarjetas plegables con una pregunta y bloques de texto o im&aacute;genes en orden.
          As&iacute; puedes construir gu&iacute;as organizadas y profesionales para los usuarios.
        </p>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <button type="button" @click="cargar"
            class="px-4 py-2 rounded-lg border border-neutral-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-neutral-700 dark:text-slate-200 text-sm font-semibold hover:bg-neutral-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Recargar
          </button>
          <button type="button" @click="cargarEjemplos" :disabled="sembrando"
            class="px-4 py-2 rounded-lg border border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-semibold hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg v-if="sembrando" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {{ sembrando ? 'Cargando...' : 'Cargar tarjetas de ejemplo' }}
          </button>
        </div>
        <button type="button" @click="nuevaTarjeta"
          class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          Nueva tarjeta
        </button>
      </div>

      <div v-if="cargando" class="text-center py-10 text-neutral-500 dark:text-slate-400">Cargando tutoriales...</div>

      <div v-else-if="error" class="rounded-xl border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 p-4 text-red-800 dark:text-red-200 text-sm">
        {{ error }}
      </div>

      <div v-else-if="tutoriales.length === 0" class="rounded-xl border-2 border-dashed border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-10 text-center text-neutral-500 dark:text-slate-400">
        Todav&iacute;a no hay tutoriales. Haz clic en "Nueva tarjeta" para comenzar.
      </div>

      <div class="space-y-3">
        <div v-for="(t, idx) in tutoriales" :key="t._id"
          class="rounded-xl border-2 bg-white dark:bg-slate-800 shadow-sm overflow-hidden"
          :class="editandoId === t._id ? 'border-blue-500 dark:border-blue-600' : 'border-neutral-300 dark:border-slate-600'">
          <!-- Encabezado / tarjeta plegable -->
          <div class="flex items-center gap-2 p-3 md:p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-slate-800/80 transition-colors" @click="toggle(t._id)">
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-neutral-900 dark:text-slate-100 leading-snug">{{ t.pregunta }}</h3>
              <p class="text-xs text-neutral-500 dark:text-slate-400 mt-0.5">
                {{ (t.bloques || []).length }} bloque(s)
              </p>
            </div>
            <div v-if="t._id !== 'nuevo'" class="flex items-center gap-1 shrink-0" @click.stop>
              <button type="button" title="Subir" :disabled="idx === 0" @click="moverTarjeta(t._id, -1)"
                class="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-slate-600 text-neutral-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
              </button>
              <button type="button" title="Bajar" :disabled="idx === tutoriales.length - 1" @click="moverTarjeta(t._id, 1)"
                class="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-slate-600 text-neutral-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <button type="button" title="Editar" @click="editarTarjeta(t)"
                class="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button type="button" title="Eliminar" @click="eliminarTarjeta(t)"
                class="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
              <svg class="w-5 h-5 text-neutral-400 dark:text-slate-400 transition-transform duration-200 shrink-0" :class="{ 'rotate-180': abierta(t._id) }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <!-- Contenido de la tarjeta -->
          <div v-if="abierta(t._id)" class="border-t border-neutral-200 dark:border-slate-700 p-3 md:p-4 space-y-4">
            <!-- Modo vista -->
            <div v-if="editandoId !== t._id" class="space-y-3">
              <div v-for="b in t.bloques" :key="b._id || b.orden + '-' + (b.contenido || '').slice(0, 10)" class="space-y-1">
                <p v-if="b.tipo === 'texto'" class="text-sm text-neutral-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{{ b.contenido }}</p>
                <img v-else-if="b.tipo === 'imagen' && b.contenido" :src="b.contenido" alt="Imagen del tutorial"
                  class="max-w-full rounded-lg border border-neutral-200 dark:border-slate-600 max-h-96 object-contain" />
              </div>
            </div>

            <!-- Modo edición -->
            <div v-else class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-neutral-600 dark:text-slate-400 mb-1">Pregunta</label>
                <textarea v-model="borrador.pregunta" rows="2"
                  class="w-full px-3 py-2 rounded-lg border-2 border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm" />
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="text-xs font-semibold text-neutral-600 dark:text-slate-400">Bloques</label>
                  <div class="flex gap-2">
                    <button type="button" @click="agregarBloque('texto')"
                      class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-neutral-400 dark:border-slate-600 bg-neutral-100 dark:bg-slate-700 text-neutral-700 dark:text-slate-200 hover:bg-neutral-200 dark:hover:bg-slate-600 transition-colors">
                      + Texto
                    </button>
                    <button type="button" @click="agregarBloque('imagen')"
                      class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                      + Imagen
                    </button>
                  </div>
                </div>

                <div v-if="borrador.bloques.length === 0" class="text-sm text-neutral-400 dark:text-slate-500 text-center py-6 border-2 border-dashed border-neutral-300 dark:border-slate-600 rounded-lg">
                  A&ntilde;ade bloques de texto o imagen
                </div>

                <div v-else class="space-y-2">
                  <div v-for="(b, i) in borrador.bloques" :key="i"
                    class="rounded-lg border-2 p-3"
                    :class="b.tipo === 'imagen' ? 'border-blue-300 dark:border-blue-600' : 'border-neutral-300 dark:border-slate-600'">
                    <div class="flex items-center justify-between gap-2 mb-2">
                      <span class="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded"
                        :class="b.tipo === 'imagen' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200' : 'bg-neutral-200 dark:bg-slate-700 text-neutral-700 dark:text-slate-200'">
                        {{ b.tipo === 'imagen' ? 'Imagen' : 'Texto' }}
                      </span>
                      <div class="flex items-center gap-1">
                        <button type="button" :disabled="i === 0" @click="moverBloque(i, -1)"
                          class="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-slate-600 text-neutral-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                        </button>
                        <button type="button" :disabled="i === borrador.bloques.length - 1" @click="moverBloque(i, 1)"
                          class="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-slate-600 text-neutral-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        <button type="button" @click="eliminarBloque(i)"
                          class="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 transition-colors">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>

                    <div v-if="b.tipo === 'texto'">
                      <textarea v-model="b.contenido" rows="3" placeholder="Escribe el contenido del bloque..."
                        class="w-full px-3 py-2 rounded-lg border-2 border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-sm" />
                    </div>

                    <div v-else class="space-y-2">
                      <div class="flex flex-wrap gap-2">
                        <label class="px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors inline-flex items-center gap-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Subir imagen
                          <input type="file" accept="image/*" class="hidden" @change="subirImagen($event, b)" />
                        </label>
                        <span class="text-xs text-neutral-400 dark:text-slate-500 self-center">o pega una URL:</span>
                        <input v-model="b.contenido" type="text" placeholder="https://ejemplo.com/imagen.png"
                          class="flex-1 min-w-40 px-3 py-2 rounded-lg border-2 border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 text-sm" />
                      </div>
                      <img v-if="b.contenido" :src="b.contenido" alt="Vista previa"
                        class="max-w-full max-h-64 rounded-lg border border-neutral-200 dark:border-slate-600 object-contain" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap gap-3 pt-2">
                <button type="button" @click="guardarTarjeta(t)" :disabled="guardando"
                  class="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold transition-colors flex items-center gap-2">
                  <svg v-if="guardando" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                  {{ guardando ? 'Guardando...' : 'Guardar' }}
                </button>
                <button type="button" @click="cancelarEdicion"
                  class="px-5 py-2 rounded-lg border border-neutral-400 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-700 dark:text-slate-200 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-slate-600 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavbarAdmin from '../components/NavbarAdmin.vue'
import API_BASE_URL from '../config/api.js'

const tutoriales = ref([])
const cargando = ref(false)
const error = ref('')
const abiertasIds = ref(new Set())
const editandoId = ref(null)
const guardando = ref(false)
const sembrando = ref(false)
const borrador = ref({ pregunta: '', bloques: [] })

onMounted(cargar)

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('sessionToken')}` }
}

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const res = await fetch(`${API_BASE_URL}/api/tutoriales`, { headers: authHeaders(), cache: 'no-store' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Error al cargar tutoriales')
    tutoriales.value = data.tutoriales || []
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

function abierta(id) {
  return abiertasIds.value.has(id)
}

async function cargarEjemplos() {
  if (!confirm('¿Cargar las tarjetas de ejemplo para vendedores? Se agregarán las que falten y se actualizarán las que ya existan.')) return
  sembrando.value = true
  error.value = ''
  try {
    const res = await fetch(`${API_BASE_URL}/api/tutoriales/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({})
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Error al cargar las tarjetas')
    alert(`Listo: ${data.nuevas || 0} nueva(s), ${data.actualizadas || 0} actualizada(s).`)
    await cargar()
  } catch (e) {
    alert(e.message)
  } finally {
    sembrando.value = false
  }
}

function toggle(id) {
  const set = new Set(abiertasIds.value)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  abiertasIds.value = set
}

function nuevaTarjeta() {
  if (editandoId.value === 'nuevo') return
  borrador.value = { pregunta: '', bloques: [] }
  editandoId.value = 'nuevo'
  abiertasIds.value = new Set([...abiertasIds.value, 'nuevo'])
  tutoriales.value = [{ _id: 'nuevo', pregunta: 'Nueva tarjeta', bloques: [] }, ...tutoriales.value]
}

function editarTarjeta(t) {
  borrador.value = {
    pregunta: t.pregunta,
    bloques: (t.bloques || []).map(b => ({ tipo: b.tipo, contenido: b.contenido || '' }))
  }
  editandoId.value = t._id
  abiertasIds.value = new Set([...abiertasIds.value, t._id])
}

function cancelarEdicion() {
  editandoId.value = null
  borrador.value = { pregunta: '', bloques: [] }
  const set = new Set(abiertasIds.value)
  set.delete('nuevo')
  abiertasIds.value = set
  tutoriales.value = tutoriales.value.filter(t => t._id !== 'nuevo')
}

async function guardarTarjeta(t) {
  if (!borrador.value.pregunta.trim()) {
    alert('Escribe una pregunta para la tarjeta')
    return
  }
  guardando.value = true
  try {
    const esNueva = editandoId.value === 'nuevo'
    const payload = {
      pregunta: borrador.value.pregunta.trim(),
      bloques: borrador.value.bloques.map((b, i) => ({ tipo: b.tipo, contenido: b.contenido, orden: i }))
    }
    const url = esNueva
      ? `${API_BASE_URL}/api/tutoriales`
      : `${API_BASE_URL}/api/tutoriales/${t._id}`
    const res = await fetch(url, {
      method: esNueva ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Error al guardar')
    editandoId.value = null
    borrador.value = { pregunta: '', bloques: [] }
    const set = new Set(abiertasIds.value)
    set.delete('nuevo')
    abiertasIds.value = set
    await cargar()
  } catch (e) {
    alert(e.message)
  } finally {
    guardando.value = false
  }
}

async function eliminarTarjeta(t) {
  if (!confirm(`¿Eliminar la tarjeta "${t.pregunta}"?`)) return
  try {
    const res = await fetch(`${API_BASE_URL}/api/tutoriales/${t._id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Error al eliminar')
    const set = new Set(abiertasIds.value)
    set.delete(t._id)
    abiertasIds.value = set
    await cargar()
  } catch (e) {
    alert(e.message)
  }
}

async function moverTarjeta(id, dir) {
  const idx = tutoriales.value.findIndex(t => t._id === id)
  const newIdx = idx + dir
  if (idx < 0 || newIdx < 0 || newIdx >= tutoriales.value.length) return
  const nuevo = [...tutoriales.value]
  const [item] = nuevo.splice(idx, 1)
  nuevo.splice(newIdx, 0, item)
  tutoriales.value = nuevo
  try {
    await fetch(`${API_BASE_URL}/api/tutoriales/reordenar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ orden: nuevo.map(t => t._id) })
    })
  } catch (e) {
    console.error('Error reordenando:', e)
  }
}

function agregarBloque(tipo) {
  borrador.value.bloques.push({ tipo, contenido: '' })
}

function moverBloque(i, dir) {
  const j = i + dir
  if (j < 0 || j >= borrador.value.bloques.length) return
  const bloques = [...borrador.value.bloques]
  const [item] = bloques.splice(i, 1)
  bloques.splice(j, 0, item)
  borrador.value.bloques = bloques
}

function eliminarBloque(i) {
  borrador.value.bloques.splice(i, 1)
}

function subirImagen(event, bloque) {
  const file = event.target.files && event.target.files[0]
  if (!file) return
  const maxSize = 4 * 1024 * 1024
  if (file.size > maxSize) {
    alert('La imagen es muy grande (máx. 4 MB). Usa una imagen más pequeña.')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    bloque.contenido = reader.result
  }
  reader.onerror = () => alert('No se pudo leer la imagen')
  reader.readAsDataURL(file)
}

function logout() {
  localStorage.clear()
  window.location.href = '/'
}
</script>
