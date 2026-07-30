<template>
  <div class="min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-neutral-100 dark:bg-slate-900 transition-colors duration-300">
    <NavbarAdmin class="shrink-0" @logout="logout" />
    <div ref="scrollEl" class="p-3 md:p-4 w-full max-w-full min-w-0 box-border overflow-x-clip pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div v-if="cargando" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-neutral-300 dark:border-slate-600 border-t-blue-600 dark:border-t-blue-400" />
      </div>
      <div v-else>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <h2 class="text-lg md:text-xl font-bold text-neutral-900 dark:text-slate-100">
              Dashboard Global
              <span class="text-neutral-500 dark:text-slate-400 font-normal text-base ml-2">({{ clientesFiltrados.length }})</span>
            </h2>
            <button type="button" @click="abrirModalCorregir"
              class="px-3 py-1.5 rounded-lg border-2 border-amber-400/60 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors flex items-center gap-1.5 shrink-0">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Corregir fechas
            </button>

          </div>
        </div>

        <div class="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
          <div class="w-full sm:w-56 shrink-0">
            <label class="block text-xs font-semibold text-neutral-600 dark:text-slate-400 mb-1">Vendedor</label>
            <select
              v-model="vendedorFiltro"
              class="w-full px-3 py-3 border-2 border-neutral-400 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-neutral-900 dark:text-slate-100 text-sm"
            >
              <option value="">Todos los vendedores</option>
              <option v-for="v in vendedores" :key="v._id" :value="v._id">
                {{ v.nombre }}<template v-if="v.ciudad"> ({{ v.ciudad }})</template>
              </option>
            </select>
          </div>
          <div class="flex-1 min-w-0">
            <label class="block text-xs font-semibold text-neutral-600 dark:text-slate-400 mb-1">{{ t('common.searchClient') }}</label>
            <div class="relative">
              <input
                v-model="filtroBusqueda"
                type="text"
                :placeholder="t('common.searchClientPlaceholder')"
                class="w-full pl-10 pr-10 py-3 border-2 border-neutral-400 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-neutral-400 focus:border-neutral-500 bg-white dark:bg-slate-800 text-neutral-900 dark:text-slate-100 shadow-sm text-sm"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                v-if="filtroBusqueda"
                type="button"
                @click.stop="filtroBusqueda = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-slate-400 hover:text-neutral-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-full hover:bg-neutral-200 dark:hover:bg-slate-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <div v-if="clientesSinRuta.length > 0" class="card-min p-2 md:p-3">
            <h3 class="text-lg font-semibold text-neutral-800 dark:text-slate-100 mb-2 flex items-center justify-between cursor-pointer bg-neutral-200 dark:bg-slate-800/40 px-2 py-1.5 rounded-md" @click="toggleSeccion('sinRuta')">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Sin ruta abierta ({{ clientesSinRuta.length }})
              </div>
              <svg class="w-5 h-5 text-neutral-600 transition-transform duration-200" :class="{ 'rotate-180': !seccionesAbiertas.sinRuta }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </h3>
            <div v-if="seccionesAbiertas.sinRuta">
              <DashboardClientesDosColumnas :list="filtrar(clientesSinRuta)" :item-key="(c, i) => c._id || i">
                <template #default="{ item: c, index: i }">
                  <ClienteCard :cliente="c" :index="i" :pagos-index="pagosIndex" :rutas-por-vendedor="rutasPorVendedor" @pagar="irAPagos" @historial="irHistorialCliente" @llamar="llamarCliente" @editar-cliente="abrirModalEditarCliente" @eliminar-cliente="confirmarEliminarCliente" />
                </template>
              </DashboardClientesDosColumnas>
            </div>
          </div>

          <div v-if="clientesSinPago.length > 0" class="card-min p-2 md:p-3">
            <h3 class="text-lg font-semibold text-neutral-800 dark:text-slate-100 mb-2 flex items-center justify-between cursor-pointer bg-neutral-200 dark:bg-slate-800/40 px-2 py-1.5 rounded-md" @click="toggleSeccion('sinPago')">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Sin pago en ruta ({{ clientesSinPago.length }})
              </div>
              <svg class="w-5 h-5 text-neutral-600 transition-transform duration-200" :class="{ 'rotate-180': !seccionesAbiertas.sinPago }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </h3>
            <div v-if="seccionesAbiertas.sinPago">
              <DashboardClientesDosColumnas :list="filtrar(clientesSinPago)" :item-key="(c, i) => c._id || i">
                <template #default="{ item: c, index: i }">
                  <ClienteCard :cliente="c" :index="i" :pagos-index="pagosIndex" :rutas-por-vendedor="rutasPorVendedor" @pagar="irAPagos" @historial="irHistorialCliente" @llamar="llamarCliente" @editar-cliente="abrirModalEditarCliente" @eliminar-cliente="confirmarEliminarCliente" />
                </template>
              </DashboardClientesDosColumnas>
            </div>
          </div>

          <DashboardClientesSeccionDivider v-if="clientesConPago.length > 0" aria-label="Clientes con pago" />

          <div v-if="clientesConPago.length > 0" class="card-min p-2 md:p-3">
            <h3 class="text-lg font-semibold text-neutral-800 dark:text-slate-100 mb-2 flex items-center justify-between cursor-pointer bg-neutral-200 dark:bg-slate-800/40 px-2 py-1.5 rounded-md" @click="toggleSeccion('conPago')">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Con pago en ruta ({{ clientesConPago.length }})
              </div>
              <svg class="w-5 h-5 text-neutral-600 transition-transform duration-200" :class="{ 'rotate-180': !seccionesAbiertas.conPago }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </h3>
            <div v-if="seccionesAbiertas.conPago">
              <DashboardClientesDosColumnas :list="filtrar(clientesConPago)" :item-key="(c, i) => c._id || i" wide-gap>
                <template #default="{ item: c, index: i }">
                  <ClienteCard :cliente="c" :index="i" :pagos-index="pagosIndex" :rutas-por-vendedor="rutasPorVendedor" :pago-en-ruta="pagoPorClienteMap.get(String(c._id)) || null" @pagar="irAPagos" @historial="irHistorialCliente" @llamar="llamarCliente" @eliminar-pago="abrirModalEliminar" @editar-cliente="abrirModalEditarCliente" @eliminar-cliente="confirmarEliminarCliente" />
                </template>
              </DashboardClientesDosColumnas>
            </div>
          </div>

          <div v-if="clientesFiltrados.length === 0" class="text-neutral-500 dark:text-neutral-400 text-center py-10">
            No hay clientes que coincidan con los filtros
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="modalHistorialVentas" class="fixed inset-0 z-[9999] flex items-center justify-center p-4" @click.self="modalHistorialVentas = null">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="modalHistorialVentas = null" />
        <HistorialVentasClienteModal :data="modalHistorialVentas" @cerrar="modalHistorialVentas = null" />
      </div>
      <div v-if="modalEliminar" class="fixed inset-0 z-[9999] flex items-center justify-center p-4" @click.self="modalEliminar = null">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="modalEliminar = null" />
        <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-5 md:p-6 mx-auto border border-neutral-300 dark:border-slate-600">
          <h3 class="text-lg font-bold text-neutral-900 dark:text-slate-100 mb-4">Eliminar pago en ruta</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-neutral-600 dark:text-slate-400">Cliente</span>
              <span class="font-semibold text-neutral-900 dark:text-slate-100 text-right">{{ modalEliminar.cliente.nombres }} {{ modalEliminar.cliente.apellidos }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-600 dark:text-slate-400">Pago actual</span>
              <span class="font-semibold text-neutral-900 dark:text-slate-100">${{ formatNum(modalEliminar.pago.valor) }} ({{ modalEliminar.pago.numParcelas || 1 }} cuota{{ (modalEliminar.pago.numParcelas || 1) > 1 ? 's' : '' }})</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-600 dark:text-slate-400">Saldo actual</span>
              <span class="font-semibold text-neutral-900 dark:text-slate-100">${{ formatNum(modalEliminar.cliente.total) }}</span>
            </div>
            <hr class="border-neutral-300 dark:border-slate-600" />
            <div class="flex justify-between">
              <span class="font-bold text-neutral-900 dark:text-slate-100">Saldo después</span>
              <span class="font-bold text-lg text-amber-600 dark:text-amber-400">${{ formatNum(Number(modalEliminar.cliente.total) + Number(modalEliminar.pago.valor)) }}</span>
            </div>
            <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-200 mt-2">
              ⚠ La deuda del cliente subirá al eliminar este pago
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-5">
            <button type="button" @click="modalEliminar = null" class="px-4 py-2 rounded-lg border border-neutral-400 dark:border-slate-500 bg-white dark:bg-slate-700 text-neutral-800 dark:text-slate-100 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-slate-600 transition-colors">
              Cancelar
            </button>
            <button type="button" @click="confirmarEliminar" :disabled="eliminando" class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center gap-2">
              <svg v-if="eliminando" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
              {{ eliminando ? 'Eliminando...' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
      <div v-if="modalEliminarCliente" class="fixed inset-0 z-[9999] flex items-center justify-center p-4" @click.self="modalEliminarCliente = null">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="modalEliminarCliente = null" />
        <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-5 md:p-6 mx-auto border border-neutral-300 dark:border-slate-600">
          <h3 class="text-lg font-bold text-red-700 dark:text-red-300 mb-4">Eliminar cliente permanentemente</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-neutral-600 dark:text-slate-400">Cliente</span>
              <span class="font-semibold text-neutral-900 dark:text-slate-100 text-right">{{ modalEliminarCliente?.nombres }} {{ modalEliminarCliente?.apellidos }}</span>
            </div>
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-lg p-3 text-xs text-red-800 dark:text-red-200 mt-2 space-y-1">
              <p>Se eliminar&aacute;n <strong>todos</strong> los datos relacionados:</p>
              <ul class="list-disc list-inside">
                <li>Pagos registrados</li>
                <li>Historial del cliente</li>
                <li>Notas del d&iacute;a asociadas</li>
                <li>C&eacute;dulas reportadas</li>
                <li>El registro del cliente</li>
              </ul>
              <p class="font-bold mt-1">Esta acci&oacute;n no se puede deshacer.</p>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-5">
            <button type="button" @click="modalEliminarCliente = null" class="px-4 py-2 rounded-lg border border-neutral-400 dark:border-slate-500 bg-white dark:bg-slate-700 text-neutral-800 dark:text-slate-100 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-slate-600 transition-colors">
              Cancelar
            </button>
            <button type="button" @click="ejecutarEliminarCliente" :disabled="eliminandoCliente" class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center gap-2">
              <svg v-if="eliminandoCliente" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
              {{ eliminandoCliente ? 'Eliminando...' : 'Eliminar permanentemente' }}
            </button>
          </div>
        </div>
      </div>
      <div v-if="modalCorregir.visible" class="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-8 md:pt-12 overflow-y-auto" @click.self="modalCorregir.visible = false">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="modalCorregir.visible = false" />
        <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full p-5 md:p-6 mx-auto border border-neutral-300 dark:border-slate-600">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-neutral-900 dark:text-slate-100">Corregir fechas de ruta</h3>
            <button @click="modalCorregir.visible = false" class="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-700 text-neutral-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-neutral-600 dark:text-slate-400 mb-1">Vendedor</label>
                <select v-model="modalCorregir.vendedorId" @change="cargarRutasVendedor"
                  class="w-full px-3 py-2.5 border-2 border-neutral-400 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 text-sm">
                  <option value="">Seleccionar vendedor</option>
                  <option v-for="v in vendedores" :key="v._id" :value="v._id">{{ v.nombre }}<template v-if="v.ciudad"> ({{ v.ciudad }})</template></option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-neutral-600 dark:text-slate-400 mb-1">Ruta</label>
                <select v-model="modalCorregir.rutaId" @change="cargarDetalleRuta"
                  :disabled="!modalCorregir.vendedorId || modalCorregir.cargandoRutas"
                  class="w-full px-3 py-2.5 border-2 border-neutral-400 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 text-sm disabled:opacity-50">
                  <option value="">Seleccionar ruta</option>
                  <option v-for="r in modalCorregir.rutas" :key="r._id" :value="r._id">
                    {{ formatFechaRuta(r.fechaApertura) }} {{ r.abierta ? '(Abierta)' : '(Cerrada)' }}
                  </option>
                </select>
              </div>
            </div>

            <div v-if="modalCorregir.cargandoDetalle" class="flex justify-center py-6">
              <div class="animate-spin rounded-full h-8 w-8 border-4 border-neutral-300 dark:border-slate-600 border-t-blue-600 dark:border-t-blue-400" />
            </div>

            <div v-if="modalCorregir.detalle && !modalCorregir.cargandoDetalle" class="space-y-4">
              <div class="border border-neutral-300 dark:border-slate-600 rounded-xl p-4 space-y-3">
                <h4 class="font-bold text-sm text-neutral-800 dark:text-slate-200">Fechas de la ruta</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-neutral-600 dark:text-slate-400 mb-1">Fecha de apertura</label>
                    <input type="datetime-local" v-model="modalCorregir.editFechaApertura"
                      class="w-full px-3 py-2 border-2 border-neutral-400 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 text-sm" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-neutral-600 dark:text-slate-400 mb-1">Fecha de cierre</label>
                    <input type="datetime-local" v-model="modalCorregir.editFechaCierre"
                      class="w-full px-3 py-2 border-2 border-neutral-400 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 text-sm" />
                  </div>
                </div>
              </div>

              <div v-if="modalCorregir.detalle.pagos.length > 0" class="border border-neutral-300 dark:border-slate-600 rounded-xl p-4 space-y-2">
                <h4 class="font-bold text-sm text-neutral-800 dark:text-slate-200">Pagos ({{ modalCorregir.detalle.pagos.length }})</h4>
                <div v-for="(p, idx) in modalCorregir.detalle.pagos" :key="p._id"
                  class="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-slate-700/50">
                  <span class="text-xs font-medium text-neutral-700 dark:text-slate-300 min-w-0 flex-1">{{ p.cliente?.nombres || '—' }} {{ p.cliente?.apellidos || '' }}</span>
                  <span class="text-xs text-neutral-500 dark:text-slate-400 shrink-0">{{ p.tipo }} ${{ formatNum(p.valor) }}</span>
                  <input type="datetime-local" v-model="modalCorregir.detalle.pagos[idx]._editFecha"
                    class="w-full sm:w-52 px-2 py-1.5 border-2 border-neutral-400 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 text-xs" />
                </div>
              </div>

              <div v-if="modalCorregir.detalle.ingresos.length > 0" class="border border-neutral-300 dark:border-slate-600 rounded-xl p-4 space-y-2">
                <h4 class="font-bold text-sm text-neutral-800 dark:text-slate-200">Ingresos ({{ modalCorregir.detalle.ingresos.length }})</h4>
                <div v-for="(i, idx) in modalCorregir.detalle.ingresos" :key="i._id"
                  class="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-slate-700/50">
                  <span class="text-xs font-medium text-neutral-700 dark:text-slate-300 min-w-0 flex-1">{{ i.tipo }}</span>
                  <span class="text-xs text-neutral-500 dark:text-slate-400 shrink-0">${{ formatNum(i.valor) }}</span>
                  <input type="datetime-local" v-model="modalCorregir.detalle.ingresos[idx]._editFecha"
                    class="w-full sm:w-52 px-2 py-1.5 border-2 border-neutral-400 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 text-xs" />
                </div>
              </div>

              <div v-if="modalCorregir.detalle.egresos.length > 0" class="border border-neutral-300 dark:border-slate-600 rounded-xl p-4 space-y-2">
                <h4 class="font-bold text-sm text-neutral-800 dark:text-slate-200">Egresos ({{ modalCorregir.detalle.egresos.length }})</h4>
                <div v-for="(e, idx) in modalCorregir.detalle.egresos" :key="e._id"
                  class="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-slate-700/50">
                  <span class="text-xs font-medium text-neutral-700 dark:text-slate-300 min-w-0 flex-1">{{ e.tipo }}</span>
                  <span class="text-xs text-neutral-500 dark:text-slate-400 shrink-0">${{ formatNum(e.valor) }}</span>
                  <input type="datetime-local" v-model="modalCorregir.detalle.egresos[idx]._editFecha"
                    class="w-full sm:w-52 px-2 py-1.5 border-2 border-neutral-400 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 text-xs" />
                </div>
              </div>

              <div v-if="modalCorregir.detalle.ventas.length > 0" class="border border-neutral-300 dark:border-slate-600 rounded-xl p-4 space-y-2">
                <h4 class="font-bold text-sm text-neutral-800 dark:text-slate-200">Ventas ({{ modalCorregir.detalle.ventas.length }})</h4>
                <div v-for="(v, idx) in modalCorregir.detalle.ventas" :key="v._id"
                  class="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-slate-700/50">
                  <span class="text-xs font-medium text-neutral-700 dark:text-slate-300 min-w-0 flex-1">{{ v.descripcion || '—' }}</span>
                  <span class="text-xs text-neutral-500 dark:text-slate-400 shrink-0">${{ formatNum(v.valor) }}</span>
                  <input type="datetime-local" v-model="modalCorregir.detalle.ventas[idx]._editFecha"
                    class="w-full sm:w-52 px-2 py-1.5 border-2 border-neutral-400 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 text-xs" />
                </div>
              </div>

              <div v-if="modalCorregir.detalle.clientes && modalCorregir.detalle.clientes.length > 0" class="border border-neutral-300 dark:border-slate-600 rounded-xl p-4 space-y-2">
                <h4 class="font-bold text-sm text-neutral-800 dark:text-slate-200">Clientes ({{ modalCorregir.detalle.clientes.length }})</h4>
                <div v-for="(c, idx) in modalCorregir.detalle.clientes" :key="c._id"
                  class="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-slate-700/50">
                  <span class="text-xs font-medium text-neutral-700 dark:text-slate-300 min-w-0 flex-1">{{ c.nombres || '—' }} {{ c.apellidos || '' }}</span>
                  <div class="flex gap-2 items-center">
                    <select v-model="modalCorregir.detalle.clientes[idx]._editFrecuencia"
                      class="px-2 py-1.5 border-2 border-neutral-400 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 text-xs">
                      <option value="">Sin cambio</option>
                      <option value="Diaria">Diaria</option>
                      <option value="Semanal">Semanal</option>
                      <option value="Quincenal">Quincenal</option>
                      <option value="Mensual">Mensual</option>
                    </select>
                    <select v-if="c._editFrecuencia && c._editFrecuencia !== 'Diaria'" v-model="modalCorregir.detalle.clientes[idx]._editDiaPago"
                      class="w-28 px-2 py-1.5 border-2 border-neutral-400 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 text-xs">
                      <option value="">Sin cambio</option>
                      <option value="lunes">Lunes</option>
                      <option value="martes">Martes</option>
                      <option value="miércoles">Miércoles</option>
                      <option value="jueves">Jueves</option>
                      <option value="viernes">Viernes</option>
                      <option value="sábado">Sábado</option>
                      <option value="domingo">Domingo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div v-if="mensajeCorregir" class="text-sm px-3 py-2 rounded-lg"
                :class="mensajeCorregir.tipo === 'ok' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/50' : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700/50'">
                {{ mensajeCorregir.texto }}
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="modalCorregir.visible = false"
                  class="px-4 py-2 rounded-lg border border-neutral-400 dark:border-slate-500 bg-white dark:bg-slate-700 text-neutral-800 dark:text-slate-100 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-slate-600 transition-colors">
                  Cerrar
                </button>
                <button type="button" @click="guardarCorrecciones" :disabled="guardandoCorrecciones"
                  class="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center gap-2">
                  <svg v-if="guardandoCorrecciones" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                  {{ guardandoCorrecciones ? 'Guardando...' : 'Guardar cambios' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal editar cliente (superusuario) -->
      <div v-if="modalEditarCliente.visible" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
        @click.self="cerrarModalEditarCliente">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="cerrarModalEditarCliente" />
        <div class="relative bg-white dark:bg-slate-800 border-2 border-neutral-200 dark:border-slate-600 rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-bold mb-4 text-neutral-900 dark:text-slate-100">Editar cliente</h3>
          <form @submit.prevent="guardarEdicionCliente" class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.name') }}</label>
                <input v-model="modalEditarCliente.nombres" type="text" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.lastname') }}</label>
                <input v-model="modalEditarCliente.apellidos" type="text" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.id') }}</label>
              <input v-model="modalEditarCliente.cc" type="text" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.nickname') }}</label>
              <input v-model="modalEditarCliente.apodo" type="text" class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.phone') }}</label>
              <input v-model="modalEditarCliente.celular" type="tel" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.residentialAddress') }}</label>
              <input v-model="modalEditarCliente.direccion_residencial" type="text" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.commercialAddress') }}</label>
              <input v-model="modalEditarCliente.direccion" type="text" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">{{ $t('client.value') }} (venta)</label>
                <input v-model.number="modalEditarCliente.valor" type="number" min="0" step="0.01" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">Intereses (%)</label>
                <input v-model.number="modalEditarCliente.interesPercent" type="number" min="0" max="100" step="0.1" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
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
                <input v-model.number="modalEditarCliente.numeroCuotas" type="number" min="1" required class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
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
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">Frecuencia</label>
                <select v-model="modalEditarCliente.frecuencia" class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100">
                  <option value="">Seleccione frecuencia</option>
                  <option value="Diaria">Diaria</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Quincenal">Quincenal</option>
                  <option value="Mensual">Mensual</option>
                </select>
              </div>
              <div v-if="modalEditarCliente.frecuencia && modalEditarCliente.frecuencia !== 'Diaria'">
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-1">Día de pago</label>
                <select v-model="modalEditarCliente.diaPago" class="w-full border-2 border-neutral-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100">
                  <option value="">Seleccione día</option>
                  <option value="lunes">Lunes</option>
                  <option value="martes">Martes</option>
                  <option value="miércoles">Miércoles</option>
                  <option value="jueves">Jueves</option>
                  <option value="viernes">Viernes</option>
                  <option value="sábado">Sábado</option>
                  <option value="domingo">Domingo</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-slate-600">
              <div class="text-sm">
                <div class="font-semibold text-neutral-700 dark:text-slate-300 mb-1">Antes</div>
                <div class="space-y-0.5 text-neutral-600 dark:text-slate-400">
                  <div>Venta: ${{ valoresInicialesEditar.valor }}</div>
                  <div>Intereses: {{ valoresInicialesEditar.interesPercent }}%</div>
                  <div>Total: ${{ valoresInicialesEditar.saldoInicial }}</div>
                  <div>Parcela: ${{ valoresInicialesEditar.parcela }}</div>
                </div>
              </div>
              <div class="text-sm">
                <div class="font-semibold text-neutral-700 dark:text-slate-300 mb-1">Ahora</div>
                <div class="space-y-0.5 text-neutral-600 dark:text-slate-400">
                  <div>Venta: ${{ (Number(modalEditarCliente.valor) || 0).toFixed(2) }}</div>
                  <div>Intereses: {{ (Number(modalEditarCliente.interesPercent) || 0) }}%</div>
                  <div>Total: ${{ totalAPagarCalculado.toFixed(2) }}</div>
                  <div>Parcela: ${{ valorParcelaCalculado.toFixed(2) }}</div>
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" @click="cerrarModalEditarCliente" class="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-slate-600 text-neutral-800 dark:text-slate-200 hover:bg-neutral-300 dark:hover:bg-slate-500">
                Cancelar
              </button>
              <button type="submit" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import API_BASE_URL from '../config/api.js'
import NavbarAdmin from '../components/NavbarAdmin.vue'
import DashboardClientesDosColumnas from '../components/DashboardClientesDosColumnas.vue'
import DashboardClientesSeccionDivider from '../components/DashboardClientesSeccionDivider.vue'
import HistorialVentasClienteModal from '../components/HistorialVentasClienteModal.vue'
import ClienteCard from '../components/ClienteCard.vue'
import { useClienteStore } from '../stores/useClienteStore'

const { t } = useI18n()
const router = useRouter()
const clienteStore = useClienteStore()

const cargando = ref(true)
const clientes = ref([])
const vendedores = ref([])
const rutasPorVendedor = ref({})
const pagosEnRutasAbiertas = ref([])
const vendedorFiltro = ref('')
const filtroBusqueda = ref('')
const modalHistorialVentas = ref(null)
const modalEliminar = ref(null)
const eliminando = ref(false)
const modalEliminarCliente = ref(null)
const eliminandoCliente = ref(false)
const guardandoCorrecciones = ref(false)
const mensajeCorregir = ref(null)
const seccionesAbiertas = ref({ sinRuta: true, sinPago: true, conPago: true })

const modalCorregir = ref({
  visible: false,
  vendedorId: '',
  rutaId: '',
  rutas: [],
  cargandoRutas: false,
  cargandoDetalle: false,
  detalle: null,
  editFechaApertura: '',
  editFechaCierre: ''
})

const modalEditarCliente = ref({
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

const valoresInicialesEditar = ref({
  valor: '0.00',
  interesPercent: '0',
  saldoInicial: '0.00',
  parcela: '0.00'
})

const totalAPagarCalculado = computed(() => {
  const v = Number(modalEditarCliente.value.valor) || 0
  const pct = Number(modalEditarCliente.value.interesPercent) || 0
  return Math.round((v * (1 + pct / 100)) * 100) / 100
})

const valorParcelaCalculado = computed(() => {
  const total = totalAPagarCalculado.value
  const n = Math.max(1, Math.floor(Number(modalEditarCliente.value.numeroCuotas) || 1))
  return n > 0 ? Math.round((total / n) * 100) / 100 : 0
})

function abrirModalEditarCliente(c) {
  const valor = Number(c.valor) ?? 0
  const saldoInicial = Number(c.saldo_inicial) ?? Number(c.total) ?? 0
  const parcela = Number(c.parcela) ?? 0
  let interesPercent = 0
  if (valor > 0 && saldoInicial >= valor) {
    interesPercent = Math.round(((saldoInicial - valor) / valor) * 1000) / 10
  }
  const numeroCuotas = parcela > 0 && saldoInicial > 0 ? Math.max(1, Math.round(saldoInicial / parcela)) : 1
  valoresInicialesEditar.value = {
    valor: valor.toFixed(2),
    interesPercent: String(interesPercent),
    saldoInicial: saldoInicial.toFixed(2),
    parcela: parcela.toFixed(2)
  }
  modalEditarCliente.value = {
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

function cerrarModalEditarCliente() {
  modalEditarCliente.value.visible = false
}

async function guardarEdicionCliente() {
  const id = modalEditarCliente.value._id
  if (!id) return
  const payload = {
    nombres: (modalEditarCliente.value.nombres || '').trim(),
    apellidos: (modalEditarCliente.value.apellidos || '').trim(),
    cc: (modalEditarCliente.value.cc || '').trim(),
    apodo: (modalEditarCliente.value.apodo || '').trim(),
    celular: (modalEditarCliente.value.celular || '').trim(),
    direccion: (modalEditarCliente.value.direccion || '').trim(),
    direccion_residencial: (modalEditarCliente.value.direccion_residencial || '').trim(),
    valor: Number(modalEditarCliente.value.valor),
    saldo_inicial: totalAPagarCalculado.value,
    parcela: valorParcelaCalculado.value,
    dias: Math.max(1, Math.floor(Number(modalEditarCliente.value.numeroCuotas) || 1)),
    frecuencia: modalEditarCliente.value.frecuencia || undefined,
    diaPago: modalEditarCliente.value.diaPago || undefined
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      cerrarModalEditarCliente()
      await cargarDatos()
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'Error al actualizar cliente')
    }
  } catch (e) {
    console.error('Error guardando cliente:', e)
    alert('Error al actualizar cliente')
  }
}

function formatNum(n, dec = 2) {
  const num = Number(n)
  if (!isFinite(num)) return (0).toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec })
  return num.toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

function toggleSeccion(key) {
  seccionesAbiertas.value[key] = !seccionesAbiertas.value[key]
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

const pagosIndex = computed(() => {
  const pagosPorClienteRuta = new Set()
  const montoPorClienteRuta = new Map()
  const pagosPorClienteIdMap = new Map()

  for (const p of pagosEnRutasAbiertas.value) {
    const cid = idClienteEnPago(p)
    const rid = idRutaEnPago(p)
    if (cid && rid) {
      const k = `${cid}|${rid}`
      pagosPorClienteRuta.add(k)
      const tipo = String(p?.tipo || '').trim().toLowerCase()
      if (tipo === 'parcela' || tipo === 'abono') {
        const prev = montoPorClienteRuta.get(k) || 0
        montoPorClienteRuta.set(k, prev + (Number(p?.valor) || 0))
      }
    }
    if (cid) {
      const arr = pagosPorClienteIdMap.get(cid)
      if (arr) arr.push(p)
      else pagosPorClienteIdMap.set(cid, [p])
    }
  }
  for (const [, arr] of pagosPorClienteIdMap.entries()) {
    arr.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  }
  return { pagosPorClienteRuta, montoPorClienteRuta, pagosPorClienteIdMap }
})

function tienePagoEnRuta(cliente, vendorId) {
  const ruta = rutasPorVendedor.value[vendorId]
  if (!ruta) return false
  const key = `${String(cliente._id)}|${String(ruta._id)}`
  return pagosIndex.value.pagosPorClienteRuta.has(key)
}

function getVendorId(cliente) {
  if (!cliente.vendedor) return null
  if (typeof cliente.vendedor === 'object') return String(cliente.vendedor._id || cliente.vendedor)
  return String(cliente.vendedor)
}

const clientesSinRuta = computed(() => {
  return clientesFiltroVendor.value.filter(c => {
    const vid = getVendorId(c)
    return !vid || !rutasPorVendedor.value[vid]
  })
})

const clientesSinPago = computed(() => {
  return clientesFiltroVendor.value.filter(c => {
    const vid = getVendorId(c)
    return vid && rutasPorVendedor.value[vid] && !tienePagoEnRuta(c, vid)
  })
})

const clientesConPago = computed(() => {
  return clientesFiltroVendor.value.filter(c => {
    const vid = getVendorId(c)
    return vid && rutasPorVendedor.value[vid] && tienePagoEnRuta(c, vid)
  })
})

const clientesFiltroVendor = computed(() => {
  if (!vendedorFiltro.value) return clientes.value
  return clientes.value.filter(c => getVendorId(c) === vendedorFiltro.value)
})

const clientesFiltrados = computed(() => {
  return [...clientesSinRuta.value, ...clientesSinPago.value, ...clientesConPago.value]
})

const pagoPorClienteMap = computed(() => {
  const map = new Map()
  for (const p of pagosEnRutasAbiertas.value) {
    const cid = idClienteEnPago(p)
    if (!cid) continue
    const existing = map.get(cid)
    if (!existing || new Date(p.fecha) > new Date(existing.fecha)) {
      map.set(cid, p)
    }
  }
  return map
})

function filtrar(lista) {
  const q = filtroBusqueda.value.trim().toLowerCase()
  if (!q) return lista
  return lista.filter(c => {
    const nombre = `${c.nombres || ''} ${c.apellidos || ''}`.toLowerCase()
    const cc = String(c.cc || '')
    const apodo = String(c.apodo || '').toLowerCase()
    return nombre.includes(q) || cc.includes(q) || apodo.includes(q)
  })
}

function irAPagos(cliente) {
  const vid = getVendorId(cliente)
  const ruta = vid ? rutasPorVendedor.value[vid] : null
  clienteStore.setCliente(cliente)
  router.push('/pagos')
}

async function irHistorialCliente(cliente) {
  const id = cliente?._id
  const vid = getVendorId(cliente)
  if (!id || !vid) return
  modalHistorialVentas.value = null
  try {
    const res = await fetch(`${API_BASE_URL}/api/historial-clientes/vendedor/${encodeURIComponent(vid)}/cliente/${encodeURIComponent(String(id))}?_t=${Date.now()}`, { cache: 'no-store' })
    const data = await res.json().catch(() => null)
    if (!res.ok) { alert(data?.error || 'No se pudo cargar el historial'); return }
    modalHistorialVentas.value = data
  } catch (e) {
    alert('Error al cargar el historial')
  }
}

function llamarCliente(cliente) {
  if (cliente.celular) window.location.href = `tel:${cliente.celular}`
}

function abrirModalEliminar({ cliente, pago }) {
  modalEliminar.value = { cliente, pago }
}

async function confirmarEliminar() {
  if (!modalEliminar.value) return
  eliminando.value = true
  const pagoId = modalEliminar.value.pago._id
  try {
    const res = await fetch(`${API_BASE_URL}/api/pagos/${encodeURIComponent(String(pagoId))}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) { alert(data?.error || 'Error al eliminar el pago'); return }
    modalEliminar.value = null
    await cargarDatos()
  } catch (e) {
    alert('Error de red al eliminar el pago')
  } finally {
    eliminando.value = false
  }
}

function confirmarEliminarCliente(cliente) {
  modalEliminarCliente.value = cliente
}

async function ejecutarEliminarCliente() {
  if (!modalEliminarCliente.value) return
  eliminandoCliente.value = true
  const clienteId = modalEliminarCliente.value._id
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/super/clientes/${encodeURIComponent(String(clienteId))}/limpiar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('sessionToken')}`
      }
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) { alert(data?.error || 'Error al eliminar el cliente'); return }
    modalEliminarCliente.value = null
    await cargarDatos()
  } catch (e) {
    alert('Error de red al eliminar el cliente')
  } finally {
    eliminandoCliente.value = false
  }
}

async function cargarDatos() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/super/clientes?_t=${Date.now()}`, { cache: 'no-store' })
    const data = await res.json()
    if (data.ok) {
      clientes.value = data.clientes || []
      vendedores.value = data.vendedores || []
      rutasPorVendedor.value = data.rutasPorVendedor || {}
      pagosEnRutasAbiertas.value = data.pagosEnRutasAbiertas || []
    }
  } catch (e) {
    console.error('Error recargando datos:', e)
  }
}

function formatFechaRuta(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) }
  catch { return '—' }
}

function dateToInput(d) {
  if (!d) return ''
  try {
    const date = new Date(d)
    if (Number.isNaN(date.getTime())) return ''
    const pad = (n) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  } catch { return '' }
}

function abrirModalCorregir() {
  mensajeCorregir.value = null
  modalCorregir.value = {
    visible: true,
    vendedorId: vendedorFiltro.value || '',
    rutaId: '',
    rutas: [],
    cargandoRutas: false,
    cargandoDetalle: false,
    detalle: null,
    editFechaApertura: '',
    editFechaCierre: ''
  }
  if (modalCorregir.value.vendedorId) cargarRutasVendedor()
}

async function cargarRutasVendedor() {
  const vid = modalCorregir.value.vendedorId
  if (!vid) { modalCorregir.value.rutas = []; return }
  modalCorregir.value.cargandoRutas = true
  modalCorregir.value.rutaId = ''
  modalCorregir.value.detalle = null
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/super/vendedor/${encodeURIComponent(vid)}/rutas`, { cache: 'no-store' })
    const data = await res.json()
    if (data.ok) modalCorregir.value.rutas = data.rutas || []
  } catch (e) {
    console.error('Error cargando rutas:', e)
  } finally {
    modalCorregir.value.cargandoRutas = false
  }
}

async function cargarDetalleRuta() {
  const rid = modalCorregir.value.rutaId
  if (!rid) { modalCorregir.value.detalle = null; return }
  modalCorregir.value.cargandoDetalle = true
  modalCorregir.value.detalle = null
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/super/ruta/${encodeURIComponent(rid)}/detalle`, { cache: 'no-store' })
    const data = await res.json()
    if (data.ok) {
      const d = data
      d.pagos = (d.pagos || []).map(p => ({ ...p, _editFecha: dateToInput(p.fecha) }))
      d.ingresos = (d.ingresos || []).map(i => ({ ...i, _editFecha: dateToInput(i.fecha) }))
      d.egresos = (d.egresos || []).map(e => ({ ...e, _editFecha: dateToInput(e.fecha) }))
      d.ventas = (d.ventas || []).map(v => ({ ...v, _editFecha: dateToInput(v.fecha) }))
      d.clientes = (d.clientes || []).map(c => ({
        ...c,
        _editFrecuencia: c.frecuencia || '',
        _editDiaPago: c.diaPago || ''
      }))
      modalCorregir.value.detalle = d
      modalCorregir.value.editFechaApertura = dateToInput(d.ruta.fechaApertura)
      modalCorregir.value.editFechaCierre = dateToInput(d.ruta.fechaCierre)
    } else {
      alert(data.error || 'Error al cargar detalle de la ruta')
    }
  } catch (e) {
    console.error('Error cargando detalle ruta:', e)
    alert('Error de red al cargar detalle')
  } finally {
    modalCorregir.value.cargandoDetalle = false
  }
}

async function guardarCorrecciones() {
  const detalle = modalCorregir.value.detalle
  if (!detalle) return
  guardandoCorrecciones.value = true
  mensajeCorregir.value = null
  try {
    const body = {}
    if (modalCorregir.value.editFechaApertura) body.fechaApertura = new Date(modalCorregir.value.editFechaApertura).toISOString()
    if (modalCorregir.value.editFechaCierre) body.fechaCierre = new Date(modalCorregir.value.editFechaCierre).toISOString()

    body.pagos = detalle.pagos.filter(p => p._editFecha).map(p => ({ _id: p._id, fecha: new Date(p._editFecha).toISOString() }))
    body.ingresos = detalle.ingresos.filter(i => i._editFecha).map(i => ({ _id: i._id, fecha: new Date(i._editFecha).toISOString() }))
    body.egresos = detalle.egresos.filter(e => e._editFecha).map(e => ({ _id: e._id, fecha: new Date(e._editFecha).toISOString() }))
    body.ventas = detalle.ventas.filter(v => v._editFecha).map(v => ({ _id: v._id, fecha: new Date(v._editFecha).toISOString() }))

    body.clientes = detalle.clientes
      .filter(c => (c._editFrecuencia && c._editFrecuencia !== c.frecuencia) || (c._editDiaPago !== undefined && c._editDiaPago !== c.diaPago))
      .map(c => ({ _id: c._id, frecuencia: c._editFrecuencia || undefined, diaPago: c._editDiaPago || undefined }))

    const total = body.pagos.length + body.ingresos.length + body.egresos.length + body.ventas.length + body.clientes.length + (body.fechaApertura || body.fechaCierre ? 1 : 0)

    const res = await fetch(`${API_BASE_URL}/api/admin/super/ruta/${encodeURIComponent(modalCorregir.value.rutaId)}/corregir-fechas`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (data.ok) {
      mensajeCorregir.value = { tipo: 'ok', texto: `✓ ${total} registro(s) actualizado(s) correctamente` }
      await cargarDatos()
    } else {
      mensajeCorregir.value = { tipo: 'error', texto: data.error || 'Error al guardar' }
    }
  } catch (e) {
    mensajeCorregir.value = { tipo: 'error', texto: 'Error de red al guardar' }
  } finally {
    guardandoCorrecciones.value = false
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
  try { router.replace('/'); setTimeout(() => { if (location.hash && !location.hash.endsWith('#/')) location.href = '/' }, 150) }
  catch (_) { location.href = '/' }
}

onMounted(async () => {
  try {
    await cargarDatos()
  } catch (e) {
    console.error('Error cargando superdashboard:', e)
  } finally {
    cargando.value = false
  }
})
</script>
