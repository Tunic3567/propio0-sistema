<template>
  <Teleport to="body">
    <div
      v-if="show && historial"
      class="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 bg-black/55 dark:bg-black/70" @click="$emit('close')"></div>
      <div class="relative w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl border-2 border-neutral-200 dark:border-slate-600 bg-white dark:bg-gray-800 shadow-2xl">
        <div class="px-5 py-4 border-b border-neutral-200 dark:border-slate-600 flex items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ $t('history.salesHistoryTitle') }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {{ historial.cliente?.nombres }} {{ historial.cliente?.apellidos }}
              <span class="text-gray-500 dark:text-gray-400">· {{ t('client.id') }} {{ historial.cc }}</span>
            </p>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
            :aria-label="$t('history.close')"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div
          v-if="refreshing"
          class="px-5 py-2 bg-blue-50 dark:bg-blue-900/25 text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2 border-b border-blue-100 dark:border-slate-600"
          role="status"
          aria-live="polite"
        >
          <svg class="animate-spin h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {{ $t('history.syncingPayments') }}
        </div>
        <div class="overflow-y-auto flex-1 p-4 space-y-4">
          <div
            v-for="(venta, vIdx) in ventasHistorialListaModal"
            :key="`${venta._id}-${vIdx}`"
            class="rounded-xl border-2 border-neutral-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900/40 overflow-hidden"
          >
            <div
              class="px-4 py-3 bg-neutral-100/80 dark:bg-slate-800/80 border-b border-neutral-200 dark:border-slate-600 flex flex-wrap items-center justify-between gap-2 cursor-pointer select-none hover:bg-neutral-200/60 dark:hover:bg-slate-700/60 transition-colors w-full text-left"
              role="button"
              tabindex="0"
              :aria-expanded="cicloHistorialVentaExpandido(venta, vIdx) ? 'true' : 'false'"
              :title="cicloHistorialVentaExpandido(venta, vIdx) ? $t('common.hideSection') : $t('common.showSection')"
              @click="toggleCicloHistorialVenta(venta, vIdx)"
              @keydown.enter.prevent="toggleCicloHistorialVenta(venta, vIdx)"
              @keydown.space.prevent="toggleCicloHistorialVenta(venta, vIdx)"
            >
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <svg
                  class="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform duration-200"
                  :class="{ 'rotate-180': !cicloHistorialVentaExpandido(venta, vIdx) }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ $t('history.saleCycle') }} #{{ ventasHistorialListaModal.length - vIdx }}</span>
                  <span
                    v-if="venta.esUltimaVenta"
                    class="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-200 dark:bg-green-900/50 text-green-900 dark:text-green-200"
                  >{{ $t('history.currentSale') }}</span>
                  <span
                    v-else
                    class="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200"
                  >{{ $t('history.previousSale') }}</span>
                </div>
              </div>
              <span class="text-xs text-gray-600 dark:text-gray-400 shrink-0">{{ formatearFecha(venta.createdAt) }}</span>
            </div>
            <div v-show="cicloHistorialVentaExpandido(venta, vIdx)">
              <div class="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span class="text-gray-600 dark:text-gray-400 font-medium">{{ $t('client.initialBalance') }}</span>
                  <p class="font-bold text-gray-900 dark:text-white">${{ Number(venta.saldo_inicial || 0).toLocaleString() }}</p>
                </div>
                <div>
                  <span class="text-gray-600 dark:text-gray-400 font-medium">{{ $t('client.sale') }}</span>
                  <p class="font-bold text-gray-900 dark:text-white">${{ Number(venta.valor || 0).toLocaleString() }}</p>
                </div>
                <div>
                  <span class="text-gray-600 dark:text-gray-400 font-medium">{{ $t('client.installmentValue') }}</span>
                  <p class="font-bold text-gray-900 dark:text-white">${{ Number(venta.parcela || 0).toLocaleString() }}</p>
                </div>
                <div>
                  <span class="text-gray-600 dark:text-gray-400 font-medium">{{ $t('client.days') }}</span>
                  <p class="font-bold text-gray-900 dark:text-white">{{ venta.dias }}</p>
                </div>
                <div>
                  <span class="text-gray-600 dark:text-gray-400 font-medium">{{ $t('client.overdueInstallments') }}</span>
                  <p class="font-bold text-orange-600 dark:text-orange-400">{{ calcularParcelasAtrasadasDesdePagos(venta.pagos, venta.parcela) }}</p>
                </div>
                <div>
                  <span class="text-gray-600 dark:text-gray-400 font-medium">{{ $t('history.cycleVisits') }}</span>
                  <p class="font-bold text-gray-900 dark:text-white">{{ visitasTotalesCiclo(venta) }}</p>
                </div>
              </div>
              <div class="px-4 pb-4">
                <h4 class="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">{{ $t('history.paymentsList') }}</h4>
                <div v-if="!venta.pagos || venta.pagos.length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic py-2">
                  {{ $t('history.noPaymentsInCycle') }}
                </div>
                <div v-else class="rounded-lg border border-neutral-200 dark:border-slate-600 overflow-hidden">
                  <ul class="md:hidden divide-y divide-neutral-200 dark:divide-slate-600 bg-white dark:bg-gray-800/50">
                    <li
                      v-for="p in venta.pagos"
                      :key="p._id"
                      class="px-3 py-3 text-xs sm:text-sm space-y-2"
                    >
                      <div class="flex justify-between gap-2 items-start">
                        <span class="text-gray-500 dark:text-gray-400 shrink-0">{{ $t('history.paymentDate') }}</span>
                        <span class="text-gray-900 dark:text-gray-100 text-right font-medium leading-snug break-words">
                          {{ formatearFechaHora(p.fecha) }}
                        </span>
                      </div>
                      <div class="flex justify-between gap-2">
                        <span class="text-gray-500 dark:text-gray-400">{{ $t('history.paymentType') }}</span>
                        <span class="text-gray-900 dark:text-gray-100 font-medium">{{ p.tipo }}</span>
                      </div>
                      <div class="flex justify-between gap-2">
                        <span class="text-gray-500 dark:text-gray-400">{{ $t('history.paymentAmount') }}</span>
                        <span class="font-semibold text-gray-900 dark:text-white">${{ Number(p.valor || 0).toLocaleString() }}</span>
                      </div>
                      <div class="flex justify-between gap-2">
                        <span class="text-gray-500 dark:text-gray-400">{{ $t('payment.installmentCount') }}</span>
                        <span class="text-gray-800 dark:text-gray-200">{{ p.numParcelas != null ? p.numParcelas : '—' }}</span>
                      </div>
                      <div class="flex justify-between gap-2">
                        <span class="text-gray-500 dark:text-gray-400">{{ $t('history.balanceAfter') }}</span>
                        <span class="text-gray-800 dark:text-gray-200">${{ saldoDespuesRecalculado(venta, p).toFixed(2) }}</span>
                      </div>
                    </li>
                  </ul>
                  <div class="hidden md:block overflow-x-auto">
                    <table class="min-w-full text-sm">
                      <thead class="bg-neutral-100 dark:bg-slate-800 text-left">
                        <tr>
                          <th class="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">{{ $t('history.paymentDate') }}</th>
                          <th class="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">{{ $t('history.paymentType') }}</th>
                          <th class="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">{{ $t('history.paymentAmount') }}</th>
                          <th class="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">{{ $t('payment.installmentCount') }}</th>
                          <th class="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">{{ $t('history.balanceAfter') }}</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-neutral-200 dark:divide-slate-600">
                        <tr v-for="p in venta.pagos" :key="p._id" class="bg-white dark:bg-gray-800/50">
                          <td class="px-3 py-2 text-gray-800 dark:text-gray-200 whitespace-nowrap">{{ formatearFechaHora(p.fecha) }}</td>
                          <td class="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">{{ p.tipo }}</td>
                          <td class="px-3 py-2 font-semibold text-gray-900 dark:text-white">${{ Number(p.valor || 0).toLocaleString() }}</td>
                          <td class="px-3 py-2 text-gray-700 dark:text-gray-300">{{ p.numParcelas != null ? p.numParcelas : '—' }}</td>
                          <td class="px-3 py-2 text-gray-800 dark:text-gray-200 font-medium">${{ saldoDespuesRecalculado(venta, p).toFixed(2) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="px-4 py-3 border-t border-neutral-200 dark:border-slate-600 flex justify-end">
          <button
            type="button"
            @click="$emit('close')"
            class="px-5 py-2 rounded-lg font-semibold bg-neutral-700 dark:bg-slate-600 text-white hover:bg-neutral-800 dark:hover:bg-slate-500"
          >
            {{ $t('history.close') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  show: { type: Boolean, default: false },
  historial: { type: Object, default: null },
  refreshing: { type: Boolean, default: false }
})

defineEmits(['close'])

const { t } = useI18n()

/** Por ciclo: `id-índice` -> solo `true` = expandido; ausente/`false` = plegado (predeterminado) */
const ciclosHistorialVentasExpandidos = ref({})

watch(
  () => props.historial?._id,
  () => {
    ciclosHistorialVentasExpandidos.value = {}
  }
)

function keyCicloHistorialVenta(venta, vIdx) {
  return `${String(venta._id ?? 'x')}-${vIdx}`
}

function cicloHistorialVentaExpandido(venta, vIdx) {
  return ciclosHistorialVentasExpandidos.value[keyCicloHistorialVenta(venta, vIdx)] === true
}

function toggleCicloHistorialVenta(venta, vIdx) {
  const k = keyCicloHistorialVenta(venta, vIdx)
  const cur = ciclosHistorialVentasExpandidos.value[k]
  const next = cur === true ? false : true
  ciclosHistorialVentasExpandidos.value = { ...ciclosHistorialVentasExpandidos.value, [k]: next }
}

const ventasHistorialListaModal = computed(() => {
  const h = props.historial
  if (!h) return []
  return ventasHistorialPara(h)
})

function ventasHistorialPara(historial) {
  if (historial.ventasHistorial && historial.ventasHistorial.length > 0) {
    return historial.ventasHistorial
  }
  const c = historial.cliente
  if (!c) return []
  const pags = [...(historial.pagos || [])].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  return [{
    _id: c._id,
    createdAt: c.createdAt,
    valor: c.valor,
    total: c.total,
    saldo_inicial: c.saldo_inicial,
    parcela: c.parcela,
    dias: c.dias,
    estado: c.estado,
    cancelado: false,
    finalizadoPendiente: false,
    fechaFinalizacion: c.fechaFinalizacion,
    parcelasPagadas: c.parcelasPagadas,
    parcelasAtrasadas: c.parcelasAtrasadas,
    esUltimaVenta: true,
    pagos: pags
  }]
}

function formatearFecha(fecha) {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatearFechaHora(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
}

function visitasTotalesCiclo(venta) {
  if (!venta) return 0
  if (venta.visitas != null && venta.visitas !== '') {
    const n = Math.floor(Number(venta.visitas))
    return Number.isFinite(n) ? Math.max(0, n) : (venta.pagos || []).length
  }
  const h = props.historial
  if (h?.cliente) {
    const lista = ventasHistorialPara(h)
    if (lista.length === 1 && String(lista[0]._id) === String(venta._id)) {
      const v = h.cliente.visitas
      if (v != null && v !== '') {
        const n = Math.floor(Number(v))
        if (Number.isFinite(n)) return Math.max(0, n)
      }
    }
  }
  return (venta.pagos || []).length
}

function montoAplicadoAlSaldo(p) {
  if (!p) return 0
  if (p.tipo === 'No pago' || p.tipo === 'No aplica') return 0
  return Number(p.valor) || 0
}

function saldoInicialCiclo(venta) {
  if (!venta) return 0
  const s = venta.saldo_inicial ?? venta.total
  return Math.round((Number(s) || 0) * 100) / 100
}

function saldoDespuesRecalculado(venta, pago) {
  if (!venta || !pago) return 0
  const ordenados = [...(venta.pagos || [])].sort((a, b) => {
    const ta = new Date(a.fecha || 0).getTime()
    const tb = new Date(b.fecha || 0).getTime()
    if (ta !== tb) return ta - tb
    return String(a._id || '').localeCompare(String(b._id || ''))
  })
  let saldo = saldoInicialCiclo(venta)
  const targetId = String(pago._id || '')
  for (const p of ordenados) {
    const aplicado = montoAplicadoAlSaldo(p)
    saldo = Math.max(0, Math.round((saldo - aplicado) * 100) / 100)
    if (String(p._id || '') === targetId) return saldo
  }
  return saldo
}

function calcularParcelasAtrasadasDesdePagos(pagos, valorParcelaRaw) {
  if (!pagos || pagos.length === 0) return 0
  const valorParcela = parseFloat(valorParcelaRaw) || 1
  const pagosOrdenados = [...pagos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  let atrasos = 0
  let dias = 0
  for (const p of pagosOrdenados) {
    if (p.tipo === 'No pago') {
      atrasos += 1
      dias += 1
    } else if (p.tipo === 'No aplica') {
      // no cuenta
    } else if (p.tipo === 'Parcela') {
      dias += 1
      const pagadas = p.numParcelas || 1
      if (pagadas > 1) {
        atrasos = Math.max(0, atrasos - (pagadas - 1))
      }
    } else if (p.tipo === 'Abono') {
      const cuotasPagadas = Math.floor((Number(p.valor) || 0) / valorParcela)
      if (cuotasPagadas > 0) {
        if (dias === 0) {
          atrasos = Math.max(0, atrasos - cuotasPagadas)
        } else {
          atrasos = Math.max(0, atrasos - (cuotasPagadas - 1))
        }
        dias += 1
      }
    }
  }
  return atrasos
}
</script>
