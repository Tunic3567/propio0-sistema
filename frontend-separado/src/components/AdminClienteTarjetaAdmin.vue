<template>
  <div
    :id="cliente && cliente._id ? `admin-cliente-${cliente._id}` : undefined"
    :class="wrapperClass"
  >
    <div class="flex justify-end w-full mb-1.5 md:mb-2">
      <div class="flex items-center gap-2">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
        >
          {{ nombreVendedor }}
        </span>
        <span
          v-if="cliente.ocultoEnAdmin"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
        >
          Oculto
        </span>
      </div>
    </div>

    <div class="w-full min-w-0">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="flex-shrink-0 flex flex-col items-center rounded-xl p-1.5 md:p-2 -m-1 transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-slate-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800 focus-visible:ring-blue-600 dark:focus-visible:ring-white active:scale-[0.98] cliente-expand-toggle"
          @click.stop="$emit('toggle-desplegar')"
          :title="$t('common.expandCardHint')"
          :aria-expanded="desplegado ? 'true' : 'false'"
        >
          <div class="cliente-expand-icon-ring rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              :class="avatarToneClass"
            >
              <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="flex items-center gap-1 mt-1">
            <span class="text-xs text-neutral-800 dark:text-slate-200 font-semibold text-center">{{ desplegado ? $t('common.hide') : $t('common.showMore') }}</span>
            <svg class="w-4 h-4 text-neutral-500 dark:text-slate-400 flex-shrink-0 transition-transform duration-200" :class="{ 'rotate-180': desplegado }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-base md:text-lg text-gray-800 dark:text-gray-100">
            {{ cliente.nombres }} {{ cliente.apellidos }}
          </div>
          <div v-if="cliente.apodo" class="text-neutral-700 dark:text-slate-300 font-medium text-sm">({{ cliente.apodo }})</div>
        </div>
      </div>

      <div class="mt-2 md:mt-3 text-sm text-neutral-800 dark:text-slate-200 divide-y divide-neutral-300 dark:divide-slate-600">
        <div class="flex items-baseline justify-between py-0.5 md:py-1">
          <span class="font-bold text-neutral-900 dark:text-slate-100">{{ $t('client.sale') }}</span>
          <span class="text-black dark:text-white font-bold text-sm md:text-base">${{ cliente.valor }}</span>
        </div>
        <div class="flex items-baseline justify-between py-0.5 md:py-1">
          <span class="font-bold text-neutral-900 dark:text-slate-100">{{ $t('client.initialBalance') }}</span>
          <span class="text-black dark:text-white font-bold text-sm md:text-base">${{ saldoInicialMostrar(cliente) }}</span>
        </div>
        <div class="flex items-baseline justify-between py-0.5 md:py-1">
          <span class="font-bold text-neutral-900 dark:text-slate-100">{{ $t('client.remainingBalance') }}</span>
          <span class="text-black dark:text-white font-bold text-sm md:text-base">${{ cliente.total }}</span>
        </div>
        <div class="flex items-start justify-between gap-2 py-0.5 md:py-1">
          <span class="font-bold text-neutral-900 dark:text-slate-100 shrink-0">{{ $t('client.installmentValue') }}</span>
          <span class="flex min-w-0 flex-col items-end gap-0.5 text-right">
            <span class="inline-flex flex-wrap items-center justify-end gap-2 text-sm font-bold text-black dark:text-white md:text-base">
            <span
              v-if="esNuevoEnRuta"
              class="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold border bg-teal-50 text-teal-900 border-teal-400/45 dark:bg-teal-900/45 dark:text-teal-100 dark:border-teal-500/50"
              :title="$t('client.newBadgeTitle')"
            >
              {{ $t('client.newBadge') }}
            </span>
            <span
              v-if="esRenovadoEnRuta"
              class="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold border bg-blue-100 text-blue-900 border-blue-400/40 dark:bg-blue-900/55 dark:text-blue-100 dark:border-blue-500/50"
              :title="$t('client.renewedBadgeTitle')"
            >
              {{ $t('client.renewedBadge') }}
            </span>
            <span
              v-if="montoPagadoEnRutaAdmin(cliente) > 0"
              class="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold tabular-nums border bg-emerald-50 text-emerald-800 border-emerald-500/40 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700/50"
              :title="$t('client.paidThisRoute')"
            >
              ${{ formatNum(montoPagadoEnRutaAdmin(cliente), 2) }}
            </span>
            <span
              v-else-if="cliente.esNoPagoEnRutaActual"
              class="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold tabular-nums border bg-red-50 text-red-800 border-red-500/40 dark:bg-red-900/45 dark:text-red-200 dark:border-red-700/50"
              :title="$t('payment.types.noPayment')"
            >
              ${{ formatNum(0, 2) }}
            </span>
            <span>${{ valorParcelaTarjeta }}</span>
            </span>
            <span class="text-xs font-medium leading-tight text-neutral-700 dark:text-slate-300">({{ saldoInicialMostrar(cliente) }}/{{ cliente.dias != null && cliente.dias !== '' ? cliente.dias : '–' }} {{ $t('client.days') }})</span>
          </span>
        </div>

        <div v-if="desplegado" class="mt-2 border-t pt-2 text-sm text-neutral-800 dark:text-slate-200 divide-y divide-neutral-300 dark:divide-neutral-500">
          <div class="flex items-baseline justify-between py-1">
            <span class="font-bold text-neutral-900 dark:text-slate-100">{{ $t('client.pendingInstallments') }}</span>
            <span class="text-black dark:text-white font-bold text-base">{{ calcularParcelasPendientes(cliente) }}</span>
          </div>
          <div class="flex items-baseline justify-between py-1">
            <span class="font-bold text-neutral-900 dark:text-slate-100">{{ $t('client.overdueInstallments') }}</span>
            <span class="text-black dark:text-white font-bold text-base">{{ calcularParcelasAtrasadas(cliente) }}</span>
          </div>
          <div class="flex items-baseline justify-between py-1">
            <span class="font-bold text-neutral-900 dark:text-slate-100">{{ $t('client.visits') }}</span>
            <span class="text-black dark:text-white font-bold text-base">{{ cliente.visitas ?? 0 }}</span>
          </div>
          <div class="flex items-baseline justify-between py-1">
            <span class="font-bold text-neutral-900 dark:text-slate-100">{{ $t('client.id') }}</span>
            <span class="text-black dark:text-white font-bold text-base">{{ cliente.cc }}</span>
          </div>
          <div class="flex items-baseline justify-between py-1">
            <span class="font-bold text-neutral-900 dark:text-slate-100">{{ $t('client.loansWithUs') }}</span>
            <span class="text-black dark:text-white font-bold text-base">{{ cliente.vecesComoCliente ?? 1 }}</span>
          </div>

          <div v-if="cliente.direccion_residencial" class="py-2">
            <div class="flex items-center justify-between gap-2">
              <div class="flex-1 min-w-0">
                <span class="font-bold text-neutral-900 dark:text-neutral-100 block mb-1">{{ $t('address.residential') }}</span>
                <p class="text-sm text-neutral-700 dark:text-neutral-300">{{ resumirDireccion(cliente.direccion_residencial) }}</p>
              </div>
              <button
                type="button"
                @click.stop="$emit('mapa-residencial')"
                class="ml-1 px-3 py-1.5 border-2 border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 text-xs font-semibold rounded hover:bg-neutral-200 dark:hover:bg-slate-500 shadow-sm transition-colors flex items-center gap-1 flex-shrink-0"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ $t('address.viewOnMap') }}
              </button>
            </div>
          </div>
          <div v-if="cliente.direccion" class="py-2">
            <div class="flex items-center justify-between gap-2">
              <div class="flex-1 min-w-0">
                <span class="font-bold text-neutral-900 dark:text-neutral-100 block mb-1">{{ $t('address.commercial') }}</span>
                <p class="text-sm text-neutral-700 dark:text-neutral-300">{{ resumirDireccion(cliente.direccion) }}</p>
              </div>
              <button
                type="button"
                @click.stop="$emit('mapa-comercial')"
                class="ml-1 px-3 py-1.5 border-2 border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 text-xs font-semibold rounded hover:bg-neutral-200 dark:hover:bg-slate-500 shadow-sm transition-colors flex items-center gap-1 flex-shrink-0"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ $t('address.viewOnMap') }}
              </button>
            </div>
          </div>
          <div class="flex items-baseline justify-between py-1">
            <span class="font-bold text-neutral-900 dark:text-slate-100">{{ $t('client.phone') }}</span>
            <span class="text-black dark:text-white font-bold text-base">{{ cliente.celular }}</span>
          </div>
          <div class="flex items-baseline justify-between py-1">
            <span class="font-bold text-neutral-900 dark:text-slate-100">{{ $t('client.creationDate') }}</span>
            <span class="text-black dark:text-white font-bold text-base">{{ cliente.fecha || '–' }}</span>
          </div>

          <!-- Sin Historial aquí (está en la fila principal). Misma anchura en móvil: grid 3 columnas -->
          <div
            class="grid grid-cols-3 gap-1 sm:gap-2 pt-1.5 mt-1.5 md:pt-2 md:mt-2 border-t border-neutral-300 dark:border-slate-500 min-w-0 w-full"
          >
            <button
              type="button"
              @click.stop="$emit('pagos')"
              class="admin-collapsed-action-btn border border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 hover:bg-neutral-200 dark:hover:bg-slate-500"
            >
              <span class="admin-collapsed-action-inner">
                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <span class="admin-collapsed-action-label">{{ $t('client.viewPayments') }}</span>
              </span>
            </button>
            <button
              type="button"
              @click.stop="$emit('editar')"
              class="admin-collapsed-action-btn border border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 hover:bg-neutral-200 dark:hover:bg-slate-500"
            >
              <span class="admin-collapsed-action-inner">
                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                <span class="admin-collapsed-action-label">{{ $t('common.edit') }}</span>
              </span>
            </button>
            <button
              type="button"
              @click.stop="$emit('oculto')"
              class="admin-collapsed-action-btn border border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 hover:bg-neutral-200 dark:hover:bg-slate-500"
            >
              <span class="admin-collapsed-action-inner">
                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.042-3.368m3.1-2.4A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.293 5.094M15 12a3 3 0 00-4.243-2.829M9.88 9.88A3 3 0 0014.12 14.12M3 3l18 18" /></svg>
                <span class="admin-collapsed-action-label">
                  {{ cliente.ocultoEnAdmin ? 'mostrar/eliminar' : 'ocultar/eliminar' }}
                </span>
              </span>
            </button>
          </div>
        </div>

        <!-- Tres botones en fila (sin márgenes negativos: evitan scroll horizontal en móvil) -->
        <div
          class="admin-card-actions-row grid grid-cols-3 gap-1 sm:gap-1.5 pt-2 mt-2 md:pt-3 md:mt-3 border-t border-gray-200 dark:border-gray-600 items-stretch w-full min-w-0"
        >
          <button
            type="button"
            @click.stop="$emit('pagos')"
            class="admin-card-action-btn flex flex-col items-center justify-center gap-0.5 md:gap-1 w-full min-w-0 min-h-[3.1rem] sm:min-h-[3.35rem] md:min-h-[4rem] px-1 py-2 sm:px-2 sm:py-3 rounded-xl text-xs font-semibold box-border transition-all btn-primary-min"
          >
            <svg class="w-[1.15rem] h-[1.15rem] sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="action-btn-label">{{ $t('client.payment') }}</span>
          </button>
          <button
            type="button"
            @click.stop="$emit('historial')"
            class="admin-card-action-btn flex flex-col items-center justify-center gap-0.5 md:gap-1 w-full min-w-0 min-h-[3.1rem] sm:min-h-[3.35rem] md:min-h-[4rem] px-1 py-2 sm:px-2 sm:py-3 rounded-xl border border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-slate-500 shadow-sm transition-colors box-border"
          >
            <svg class="w-[1.15rem] h-[1.15rem] sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="action-btn-label">{{ $t('history.button') }}</span>
          </button>
          <a
            :href="'tel:' + (cliente.celular || '').replace(/\s/g, '')"
            class="admin-card-action-btn flex flex-col items-center justify-center gap-0.5 md:gap-1 w-full min-w-0 min-h-[3.1rem] sm:min-h-[3.35rem] md:min-h-[4rem] px-1 py-2 sm:px-2 sm:py-3 rounded-xl border border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-slate-500 shadow-sm transition-colors box-border no-underline"
            @click.stop
          >
            <svg class="w-[1.15rem] h-[1.15rem] sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span class="action-btn-label">{{ $t('client.call') }}</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cliente: { type: Object, required: true },
  cardIndex: { type: Number, default: 0 },
  /** 'sin' = colores por mora; 'con' = borde cielo como panel asesor */
  variant: { type: String, default: 'sin' },
  desplegado: { type: Boolean, default: false },
  /** Nombre del asesor (prop legacy: nombreVendedor) */
  nombreVendedor: { type: String, default: '–' },
  /** Mismo criterio que resumen "Nuevos": creado en ruta actual, no renovado, no cancelado */
  esNuevoEnRuta: { type: Boolean, default: false },
  /** Mismo criterio que resumen "Renovados": alta en esta ruta con flag renovado, no cancelado */
  esRenovadoEnRuta: { type: Boolean, default: false }
})

const formatNum = (n, dec = 2) => {
  const num = Number(n) || 0
  return num.toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

/** Con "No pago" en la ruta, mismo criterio que vendedor: mostrar 0 junto al badge rojo */
const valorParcelaTarjeta = computed(() => {
  const c = props.cliente
  if (c?.esNoPagoEnRutaActual) return formatNum(0, 2)
  return c?.parcela
})

defineEmits(['toggle-desplegar', 'pagos', 'editar', 'oculto', 'mapa-residencial', 'mapa-comercial', 'historial'])

function resumirDireccion(direccionCompleta) {
  if (!direccionCompleta) return ''
  const partes = String(direccionCompleta).split(',').map(p => p.trim())
  if (partes.length <= 3) return String(direccionCompleta)
  if (partes[0].length > 50) return partes.slice(0, 2).join(', ')
  return partes.slice(0, 3).join(', ')
}

function saldoInicialMostrar(c) {
  if (c == null) return '–'
  const s = c.saldo_inicial
  if (s != null && s !== '') return s
  return c.total ?? '–'
}

function calcularParcelasPendientes(c) {
  const parcela = Number(c.parcela) || 0
  if (parcela <= 0) return 0
  const pendiente = Number(c.total) || 0
  return Math.ceil(pendiente / parcela)
}

function calcularParcelasAtrasadas(c) {
  return Number(c.parcelasAtrasadas) || 0
}

const avatarToneClass = computed(() => {
  const c = props.cliente
  const a = calcularParcelasAtrasadas(c)
  return [
    'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
    a >= 6 ? 'text-red-500 dark:text-red-400' : a >= 4 ? 'text-yellow-500 dark:text-yellow-400' : 'text-emerald-500 dark:text-emerald-400'
  ]
})

function montoPagadoEnRutaAdmin(c) {
  const monto = Number(c.montoPagadoEnRutaActual ?? c.montoPagadoRutaActual ?? c.montoPagadoRuta ?? 0)
  if (!isFinite(monto)) return 0
  return monto
}

const wrapperClass = computed(() => {
  const i = props.cardIndex
  const c = props.cliente
  const base = [
    'flex flex-col items-start rounded-lg border-2 border-neutral-300 dark:border-slate-600/80 p-2 sm:p-2.5 md:p-3 cursor-pointer shadow-sm hover:shadow-md transition-shadow min-w-0',
    i % 2 === 0 ? 'bg-white dark:bg-slate-800/60' : 'bg-neutral-50 dark:bg-slate-800/50'
  ]
  if (props.variant === 'con') {
    return [...base, 'border-l-4 border-l-sky-500 dark:border-l-sky-400']
  }
  const a = calcularParcelasAtrasadas(c)
  const left =
    a >= 6 ? 'border-l-[4px] border-l-red-500 dark:border-l-red-400' : a >= 4 ? 'border-l-[4px] border-l-yellow-500 dark:border-l-yellow-400' : 'border-l-[4px] border-l-emerald-500 dark:border-l-emerald-400'
  return [...base, left]
})
</script>

<style scoped>
/* Una sola línea de texto; sin partir palabras (evita "Pag/o", "Histori/al") */
.action-btn-label {
  display: block;
  width: 100%;
  max-width: 100%;
  padding: 0 1px;
  text-align: center;
  line-height: 1.15;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: -0.04em;
  font-size: clamp(0.625rem, 2.85vw, 0.8125rem);
}
.admin-card-actions-row {
  min-width: 0;
}
.admin-card-action-btn {
  -webkit-tap-highlight-color: transparent;
}

/* Botones del área plegable: grid homogéneo; icono+texto centrados como bloque */
.admin-collapsed-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 3.35rem;
  width: 100%;
  min-width: 0;
  padding: 0.3rem 0.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}
.admin-collapsed-action-inner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  min-width: 0;
  max-width: 100%;
}
@media (min-width: 640px) {
  .admin-collapsed-action-btn {
    min-height: 2.85rem;
    padding: 0.45rem 0.5rem;
  }
  .admin-collapsed-action-inner {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
  }
}
@media (max-width: 767px) {
  .admin-collapsed-action-btn {
    min-height: 2.55rem;
    padding: 0.18rem 0.15rem;
  }
}
.admin-collapsed-action-label {
  display: block;
  max-width: 100%;
  text-align: center;
  font-size: clamp(0.55rem, 2.65vw, 0.6875rem);
  line-height: 1.15;
  letter-spacing: -0.03em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (min-width: 640px) {
  .admin-collapsed-action-label {
    font-size: 0.75rem;
    text-align: center;
  }
}

/* Pulso del ícono “Ver más” (misma idea que AdminDashboard / VendedorDashboard) */
.cliente-expand-icon-ring {
  padding: 2px;
  border: 2px solid rgb(107 114 128 / 0.85);
  animation: cliente-expand-pulse-light 3.1s ease-in-out infinite;
  position: relative;
  isolation: isolate;
}
:global(.dark) .cliente-expand-icon-ring {
  border-color: rgb(203 213 225 / 0.75);
  animation-name: cliente-expand-pulse-dark;
}
.cliente-expand-icon-ring::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 9999px;
  pointer-events: none;
  border: 2px solid rgb(107 114 128 / 0.55);
  opacity: 0;
  transform: scale(1);
  animation: cliente-expand-ring-light 3.1s ease-in-out infinite;
  will-change: transform, opacity;
  z-index: 0;
}
.cliente-expand-icon-ring > svg {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 0 10px rgb(107 114 128 / 0.22));
}
:global(.dark) .cliente-expand-icon-ring > svg {
  filter: drop-shadow(0 0 12px rgb(203 213 225 / 0.18));
}
:global(.dark) .cliente-expand-icon-ring::after {
  border-color: rgb(203 213 225 / 0.45);
  animation-name: cliente-expand-ring-dark;
}
@keyframes cliente-expand-pulse-light {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgb(107 114 128 / 0.35);
  }
  50% {
    box-shadow: 0 0 0 14px rgb(107 114 128 / 0);
  }
}
@keyframes cliente-expand-pulse-dark {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgb(203 213 225 / 0.28);
  }
  50% {
    box-shadow: 0 0 0 16px rgb(203 213 225 / 0);
  }
}
@keyframes cliente-expand-ring-light {
  0%,
  100% {
    opacity: 0;
    transform: scale(1);
  }
  45% {
    opacity: 0.9;
  }
  55% {
    opacity: 0;
    transform: scale(1.3);
  }
}
@keyframes cliente-expand-ring-dark {
  0%,
  100% {
    opacity: 0;
    transform: scale(1);
  }
  45% {
    opacity: 0.85;
  }
  55% {
    opacity: 0;
    transform: scale(1.35);
  }
}
.cliente-expand-toggle:hover .cliente-expand-icon-ring {
  border-color: rgb(30 41 59 / 0.75);
}
:global(.dark) .cliente-expand-toggle:hover .cliente-expand-icon-ring {
  border-color: rgb(255 255 255 / 0.95);
}
@media (pointer: fine) {
  .cliente-expand-icon-ring {
    animation-name: cliente-expand-pulse-light-desktop;
  }
  :global(.dark) .cliente-expand-icon-ring {
    animation-name: cliente-expand-pulse-dark-desktop;
  }
}
@keyframes cliente-expand-pulse-light-desktop {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgb(15 23 42 / 0.22);
  }
  50% {
    box-shadow: 0 0 0 10px rgb(15 23 42 / 0);
  }
}
@keyframes cliente-expand-pulse-dark-desktop {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgb(255 255 255 / 0.26);
  }
  50% {
    box-shadow: 0 0 0 12px rgb(255 255 255 / 0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .cliente-expand-icon-ring {
    animation: none;
  }
  .cliente-expand-icon-ring::after {
    animation: none;
  }
}
</style>
