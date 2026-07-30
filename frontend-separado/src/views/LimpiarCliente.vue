<template>
  <div class="min-h-screen w-full max-w-full overflow-x-clip bg-amber-50/80 dark:bg-slate-900 transition-theme">
    <NavbarAdmin @logout="logout" />
    <div class="p-4 md:p-6 max-w-6xl mx-auto pt-20 space-y-6">
      <div class="rounded-xl border-2 border-red-500/80 bg-red-100/90 dark:bg-red-950/40 dark:border-red-600 p-4 text-red-950 dark:text-red-100">
        <h1 class="text-lg font-bold">Eliminar cliente (solo prueba)</h1>
        <p class="text-sm mt-2 leading-relaxed">
          Elimina <strong>todos los datos</strong> relacionados a un cliente: pagos, historial,
          notas del d&iacute;a, c&eacute;dulas reportadas y el cliente mismo.
        </p>
        <p class="text-sm mt-1 font-bold">Solo para administraci&oacute;n. Esta acci&oacute;n no se puede deshacer.</p>
      </div>

      <div v-if="!cargado" class="text-center py-10 text-neutral-500 dark:text-slate-400">
        Cargando...
      </div>

      <template v-if="cargado">
        <div class="rounded-xl border-2 border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-4 space-y-4 shadow-sm">
          <label class="block text-sm font-semibold text-neutral-700 dark:text-slate-200">
            Buscar y seleccionar cliente
          </label>
          <input
            v-model="busqueda"
            type="text"
            placeholder="Escribe nombre o n&uacute;mero de documento..."
            class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100"
          />
          <select
            v-model="clienteId"
            class="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100"
          >
            <option value="" disabled>-- Seleccione un cliente --</option>
            <option v-for="c in clientesFiltrados" :key="c._id" :value="c._id">
              {{ c.nombre }} ({{ c.cc || 'sin CC' }}) &mdash; {{ c.valor || 0 }} &times; {{ c.cuotas || 0 }}
            </option>
          </select>
          <p v-if="clientesFiltrados.length === 0 && busqueda" class="text-sm text-neutral-400 dark:text-slate-500">
            Ning&uacute;n cliente coincide con "{{ busqueda }}"
          </p>
        </div>

        <div v-if="paso === 0" class="text-center">
          <button
            :disabled="!clienteId"
            class="px-8 py-3 rounded-xl text-lg font-bold transition-colors"
            :class="clienteId ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-neutral-300 dark:bg-slate-700 text-neutral-500 dark:text-slate-400 cursor-not-allowed'"
            @click="paso = 1"
          >
            1. Iniciar proceso de eliminaci&oacute;n
          </button>
          <p v-if="!clienteId" class="text-sm text-neutral-400 dark:text-slate-500 mt-2">
            Selecciona un cliente primero
          </p>
        </div>

        <div v-if="paso >= 1" class="rounded-xl border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 p-4 space-y-3">
          <h2 class="text-base font-bold text-red-800 dark:text-red-200">Advertencia</h2>
          <p class="text-sm text-red-700 dark:text-red-300">
            Est&aacute;s a punto de eliminar TODOS los datos de
            <strong>{{ clienteSeleccionado?.nombre }}</strong>.
            Esta acci&oacute;n no se puede deshacer.
          </p>
          <div class="flex flex-wrap gap-3">
            <button
              class="px-6 py-2 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition-colors"
              @click="confirmarPaso2"
            >
              2. Confirmar: quiero eliminar los datos
            </button>
            <button
              class="px-6 py-2 rounded-lg text-sm font-bold bg-neutral-300 dark:bg-slate-700 text-neutral-700 dark:text-slate-200 hover:bg-neutral-400 dark:hover:bg-slate-600 transition-colors"
              @click="paso = 0"
            >
              Cancelar
            </button>
          </div>
        </div>

        <div v-if="paso >= 2" class="rounded-xl border-2 border-red-500 dark:border-red-600 bg-white dark:bg-slate-800 p-4 space-y-4 shadow-lg">
          <h2 class="text-base font-bold text-red-700 dark:text-red-300">
            Resumen de datos a eliminar
          </h2>
          <div v-if="cargandoResumen" class="text-sm text-neutral-500 dark:text-slate-400">
            Calculando registros...
          </div>
          <div v-else class="space-y-2">
            <table class="w-full text-sm">
              <tbody>
                <tr v-for="item in resumenItems" :key="item.label" class="border-b border-neutral-200 dark:border-slate-700">
                  <td class="py-1.5 text-neutral-600 dark:text-slate-300">{{ item.label }}</td>
                  <td class="py-1.5 text-right font-mono font-bold" :class="item.count > 0 ? 'text-red-600 dark:text-red-400' : 'text-neutral-400 dark:text-slate-500'">
                    {{ item.count }}
                  </td>
                </tr>
              </tbody>
            </table>
            <p class="text-sm font-bold text-red-600 dark:text-red-400 pt-2">
              Total: {{ totalRegistros }} registro(s) ser&aacute;n eliminados permanentemente.
            </p>
          </div>

          <div class="border-t border-red-200 dark:border-red-800 pt-4 space-y-3">
            <p class="text-sm font-bold text-red-700 dark:text-red-300">
              Para ejecutar, escribe "ELIMINAR" en el campo de abajo y haz clic en el bot&oacute;n rojo.
            </p>
            <input
              v-model="textoConfirmacion"
              type="text"
              placeholder="Escribe ELIMINAR para confirmar"
              class="w-full px-3 py-2 rounded-lg border-2 border-red-300 dark:border-red-700 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 font-mono text-center text-lg"
              @keyup.enter="ejecutarLimpieza"
            />
            <div class="flex flex-wrap gap-3">
              <button
                :disabled="textoConfirmacion !== 'ELIMINAR' || ejecutando"
                class="px-8 py-3 rounded-xl text-lg font-bold transition-colors"
                :class="textoConfirmacion === 'ELIMINAR' && !ejecutando ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-neutral-300 dark:bg-slate-700 text-neutral-500 dark:text-slate-400 cursor-not-allowed'"
                @click="ejecutarLimpieza"
              >
                {{ ejecutando ? 'Ejecutando...' : '3. Ejecutar eliminaci&oacute;n &mdash; &iexcl;IRREVERSIBLE!' }}
              </button>
              <button
                v-if="!ejecutando"
                class="px-6 py-3 rounded-xl text-sm font-bold bg-neutral-300 dark:bg-slate-700 text-neutral-700 dark:text-slate-200 hover:bg-neutral-400 dark:hover:bg-slate-600 transition-colors"
                @click="paso = 1"
              >
                Atr&aacute;s
              </button>
            </div>
          </div>
        </div>

        <div v-if="resultado" class="rounded-xl border-2 p-4 space-y-2 shadow-sm"
          :class="resultado.ok
            ? 'border-green-500 bg-green-50 dark:bg-green-950/30 dark:border-green-600'
            : 'border-red-500 bg-red-50 dark:bg-red-950/30 dark:border-red-600'"
        >
          <h3 class="text-base font-bold"
            :class="resultado.ok ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'"
          >
            {{ resultado.ok ? 'Eliminaci&oacute;n completada' : 'Error' }}
          </h3>
          <p class="text-sm text-neutral-700 dark:text-slate-200">{{ resultado.mensaje || resultado.error }}</p>
          <div v-if="resultado.ok && resultado.eliminados" class="text-sm text-neutral-600 dark:text-slate-300">
            <p v-for="(val, key) in resultado.eliminados" :key="key" class="capitalize">
              {{ key }}: {{ val }}
            </p>
          </div>
          <button
            class="mt-2 px-4 py-2 rounded-lg text-sm font-bold bg-neutral-300 dark:bg-slate-700 text-neutral-700 dark:text-slate-200 hover:bg-neutral-400 dark:hover:bg-slate-600 transition-colors"
            @click="resetear"
          >
            Eliminar otro cliente
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import NavbarAdmin from '../components/NavbarAdmin.vue'
import API_BASE_URL from '../config/api.js'

const busqueda = ref('')
const todosClientes = ref([])
const clienteId = ref('')
const cargado = ref(false)
const paso = ref(0)
const cargandoResumen = ref(false)
const textoConfirmacion = ref('')
const ejecutando = ref(false)
const resultado = ref(null)

const clientesFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase().trim()
  if (!q) return todosClientes.value
  return todosClientes.value.filter(c =>
    c.nombre?.toLowerCase().includes(q) ||
    (c.cc && String(c.cc).includes(q))
  )
})

const clienteSeleccionado = computed(() => todosClientes.value.find(c => c._id === clienteId.value))
const resumenItems = ref([])
const totalRegistros = computed(() => resumenItems.value.reduce((s, i) => s + i.count, 0))

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/super/clientes?_t=${Date.now()}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('sessionToken')}` },
      cache: 'no-store'
    })
    const data = await res.json()
    if (data.ok) {
      todosClientes.value = (data.clientes || []).filter(c => c._id)
    }
  } catch (e) {
    console.error('Error cargando clientes:', e)
  }
  cargado.value = true
})

async function confirmarPaso2() {
  paso.value = 2
  cargandoResumen.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/super/clientes/${clienteId.value}/limpiar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('sessionToken')}`
      },
      body: JSON.stringify({ dryRun: true })
    })
    if (res.ok) {
      const data = await res.json()
      if (data.eliminados) {
        const labels = {
          clientes: 'Cliente',
          pagos: 'Pagos',
          historial: 'Historial de cliente',
          notas: 'Notas del d&iacute;a',
          cedulasReportadas: 'C&eacute;dulas reportadas'
        }
        resumenItems.value = Object.entries(data.eliminados).map(([key, count]) => ({
          label: labels[key] || key,
          count
        }))
      }
    } else {
      const data = await res.json().catch(() => ({}))
      resumenItems.value = [{ label: 'Error', count: data.error || 'No se pudo obtener resumen' }]
    }
  } catch (e) {
    resumenItems.value = [{ label: 'Error de conexi&oacute;n', count: e.message }]
  }
  cargandoResumen.value = false
}

async function ejecutarLimpieza() {
  if (textoConfirmacion.value !== 'ELIMINAR') return
  ejecutando.value = true
  resultado.value = null
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/super/clientes/${clienteId.value}/limpiar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('sessionToken')}`
      }
    })
    const data = await res.json().catch(() => ({}))
    resultado.value = { ok: res.ok, ...data }
  } catch (e) {
    resultado.value = { ok: false, error: e.message }
  }
  ejecutando.value = false
}

function resetear() {
  busqueda.value = ''
  clienteId.value = ''
  paso.value = 0
  textoConfirmacion.value = ''
  resultado.value = null
  resumenItems.value = []
}

function logout() {
  localStorage.clear()
  window.location.href = '/'
}
</script>
