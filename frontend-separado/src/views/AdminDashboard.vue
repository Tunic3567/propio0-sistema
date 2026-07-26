<template>
  <div
    class="min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-neutral-50 dark:bg-slate-900 transition-theme md:h-[100dvh] md:max-h-[100dvh] md:flex md:flex-col md:overflow-hidden"
  >
    <NavbarAdmin class="shrink-0" @logout="logout" />
    <div
      ref="adminScrollEl"
      class="w-full max-w-full min-w-0 flex-1 min-h-0 bg-neutral-100 dark:bg-slate-900/50 overflow-x-clip transition-theme md:overflow-y-auto overscroll-contain"
    >
      <div
        class="p-3 md:p-6 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div class="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 class="text-lg md:text-xl font-bold text-neutral-900 dark:text-slate-100">
                {{ $t('nav.clients') || 'Clientes' }}
                <span class="text-neutral-500 dark:text-slate-400 font-normal text-base ml-2">
                  ({{ clientesEnRutaAdmin.length }})
                </span>
              </h2>
              <router-link
                v-if="!botonesBloqueados"
                to="/admin/crear-cliente"
                class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors w-fit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Nuevo cliente
              </router-link>
              <span
                v-else
                class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-neutral-400 text-white text-sm font-medium w-fit cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Nuevo cliente
              </span>
                  </div>
                </div>
          <div class="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-end">
            <div class="w-full sm:w-56 md:w-64 shrink-0">
              <label class="block text-xs font-semibold text-neutral-600 dark:text-slate-400 mb-1">
                {{ $t('admin.filterByVendor') }}
              </label>
              <select
                v-model="vendedorFiltro"
                class="w-full px-3 py-3 border-2 border-neutral-400 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-neutral-900 dark:text-slate-100 text-sm"
                @change="cargarClientes"
              >
                <option value="">{{ $t('admin.allVendors') }}</option>
                <option v-for="v in vendedores" :key="v._id" :value="v._id">
                  {{ v.nombre }}<template v-if="v.ciudad"> ({{ v.ciudad }})</template>
                </option>
              </select>
            </div>
            <div class="w-full sm:w-56 md:w-64 shrink-0 relative" data-rutas-dropdown>
              <label class="block text-xs font-semibold text-neutral-600 dark:text-slate-400 mb-1">Ruta</label>
              <button
                type="button"
                class="w-full flex items-center justify-between gap-2 border-2 border-neutral-400 dark:border-slate-600 rounded-lg px-3 py-3 text-sm text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-neutral-900 dark:text-slate-100"
                @click.stop="toggleRutasDropdown"
              >
                <span class="truncate text-xs sm:text-sm">{{ etiquetaRutaSeleccionada }}</span>
                <svg class="w-4 h-4 flex-shrink-0 text-neutral-500 dark:text-slate-400 transition-transform" :class="{ 'rotate-180': rutasDropdownAbierto }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                v-show="rutasDropdownAbierto"
                class="absolute z-50 left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-xl border-2 border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl py-1"
                @click.stop
              >
                <button
                  type="button"
                  class="w-full px-3 py-2.5 text-left border-t border-neutral-200 dark:border-slate-600 first:border-t-0 hover:bg-neutral-100 dark:hover:bg-slate-700/80 transition-colors"
                  :class="!rutaSeleccionadaId ? 'bg-blue-50/90 dark:bg-slate-700 ring-1 ring-inset ring-blue-200 dark:ring-blue-900/50' : ''"
                  @click="abrirTodasLasRutas"
                >
                  <div class="text-sm font-semibold text-neutral-700 dark:text-slate-200">Todas las rutas</div>
                </button>
                <button
                  v-for="r in rutasDisponibles"
                  :key="r._id"
                  type="button"
                  class="w-full px-3 py-2.5 text-left border-t border-neutral-200 dark:border-slate-600 first:border-t-0 hover:bg-neutral-100 dark:hover:bg-slate-700/80 transition-colors"
                  :class="String(rutaSeleccionadaId) === String(r._id) ? 'bg-blue-50/90 dark:bg-slate-700 ring-1 ring-inset ring-blue-200 dark:ring-blue-900/50' : ''"
                  @click="seleccionarRutaDropdown(r._id)"
                >
                  <div class="grid grid-cols-2 gap-2 text-left">
                    <div class="min-w-0">
                      <div class="text-[0.6rem] font-bold uppercase tracking-wide text-green-600 dark:text-green-400 mb-0.5">Apertura</div>
                      <div class="text-xs font-mono tabular-nums font-semibold text-green-800 dark:text-green-300">
                        {{ new Date(r.fechaApertura).toLocaleDateString() }}
                      </div>
                    </div>
                    <div class="min-w-0">
                      <div class="text-[0.6rem] font-bold uppercase tracking-wide text-red-600 dark:text-red-400 mb-0.5">Cierre</div>
                      <div class="text-xs font-mono tabular-nums font-semibold text-red-800 dark:text-red-300">
                        {{ r.fechaCierre ? new Date(r.fechaCierre).toLocaleDateString() : 'Abierta' }}
                      </div>
                    </div>
                  </div>
                  <div class="flex justify-end mt-0.5 -mb-0.5">
                    <button
                      type="button"
                      class="inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-neutral-200 dark:hover:bg-slate-600 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      :title="$t('admin.editDates')"
                      @click.stop="abrirModalFechas(r)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  <div class="text-[0.65rem] text-neutral-500 dark:text-slate-400 mt-0.5 truncate">
                    {{ r.vendedor?.nombre || '' }}<template v-if="r.vendedor?.ciudad"> ({{ r.vendedor.ciudad }})</template>
                  </div>
                </button>
              </div>
            </div>

            <button v-if="rutaSeleccionadaId" @click="limpiarFiltros" class="px-4 py-2 bg-neutral-200 dark:bg-slate-700 hover:bg-neutral-300 dark:hover:bg-slate-600 text-neutral-700 dark:text-slate-200 rounded-lg text-sm font-semibold h-[2.5rem] shrink-0">
              Limpiar
            </button>
            <button
              type="button"
              class="px-3 py-2 rounded-lg text-sm font-semibold border-2 border-neutral-400 dark:border-slate-600 bg-white dark:bg-slate-800 text-neutral-700 dark:text-slate-300 hover:bg-neutral-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
              @click="abrirModalOcultosReportados"
            >
              Ver ocultos y reportados
            </button>
            <button
              type="button"
              class="px-3 py-2 rounded-lg text-sm font-semibold border-2 border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap flex items-center gap-1.5"
              @click="imprimirDerrotero"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
              {{ $t('admin.printRouteSheet') }}
            </button>
          </div>
        </div>

        <div
          v-if="!cargandoClientes && clientesEnRutaAdmin.length === 0"
          class="text-center py-12 text-neutral-500 dark:text-slate-400"
        >
          {{ $t('admin.noClients') || 'No hay clientes para mostrar.' }}
        </div>
        <div v-else class="space-y-3 md:space-y-6">
          <div
            v-if="clientesEnRutaAdmin.length > 0"
            class="p-3 rounded-lg bg-neutral-100 dark:bg-slate-700/50 border border-neutral-200 dark:border-slate-600/80"
          >
            <div class="flex items-center gap-2 md:gap-3 text-sm md:text-base text-neutral-700 dark:text-slate-300 flex-wrap">
              <span class="flex items-center gap-1.5">
                <span>{{ $t('client.summaryWithPayments') }}:</span>
                <span class="font-semibold text-neutral-900 dark:text-slate-100">{{ clientesConPagosConParcelaAbono.length }}</span>
                <span class="text-neutral-500 dark:text-slate-400 text-sm">({{ porcentajeResumenConParcelaAdmin }}%)</span>
              </span>
              <span class="text-neutral-400 dark:text-slate-500" aria-hidden="true">·</span>
              <span class="flex items-center gap-1.5">
                <span>{{ $t('client.summaryNoPaymentOnly') }}:</span>
                <span class="font-semibold text-neutral-900 dark:text-slate-100">{{ clientesRegistroSinCobroNoPagoAdmin.length }}</span>
                <span class="text-neutral-500 dark:text-slate-400 text-sm">({{ porcentajeRegistroSinCobroNoPagoAdmin }}%)</span>
              </span>
              <span class="text-neutral-400 dark:text-slate-500" aria-hidden="true">·</span>
              <span class="flex items-center gap-1.5">
                <span>{{ $t('client.summaryNewSales') }}:</span>
                <span class="font-semibold text-neutral-900 dark:text-slate-100">{{ clientesVentasNuevasResumenAdmin.length }}</span>
                <span class="text-neutral-500 dark:text-slate-400 text-sm">({{ porcentajeVentasNuevasResumenAdmin }}%)</span>
              </span>
              <span class="text-neutral-400 dark:text-slate-500" aria-hidden="true">·</span>
              <span class="flex items-center gap-1.5">
                <span>{{ $t('client.summaryPendingNoRecord') }}:</span>
                <span class="font-semibold text-neutral-900 dark:text-slate-100">{{ clientesSinPagos.length }}</span>
                <span class="text-neutral-500 dark:text-slate-400 text-sm">({{ porcentajePendientesSinRegistroAdmin }}%)</span>
              </span>
              <span v-if="rutaSeleccionadaId" class="inline-flex items-center gap-1.5 text-blue-700 dark:text-blue-300 text-sm font-semibold px-2 py-1 bg-blue-100 dark:bg-blue-900/40 rounded-md">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <template v-if="rutaSeleccionadaId">Ruta: {{ etiquetaRutaSeleccionada }}</template>
              </span>
            </div>
          </div>

          <!-- Pendientes sin registro en la ruta -->
          <div class="card-min p-2 md:p-3 transition-colors duration-300">
            <h3
              class="text-lg md:text-xl font-semibold text-neutral-800 dark:text-slate-100 mb-2 md:mb-3 flex items-center justify-between cursor-pointer bg-neutral-200 dark:bg-slate-800/40 px-2 py-1.5 md:px-3 md:py-2 rounded-md"
              @click="toggleClientesSinPagos"
              :title="mostrarClientesSinPagos ? $t('common.hideSection') : $t('common.showSection')"
            >
              <div class="flex items-center">
                <svg class="w-6 h-6 mr-2 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ $t('client.clientsPendingNoRouteRecord') }} ({{ clientesSinPagos.length }})
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
              <div class="mb-2 md:mb-4">
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-2">{{ $t('common.searchClient') }}</label>
                <div class="relative">
                  <input
                    v-model="filtroBusquedaSinPagos"
                    type="text"
                    :placeholder="$t('common.searchClientPlaceholder')"
                    class="w-full pl-10 pr-10 py-2 border-2 border-neutral-400 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-neutral-500 bg-neutral-50 dark:bg-slate-800/50 text-neutral-900 dark:text-slate-100 shadow-sm"
                  />
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-slate-400 pointer-events-none">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
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
                  {{ $t('common.searchResultsCount', { count: clientesSinPagosBuscados.length }) }}
                </p>
                <p v-else-if="filtroBusquedaSinPagos && clientesSinPagosBuscados.length === 0" class="text-sm text-red-600 dark:text-red-400 mt-2">
                  {{ $t('common.noSearchResults') }}
                </p>
              </div>
              <div v-if="clientesSinPagos.length === 0" class="text-neutral-500 dark:text-neutral-400 text-center py-4">
                {{ $t('client.allClientsHavePaidInRoute') }}
              </div>
              <DashboardClientesDosColumnas
                v-else
                :list="clientesSinPagosBuscados"
                :item-key="(c, i) => c._id || 'sin-' + i"
              >
                <template #default="{ item: c, index: i }">
                  <AdminClienteTarjetaAdmin
                    :cliente="c"
                    :card-index="i"
                    variant="sin"
                    :es-nuevo-en-ruta="esClienteNuevoEnRutaAdmin(c)"
                    :es-renovado-en-ruta="esClienteRenovadoEnRutaAdmin(c)"
                    :es-finalizado-pendiente="c.finalizadoPendiente === true"
                    :desplegado="!!desplegados[c._id]"
                    :nombre-vendedor="nombreVendedor(c)"
                    @toggle-desplegar="toggleDesplegar(c._id)"
                    :acciones-bloqueadas="botonesBloqueados"
                    @pagos="irAPagosAdmin(c)"
                    @historial="abrirHistorialCliente(c)"
                    @editar="abrirEditar(c)"
                    @oculto="solicitarToggleOcultoCliente(c)"
                    @mapa-residencial="verEnMapa(c.coordenadas_residencial, c.direccion_residencial)"
                    @mapa-comercial="verEnMapa(c.coordenadas_comercial, c.direccion)"
                  />
                </template>
              </DashboardClientesDosColumnas>
            </div>
          </div>

          <DashboardClientesSeccionDivider :aria-label="$t('client.dashboardListsDividerAria')" />

          <!-- Registrado con registro en la ruta -->
          <div class="card-min p-2 md:p-3 lg:p-4 transition-colors duration-300">
            <h3
              class="text-lg md:text-xl font-semibold text-neutral-800 dark:text-slate-100 mb-2 md:mb-3 flex items-center justify-between cursor-pointer bg-neutral-200 dark:bg-slate-800/40 px-2 py-1.5 md:px-3 md:py-2 rounded-md"
              @click="toggleClientesConPagos"
              :title="mostrarClientesConPagos ? $t('common.hideSection') : $t('common.showSection')"
            >
              <div class="flex items-center">
                <svg class="w-6 h-6 mr-2 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ $t('client.clientsRouteActivity') }} ({{ clientesConPagos.length }})
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
            <div v-if="mostrarClientesConPagos" class="mt-3">
              <div class="mb-2 md:mb-4">
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-2">{{ $t('common.searchClient') }}</label>
                <div class="relative">
                <input 
                    v-model="filtroBusquedaConPagos"
                    type="text"
                    :placeholder="$t('common.searchClientPlaceholder')"
                    class="w-full pl-10 pr-10 py-2 border-2 border-neutral-400 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-neutral-500 bg-neutral-50 dark:bg-slate-800/50 text-neutral-900 dark:text-slate-100 shadow-sm"
                  />
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-slate-400 pointer-events-none">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
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
                  {{ $t('common.searchResultsCount', { count: clientesConPagosBuscados.length }) }}
                </p>
                <p v-else-if="filtroBusquedaConPagos && clientesConPagosBuscados.length === 0" class="text-sm text-red-600 dark:text-red-400 mt-2">
                  {{ $t('common.noSearchResults') }}
                </p>
              </div>
              <div v-if="clientesConPagos.length === 0" class="text-neutral-500 dark:text-neutral-400 text-center py-4">
                {{ $t('client.noClientsWithPaymentsInRoute') }}
              </div>
              <DashboardClientesDosColumnas
                v-else
                :list="clientesConPagosBuscados"
                wide-gap
                :item-key="(c, i) => c._id || 'con-' + i"
              >
                <template #default="{ item: c, index: i }">
                  <AdminClienteTarjetaAdmin
                    :cliente="c"
                    :card-index="i"
                    variant="con"
                    :es-nuevo-en-ruta="esClienteNuevoEnRutaAdmin(c)"
                    :es-renovado-en-ruta="esClienteRenovadoEnRutaAdmin(c)"
                    :es-finalizado-pendiente="c.finalizadoPendiente === true"
                    :desplegado="!!desplegados[c._id]"
                    :nombre-vendedor="nombreVendedor(c)"
                    @toggle-desplegar="toggleDesplegar(c._id)"
                    :acciones-bloqueadas="botonesBloqueados"
                    @pagos="irAPagosAdmin(c)"
                    @historial="abrirHistorialCliente(c)"
                    @editar="abrirEditar(c)"
                    @oculto="solicitarToggleOcultoCliente(c)"
                    @mapa-residencial="verEnMapa(c.coordenadas_residencial, c.direccion_residencial)"
                    @mapa-comercial="verEnMapa(c.coordenadas_comercial, c.direccion)"
                  />
                </template>
              </DashboardClientesDosColumnas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Editar Cliente (admin) -->
    <Teleport to="body">
      <div
        v-if="modalEditar.visible"
        class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[100] p-4"
        @click.self="cerrarModalEditar"
      >
        <div class="bg-white dark:bg-slate-800 border-2 border-neutral-200 dark:border-slate-600 rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-bold mb-4 text-neutral-900 dark:text-slate-100">{{ $t('sales.editClient') || 'Editar cliente' }}</h3>
          <form @submit.prevent="guardarEdicionCliente" class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.name') }}</label>
                <input v-model="modalEditar.nombres" type="text" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.lastname') }}</label>
                <input v-model="modalEditar.apellidos" type="text" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.id') }}</label>
              <input v-model="modalEditar.cc" type="text" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.nickname') }}</label>
              <input v-model="modalEditar.apodo" type="text" class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.phone') }}</label>
              <input v-model="modalEditar.celular" type="tel" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.residentialAddress') }}</label>
              <input v-model="modalEditar.direccion_residencial" type="text" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.commercialAddress') }}</label>
              <input v-model="modalEditar.direccion" type="text" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.value') }} (venta)</label>
                <input v-model.number="modalEditar.valor" type="number" min="0" step="0.01" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">Intereses (%)</label>
                <input v-model.number="modalEditar.interesPercent" type="number" min="0" max="100" step="0.1" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">Total a pagar</label>
                <div class="w-full border-2 border-neutral-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-neutral-50 dark:bg-slate-700/50 text-neutral-700 dark:text-slate-300">
                  ${{ totalAPagarCalculado.toFixed(2) }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">Nº de cuotas</label>
                <input v-model.number="modalEditar.numeroCuotas" type="number" min="1" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
              </div>
            </div>
            <div>
               <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.installmentValue') }}</label>
               <div class="w-full border-2 border-neutral-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-neutral-50 dark:bg-slate-700/50 text-neutral-700 dark:text-slate-300">
                 ${{ valorParcelaCalculado.toFixed(2) }}
               </div>
             </div>
             <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <div>
                 <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.frequency') || 'Frecuencia' }}</label>
                 <select v-model="modalEditar.frecuencia" class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100">
                   <option value="">{{ $t('client.selectFrequency') || 'Seleccione frecuencia' }}</option>
                   <option value="Diaria">{{ $t('client.daily') || 'Diaria' }}</option>
                   <option value="Semanal">{{ $t('client.weekly') || 'Semanal' }}</option>
                   <option value="Quincenal">{{ $t('client.biweekly') || 'Quincenal' }}</option>
                   <option value="Mensual">{{ $t('client.monthly') || 'Mensual' }}</option>
                 </select>
               </div>
               <div v-if="modalEditar.frecuencia && modalEditar.frecuencia !== 'Diaria'">
                 <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.paymentDay') || 'Día de pago' }}</label>
                 <select v-model="modalEditar.diaPago" class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100">
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
             </div>
             <!-- Resumen antes / ahora -->
            <div class="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-slate-600">
              <div class="text-sm">
                <div class="font-semibold text-neutral-700 dark:text-slate-300 mb-1">Antes</div>
                <div class="space-y-0.5 text-neutral-600 dark:text-slate-400">
                  <div>Venta: ${{ valoresIniciales.valor }}</div>
                  <div>Intereses: {{ valoresIniciales.interesPercent }}%</div>
                  <div>Total: ${{ valoresIniciales.saldoInicial }}</div>
                  <div>Parcela: ${{ valoresIniciales.parcela }}</div>
                </div>
              </div>
              <div class="text-sm">
                <div class="font-semibold text-neutral-700 dark:text-slate-300 mb-1">Ahora</div>
                <div class="space-y-0.5 text-neutral-600 dark:text-slate-400">
                  <div>Venta: ${{ (Number(modalEditar.valor) || 0).toFixed(2) }}</div>
                  <div>Intereses: {{ (Number(modalEditar.interesPercent) || 0) }}%</div>
                  <div>Total: ${{ totalAPagarCalculado.toFixed(2) }}</div>
                  <div>Parcela: ${{ valorParcelaCalculado.toFixed(2) }}</div>
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" @click="cerrarModalEditar" class="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-slate-600 text-neutral-800 dark:text-slate-200 hover:bg-neutral-300 dark:hover:bg-slate-500">
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

    <ConfirmModal
      :show="!!(modalVisibilidadCliente && modalVisibilidadCliente.show)"
      :title="modalVisibilidadTitulo"
      :message="modalVisibilidadMensaje"
      :confirm-text="modalVisibilidadConfirmText"
      :cancel-text="$t('common.cancel')"
      @confirm="confirmarToggleVisibilidadCliente"
      @cancel="cerrarModalVisibilidad"
    />

    <!-- Modal elección: ocultar/mostrar o eliminar -->
    <Teleport to="body">
      <div
        v-if="!!(modalOcultarEliminarCliente && modalOcultarEliminarCliente.show)"
        class="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/50 dark:bg-black/70"
          @click="cerrarModalOcultarEliminarCliente"
        />
        <div
          class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-neutral-200/50 dark:border-slate-700/50 transition-all duration-300"
        >
          <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-neutral-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
            <h2 class="text-xl font-bold text-neutral-900 dark:text-slate-100">{{ $t('common.actions') || 'Acciones' }}</h2>
          </div>
          <div class="p-6">
            <p class="text-base text-neutral-700 dark:text-slate-300 font-semibold mb-5">
              {{ nombreClienteDisplayModal(modalOcultarEliminarCliente.cliente) }}
            </p>

            <div class="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                class="flex-1 px-5 py-2.5 rounded-lg bg-neutral-100 dark:bg-slate-700 text-neutral-800 dark:text-slate-200 border border-neutral-300/60 dark:border-slate-600 hover:bg-neutral-200/60 dark:hover:bg-slate-600 transition-colors font-semibold"
                @click="elegirOpcionOcultarMostrar"
              >
                {{
                  modalOcultarEliminarCliente.cliente?.ocultoEnAdmin
                    ? $t('common.show')
                    : $t('common.hide')
                }}
              </button>

              <button
                type="button"
                class="flex-1 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold border border-red-700/60 transition-colors"
                @click="elegirOpcionEliminar"
              >
                {{ $t('common.delete') }}
              </button>
            </div>

            <div class="mt-5 flex justify-end">
              <button
                type="button"
                class="px-5 py-2.5 text-neutral-800 dark:text-slate-200 bg-white dark:bg-slate-700 border-2 border-neutral-300 dark:border-slate-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-600 font-semibold transition-colors"
                @click="cerrarModalOcultarEliminarCliente"
              >
                {{ $t('common.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <ConfirmModal
      :show="!!(modalEliminarCliente && modalEliminarCliente.show)"
      :title="$t('common.confirm')"
      :message="modalEliminarMensaje"
      :confirm-text="$t('common.delete')"
      :cancel-text="$t('common.cancel')"
      @confirm="confirmarEliminarCliente"
      @cancel="cerrarModalEliminarCliente"
    />

    <HistorialVentasClienteModal
      :show="!!modalHistorialVentas"
      :historial="modalHistorialVentas"
      :refreshing="modalHistorialVentasRefreshing"
      @close="cerrarModalHistorialVentas"
    />

    <!-- Modal ocultos y reportados -->
    <Teleport to="body">
      <div
        v-if="mostrarModalOcultosReportados"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70"
        @click.self="mostrarModalOcultosReportados = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-xl border-2 border-neutral-200 dark:border-slate-600 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-neutral-200 dark:border-slate-600 pb-3">
            <h3 class="text-lg font-bold text-neutral-900 dark:text-slate-100">
              Ocultos y reportados
            </h3>
            <button
              type="button"
              class="text-neutral-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-slate-200"
              @click="mostrarModalOcultosReportados = false"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="cargandoOcultosReportados" class="text-center py-8 text-neutral-500 dark:text-slate-400">
            Cargando...
          </div>

          <div v-else-if="listaOcultosReportados.length === 0" class="text-center py-8 text-neutral-500 dark:text-slate-400">
            No hay clientes ocultos ni reportados.
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="item in listaOcultosReportados"
              :key="item._id || item.cc"
              class="flex items-center justify-between gap-3 p-3 rounded-lg border border-neutral-200 dark:border-slate-600 bg-neutral-50 dark:bg-slate-700/50"
            >
              <div class="min-w-0 flex-1">
                <div class="font-semibold text-neutral-900 dark:text-slate-100 truncate">
                  {{ item.nombres ? item.nombres + ' ' + (item.apellidos || '') : 'CC: ' + item.cc }}
                </div>
                <div v-if="item.cc" class="text-xs text-neutral-500 dark:text-slate-400">
                  CC: {{ item.cc }}
                </div>
                <div v-if="item.vendedor" class="text-xs text-neutral-500 dark:text-slate-400">
                  {{ item.vendedor }}
                </div>
              </div>
              <div class="flex gap-2 shrink-0">
                <span
                  v-if="item.esOculto"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                >
                  Oculto
                </span>
                <span
                  v-if="item.esReportado"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                >
                  Reportado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>

  <!-- Modal editar fechas -->
  <div
    v-if="modalFechas.show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    @click.self="cerrarModalFechas"
  >
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
      <h3 class="text-lg font-bold text-neutral-900 dark:text-slate-100">{{ $t('admin.editRouteDatesTitle') }}</h3>
      <p class="text-sm text-neutral-500 dark:text-slate-400 mb-5">{{ modalFechas.vendedorNombre }}</p>

      <label class="block text-sm font-semibold text-neutral-700 dark:text-slate-300 mb-1">{{ $t('admin.openingDate') }}</label>
      <input
        type="datetime-local"
        v-model="modalFechas.fechaApertura"
        class="w-full px-3 py-2.5 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <label class="block text-sm font-semibold text-neutral-700 dark:text-slate-300 mt-4 mb-1">{{ $t('admin.closingDate') }}</label>
      <input
        type="datetime-local"
        v-model="modalFechas.fechaCierre"
        class="w-full px-3 py-2.5 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <p v-if="modalFechas.error" class="text-sm text-red-600 dark:text-red-400 mt-3">{{ modalFechas.error }}</p>

      <div class="flex justify-end gap-3 mt-6">
        <button
          type="button"
          class="px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-neutral-400 dark:border-slate-500 bg-white dark:bg-slate-700 text-neutral-800 dark:text-slate-100 hover:bg-neutral-50 dark:hover:bg-slate-600 transition-colors"
          @click="cerrarModalFechas"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          type="button"
          :disabled="guardandoFechas"
          class="px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-sm transition-colors"
          @click="guardarFechas"
        >
          {{ guardandoFechas ? '…' : $t('common.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default { name: 'AdminDashboard' }
</script>
<script setup>
import { ref, reactive, onMounted, onActivated, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import API_BASE_URL from '../config/api.js'
import NavbarAdmin from '../components/NavbarAdmin.vue'
import AdminClienteTarjetaAdmin from '../components/AdminClienteTarjetaAdmin.vue'
import DashboardClientesDosColumnas from '../components/DashboardClientesDosColumnas.vue'
import DashboardClientesSeccionDivider from '../components/DashboardClientesSeccionDivider.vue'
import HistorialVentasClienteModal from '../components/HistorialVentasClienteModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { useAppScrollRoot } from '../composables/useAppScrollRoot.js'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const clientes = ref([])
const adminScrollEl = ref(null)
const appScrollRoot = useAppScrollRoot()
const vendedores = ref([])
const vendedorFiltro = ref('')
const cargandoClientes = ref(true)
const desplegados = ref({}) // { [clienteId]: boolean }
const pagos = ref([])
const rutas = ref([])
const rutasActualesPorVendedor = ref({})
const rutasAnterioresPorVendedor = ref({})
const mostrarClientesConPagos = ref(true)
const mostrarClientesSinPagos = ref(true)
const filtroBusquedaSinPagos = ref('')
const filtroBusquedaConPagos = ref('')
const botonesBloqueados = ref(true)

const rutaSeleccionadaId = ref('')
const rutasDropdownAbierto = ref(false)

/** Mismo modal que el asesor: ciclos de venta y pagos registrados */
const modalHistorialVentas = ref(null)
const modalHistorialVentasRefreshing = ref(false)

const modalVisibilidadCliente = reactive({
  show: false,
  cliente: null,
  ocultar: false
})

// Modal de elección: ocultar/mostrar o eliminar
const modalOcultarEliminarCliente = reactive({
  show: false,
  cliente: null
})

// Confirmación de eliminación
const modalEliminarCliente = reactive({
  show: false,
  cliente: null
})

// Modal ocultos y reportados
const mostrarModalOcultosReportados = ref(false)
const cargandoOcultosReportados = ref(false)
const listaOcultosReportados = ref([])

async function abrirModalOcultosReportados() {
  mostrarModalOcultosReportados.value = true
  cargandoOcultosReportados.value = true
  listaOcultosReportados.value = []
  try {
    const cod = codigoVinculacion()
    if (!cod) return

    const [ocultosRes, reportesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/admin/clientes?codigoVinculacion=${encodeURIComponent(cod)}&incluirOcultos=1`, { cache: 'no-store' }),
      fetch(`${API_BASE_URL}/api/cedulas/reportes?codigoVinculacion=${encodeURIComponent(cod)}`, { cache: 'no-store' })
    ])

    const ocultos = ocultosRes.ok ? await ocultosRes.json() : []
    const reportes = reportesRes.ok ? (await reportesRes.json()).reportes || [] : []

    // Construir un set de CCs reportadas
    const ccsReportadas = new Set(reportes.map(r => r.cc))

    // Mapa de reportes por CC para mostrar quién reportó
    const reportesPorCC = new Map()
    for (const r of reportes) {
      if (!reportesPorCC.has(r.cc)) reportesPorCC.set(r.cc, [])
      reportesPorCC.get(r.cc).push(r.reportadoPor?.nombre || r.reportadoPor?.usuario || 'Desconocido')
    }

    // Clientes ocultos (ocultoEnAdmin === true)
    const ocultosList = ocultos
      .filter(c => c.ocultoEnAdmin)
      .map(c => ({
        _id: c._id,
        cc: c.cc,
        nombres: c.nombres,
        apellidos: c.apellidos,
        vendedor: c.vendedor?.nombre || '',
        esOculto: true,
        esReportado: ccsReportadas.has(String(c.cc))
      }))

    // Clientes cuyo CC está reportado pero no son ocultos (para no duplicar)
    const idsOcultos = new Set(ocultosList.map(c => c._id))
    const todos = [...ocultos]
    const reportadosNoOcultos = todos
      .filter(c => ccsReportadas.has(String(c.cc)) && !idsOcultos.has(c._id))
      .map(c => ({
        _id: c._id,
        cc: c.cc,
        nombres: c.nombres,
        apellidos: c.apellidos,
        vendedor: c.vendedor?.nombre || '',
        esOculto: false,
        esReportado: true
      }))

    // CCs reportadas que no tienen cliente (no se encontraron en la lista de clientes)
    const ccsOcultosYReportados = new Set([
      ...ocultosList.map(c => c.cc),
      ...reportadosNoOcultos.map(c => c.cc)
    ])
    const ccsSinCliente = []
    for (const [cc, reporters] of reportesPorCC) {
      if (!ccsOcultosYReportados.has(cc)) {
        ccsSinCliente.push({
          _id: null,
          cc,
          nombres: '',
          apellidos: '',
          vendedor: `Reportado por: ${reporters.join(', ')}`,
          esOculto: false,
          esReportado: true
        })
      }
    }

    listaOcultosReportados.value = [
      ...ocultosList,
      ...reportadosNoOcultos,
      ...ccsSinCliente
    ]
  } catch (e) {
    console.error('Error al cargar ocultos/reportados:', e)
  } finally {
    cargandoOcultosReportados.value = false
  }
}

function nombreClienteDisplayModal(c) {
  if (!c) return ''
  const n = `${c.nombres || ''} ${c.apellidos || ''}`.trim()
  return n || String(c.apodo || '').trim() || '—'
}

function abreviarDireccion(dir) {
  if (!dir || typeof dir !== 'string') return '—'
  const limpia = dir.trim()
  const porComa = limpia.split(',')[0].trim()
  if (porComa.length <= 42) return porComa
  return porComa.substring(0, 39) + '…'
}

function imprimirDerrotero() {
  let sinPagos = clientesSinPagosBuscados.value
  let conPagos = clientesConPagosBuscados.value
  if (rutaSeleccionadaId.value) {
    const rutaId = rutaSeleccionadaId.value
    sinPagos = sinPagos.filter(c => clientePerteneceARuta(c, rutaId))
    conPagos = conPagos.filter(c => clientePerteneceARuta(c, rutaId))
  }
  const todos = [...sinPagos, ...conPagos]
  if (todos.length === 0) {
    alert(t('admin.printNoClients'))
    return
  }

  // Agrupar por vendedor
  const grupos = {}
  for (const c of todos) {
    const vName = nombreVendedor(c) || t('admin.vendorFallbackName')
    if (!grupos[vName]) grupos[vName] = []
    grupos[vName].push(c)
  }

  const ahora = new Date()
  const fecha = ahora.toLocaleDateString()
  const hora = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const etiquetaVendedor = t('admin.printVendor')
  const etiquetaNombre = t('admin.printName')
  const etiquetaId = t('admin.printId')
  const etiquetaPhone = t('admin.printPhone')
  const etiquetaSale = t('admin.printSale')
  const etiquetaInstallment = t('admin.printInstallment')
  const etiquetaDays = t('admin.printDays')
  const etiquetaFreq = t('admin.printFrequency')
  const etiquetaAddr = t('admin.printAddress')
  const etiquetaDate = t('admin.printDate')
  const etiquetaFilter = t('admin.printFilter')
  const etiquetaAll = t('admin.printAll')
  const etiquetaGroup = t('admin.printGroup')

  const filtroVendLabel = vendedorFiltro.value
    ? (vendedores.value.find(v => v._id === vendedorFiltro.value)?.nombre || etiquetaAll)
    : etiquetaAll

  let html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${t('admin.routeSheetTitle')}</title>
<style>
  @page { margin: 12mm 10mm }
  * { box-sizing: border-box; margin: 0; padding: 0 }
  body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; font-size: 8.5pt; color: #1a1a1a; line-height: 1.35 }
  .header { text-align: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #2563eb }
  .header h1 { font-size: 14pt; color: #1e3a5f; margin-bottom: 2px }
  .header p { font-size: 7.5pt; color: #555 }
  .filtro-info { text-align: center; font-size: 7.5pt; color: #666; margin-bottom: 10px }
  table { width: 100%; border-collapse: collapse; page-break-inside: auto }
  thead { display: table-header-group }
  tr { page-break-inside: avoid }
  th { background: #2563eb; color: #fff; font-size: 7.5pt; font-weight: 600; padding: 5px 4px; text-align: left; white-space: nowrap }
  td { font-size: 7.5pt; padding: 4px; border-bottom: 1px solid #d1d5db; vertical-align: top }
  tr:nth-child(even) td { background: #f3f4f6 }
  .group-header td { background: #dbeafe !important; font-weight: 700; font-size: 8pt; padding: 6px 4px; border-bottom: 2px solid #93c5fd; color: #1e40af }
  .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap }
  .addr { font-size: 7pt; color: #555; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
  .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 6.5pt; color: #999; border-top: 1px solid #d1d5db; padding-top: 4px }
  @media print {
    .no-print { display: none }
  }
</style></head>
<body>
<div class="header">
  <h1>${t('admin.routeSheetTitle')}</h1>
  <p>${etiquetaDate}: ${fecha} ${hora} &middot; ${etiquetaFilter}: ${filtroVendLabel}${rutaSeleccionadaId.value ? ' &middot; Ruta: ' + etiquetaRutaSeleccionada.value : ''}</p>
</div>
<table>
<thead><tr>
  <th>${etiquetaGroup}</th>
  <th>${etiquetaNombre}</th>
  <th>${etiquetaId}</th>
  <th>${etiquetaPhone}</th>
  <th class="num">${etiquetaSale}</th>
  <th class="num">${etiquetaInstallment}</th>
  <th class="num">${etiquetaDays}</th>
  <th>${etiquetaFreq}</th>
  <th>${etiquetaAddr}</th>
</tr></thead>
<tbody>`

  let idx = 0
  const vNames = Object.keys(grupos)
  for (const vName of vNames) {
    const clientes = grupos[vName]
    html += `<tr class="group-header"><td colspan="9">${++idx}. ${vName} (${clientes.length})</td></tr>`
    for (const c of clientes) {
      const nombre = `${c.nombres || ''} ${c.apellidos || ''}`.trim() || '—'
      const cc = c.cc || '—'
      const phone = c.celular || '—'
      const valor = Number(c.valor) || 0
      const parcela = Number(c.parcela) || 0
      const dias = c.dias || '—'
      const freq = c.frecuencia || '—'
      const addrRes = abreviarDireccion(c.direccion_residencial)
      const addrCom = abreviarDireccion(c.direccion)
      const addr = addrRes !== '—' ? addrRes : addrCom
      html += `<tr>
  <td></td>
  <td>${escHtml(nombre)}</td>
  <td>${escHtml(cc)}</td>
  <td>${escHtml(phone)}</td>
  <td class="num">$${valor.toLocaleString()}</td>
  <td class="num">$${parcela.toLocaleString()}</td>
  <td class="num">${dias}</td>
  <td>${escHtml(freq)}</td>
  <td class="addr">${escHtml(addr)}</td>
</tr>`
    }
  }

  html += `</tbody></table>
<div class="footer">${t('admin.routeSheetTitle')} · ${fecha} ${hora}</div>
</body></html>`

  const w = window.open('', '_blank', 'width=900,height=700')
  if (!w) { alert('Permite ventanas emergentes para imprimir.'); return }
  w.document.write(html)
  w.document.close()
}

function escHtml(s) {
  if (typeof s !== 'string') return String(s || '')
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const modalVisibilidadTitulo = computed(() => t('common.confirm'))
const modalVisibilidadMensaje = computed(() => {
  const c = modalVisibilidadCliente.cliente
  if (!c) return ''
  const name = nombreClienteDisplayModal(c)
  return modalVisibilidadCliente.ocultar
    ? t('admin.hideClientInPanelConfirm', { name })
    : t('admin.showClientInPanelConfirm', { name })
})
const modalVisibilidadConfirmText = computed(() =>
  modalVisibilidadCliente.ocultar ? t('common.hide') : t('common.show')
)

const modalEliminarMensaje = computed(() => {
  const c = modalEliminarCliente.cliente
  if (!c) return ''
  const name = nombreClienteDisplayModal(c)
  // Reutiliza texto existente y agrega nombre para claridad
  return `${t('sales.deleteClientConfirm')} (${name})`
})

const modalEditar = ref({
  visible: false,
  _id: null,
  nombres: '',
  apellidos: '',
  cc: '',
  apodo: '',
  celular: '',
  direccion: '',
  direccion_residencial: '',
  valor: 0,
  interesPercent: 0,
  numeroCuotas: 1,
  frecuencia: '',
  diaPago: ''
})

const valoresIniciales = ref({
  valor: '0.00',
  interesPercent: '0',
  saldoInicial: '0.00',
  parcela: '0.00'
})

const totalAPagarCalculado = computed(() => {
  const v = Number(modalEditar.value.valor) || 0
  const pct = Number(modalEditar.value.interesPercent) || 0
  return Math.round((v * (1 + pct / 100)) * 100) / 100
})

const valorParcelaCalculado = computed(() => {
  const total = totalAPagarCalculado.value
  const n = Math.max(1, Math.floor(Number(modalEditar.value.numeroCuotas) || 1))
  return n > 0 ? Math.round((total / n) * 100) / 100 : 0
})

const codigoVinculacion = () => localStorage.getItem('codigoVinculacion')

function vendedorIdDeCliente(c) {
  const v = c?.vendedor
  if (!v) return null
  return typeof v === 'object' ? String(v._id || '') : String(v)
}

function tienePagoEnRutaCliente(cliente, rutaId) {
  if (!rutaId) return false
  const key = `${String(cliente?._id || '')}|${String(rutaId)}`
  return pagosIndex.value.pagosPorClienteRuta.has(key)
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

function msOrdenRegistroPagoAdmin(p) {
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

const pagosFiltrados = computed(() => {
  const rutaId = rutaSeleccionadaId.value
  if (!rutaId) return pagos.value
  return (pagos.value || []).filter(p =>
    String(p.ruta?._id || p.ruta) === rutaId
  )
})

const rutasDisponibles = computed(() => {
  const list = rutas.value || []
  return [...list].sort((a, b) => new Date(b.fechaApertura) - new Date(a.fechaApertura))
})

const etiquetaRutaSeleccionada = computed(() => {
  if (!rutaSeleccionadaId.value) return 'Todas las rutas'
  const r = rutasDisponibles.value.find(r => String(r._id) === rutaSeleccionadaId.value)
  if (!r) return 'Todas las rutas'
  const v = r.vendedor
  const nombre = v && (v.nombre || typeof v === 'object' ? v.nombre : '') || ''
  const abierta = r.abierta ? ' (Abierta)' : ''
  const fecha = r.fechaApertura ? new Date(r.fechaApertura).toLocaleDateString() : ''
  return `${fecha} — ${nombre}${abierta}`
})

const pagosIndex = computed(() => {
  const pagosPorClienteIdMap = new Map()
  const pagosPorClienteRuta = new Set()
  const montoPorClienteRuta = new Map()
  const primerRegistroMsPorClienteRuta = new Map()

  for (const p of pagosFiltrados.value || []) {
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

      const ms = msOrdenRegistroPagoAdmin(p)
      if (ms != null) {
        const prevMs = primerRegistroMsPorClienteRuta.get(k)
        if (prevMs == null || ms < prevMs) primerRegistroMsPorClienteRuta.set(k, ms)
      }
    }
  }

  // ordenar por fecha solo una vez por cliente
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

const pagosPorClienteId = computed(() => {
  // Mantener API existente, pero alimentado desde el índice (evita reconstruir varias veces).
  return pagosIndex.value.pagosPorClienteIdMap
})

function calcularParcelasAtrasadasAdmin(cliente) {
  const idCli = String(cliente?._id || '')
  if (!idCli) return 0
  const pagosCliente = pagosPorClienteId.value.get(idCli) || []
  if (!pagosCliente.length) return 0

  let atrasos = 0
  let dias = 0 // días en los que se debió pagar (No pago o Parcela)
  const valorParcela = Number(cliente?.parcela) || 1

  for (const p of pagosCliente) {
    const tipo = String(p?.tipo || '').trim().toLowerCase()
    if (tipo === 'no pago') {
      atrasos += 1
      dias += 1
      continue
    }
    if (tipo === 'no aplica') {
      continue
    }
    if (tipo === 'parcela') {
      dias += 1
      const pagadas = Number(p?.numParcelas) || 1
      if (pagadas > 1) atrasos = Math.max(0, atrasos - (pagadas - 1))
      continue
    }
    if (tipo === 'abono') {
      const cuotasPagadas = Math.floor((Number(p?.valor) || 0) / valorParcela)
      if (cuotasPagadas > 0) {
        if (dias === 0) {
          atrasos = Math.max(0, atrasos - cuotasPagadas)
        } else {
          atrasos = Math.max(0, atrasos - (cuotasPagadas - 1))
        }
        dias += 1
      }
      continue
    }
  }

  return atrasos
}

function montoPagadoEnRutaActualAdmin(cliente) {
  const rutaId = rutaActualIdDeCliente(cliente)
  if (!rutaId) return 0
  const key = `${String(cliente?._id || '')}|${String(rutaId)}`
  return pagosIndex.value.montoPorClienteRuta.get(key) || 0
}

function pagosClienteEnRutaActualAdmin(cliente) {
  const rid = rutaActualIdDeCliente(cliente)
  if (!rid) return []
  const idCli = String(cliente?._id || '')
  return (pagos.value || []).filter((pago) => {
    const clienteIdPago = typeof pago.cliente === 'object' ? pago.cliente?._id : pago.cliente
    const rutaIdPago = typeof pago.ruta === 'object' ? pago.ruta?._id : pago.ruta
    return String(clienteIdPago) === idCli && String(rutaIdPago) === String(rid)
  })
}

/** Último registro en la ruta actual del asesor es "No pago" (badge rojo $0 en tarjeta). */
function esNoPagoEnRutaActualAdmin(cliente) {
  const list = pagosClienteEnRutaActualAdmin(cliente)
  if (!list.length) return false
  const sorted = [...list].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  return String(sorted[0]?.tipo || '').trim().toLowerCase() === 'no pago'
}

function rutaActualIdDeCliente(cliente) {
  const vid = vendedorIdDeCliente(cliente)
  const r = vid ? rutasActualesPorVendedor.value[vid] : null
  return r?._id ? String(r._id) : null
}

function rutaActualDatosDeCliente(cliente) {
  const vid = vendedorIdDeCliente(cliente)
  return vid ? rutasActualesPorVendedor.value[vid] : null
}

function rutaAnteriorIdDeCliente(cliente) {
  const vid = vendedorIdDeCliente(cliente)
  const r = vid ? rutasAnterioresPorVendedor.value[vid] : null
  return r?._id ? String(r._id) : null
}

function creadoEnRutaCliente(cliente) {
  const rutaActual = rutaActualDatosDeCliente(cliente)
  const rutaActualId = rutaActualIdDeCliente(cliente)
  if (!rutaActualId || !rutaActual?.fechaApertura) return false
  const inicio = new Date(rutaActual.fechaApertura).getTime()
  const fin = rutaActual.fechaCierre ? new Date(rutaActual.fechaCierre).getTime() : Date.now()
  const creado = cliente.createdAt ? new Date(cliente.createdAt).getTime() : 0
  return creado >= inicio && creado <= fin
}

/** Igual que resumen "Nuevos": alta en la ruta del asesor, sin renovación y no cancelado */
function esClienteNuevoEnRutaAdmin(cliente) {
  return creadoEnRutaCliente(cliente) && !cliente?.renovado && !cliente?.cancelado
}

/** Igual que resumen "Renovados": creado en la ruta del asesor, con renovación y no cancelado */
function esClienteRenovadoEnRutaAdmin(cliente) {
  return creadoEnRutaCliente(cliente) && !!cliente?.renovado && !cliente?.cancelado
}

function clienteEnRutaParaAdmin(cliente) {
  const rutaActual = rutaActualDatosDeCliente(cliente)
  const rutaActualId = rutaActualIdDeCliente(cliente)

  if (!rutaActualId) {
    return cliente.estado !== 'finalizado' && !cliente.cancelado
  }

  const inicio = rutaActual.fechaApertura ? new Date(rutaActual.fechaApertura).getTime() : null
  const fin = rutaActual.fechaCierre ? new Date(rutaActual.fechaCierre).getTime() : Date.now()

  if (cliente.estado === 'finalizado' && !cliente.finalizadoPendiente && !cliente.cancelado) return false
  if (cliente.cancelado && !cliente.finalizadoPendiente && inicio) {
    const clienteCreado = new Date(cliente.createdAt).getTime()
    const creadoEnRutaActual = clienteCreado >= inicio && clienteCreado <= fin
    if (!creadoEnRutaActual && !tienePagoEnRutaCliente(cliente, rutaActualId)) return false
  }
  if (cliente.finalizadoPendiente && !cliente.cancelado && inicio) {
    const clienteCreado = new Date(cliente.createdAt).getTime()
    const creadoEnRutaActual = clienteCreado >= inicio && clienteCreado <= fin
    if (!creadoEnRutaActual && !tienePagoEnRutaCliente(cliente, rutaActualId)) return false
  }
  return true
}

function ordenPrimerRegistroEnRutaMsAdmin(cliente, rutaId) {
  if (!rutaId) return -1
  const key = `${String(cliente?._id || '')}|${String(rutaId)}`
  const ms = pagosIndex.value.primerRegistroMsPorClienteRuta.get(key)
  return typeof ms === 'number' && !Number.isNaN(ms) ? ms : -1
}

function tienePagoEnRutaActualCliente(cliente) {
  const rid = rutaActualIdDeCliente(cliente)
  return tienePagoEnRutaCliente(cliente, rid)
}

const clientesBaseActivo = computed(() => clientes.value.filter(c => Number(c.total) > 0 || c.finalizadoPendiente === true))

const clientesEnRutaAdmin = computed(() => clientesBaseActivo.value.filter(c => clienteEnRutaParaAdmin(c)))

const clientesSinPagos = computed(() =>
  clientesEnRutaAdmin.value.filter(c => !tienePagoEnRutaActualCliente(c) && !creadoEnRutaCliente(c))
)

const clientesConPagos = computed(() =>
  clientesEnRutaAdmin.value.filter(c => tienePagoEnRutaActualCliente(c) || creadoEnRutaCliente(c))
)

function ordenSinPagosComparableAdmin(cliente) {
  const rAnt = rutaAnteriorIdDeCliente(cliente)
  const ms = ordenPrimerRegistroEnRutaMsAdmin(cliente, rAnt)
  if (ms >= 0) return ms
  if (cliente.createdAt) return new Date(cliente.createdAt).getTime()
  return 0
}

const clientesSinPagosOrdenados = computed(() => {
  const list = [...clientesSinPagos.value]
  return list.sort((a, b) => {
    const ha = ordenSinPagosComparableAdmin(a)
    const hb = ordenSinPagosComparableAdmin(b)
    if (ha !== hb) return ha - hb
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return ta - tb
  })
})

function ordenConPagosComparableAdmin(cliente) {
  const rid = rutaActualIdDeCliente(cliente)
  const ms = ordenPrimerRegistroEnRutaMsAdmin(cliente, rid)
  if (ms >= 0) return ms
  if (cliente.createdAt) return new Date(cliente.createdAt).getTime()
  return 0
}

function tieneParcelaOAbonoEnRutaAdmin(cliente) {
  const rid = rutaActualIdDeCliente(cliente)
  if (!rid) return false
  return pagos.value.some(pago => {
    const clienteIdPago = typeof pago.cliente === 'object' ? pago.cliente?._id : pago.cliente
    const rutaIdPago = typeof pago.ruta === 'object' ? pago.ruta?._id : pago.ruta
    const mismoClienteYRuta = String(clienteIdPago) === String(cliente._id) && String(rutaIdPago) === String(rid)
    const tipoValido = pago.tipo === 'Parcela' || pago.tipo === 'Abono'
    return mismoClienteYRuta && tipoValido
  })
}

const clientesConPagosOrdenados = computed(() => {
  const conDinero = [...clientesConPagos.value.filter((c) => tieneParcelaOAbonoEnRutaAdmin(c))].sort(
    (a, b) => ordenConPagosComparableAdmin(a) - ordenConPagosComparableAdmin(b)
  )
  const soloRegistro = [...clientesConPagos.value.filter((c) => !tieneParcelaOAbonoEnRutaAdmin(c))].sort(
    (a, b) => ordenConPagosComparableAdmin(a) - ordenConPagosComparableAdmin(b)
  )
  return [...conDinero, ...soloRegistro]
})

const clientesConPagosConParcelaAbono = computed(() =>
  clientesEnRutaAdmin.value.filter((c) => tieneParcelaOAbonoEnRutaAdmin(c))
)
/** Misma definición que vendedor: alta en la ruta del asesor, sin ninguna fila de pago aún */
const clientesVentasNuevasResumenAdmin = computed(() =>
  clientesEnRutaAdmin.value.filter(
    (c) =>
      creadoEnRutaCliente(c) &&
      !tieneParcelaOAbonoEnRutaAdmin(c) &&
      !tienePagoEnRutaActualCliente(c)
  )
)
/** Sin cobro Parcela/Abono pero con registro distinto en ruta (No pago, No aplica, etc.), excl. ventas nuevas sin pagos */
const clientesRegistroSinCobroNoPagoAdmin = computed(() =>
  clientesEnRutaAdmin.value.filter((c) => {
    const tieneRegistro = tienePagoEnRutaActualCliente(c) || creadoEnRutaCliente(c)
    if (!tieneRegistro || tieneParcelaOAbonoEnRutaAdmin(c)) return false
    if (creadoEnRutaCliente(c) && !tienePagoEnRutaActualCliente(c)) return false
    return true
  })
)
/** Porcentajes sobre todos los clientes en ruta del listado actual (filtro administrador aplicado), igual que vendedor */
const porcentajeResumenConParcelaAdmin = computed(() => {
  const total = clientesEnRutaAdmin.value.length
  if (total === 0) return 0
  return Math.round((clientesConPagosConParcelaAbono.value.length / total) * 100)
})
const porcentajeRegistroSinCobroNoPagoAdmin = computed(() => {
  const total = clientesEnRutaAdmin.value.length
  if (total === 0) return 0
  return Math.round((clientesRegistroSinCobroNoPagoAdmin.value.length / total) * 100)
})
const porcentajeVentasNuevasResumenAdmin = computed(() => {
  const total = clientesEnRutaAdmin.value.length
  if (total === 0) return 0
  return Math.round((clientesVentasNuevasResumenAdmin.value.length / total) * 100)
})
const porcentajePendientesSinRegistroAdmin = computed(() => {
  const total = clientesEnRutaAdmin.value.length
  if (total === 0) return 0
  return Math.round((clientesSinPagos.value.length / total) * 100)
})

const clientesSinPagosBuscados = computed(() => {
  const baseConAtrasos = clientesSinPagosOrdenados.value.map(cliente => ({
    ...cliente,
    parcelasAtrasadas: calcularParcelasAtrasadasAdmin(cliente),
    esNoPagoEnRutaActual: esNoPagoEnRutaActualAdmin(cliente)
  }))

  if (!filtroBusquedaSinPagos.value) return baseConAtrasos
  const busqueda = filtroBusquedaSinPagos.value.toLowerCase()
  return baseConAtrasos.filter(cliente => {
    return (
      cliente?.nombres?.toLowerCase().includes(busqueda) ||
      cliente?.apellidos?.toLowerCase().includes(busqueda) ||
      cliente?.apodo?.toLowerCase().includes(busqueda) ||
      String(cliente?.cc || '').toLowerCase().includes(busqueda)
    )
  })
})

const clientesConPagosBuscados = computed(() => {
  const baseConMonto = clientesConPagosOrdenados.value.map(cliente => ({
    ...cliente,
    montoPagadoEnRutaActual: montoPagadoEnRutaActualAdmin(cliente),
    esNoPagoEnRutaActual: esNoPagoEnRutaActualAdmin(cliente)
  }))
  const baseConMontoYAtrasos = baseConMonto.map(cliente => ({
    ...cliente,
    parcelasAtrasadas: calcularParcelasAtrasadasAdmin(cliente)
  }))

  if (!filtroBusquedaConPagos.value) return baseConMontoYAtrasos
  const busqueda = filtroBusquedaConPagos.value.toLowerCase()
  return baseConMontoYAtrasos.filter(cliente => {
    return (
      cliente?.nombres?.toLowerCase().includes(busqueda) ||
      cliente?.apellidos?.toLowerCase().includes(busqueda) ||
      cliente?.apodo?.toLowerCase().includes(busqueda) ||
      String(cliente?.cc || '').toLowerCase().includes(busqueda)
    )
  })
})

function toggleClientesSinPagos() {
  mostrarClientesSinPagos.value = !mostrarClientesSinPagos.value
}

function toggleClientesConPagos() {
  mostrarClientesConPagos.value = !mostrarClientesConPagos.value
}

function nombreVendedor(c) {
  const v = c.vendedor
  if (!v) return '–'
  return typeof v === 'object' ? (v.nombre || v._id) : v
}

function clientePerteneceARuta(cliente, rutaId) {
  const vId = vendedorIdDeCliente(cliente)
  if (!vId) return false
  return (rutas.value || []).some(r =>
    String(r._id) === rutaId && String(r.vendedor?._id || r.vendedor) === vId
  )
}

function verEnMapa(coordenadas, direccionCompleta = null) {
  if (coordenadas && coordenadas.lat != null && coordenadas.lng != null) {
    window.open(`https://www.google.com/maps?q=${coordenadas.lat},${coordenadas.lng}`, '_blank')
  } else if (direccionCompleta) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`, '_blank')
  }
}

function toggleDesplegar(clienteId) {
  const next = { ...desplegados.value }
  next[clienteId] = !next[clienteId]
  desplegados.value = next
}

function toggleRutasDropdown() {
  rutasDropdownAbierto.value = !rutasDropdownAbierto.value
}

function seleccionarRutaDropdown(id) {
  rutaSeleccionadaId.value = String(id)
  rutasDropdownAbierto.value = false
}

function abrirTodasLasRutas() {
  rutaSeleccionadaId.value = ''
  rutasDropdownAbierto.value = false
}


function limpiarFiltros() {
  rutaSeleccionadaId.value = ''
}

function irAPagosAdmin(c) {
  try {
    localStorage.setItem('clienteSeleccionado', JSON.stringify(c))
    clienteStore.setCliente(c)
    const rid = rutaActualIdDeCliente(c)
    if (rid) localStorage.setItem('adminRutaActual', rid)
    else localStorage.removeItem('adminRutaActual')
  } catch (_) {}
  router.push({ path: '/pagos', query: { fromAdmin: '1' } })
}

function cerrarModalHistorialVentas() {
  modalHistorialVentas.value = null
}

async function abrirHistorialCliente(c) {
  const cod = codigoVinculacion()
  if (!cod || !c?._id) {
    alert('No hay código de vinculación o cliente inválido')
    return
  }
  modalHistorialVentasRefreshing.value = true
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/admin/historial-cliente/${c._id}?codigoVinculacion=${encodeURIComponent(cod)}&_t=${Date.now()}`,
      { cache: 'no-store' }
    )
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      alert(data?.error || 'No se pudo cargar el historial de ventas')
      return
    }
    modalHistorialVentas.value = data
  } catch (e) {
    console.error('Historial admin:', e)
    alert('Error al cargar el historial')
  } finally {
    modalHistorialVentasRefreshing.value = false
  }
}

function abrirEditar(c) {
  const valor = Number(c.valor) ?? 0
  const saldoInicial = Number(c.saldo_inicial) ?? Number(c.total) ?? 0
  const parcela = Number(c.parcela) ?? 0
  let interesPercent = 0
  if (valor > 0 && saldoInicial >= valor) {
    interesPercent = Math.round(((saldoInicial - valor) / valor) * 1000) / 10
  }
  const numeroCuotas = parcela > 0 && saldoInicial > 0 ? Math.max(1, Math.round(saldoInicial / parcela)) : 1
  valoresIniciales.value = {
    valor: valor.toFixed(2),
    interesPercent: String(interesPercent),
    saldoInicial: saldoInicial.toFixed(2),
    parcela: parcela.toFixed(2)
  }
  modalEditar.value = {
    visible: true,
    _id: c._id,
    nombres: c.nombres || '',
    apellidos: c.apellidos || '',
    cc: c.cc || '',
    apodo: c.apodo || '',
    celular: c.celular || '',
    direccion: c.direccion || '',
    direccion_residencial: c.direccion_residencial || '',
    valor,
    interesPercent,
    numeroCuotas,
    frecuencia: c.frecuencia || '',
    diaPago: c.diaPago || ''
  }
}

function cerrarModalEditar() {
  modalEditar.value.visible = false
}

async function guardarEdicionCliente() {
  const id = modalEditar.value._id
  if (!id) return
  const cod = codigoVinculacion()
  if (!cod) {
    alert('No hay código de vinculación')
    return
  }
  const payload = {
    codigoVinculacion: cod,
    nombres: (modalEditar.value.nombres || '').trim(),
    apellidos: (modalEditar.value.apellidos || '').trim(),
    cc: (modalEditar.value.cc || '').trim(),
    apodo: (modalEditar.value.apodo || '').trim(),
    celular: (modalEditar.value.celular || '').trim(),
    direccion: (modalEditar.value.direccion || '').trim(),
    direccion_residencial: (modalEditar.value.direccion_residencial || '').trim(),
    valor: Number(modalEditar.value.valor),
    saldo_inicial: totalAPagarCalculado.value,
    parcela: valorParcelaCalculado.value,
    dias: Math.max(1, Math.floor(Number(modalEditar.value.numeroCuotas) || 1)),
    frecuencia: modalEditar.value.frecuencia || undefined,
    diaPago: modalEditar.value.diaPago || undefined
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      cerrarModalEditar()
      await cargarClientes()
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'Error al actualizar cliente')
    }
  } catch (e) {
    console.error('Error guardando cliente:', e)
    alert('Error al actualizar cliente')
  }
}

function solicitarToggleOcultoCliente(c) {
  const id = c?._id
  if (!id) return
  const cod = codigoVinculacion()
  if (!cod) {
    alert('No hay código de vinculación')
    return
  }
  modalOcultarEliminarCliente.cliente = c
  modalOcultarEliminarCliente.show = true
}

function cerrarModalOcultarEliminarCliente() {
  modalOcultarEliminarCliente.show = false
  modalOcultarEliminarCliente.cliente = null
}

function elegirOpcionOcultarMostrar() {
  const c = modalOcultarEliminarCliente.cliente
  if (!c) return
  const ocultar = !Boolean(c.ocultoEnAdmin)
  cerrarModalOcultarEliminarCliente()

  modalVisibilidadCliente.cliente = c
  modalVisibilidadCliente.ocultar = ocultar
  modalVisibilidadCliente.show = true
}

function elegirOpcionEliminar() {
  const c = modalOcultarEliminarCliente.cliente
  if (!c) return
  cerrarModalOcultarEliminarCliente()
  modalEliminarCliente.cliente = c
  modalEliminarCliente.show = true
}

function cerrarModalEliminarCliente() {
  modalEliminarCliente.show = false
  modalEliminarCliente.cliente = null
}

async function confirmarEliminarCliente() {
  const c = modalEliminarCliente.cliente
  if (!c?._id) return
  cerrarModalEliminarCliente()
  await ejecutarEliminarCliente(c)
}

async function ejecutarEliminarCliente(c) {
  const id = c?._id
  if (!id) return

  try {
    const res = await fetch(`${API_BASE_URL}/api/clientes/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'Error al eliminar el cliente')
      return
    }

    // Refrescar la lista y estados derivados
    await cargarClientes()

    // Si el usuario está en el resumen admin, refrescar de inmediato
    window.dispatchEvent(new CustomEvent('admin-resumen-actualizar'))
  } catch (e) {
    console.error('Error eliminando cliente admin:', e)
    alert('Error de red al eliminar el cliente')
  }
}

function cerrarModalVisibilidad() {
  modalVisibilidadCliente.show = false
  modalVisibilidadCliente.cliente = null
  modalVisibilidadCliente.ocultar = false
}

async function confirmarToggleVisibilidadCliente() {
  const c = modalVisibilidadCliente.cliente
  const ocultar = modalVisibilidadCliente.ocultar
  cerrarModalVisibilidad()
  if (!c?._id) return
  await ejecutarToggleOcultoCliente(c, ocultar)
}

async function ejecutarToggleOcultoCliente(c, ocultar) {
  const id = c._id
  const cod = codigoVinculacion()
  if (!cod) return
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/clientes/${id}/oculto`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigoVinculacion: cod,
        ocultoEnAdmin: ocultar
      })
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'No se pudo actualizar la visibilidad del cliente')
      return
    }
    await cargarClientes()
  } catch (e) {
    console.error('Error ocultando/mostrando cliente:', e)
    alert('Error de red al actualizar visibilidad')
  }
}

async function cargarPagosAdmin() {
  const cod = codigoVinculacion()
  if (!cod) {
    pagos.value = []
    return
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/pagos?codigoVinculacion=${encodeURIComponent(cod)}`)
    if (res.ok) {
      const data = await res.json()
      pagos.value = Array.isArray(data) ? data : []
    } else {
      pagos.value = []
    }
  } catch (e) {
    console.error('Error cargando pagos admin:', e)
    pagos.value = []
  }
}

async function cargarRutasAdmin() {
  const cod = codigoVinculacion()
  if (!cod) {
    rutas.value = []
    rutasActualesPorVendedor.value = {}
    rutasAnterioresPorVendedor.value = {}
    return
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/rutas?codigoVinculacion=${encodeURIComponent(cod)}`, { cache: 'no-store' })
    rutas.value = res.ok ? await res.json() : []
  } catch (e) {
    console.error('Error cargando rutas admin:', e)
    rutas.value = []
  }

  // Derivar ruta actual (abierta) y última cerrada por vendedor
  const act = {}
  const ant = {}
  for (const r of rutas.value || []) {
    const vid = r?.vendedor?._id || r?.vendedor
    if (!vid) continue
    const k = String(vid)
    if (r?.abierta) {
      act[k] = r
      continue
    }
    if (r?.fechaCierre) {
      const prev = ant[k]
      if (!prev || new Date(r.fechaCierre) > new Date(prev.fechaCierre)) ant[k] = r
    }
  }
  rutasActualesPorVendedor.value = act
  rutasAnterioresPorVendedor.value = ant
}

async function cargarRutasPorVendedores() {
  // Compatibilidad: mantener nombre de función, pero ahora usa endpoint único admin (sin N+1).
  await cargarRutasAdmin()
}

async function cargarVendedores() {
  const cod = codigoVinculacion()
  if (!cod) return
  try {
    const res = await fetch(`${API_BASE_URL}/api/vendedores?codigoVinculacion=${encodeURIComponent(cod)}`)
    if (res.ok) {
      const list = await res.json()
      vendedores.value = Array.isArray(list) ? list : []
    } else {
      vendedores.value = []
    }
  } catch (e) {
    console.error('Error cargando asesores admin:', e)
    vendedores.value = []
  }
}

async function cargarClientes() {
  const cod = codigoVinculacion()
  if (!cod) return
  cargandoClientes.value = true
  try {
    let url = `${API_BASE_URL}/api/admin/clientes?codigoVinculacion=${encodeURIComponent(cod)}`
    if (vendedorFiltro.value) {
      url += `&vendedor=${encodeURIComponent(vendedorFiltro.value)}`
    }
    const [, , resCliente] = await Promise.all([
      cargarPagosAdmin(),
      cargarRutasPorVendedores(),
      fetch(url, { cache: 'no-store' })
    ])
    if (resCliente.ok) {
      clientes.value = await resCliente.json()
      desplegados.value = {}
    } else {
      clientes.value = []
    }
  } catch (e) {
    console.error('Error cargando clientes admin:', e)
    clientes.value = []
  } finally {
    cargandoClientes.value = false
  }
}

let _bgRefreshPending = false
async function forceRefreshInBackground() {
  if (_bgRefreshPending) return
  _bgRefreshPending = true
  await nextTick()
  try {
    await cargarClientes()
  } finally {
    _bgRefreshPending = false
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
  } catch (_) {}
  router.replace('/')
}

function irAClienteDesdeQuery() {
  const cid = route.query.clienteId
  if (!cid || !clientes.value.length) return
  const cidStr = String(cid)
  const inSin = clientesSinPagos.value.some(c => String(c._id) === cidStr)
  const inCon = clientesConPagos.value.some(c => String(c._id) === cidStr)
  if (inSin) mostrarClientesSinPagos.value = true
  if (inCon) mostrarClientesConPagos.value = true
  desplegados.value = { ...desplegados.value, [cidStr]: true }
  filtroBusquedaSinPagos.value = ''
  filtroBusquedaConPagos.value = ''
  nextTick(() => {
    const el = document.getElementById(`admin-cliente-${cidStr}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('ring-2', 'ring-blue-500', 'rounded-xl')
    window.setTimeout(() => {
      el.classList.remove('ring-2', 'ring-blue-500', 'rounded-xl')
    }, 4500)
  })
}

function onClickFueraRutas(e) {
  if (!rutasDropdownAbierto.value) return
  const target = e.target
  if (!target || target.closest('[data-rutas-dropdown]')) return
  rutasDropdownAbierto.value = false
}

onMounted(async () => {
  if (route.query.vendedorId) {
    vendedorFiltro.value = String(route.query.vendedorId)
  }
  await Promise.all([cargarVendedores(), cargarClientes()])
  if (route.query.rutaId) {
    rutaSeleccionadaId.value = String(route.query.rutaId)
  }
  irAClienteDesdeQuery()
  await nextTick()
  if (appScrollRoot) appScrollRoot.value = adminScrollEl.value
  document.addEventListener('click', onClickFueraRutas)
  window.addEventListener('actualizar-dashboard', onActualizarDashboard)
})

onActivated(() => {
  // KeepAlive: refrescar datos en background al volver (ej: desde Pagos)
  _bgRefreshPending = false
  cargarClientes()
  // Re-vincular scroll root en caso de que otro componente lo haya cambiado
  if (appScrollRoot && appScrollRoot.value !== adminScrollEl.value) {
    appScrollRoot.value = adminScrollEl.value
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onClickFueraRutas)
  window.removeEventListener('actualizar-dashboard', onActualizarDashboard)
  if (appScrollRoot && appScrollRoot.value === adminScrollEl.value) {
    appScrollRoot.value = null
  }
})

function onActualizarDashboard() {
  _bgRefreshPending = false
  cargarClientes()
}

watch(
  () => route.query.clienteId,
  () => {
    if (route.path !== '/admin') return
    irAClienteDesdeQuery()
  }
)

function dateToInput(d) {
  if (!d) return ''
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const modalFechas = reactive({
  show: false,
  rutaId: '',
  vendedorNombre: '',
  fechaApertura: '',
  fechaCierre: '',
  error: ''
})
const guardandoFechas = ref(false)

function abrirModalFechas(ruta) {
  if (!ruta) return
  modalFechas.show = true
  modalFechas.rutaId = String(ruta._id)
  modalFechas.vendedorNombre = ruta.vendedor?.nombre || ''
  modalFechas.fechaApertura = dateToInput(ruta.fechaApertura)
  modalFechas.fechaCierre = dateToInput(ruta.fechaCierre)
  modalFechas.error = ''
}

function cerrarModalFechas() {
  modalFechas.show = false
  modalFechas.rutaId = ''
  modalFechas.vendedorNombre = ''
  modalFechas.fechaApertura = ''
  modalFechas.fechaCierre = ''
  modalFechas.error = ''
}

async function guardarFechas() {
  if (!modalFechas.rutaId || guardandoFechas.value) return
  if (!modalFechas.fechaApertura && !modalFechas.fechaCierre) {
    modalFechas.error = 'Debes ingresar al menos una fecha.'
    return
  }
  guardandoFechas.value = true
  modalFechas.error = ''
  try {
    const cod = localStorage.getItem('codigoVinculacion') || ''
    const body = { codigoVinculacion: cod }
    if (modalFechas.fechaApertura) body.fechaApertura = new Date(modalFechas.fechaApertura).toISOString()
    if (modalFechas.fechaCierre) body.fechaCierre = new Date(modalFechas.fechaCierre).toISOString()
    const res = await fetch(`${API_BASE_URL}/api/admin/rutas/${modalFechas.rutaId}/fechas`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      modalFechas.error = data.error || t('admin.dateSaveError')
      return
    }
    cerrarModalFechas()
    await cargarClientes()
  } catch (e) {
    modalFechas.error = t('admin.dateSaveError')
  } finally {
    guardandoFechas.value = false
  }
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

/* Mismo acento visual que tarjetas del asesor (Ver más) */
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
/* Respaldo cross-browser: halo extra en el ícono */
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
</style>

