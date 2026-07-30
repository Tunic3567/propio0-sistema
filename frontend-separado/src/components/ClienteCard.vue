<template>
  <div
    :class="[
      'flex flex-col items-start rounded-lg border-2 border-neutral-300 dark:border-slate-600/80 border-l-[4px] p-2 sm:p-2.5 md:p-3 cursor-pointer shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-800/60 min-w-0',
      index % 2 === 0 ? 'bg-white dark:bg-slate-800/60' : 'bg-neutral-50 dark:bg-slate-800/50',
      calcularParcelasAtrasadas(cliente) >= 6
        ? 'border-l-red-500 dark:border-l-red-400'
        : calcularParcelasAtrasadas(cliente) >= 4
        ? 'border-l-yellow-500 dark:border-l-yellow-400'
        : 'border-l-emerald-500 dark:border-l-emerald-400'
    ]"
  >
    <div class="w-full min-w-0">
      <div class="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          :class="[
            'flex-shrink-0 flex flex-col items-center rounded-xl p-1.5 md:p-2 -m-1 transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-slate-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800 active:scale-[0.98] cliente-expand-toggle',
            calcularParcelasAtrasadas(cliente) >= 6
              ? 'focus-visible:ring-red-600 dark:focus-visible:ring-white'
              : calcularParcelasAtrasadas(cliente) >= 4
              ? 'focus-visible:ring-yellow-600 dark:focus-visible:ring-white'
              : 'focus-visible:ring-emerald-600 dark:focus-visible:ring-white'
          ]"
          @click.stop="desplegado = !desplegado"
          :title="t('common.expandCardHint')"
          :aria-expanded="desplegado ? 'true' : 'false'"
        >
          <div class="cliente-expand-icon-ring rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
              :class="[
                'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
                calcularParcelasAtrasadas(cliente) >= 6
                  ? 'text-red-500 dark:text-red-400'
                  : calcularParcelasAtrasadas(cliente) >= 4
                  ? 'text-yellow-500 dark:text-yellow-400'
                  : 'text-emerald-500 dark:text-emerald-400'
              ]"
            >
              <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="flex items-center gap-1 mt-1">
            <span class="text-xs text-neutral-800 dark:text-slate-200 font-semibold text-center">{{ desplegado ? t('common.hide') : t('common.showMore') }}</span>
            <svg class="w-4 h-4 text-neutral-500 dark:text-slate-400 flex-shrink-0 transition-transform duration-200" :class="{ 'rotate-180': desplegado }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </button>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-base md:text-lg text-gray-800 dark:text-gray-100">{{ cliente.nombres }} {{ cliente.apellidos }}</div>
          <div v-if="cliente.apodo" class="text-neutral-700 dark:text-slate-300 font-medium text-sm">({{ cliente.apodo }})</div>
        </div>
      </div>
      <div class="mt-2 md:mt-3 text-sm text-neutral-800 dark:text-slate-200 divide-y divide-neutral-300 dark:divide-slate-600">
        <div class="flex items-baseline justify-between py-0.5 md:py-1">
          <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.sale') }}</span>
          <span class="text-black dark:text-white font-bold text-sm md:text-base">${{ cliente.valor }} ({{ cliente.dias }} días)</span>
        </div>
        <div class="flex items-baseline justify-between py-0.5 md:py-1">
          <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.initialBalance') }}</span>
          <span class="text-black dark:text-white font-bold text-sm md:text-base">${{ cliente.saldo_inicial }}</span>
        </div>
        <div class="flex items-baseline justify-between py-0.5 md:py-1">
          <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.remainingBalance') }}</span>
          <span class="text-black dark:text-white font-bold text-sm md:text-base">${{ cliente.total }}</span>
        </div>
        <div class="flex items-start justify-between gap-2 py-0.5 md:py-1">
          <span class="shrink-0 font-bold text-neutral-900 dark:text-slate-100">{{ t('client.installmentValue') }}</span>
          <span class="flex min-w-0 flex-col items-end gap-0.5 text-right">
            <span class="inline-flex flex-wrap items-center justify-end gap-2 text-sm font-bold text-black dark:text-white md:text-base">
              <span v-if="cliente.frecuencia && cliente.frecuencia.toLowerCase() !== 'diaria'"
                class="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold border"
                :class="{
                  'bg-indigo-50 text-indigo-900 border-indigo-400/45 dark:bg-indigo-900/45 dark:text-indigo-100 dark:border-indigo-500/50': cliente.frecuencia.toLowerCase() === 'semanal',
                  'bg-cyan-50 text-cyan-900 border-cyan-400/45 dark:bg-cyan-900/45 dark:text-cyan-100 dark:border-cyan-500/50': cliente.frecuencia.toLowerCase() === 'quincenal',
                  'bg-amber-50 text-amber-900 border-amber-400/45 dark:bg-amber-900/45 dark:text-amber-100 dark:border-amber-500/50': cliente.frecuencia.toLowerCase() === 'mensual'
                }">
                {{ cliente.frecuencia }}
              </span>
              <span v-if="cliente.finalizadoPendiente === true"
                class="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold border bg-red-100 text-red-900 border-red-400/50 dark:bg-red-900/60 dark:text-red-100 dark:border-red-500/60"
                title="Este cliente finalizó su pago en esta ruta">
                Finalizado
              </span>
              <span v-if="montoPagado > 0"
                class="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold tabular-nums border bg-emerald-50 text-emerald-800 border-emerald-500/40 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700/50"
                :title="t('client.paidThisRoute')">
                ${{ formatNum(montoPagado, 2) }}
              </span>
              <span>${{ valorParcelaVisible }}</span>
            </span>
          </span>
        </div>
        <div v-if="desplegado" class="mt-1 border-t pt-1 text-sm text-neutral-800 dark:text-slate-200 divide-y divide-neutral-300 dark:divide-neutral-500">
          <div class="flex items-baseline justify-between py-1">
            <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.installmentsPaid') }}</span>
            <span class="text-black dark:text-white font-bold text-base">{{ calcularParcelasPagadas(cliente) }}</span>
          </div>
          <div class="flex items-baseline justify-between py-1">
            <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.pendingInstallments') }}</span>
            <span class="text-black dark:text-white font-bold text-base">{{ calcularParcelasPendientes(cliente) }}</span>
          </div>
          <div class="flex items-baseline justify-between py-1">
            <div class="flex items-center gap-4">
              <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.overdueInstallments') }}</span>
              <span class="text-black dark:text-white font-bold">{{ calcularParcelasAtrasadas(cliente) }}</span>
              <span class="text-neutral-400 dark:text-neutral-500">|</span>
              <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.visits') || 'Visitas' }}</span>
              <span class="text-black dark:text-white font-bold">{{ cliente.visitas ?? 0 }}</span>
            </div>
          </div>
          <div class="flex items-baseline justify-between py-1">
            <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.id') }}</span>
            <span class="text-black dark:text-white font-bold text-base">{{ cliente.cc }}</span>
          </div>
          <div class="flex items-baseline justify-between py-1">
            <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.residentialAddress') }}</span>
            <span class="text-black dark:text-white font-bold text-base text-right">{{ resumirDireccion(cliente.direccion_residencial) }}</span>
          </div>
          <div class="flex items-baseline justify-between py-1">
            <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.commercialAddress') }}</span>
            <span class="text-black dark:text-white font-bold text-base text-right">{{ resumirDireccion(cliente.direccion) }}</span>
          </div>
          <div class="flex items-baseline justify-between py-1">
            <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.phone') }}</span>
            <span class="text-black dark:text-white font-bold text-base">{{ cliente.celular }}</span>
          </div>
          <div class="flex items-baseline justify-between py-1">
            <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.creationDate') }}</span>
            <span class="text-black dark:text-white font-bold text-base">{{ cliente.fecha }}</span>
          </div>
          <div class="grid grid-cols-3 gap-1 sm:gap-2 pt-1 mt-1 md:pt-1.5 md:mt-1.5 border-t border-neutral-300 dark:border-slate-500 min-w-0 w-full">
            <button type="button" @click.stop="$emit('verPagos', cliente)"
              class="vendedor-secondary-action-btn border border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 hover:bg-neutral-200 dark:hover:bg-slate-500">
              <span class="vendedor-secondary-action-inner">
                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <span class="vendedor-secondary-action-label">{{ t('client.viewPayments') }}</span>
              </span>
            </button>
            <button type="button" @click.stop="$emit('editarPago', cliente)"
              class="vendedor-secondary-action-btn border border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 hover:bg-neutral-200 dark:hover:bg-slate-500">
              <span class="vendedor-secondary-action-inner">
                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <span class="vendedor-secondary-action-label">{{ t('client.editPayment') }}</span>
              </span>
            </button>
            <button type="button" @click.stop="$emit('reportar', cliente)"
              class="vendedor-secondary-action-btn border border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 hover:bg-neutral-200 dark:hover:bg-slate-500">
              <span class="vendedor-secondary-action-inner">
                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span class="vendedor-secondary-action-label">{{ t('client.report') }}</span>
              </span>
            </button>
            <button type="button" @click.stop="$emit('editarCliente', cliente)"
              class="vendedor-secondary-action-btn border border-amber-300 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50">
              <span class="vendedor-secondary-action-inner">
                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <span class="vendedor-secondary-action-label">Editar</span>
              </span>
            </button>
            <button type="button" @click.stop="$emit('eliminarCliente', cliente)"
              class="vendedor-secondary-action-btn border border-red-300 dark:border-red-500/50 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/50">
              <span class="vendedor-secondary-action-inner">
                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                <span class="vendedor-secondary-action-label">Eliminar</span>
              </span>
            </button>
          </div>
          <button v-if="pagoEnRuta" type="button" @click.stop="$emit('eliminarPago', { cliente, pago: pagoEnRuta })"
            class="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-red-300 dark:border-red-400/50 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Eliminar pago en ruta
          </button>
        </div>
        <div class="grid grid-cols-3 gap-1 sm:gap-1.5 pt-2 mt-2 md:pt-3 md:mt-3 border-t border-gray-200 dark:border-gray-600 items-stretch w-full min-w-0">
          <button type="button" @click.stop="$emit('pagar', cliente)"
            class="flex flex-col items-center justify-center gap-0.5 md:gap-1 w-full min-w-0 min-h-[3.1rem] px-1 py-2 sm:min-h-[3.35rem] md:min-h-[4rem] sm:px-2 sm:py-3 rounded-xl text-xs font-semibold box-border transition-all btn-primary-min">
            <svg class="w-[1.15rem] h-[1.15rem] sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span class="vendedor-primary-action-label">{{ t('client.payment') }}</span>
          </button>
          <button type="button" @click.stop="$emit('historial', cliente)"
            class="flex flex-col items-center justify-center gap-0.5 md:gap-1 w-full min-w-0 min-h-[3.1rem] px-1 py-2 sm:min-h-[3.35rem] md:min-h-[4rem] sm:px-2 sm:py-3 rounded-xl border border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-slate-500 shadow-sm transition-colors box-border">
            <svg class="w-[1.15rem] h-[1.15rem] sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span class="vendedor-primary-action-label">{{ t('history.button') }}</span>
          </button>
          <button type="button" @click.stop="$emit('llamar', cliente)"
            class="flex flex-col items-center justify-center gap-0.5 md:gap-1 w-full min-w-0 min-h-[3.1rem] px-1 py-2 sm:min-h-[3.35rem] md:min-h-[4rem] sm:px-2 sm:py-3 rounded-xl border-2 border-blue-300 dark:border-slate-400 bg-blue-50 dark:bg-slate-600 text-blue-900 dark:text-slate-100 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-slate-500 shadow-sm transition-colors box-border">
            <svg class="w-[1.15rem] h-[1.15rem] sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            <span class="vendedor-primary-action-label">{{ t('client.call') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  cliente: { type: Object, required: true },
  index: { type: Number, default: 0 },
  pagosIndex: { type: Object, default: () => ({ pagosPorClienteRuta: new Set(), montoPorClienteRuta: new Map(), pagosPorClienteIdMap: new Map() }) },
  rutasPorVendedor: { type: Object, default: () => ({}) },
  pagoEnRuta: { type: Object, default: null }
})

const emit = defineEmits(['pagar', 'historial', 'llamar', 'verPagos', 'editarPago', 'reportar', 'eliminarPago', 'editarCliente', 'eliminarCliente'])

const { t } = useI18n()
const desplegado = ref(false)

function formatNum(n, dec = 2) {
  const num = Number(n)
  if (!isFinite(num)) return (0).toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec })
  return num.toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

function resumirDireccion(dir) {
  if (!dir) return ''
  const partes = dir.split(',').map(p => p.trim())
  if (partes.length <= 3) return dir
  if (partes[0].length > 50) return partes.slice(0, 2).join(', ')
  return partes.slice(0, 3).join(', ')
}

function getVendorId(cliente) {
  if (!cliente.vendedor) return null
  if (typeof cliente.vendedor === 'object') return String(cliente.vendedor._id || cliente.vendedor)
  return String(cliente.vendedor)
}

function getRutaId(cliente) {
  const vid = getVendorId(cliente)
  if (!vid) return null
  const ruta = props.rutasPorVendedor[vid]
  return ruta ? String(ruta._id) : null
}

const montoPagado = computed(() => {
  const cid = String(props.cliente?._id || '')
  const rid = getRutaId(props.cliente)
  if (!rid) return 0
  const key = `${cid}|${rid}`
  return props.pagosIndex.montoPorClienteRuta.get(key) || 0
})

const valorParcelaVisible = computed(() => {
  const cid = String(props.cliente?._id || '')
  const rid = getRutaId(props.cliente)
  if (rid) {
    const key = `${cid}|${rid}`
    const pagosCliente = props.pagosIndex.pagosPorClienteIdMap.get(cid) || []
    const pagosEnRuta = pagosCliente.filter(p => {
      const pr = typeof p.ruta === 'object' ? p.ruta?._id : p.ruta
      return String(pr) === rid
    })
    const sorted = [...pagosEnRuta].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    if (sorted.length > 0 && String(sorted[0]?.tipo || '').trim().toLowerCase() === 'no pago') {
      return formatNum(0, 2)
    }
  }
  return props.cliente.parcela
})

function calcularParcelasAtrasadas(cliente) {
  const idCli = String(cliente?._id || '')
  const pagosCliente = props.pagosIndex.pagosPorClienteIdMap.get(idCli) || []
  if (!pagosCliente.length) return 0
  let atrasos = 0
  let dias = 0
  const valorParcela = parseFloat(cliente.parcela) || 1
  for (const p of pagosCliente) {
    const tipo = String(p?.tipo || '').trim().toLowerCase()
    if (tipo === 'no pago') { atrasos += 1; dias += 1 }
    else if (tipo === 'parcela') {
      dias += 1
      const pagadas = p.numParcelas || 1
      if (pagadas > 1) atrasos = Math.max(0, atrasos - (pagadas - 1))
    } else if (tipo === 'abono') {
      const cuotasPagadas = Math.floor((p.valor || 0) / valorParcela)
      if (cuotasPagadas > 0) {
        if (dias === 0) atrasos = Math.max(0, atrasos - cuotasPagadas)
        else atrasos = Math.max(0, atrasos - (cuotasPagadas - 1))
        dias += 1
      }
    }
  }
  return atrasos
}

function calcularParcelasPagadas(cliente) {
  const parcela = parseFloat(cliente.parcela) || 0
  if (parcela <= 0) return 0
  const saldoInicial = parseFloat(cliente.saldo_inicial) || 0
  const pendiente = parseFloat(cliente.total) || 0
  if (saldoInicial <= 0) return 0
  const totalParcelas = Math.ceil(saldoInicial / parcela)
  const pendientes = Math.ceil(pendiente / parcela)
  return Math.max(0, totalParcelas - pendientes)
}

function calcularParcelasPendientes(cliente) {
  const saldo = parseFloat(cliente.total) || 0
  const parcela = parseFloat(cliente.parcela) || 1
  return parcela > 0 ? Math.round(saldo / parcela) : 0
}
</script>
