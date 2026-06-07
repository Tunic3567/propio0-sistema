<template>
  <div class="min-h-screen w-full max-w-full overflow-x-clip bg-amber-50/80 dark:bg-slate-900 transition-theme">
    <NavbarAdmin @logout="logout" />
    <div class="p-4 md:p-6 max-w-6xl mx-auto pt-20 space-y-6">
      <div
        class="rounded-xl border-2 border-amber-500/80 bg-amber-100/90 dark:bg-amber-950/40 dark:border-amber-600 p-4 text-amber-950 dark:text-amber-100"
      >
        <h1 class="text-lg font-bold flex items-center gap-2">
          <span aria-hidden="true">⚠️</span>
          Reparación de resúmenes (emergencia)
        </h1>
        <p class="text-sm mt-2 leading-relaxed">
          Solo sesión <strong>superusuario</strong>. Usar ante fallas graves. Comparas BD vs cálculo desde movimientos, recalculas cadena o editas campos del documento de ruta.
        </p>
        <p v-if="!serverRepairReady" class="text-sm font-semibold mt-2 text-red-700 dark:text-red-300">
          No tienes permiso de reparación o el servidor rechazó la configuración. Esta herramienta solo está disponible para el superusuario.
        </p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-violet-300 dark:border-violet-700 p-4 shadow-sm space-y-3">
        <h2 class="font-bold text-neutral-800 dark:text-slate-100">Ajuste de saldo sin pagos en rutas</h2>
        <p class="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed">
          Reduce el <strong>saldo restante</strong> del cliente aumentando el campo interno
          <code class="text-xs bg-neutral-100 dark:bg-slate-900 px-1 rounded">ajusteSaldoOculto</code>. No crea filas de pago ni mueve caja.
          Monto positivo = más descuento oculto (hasta cubrir la deuda pendiente respecto a parcelas/abonos).
        </p>
        <div class="grid sm:grid-cols-2 gap-3">
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-semibold">ID del cliente (MongoDB)</span>
            <input
              v-model.trim="clienteAjusteId"
              type="text"
              autocomplete="off"
              placeholder="ej. 674a..."
              class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 font-mono text-sm"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-semibold">Monto (positivo reduce saldo)</span>
            <input
              v-model.number="montoAjusteSaldo"
              type="number"
              step="0.01"
              class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600"
            />
          </label>
        </div>
        <button
          type="button"
          :disabled="!serverRepairReady || aplicandoAjusteSaldo || !clienteAjusteId"
          class="px-4 py-2 rounded-lg bg-violet-600 text-white font-medium disabled:opacity-50"
          @click="aplicarAjusteSaldoOculto"
        >
          {{ aplicandoAjusteSaldo ? 'Aplicando…' : 'Aplicar ajuste' }}
        </button>
        <p
          v-if="mensajeAjusteSaldo"
          class="text-sm whitespace-pre-wrap"
          :class="mensajeAjusteSaldoOk ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'"
        >
          {{ mensajeAjusteSaldo }}
        </p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-neutral-200 dark:border-slate-600 p-4 shadow-sm space-y-3">
        <label class="block text-sm font-semibold">Ruta</label>
        <select
          v-model="rutaSeleccionada"
          class="w-full max-w-2xl px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600"
          @change="limpiarPreview"
        >
          <option value="">— Elige una ruta —</option>
          <option v-for="r in rutas" :key="r._id" :value="r._id">
            {{ etiquetaRuta(r) }}
          </option>
        </select>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            :disabled="!rutaSeleccionada || !serverRepairReady"
            class="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium disabled:opacity-50"
            @click="cargarPreview"
          >
            Cargar vista previa
          </button>
          <button
            type="button"
            :disabled="!preview || !serverRepairReady"
            class="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-slate-600 text-neutral-900 dark:text-slate-100 font-medium disabled:opacity-50"
            @click="rellenarConCalculado"
          >
            Copiar “calculado” → editable
          </button>
          <button
            type="button"
            :disabled="!rutaSeleccionada || !serverRepairReady"
            class="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium disabled:opacity-50"
            @click="sincronizarCadena"
          >
            Recalcular cadena (automático)
          </button>
          <button
            type="button"
            :disabled="!rutaSeleccionada || !serverRepairReady || guardando"
            class="px-4 py-2 rounded-lg bg-amber-600 text-white font-medium disabled:opacity-50"
            @click="guardarManual"
          >
            Guardar valores editados
          </button>
        </div>
        <p v-if="mensaje" class="text-sm whitespace-pre-wrap" :class="mensajeOk ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'">
          {{ mensaje }}
        </p>
      </div>

      <div v-if="preview" class="grid lg:grid-cols-2 gap-4">
        <!-- Como está (BD) -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-neutral-200 dark:border-slate-600 p-4 shadow-sm">
          <h2 class="font-bold text-neutral-800 dark:text-slate-100 mb-3 border-b pb-2">Como está (base de datos)</h2>
          <dl class="text-sm space-y-1 font-mono tabular-nums">
            <div v-for="(v, k) in preview.almacenado" :key="'a-' + k" class="flex justify-between gap-2">
              <dt class="text-neutral-500 dark:text-slate-400">{{ k }}</dt>
              <dd class="text-neutral-900 dark:text-slate-100 break-all">{{ v }}</dd>
            </div>
          </dl>
          <div v-if="preview.diff" class="mt-3 text-xs text-amber-800 dark:text-amber-200">
            Δ vs calculado — cajaFinal: {{ preview.diff.cajaFinal }} | carteraFinal: {{ preview.diff.carteraFinal }}
          </div>
        </div>

        <!-- Calculado por movimientos -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-neutral-200 dark:border-slate-600 p-4 shadow-sm">
          <h2 class="font-bold text-neutral-800 dark:text-slate-100 mb-3 border-b pb-2">Calculado desde movimientos</h2>
          <p class="text-sm mb-2 text-neutral-600 dark:text-slate-400">Totales inferidos (ingresos, pagos Parcela/Abono, ventas, egresos, retiros).</p>
          <dl class="text-sm space-y-1 font-mono">
            <div class="flex justify-between"><dt>cajaFinal</dt><dd>{{ preview.calculado.cajaFinal }}</dd></div>
            <div class="flex justify-between"><dt>carteraFinal</dt><dd>{{ preview.calculado.carteraFinal }}</dd></div>
          </dl>
          <details class="mt-2 text-xs">
            <summary class="cursor-pointer text-blue-600 dark:text-blue-400">Desglose</summary>
            <pre class="mt-2 overflow-x-auto bg-neutral-100 dark:bg-slate-900 p-2 rounded">{{ JSON.stringify(preview.calculado.desglose, null, 2) }}</pre>
          </details>
        </div>
      </div>

      <!-- Editable: cómo quedará -->
      <div v-if="preview && draft" class="bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-amber-400 dark:border-amber-700 p-4 shadow-sm">
        <h2 class="font-bold text-neutral-800 dark:text-slate-100 mb-3">Cómo quedará (editable) → se envía al guardar</h2>
        <div class="grid sm:grid-cols-2 gap-3 text-sm">
          <label class="flex flex-col gap-1">
            <span>cajaInicial</span>
            <input
              v-model.number="draft.cajaInicial"
              type="number"
              step="0.01"
              class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-neutral-900 dark:text-slate-100"
            />
          </label>
          <label class="flex flex-col gap-1">
            <span>carteraInicial</span>
            <input
              v-model.number="draft.carteraInicial"
              type="number"
              step="0.01"
              class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-neutral-900 dark:text-slate-100"
            />
          </label>
          <label class="flex flex-col gap-1">
            <span>cajaFinal</span>
            <input
              v-model.number="draft.cajaFinal"
              type="number"
              step="0.01"
              class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-neutral-900 dark:text-slate-100"
            />
          </label>
          <label class="flex flex-col gap-1">
            <span>carteraFinal</span>
            <input
              v-model.number="draft.carteraFinal"
              type="number"
              step="0.01"
              class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-neutral-900 dark:text-slate-100"
            />
          </label>
          <label class="flex flex-col gap-1">
            <span>recaudoPretendido</span>
            <input
              v-model.number="draft.recaudoPretendido"
              type="number"
              step="0.01"
              class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-neutral-900 dark:text-slate-100"
            />
          </label>
          <label class="flex flex-col gap-1">
            <span>clientesIniciales</span>
            <input
              v-model="draft.clientesInicialesStr"
              type="text"
              inputmode="numeric"
              placeholder="vacío = null"
              class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-neutral-900 dark:text-slate-100"
            />
          </label>
          <label class="flex items-center gap-2 col-span-full">
            <input v-model="draft.abierta" type="checkbox" />
            <span>abierta</span>
          </label>
          <label class="flex flex-col gap-1 col-span-full sm:col-span-1">
            <span>fechaApertura (ISO)</span>
            <input
              v-model="draft.fechaApertura"
              type="text"
              class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-neutral-900 dark:text-slate-100"
              placeholder="2025-01-15T10:00:00.000Z"
            />
          </label>
          <label class="flex flex-col gap-1 col-span-full sm:col-span-1">
            <span>fechaCierre (ISO o vacío)</span>
            <input
              v-model="draft.fechaCierre"
              type="text"
              class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-neutral-900 dark:text-slate-100"
              placeholder="vacío si abierta"
            />
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavbarAdmin from '../components/NavbarAdmin.vue'
import API_BASE_URL from '../config/api.js'

const router = useRouter()

const rutas = ref([])
const rutaSeleccionada = ref('')
const preview = ref(null)
const draft = ref(null)
const mensaje = ref('')
const mensajeOk = ref(true)
const guardando = ref(false)
const serverRepairReady = ref(false)
const clienteAjusteId = ref('')
const montoAjusteSaldo = ref(null)
const aplicandoAjusteSaldo = ref(false)
const mensajeAjusteSaldo = ref('')
const mensajeAjusteSaldoOk = ref(true)

function authHeaders() {
  const token = localStorage.getItem('sessionToken')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}

function etiquetaRuta(r) {
  const fa = r.fechaApertura ? new Date(r.fechaApertura).toLocaleString('es-ES') : ''
  const vend = r.vendedor?.nombre || ''
  const estado = r.abierta ? 'ABIERTA' : 'cerrada'
  return `${vend} — ${fa} (${estado})`
}

function limpiarPreview() {
  preview.value = null
  draft.value = null
  mensaje.value = ''
}

function snapshotToDraft(a) {
  return {
    cajaInicial: Number(a.cajaInicial) || 0,
    carteraInicial: Number(a.carteraInicial) || 0,
    cajaFinal: Number(a.cajaFinal) || 0,
    carteraFinal: Number(a.carteraFinal) || 0,
    recaudoPretendido: Number(a.recaudoPretendido) || 0,
    clientesInicialesStr:
      a.clientesIniciales != null && a.clientesIniciales !== '' ? String(a.clientesIniciales) : '',
    abierta: !!a.abierta,
    fechaApertura: a.fechaApertura || '',
    fechaCierre: a.fechaCierre || ''
  }
}

async function aplicarAjusteSaldoOculto() {
  mensajeAjusteSaldo.value = ''
  aplicandoAjusteSaldo.value = true
  try {
    const id = String(clienteAjusteId.value || '').trim()
    const monto = Number(montoAjusteSaldo.value)
    if (!id) {
      mensajeAjusteSaldoOk.value = false
      mensajeAjusteSaldo.value = 'Indica el ID del cliente.'
      return
    }
    if (!Number.isFinite(monto) || monto === 0) {
      mensajeAjusteSaldoOk.value = false
      mensajeAjusteSaldo.value = 'Indica un monto distinto de cero.'
      return
    }
    const res = await fetch(
      `${API_BASE_URL}/api/admin/super/clientes/${encodeURIComponent(id)}/ajuste-saldo-oculto`,
      {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ monto })
      }
    )
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      mensajeAjusteSaldoOk.value = false
      mensajeAjusteSaldo.value =
        data.mensaje || data.error || data.detalles || JSON.stringify(data)
      return
    }
    mensajeAjusteSaldoOk.value = true
    mensajeAjusteSaldo.value = `OK. Δ ajuste: ${data.deltaAplicado}. Saldo restante: ${data.saldoRestanteAntes} → ${data.saldoRestanteDespues}. ajusteSaldoOculto: ${data.ajusteSaldoOcultoAntes} → ${data.ajusteSaldoOcultoDespues}.`
  } catch (e) {
    mensajeAjusteSaldoOk.value = false
    mensajeAjusteSaldo.value = e.message || 'Error de red'
  } finally {
    aplicandoAjusteSaldo.value = false
  }
}

async function cargarConfig() {
  try {
    const token = localStorage.getItem('sessionToken')
    const res = await fetch(`${API_BASE_URL}/api/admin/repair/config`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json().catch(() => ({}))
    serverRepairReady.value = res.ok && !!data.ok
  } catch {
    serverRepairReady.value = false
  }
}

async function cargarRutas() {
  const res = await fetch(`${API_BASE_URL}/api/admin/rutas`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('sessionToken')}` }
  })
  if (res.ok) {
    rutas.value = await res.json()
    rutas.value.sort((a, b) => new Date(b.fechaApertura) - new Date(a.fechaApertura))
  }
}

async function cargarPreview() {
  mensaje.value = ''
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/repair/ruta/${encodeURIComponent(rutaSeleccionada.value)}/preview`, {
      headers: authHeaders()
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      mensajeOk.value = false
      mensaje.value = data.error || data.mensaje || JSON.stringify(data)
      preview.value = null
      draft.value = null
      return
    }
    preview.value = data
    draft.value = snapshotToDraft(data.almacenado)
    mensajeOk.value = true
    mensaje.value = 'Vista previa cargada.'
  } catch (e) {
    mensajeOk.value = false
    mensaje.value = e.message || 'Error de red'
  }
}

function rellenarConCalculado() {
  if (!preview.value || !draft.value) return
  const c = preview.value.calculado
  draft.value.cajaFinal = c.cajaFinal
  draft.value.carteraFinal = c.carteraFinal
  mensajeOk.value = true
  mensaje.value = 'Valores finales copiados desde el cálculo por movimientos (revisa antes de guardar).'
}

async function sincronizarCadena() {
  mensaje.value = ''
  guardando.value = true
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/admin/repair/ruta/${encodeURIComponent(rutaSeleccionada.value)}/sincronizar-cadena`,
      { method: 'POST', headers: authHeaders() }
    )
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      mensajeOk.value = false
      mensaje.value = data.error || data.mensaje || JSON.stringify(data)
      return
    }
    mensajeOk.value = true
    mensaje.value = 'Cadena recalculada. Recarga vista previa para ver números nuevos.'
    await cargarPreview()
  } catch (e) {
    mensajeOk.value = false
    mensaje.value = e.message || 'Error de red'
  } finally {
    guardando.value = false
  }
}

function buildPatch() {
  const antes = preview.value?.almacenado
  if (!antes || !draft.value) return null
  const patch = {}
  const d = draft.value
  const fields = [
    'cajaInicial',
    'carteraInicial',
    'cajaFinal',
    'carteraFinal',
    'recaudoPretendido',
    'clientesIniciales',
    'abierta',
    'fechaApertura',
    'fechaCierre'
  ]
  for (const key of fields) {
    let beforeVal = antes[key]
    if (typeof beforeVal === 'number' && Number.isNaN(beforeVal)) beforeVal = 0
    let afterVal = d[key]
    if (key === 'fechaApertura' || key === 'fechaCierre') {
      const b = beforeVal || ''
      const a = (afterVal || '').trim()
      if (String(b) !== String(a)) patch[key] = a || null
    } else if (key === 'abierta') {
      if (!!beforeVal !== !!afterVal) patch.abierta = !!afterVal
    } else if (key === 'clientesIniciales') {
      const raw = String(d.clientesInicialesStr ?? '').trim()
      const a = raw === '' ? null : Number(raw)
      const bRaw = antes.clientesIniciales
      const bNum =
        bRaw == null || bRaw === '' ? null : Number(bRaw)
      const cambio =
        (bNum === null && a === null) ||
        (bNum !== null && a !== null && !Number.isNaN(a) && bNum === a)
          ? false
          : true
      if (cambio) {
        if (raw === '') patch.clientesIniciales = null
        else if (Number.isNaN(Number(raw))) {
          /* texto no numérico: no enviar parche para no pisar sin querer */
        } else patch.clientesIniciales = Number(raw)
      }
    } else {
      const b = Number(beforeVal) || 0
      const a = Number(afterVal) || 0
      if (Math.abs(b - a) > 0.0001) patch[key] = a
    }
  }
  return Object.keys(patch).length ? patch : null
}

async function guardarManual() {
  const patch = buildPatch()
  if (!patch) {
    mensajeOk.value = false
    mensaje.value = 'No hay cambios respecto a la base de datos.'
    return
  }
  guardando.value = true
  mensaje.value = ''
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/repair/ruta/${encodeURIComponent(rutaSeleccionada.value)}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ patch })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      mensajeOk.value = false
      mensaje.value = data.error || data.mensaje || JSON.stringify(data)
      return
    }
    mensajeOk.value = true
    mensaje.value = 'Guardado. antes → después en servidor (revisa respuesta en red si hace falta).'
    preview.value = null
    await cargarPreview()
  } catch (e) {
    mensajeOk.value = false
    mensaje.value = e.message || 'Error de red'
  } finally {
    guardando.value = false
  }
}

function logout() {
  try {
    localStorage.removeItem('rol')
    localStorage.removeItem('adminId')
    localStorage.removeItem('vendedorId')
    localStorage.removeItem('codigoVinculacion')
    localStorage.removeItem('sessionToken')
    localStorage.removeItem('esSuperUsuario')
    localStorage.removeItem('adminNombre')
  } catch (_) {}
  router.replace('/')
}

onMounted(async () => {
  await cargarConfig()
  await cargarRutas()
})
</script>

