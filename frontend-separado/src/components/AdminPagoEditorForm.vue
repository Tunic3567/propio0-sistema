<template>
  <div class="space-y-4">
    <p v-if="errorCarga" class="text-sm text-red-600 dark:text-red-400">{{ errorCarga }}</p>
    <template v-else-if="cliente">
      <!-- Misma UX que Pagos.vue (vendedor): tipos + montos + parcelas + saldos -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
        <label v-for="op in opciones" :key="op.value" class="flex flex-col min-w-0 cursor-pointer">
          <input type="radio" class="hidden peer" v-model="tipo" :value="op.value" />
          <div
            :class="[
              'flex items-center justify-center min-h-[2.75rem] py-2 px-1 rounded text-center font-semibold transition border-2 shadow-sm break-words',
              tipo === op.value
                ? op.value === 'Parcela'
                  ? 'bg-blue-600 border-blue-700 text-white'
                  : op.value === 'Abono'
                  ? 'bg-green-600 border-green-700 text-white'
                  : 'bg-red-600 border-red-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 border-neutral-300 dark:border-gray-600 text-gray-800 dark:text-gray-100'
            ]"
          >
            <span class="leading-tight text-sm sm:text-base">{{ op.label }}</span>
          </div>
        </label>
      </div>

      <div v-if="tipo !== 'No pago'" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{{ t('payment.amount') }}</label>
          <input
            v-if="tipo === 'Abono'"
            v-model="valorAbono"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <input
            v-else
            :value="valorTotalParcelas"
            type="number"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
            readonly
            tabindex="-1"
          />
        </div>

        <div v-if="tipo === 'Parcela'">
          <label class="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{{ t('payment.installmentCount') }}</label>
          <select
            v-model.number="numParcelas"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option v-for="n in maxParcelas" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{{ t('payment.comment') }} ({{ t('common.optional') }})</label>
        <textarea
          v-model="observaciones"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          rows="2"
        />
      </div>

      <div class="mt-2 text-base space-y-2">
        <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2">
          <span class="font-semibold text-gray-700 dark:text-gray-200">{{ t('client.remainingBalance') }}</span>
          <span class="font-semibold tabular-nums text-red-600 dark:text-red-300">${{ saldoBaseParaCalculo.toFixed(2) }}</span>
        </div>
        <div class="flex items-center justify-between bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-600 rounded-md px-3 py-2">
          <span class="font-semibold text-gray-700 dark:text-gray-200">{{ t('payment.newBalance') }}</span>
          <span class="font-semibold text-green-700 dark:text-green-300">${{ nuevoSaldo }}</span>
        </div>
      </div>
    </template>
    <p v-else class="text-sm text-neutral-500">{{ t('common.loading') }}…</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import API_BASE_URL from '../config/api.js'

const props = defineProps({
  /** Pago que se está editando (debe incluir cliente poblado o id) */
  pago: { type: Object, required: true }
})

const { t } = useI18n()

const cliente = ref(null)
const errorCarga = ref('')

const opciones = computed(() => [
  { value: 'Parcela', label: t('payment.types.installment') },
  { value: 'Abono', label: t('payment.types.payment') },
  { value: 'No pago', label: t('payment.types.noPayment') }
])

const tipo = ref('Parcela')
const valorAbono = ref('')
const numParcelas = ref(1)
const observaciones = ref('')

const dias = computed(() => Number(cliente.value?.dias) || 0)
const valorParcela = computed(() => Number(cliente.value?.parcela) || 0)
const saldoActual = computed(() => Number(cliente.value?.total) || 0)

/** Misma lógica que Pagos.vue: saldo antes de aplicar ESTE pago en la ruta */
const saldoBaseParaCalculo = computed(() => {
  const p = props.pago
  if (p && p.saldo_antes !== undefined && p.saldo_antes !== null) {
    return Number(p.saldo_antes) || saldoActual.value
  }
  if (p && p.valor !== undefined) {
    return Number(saldoActual.value) + Number(p.valor || 0)
  }
  return saldoActual.value
})

const maxParcelas = computed(() => {
  const diasNum = Number(dias.value) || 1
  const valorParcelaNum = Number(valorParcela.value) || 1
  const saldoNum = Number(saldoBaseParaCalculo.value) || 0
  const porSaldo = Math.floor(saldoNum / valorParcelaNum)
  return Math.max(1, Math.min(diasNum, porSaldo))
})

watch([numParcelas, () => saldoActual.value, valorParcela], () => {
  if (numParcelas.value > maxParcelas.value) {
    numParcelas.value = maxParcelas.value
  }
})

const valorTotalParcelas = computed(() => {
  if (tipo.value === 'Parcela') {
    return (valorParcela.value * numParcelas.value).toFixed(2)
  }
  return '0.00'
})

const nuevoSaldo = computed(() => {
  if (tipo.value === 'Parcela') {
    const cuotas = Math.min(numParcelas.value, maxParcelas.value)
    return Math.max(0, saldoBaseParaCalculo.value - valorParcela.value * cuotas).toFixed(2)
  }
  if (tipo.value === 'Abono') {
    const v = parseFloat(valorAbono.value)
    const abono = Number.isNaN(v) ? 0 : v
    return Math.max(0, saldoBaseParaCalculo.value - abono).toFixed(2)
  }
  return saldoBaseParaCalculo.value.toFixed(2)
})

async function cargarCliente() {
  errorCarga.value = ''
  cliente.value = null
  const id = props.pago?.cliente?._id || props.pago?.cliente
  if (!id) {
    errorCarga.value = 'Cliente no disponible en el pago.'
    return
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/clientes/${id}`)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      errorCarga.value = data.error || 'No se pudo cargar el cliente.'
      return
    }
    cliente.value = data
    await nextTick()
    inicializarDesdePago()
  } catch (e) {
    errorCarga.value = 'Error de red al cargar el cliente.'
  }
}

function inicializarDesdePago() {
  const p = props.pago
  tipo.value = p.tipo || 'Parcela'
  observaciones.value = p.observaciones || ''
  if (p.tipo === 'Abono') {
    const pv = p.valor != null ? Number(p.valor) : NaN
    valorAbono.value = !Number.isNaN(pv) && pv > 0 ? String(pv) : ''
  } else {
    valorAbono.value = ''
  }

  const vp = Number(cliente.value?.parcela) || 0
  const v = Number(p.valor) || 0

  if (p.tipo === 'Parcela') {
    if (p.numParcelas != null && Number(p.numParcelas) >= 1) {
      numParcelas.value = Math.min(Math.max(1, Number(p.numParcelas)), maxParcelas.value)
    } else if (vp > 0 && v > 0) {
      const n = Math.max(1, Math.round(v / vp))
      numParcelas.value = Math.min(n, maxParcelas.value)
    } else {
      numParcelas.value = Math.min(1, maxParcelas.value)
    }
  } else {
    numParcelas.value = 1
  }
}

watch(
  () => props.pago?._id,
  () => {
    cargarCliente()
  },
  { immediate: true }
)

// Al cambiar a Abono desde otro tipo, quitar “0” y dejar el campo listo para escribir
watch(tipo, (t, prev) => {
  if (t !== 'Abono' || prev === undefined || prev === 'Abono') return
  const s = String(valorAbono.value ?? '').trim()
  const n = parseFloat(s)
  if (s === '' || s === '0' || (!Number.isNaN(n) && n === 0)) {
    valorAbono.value = ''
  }
})

/** Expuesto al padre: validar y devolver cuerpo para PUT /api/admin/pagos/:id */
function construirBody() {
  if (!cliente.value || errorCarga.value) return { error: errorCarga.value || 'Sin datos' }

  if (tipo.value === 'Abono') {
    const valorNumerico = parseFloat(valorAbono.value)
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      return { error: 'El valor del abono debe ser mayor que 0' }
    }
    if (valorNumerico > saldoBaseParaCalculo.value) {
      return { error: 'El abono no puede ser mayor al saldo restante de este pago' }
    }
  }

  const cuotasEfectivas =
    tipo.value === 'Parcela' ? Math.min(numParcelas.value, maxParcelas.value) : 0

  let nuevoSaldoNum = saldoBaseParaCalculo.value
  if (tipo.value === 'Parcela') {
    nuevoSaldoNum = saldoBaseParaCalculo.value - valorParcela.value * cuotasEfectivas
  } else if (tipo.value === 'Abono') {
    const v = parseFloat(valorAbono.value)
    const abono = Number.isNaN(v) ? 0 : v
    nuevoSaldoNum = saldoBaseParaCalculo.value - abono
  }
  nuevoSaldoNum = Math.max(0, Number(nuevoSaldoNum.toFixed(2)))

  const valorEnvio =
    tipo.value === 'Parcela'
      ? valorParcela.value * cuotasEfectivas
      : tipo.value === 'Abono'
      ? parseFloat(valorAbono.value)
      : 0

  return {
    body: {
      tipo: tipo.value,
      valor: valorEnvio,
      // Al pasar de Parcela a Abono/No pago, limpiar cuotas en BD (null ≠ undefined en payload)
      numParcelas: tipo.value === 'Parcela' ? cuotasEfectivas : null,
      observaciones: observaciones.value,
      saldo_antes: saldoBaseParaCalculo.value,
      saldo_despues: nuevoSaldoNum
    }
  }
}

defineExpose({ construirBody, cargarCliente })
</script>
