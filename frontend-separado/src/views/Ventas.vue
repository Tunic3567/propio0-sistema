<template>
  <div class="min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-neutral-100 dark:bg-slate-900 transition-theme">
    <NavbarVendedor :rutaAbierta="rutaAbierta" :cargandoRuta="cargandoRuta" :tituloSeccion="$t('nav.sales')" @logout="logout" @cerrar-ruta="cerrarRuta" />
    <div class="p-4 max-w-2xl mx-auto">
      <!-- Aviso cuando la ruta está cerrada -->
      <div v-if="!rutaAbierta && !cargandoRuta" class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center mb-6 transition-colors duration-300">
        <p class="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">{{ $t('route.closed') }}</p>
        <p class="text-yellow-700 dark:text-yellow-300 mb-4">{{ $t('common.mustOpenRoute') }}</p>
        <button @click="abrirRuta" class="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 transition-colors">{{ $t('route.open') }}</button>
      </div>

      <template v-if="rutaAbierta || cargandoRuta">
        <!-- Acción: Crear cliente (venta = cliente creado en esta ruta) -->
        <div class="mb-6">
          <router-link
            to="/crear-cliente"
            class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl shadow transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ $t('sales.createClient') }}
          </router-link>
        </div>

        <!-- Lista de clientes (ventas) de la ruta actual -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-neutral-300 dark:border-slate-600 p-6 transition-theme">
          <h2 class="text-lg font-bold mb-4 text-neutral-900 dark:text-slate-100">{{ $t('sales.clientsInRoute') }}</h2>
          <p class="text-sm text-neutral-600 dark:text-slate-400 mb-4">{{ $t('sales.onlyCurrentRoute') }}</p>
          <div v-if="!loading && clientes.length === 0" class="text-center text-neutral-500 dark:text-slate-400 py-8">{{ $t('sales.noClientsInRoute') }}</div>
          <div v-else-if="clientes.length > 0" class="space-y-3">
            <div
              v-for="c in clientes"
              :key="c._id"
              class="border-2 border-neutral-200 dark:border-slate-600 rounded-lg p-4 bg-neutral-50 dark:bg-slate-700/50 transition-theme"
            >
              <div class="flex flex-wrap items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <p class="font-bold text-neutral-900 dark:text-slate-100">{{ c.nombres }} {{ c.apellidos }}</p>
                  <p class="text-sm text-neutral-600 dark:text-slate-300">{{ $t('client.id') }}: {{ c.cc }}</p>
                  <p v-if="c.apodo" class="text-sm text-neutral-500 dark:text-slate-400">{{ $t('client.nickname') }}: {{ c.apodo }}</p>
                  <p class="text-sm text-neutral-600 dark:text-slate-300">{{ $t('client.phone') }}: {{ c.celular }}</p>
                  <p class="text-sm font-medium text-green-600 dark:text-green-400">${{ Number(c.valor || 0).toFixed(2) }} · {{ $t('client.value') }}</p>
                  <p class="text-xs text-neutral-500 dark:text-slate-400 mt-1">{{ $t('payment.date') }}: {{ formatFecha(c.createdAt) }}</p>
                </div>
                <div class="flex gap-2 shrink-0">
                  <button
                    type="button"
                    @click="abrirEditar(c)"
                    class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium"
                  >
                    {{ $t('common.edit') }}
                  </button>
                  <button
                    type="button"
                    @click="solicitarEliminar(c)"
                    class="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium"
                  >
                    {{ $t('common.delete') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal editar cliente (solo datos editables en ruta actual) -->
        <Teleport to="body">
          <div v-if="modal.visible" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" @click.self="cerrarModal">
            <div class="bg-white dark:bg-gray-800 border-2 border-neutral-200 dark:border-slate-600 rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 class="text-lg font-bold mb-4 text-neutral-900 dark:text-slate-100">{{ $t('sales.editClient') }}</h3>
              <form @submit.prevent="guardarEdicion" class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.name') }}</label>
                  <input v-model="modal.nombres" type="text" class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-neutral-900 dark:text-slate-100" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.lastname') }}</label>
                  <input v-model="modal.apellidos" type="text" class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-neutral-900 dark:text-slate-100" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.id') }}</label>
                  <input v-model="modal.cc" type="text" class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-neutral-900 dark:text-slate-100" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.nickname') }}</label>
                  <input v-model="modal.apodo" type="text" class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-neutral-900 dark:text-slate-100" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.phone') }}</label>
                  <input v-model="modal.celular" type="tel" class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-neutral-900 dark:text-slate-100" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.commercialAddress') }}</label>
                  <input v-model="modal.direccion" type="text" class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-neutral-900 dark:text-slate-100" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.residentialAddress') }}</label>
                  <input v-model="modal.direccion_residencial" type="text" class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-neutral-900 dark:text-slate-100" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.value') }}</label>
                  <input v-model.number="modal.valor" type="number" min="0" step="0.01" class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-neutral-900 dark:text-slate-100" required @wheel="e => e.target.blur()" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('payment.installmentCount') }}</label>
                  <select v-model.number="modal.parcelas" class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-neutral-900 dark:text-slate-100" required>
                    <option value="">{{ $t('common.select') || 'Seleccione' }}</option>
                    <option v-for="n in 99" :key="n" :value="n">{{ n }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.paymentFrequency') || 'Frecuencia de Pago' }}</label>
                  <select v-model="modal.frecuencia" class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-neutral-900 dark:text-slate-100" required>
                    <option value="">{{ $t('client.selectFrequency') || 'Seleccione frecuencia' }}</option>
                    <option value="diaria">{{ $t('client.daily') || 'Diaria' }}</option>
                    <option value="semanal">{{ $t('client.weekly') || 'Semanal' }}</option>
                    <option value="quincenal">{{ $t('client.biweekly') || 'Quincenal' }}</option>
                    <option value="mensual">{{ $t('client.monthly') || 'Mensual' }}</option>
                  </select>
                </div>
                <div v-if="modal.frecuencia && modal.frecuencia !== 'diaria'">
                  <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.paymentDay') || 'Día de pago' }}</label>
                  <select v-model="modal.diaPago" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-neutral-900 dark:text-slate-100">
                    <option value="">{{ $t('client.selectPaymentDay') || 'Seleccione día' }}</option>
                    <option value="lunes">{{ $t('client.monday') || 'Lunes' }}</option>
                    <option value="martes">{{ $t('client.tuesday') || 'Martes' }}</option>
                    <option value="miércoles">{{ $t('client.wednesday') || 'Miércoles' }}</option>
                    <option value="jueves">{{ $t('client.thursday') || 'Jueves' }}</option>
                    <option value="viernes">{{ $t('client.friday') || 'Viernes' }}</option>
                    <option value="sábado">{{ $t('client.saturday') || 'Sábado' }}</option>
                    <option value="domingo">{{ $t('client.sunday') || 'Domingo' }}</option>
                  </select>
                </div>
                <!-- Información calculada -->
                <div v-if="totalAPagar" class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-neutral-700 dark:text-slate-300">Interés aplicado:</span>
                    <span class="text-sm font-bold text-neutral-900 dark:text-slate-100">{{ interesAplicado }}%</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-neutral-700 dark:text-slate-300">Total a pagar:</span>
                    <span class="text-sm font-bold text-green-600 dark:text-green-400">${{ totalAPagar }}</span>
                  </div>
                  <div v-if="valorParcela" class="flex items-center justify-between">
                    <span class="text-sm font-medium text-neutral-700 dark:text-slate-300">{{ $t('client.installmentValue') }}:</span>
                    <span class="text-sm font-bold text-blue-600 dark:text-blue-400">${{ valorParcela }}</span>
                  </div>
                </div>
                <div class="flex justify-end gap-2 pt-2 flex-wrap">
                  <button type="button" @click="cerrarModal" class="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-slate-600 text-neutral-800 dark:text-slate-200 hover:bg-neutral-300 dark:hover:bg-slate-500">
                    {{ $t('common.cancel') }}
                  </button>
                  <button type="submit" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">
                    {{ $t('common.save') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Teleport>
      </template>
    </div>

    <ConfirmModal
      :show="mostrarModalCerrarRuta"
      :title="$t('route.close')"
      :message="$t('route.closeConfirm')"
      :confirmText="$t('route.close')"
      :cancelText="$t('common.cancel')"
      @confirm="confirmarCerrarRuta"
      @cancel="mostrarModalCerrarRuta = false"
    />
    <ConfirmModal
      :show="mostrarModalAbrirRuta"
      :title="$t('route.open')"
      :message="$t('route.openConfirm')"
      :confirmText="$t('route.open')"
      :cancelText="$t('common.cancel')"
      @confirm="confirmarAbrirRuta"
      @cancel="mostrarModalAbrirRuta = false"
    />
    <ConfirmModal
      :show="mostrarModalEliminar"
      :title="$t('sales.deleteClient')"
      :message="$t('sales.deleteClientConfirm')"
      :confirmText="$t('common.delete')"
      :cancelText="$t('common.cancel')"
      @confirm="confirmarEliminar"
      @cancel="mostrarModalEliminar = false"
    />
  </div>
</template>

<script setup>
import API_BASE_URL from '../config/api.js'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavbarVendedor from '../components/NavbarVendedor.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { consultarEstadoRuta, getUserTimezone } from '../utils/rutaUtils.js'

const router = useRouter()
const clientes = ref([])
const loading = ref(true)
const rutaAbierta = ref(false)
const cargandoRuta = ref(true)
const mostrarModalCerrarRuta = ref(false)
const mostrarModalAbrirRuta = ref(false)
const mostrarModalEliminar = ref(false)
const clienteAEliminar = ref(null)
const modal = ref({
  visible: false,
  _id: null,
  nombres: '',
  apellidos: '',
  cc: '',
  apodo: '',
  celular: '',
  direccion: '',
  direccion_residencial: '',
  valor: '',
  parcelas: '',
  frecuencia: '',
  diaPago: ''
})

// Calcular interés según número de parcelas
const interesAplicado = computed(() => {
  const parcelas = parseInt(modal.value.parcelas) || 0
  return parcelas <= 11 ? 10 : 20
})

const totalAPagar = computed(() => {
  const valor = parseFloat(modal.value.valor) || 0
  const parcelas = parseInt(modal.value.parcelas) || 0
  const interes = interesAplicado.value / 100
  return valor > 0 && parcelas > 0 ? (valor + valor * interes).toFixed(2) : ''
})

const valorParcela = computed(() => {
  const total = parseFloat(totalAPagar.value) || 0
  const parcelas = parseInt(modal.value.parcelas) || 0
  return total > 0 && parcelas > 0 ? (total / parcelas).toFixed(2) : ''
})

function logout() {
  try {
    localStorage.removeItem('rol')
    localStorage.removeItem('adminId')
    localStorage.removeItem('vendedorId')
    localStorage.removeItem('codigoVinculacion')
    localStorage.removeItem('sessionToken')
  } catch (e) {}
  router.replace('/')
  setTimeout(() => { if (location.hash && !location.hash.endsWith('#/')) location.href = '/' }, 150)
}

function cerrarRuta() {
  mostrarModalCerrarRuta.value = true
}

async function confirmarCerrarRuta() {
  const vendedorId = localStorage.getItem('vendedorId')
  const res = await fetch(`${API_BASE_URL}/api/rutas/cerrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendedorId })
  })
  mostrarModalCerrarRuta.value = false
  if (res.ok) {
    const estadoRuta = await consultarEstadoRuta()
    rutaAbierta.value = estadoRuta.abierta
    cargandoRuta.value = estadoRuta.cargando
    await fetchClientes()
    router.push('/vendedor')
  } else {
    const data = await res.json().catch(() => ({}))
    alert(data.msg || data.error || 'No se pudo cerrar la ruta')
  }
}

function abrirRuta() {
  mostrarModalAbrirRuta.value = true
}

async function confirmarAbrirRuta() {
  const vendedorId = localStorage.getItem('vendedorId')
  const res = await fetch(`${API_BASE_URL}/api/rutas/abrir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendedorId, timezone: getUserTimezone() })
  })
  mostrarModalAbrirRuta.value = false
  if (res.ok) {
    const estadoRuta = await consultarEstadoRuta()
    rutaAbierta.value = estadoRuta.abierta
    cargandoRuta.value = estadoRuta.cargando
    await fetchClientes()
    alert('Ruta abierta correctamente')
  } else {
    const data = await res.json().catch(() => ({}))
    alert(data.msg || data.error || 'No se pudo abrir la ruta')
  }
}

function formatFecha(fecha) {
  return fecha ? new Date(fecha).toLocaleString() : ''
}

async function fetchClientes() {
  loading.value = true
  const vendedorId = localStorage.getItem('vendedorId')
  const estadoRuta = await consultarEstadoRuta()
  rutaAbierta.value = estadoRuta.abierta
  cargandoRuta.value = estadoRuta.cargando
  if (!vendedorId) {
    clientes.value = []
    loading.value = false
    return
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/clientes/ruta-actual/${vendedorId}?_t=${Date.now()}`, { cache: 'no-store' })
    clientes.value = res.ok ? await res.json() : []
  } catch (e) {
    clientes.value = []
  }
  loading.value = false
}

function abrirEditar(c) {
  // Calcular parcelas desde dias y frecuencia (inverso del proceso de creación)
  let parcelas = c.dias || 0
  let frecuencia = (c.frecuencia || 'diaria').toLowerCase()
  
  // Convertir frecuencia a minúsculas para comparación
  if (frecuencia === 'semanal' && parcelas > 0) {
    parcelas = Math.round(parcelas / 7)
  } else if (frecuencia === 'mensual' && parcelas > 0) {
    parcelas = Math.round(parcelas / 30)
  } else if (frecuencia === 'quincenal' && parcelas > 0) {
    parcelas = Math.round(parcelas / 15)
  }
  
  modal.value = {
    visible: true,
    _id: c._id,
    nombres: c.nombres || '',
    apellidos: c.apellidos || '',
    cc: c.cc || '',
    apodo: c.apodo || '',
    celular: c.celular || '',
    direccion: c.direccion || '',
    direccion_residencial: c.direccion_residencial || '',
    valor: c.valor || '',
    parcelas: parcelas || '',
    frecuencia: frecuencia || 'diaria',
    diaPago: (c.diaPago || '').toLowerCase()
  }
}

function cerrarModal() {
  modal.value.visible = false
}

async function guardarEdicion() {
  const id = modal.value._id
  if (!id) return
  
  // Calcular valores financieros
  const valor = parseFloat(modal.value.valor) || 0
  const parcelas = parseInt(modal.value.parcelas) || 0
  const interes = interesAplicado.value / 100
  const total = valor + valor * interes
  const valorParcelaCalculado = parcelas > 0 ? (total / parcelas) : 0
  
  // Calcular dias desde parcelas y frecuencia
  let dias = parcelas
  const frecuenciaLower = (modal.value.frecuencia || 'diaria').toLowerCase()
  // Capitalizar primera letra para el backend (Diaria, Semanal, Mensual)
  const frecuenciaCapitalizada = frecuenciaLower.charAt(0).toUpperCase() + frecuenciaLower.slice(1)
  
  if (frecuenciaLower === 'semanal') {
    dias = parcelas * 7
  } else if (frecuenciaLower === 'mensual') {
    dias = parcelas * 30
  } else if (frecuenciaLower === 'quincenal') {
    dias = parcelas * 15
  }
  
  const payload = {
    nombres: modal.value.nombres.trim(),
    apellidos: modal.value.apellidos.trim(),
    cc: modal.value.cc.trim(),
    apodo: (modal.value.apodo || '').trim(),
    celular: modal.value.celular.trim(),
    direccion: modal.value.direccion.trim(),
    direccion_residencial: modal.value.direccion_residencial.trim(),
    valor: Number(valor.toFixed(2)),
    dias: dias,
    frecuencia: frecuenciaCapitalizada,
    diaPago: (modal.value.diaPago || '').toLowerCase(),
    total: Number(total.toFixed(2)),
    parcela: Number(valorParcelaCalculado.toFixed(2)),
    saldo_inicial: Number(total.toFixed(2)),
    intereses: interesAplicado.value
  }
  
  const res = await fetch(`${API_BASE_URL}/api/clientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (res.ok) {
    cerrarModal()
    await fetchClientes()
    window.dispatchEvent(new CustomEvent('actualizar-dashboard'))
  } else {
    const data = await res.json().catch(() => ({}))
    alert(data.error || 'Error al actualizar cliente')
  }
}

function solicitarEliminar(c) {
  clienteAEliminar.value = c
  mostrarModalEliminar.value = true
}

async function confirmarEliminar() {
  const c = clienteAEliminar.value
  mostrarModalEliminar.value = false
  clienteAEliminar.value = null
  if (!c?._id) return
  try {
    const res = await fetch(`${API_BASE_URL}/api/clientes/${c._id}`, { method: 'DELETE' })
    if (res.ok) {
      await fetchClientes()
      window.dispatchEvent(new CustomEvent('actualizar-dashboard'))
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'Error al eliminar la venta')
    }
  } catch (e) {
    alert('Error de conexión al eliminar')
  }
}

onMounted(async () => {
  const estadoRuta = await consultarEstadoRuta()
  rutaAbierta.value = estadoRuta.abierta
  cargandoRuta.value = estadoRuta.cargando
  await fetchClientes()
})
</script>
