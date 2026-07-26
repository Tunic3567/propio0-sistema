<template>
  <!-- Misma idea que login: altura = viewport; el scroll solo dentro del área de contenido -->
  <div
    class="h-dvh max-h-dvh min-h-0 w-full max-w-full overflow-x-clip overflow-y-hidden overscroll-none flex flex-col bg-neutral-100 dark:bg-slate-900 transition-theme"
  >
    <NavbarVendedor
      class="shrink-0"
      :rutaAbierta="rutaAbierta"
      :cargandoRuta="cargandoRuta"
      :tituloSeccion="$t('nav.summary')"
      @logout="logout"
      @cerrar-ruta="cerrarRuta"
    />
    <div
      ref="resumenVendedorScrollEl"
      class="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pt-0 md:px-6 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <!-- Aviso cuando la ruta está cerrada -->
      <div v-if="!rutaAbierta" class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center mb-6 transition-colors duration-300">
        <p class="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">{{ $t('route.closed') }}</p>
        <p class="text-yellow-700 dark:text-yellow-300 mb-4">{{ $t('common.mustOpenRoute') }}</p>
        <button @click="abrirRuta" class="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 transition-colors">{{ $t('route.open') }}</button>
      </div>

      <div v-else>
        <!-- El asesor solo ve la ruta actual; el historial de días/rutas es solo para admin -->
        <div v-if="!loading && !panel" class="text-gray-400 dark:text-gray-500">{{ $t('history.noData') }}</div>
        <div v-else-if="panel" class="resumen-content space-y-2 pt-2">
        <div class="border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
          <div v-if="rutasCerradas.length > 0" role="button" tabindex="0" @click="mostrarHistorialResumenes = true" @keydown.enter="mostrarHistorialResumenes = true" class="flex items-center gap-2 rounded-lg -mx-1 px-1 py-1 hover:bg-neutral-200/50 dark:hover:bg-slate-800/80 active:bg-neutral-300/40 dark:active:bg-slate-700/60 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <CalendarDaysIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
            <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('route.openingDate') }}:</span>
            <span v-if="panel.ruta?.fechaApertura" class="resumen-badge-base bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:border dark:border-slate-600">{{ new Date(panel.ruta.fechaApertura).toLocaleString('es-ES') }}</span>
            <span v-else class="resumen-badge-base bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 dark:border dark:border-slate-600">-</span>
            <svg class="w-5 h-5 ml-auto shrink-0 text-black dark:text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div v-else class="flex items-center gap-2">
            <CalendarDaysIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
            <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('route.openingDate') }}:</span>
            <span v-if="panel.ruta?.fechaApertura" class="resumen-badge-base bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:border dark:border-slate-600">{{ new Date(panel.ruta.fechaApertura).toLocaleString('es-ES') }}</span>
            <span v-else class="resumen-badge-base bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 dark:border dark:border-slate-600">-</span>
          </div>
        </div>
        <div class="border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
          <div v-if="rutasCerradas.length > 0" role="button" tabindex="0" @click="mostrarHistorialResumenes = true" @keydown.enter="mostrarHistorialResumenes = true" class="flex items-center gap-2 rounded-lg -mx-1 px-1 py-1 hover:bg-neutral-200/50 dark:hover:bg-slate-800/80 active:bg-neutral-300/40 dark:active:bg-slate-700/60 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <CalendarDaysIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
            <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('route.closingDate') }}:</span>
            <span v-if="panel.ruta?.fechaCierre" class="resumen-badge-base bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:border dark:border-slate-600">{{ new Date(panel.ruta.fechaCierre).toLocaleString('es-ES') }}</span>
            <span v-else class="resumen-badge-base bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:border dark:border-slate-600 italic">{{ $t('route.notClosed') }}</span>
            <svg class="w-5 h-5 ml-auto shrink-0 text-black dark:text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div v-else class="flex items-center gap-2">
            <CalendarDaysIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
            <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('route.closingDate') }}:</span>
            <span v-if="panel.ruta?.fechaCierre" class="resumen-badge-base bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:border dark:border-slate-600">{{ new Date(panel.ruta.fechaCierre).toLocaleString('es-ES') }}</span>
            <span v-else class="resumen-badge-base bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:border dark:border-slate-600 italic">{{ $t('route.notClosed') }}</span>
          </div>
        </div>
        <!-- Clientes iniciales (al abrir la ruta) -->
        <div class="flex items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
          <UsersIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.initialClients') }}:</span>
          <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">{{ panel.ruta?.clientesIniciales != null ? formatNum(panel.ruta.clientesIniciales) : '–' }}</span>
        </div>
        <div class="border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
          <button
            type="button"
            class="flex w-full items-center gap-2 mb-2 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-neutral-200/50 dark:hover:bg-slate-800/80 active:bg-neutral-300/40 dark:active:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            :title="$t('nav.clients')"
            @click="router.push('/vendedor')"
          >
            <UsersIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
            <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.totalClients') }}:</span>
            <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">{{ formatNum(panel.resumen?.total ?? 0) }}</span>
            <span class="text-gray-600 dark:text-gray-400 text-sm font-normal">
              ({{ formatNum(panel.resumen?.clientesConPagosRegistrados ?? 0) }} {{ $t('summary.registered') }})
            </span>
            <ChevronRightIcon class="w-5 h-5 ml-auto shrink-0 text-black dark:text-slate-100" aria-hidden="true" />
          </button>
          <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#10B98126] text-[#10B981]">
              {{ $t('summary.newClients') }}: {{ formatNum(panel.resumen?.nuevos ?? 0) }}
            </span>
            <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#6366F126] text-[#6366F1]">
              {{ $t('summary.renewedClients') }}: {{ formatNum(panel.resumen?.renovados ?? 0) }}
            </span>
            <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#F43F5E26] text-[#F43F5E]">
              {{ $t('summary.cancelledClients') }}: {{ formatNum(panel.resumen?.cancelados ?? 0) }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
          <BanknotesIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.initialCash') }}:</span>
          <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(panel.ruta?.cajaInicial) || 0, 2) }}</span>
        </div>
        <div class="flex items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
          <ChartBarIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.expectedCollected') }}:</span>
          <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(panel.ruta?.recaudadoPretendido || 0, 2) }}</span>
        </div>
        <div class="flex items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
          <CurrencyDollarIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.currentCollected') }}:</span>
          <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(panel.ruta?.recaudado || 0, 2) }}</span>
          <span class="ml-3 resumen-badge-base bg-teal-50 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200 dark:border dark:border-teal-700/50">{{ formatNum(porcentajeRecaudo, 1) }}%</span>
        </div>
        <button
          type="button"
          class="flex w-full items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-neutral-200/50 dark:hover:bg-slate-800/80 active:bg-neutral-300/40 dark:active:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          :title="$t('summary.goToIncome')"
          @click="router.push('/ingresos')"
        >
          <ArrowTrendingUpIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400 shrink-0" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.income') }}:</span>
          <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(panel.ruta?.ingresos || 0, 2) }}</span>
          <ChevronRightIcon class="w-5 h-5 ml-auto shrink-0 text-black dark:text-slate-100" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="flex w-full items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-neutral-200/50 dark:hover:bg-slate-800/80 active:bg-neutral-300/40 dark:active:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          :title="$t('nav.sales')"
          @click="router.push('/ventas')"
        >
          <ShoppingCartIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('nav.sales') }}:</span>
          <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(panel.ruta?.ventas || 0, 2) }}</span>
          <ChevronRightIcon class="w-5 h-5 ml-auto shrink-0 text-black dark:text-slate-100" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="flex w-full items-center gap-2 border-b border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-neutral-200/50 dark:hover:bg-slate-800/80 active:bg-neutral-300/40 dark:active:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          :title="$t('summary.goToExpenses')"
          @click="router.push('/egresos')"
        >
          <ReceiptRefundIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400 shrink-0" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.expenses') }}:</span>
          <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(panel.ruta?.egresos || 0, 2) }}</span>
          <ChevronRightIcon class="w-5 h-5 ml-auto shrink-0 text-black dark:text-slate-100" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="flex w-full items-center gap-2 border-b border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-neutral-200/50 dark:hover:bg-slate-800/80 active:bg-neutral-300/40 dark:active:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          :title="$t('summary.goToExpenses')"
          @click="router.push('/egresos')"
        >
          <ArrowTrendingDownIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400 shrink-0" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">{{ $t('summary.withdrawals') }}:</span>
          <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(panel.ruta?.retiros || 0, 2) }}</span>
          <ChevronRightIcon class="w-5 h-5 ml-auto shrink-0 text-black dark:text-slate-100" aria-hidden="true" />
        </button>
        <div class="flex items-center gap-2 border-b border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
          <BanknotesIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
          <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Caja final:</span>
          <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(panel.ruta?.cajaFinal || 0, 2) }}</span>
        </div>
      </div>
      </div>
    </div>
    
    <!-- Modal de confirmación para cerrar ruta -->
    <ConfirmModal
      :show="mostrarModalCerrarRuta"
      title="Cerrar ruta"
      message="¿Estás seguro de que deseas cerrar la ruta? Esta acción no se puede deshacer."
      confirmText="Cerrar ruta"
      cancelText="Cancelar"
      @confirm="confirmarCerrarRuta"
      @cancel="cancelarCerrarRuta"
    />
    
    <!-- Modal de advertencia: clientes pendientes -->
    <Teleport to="body">
      <div v-if="mostrarModalPendientes" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="mostrarModalPendientes = false"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-200/50 dark:border-red-700/50 transition-all duration-300">
          <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-8 h-8 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 class="text-xl font-bold text-red-600 dark:text-red-400">{{ t('route.negativeCash') }}</h2>
            </div>
          </div>
          <div class="p-6">
            <p class="text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{{ t('route.pendingClients') }}</p>
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 max-h-64 overflow-y-auto shadow-inner">
              <ul class="list-disc list-inside text-sm text-gray-800 dark:text-gray-200 space-y-2">
                <li v-for="(p, idx) in pendientesClientes" :key="p.id || idx" class="font-medium">{{ p.nombres }} {{ p.apellidos }}</li>
              </ul>
            </div>
            <div class="mt-6 flex justify-center">
              <button @click="mostrarModalPendientes = false" class="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">Entendido</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Modal de advertencia: caja final negativa -->
    <Teleport to="body">
      <div v-if="mostrarModalCajaNegativa" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="mostrarModalCajaNegativa = false"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-200/50 dark:border-red-700/50 transition-all duration-300">
          <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-8 h-8 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 class="text-xl font-bold text-red-600 dark:text-red-400">{{ t('route.negativeCash') }}</h2>
            </div>
          </div>
          <div class="p-6">
            <p class="text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{{ mensajeCajaNegativa }}</p>
            <div v-if="detallesCajaNegativa" class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 mb-4 shadow-inner">
              <p class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide">{{ t('modal.details') }}:</p>
              <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <li class="flex justify-between"><span class="font-medium">{{ $t('summary.initialCash') }}:</span> <span class="font-bold">${{ formatNum(detallesCajaNegativa.cajaInicial, 2) }}</span></li>
                <li class="flex justify-between"><span class="font-medium">{{ $t('summary.income') }}:</span> <span class="font-bold text-red-600">${{ formatNum(detallesCajaNegativa.ingresos, 2) }}</span></li>
                <li class="flex justify-between"><span class="font-medium">{{ $t('summary.collected') }}:</span> <span class="font-bold text-green-600">${{ formatNum(detallesCajaNegativa.recaudado, 2) }}</span></li>
                <li class="flex justify-between"><span class="font-medium">{{ $t('summary.sales') }}:</span> <span class="font-bold text-blue-600">${{ formatNum(detallesCajaNegativa.ventas, 2) }}</span></li>
                <li class="flex justify-between"><span class="font-medium">{{ $t('summary.expenses') }}:</span> <span class="font-bold text-red-600">${{ formatNum(detallesCajaNegativa.egresos, 2) }}</span></li>
                <li class="flex justify-between"><span class="font-medium">{{ $t('summary.withdrawals') }}:</span> <span class="font-bold text-green-600">${{ formatNum(detallesCajaNegativa.retiros, 2) }}</span></li>
              </ul>
            </div>
            <div class="mt-6 flex justify-center">
              <button @click="mostrarModalCajaNegativa = false" class="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">{{ t('common.understood') }}</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Modal de confirmación para abrir ruta -->
    <ConfirmModal
      :show="mostrarModalAbrirRuta"
      title="Abrir ruta"
      message="¿Estás seguro de que deseas abrir la ruta? Esta acción no se puede deshacer."
      confirmText="Abrir ruta"
      cancelText="Cancelar"
      @confirm="confirmarAbrirRuta"
      @cancel="cancelarAbrirRuta"
    />
    <ResumenCierreModal
      :show="mostrarResumenCierre"
      v-bind="datosResumenCierre || {}"
      @close="cerrarResumenCierre"
    />
    <HistorialResumenesModal
      :show="mostrarHistorialResumenes"
      :vendedorId="storedVendedorId"
      :rutasDisponibles="panel?.rutasDisponibles || []"
      @close="mostrarHistorialResumenes = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, defineOptions } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NavbarVendedor from '../components/NavbarVendedor.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import ResumenCierreModal from '../components/ResumenCierreModal.vue'
import HistorialResumenesModal from '../components/HistorialResumenesModal.vue'
import API_BASE_URL from '../config/api.js'
import { getUserTimezone } from '../utils/rutaUtils.js'
import { useAppScrollRoot } from '../composables/useAppScrollRoot.js'

defineOptions({ name: 'ResumenVendedor' })

const { t, locale } = useI18n()

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
import { 
  CalendarDaysIcon, 
  UsersIcon, 
  BanknotesIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ShoppingCartIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  ReceiptRefundIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const appScrollRoot = useAppScrollRoot()
const resumenVendedorScrollEl = ref(null)
const loading = ref(true)
const cargandoRuta = ref(false)
const panel = ref(null)
const rutaAbierta = ref(false)
const mostrarModalCerrarRuta = ref(false)
const mostrarModalAbrirRuta = ref(false)
const mostrarModalPendientes = ref(false)
const pendientesClientes = ref([])
const mostrarModalCajaNegativa = ref(false)
const mensajeCajaNegativa = ref('')
const detallesCajaNegativa = ref(null)
const mostrarResumenCierre = ref(false)
const datosResumenCierre = ref(null)
const mostrarHistorialResumenes = ref(false)
const storedVendedorId = computed(() => localStorage.getItem('vendedorId'))
const rutasCerradas = computed(() => (panel.value?.rutasDisponibles || []).filter(r => !!r.fechaCierre))
let pollingInterval = null
// Caja inicial ahora viene del backend (caja final del día anterior)
const cajaInicialCalculada = computed(() => {
  const ruta = panel.value?.ruta || {}
  return (Number(ruta.cajaInicial) || 0).toFixed(2)
})

const porcentajeRecaudo = computed(() => {
  const recaudado = Number(panel.value?.ruta?.recaudado) || 0
  const pretendido = Number(panel.value?.ruta?.recaudadoPretendido) || 0
  if (pretendido <= 0) return 0
  const pct = (recaudado / pretendido) * 100
  return Math.min(999, Math.round(pct * 10) / 10)
})

const clasePorcentajeRecaudo = computed(() => {
  const p = Number(porcentajeRecaudo.value) || 0
  if (p >= 100) return 'bg-green-100 text-green-700'
  if (p >= 80) return 'bg-emerald-100 text-emerald-700'
  if (p >= 50) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
})

function getValorClase(valor) {
  const n = Number(valor) || 0
  return n >= 0 ? 'text-green-700' : 'text-red-700'
}

function logout() {
  try {
    localStorage.removeItem('rol')
    localStorage.removeItem('adminId')
    localStorage.removeItem('vendedorId')
    localStorage.removeItem('codigoVinculacion')
    localStorage.removeItem('sessionToken')
  } catch {}
  try { router.replace('/') } catch { location.href = '/' }
}

function cerrarRuta() {
  mostrarModalCerrarRuta.value = true
}

function cerrarResumenCierre() {
  mostrarResumenCierre.value = false
  datosResumenCierre.value = null
  router.push('/vendedor')
}

async function confirmarCerrarRuta() {
  const vendedorId = localStorage.getItem('vendedorId')
  const res = await fetch(`${API_BASE_URL}/api/rutas/cerrar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendedorId }) })
  if (res.ok) {
    rutaAbierta.value = false
    mostrarModalCerrarRuta.value = false
    try {
      const panelRes = await fetch(`${API_BASE_URL}/api/vendedores/${vendedorId}/panel?_ts=${Date.now()}`, { cache: 'no-store' })
      if (panelRes.ok) {
        const panel = await panelRes.json()
        datosResumenCierre.value = {
          vendedorNombre: panel.vendedor?.nombre || '',
          ruta: panel.ruta || {},
          resumen: panel.resumen || {}
        }
        mostrarResumenCierre.value = true
      } else {
        router.push('/vendedor')
      }
    } catch {
      router.push('/vendedor')
    }
  } else {
    const errorData = await res.json().catch(() => null)
    mostrarModalCerrarRuta.value = false
    if (errorData?.error === 'RUTA_CON_CLIENTES_PENDIENTES') {
      pendientesClientes.value = (errorData.pendientes || [])
      mostrarModalPendientes.value = true
    } else if (errorData?.error === 'CAJA_FINAL_NEGATIVA') {
      mensajeCajaNegativa.value = errorData.msg || 'La caja final está en negativo.'
      detallesCajaNegativa.value = errorData.detalles || null
      mostrarModalCajaNegativa.value = true
    } else {
      alert(errorData?.msg || errorData?.error || 'No se pudo cerrar la ruta')
    }
  }
}

function cancelarCerrarRuta() {
  mostrarModalCerrarRuta.value = false
}

function abrirRuta() {
  mostrarModalAbrirRuta.value = true
}

async function confirmarAbrirRuta() {
  const vendedorId = localStorage.getItem('vendedorId')
  const res = await fetch(`${API_BASE_URL}/api/rutas/abrir`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vendedorId, timezone: getUserTimezone() }) })
  if (res.ok) { 
    rutaAbierta.value = true
    mostrarModalAbrirRuta.value = false
    window.dispatchEvent(new CustomEvent('ruta-abierta'))
    // Recargar el panel inmediatamente
    await cargarPanel(vendedorId)
    router.push('/vendedor') 
  } else { 
    const data = await res.json().catch(() => ({}))
    alert(data.msg || data.error || 'No se pudo abrir la ruta')
  }
}

function cancelarAbrirRuta() {
  mostrarModalAbrirRuta.value = false
}

onMounted(async () => {
  loading.value = true
  const vendedorId = localStorage.getItem('vendedorId')
  if (!vendedorId) { router.push('/'); return }
  
  // Cargar datos iniciales
  await cargarPanel(vendedorId)

  // Escuchar eventos para actualizar cuando sea necesario
  window.addEventListener('cliente-creado', actualizarResumen)
  window.addEventListener('cliente-eliminado', actualizarResumen)
  window.addEventListener('pago-registrado', actualizarResumen)
  window.addEventListener('pago-editado', actualizarResumen)
  window.addEventListener('ingreso-registrado', actualizarResumen)
  window.addEventListener('egreso-registrado', actualizarResumen)
  window.addEventListener('ruta-cerrada', actualizarResumen)
  window.addEventListener('ruta-abierta', actualizarResumen)
  document.addEventListener('visibilitychange', onResumenVisibility)

  await nextTick()
  if (appScrollRoot) appScrollRoot.value = resumenVendedorScrollEl.value

  loading.value = false

  // Iniciar auto-actualización cada 30 segundos
  pollingInterval = window.setInterval(() => {
    const vid = localStorage.getItem('vendedorId')
    if (vid) cargarPanel(vid)
  }, 30000)
})

function onResumenVisibility() {
  if (document.visibilityState === 'visible') actualizarResumen()
}

// Función para cargar el panel (siempre ruta actual; el asesor no puede ver otros días)
async function cargarPanel(vendedorId) {
  try {
    const url = new URL(`${API_BASE_URL}/api/vendedores/${vendedorId}/panel`)
    url.searchParams.set('_ts', String(Date.now()))
    const res = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } })
    if (res.ok) {
      panel.value = await res.json()
      rutaAbierta.value = panel.value?.ruta?.abierta === true
      } else {
      console.error('Error en la respuesta:', res.statusText)
      panel.value = null
    }
  } catch (error) {
    console.error('Error al cargar panel:', error)
    panel.value = null
  }
}

// Función para actualizar resumen cuando sea necesario
function actualizarResumen() {
  const vendedorId = localStorage.getItem('vendedorId')
  if (vendedorId) {
    cargarPanel(vendedorId)
  }
}

// Limpiar event listeners al desmontar el componente
onUnmounted(() => {
  if (appScrollRoot && appScrollRoot.value === resumenVendedorScrollEl.value) {
    appScrollRoot.value = null
  }
  window.removeEventListener('cliente-creado', actualizarResumen)
  window.removeEventListener('cliente-eliminado', actualizarResumen)
  window.removeEventListener('pago-registrado', actualizarResumen)
  window.removeEventListener('pago-editado', actualizarResumen)
  window.removeEventListener('ingreso-registrado', actualizarResumen)
  window.removeEventListener('egreso-registrado', actualizarResumen)
  window.removeEventListener('ruta-cerrada', actualizarResumen)
  window.removeEventListener('ruta-abierta', actualizarResumen)
  document.removeEventListener('visibilitychange', onResumenVisibility)
  if (pollingInterval) {
    window.clearInterval(pollingInterval)
    pollingInterval = null
  }
})

</script>

<style scoped>
.resumen-content {
  font-family: inherit;
  font-variant-numeric: tabular-nums;
}

/* Base común de badges: tamaño, padding, números tabulares (colores con Tailwind dark:) */
.resumen-badge-base {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  border-radius: 0.5rem;
  border: none;
  box-shadow: none;
  outline: none;
}
</style>
