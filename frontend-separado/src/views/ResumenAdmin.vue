<template>
  <!-- Altura = viewport; sin scroll en el documento; columnas con scroll interno -->
  <div
    class="h-dvh max-h-dvh min-h-0 w-full max-w-full overflow-x-clip overflow-y-hidden overscroll-none flex flex-col bg-neutral-50 dark:bg-slate-900 transition-theme"
  >
    <NavbarAdmin class="shrink-0" @logout="logout" />
    <div class="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
      <!-- Menú lateral izquierdo: país / ciudad / asesor -->
      <div
        class="w-full md:w-72 lg:w-80 shrink-0 md:shrink-0 min-h-0 max-h-[min(48vh,26rem)] md:max-h-none md:h-full flex flex-col bg-white dark:bg-slate-800 border-b md:border-b-0 md:border-r-2 border-neutral-200 dark:border-slate-600 overflow-y-auto overscroll-contain transition-theme"
      >
        <div class="flex flex-col flex-1 w-full md:min-h-full py-6 px-4 md:px-5 md:py-8">
          <div class="flex flex-col gap-5 md:gap-6 flex-1">
            <div v-if="arbolPorUbicacion.length === 0" class="text-neutral-500 dark:text-slate-400 italic text-base md:text-lg leading-relaxed">
              {{ $t('admin.noVendors') }}
            </div>
            <div v-for="nodoPais in arbolPorUbicacion" :key="nodoPais.key" class="flex flex-col gap-2 md:gap-3">
              <button
                type="button"
                class="flex items-center gap-3 md:gap-3.5 rounded-xl px-2 py-3 md:py-3.5 text-left w-full min-w-0 text-xl md:text-2xl font-bold tracking-tight text-neutral-800 dark:text-slate-100 hover:bg-neutral-100/90 dark:hover:bg-slate-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                @click="togglePais(nodoPais.key)"
              >
                <GlobeAltIcon class="w-8 h-8 md:w-9 md:h-9 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                <span class="truncate min-w-0 leading-snug">{{ nodoPais.label }}</span>
                <ChevronDownIcon
                  :class="{ 'transform rotate-180': isPaisOpen(nodoPais.key) }"
                  class="w-6 h-6 md:w-7 md:h-7 ml-auto flex-shrink-0 transition-transform text-neutral-600 dark:text-slate-300"
                />
              </button>
              <div
                v-show="isPaisOpen(nodoPais.key)"
                class="ml-1 md:ml-2 mt-1 flex flex-col gap-3 md:gap-4 border-l-2 border-neutral-200 dark:border-slate-600 pl-4 md:pl-5"
              >
                <div v-for="nodoCiudad in nodoPais.ciudades" :key="nodoCiudad.key" class="flex flex-col gap-2">
                  <button
                    type="button"
                    class="flex items-center gap-3 rounded-xl px-2 py-2.5 md:py-3 text-left w-full min-w-0 text-lg md:text-xl font-semibold text-neutral-700 dark:text-slate-200 hover:bg-neutral-100/90 dark:hover:bg-slate-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                    @click="toggleCiudad(nodoCiudad.key)"
                  >
                    <BuildingOffice2Icon class="w-7 h-7 md:w-8 md:h-8 text-green-500 dark:text-green-400 flex-shrink-0" />
                    <span class="truncate min-w-0 leading-snug">{{ nodoCiudad.label }}</span>
                    <ChevronDownIcon
                      :class="{ 'transform rotate-180': isCiudadOpen(nodoCiudad.key) }"
                      class="w-5 h-5 md:w-6 md:h-6 ml-auto flex-shrink-0 transition-transform text-neutral-500 dark:text-slate-400"
                    />
                  </button>
                  <div v-show="isCiudadOpen(nodoCiudad.key)" class="ml-0 flex flex-col gap-1.5 md:gap-2">
                    <button
                      v-for="v in nodoCiudad.vendedores"
                      :key="v._id"
                      type="button"
                      class="cursor-pointer flex items-center gap-3 rounded-xl px-3 py-3 md:py-3.5 text-left min-w-0 text-base md:text-lg font-medium text-neutral-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700/60 hover:text-neutral-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                      @click="seleccionarVendedor(v)"
                    >
                      <UserIcon class="w-6 h-6 md:w-7 md:h-7 text-neutral-500 dark:text-slate-400 flex-shrink-0" />
                      <span class="truncate leading-snug">{{ v.nombre }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel derecho: resumen del asesor -->
      <div
        ref="resumenAdminMainScrollEl"
        class="flex-1 min-h-0 bg-neutral-50 dark:bg-neutral-900/50 p-4 md:p-8 md:border-l border-neutral-200 dark:border-neutral-800 overflow-y-auto overscroll-contain transition-theme"
      >
        <transition name="fade">
          <div v-if="vendedorSeleccionado">
            <div class="flex justify-end gap-2 mb-2">
              <button
                @click="actualizarPanel"
                class="text-neutral-400 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                :title="$t('admin.update')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582M20 20v-5h-.581M5.582 9A7.974 7.974 0 0112 4c2.042 0 3.899.767 5.318 2.018M18.418 15A7.974 7.974 0 0112 20a7.974 7.974 0 01-5.318-2.018" />
                </svg>
              </button>
            </div>

            <h2 class="text-lg font-bold mb-3 flex items-center gap-2 text-neutral-900 dark:text-slate-100">
              <UserIcon class="w-6 h-6 text-blue-500 dark:text-blue-400" />
              {{ resumenPanel?.vendedor?.nombre || vendedorSeleccionado.nombre }}
            </h2>

            <!-- Selector de historial de rutas (desplegable con columnas Apertura / Cierre) -->
            <div
              v-if="resumenPanel && (resumenPanel?.rutasDisponibles?.length || 0) > 0"
              ref="rutasDropdownRoot"
              class="mb-3 flex flex-wrap items-start gap-3"
            >
              <label class="text-sm font-semibold text-neutral-800 dark:text-slate-200 shrink-0 pt-2">{{ $t('admin.routes') }}:</label>
              <div class="relative flex-1 min-w-[min(100%,18rem)] max-w-2xl">
                <button
                  type="button"
                  class="w-full flex items-center justify-between gap-2 border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100"
                  @click.stop="rutasDropdownAbierto = !rutasDropdownAbierto"
                >
                  <span class="truncate font-mono tabular-nums text-xs sm:text-sm">{{ etiquetaRutaSeleccionada }}</span>
                  <ChevronDownIcon
                    class="w-5 h-5 flex-shrink-0 text-neutral-500 dark:text-slate-400 transition-transform"
                    :class="{ 'rotate-180': rutasDropdownAbierto }"
                  />
                </button>
                <div
                  v-show="rutasDropdownAbierto"
                  class="absolute z-50 left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-xl border-2 border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl py-1"
                  @click.stop
                >
                  <button
                    v-for="r in resumenPanel.rutasDisponibles"
                    :key="r._id"
                    type="button"
                    class="w-full px-3 py-2.5 text-left border-t border-neutral-200 dark:border-slate-600 first:border-t-0 hover:bg-neutral-100 dark:hover:bg-slate-700/80 transition-colors"
                    :class="String(rutaSeleccionadaId) === String(r._id) ? 'bg-blue-50/90 dark:bg-slate-700 ring-1 ring-inset ring-blue-200 dark:ring-blue-900/50' : ''"
                    @click="seleccionarRutaDropdown(r._id)"
                  >
                    <div class="grid grid-cols-2 gap-3 text-left">
                      <div class="min-w-0">
                        <div class="text-[0.65rem] font-bold uppercase tracking-wide text-green-600 dark:text-green-400 mb-0.5">
                          {{ $t('admin.routeOpening') }}:
                        </div>
                        <div class="text-xs sm:text-sm font-mono tabular-nums font-semibold text-green-800 dark:text-green-300 break-words">
                          {{ formatFechaRutaSelect(r.fechaApertura) }}
                        </div>
                      </div>
                      <div class="min-w-0">
                        <div class="text-[0.65rem] font-bold uppercase tracking-wide text-red-600 dark:text-red-400 mb-0.5">
                          {{ $t('admin.routeClosing') }}:
                        </div>
                        <div
                          class="text-xs sm:text-sm font-mono tabular-nums font-semibold text-red-800 dark:text-red-300 break-words"
                        >
                          {{ r.fechaCierre ? formatFechaRutaSelect(r.fechaCierre) : $t('route.notClosed') }}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="resumenPanel" class="space-y-2">
              <!-- Fecha apertura -->
              <div class="flex items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
                <CalendarDaysIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Fecha apertura recaudo:</span>
                <span v-if="resumenPanel.ruta?.fechaApertura" class="inline-flex items-center px-3 py-1.5 rounded-lg text-[0.9375rem] font-semibold tabular-nums bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:border dark:border-slate-600">
                  {{ new Date(resumenPanel.ruta.fechaApertura).toLocaleString('es-ES') }}
                </span>
                <span v-else class="inline-flex items-center px-3 py-1.5 rounded-lg text-[0.9375rem] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 dark:border dark:border-slate-600">-</span>
              </div>

              <!-- Fecha cierre -->
              <div class="flex items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
                <CalendarDaysIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('route.closingDate') }}:</span>
                <span v-if="resumenPanel.ruta?.fechaCierre" class="inline-flex items-center px-3 py-1.5 rounded-lg text-[0.9375rem] font-semibold tabular-nums bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:border dark:border-slate-600">
                  {{ new Date(resumenPanel.ruta.fechaCierre).toLocaleString('es-ES') }}
                </span>
                <span v-else class="inline-flex items-center px-3 py-1.5 rounded-lg text-[0.9375rem] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:border dark:border-slate-600 italic">
                  {{ $t('route.notClosed') }}
                </span>
              </div>

              <!-- Clientes totales -->
              <div class="border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
                <button
                  type="button"
                  class="flex w-full items-center gap-2 mb-2 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-neutral-200/50 dark:hover:bg-slate-800/80 active:bg-neutral-300/40 dark:active:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  :title="$t('nav.clients')"
                  @click="router.push('/admin')"
                >
                  <UsersIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
                  <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.totalClients') }}:</span>
                  <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">{{ formatNum(resumenPanel.clientes?.length ?? 0) }}</span>
                  <ChevronRightIcon class="w-5 h-5 ml-auto shrink-0 text-gray-900 dark:text-slate-100" aria-hidden="true" />
                </button>
                <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#10B98126] text-[#10B981]">
                    {{ $t('summary.newClients') }}: {{ formatNum(resumenPanel.resumen?.nuevos ?? 0) }}
                  </span>
                  <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#6366F126] text-[#6366F1]">
                    {{ $t('summary.renewedClients') }}: {{ formatNum(resumenPanel.resumen?.renovados ?? 0) }}
                  </span>
                  <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#F43F5E26] text-[#F43F5E]">
                    {{ $t('summary.cancelledClients') }}: {{ formatNum(resumenPanel.resumen?.cancelados ?? 0) }}
                  </span>
                </div>
              </div>

              <!-- Cartera / Caja inicial -->
              <div class="flex items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
                <WalletIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.initialPortfolio') }}:</span>
                <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(resumenPanel.ruta?.carteraInicial) || 0, 2) }}</span>
              </div>
              <div class="flex items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
                <BanknotesIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.initialCash') }}:</span>
                <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(resumenPanel.ruta?.cajaInicial) || 0, 2) }}</span>
              </div>

              <!-- Recaudo pretendido / actual -->
              <div class="flex items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
                <ChartBarIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.expectedCollected') }}:</span>
                <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(resumenPanel.ruta?.recaudadoPretendido) || 0, 2) }}</span>
              </div>
              <div class="flex items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
                <CurrencyDollarIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.currentCollected') }}:</span>
                <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(resumenPanel.ruta?.recaudado) || 0, 2) }}</span>
                <span :class="['ml-3 inline-flex items-center px-3 py-1.5 rounded-lg text-[0.9375rem] font-semibold tabular-nums', clasePorcentajeRecaudo ]">
                  {{ formatNum(porcentajeRecaudo, 1) }}%
                </span>
              </div>

              <!-- Ingresos / Ventas / Intereses / Egresos / Retiros / Caja / Cartera final -->
              <button
                type="button"
                class="flex w-full items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-neutral-200/50 dark:hover:bg-slate-800/80 active:bg-neutral-300/40 dark:active:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                :title="$t('summary.goToIncome')"
                @click="router.push({ name: 'IngresosEgresosAdmin' })"
              >
                <ArrowTrendingUpIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400 shrink-0" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.income') }}:</span>
                <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(resumenPanel.ruta?.ingresos) || 0, 2) }}</span>
                <ChevronRightIcon class="w-5 h-5 ml-auto shrink-0 text-gray-900 dark:text-slate-100" aria-hidden="true" />
              </button>
              <div class="flex items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
                <ShoppingCartIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.sales') }}:</span>
                <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(resumenPanel.ruta?.ventas) || 0, 2) }}</span>
                <span v-if="interesesTotalesRuta > 0" class="ml-2 inline-flex items-center px-3 py-1.5 rounded-lg text-[0.9375rem] font-semibold tabular-nums bg-teal-50 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200 dark:border dark:border-teal-700/50">
                  {{ $t('summary.interests') }}: ${{ formatNum(interesesTotalesRuta, 2) }}
                </span>
              </div>
              <button
                type="button"
                class="flex w-full items-center gap-2 border-b border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-neutral-200/50 dark:hover:bg-slate-800/80 active:bg-neutral-300/40 dark:active:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                :title="$t('summary.goToExpenses')"
                @click="router.push({ name: 'IngresosEgresosAdmin' })"
              >
                <ReceiptRefundIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400 shrink-0" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.expenses') }}:</span>
                <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(resumenPanel.ruta?.egresos) || 0, 2) }}</span>
                <ChevronRightIcon class="w-5 h-5 ml-auto shrink-0 text-gray-900 dark:text-slate-100" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="flex w-full items-center gap-2 border-b border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-neutral-200/50 dark:hover:bg-slate-800/80 active:bg-neutral-300/40 dark:active:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                :title="$t('summary.goToExpenses')"
                @click="router.push({ name: 'IngresosEgresosAdmin' })"
              >
                <ArrowTrendingDownIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400 shrink-0" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.withdrawals') }}:</span>
                <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(resumenPanel.ruta?.retiros) || 0, 2) }}</span>
                <ChevronRightIcon class="w-5 h-5 ml-auto shrink-0 text-gray-900 dark:text-slate-100" aria-hidden="true" />
              </button>
              <div class="flex items-center gap-2 border-b border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
                <BanknotesIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Caja final:</span>
                <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(resumenPanel.ruta?.cajaFinal) || 0, 2) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <WalletIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Cartera final:</span>
                <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(resumenPanel.ruta?.carteraFinal) || 0, 2) }}</span>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import API_BASE_URL from '../config/api.js'
import {
  GlobeAltIcon,
  BuildingOffice2Icon,
  UserIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
  UsersIcon,
  BanknotesIcon,
  WalletIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ReceiptRefundIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import NavbarAdmin from '../components/NavbarAdmin.vue'
import { useAppScrollRoot } from '../composables/useAppScrollRoot.js'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const appScrollRoot = useAppScrollRoot()
const resumenAdminMainScrollEl = ref(null)

function formatNum(value, decimals = 0) {
  const n = Number(value)
  const loc = (locale && locale.value) || 'es'
  const localeForNumber = (typeof loc === 'string' && loc.startsWith('es')) ? 'es-ES' : (typeof loc === 'string' && loc.startsWith('pt')) ? 'pt-BR' : 'en-US'
  if (isNaN(n)) {
    return decimals === 0 ? '0' : (0).toLocaleString(localeForNumber, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  }
  const options = decimals === 0
    ? { useGrouping: true }
    : { useGrouping: true, minimumFractionDigits: decimals, maximumFractionDigits: decimals }
  return n.toLocaleString(localeForNumber, options)
}

/** Desplegables del menú lateral: país y ciudad (claves del árbol) */
const sidebarExpanded = reactive({ paises: {}, ciudades: {} })

const vendedores = ref([])
const vendedorSeleccionado = ref(null)
const resumenPanel = ref(null)
const rutaSeleccionadaId = ref('')

const rutasDropdownAbierto = ref(false)
const rutasDropdownRoot = ref(null)

/** Agrupa asesores por país y ciudad según BD (campos pais, ciudad) */
const arbolPorUbicacion = computed(() => {
  const list = vendedores.value || []
  const porPais = new Map()

  for (const v of list) {
    const rawPais = v.pais != null && String(v.pais).trim() ? String(v.pais).trim() : ''
    const rawCiudad = v.ciudad != null && String(v.ciudad).trim() ? String(v.ciudad).trim() : ''
    const pKey = rawPais || '__sin_pais'
    const cKey = rawCiudad || '__sin_ciudad'
    const ciudadFullKey = `${pKey}::${cKey}`

    if (!porPais.has(pKey)) {
      porPais.set(pKey, {
        key: pKey,
        label: rawPais || t('admin.countryUnknown'),
        ciudadesMap: new Map()
      })
    }
    const nodoPais = porPais.get(pKey)
    if (!nodoPais.ciudadesMap.has(ciudadFullKey)) {
      nodoPais.ciudadesMap.set(ciudadFullKey, {
        key: ciudadFullKey,
        label: rawCiudad || t('admin.cityUnknown'),
        vendedores: []
      })
    }
    nodoPais.ciudadesMap.get(ciudadFullKey).vendedores.push(v)
  }

  const cmp = (a, b) => String(a.label).localeCompare(String(b.label), undefined, { sensitivity: 'base' })

  return [...porPais.values()]
    .sort(cmp)
    .map(p => ({
      key: p.key,
      label: p.label,
      ciudades: [...p.ciudadesMap.values()]
        .map(c => ({
          ...c,
          vendedores: [...c.vendedores].sort((a, b) =>
            String(a.nombre || '').localeCompare(String(b.nombre || ''), undefined, { sensitivity: 'base' })
          )
        }))
        .sort(cmp)
    }))
})

function expandSidebarFromTree() {
  const pNew = {}
  const cNew = {}
  for (const p of arbolPorUbicacion.value) {
    pNew[p.key] = true
    for (const c of p.ciudades) {
      cNew[c.key] = true
    }
  }
  sidebarExpanded.paises = pNew
  sidebarExpanded.ciudades = cNew
}

function isPaisOpen(key) {
  return !!sidebarExpanded.paises[key]
}

function isCiudadOpen(key) {
  return !!sidebarExpanded.ciudades[key]
}

function togglePais(key) {
  sidebarExpanded.paises[key] = !isPaisOpen(key)
}

function toggleCiudad(key) {
  sidebarExpanded.ciudades[key] = !isCiudadOpen(key)
}

function localeForDates() {
  const loc = (locale && locale.value) || 'es'
  if (typeof loc === 'string' && loc.startsWith('es')) return 'es-ES'
  if (typeof loc === 'string' && loc.startsWith('pt')) return 'pt-BR'
  return 'en-US'
}

function formatFechaRutaSelect(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString(localeForDates(), { dateStyle: 'short', timeStyle: 'short' })
}

const etiquetaRutaSeleccionada = computed(() => {
  const rutas = resumenPanel.value?.rutasDisponibles || []
  const id = rutaSeleccionadaId.value
  let r = id ? rutas.find(x => String(x._id) === String(id)) : null
  if (!r && resumenPanel.value?.ruta) {
    r = rutas.find(x => String(x._id) === String(resumenPanel.value.ruta._id)) || null
  }
  if (!r && rutas[0]) r = rutas[0]
  if (!r?.fechaApertura) return '—'
  const a = formatFechaRutaSelect(r.fechaApertura)
  const c = r.fechaCierre ? formatFechaRutaSelect(r.fechaCierre) : t('route.notClosed')
  return `${a} → ${c}`
})

/** Alinea el id seleccionado con la ruta que muestra el panel (evita duplicar "ruta actual" vs misma ruta con fechas). */
function syncRutaSeleccionadaConPanel() {
  const panel = resumenPanel.value
  if (!panel?.ruta?._id) {
    rutaSeleccionadaId.value = ''
    return
  }
  const rutas = panel.rutasDisponibles || []
  const panelRutaId = String(panel.ruta._id)
  if (!rutas.length) {
    rutaSeleccionadaId.value = panelRutaId
    return
  }
  const idActual = String(rutaSeleccionadaId.value || '')
  const existe = rutas.some(r => String(r._id) === idActual)
  if (!existe) {
    rutaSeleccionadaId.value = panelRutaId
  }
}

function seleccionarRutaDropdown(id) {
  if (id == null || id === '') return
  rutaSeleccionadaId.value = String(id)
  rutasDropdownAbierto.value = false
  cargarPorRuta()
}

function cerrarRutasDropdownSiClickFuera(ev) {
  if (!rutasDropdownAbierto.value) return
  const el = rutasDropdownRoot.value
  if (el && !el.contains(ev.target)) {
    rutasDropdownAbierto.value = false
  }
}

// Intereses SOLO de ventas creadas dentro del rango de la ruta del panel seleccionado
const interesesTotalesRuta = computed(() => {
  const ruta = resumenPanel.value?.ruta
  const clientes = resumenPanel.value?.clientes || []
  if (!ruta || !ruta.fechaApertura) return 0
  const inicio = new Date(ruta.fechaApertura).getTime()
  const fin = ruta.fechaCierre ? new Date(ruta.fechaCierre).getTime() : Date.now()
  const suma = clientes.reduce((acc, c) => {
    const created = c?.createdAt ? new Date(c.createdAt).getTime() : 0
    if (created >= inicio && created <= fin) {
      const valor = Number(c?.valor) || 0
      const saldoInicial = Number(c?.saldo_inicial)
      const total = Number(c?.total)
      const base = !isNaN(saldoInicial) && saldoInicial > 0 ? saldoInicial : (!isNaN(total) && total > 0 ? total : null)
      if (base != null) {
        const interesMonto = Math.max(0, base - valor)
        return acc + interesMonto
      }
      // Fallback final si no vinieron saldos: asumir que c.intereses es porcentaje
      const interesPct = Number(c?.intereses) || 0
      return acc + (valor * interesPct) / 100
    }
    return acc
  }, 0)
  return Math.round(suma * 100) / 100
})

// Porcentaje de recaudo respecto al pretendido del día (un decimal)
const porcentajeRecaudo = computed(() => {
  const recaudado = Number(resumenPanel.value?.ruta?.recaudado) || 0
  const pretendido = Number(resumenPanel.value?.ruta?.recaudadoPretendido) || 0
  if (pretendido <= 0) return 0
  const pct = (recaudado / pretendido) * 100
  return Math.min(999, Math.round(pct * 10) / 10)
})

// Badge de color para el porcentaje
const clasePorcentajeRecaudo = computed(() => {
  const p = Number(porcentajeRecaudo.value) || 0
  if (p >= 100) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  if (p >= 80) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
  if (p >= 50) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
})

function logout() {
  try {
    localStorage.removeItem('rol')
    localStorage.removeItem('adminId')
    localStorage.removeItem('vendedorId')
    localStorage.removeItem('codigoVinculacion')
    localStorage.removeItem('sessionToken')
    localStorage.removeItem('esSuperUsuario')
  } catch (e) {}
  try {
    router.replace('/')
    setTimeout(() => {
      if (location.hash && !location.hash.endsWith('#/')) {
        location.href = '/'
      }
    }, 150)
  } catch (e) {
    location.href = '/'
  }
}

onMounted(async () => {
  document.addEventListener('click', cerrarRutasDropdownSiClickFuera)
  // Refrescar el panel si en el perfil de admin se elimina un cliente
  window.addEventListener('admin-resumen-actualizar', actualizarPanel)
  window.addEventListener('pago-editado', actualizarPanel)
  window.addEventListener('pago-registrado', actualizarPanel)
  try {
    const codigoVinculacion = localStorage.getItem('codigoVinculacion')
    const esSuperUsuario = localStorage.getItem('esSuperUsuario') === '1'
    if (!esSuperUsuario && !codigoVinculacion) {
      console.error('No se encontró código de vinculación')
      return
    }
    const urlVend = esSuperUsuario
      ? `${API_BASE_URL}/api/vendedores`
      : `${API_BASE_URL}/api/vendedores?codigoVinculacion=${encodeURIComponent(codigoVinculacion)}`
    const resVend = await fetch(urlVend)
    vendedores.value = resVend.ok ? await resVend.json() : []
    expandSidebarFromTree()
    if (vendedores.value.length > 0) {
      const qV = route.query.vendedorId
      const qR = route.query.rutaId
      if (qV && qR) {
        const v = vendedores.value.find(x => String(x._id) === String(qV))
        if (v) {
          await seleccionarVendedor(v)
          rutaSeleccionadaId.value = String(qR)
          await actualizarPanel()
        } else {
          const primero = arbolPorUbicacion.value[0]?.ciudades[0]?.vendedores[0] || vendedores.value[0]
          await seleccionarVendedor(primero)
        }
      } else {
        const primero = arbolPorUbicacion.value[0]?.ciudades[0]?.vendedores[0] || vendedores.value[0]
        await seleccionarVendedor(primero)
      }
    }
  } catch (e) {
    console.error('Error al cargar asesores:', e)
    vendedores.value = []
  }
  await nextTick()
  if (appScrollRoot) appScrollRoot.value = resumenAdminMainScrollEl.value
})

onUnmounted(() => {
  if (appScrollRoot && appScrollRoot.value === resumenAdminMainScrollEl.value) {
    appScrollRoot.value = null
  }
  document.removeEventListener('click', cerrarRutasDropdownSiClickFuera)
  window.removeEventListener('admin-resumen-actualizar', actualizarPanel)
  window.removeEventListener('pago-editado', actualizarPanel)
  window.removeEventListener('pago-registrado', actualizarPanel)
})

/** Solo si ya estabas en Resumen y cambian los query params (p. ej. otra notificación). */
watch(
  () => route.fullPath,
  async (newPath, oldPath) => {
    if (!oldPath || newPath === oldPath || route.path !== '/admin/resumen') return
    if (!String(oldPath).includes('/admin/resumen')) return
    const qV = route.query.vendedorId
    const qR = route.query.rutaId
    if (!qV || !qR || !vendedores.value.length) return
    const v = vendedores.value.find(x => String(x._id) === String(qV))
    if (!v) return
    await seleccionarVendedor(v)
    rutaSeleccionadaId.value = String(qR)
    await actualizarPanel()
  }
)

async function seleccionarVendedor(v) {
  rutasDropdownAbierto.value = false
  rutaSeleccionadaId.value = ''
  vendedorSeleccionado.value = { ...v }
  resumenPanel.value = null
  try {
    const url = new URL(`${API_BASE_URL}/api/vendedores/${v._id}/panel`)
    url.searchParams.set('_ts', String(Date.now()))
    const res = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } })
    if (res.ok) {
      resumenPanel.value = await res.json()
      syncRutaSeleccionadaConPanel()
    } else {
      console.error('Error en la respuesta:', res.statusText)
      resumenPanel.value = null
    }
  } catch (e) {
    console.error('Error al cargar panel:', e)
    resumenPanel.value = null
  }
}

async function actualizarPanel() {
  if (!vendedorSeleccionado.value) return
  resumenPanel.value = null
  try {
    const url = new URL(`${API_BASE_URL}/api/vendedores/${vendedorSeleccionado.value._id}/panel`)
    if (rutaSeleccionadaId.value) url.searchParams.set('rutaId', rutaSeleccionadaId.value)
    url.searchParams.set('_ts', String(Date.now()))
    const res = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } })
    if (res.ok) {
      resumenPanel.value = await res.json()
      syncRutaSeleccionadaConPanel()
    } else {
      resumenPanel.value = null
    }
  } catch (e) {
    resumenPanel.value = null
  }
}

function cargarPorRuta() {
  if (!vendedorSeleccionado.value) return
  actualizarPanel()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

