<template>
  <div class="min-h-screen w-full max-w-full overflow-x-clip bg-neutral-100 dark:bg-slate-900 transition-theme">
    <NavbarAdmin v-if="esAdmin" @logout="logout" />
    <NavbarVendedor v-else :rutaAbierta="true" :cargandoRuta="false" tituloSeccion="Notas del Día" @logout="logout" />
    <div class="p-4 md:p-6 max-w-4xl mx-auto pt-20 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-slate-100">Notas del Día</h1>
        <button
          class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          @click="abrirCrear"
        >+ Nueva nota</button>
      </div>

      <div v-if="cargando" class="text-center py-12 text-neutral-500 dark:text-slate-400">Cargando notas…</div>
      <div v-else-if="error" class="text-center py-12 text-red-600">{{ error }}</div>
      <div v-else-if="notas.length === 0" class="text-center py-12 text-neutral-500 dark:text-slate-400 border-2 border-dashed border-neutral-300 dark:border-slate-600 rounded-xl">
        No hay notas del día. Crea una nueva.
      </div>
      <div v-else class="space-y-4">
        <div v-for="n in notas" :key="n._id" class="bg-white dark:bg-slate-800 rounded-xl border border-neutral-200 dark:border-slate-700 shadow-sm p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-neutral-900 dark:text-slate-100 text-base">{{ n.titulo }}</h3>
              <p v-if="n.descripcion" class="text-sm text-neutral-600 dark:text-slate-400 mt-1.5 whitespace-pre-wrap">{{ n.descripcion }}</p>
              <div class="flex flex-wrap gap-3 mt-3 text-xs text-neutral-500 dark:text-slate-500">
                <span>👤 {{ n.vendedor?.nombre || n.vendedor?.usuario || '—' }}</span>
                <span v-if="n.cliente">📋 {{ n.cliente?.nombres || '' }} {{ n.cliente?.apellidos || '' }} {{ n.cliente?.apodo ? '('+n.cliente.apodo+')' : '' }}</span>
                <span>📅 {{ formatFecha(n.fecha || n.createdAt) }}</span>
                <span v-if="n.creadoPor === 'admin' && n.creadoPorAdmin" class="text-amber-600 dark:text-amber-400">por {{ n.creadoPorAdmin.nombre || n.creadoPorAdmin.usuario }}</span>
              </div>
            </div>
            <div class="flex gap-1.5 shrink-0">
              <button
                class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:hover:bg-amber-900/60 transition-colors"
                @click="abrirEditar(n)"
              >Editar</button>
              <button
                class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60 transition-colors"
                @click="abrirEliminar(n)"
              >Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal crear/editar -->
    <Teleport to="body">
      <div v-if="modalNota" class="fixed inset-0 z-[200] flex items-center justify-center p-4" @click.self="cerrarModal">
        <div class="absolute inset-0 bg-black/50" @click="cerrarModal"></div>
        <div class="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-neutral-200 dark:border-slate-700 p-6 w-full max-w-lg space-y-4">
          <h2 class="text-lg font-bold text-neutral-800 dark:text-slate-100">{{ editando ? 'Editar nota' : 'Nueva nota' }}</h2>

          <template v-if="esAdmin">
            <label class="flex flex-col gap-1 text-sm">
              <span class="font-semibold text-neutral-700 dark:text-slate-300">Vendedor</span>
              <select v-model="form.vendedorId" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-sm" @change="onVendedorChange">
                <option value="" disabled>Seleccionar vendedor</option>
                <option v-for="v in vendedores" :key="v._id" :value="v._id">{{ v.nombre || v.usuario }}</option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-sm">
              <span class="font-semibold text-neutral-700 dark:text-slate-300">Cliente <span class="font-normal text-neutral-500">(opcional)</span></span>
              <select v-model="form.clienteId" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-sm">
                <option value="">Sin cliente</option>
                <option v-for="c in clientesDelVendedor" :key="c._id" :value="c._id">{{ c.nombres }} {{ c.apellidos }}{{ c.apodo ? ' ('+c.apodo+')' : '' }}</option>
              </select>
            </label>
          </template>
          <template v-else>
            <label class="flex flex-col gap-1 text-sm">
              <span class="font-semibold text-neutral-700 dark:text-slate-300">Cliente <span class="font-normal text-neutral-500">(opcional)</span></span>
              <select v-model="form.clienteId" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-sm">
                <option value="">Sin cliente</option>
                <option v-for="c in clientesDelVendedor" :key="c._id" :value="c._id">{{ c.nombres }} {{ c.apellidos }}{{ c.apodo ? ' ('+c.apodo+')' : '' }}</option>
              </select>
            </label>
          </template>

          <label class="flex flex-col gap-1 text-sm">
            <span class="font-semibold text-neutral-700 dark:text-slate-300">Título</span>
            <input v-model="form.titulo" type="text" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-sm" />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-semibold text-neutral-700 dark:text-slate-300">Descripción</span>
            <textarea v-model="form.descripcion" rows="3" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-sm resize-none"></textarea>
          </label>

          <div class="flex gap-2 justify-end pt-2">
            <button class="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-slate-700 text-neutral-700 dark:text-slate-200 text-sm" @click="cerrarModal">Cancelar</button>
            <button
              class="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
              :class="editando ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'"
              :disabled="guardando"
              @click="guardar"
            >{{ guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear nota' }}</button>
          </div>
          <p v-if="mensaje" class="text-sm" :class="mensajeOk ? 'text-green-600' : 'text-red-600'">{{ mensaje }}</p>
        </div>
      </div>
    </Teleport>

    <!-- Modal eliminar -->
    <Teleport to="body">
      <div v-if="modalEliminar" class="fixed inset-0 z-[200] flex items-center justify-center p-4" @click.self="modalEliminar = false">
        <div class="absolute inset-0 bg-black/50" @click="modalEliminar = false"></div>
        <div class="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-neutral-200 dark:border-slate-700 p-6 w-full max-w-md space-y-4">
          <h2 class="text-lg font-bold text-red-700 dark:text-red-400">Eliminar nota</h2>
          <p class="text-sm text-neutral-700 dark:text-slate-300">¿Eliminar la nota <strong>{{ notaEliminar?.titulo }}</strong>?</p>
          <div class="flex gap-2 justify-end pt-2">
            <button class="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-slate-700 text-neutral-700 dark:text-slate-200 text-sm" @click="modalEliminar = false">Cancelar</button>
            <button class="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium disabled:opacity-50" :disabled="eliminando" @click="confirmarEliminar">{{ eliminando ? 'Eliminando…' : 'Eliminar' }}</button>
          </div>
          <p v-if="mensajeEliminar" class="text-sm" :class="mensajeEliminarOk ? 'text-green-600' : 'text-red-600'">{{ mensajeEliminar }}</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavbarAdmin from '../components/NavbarAdmin.vue'
import NavbarVendedor from '../components/NavbarVendedor.vue'
import API_BASE_URL from '../config/api.js'

const router = useRouter()
const esAdmin = computed(() => localStorage.getItem('rol') === 'administrador' || localStorage.getItem('rol') === 'superusuario')

const notas = ref([])
const cargando = ref(true)
const error = ref('')

const vendedores = ref([])
const clientesDelVendedor = ref([])

const modalNota = ref(false)
const editando = ref(false)
const notaEditandoId = ref(null)
const guardando = ref(false)
const mensaje = ref('')
const mensajeOk = ref(false)

const modalEliminar = ref(false)
const eliminando = ref(false)
const mensajeEliminar = ref('')
const mensajeEliminarOk = ref(false)
const notaEliminar = ref(null)

const form = ref({ titulo: '', descripcion: '', vendedorId: '', clienteId: '' })

async function cargarNotas() {
  cargando.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('sessionToken')
    let url = `${API_BASE_URL}/api/notas-dia`
    if (esAdmin.value) {
      const cod = localStorage.getItem('codigoVinculacion')
      if (!cod) { error.value = 'Código de vinculación no encontrado'; cargando.value = false; return }
      url += `?codigoVinculacion=${encodeURIComponent(cod)}`
    }
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error al cargar notas')
    notas.value = data.notas || []
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

async function cargarVendedores() {
  const cod = localStorage.getItem('codigoVinculacion')
  if (!cod) return
  const token = localStorage.getItem('sessionToken')
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/vendedores?codigoVinculacion=${encodeURIComponent(cod)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) vendedores.value = await res.json()
  } catch (_) {}
}

async function cargarClientesVendedor(vendedorId) {
  if (!vendedorId) { clientesDelVendedor.value = []; return }
  const token = localStorage.getItem('sessionToken')
  try {
    const res = await fetch(`${API_BASE_URL}/api/clientes/vendedor/${vendedorId}?_t=${Date.now()}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    clientesDelVendedor.value = res.ok ? await res.json() : []
  } catch (_) {
    clientesDelVendedor.value = []
  }
}

function onVendedorChange() {
  form.value.clienteId = ''
  clientesDelVendedor.value = []
  if (form.value.vendedorId) cargarClientesVendedor(form.value.vendedorId)
}

function abrirCrear() {
  editando.value = false
  notaEditandoId.value = null
  form.value = { titulo: '', descripcion: '', vendedorId: '', clienteId: '' }
  mensaje.value = ''
  if (esAdmin.value) {
    cargarVendedores().then(() => {
      if (vendedores.value.length > 0) {
        form.value.vendedorId = vendedores.value[0]._id
        cargarClientesVendedor(form.value.vendedorId)
      }
    })
  } else {
    const vId = localStorage.getItem('vendedorId')
    if (vId) cargarClientesVendedor(vId)
  }
  modalNota.value = true
}

function abrirEditar(n) {
  editando.value = true
  notaEditandoId.value = n._id
  form.value = {
    titulo: n.titulo || '',
    descripcion: n.descripcion || '',
    vendedorId: n.vendedor?._id || '',
    clienteId: n.cliente?._id || ''
  }
  mensaje.value = ''
  if (esAdmin.value) {
    cargarVendedores().then(() => {
      if (form.value.vendedorId) cargarClientesVendedor(form.value.vendedorId)
    })
  } else {
    const vId = localStorage.getItem('vendedorId')
    if (vId) cargarClientesVendedor(vId)
  }
  modalNota.value = true
}

function cerrarModal() {
  modalNota.value = false
  mensaje.value = ''
}

async function guardar() {
  if (!form.value.titulo.trim()) {
    mensaje.value = 'El título es obligatorio'
    mensajeOk.value = false
    return
  }
  if (esAdmin.value && !form.value.vendedorId) {
    mensaje.value = 'Selecciona un vendedor'
    mensajeOk.value = false
    return
  }
  guardando.value = true
  mensaje.value = ''
  try {
    const token = localStorage.getItem('sessionToken')
    const body = {
      titulo: form.value.titulo.trim(),
      descripcion: form.value.descripcion.trim(),
      clienteId: form.value.clienteId || null
    }
    if (esAdmin.value) {
      body.vendedorId = form.value.vendedorId
      body.codigoVinculacion = localStorage.getItem('codigoVinculacion')
    }
    if (editando.value) {
      const res = await fetch(`${API_BASE_URL}/api/notas-dia/${notaEditandoId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al actualizar')
      mensaje.value = 'Nota actualizada'
      mensajeOk.value = true
      modalNota.value = false
      await cargarNotas()
    } else {
      const res = await fetch(`${API_BASE_URL}/api/notas-dia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear')
      mensaje.value = 'Nota creada'
      mensajeOk.value = true
      modalNota.value = false
      await cargarNotas()
    }
  } catch (e) {
    mensaje.value = e.message
    mensajeOk.value = false
  } finally {
    guardando.value = false
  }
}

function abrirEliminar(n) {
  notaEliminar.value = n
  mensajeEliminar.value = ''
  mensajeEliminarOk.value = false
  modalEliminar.value = true
}

async function confirmarEliminar() {
  if (!notaEliminar.value) return
  eliminando.value = true
  mensajeEliminar.value = ''
  try {
    const token = localStorage.getItem('sessionToken')
    let url = `${API_BASE_URL}/api/notas-dia/${notaEliminar.value._id}`
    if (esAdmin.value) {
      const cod = localStorage.getItem('codigoVinculacion')
      url += `?codigoVinculacion=${encodeURIComponent(cod)}`
    }
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error al eliminar')
    mensajeEliminar.value = 'Nota eliminada'
    mensajeEliminarOk.value = true
    modalEliminar.value = false
    await cargarNotas()
  } catch (e) {
    mensajeEliminar.value = e.message
    mensajeEliminarOk.value = false
  } finally {
    eliminando.value = false
  }
}

function formatFecha(f) {
  if (!f) return ''
  return new Date(f).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}

function logout() {
  localStorage.clear()
  window.location.hash = '#/'
  window.location.reload()
}

onMounted(cargarNotas)
</script>
