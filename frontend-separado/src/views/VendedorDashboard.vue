<template>
  <div
    class="min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-neutral-100 dark:bg-slate-900 transition-colors duration-300"
  >
    <NavbarVendedor
      class="shrink-0"
      :rutaAbierta="rutaAbierta"
      :cargandoRuta="cargandoRuta"
      :tituloSeccion="t('client.title')"
      @cerrar-ruta="cerrarRuta"
      @logout="logout"
    />

    <!-- Modal de confirmación para abrir ruta -->
    <Teleport to="body">
      <div v-if="mostrarModalApertura" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="mostrarModalApertura = false"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-gray-200/50 dark:border-gray-700/50 transition-all duration-300">
          <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-green-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-8 h-8 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 class="text-xl font-bold text-neutral-900 dark:text-slate-100">{{ t('route.open') }}</h2>
        </div>
      </div>
          <div class="p-6">
            <p class="text-base text-neutral-700 dark:text-slate-300 leading-relaxed mb-6">{{ t('route.openConfirm') }}</p>
            <div class="flex justify-end gap-3">
              <button @click="mostrarModalApertura = false" class="px-5 py-2.5 text-neutral-800 dark:text-slate-200 bg-white dark:bg-gray-700 border-2 border-neutral-400 dark:border-slate-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-600 font-semibold transition-all duration-200 shadow-sm">{{ t('common.cancel') }}</button>
              <button @click="confirmarAperturaRuta" class="px-5 py-2.5 text-white bg-green-700 hover:bg-green-800 border-2 border-green-800/60 rounded-lg font-semibold transition-all duration-200 shadow-md">{{ t('common.confirm') }}</button>
    </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de confirmación para cerrar ruta -->
    <Teleport to="body">
      <div v-if="mostrarModalCierre" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="mostrarModalCierre = false"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-gray-200/50 dark:border-gray-700/50 transition-all duration-300">
          <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-8 h-8 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <h2 class="text-xl font-bold text-neutral-900 dark:text-slate-100">{{ t('route.close') }}</h2>
            </div>
          </div>
          <div class="p-6">
            <p class="text-base text-neutral-700 dark:text-slate-300 leading-relaxed mb-6">{{ t('route.closeConfirm') }}</p>
            <div class="flex justify-end gap-3">
              <button @click="mostrarModalCierre = false" class="px-5 py-2.5 text-neutral-800 dark:text-slate-200 bg-white dark:bg-gray-700 border-2 border-neutral-400 dark:border-slate-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-600 font-semibold transition-all duration-200 shadow-sm">{{ t('common.cancel') }}</button>
              <button @click="confirmarCierreRuta" class="px-5 py-2.5 text-white bg-red-700 hover:bg-red-800 border-2 border-red-800/60 rounded-lg font-semibold transition-all duration-200 shadow-md">{{ t('common.confirm') }}</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

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
            <p class="text-base text-neutral-700 dark:text-slate-300 mb-4 leading-relaxed">{{ t('route.pendingClients') }}</p>
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 max-h-64 overflow-y-auto shadow-inner">
              <ul class="list-disc list-inside text-sm text-neutral-800 dark:text-slate-200 space-y-2">
                <li v-for="(p, idx) in pendientesClientes" :key="p.id || idx" class="font-medium">{{ p.nombres }} {{ p.apellidos }}</li>
              </ul>
            </div>
            <div class="mt-6 flex justify-center">
              <button @click="mostrarModalPendientes = false" class="btn-primary-min px-6 py-2.5">{{ t('common.understood') }}</button>
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
            <p class="text-base text-neutral-700 dark:text-slate-300 mb-4 leading-relaxed">{{ mensajeCajaNegativa }}</p>
            <div v-if="detallesCajaNegativa" class="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl p-4 mb-4 shadow-inner">
              <p class="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3 uppercase tracking-wide">{{ t('modal.details') }}:</p>
              <ul class="text-sm text-neutral-700 dark:text-neutral-300 space-y-2">
                <li class="flex justify-between"><span class="font-medium">Caja inicial:</span> <span class="font-bold">${{ detallesCajaNegativa.cajaInicial?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">{{ t('summary.income') }}:</span> <span class="font-bold text-red-600">${{ detallesCajaNegativa.ingresos?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">Recaudado:</span> <span class="font-bold text-green-600">${{ detallesCajaNegativa.recaudado?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">Ventas:</span> <span class="font-bold">${{ detallesCajaNegativa.ventas?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">Egresos:</span> <span class="font-bold text-red-600">${{ detallesCajaNegativa.egresos?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">{{ t('summary.withdrawals') }}:</span> <span class="font-bold text-green-600">${{ detallesCajaNegativa.retiros?.toLocaleString() || '0.00' }}</span></li>
              </ul>
            </div>
            <div class="mt-6 flex justify-center">
              <button @click="mostrarModalCajaNegativa = false" class="btn-primary-min px-6 py-2.5">{{ t('common.understood') }}</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de confirmación para reportar Id -->
    <Teleport to="body">
      <div v-if="mostrarModalReportarCedula" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="cerrarModalReportarCedula"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-indigo-200/50 dark:border-indigo-700/50 transition-all duration-300">
          <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-indigo-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-8 h-8 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 class="text-xl font-bold text-neutral-900 dark:text-slate-100">{{ t('reports.reportId') }}</h2>
            </div>
          </div>
          <div class="p-6">
            <p class="text-base text-neutral-700 dark:text-slate-300 mb-2 leading-relaxed">
              {{ t('reports.confirm') }} <strong class="text-indigo-600 dark:text-indigo-400">{{ clienteParaReportar?.cc }}</strong>?
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {{ t('reports.actionDescription') }}
            </p>
            <div class="mb-3">
              <span class="block text-sm font-semibold text-neutral-700 dark:text-slate-300 mb-2">
                {{ t('reports.presetTitle') }}
              </span>
              <div class="flex flex-col gap-2.5">
                <label
                  v-for="opt in opcionesMotivoReporte"
                  :key="opt.value"
                  class="flex items-start gap-2.5 cursor-pointer rounded-lg px-2 py-1.5 -mx-2 hover:bg-indigo-50/80 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  <input
                    v-model="motivoReportePreset"
                    type="radio"
                    :value="opt.value"
                    class="mt-1 text-indigo-600 border-gray-400 focus:ring-indigo-500"
                  />
                  <span class="text-sm text-neutral-800 dark:text-slate-200 leading-snug">{{ opt.label }}</span>
                </label>
              </div>
            </div>
            <div v-if="motivoReportePreset === 'other'" class="mb-4">
              <label class="block text-sm font-semibold text-neutral-700 dark:text-slate-300 mb-2">
                {{ t('reports.detailOptional') }}
              </label>
              <textarea
                v-model="motivoReporte"
                :placeholder="t('reports.reasonPlaceholder')"
                rows="3"
                class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-neutral-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-200"
              ></textarea>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button 
                type="button"
                @click="cerrarModalReportarCedula" 
                class="px-5 py-2.5 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-all duration-200 shadow-sm"
              >
                {{ t('common.cancel') }}
              </button>
              <button 
                @click="confirmarReportarCedula" 
                class="px-5 py-2.5 text-white bg-indigo-700 hover:bg-indigo-800 border-2 border-indigo-800/60 rounded-lg font-semibold transition-all duration-200 shadow-md"
              >
                {{ t('common.confirm') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de éxito/error para reportar Id -->
    <Teleport to="body">
      <div v-if="mostrarModalResultadoReporte" class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-40 dark:bg-black dark:bg-opacity-60 flex items-center justify-center z-[9999]" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999;">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mx-4 transition-colors duration-300" style="position: relative; z-index: 10000;">
          <div class="flex items-center gap-3 mb-4">
            <svg v-if="resultadoReporte.exito" class="w-8 h-8 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else class="w-8 h-8 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 class="text-lg font-bold text-neutral-900 dark:text-slate-100">
              {{ resultadoReporte.exito ? 'Id Reportado' : 'Error' }}
            </h2>
          </div>
          <p class="text-neutral-700 dark:text-slate-300 mb-4">
            {{ resultadoReporte.mensaje }}
          </p>
          <div class="flex justify-center mt-5">
            <button 
              @click="mostrarModalResultadoReporte = false; resultadoReporte = { exito: false, mensaje: '' }" 
              class="btn-primary-min px-5 py-2"
            >
              {{ t('common.understood') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <div
      ref="vendedorScrollEl"
      class="p-3 md:p-4 w-full max-w-full min-w-0 box-border overflow-x-clip md:overflow-y-auto pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div v-if="!rutaAbierta" class="flex flex-col items-center justify-center min-h-[300px]">
        <button
          @click="solicitarAperturaRuta"
          class="btn-primary-min px-6 py-3"
        >
          {{ t('route.open') }}
        </button>
        <div class="mt-4 text-neutral-500 dark:text-neutral-400">{{ t('common.mustOpenRoute') }}</div>
      </div>
      <div v-else>
          <div
            v-if="rutaAbierta && dashboardLoadError"
            class="mb-4 p-4 rounded-xl border-2 border-amber-300 dark:border-amber-700/80 bg-amber-50 dark:bg-amber-950/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            role="alert"
          >
            <p class="text-sm text-amber-950 dark:text-amber-100/95 pr-1">{{ t('common.loadDataFailed') }}</p>
            <button
              type="button"
              @click="actualizarDashboard"
              :disabled="actualizandoDatos"
              class="shrink-0 px-4 py-2.5 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {{ t('common.retryLoad') }}
            </button>
          </div>
        <div class="flex flex-col gap-2 md:gap-3 mb-3 md:mb-6">
          <div class="flex justify-start items-center gap-2">
        <button
          @click="irACrearCliente"
              class="btn-primary-min"
        >
              {{ t('client.newClient') }}
        </button>
        <button
          @click="abrirOrdenarClientes"
              class="btn-secondary-min"
        >
          {{ t('client.sortClients') }}
        </button>
      </div>
          <!-- Resumen con pagos / no pagos (ruta actual), visible arriba -->
          <div
            v-if="clientesEnRuta.length > 0"
            class="p-3 rounded-lg bg-neutral-100 dark:bg-slate-700/50 border border-neutral-200 dark:border-slate-600/80"
          >
            <div class="flex items-center gap-2 md:gap-3 text-sm md:text-base text-neutral-700 dark:text-slate-300 flex-wrap">
              <span class="flex items-center gap-1.5">
                <span>{{ t('client.summaryWithPayments') }}:</span>
                <span class="font-semibold text-neutral-900 dark:text-slate-100">{{ clientesConPagos.length }}</span>
                <span class="text-neutral-500 dark:text-slate-400 text-sm">({{ porcentajeConPagos }}%)</span>
              </span>
              <span class="text-neutral-400 dark:text-slate-500" aria-hidden="true">·</span>
              <span class="flex items-center gap-1.5">
                <span>{{ t('client.summaryNoPaymentOnly') }}:</span>
                <span class="font-semibold text-neutral-900 dark:text-slate-100">{{ clientesRegistroSinCobroNoPago.length }}</span>
                <span class="text-neutral-500 dark:text-slate-400 text-sm">({{ porcentajeRegistroSinCobroNoPago }}%)</span>
              </span>
              <span class="text-neutral-400 dark:text-slate-500" aria-hidden="true">·</span>
              <span class="flex items-center gap-1.5">
                <span>{{ t('client.summaryNewSales') }}:</span>
                <span class="font-semibold text-neutral-900 dark:text-slate-100">{{ clientesVentasNuevasResumen.length }}</span>
                <span class="text-neutral-500 dark:text-slate-400 text-sm">({{ porcentajeVentasNuevasResumen }}%)</span>
              </span>
              <span class="text-neutral-400 dark:text-slate-500" aria-hidden="true">·</span>
              <span class="flex items-center gap-1.5">
                <span>{{ t('client.summaryPendingNoRecord') }}:</span>
                <span class="font-semibold text-neutral-900 dark:text-slate-100">{{ clientesSinPagos.length }}</span>
                <span class="text-neutral-500 dark:text-slate-400 text-sm">({{ porcentajeNoPagos }}%)</span>
              </span>
            </div>
          </div>
        </div>
        <!-- Lista de clientes dividida en secciones -->
        <div class="space-y-2 md:space-y-5">
          <!-- Clientes sin pagos en ruta actual -->
          <div class="card-min p-2 md:p-3 transition-colors duration-300">
            <h3
              class="text-lg md:text-xl font-semibold text-neutral-800 dark:text-slate-100 mb-2 md:mb-3 flex items-center justify-between cursor-pointer bg-neutral-200 dark:bg-slate-800/40 px-2 py-1.5 md:px-3 md:py-2 rounded-md"
              @click="toggleClientesSinPagos"
              :title="mostrarClientesSinPagos ? t('common.hideSection') : t('common.showSection')"
            >
            <div class="flex items-center">
              <svg class="w-6 h-6 mr-2 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ t('client.clientsPendingNoRouteRecord') }} ({{ clientesSinPagos.length }})
            </div>
            <div class="p-1 rounded transition-colors">
              <svg 
                class="w-6 h-6 text-neutral-600 dark:text-slate-300 transition-transform duration-200"
                :class="{ 'rotate-180': !mostrarClientesSinPagos }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </h3>
          <div v-if="mostrarClientesSinPagos" class="mt-3">
          <!-- Campo de búsqueda -->
          <div class="mb-2 md:mb-4">
            <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-2">{{ t('common.searchClient') }}</label>
            <div class="relative">
              <input
                v-model="filtroBusquedaSinPagos"
                type="text"
                :placeholder="t('common.searchClientPlaceholder')"
                class="w-full pl-10 pr-10 py-2 border-2 border-neutral-400 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-neutral-500 bg-neutral-50 dark:bg-slate-800/50 text-neutral-900 dark:text-slate-100 shadow-sm"
                @keyup.enter="() => {}"
              />
              <button
                @click="() => {}"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-slate-400 hover:text-neutral-600 dark:hover:text-slate-300 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button
                v-if="filtroBusquedaSinPagos"
                type="button"
                @click.stop="filtroBusquedaSinPagos = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-slate-400 hover:text-neutral-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-full hover:bg-neutral-200 dark:hover:bg-slate-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p v-if="filtroBusquedaSinPagos && clientesSinPagosBuscados.length > 0" class="text-sm text-neutral-600 dark:text-slate-300 mt-2">
              {{ t('common.searchResultsCount', { count: clientesSinPagosBuscados.length }) }}
            </p>
            <p v-else-if="filtroBusquedaSinPagos && clientesSinPagosBuscados.length === 0" class="text-sm text-red-600 dark:text-red-400 mt-2">
              {{ t('common.noSearchResults') }}
            </p>
          </div>
          <div v-if="clientesSinPagos.length === 0" class="text-neutral-500 dark:text-neutral-400 text-center py-4">
            {{ t('client.allClientsHaveRouteRecord') }}
          </div>
          <DashboardClientesDosColumnas
            v-else
            :list="clientesSinPagosBuscados"
            :item-key="(c, i) => c._id || `sin-pago-${i}`"
          >
            <template #default="{ item: c, index: i }">
            <div
              :class="[
                'flex flex-col items-start rounded-lg border-2 border-neutral-300 dark:border-slate-600/80 border-l-[4px] p-2 sm:p-2.5 md:p-3 cursor-pointer shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-800/60 min-w-0',
                i % 2 === 0 ? 'bg-white dark:bg-slate-800/60' : 'bg-neutral-50 dark:bg-slate-800/50',
                calcularParcelasAtrasadas(c) >= 6
                  ? 'border-l-red-500 dark:border-l-red-400'
                  : calcularParcelasAtrasadas(c) >= 4
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
                      calcularParcelasAtrasadas(c) >= 6
                        ? 'focus-visible:ring-red-600 dark:focus-visible:ring-white'
                        : calcularParcelasAtrasadas(c) >= 4
                        ? 'focus-visible:ring-yellow-600 dark:focus-visible:ring-white'
                        : 'focus-visible:ring-emerald-600 dark:focus-visible:ring-white',
                    ]"
                    @click.stop="toggleDesplegar(i)"
                    :title="t('common.expandCardHint')"
                    :aria-expanded="desplegados[i] ? 'true' : 'false'"
                  >
                    <div class="cliente-expand-icon-ring rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                  :class="[
                    'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
                          calcularParcelasAtrasadas(c) >= 6
                            ? 'text-red-500 dark:text-red-400'
                            : calcularParcelasAtrasadas(c) >= 4
                            ? 'text-yellow-500 dark:text-yellow-400'
                            : 'text-emerald-500 dark:text-emerald-400'
                  ]"
                >
                  <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                </svg>
              </div>
                    <div class="flex items-center gap-1 mt-1">
                      <span class="text-xs text-neutral-800 dark:text-slate-200 font-semibold text-center">{{ desplegados[i] ? t('common.hide') : t('common.showMore') }}</span>
                      <svg class="w-4 h-4 text-neutral-500 dark:text-slate-400 flex-shrink-0 transition-transform duration-200" :class="{ 'rotate-180': desplegados[i] }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  <div class="flex-1 min-w-0">
                    <div class="font-bold text-base md:text-lg text-gray-800 dark:text-gray-100">
                  {{ c.nombres }} {{ c.apellidos }}
                </div>
                    <div v-if="c.apodo" class="text-neutral-700 dark:text-slate-300 font-medium text-sm">({{ c.apodo }})</div>
                  </div>
                  </div>
                <div class="mt-2 md:mt-3 text-sm text-neutral-800 dark:text-slate-200 divide-y divide-neutral-300 dark:divide-slate-600">
                  <div class="flex items-baseline justify-between py-0.5 md:py-1">
                    <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.sale') }}</span>
                    <span class="text-black dark:text-white font-bold text-sm md:text-base">${{ c.valor }} ({{ c.dias }} días)</span>
                  </div>
                  <div class="flex items-baseline justify-between py-0.5 md:py-1">
                    <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.initialBalance') }}</span>
                    <span class="text-black dark:text-white font-bold text-sm md:text-base">${{ c.saldo_inicial }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-0.5 md:py-1">
                    <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.remainingBalance') }}</span>
                    <span class="text-black dark:text-white font-bold text-sm md:text-base">${{ c.total }}</span>
                  </div>
                  <div class="flex items-start justify-between gap-2 py-0.5 md:py-1">
                    <span class="shrink-0 font-bold text-neutral-900 dark:text-slate-100">{{ t('client.installmentValue') }}</span>
                    <span class="flex min-w-0 flex-col items-end gap-0.5 text-right">
                      <span class="inline-flex flex-wrap items-center justify-end gap-2 text-sm font-bold text-black dark:text-white md:text-base">
                        <span
                          v-if="esClienteNuevoEnRuta(c)"
                          class="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold border bg-teal-50 text-teal-900 border-teal-400/45 dark:bg-teal-900/45 dark:text-teal-100 dark:border-teal-500/50"
                          :title="t('client.newBadgeTitle')"
                        >
                          {{ t('client.newBadge') }}
                        </span>
                        <span
                          v-if="esClienteRenovadoEnRuta(c)"
                          class="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold border bg-blue-100 text-blue-900 border-blue-400/40 dark:bg-blue-900/55 dark:text-blue-100 dark:border-blue-500/50"
                          :title="t('client.renewedBadgeTitle')"
                        >
                          {{ t('client.renewedBadge') }}
                        </span>
                        <span
                          v-if="c.frecuencia && c.frecuencia.toLowerCase() !== 'diaria'"
                          class="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold border"
                          :class="{
                            'bg-indigo-50 text-indigo-900 border-indigo-400/45 dark:bg-indigo-900/45 dark:text-indigo-100 dark:border-indigo-500/50': c.frecuencia.toLowerCase() === 'semanal',
                            'bg-cyan-50 text-cyan-900 border-cyan-400/45 dark:bg-cyan-900/45 dark:text-cyan-100 dark:border-cyan-500/50': c.frecuencia.toLowerCase() === 'quincenal',
                            'bg-amber-50 text-amber-900 border-amber-400/45 dark:bg-amber-900/45 dark:text-amber-100 dark:border-amber-500/50': c.frecuencia.toLowerCase() === 'mensual'
                          }"
                        >
                          {{ c.frecuencia }}
                        </span>
                        <span
                          v-if="textoComparacionRenovacion(c)"
                          class="inline-flex items-center px-1.5 py-0.5 rounded text-[0.65rem] font-bold border bg-blue-50 text-blue-800 border-blue-300/60 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-600/50"
                          :title="textoComparacionRenovacion(c)"
                        >
                          {{ textoComparacionRenovacion(c) }}
                        </span>
                        <span
                          v-if="c.finalizadoPendiente === true"
                          class="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold border bg-red-100 text-red-900 border-red-400/50 dark:bg-red-900/60 dark:text-red-100 dark:border-red-500/60"
                          title="Este cliente finalizó su pago en esta ruta"
                        >
                          Finalizado
                        </span>
                        <span
                          v-if="montoPagadoEnRutaActual(c) > 0"
                          class="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold tabular-nums border bg-emerald-50 text-emerald-800 border-emerald-500/40 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700/50"
                          :title="t('client.paidThisRoute')"
                        >
                          ${{ formatNum(montoPagadoEnRutaActual(c), 2) }}
                        </span>
                        <span
                          v-else-if="esNoPagoEnRutaActual(c)"
                          class="inline-flex items-center px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold tabular-nums border bg-red-50 text-red-800 border-red-500/40 dark:bg-red-900/45 dark:text-red-200 dark:border-red-700/50"
                          :title="t('payment.types.noPayment')"
                        >
                          ${{ formatNum(0, 2) }}
                        </span>
                        <span>${{ valorParcelaVisibleTarjeta(c) }}</span>
                      </span>
                    </span>
                  </div>
                  <!-- Info extra desplegable (antes de los botones para que los botones queden abajo) -->
                  <div v-if="desplegados[i]" class="mt-1 border-t pt-1 text-sm text-neutral-800 dark:text-slate-200 divide-y divide-neutral-300 dark:divide-neutral-500">
                    <div class="flex items-baseline justify-between py-1">
                      <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.installmentsPaid') }}</span>
                      <span class="text-black dark:text-white font-bold text-base">{{ calcularParcelasPagadas(c) }}</span>
                    </div>
                    <div class="flex items-baseline justify-between py-1">
                      <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.pendingInstallments') }}</span>
                      <span class="text-black dark:text-white font-bold text-base">{{ calcularParcelasPendientes(c) }}</span>
                    </div>
                    <div class="flex items-baseline justify-between py-1">
                      <div class="flex items-center gap-4">
                        <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.overdueInstallments') }}</span>
                        <span class="text-black dark:text-white font-bold">{{ calcularParcelasAtrasadas(c) }}</span>
                        <span class="text-neutral-400 dark:text-neutral-500">|</span>
                        <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.visits') || 'Visitas' }}</span>
                        <span class="text-black dark:text-white font-bold">{{ c.visitas ?? 0 }}</span>
                      </div>
                    </div>
                    <div class="flex items-baseline justify-between py-1">
                      <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.id') }}</span>
                      <span class="text-black dark:text-white font-bold text-base">{{ c.cc }}</span>
                    </div>
                    <div class="flex items-baseline justify-between py-1">
                      <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.residentialAddress') }}</span>
                      <span class="text-black dark:text-white font-bold text-base text-right">{{ resumirDireccion(c.direccion_residencial) }}</span>
                    </div>
                    <div class="flex items-baseline justify-between py-1">
                      <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.commercialAddress') }}</span>
                      <span class="text-black dark:text-white font-bold text-base text-right">{{ resumirDireccion(c.direccion) }}</span>
                    </div>
                    <div class="flex items-baseline justify-between py-1">
                      <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.phone') }}</span>
                      <span class="text-black dark:text-white font-bold text-base">{{ c.celular }}</span>
                    </div>
                    <div class="flex items-baseline justify-between py-1">
                      <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.creationDate') }}</span>
                      <span class="text-black dark:text-white font-bold text-base">{{ c.fecha }}</span>
                    </div>
                    <!-- Secundarias: misma lógica que admin — grid 3, encima de la fila principal (solo al expandir) -->
                    <div class="grid grid-cols-3 gap-1 sm:gap-2 pt-1 mt-1 md:pt-1.5 md:mt-1.5 border-t border-neutral-300 dark:border-slate-500 min-w-0 w-full">
                      <button
                        type="button"
                        @click.stop="verPagosCliente(c)"
                        class="vendedor-secondary-action-btn border border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 hover:bg-neutral-200 dark:hover:bg-slate-500"
                      >
                        <span class="vendedor-secondary-action-inner">
                          <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          <span class="vendedor-secondary-action-label">{{ t('client.viewPayments') }}</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        @click.stop="editarPagoCliente(c)"
                        class="vendedor-secondary-action-btn border border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 hover:bg-neutral-200 dark:hover:bg-slate-500"
                      >
                        <span class="vendedor-secondary-action-inner">
                          <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          <span class="vendedor-secondary-action-label">{{ t('client.editPayment') }}</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        @click.stop="reportarCliente(c)"
                        class="vendedor-secondary-action-btn border border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 hover:bg-neutral-200 dark:hover:bg-slate-500"
                      >
                        <span class="vendedor-secondary-action-inner">
                          <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          <span class="vendedor-secondary-action-label">{{ t('client.report') }}</span>
                        </span>
                      </button>
                    </div>
                  </div>
                  <!-- Principales: Pago, Historial, Llamar (siempre visibles; alineado con admin) -->
                  <div class="grid grid-cols-3 gap-1 sm:gap-1.5 pt-2 mt-2 md:pt-3 md:mt-3 border-t border-gray-200 dark:border-gray-600 items-stretch w-full min-w-0">
                    <button
                      type="button"
                      @click.stop="irAPagos(c)"
                      :disabled="tieneClienteActivoConMismaCedula(c)"
                      :class="[
                        'flex flex-col items-center justify-center gap-0.5 md:gap-1 w-full min-w-0 min-h-[3.1rem] px-1 py-2 sm:min-h-[3.35rem] md:min-h-[4rem] sm:px-2 sm:py-3 rounded-xl text-xs font-semibold box-border transition-all',
                        tieneClienteActivoConMismaCedula(c)
                          ? 'bg-neutral-400 cursor-not-allowed opacity-60 text-white'
                          : 'btn-primary-min'
                      ]"
                    >
                      <svg class="w-[1.15rem] h-[1.15rem] sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="vendedor-primary-action-label">{{ t('client.payment') }}</span>
                    </button>
                    <button
                      type="button"
                      @click.stop="irHistorialCliente(c)"
                      class="flex flex-col items-center justify-center gap-0.5 md:gap-1 w-full min-w-0 min-h-[3.1rem] px-1 py-2 sm:min-h-[3.35rem] md:min-h-[4rem] sm:px-2 sm:py-3 rounded-xl border border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-slate-500 shadow-sm transition-colors box-border"
                    >
                      <svg class="w-[1.15rem] h-[1.15rem] sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="vendedor-primary-action-label">{{ t('history.button') }}</span>
                    </button>
                    <button
                      type="button"
                      @click.stop="llamarCliente(c)"
                      class="flex flex-col items-center justify-center gap-0.5 md:gap-1 w-full min-w-0 min-h-[3.1rem] px-1 py-2 sm:min-h-[3.35rem] md:min-h-[4rem] sm:px-2 sm:py-3 rounded-xl border-2 border-blue-300 dark:border-slate-400 bg-blue-50 dark:bg-slate-600 text-blue-900 dark:text-slate-100 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-slate-500 shadow-sm transition-colors box-border"
                    >
                      <svg class="w-[1.15rem] h-[1.15rem] sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span class="vendedor-primary-action-label">{{ t('client.call') }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </template>
          </DashboardClientesDosColumnas>
          </div>
          </div>

          <DashboardClientesSeccionDivider :aria-label="t('client.dashboardListsDividerAria')" />

          <!-- Clientes con pagos en ruta actual -->
          <div class="card-min p-2 md:p-3 lg:p-4 transition-colors duration-300">
            <h3
              class="text-lg md:text-xl font-semibold text-neutral-800 dark:text-slate-100 mb-2 md:mb-3 flex items-center justify-between cursor-pointer bg-neutral-200 dark:bg-slate-800/40 px-2 py-1.5 md:px-3 md:py-2 rounded-md"
              @click="toggleClientesConPagos"
              :title="mostrarClientesConPagos ? t('common.hideSection') : t('common.showSection')"
            >
            <div class="flex items-center">
                <svg class="w-6 h-6 mr-2 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ t('client.clientsRouteActivity') }} ({{ clientesConPagosOrdenados.length }})
              </div>
            <div class="p-1 rounded transition-colors">
              <svg 
                class="w-6 h-6 text-neutral-600 dark:text-slate-300 transition-transform duration-200"
                :class="{ 'rotate-180': !mostrarClientesConPagos }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </h3>
          <div v-if="mostrarClientesConPagos" class="mt-2 md:mt-4">
            <!-- Campo de búsqueda -->
            <div class="mb-2 md:mb-4">
              <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-2">{{ t('common.searchClient') }}</label>
              <div class="relative">
              <input
                v-model="filtroBusquedaConPagos"
                type="text"
                :placeholder="t('common.searchClientPlaceholder')"
                class="w-full pl-10 pr-10 py-2 border-2 border-neutral-400 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-neutral-500 bg-neutral-50 dark:bg-slate-800/50 text-neutral-900 dark:text-slate-100 shadow-sm"
                @keyup.enter="() => {}"
              />
                <button
                  @click="() => {}"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-slate-400 hover:text-neutral-600 dark:hover:text-slate-300 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              <button
                v-if="filtroBusquedaConPagos"
                type="button"
                @click.stop="filtroBusquedaConPagos = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-slate-400 hover:text-neutral-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-full hover:bg-neutral-200 dark:hover:bg-slate-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              </div>
              <p v-if="filtroBusquedaConPagos && clientesConPagosBuscados.length > 0" class="text-sm text-neutral-600 dark:text-slate-300 mt-2">
                {{ t('common.searchResultsCount', { count: clientesConPagosBuscados.length }) }}
              </p>
              <p v-else-if="filtroBusquedaConPagos && clientesConPagosBuscados.length === 0" class="text-sm text-red-600 dark:text-red-400 mt-2">
                {{ t('common.noSearchResults') }}
              </p>
            </div>
            <div v-if="clientesConPagosOrdenados.length === 0" class="text-neutral-500 dark:text-neutral-400 text-center py-4">
              {{ t('client.noRouteActivityClients') }}
            </div>
            <DashboardClientesDosColumnas
              v-else
              :list="clientesConPagosBuscados"
              wide-gap
              :item-key="(c, i) => c._id || `con-pago-${i}`"
            >
              <template #default="{ item: c, index: i }">
              <div
              :class="[
                'flex flex-col items-start rounded-lg border-2 border-neutral-300 dark:border-slate-600/80 border-l-[4px] p-2 sm:p-2.5 md:p-3 lg:p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-800/60 min-w-0',
                i % 2 === 0 ? 'bg-white dark:bg-slate-800/60' : 'bg-neutral-50 dark:bg-slate-800/50',
                calcularParcelasAtrasadas(c) >= 6
                  ? 'border-l-red-500 dark:border-l-red-400'
                  : calcularParcelasAtrasadas(c) >= 4
                  ? 'border-l-yellow-500 dark:border-l-yellow-400'
                  : 'border-l-emerald-500 dark:border-l-emerald-400',
              ]"
            >
              <div class="w-full min-w-0">
                <div class="flex items-center gap-2 md:gap-3">
                  <button
                    type="button"
                    :class="[
                      'flex-shrink-0 flex flex-col items-center rounded-xl p-1.5 md:p-2 -m-1 transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-slate-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800 active:scale-[0.98] cliente-expand-toggle',
                      calcularParcelasAtrasadas(c) >= 6
                        ? 'focus-visible:ring-red-600 dark:focus-visible:ring-white'
                        : calcularParcelasAtrasadas(c) >= 4
                        ? 'focus-visible:ring-yellow-600 dark:focus-visible:ring-white'
                        : 'focus-visible:ring-emerald-600 dark:focus-visible:ring-white',
                    ]"
                    @click.stop="toggleDesplegar(i + clientesSinPagos.length)"
                    :title="t('common.expandCardHint')"
                    :aria-expanded="desplegados[i + clientesSinPagos.length] ? 'true' : 'false'"
                  >
                    <div class="cliente-expand-icon-ring rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        :class="[
                          'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
                          calcularParcelasAtrasadas(c) >= 6
                            ? 'text-red-500 dark:text-red-400'
                            : calcularParcelasAtrasadas(c) >= 4
                            ? 'text-yellow-500 dark:text-yellow-400'
                            : 'text-emerald-500 dark:text-emerald-400',
                        ]"
                      >
                        <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="flex items-center gap-1 mt-1">
                      <span class="text-xs text-gray-500 dark:text-gray-300 font-medium text-center">{{ desplegados[i + clientesSinPagos.length] ? t('common.hide') : t('common.showMore') }}</span>
                      <svg class="w-4 h-4 text-gray-400 dark:text-slate-500 flex-shrink-0 transition-transform duration-200" :class="{ 'rotate-180': desplegados[i + clientesSinPagos.length] }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  <div class="flex-1 min-w-0">
                    <div class="font-bold text-base md:text-lg text-gray-800 dark:text-gray-100">
                  {{ c.nombres }} {{ c.apellidos }}
                    </div>
                    <div v-if="c.apodo" class="text-neutral-700 dark:text-slate-300 font-medium text-sm">({{ c.apodo }})</div>
                  </div>
                </div>
                <div class="mt-2 md:mt-3 text-sm md:text-base text-neutral-800 dark:text-slate-200 divide-y divide-neutral-300 dark:divide-slate-600">
                  <div class="flex items-baseline justify-between py-0.5 md:py-1">
                    <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.sale') }}</span>
                    <span class="text-black dark:text-white font-bold text-sm md:text-lg">${{ c.valor }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-0.5 md:py-1">
                    <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.initialBalance') }}</span>
                    <span class="text-black dark:text-white font-bold text-sm md:text-lg">${{ c.saldo_inicial }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-0.5 md:py-1">
                    <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.remainingBalance') }}</span>
                    <span class="text-black dark:text-white font-bold text-sm md:text-lg">${{ c.total }}</span>
                  </div>
                  <div class="flex items-start justify-between gap-2 py-0.5 md:py-1">
                    <span class="shrink-0 font-bold text-neutral-900 dark:text-slate-100">{{ t('client.installmentValue') }}</span>
                    <span class="flex min-w-0 flex-col items-end gap-0.5 text-right">
                      <span class="inline-flex flex-wrap items-center justify-end gap-2 text-sm font-bold text-black dark:text-white md:text-lg">
                        <span
                          v-if="esClienteNuevoEnRuta(c)"
                          class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border bg-teal-50 text-teal-900 border-teal-400/45 dark:bg-teal-900/45 dark:text-teal-100 dark:border-teal-500/50"
                          :title="t('client.newBadgeTitle')"
                        >
                          {{ t('client.newBadge') }}
                        </span>
                        <span
                          v-if="esClienteRenovadoEnRuta(c)"
                          class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border bg-blue-100 text-blue-900 border-blue-400/40 dark:bg-blue-900/55 dark:text-blue-100 dark:border-blue-500/50"
                          :title="t('client.renewedBadgeTitle')"
                        >
                          {{ t('client.renewedBadge') }}
                        </span>
                        <span
                          v-if="c.frecuencia && c.frecuencia.toLowerCase() !== 'diaria'"
                          class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border"
                          :class="{
                            'bg-indigo-50 text-indigo-900 border-indigo-400/45 dark:bg-indigo-900/45 dark:text-indigo-100 dark:border-indigo-500/50': c.frecuencia.toLowerCase() === 'semanal',
                            'bg-cyan-50 text-cyan-900 border-cyan-400/45 dark:bg-cyan-900/45 dark:text-cyan-100 dark:border-cyan-500/50': c.frecuencia.toLowerCase() === 'quincenal',
                            'bg-amber-50 text-amber-900 border-amber-400/45 dark:bg-amber-900/45 dark:text-amber-100 dark:border-amber-500/50': c.frecuencia.toLowerCase() === 'mensual'
                          }"
                        >
                          {{ c.frecuencia }}
                        </span>
                        <span
                          v-if="textoComparacionRenovacion(c)"
                          class="inline-flex items-center px-1.5 py-0.5 rounded text-[0.65rem] font-bold border bg-blue-50 text-blue-800 border-blue-300/60 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-600/50"
                          :title="textoComparacionRenovacion(c)"
                        >
                          {{ textoComparacionRenovacion(c) }}
                        </span>
                        <span
                          v-if="c.finalizadoPendiente === true"
                          class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border bg-red-100 text-red-900 border-red-400/50 dark:bg-red-900/60 dark:text-red-100 dark:border-red-500/60"
                          title="Este cliente finalizó su pago en esta ruta"
                        >
                          Finalizado
                        </span>
                        <span
                          v-if="montoPagadoEnRutaActual(c) > 0"
                          class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold tabular-nums border bg-emerald-50 text-emerald-800 border-emerald-500/40 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700/50"
                          :title="t('client.paidThisRoute')"
                        >
                          ${{ formatNum(montoPagadoEnRutaActual(c), 2) }}
                        </span>
                        <span
                          v-else-if="esNoPagoEnRutaActual(c)"
                          class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold tabular-nums border bg-red-50 text-red-800 border-red-500/40 dark:bg-red-900/45 dark:text-red-200 dark:border-red-700/50"
                          :title="t('payment.types.noPayment')"
                        >
                          ${{ formatNum(0, 2) }}
                        </span>
                        <span>${{ valorParcelaVisibleTarjeta(c) }}</span>
                      </span>
                      <span class="text-xs font-medium leading-tight text-neutral-700 dark:text-slate-300">({{ c.saldo_inicial }}/{{ c.dias }} días)</span>
                    </span>
                  </div>
                  
                </div>
                <!-- Info extra desplegable -->
                <div v-if="desplegados[i + clientesSinPagos.length]" class="mt-2 border-t pt-2 text-base text-neutral-800 dark:text-slate-200 divide-y divide-neutral-300 dark:divide-neutral-500">
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.pendingInstallments') }}</span>
                    <span class="text-black dark:text-white font-bold text-lg">{{ calcularParcelasPendientes(c) }}</span>
                </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.overdueInstallments') }}</span>
                    <span class="text-black dark:text-white font-bold text-lg">{{ calcularParcelasAtrasadas(c) }}</span>
              </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.visits') || 'Visitas' }}</span>
                    <span class="text-black dark:text-white font-bold text-lg">{{ c.visitas ?? 0 }}</span>
            </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.id') }}</span>
                    <span class="text-black dark:text-white font-bold text-lg">{{ c.cc }}</span>
          </div>
                  <!-- Direcciones -->
                  <div v-if="c.direccion_residencial" class="py-2">
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <span class="font-bold text-neutral-900 dark:text-neutral-100 block mb-1">{{ t('address.residential') }}</span>
                        <p class="text-sm text-neutral-700 dark:text-neutral-300">{{ resumirDireccion(c.direccion_residencial) }}</p>
        </div>
                      <button 
                        @click.stop="verEnMapa(c.coordenadas_residencial, c.direccion_residencial)"
                        class="ml-3 px-3 py-1.5 border-2 border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 text-xs font-semibold rounded hover:bg-neutral-200 dark:hover:bg-slate-500 shadow-sm transition-colors flex items-center gap-1 flex-shrink-0"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {{ t('address.viewOnMap') }}
                      </button>
                    </div>
                  </div>
                  
                  <div v-if="c.direccion" class="py-2">
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <span class="font-bold text-neutral-900 dark:text-neutral-100 block mb-1">{{ t('address.commercial') }}</span>
                        <p class="text-sm text-neutral-700 dark:text-neutral-300">{{ resumirDireccion(c.direccion) }}</p>
                      </div>
                      <button 
                        @click.stop="verEnMapa(c.coordenadas_comercial, c.direccion)"
                        class="ml-3 px-3 py-1.5 border-2 border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 text-xs font-semibold rounded hover:bg-neutral-200 dark:hover:bg-slate-500 shadow-sm transition-colors flex items-center gap-1 flex-shrink-0"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {{ t('address.viewOnMap') }}
                      </button>
                    </div>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.phone') }}</span>
                    <span class="text-black dark:text-white font-bold text-lg">{{ c.celular }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-neutral-900 dark:text-slate-100">{{ t('client.date') }}</span>
                    <span class="text-black dark:text-white font-bold text-lg">{{ c.fecha }}</span>
                  </div>
                  
                  <!-- Secundarias: grid 3 encima de la principal (solo al expandir; misma lógica que admin) -->
                  <div class="grid grid-cols-3 gap-1 sm:gap-2 pt-1.5 mt-1.5 md:pt-2 md:mt-2 border-t border-neutral-300 dark:border-slate-500 min-w-0 w-full">
                    <button
                      type="button"
                      @click.stop="verPagosCliente(c)"
                      class="vendedor-secondary-action-btn border border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 hover:bg-neutral-200 dark:hover:bg-slate-500"
                    >
                      <span class="vendedor-secondary-action-inner">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        <span class="vendedor-secondary-action-label">{{ t('client.viewPayments') }}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      @click.stop="editarPagoCliente(c)"
                      class="vendedor-secondary-action-btn border border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 hover:bg-neutral-200 dark:hover:bg-slate-500"
                    >
                      <span class="vendedor-secondary-action-inner">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        <span class="vendedor-secondary-action-label">{{ t('client.editPayment') }}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      @click.stop="reportarCliente(c)"
                      class="vendedor-secondary-action-btn border border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 hover:bg-neutral-200 dark:hover:bg-slate-500"
                    >
                      <span class="vendedor-secondary-action-inner">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <span class="vendedor-secondary-action-label">{{ t('client.report') }}</span>
                      </span>
                    </button>
                  </div>
                </div>
                <!-- Principales: Pago, Historial, Llamar (siempre visibles) -->
                <div class="grid grid-cols-3 gap-1 sm:gap-1.5 pt-2 mt-2 md:pt-3 md:mt-3 border-t border-gray-200 dark:border-gray-600 items-stretch w-full min-w-0">
                  <button
                    type="button"
                    @click.stop="irAPagos(c)"
                    :disabled="tieneClienteActivoConMismaCedula(c)"
                    :class="[
                      'flex flex-col items-center justify-center gap-0.5 md:gap-1 w-full min-w-0 min-h-[3.1rem] px-1 py-2 sm:min-h-[3.35rem] md:min-h-[4rem] sm:px-2 sm:py-3 rounded-xl text-xs font-semibold box-border transition-all',
                      tieneClienteActivoConMismaCedula(c)
                        ? 'bg-neutral-400 cursor-not-allowed opacity-60 text-white'
                        : 'btn-primary-min'
                    ]"
                  >
                    <svg class="w-[1.15rem] h-[1.15rem] sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="vendedor-primary-action-label">{{ t('client.payment') }}</span>
                  </button>
                  <button
                    type="button"
                    @click.stop="irHistorialCliente(c)"
                    class="flex flex-col items-center justify-center gap-0.5 md:gap-1 w-full min-w-0 min-h-[3.1rem] px-1 py-2 sm:min-h-[3.35rem] md:min-h-[4rem] sm:px-2 sm:py-3 rounded-xl border border-neutral-400 dark:border-slate-400 bg-neutral-100 dark:bg-slate-600 text-neutral-800 dark:text-slate-100 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-slate-500 shadow-sm transition-colors box-border"
                  >
                    <svg class="w-[1.15rem] h-[1.15rem] sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="vendedor-primary-action-label">{{ t('history.button') }}</span>
                  </button>
                  <button
                    type="button"
                    @click.stop="llamarCliente(c)"
                    class="flex flex-col items-center justify-center gap-0.5 md:gap-1 w-full min-w-0 min-h-[3.1rem] px-1 py-2 sm:min-h-[3.35rem] md:min-h-[4rem] sm:px-2 sm:py-3 rounded-xl border-2 border-blue-300 dark:border-slate-400 bg-blue-50 dark:bg-slate-600 text-blue-900 dark:text-slate-100 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-slate-500 shadow-sm transition-colors box-border"
                  >
                    <svg class="w-[1.15rem] h-[1.15rem] sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span class="vendedor-primary-action-label">{{ t('client.call') }}</span>
                  </button>
                </div>
              </div>
            </div>
            </template>
            </DashboardClientesDosColumnas>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
  <HistorialVentasClienteModal
    :show="!!modalHistorialVentas"
    :historial="modalHistorialVentas"
    :refreshing="modalHistorialVentasRefreshing"
    @close="cerrarModalHistorialVentas"
  />
  <ResumenCierreModal
    :show="mostrarResumenCierre"
    v-bind="datosResumenCierre || {}"
    @close="cerrarResumenCierre"
  />
  <!-- Modal Ordenar Clientes -->
  <Teleport to="body">
    <div v-if="mostrarOrdenarClientes" class="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
      <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="cerrarOrdenarClientes"></div>
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90dvh] flex flex-col overflow-hidden">
        <div class="shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 class="text-lg font-bold text-neutral-900 dark:text-slate-100">{{ t('client.sortClients') || 'Ordenar Clientes' }}</h2>
          <button @click="cerrarOrdenarClientes" class="text-neutral-400 hover:text-neutral-600 dark:hover:text-slate-300 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="overflow-y-auto overscroll-contain flex-1 p-2 sm:p-4 space-y-1.5">
          <div
            v-for="(item, idx) in ordenClientesLista"
            :key="item.cliente._id"
            class="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-neutral-100 dark:hover:bg-slate-700/60 transition-colors"
          >
            <button
              type="button"
              class="shrink-0 flex flex-col items-center justify-center w-9 h-9 rounded-md hover:bg-neutral-200 dark:hover:bg-slate-600 text-neutral-500 dark:text-slate-400 transition-colors disabled:opacity-20"
              :disabled="idx === 0"
              @click="moverArriba(idx)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
            </button>
            <input
              v-model.number="item.posicion"
              type="number"
              inputmode="numeric"
              min="1"
              :max="ordenClientesLista.length"
              class="hide-spinners w-12 sm:w-14 text-center font-bold text-sm border border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-gray-700 text-neutral-900 dark:text-slate-100 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @change="onPosicionChange(idx)"
            />
            <button
              type="button"
              class="shrink-0 flex flex-col items-center justify-center w-9 h-9 rounded-md hover:bg-neutral-200 dark:hover:bg-slate-600 text-neutral-500 dark:text-slate-400 transition-colors disabled:opacity-20"
              :disabled="idx === ordenClientesLista.length - 1"
              @click="moverAbajo(idx)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <span class="text-sm font-medium text-neutral-800 dark:text-slate-200 truncate min-w-0 flex-1">
              {{ item.cliente.nombres }} {{ item.cliente.apellidos }}
            </span>
            <span class="text-[11px] text-neutral-400 dark:text-slate-500 shrink-0">
              {{ item.cliente.cc }}
            </span>
          </div>
        </div>
        <div class="shrink-0 flex items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-gray-900">
          <button
            @click="cerrarOrdenarClientes"
            class="px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-slate-300 bg-white dark:bg-gray-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            @click="guardarOrdenClientes"
            class="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {{ t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>

import API_BASE_URL from '../config/api.js'
import { consultarEstadoRuta, getUserTimezone } from '../utils/rutaUtils.js'
import { fetchPagosAndClientesForVendor } from '../utils/vendedorParallelFetch.js'
import { ref, onMounted, onActivated, onDeactivated, onUnmounted, watch, computed, nextTick, defineOptions } from 'vue'
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NavbarVendedor from '../components/NavbarVendedor.vue'
import HistorialVentasClienteModal from '../components/HistorialVentasClienteModal.vue'
import ResumenCierreModal from '../components/ResumenCierreModal.vue'
import DashboardClientesDosColumnas from '../components/DashboardClientesDosColumnas.vue'
import DashboardClientesSeccionDivider from '../components/DashboardClientesSeccionDivider.vue'
import { useAppScrollRoot } from '../composables/useAppScrollRoot.js'
// MapaSimple eliminado - ahora usamos botones para abrir Google Maps
import { useClienteStore } from '../stores/useClienteStore'

defineOptions({ name: 'VendedorDashboard' })

const { t, locale } = useI18n()

const router = useRouter()
const route = useRoute()
const clientes = ref([])
const desplegados = ref([])
const mostrarClientesConPagos = ref(true)
const mostrarClientesSinPagos = ref(true)
const pagos = ref([])
const clienteStore = useClienteStore()

const vendedorId = localStorage.getItem('vendedorId')
const vendedorScrollEl = ref(null)
const appScrollRoot = useAppScrollRoot()

// Formato consistente para montos en dashboards (evita errores si no existe un helper global)
function formatNum(n, dec = 2) {
  const num = Number(n)
  if (!isFinite(num)) return (0).toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec })
  return num.toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}
const rutaAbierta = ref(false)
const cargandoRuta = ref(true)
const mostrarModalApertura = ref(false)
const mostrarModalCierre = ref(false)
const mostrarModalPendientes = ref(false)
const mostrarResumenCierre = ref(false)
const datosResumenCierre = ref(null)
const pendientesClientes = ref([])
const mostrarModalCajaNegativa = ref(false)
const mensajeCajaNegativa = ref('')
const detallesCajaNegativa = ref(null)
const mostrarModalReportarCedula = ref(false)
const clienteParaReportar = ref(null)
const motivoReporte = ref('')
/** none | delays | notFound | other */
const motivoReportePreset = ref('none')
const mostrarOrdenarClientes = ref(false)
const ordenClientesLista = ref([])

const opcionesMotivoReporte = computed(() => {
  void locale.value
  return [
    { value: 'none', label: t('reports.preset.none') },
    { value: 'delays', label: t('reports.preset.delays') },
    { value: 'notFound', label: t('reports.preset.notFound') },
    { value: 'other', label: t('reports.preset.other') }
  ]
})

watch(motivoReportePreset, (val) => {
  if (val !== 'other') motivoReporte.value = ''
})

const mostrarModalResultadoReporte = ref(false)
const resultadoReporte = ref({ exito: false, mensaje: '' })
/** Historial de ventas / ciclos (mismo modal que admin e Historial clientes) */
const modalHistorialVentas = ref(null)
const modalHistorialVentasRefreshing = ref(false)
let debounceHistorialModalTimer = null
const actualizandoDatos = ref(false)
/** Fallo de red o servidor al cargar pagos/clientes en el último intento */
const dashboardLoadError = ref(false)
const rutaActualId = ref(null)
const rutaAnteriorId = ref(null) // Última ruta cerrada, para ordenar "clientes sin pagos" como en esa ruta
const rutaAnteriorDatos = ref(null)
let pollingInterval = null
const rutaActualDatos = ref(null)

// Variables para búsqueda de clientes
const filtroBusquedaSinPagos = ref('')
const filtroBusquedaConPagos = ref('')

// Helper: verifica si un cliente tiene al menos un pago en la ruta actual
function tienePagoEnRutaActual(cliente) {
  if (!rutaActualId.value) return false
  const key = `${String(cliente?._id || '')}|${String(rutaActualId.value)}`
  return pagosIndex.value.pagosPorClienteRuta.has(key)
}

function creadoEnRutaActual(cliente) {
  if (!rutaActualId.value) return false
  return clienteCreadoEnRuta(cliente, rutaActualDatos.value)
}

function msOrdenCliente(cliente) {
  if (cliente?.createdAt) {
    const d = new Date(cliente.createdAt)
    if (!isNaN(d.getTime())) return d.getTime()
  }
  const id = cliente?._id != null ? String(cliente._id) : ''
  if (id.length === 24 && /^[a-f0-9]+$/i.test(id)) {
    const sec = parseInt(id.slice(0, 8), 16)
    if (Number.isFinite(sec)) return sec * 1000
  }
  return null
}

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

function getHoyDiaSemana() {
  return DIAS_SEMANA[new Date().getDay()]
}

function semanaRelativaDesdeInicioRuta() {
  if (!rutaActualDatos.value?.fechaApertura) return 0
  const start = new Date(rutaActualDatos.value.fechaApertura)
  const now = new Date()
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 7)
}

function mostrarClienteHoy(cliente) {
  // Mostrar siempre clientes creados hoy para que aparezcan el dÃ­a de su creaciÃ³n
  if (cliente.createdAt) {
    const creado = new Date(cliente.createdAt).toDateString()
    if (creado === new Date().toDateString()) return true
  }
  const freq = (cliente.frecuencia || 'Diaria').toLowerCase()
  if (freq === 'diaria' || !freq) return true
  if (!cliente.diaPago) return true
  const hoy = getHoyDiaSemana()
  const diaPago = cliente.diaPago.toLowerCase()
  if (hoy !== diaPago) return false
  if (freq === 'semanal') return true
  if (freq === 'quincenal') return semanaRelativaDesdeInicioRuta() % 2 === 0
  if (freq === 'mensual') return semanaRelativaDesdeInicioRuta() % 4 === 0
  return true
}

function clienteCreadoEnRuta(cliente, rutaDatos) {
  const inicio = rutaDatos?.fechaApertura ? new Date(rutaDatos.fechaApertura).getTime() : null
  const fin = rutaDatos?.fechaCierre ? new Date(rutaDatos.fechaCierre).getTime() : Date.now()
  const createdAt = msOrdenCliente(cliente)
  if (!inicio || !createdAt) return false
  return createdAt >= inicio && createdAt <= fin
}

/** Igual que resumen "Nuevos": alta en esta ruta, sin renovación y no cancelado */
function esClienteNuevoEnRuta(c) {
  return creadoEnRutaActual(c) && !c?.renovado && !c?.cancelado
}

/** Igual que resumen "Renovados": alta en esta ruta con flag renovado, no cancelado */
function esClienteRenovadoEnRuta(c) {
  return creadoEnRutaActual(c) && !!c?.renovado && !c?.cancelado
}

function textoComparacionRenovacion(c) {
  if (!esClienteRenovadoEnRuta(c) || c.valorPrevioRenovacion == null) return ''
  const prev = Number(c.valorPrevioRenovacion) || 0
  const cur = Number(c.valor) || 0
  const diff = cur - prev
  if (Math.abs(diff) < 0.01) return '='
  const fmt = (n) => '$' + Math.abs(n).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return diff > 0 ? `↑ ${fmt(diff)}` : `↓ ${fmt(diff)}`
}

// Criterio robusto: cualquier registro (cualquier tipo) en la ruta cuenta como visita/registro.
// El backend impone 1 pago por (cliente, ruta), así que esto es suficiente y evita errores por textos/capitalización.
function tieneRegistroVisitaEnRutaActual(cliente) {
  // Clientes creados hoy cuentan como registrados aunque no haya ruta activa
  if (cliente?.createdAt) {
    const creado = new Date(cliente.createdAt).toDateString()
    if (creado === new Date().toDateString()) return true
  }
  return tienePagoEnRutaActual(cliente) || creadoEnRutaActual(cliente)
}

/**
 * Momento estable de "primer evento" en una ruta: alta/renovación del cliente o primer pago/no pago.
 * No usa p.fecha editable como primera opción, para que corregir un pago no reordene la lista.
 */
function ordenPrimerEventoEnRutaMs(cliente, rutaId, rutaDatos = null) {
  if (!rutaId) return -1
  const key = `${String(cliente?._id || '')}|${String(rutaId)}`
  const candidates = []
  const msPago = pagosIndex.value.primerRegistroMsPorClienteRuta.get(key)
  if (typeof msPago === 'number' && !Number.isNaN(msPago)) candidates.push(msPago)
  if (rutaDatos && clienteCreadoEnRuta(cliente, rutaDatos)) {
    const msCliente = msOrdenCliente(cliente)
    if (typeof msCliente === 'number' && !Number.isNaN(msCliente)) candidates.push(msCliente)
  }
  return candidates.length ? Math.min(...candidates) : -1
}

// Una sola base: clientes que cuentan para la ruta actual
const clientesEnRuta = computed(() => {
  if (!rutaActualId.value) {
    return clientes.value.filter(c => c.estado !== 'finalizado' && !c.cancelado)
  }
  const inicio = rutaActualDatos.value?.fechaApertura ? new Date(rutaActualDatos.value.fechaApertura).getTime() : null
  const fin = rutaActualDatos.value?.fechaCierre ? new Date(rutaActualDatos.value.fechaCierre).getTime() : Date.now()

  return clientes.value.filter(cliente => {
    if (cliente.estado === 'finalizado' && !cliente.finalizadoPendiente && !cliente.cancelado) return false
    if (cliente.cancelado && !cliente.finalizadoPendiente && inicio) {
      const clienteCreado = new Date(cliente.createdAt).getTime()
      const creadoEnRutaActual = clienteCreado >= inicio && clienteCreado <= fin
      if (!creadoEnRutaActual && !tienePagoEnRutaActual(cliente)) return false
    }
    if (cliente.finalizadoPendiente && !cliente.cancelado && inicio) {
      const clienteCreado = new Date(cliente.createdAt).getTime()
      const creadoEnRutaActual = clienteCreado >= inicio && clienteCreado <= fin
      if (!creadoEnRutaActual && !tienePagoEnRutaActual(cliente)) return false
    }
    // Fase 2: filtrar por día de pago
    if (!mostrarClienteHoy(cliente)) return false
    return true
  })
})

// "Con pagos" = al menos una Parcela o Abono en la ruta actual (dinero recaudado).
// "Sin pagos" (pendientes) = sin ningún registro de visita en la ruta (Parcela, Abono, No pago, No aplica).
// Clientes solo con No pago/No aplica van a la segunda lista junto a quienes sí cobraron.
function tieneParcelaOAbonoEnRuta(cliente) {
  if (!rutaActualId.value) return false
  return pagos.value.some(pago => {
    const clienteIdPago = typeof pago.cliente === 'object' ? pago.cliente?._id : pago.cliente
    const rutaIdPago = typeof pago.ruta === 'object' ? pago.ruta?._id : pago.ruta
    const mismoClienteYRuta = String(clienteIdPago) === String(cliente._id) && String(rutaIdPago) === String(rutaActualId.value)
    const tipo = String(pago.tipo || '').trim().toLowerCase()
    const tipoValido = tipo === 'parcela' || tipo === 'abono'
    return mismoClienteYRuta && tipoValido
  })
}

function montoPagadoEnRutaActual(cliente) {
  if (!rutaActualId.value) return 0
  const key = `${String(cliente?._id || '')}|${String(rutaActualId.value)}`
  return pagosIndex.value.montoPorClienteRuta.get(key) || 0
}

function idClienteEnPago(p) {
  const c = p?.cliente
  if (c && typeof c === 'object' && c._id) return String(c._id)
  return String(c ?? '')
}

function idRutaEnPago(p) {
  const r = p?.ruta
  if (r && typeof r === 'object' && r._id) return String(r._id)
  return String(r ?? '')
}

/** Estable ante ediciones de `fecha`: createdAt → timestamp incrustado en ObjectId → fecha */
function msOrdenRegistroPago(p) {
  if (p?.createdAt) {
    const d = new Date(p.createdAt)
    if (!isNaN(d.getTime())) return d.getTime()
  }
  const id = p?._id != null ? String(p._id) : ''
  if (id.length === 24 && /^[a-f0-9]+$/i.test(id)) {
    const sec = parseInt(id.slice(0, 8), 16)
    if (Number.isFinite(sec)) return sec * 1000
  }
  if (p?.fecha) {
    const d = new Date(p.fecha)
    if (!isNaN(d.getTime())) return d.getTime()
  }
  return null
}

/** Pagos del cliente en la ruta abierta actual (puede haber varios si el modelo lo permite). */
function pagosClienteEnRutaActual(cliente) {
  if (!rutaActualId.value) return []
  const cid = String(cliente?._id || '')
  const rid = String(rutaActualId.value)
  return (pagos.value || []).filter((p) => idClienteEnPago(p) === cid && idRutaEnPago(p) === rid)
}

/**
 * El registro más reciente en esta ruta es "No pago" → badge rojo $0 (misma posición que el cobro en verde).
 */
function esNoPagoEnRutaActual(cliente) {
  const list = pagosClienteEnRutaActual(cliente)
  if (!list.length) return false
  const sorted = [...list].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  return String(sorted[0]?.tipo || '').trim().toLowerCase() === 'no pago'
}

function valorParcelaVisibleTarjeta(c) {
  if (esNoPagoEnRutaActual(c)) return formatNum(0, 2)
  return c.parcela
}

const pagosIndex = computed(() => {
  const pagosPorClienteIdMap = new Map()
  const pagosPorClienteRuta = new Set()
  const montoPorClienteRuta = new Map()
  /** Primer alta en BD por (cliente|ruta); estable ante ediciones de p.fecha */
  const primerRegistroMsPorClienteRuta = new Map()

  for (const p of pagos.value || []) {
    const cid = idClienteEnPago(p)
    const rid = idRutaEnPago(p)
    if (cid) {
      const arr = pagosPorClienteIdMap.get(cid)
      if (arr) arr.push(p)
      else pagosPorClienteIdMap.set(cid, [p])
    }
    if (cid && rid) {
      const k = `${cid}|${rid}`
      pagosPorClienteRuta.add(k)

      const tipo = String(p?.tipo || '').trim().toLowerCase()
      if (tipo === 'parcela' || tipo === 'abono') {
        const prev = montoPorClienteRuta.get(k) || 0
        montoPorClienteRuta.set(k, prev + (Number(p?.valor) || 0))
      }

      const ms = msOrdenRegistroPago(p)
      if (ms != null) {
        const prevMs = primerRegistroMsPorClienteRuta.get(k)
        if (prevMs == null || ms < prevMs) primerRegistroMsPorClienteRuta.set(k, ms)
      }
    }
  }

  // ordenar por fecha solo una vez por cliente (para atrasos)
  for (const [cid, arr] of pagosPorClienteIdMap.entries()) {
    arr.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    pagosPorClienteIdMap.set(cid, arr)
  }

  return {
    pagosPorClienteIdMap,
    pagosPorClienteRuta,
    montoPorClienteRuta,
    primerRegistroMsPorClienteRuta
  }
})
const clientesConPagos = computed(() => clientesEnRuta.value.filter(c => tieneParcelaOAbonoEnRuta(c)))
const clientesSoloRegistroSinCobro = computed(() =>
  clientesEnRuta.value.filter(c => tieneRegistroVisitaEnRutaActual(c) && !tieneParcelaOAbonoEnRuta(c))
)
/** Alta en esta ruta, sin fila en pagos todavía (primera gestión pendiente). */
const clientesVentasNuevasResumen = computed(() =>
  clientesEnRuta.value.filter(
    (c) => creadoEnRutaActual(c) && !tieneParcelaOAbonoEnRuta(c) && !tienePagoEnRutaActual(c)
  )
)
/** Sin cobro parcela/abono pero con algún otro registro en ruta (No pago, No aplica, etc.); no cuenta ventas nuevas sin ningún pago. */
const clientesRegistroSinCobroNoPago = computed(() =>
  clientesEnRuta.value.filter((c) => {
    if (!tieneRegistroVisitaEnRutaActual(c) || tieneParcelaOAbonoEnRuta(c)) return false
    if (creadoEnRutaActual(c) && !tienePagoEnRutaActual(c)) return false
    return true
  })
)
const clientesSinPagos = computed(() => clientesEnRuta.value.filter(c => !tieneRegistroVisitaEnRutaActual(c)))

// Pendientes: orden según primer registro en la ruta cerrada anterior (misma secuencia al abrir la nueva ruta).
function ordenSinPagosComparable(cliente) {
  const ms = ordenPrimerEventoEnRutaMs(cliente, rutaAnteriorId.value, rutaAnteriorDatos.value)
  if (ms >= 0) return ms
  if (cliente.createdAt) return new Date(cliente.createdAt).getTime()
  return 0
}
const clientesSinPagosOrdenados = computed(() => {
  const list = [...clientesSinPagos.value]
  return list.sort((a, b) => {
    const oa = a.orden || 0
    const ob = b.orden || 0
    if (oa !== ob) return oa - ob
    const ha = ordenSinPagosComparable(a)
    const hb = ordenSinPagosComparable(b)
    if (ha !== hb) return ha - hb
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return ta - tb
  })
})
// Con registro en ruta: orden por primer evento en esa ruta, sin separar por tipo de registro.
function ordenConPagosComparable(cliente) {
  const ms = ordenPrimerEventoEnRutaMs(cliente, rutaActualId.value, rutaActualDatos.value)
  if (ms >= 0) return ms
  if (cliente.createdAt) return new Date(cliente.createdAt).getTime()
  return 0
}
const clientesConPagosOrdenados = computed(() => {
  return [...clientesConPagos.value, ...clientesSoloRegistroSinCobro.value].sort((a, b) => {
    const oa = a.orden || 0
    const ob = b.orden || 0
    if (oa !== ob) return oa - ob
    const ta = ordenConPagosComparable(a)
    const tb = ordenConPagosComparable(b)
    if (ta !== tb) return ta - tb
    const tta = msOrdenCliente(a) || 0
    const ttb = msOrdenCliente(b) || 0
    return tta - ttb
  })
})

// Porcentajes sobre todos los clientes en ruta
const porcentajeConPagos = computed(() => {
  const total = clientesEnRuta.value.length
  if (total === 0) return 0
  return Math.round((clientesConPagos.value.length / total) * 100)
})
const porcentajeRegistroSinCobroNoPago = computed(() => {
  const total = clientesEnRuta.value.length
  if (total === 0) return 0
  return Math.round((clientesRegistroSinCobroNoPago.value.length / total) * 100)
})
const porcentajeVentasNuevasResumen = computed(() => {
  const total = clientesEnRuta.value.length
  if (total === 0) return 0
  return Math.round((clientesVentasNuevasResumen.value.length / total) * 100)
})
const porcentajeNoPagos = computed(() => {
  const total = clientesEnRuta.value.length
  if (total === 0) return 0
  return Math.round((clientesSinPagos.value.length / total) * 100)
})

// Variables computadas para filtrar clientes según búsqueda (mantienen el orden: sin pagos por hora en ruta pasada, con pagos por hora en ruta actual)
const clientesSinPagosBuscados = computed(() => {
  if (!filtroBusquedaSinPagos.value) return clientesSinPagosOrdenados.value

  const busqueda = filtroBusquedaSinPagos.value.toLowerCase()
  return clientesSinPagosOrdenados.value.filter(cliente => {
    return (
      cliente?.nombres?.toLowerCase().includes(busqueda) ||
      cliente?.apellidos?.toLowerCase().includes(busqueda) ||
      cliente?.apodo?.toLowerCase().includes(busqueda) ||
      cliente?.cc?.toLowerCase().includes(busqueda)
    )
  })
})

const clientesConPagosBuscados = computed(() => {
  if (!filtroBusquedaConPagos.value) return clientesConPagosOrdenados.value

  const busqueda = filtroBusquedaConPagos.value.toLowerCase()
  return clientesConPagosOrdenados.value.filter(cliente => {
    return (
      cliente?.nombres?.toLowerCase().includes(busqueda) ||
      cliente?.apellidos?.toLowerCase().includes(busqueda) ||
      cliente?.apodo?.toLowerCase().includes(busqueda) ||
      cliente?.cc?.toLowerCase().includes(busqueda)
    )
  })
})

/** Lista blanca clientes vista asesor: usa pagos actuales + ruta abierta ya cargada por consultarRuta */
function aplicarFiltroClientesVendedor(todos) {
  if (!Array.isArray(todos)) return []
  return todos.filter((c) => {
    const noCancelado = !c.cancelado
    const esFinalizadoPendiente = c.finalizadoPendiente === true
    let canceladoConPagosEnRuta = false
    if (c.cancelado && rutaActualId.value) {
      canceladoConPagosEnRuta = pagos.value.some((pago) => {
        const clienteIdPago =
          typeof pago.cliente === 'object' ? pago.cliente?._id : pago.cliente
        const rutaIdPago = typeof pago.ruta === 'object' ? pago.ruta?._id : pago.ruta
        return (
          String(clienteIdPago) === String(c._id) &&
          String(rutaIdPago) === String(rutaActualId.value)
        )
      })
    }
    return noCancelado || esFinalizadoPendiente || canceladoConPagosEnRuta
  })
}

// Función para actualizar datos del dashboard
// Una sola recarga en vuelo + pagos/clientes en paralelo con rutas (menos tiempo total)
let dashboardCargaEnCurso = null
async function actualizarDashboard() {
  if (dashboardCargaEnCurso) {
    return dashboardCargaEnCurso
  }
  dashboardCargaEnCurso = (async () => {
    let exito = true
    try {
      actualizandoDatos.value = true
      dashboardLoadError.value = false
      const vid = localStorage.getItem('vendedorId')
      if (!vid) {
        pagos.value = []
        clientes.value = []
        return
      }

      const dataPromise = fetchPagosAndClientesForVendor(vid)
      await Promise.all([consultarRuta(), dataPromise])

      const { pagosList, todos, pagosOk, clientesOk } = await dataPromise

      pagos.value = pagosList
      clientes.value = aplicarFiltroClientesVendedor(todos)

      exito = pagosOk && clientesOk
      if (!exito) {
        dashboardLoadError.value = true
      }
    } catch (error) {
      console.error('❌ Error actualizando dashboard:', error)
      dashboardLoadError.value = true
      exito = false
    } finally {
      actualizandoDatos.value = false
    }
  })()
  try {
    await dashboardCargaEnCurso
  } finally {
    dashboardCargaEnCurso = null
  }
}

async function consultarRuta() {
  cargandoRuta.value = true
  try {
    const [estadoRuta, anteriorResult] = await Promise.all([
      consultarEstadoRuta(),
      fetch(`${API_BASE_URL}/api/rutas/anterior/${vendedorId}`)
        .then((resAnterior) => (resAnterior.ok ? resAnterior.json().catch(() => null) : null))
        .catch(() => null)
    ])
    const data = estadoRuta?.abierta ? estadoRuta.ruta : null
    const dataAnterior = anteriorResult

    const nuevaRutaAbierta = !!data
    const nuevoRutaActualId = data?._id || null
    rutaActualDatos.value = data || null
    rutaAnteriorId.value = dataAnterior?._id || null
    rutaAnteriorDatos.value = dataAnterior || null

    if (nuevaRutaAbierta !== rutaAbierta.value) {
      if (nuevaRutaAbierta) {
        window.dispatchEvent(new CustomEvent('ruta-abierta'))
      } else {
        window.dispatchEvent(new CustomEvent('ruta-cerrada'))
      }
    }
    rutaAbierta.value = nuevaRutaAbierta
    rutaActualId.value = nuevoRutaActualId
  } catch (error) {
    console.error('Error consultando ruta:', error)
    rutaAnteriorId.value = null
    rutaAnteriorDatos.value = null
  } finally {
  cargandoRuta.value = false
  }
}

function solicitarAperturaRuta() {
  mostrarModalApertura.value = true
}

async function abrirRuta() {
  const res = await fetch(`${API_BASE_URL}/api/rutas/abrir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendedorId, timezone: getUserTimezone() })
  });
  if (res.ok) {
    mostrarModalApertura.value = false
    // Recargar estado de ruta y todos los datos desde la base de datos
    await actualizarDashboard()
    // Disparar evento para que otras vistas se actualicen
    window.dispatchEvent(new CustomEvent('ruta-abierta'))
  } else {
    const data = await res.json().catch(() => ({}))
    if (data?.error === 'RUTA_YA_ABIERTA') {
      // La ruta ya estaba abierta → actualizar UI en vez de mostrar alerta
      mostrarModalApertura.value = false
      await actualizarDashboard()
      window.dispatchEvent(new CustomEvent('ruta-abierta'))
    } else {
      alert(data.msg || data.error || 'No se pudo abrir la ruta')
    }
  }
}

function cerrarRuta() {
  mostrarModalCierre.value = true
}

function cerrarResumenCierre() {
  mostrarResumenCierre.value = false
  datosResumenCierre.value = null
  actualizarDashboard()
  window.dispatchEvent(new CustomEvent('ruta-cerrada'))
}

async function confirmarCierreRuta() {
  // Fase 3: solo clientes esperados hoy bloquean el cierre
  const pendientesHoy = clientesSinPagos.value.filter(c => mostrarClienteHoy(c))
  if (pendientesHoy.length > 0) {
    pendientesClientes.value = pendientesHoy.map(c => ({ id: c._id, nombres: c.nombres, apellidos: c.apellidos }))
    mostrarModalPendientes.value = true
    return
  }
  const tz = getUserTimezone()
  const res = await fetch(`${API_BASE_URL}/api/rutas/cerrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendedorId, timezone: tz })
  });
  if (res.ok) {
    mostrarModalCierre.value = false
    const rutaCerrada = await res.json().catch(() => null)
    const rutaIdCerrada = rutaCerrada?._id
    try {
      const vid = localStorage.getItem('vendedorId')
      const qs = rutaIdCerrada ? `?rutaId=${rutaIdCerrada}&` : '?'
      const panelRes = await fetch(`${API_BASE_URL}/api/vendedores/${vid}/panel${qs}_ts=${Date.now()}`, { cache: 'no-store' })
      if (panelRes.ok) {
        const panel = await panelRes.json()
        datosResumenCierre.value = {
          vendedorNombre: panel.vendedor?.nombre || '',
          ruta: panel.ruta || {},
          resumen: panel.resumen || {}
        }
        mostrarResumenCierre.value = true
      } else {
        await actualizarDashboard()
        window.dispatchEvent(new CustomEvent('ruta-cerrada'))
      }
    } catch {
      await actualizarDashboard()
      window.dispatchEvent(new CustomEvent('ruta-cerrada'))
    }
  } else {
    const errorData = await res.json().catch(() => null)
    mostrarModalCierre.value = false
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

// Debounce: varios eventos seguidos (p. ej. ruta-abierta + actualizar-dashboard + navegación) → una sola recarga
let debounceDashboardTimer = null
function actualizarDashboardEventos() {
  if (debounceDashboardTimer) clearTimeout(debounceDashboardTimer)
  debounceDashboardTimer = setTimeout(() => {
    debounceDashboardTimer = null
    actualizarDashboard()
  }, 220)
}

/** Sincronización con cambios hechos en otra pestaña / por el admin (los CustomEvent no cruzan ventanas). */
const SYNC_POLL_MS = 20000
let syncPollTimer = null
function onVendorDashboardVisibility() {
  if (document.visibilityState === 'visible') {
    actualizarDashboardEventos()
  }
}

async function refrescarModalHistorialVentasSiAbierto() {
  const vid = localStorage.getItem('vendedorId')
  const cid = modalHistorialVentas.value?.cliente?._id
  if (!vid || !cid || !modalHistorialVentas.value) return
  modalHistorialVentasRefreshing.value = true
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/historial-clientes/vendedor/${encodeURIComponent(vid)}/cliente/${encodeURIComponent(String(cid))}?_t=${Date.now()}`,
      { cache: 'no-store' }
    )
    const data = await res.json().catch(() => null)
    if (res.ok && data) modalHistorialVentas.value = data
  } catch (e) {
    console.error('Refresco historial modal:', e)
  } finally {
    modalHistorialVentasRefreshing.value = false
  }
}

function scheduleHistorialModalSync() {
  if (!modalHistorialVentas.value) return
  if (debounceHistorialModalTimer) clearTimeout(debounceHistorialModalTimer)
  debounceHistorialModalTimer = setTimeout(() => {
    debounceHistorialModalTimer = null
    void refrescarModalHistorialVentasSiAbierto()
  }, 400)
}

/** No pasar actualizarDashboardEventos directo a addEventListener: el 1er arg sería el Event. */
function onWindowDashboardSync() {
  dashboardCargaEnCurso = null
  actualizarDashboardEventos()
  scheduleHistorialModalSync()
}

onMounted(async () => {
  await actualizarDashboard()
  await nextTick()
  if (appScrollRoot) appScrollRoot.value = vendedorScrollEl.value

  // Escuchar eventos para actualizar datos cuando sea necesario
  window.addEventListener('actualizar-dashboard', onWindowDashboardSync)
  window.addEventListener('cliente-creado', onWindowDashboardSync)
  window.addEventListener('cliente-eliminado', onWindowDashboardSync)
  window.addEventListener('pago-registrado', onWindowDashboardSync)
  window.addEventListener('pago-editado', onWindowDashboardSync)
  window.addEventListener('ruta-cerrada', onWindowDashboardSync)
  window.addEventListener('ruta-abierta', onWindowDashboardSync)
  
  // Escuchar evento para ocultar cliente finalizado
  window.addEventListener('ocultar-cliente', (e) => {
    const id = e.detail
    clientes.value = clientes.value.filter(c => c._id !== id)
  })
  
  // Escuchar cambios de idioma para forzar actualización
  window.addEventListener('language-changed', () => {
    // Forzar actualización cuando cambie el idioma
    // La función t() es reactiva, pero podemos forzar un re-render
  })

  document.addEventListener('visibilitychange', onVendorDashboardVisibility)
})

onBeforeRouteUpdate(() => {
  actualizarDashboard()
  clienteStore.limpiarCliente()
})

onActivated(() => {
  dashboardCargaEnCurso = null
  actualizarDashboard()
  if (!syncPollTimer) {
    syncPollTimer = window.setInterval(() => {
      if (document.hidden) return
      actualizarDashboardEventos()
    }, SYNC_POLL_MS)
  }
})

onDeactivated(() => {
  if (syncPollTimer) {
    clearInterval(syncPollTimer)
    syncPollTimer = null
  }
})

// Watcher para forzar actualización cuando cambie el idioma
watch(() => locale.value, () => {
  // Forzar actualización del componente cuando cambie el locale
  // Esto asegura que todas las traducciones se actualicen
})

// Recarga si el usuario cambia algo en la misma vista (ej. query en hash router)
watch(
  () => route.fullPath,
  () => {
    actualizarDashboardEventos()
  }
)

// Limpiar event listeners al desmontar el componente
onUnmounted(() => {
  if (appScrollRoot && appScrollRoot.value === vendedorScrollEl.value) {
    appScrollRoot.value = null
  }
  if (syncPollTimer) {
    clearInterval(syncPollTimer)
    syncPollTimer = null
  }
  document.removeEventListener('visibilitychange', onVendorDashboardVisibility)
  if (debounceDashboardTimer) {
    clearTimeout(debounceDashboardTimer)
    debounceDashboardTimer = null
  }
  if (debounceHistorialModalTimer) {
    clearTimeout(debounceHistorialModalTimer)
    debounceHistorialModalTimer = null
  }
  window.removeEventListener('actualizar-dashboard', onWindowDashboardSync)
  window.removeEventListener('cliente-creado', onWindowDashboardSync)
  window.removeEventListener('cliente-eliminado', onWindowDashboardSync)
  window.removeEventListener('pago-registrado', onWindowDashboardSync)
  window.removeEventListener('pago-editado', onWindowDashboardSync)
  window.removeEventListener('ruta-cerrada', onWindowDashboardSync)
  window.removeEventListener('ruta-abierta', onWindowDashboardSync)
  window.removeEventListener('ocultar-cliente', (e) => {
    const id = e.detail
    clientes.value = clientes.value.filter(c => c._id !== id)
  })
})

// Índices de tarjetas: solo al cambiar tamaños de listas (evita deep-watch costoso por cliente)
watch(
  () =>
    `${clientesSinPagos.value.length}|${clientesConPagos.value.length}|${clientesSoloRegistroSinCobro.value.length}`,
  () => {
    const totalClientes =
      clientesSinPagos.value.length +
      clientesConPagos.value.length +
      clientesSoloRegistroSinCobro.value.length
    if (desplegados.value.length !== totalClientes) {
      desplegados.value = Array(totalClientes).fill(false)
    }
  }
)


function toggleDesplegar(idx) {
  desplegados.value[idx] = !desplegados.value[idx]
}

function irAPagos(cliente) {
  // Validar si hay otro cliente activo con el mismo Id
  if (tieneClienteActivoConMismaCedula(cliente)) {
    alert('No se puede registrar un pago para un cliente finalizado cuando existe otro cobro activo con el mismo Id');
    return;
  }
  
  clienteStore.setCliente(cliente)
  router.push('/pagos')
}

function irAEditarPago(cliente) {
  // Redirigir a la vista de registros donde ya se pueden editar los pagos
  router.push('/registros')
}

function verPagosCliente(cliente) {
  // Ver pagos = ir a Registros con filtro por nombre del cliente
  const nombre = `${cliente?.nombres || ''} ${cliente?.apellidos || ''}`.trim()
  if (!nombre) return
  router.push(`/registros?cliente=${encodeURIComponent(nombre)}`)
}

function cerrarModalHistorialVentas() {
  modalHistorialVentas.value = null
}

/** Historial de ventas / ciclos en modal (igual que administrador), sin salir del dashboard */
async function irHistorialCliente(cliente) {
  const id = cliente?._id
  const vid = localStorage.getItem('vendedorId')
  if (!id || !vid) return
  modalHistorialVentasRefreshing.value = true
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/historial-clientes/vendedor/${encodeURIComponent(vid)}/cliente/${encodeURIComponent(String(id))}?_t=${Date.now()}`,
      { cache: 'no-store' }
    )
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      alert(data?.error || 'No se pudo cargar el historial de ventas')
      return
    }
    modalHistorialVentas.value = data
  } catch (e) {
    console.error(e)
    alert('Error al cargar el historial')
  } finally {
    modalHistorialVentasRefreshing.value = false
  }
}

function llamarCliente(cliente) {
  // Abrir la aplicación de llamadas con el número del cliente
  const numeroTelefono = cliente.celular;
  const urlLlamada = `tel:${numeroTelefono}`;
  // Abrir la aplicación de llamadas
  window.location.href = urlLlamada;
}

function cerrarModalReportarCedula() {
  mostrarModalReportarCedula.value = false
  clienteParaReportar.value = null
  motivoReporte.value = ''
  motivoReportePreset.value = 'none'
}

/** Arma el texto guardado; el comentario libre solo aplica si la opción es "Otro" */
function construirMotivoFinalReporte(cliente) {
  const det = (motivoReporte.value || '').trim()
  const preset = motivoReportePreset.value
  const nombrePartes = [cliente.nombres, cliente.apellidos].map(s => String(s || '').trim()).filter(Boolean)
  const nombreDefault = nombrePartes.length
    ? `Cliente reportado: ${nombrePartes.join(' ')}`
    : `Cliente reportado (Id ${cliente.cc})`

  if (preset === 'none') {
    return nombreDefault
  }
  if (preset === 'other') {
    if (det) return det
    return nombreDefault
  }
  return t(`reports.preset.${preset}`)
}

function reportarCliente(cliente) {
  if (!cliente || !cliente.cc) {
    resultadoReporte.value = {
      exito: false,
      mensaje: 'No se puede reportar: falta información del cliente'
    };
    mostrarModalResultadoReporte.value = true;
    return;
  }
  
  clienteParaReportar.value = cliente;
  motivoReporte.value = '';
  motivoReportePreset.value = 'none';
  mostrarModalReportarCedula.value = true;
}

async function confirmarReportarCedula() {
  const cliente = clienteParaReportar.value
  if (!cliente || !cliente.cc) {
    return;
  }

  const motivoFinal = construirMotivoFinalReporte(cliente)
  const cc = cliente.cc

  mostrarModalReportarCedula.value = false
  motivoReporte.value = ''
  motivoReportePreset.value = 'none'
  clienteParaReportar.value = null
  
  try {
    const vendedorId = localStorage.getItem('vendedorId');
    const res = await fetch(`${API_BASE_URL}/api/cedulas/reportar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cc,
        vendedorId: vendedorId,
        motivo: motivoFinal
      })
    });
    
    const data = await res.json();
    if (res.ok) {
      resultadoReporte.value = {
        exito: true,
        mensaje: `Id ${cc} reportado exitosamente. Al intentar crear un cliente con este Id, se mostrará una advertencia.`
      };
    } else {
      resultadoReporte.value = {
        exito: false,
        mensaje: data.error || 'Error al reportar el Id'
      };
    }
    mostrarModalResultadoReporte.value = true;
  } catch (e) {
    resultadoReporte.value = {
      exito: false,
      mensaje: 'Error de conexión al reportar el Id'
    };
    mostrarModalResultadoReporte.value = true;
  }
}

// Función para resumir una dirección (mostrar solo calle, barrio, ciudad)
function resumirDireccion(direccionCompleta) {
  if (!direccionCompleta) return '';
  
  // Dividir por comas
  const partes = direccionCompleta.split(',').map(p => p.trim());
  
  // Si tiene menos de 3 partes, devolver todo
  if (partes.length <= 3) {
    return direccionCompleta;
  }
  
  // Tomar las primeras 3 partes (generalmente: calle, barrio, ciudad)
  // O las primeras 2 si la primera es muy larga
  if (partes[0].length > 50) {
    // Si la primera parte es muy larga, tomar solo las primeras 2
    return partes.slice(0, 2).join(', ');
  }
  
  // Normalmente: calle, barrio, ciudad
  return partes.slice(0, 3).join(', ');
}

// Función para abrir Google Maps con coordenadas o dirección completa
function verEnMapa(coordenadas, direccionCompleta = null) {
  // Priorizar coordenadas si están disponibles
  if (coordenadas && coordenadas.lat && coordenadas.lng) {
    const url = `https://www.google.com/maps?q=${coordenadas.lat},${coordenadas.lng}`;
    window.open(url, '_blank');
  } 
  // Si no hay coordenadas pero hay dirección completa, usar la dirección
  else if (direccionCompleta) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`;
    window.open(url, '_blank');
  }
}

// Función para verificar si un cliente tiene otro cliente activo con el mismo Id
function tieneClienteActivoConMismaCedula(cliente) {
  // Solo verificar si el cliente está cancelado o tiene finalizadoPendiente: true
  if (!cliente.cancelado && !cliente.finalizadoPendiente) {
    return false; // El cliente está activo, no necesita verificación
  }
  
  // Buscar otro cliente con el mismo Id que esté activo
  const clienteActivo = clientes.value.find(c => {
    return (
      c._id !== cliente._id && // Diferente cliente
      c.cc === cliente.cc && // Mismo Id
      !c.cancelado && // No cancelado
      !c.finalizadoPendiente // No finalizado pendiente
    );
  });
  
  return !!clienteActivo; // Retorna true si existe un cliente activo con el mismo Id
}

function editarPagoCliente(cliente) {
  // Redirigir a Registros: desde ahí se editan los pagos en la ruta
  router.push('/registros');
}

function toggleClientesConPagos() {
  mostrarClientesConPagos.value = !mostrarClientesConPagos.value
}

function toggleClientesSinPagos() {
  mostrarClientesSinPagos.value = !mostrarClientesSinPagos.value
}

function logout() {
  try {
  localStorage.removeItem('rol')
    localStorage.removeItem('adminId')
    localStorage.removeItem('vendedorId')
    localStorage.removeItem('codigoVinculacion')
    localStorage.removeItem('sessionToken')
    localStorage.removeItem('clienteSeleccionado')
  } catch (e) {
  }
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

function irACrearCliente() {
  router.push('/crear-cliente')
}

function calcularTotal(cliente) {
  const valor = parseFloat(cliente.valor) || 0
  const dias = cliente.dias
  const porcentajePorDias = { 11: 0.10, 15: 0.20, 20: 0.20, 24: 0.20, 30: 0.20 }
  const porcentaje = porcentajePorDias[dias] || 0
  return (valor + valor * porcentaje).toFixed(2)
}

function calcularParcela(cliente) {
  const total = parseFloat(calcularTotal(cliente))
  const dias = parseInt(cliente.dias)
  return dias ? (total / dias).toFixed(2) : '0.00'
}

function calcularParcelasPendientes(cliente) {
  const saldo = parseFloat(cliente.total) || 0;
  const parcela = parseFloat(cliente.parcela) || 1;
  return parcela > 0 ? Math.round(saldo / parcela) : 0;
}

function calcularParcelasAtrasadas(cliente) {
  // Fase 4: si hoy no es su día de pago, no contar atrasos
  if (!mostrarClienteHoy(cliente)) return 0
  const idCli = String(cliente?._id || '')
  const pagosCliente = pagosIndex.value.pagosPorClienteIdMap.get(idCli) || []
  if (!pagosCliente.length) return 0

  let atrasos = 0;
  let dias = 0; // Días en los que se debió pagar (No pago o Parcela)
  const valorParcela = parseFloat(cliente.parcela) || 1;

  pagosCliente.forEach(p => {
    const tipo = String(p?.tipo || '').trim().toLowerCase()
    if (tipo === 'no pago') {
      atrasos += 1;
      dias += 1;
    } else if (tipo === 'no aplica') {
      // 'No aplica' no cuenta como atraso ni como día
      // Solo se registra pero no afecta cálculos
    } else if (tipo === 'parcela') {
      dias += 1;
      // Si pagó más de una cuota, el resto cubre atrasos
      const pagadas = p.numParcelas || 1;
      if (pagadas > 1) {
        atrasos = Math.max(0, atrasos - (pagadas - 1));
      }
    } else if (tipo === 'abono') {
      // Un abono cubre cuotas, pero solo el excedente cubre atrasos
      const cuotasPagadas = Math.floor((p.valor || 0) / valorParcela);
      if (cuotasPagadas > 0) {
        // El primer abono cubre el día, el resto cubre atrasos
        if (dias === 0) {
          // Si no hay días, todo va a atrasos
          atrasos = Math.max(0, atrasos - cuotasPagadas);
        } else {
          atrasos = Math.max(0, atrasos - (cuotasPagadas - 1));
        }
        dias += 1;
      }
    }
  });

  return atrasos;
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

function confirmarAperturaRuta() {
  abrirRuta()
}

/* Ordenar Clientes */
function ordenTemporalCliente(cliente) {
  const ms = ordenPrimerEventoEnRutaMs(cliente, rutaActualId.value, rutaActualDatos.value)
  if (ms >= 0) return ms
  const ms2 = ordenPrimerEventoEnRutaMs(cliente, rutaAnteriorId.value, rutaAnteriorDatos.value)
  if (ms2 >= 0) return ms2
  if (cliente.createdAt) return new Date(cliente.createdAt).getTime()
  return 0
}

function abrirOrdenarClientes() {
  const lista = clientesEnRuta.value
    .slice()
    .sort((a, b) => {
      const oa = a.orden || 0
      const ob = b.orden || 0
      if (oa !== ob) return oa - ob
      return ordenTemporalCliente(a) - ordenTemporalCliente(b)
    })
  ordenClientesLista.value = lista.map((cliente, i) => ({
    cliente,
    posicion: i + 1
  }))
  mostrarOrdenarClientes.value = true
}

function cerrarOrdenarClientes() {
  mostrarOrdenarClientes.value = false
  ordenClientesLista.value = []
}

function moverArriba(idx) {
  if (idx <= 0) return
  const arr = ordenClientesLista.value
  const tmp = arr[idx]
  arr[idx] = arr[idx - 1]
  arr[idx - 1] = tmp
  renumerarPosiciones()
}

function moverAbajo(idx) {
  if (idx >= ordenClientesLista.value.length - 1) return
  const arr = ordenClientesLista.value
  const tmp = arr[idx]
  arr[idx] = arr[idx + 1]
  arr[idx + 1] = tmp
  renumerarPosiciones()
}

function renumerarPosiciones() {
  ordenClientesLista.value.forEach((item, i) => {
    item.posicion = i + 1
  })
}

function onPosicionChange(idx) {
  const arr = ordenClientesLista.value
  const item = arr[idx]
  let nuevaPos = Math.round(Number(item.posicion))
  if (isNaN(nuevaPos) || nuevaPos < 1) nuevaPos = 1
  if (nuevaPos > arr.length) nuevaPos = arr.length
  if (nuevaPos === idx + 1) return
  const targetIdx = nuevaPos - 1
  const removed = arr.splice(idx, 1)[0]
  arr.splice(targetIdx, 0, removed)
  renumerarPosiciones()
}

async function guardarOrdenClientes() {
  const vendedorId = localStorage.getItem('vendedorId')
  if (!vendedorId) return
  const ordenes = ordenClientesLista.value.map((item, i) => ({
    _id: item.cliente._id,
    orden: i + 1
  }))
  try {
    const res = await fetch(`${API_BASE_URL}/api/clientes/reordenar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendedorId, ordenes })
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'Error al guardar el orden')
      return
    }
    cerrarOrdenarClientes()
    await actualizarDashboard()
  } catch {
    alert('Error de conexión al guardar el orden')
  }
}
</script>

<style scoped>
/* Ocultar spinners del input number */
.hide-spinners::-webkit-outer-spin-button,
.hide-spinners::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.hide-spinners {
  -moz-appearance: textfield;
}
/* Icono “Ver más”: borde claro + pulso para que se perciba como botón */
.cliente-expand-icon-ring {
  padding: 2px;
  border: 2px solid rgb(107 114 128 / 0.85); /* gris perceptible */
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
/* Respaldo cross-browser: halo siempre visible incluso si box-shadow no se nota */
.cliente-expand-icon-ring > svg {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 0 10px rgb(107 114 128 / 0.22));
}
::global(.dark) .cliente-expand-icon-ring > svg {
  filter: drop-shadow(0 0 12px rgb(203 213 225 / 0.18));
}
::global(.dark) .cliente-expand-icon-ring::after {
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
/* En computador suele ser menos perceptible: subir apenas la intensidad */
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
@media (pointer: fine) {
  .cliente-expand-icon-ring {
    animation-name: cliente-expand-pulse-light-desktop;
  }
  ::global(.dark) .cliente-expand-icon-ring {
    animation-name: cliente-expand-pulse-dark-desktop;
  }
  .cliente-expand-icon-ring::after {
    border-color: rgb(107 114 128 / 0.6);
  }
  ::global(.dark) .cliente-expand-icon-ring::after {
    border-color: rgb(203 213 225 / 0.5);
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

/* Secundarias vendedor: grid compacto tipo admin (icono + texto, sin desbordar) */
.vendedor-secondary-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 3.35rem;
  width: 100%;
  min-width: 0;
  padding: 0.3rem 0.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-align: center;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}
@media (min-width: 640px) {
  .vendedor-secondary-action-btn {
    min-height: 2.85rem;
    padding: 0.45rem 0.5rem;
  }
}
@media (max-width: 767px) {
  .vendedor-secondary-action-btn {
    min-height: 2.55rem;
    padding: 0.18rem 0.15rem;
  }
}
.vendedor-secondary-action-inner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  min-width: 0;
  max-width: 100%;
}
@media (min-width: 640px) {
  .vendedor-secondary-action-inner {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
  }
}
.vendedor-secondary-action-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  display: block;
  max-width: 100%;
  font-size: clamp(0.55rem, 2.65vw, 0.6875rem);
  line-height: 1.15;
  letter-spacing: -0.03em;
}
@media (min-width: 640px) {
  .vendedor-secondary-action-label {
    font-size: 0.75rem;
    text-align: center;
  }
}
.vendedor-primary-action-label {
  text-align: center;
  line-height: 1.15;
  max-width: 100%;
  overflow: hidden;
  word-break: break-word;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
