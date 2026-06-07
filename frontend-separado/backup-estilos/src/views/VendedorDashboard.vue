<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <NavbarVendedor
      :rutaAbierta="rutaAbierta"
      :cargandoRuta="cargandoRuta"
      :actualizandoDatos="actualizandoDatos"
      :tituloSeccion="t('client.title')"
      @cerrar-ruta="cerrarRuta"
      @logout="logout"
    />

    <!-- Modal de confirmación para abrir ruta -->
    <Teleport to="body">
      <div v-if="mostrarModalApertura" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" @click="mostrarModalApertura = false"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-gray-200/50 dark:border-gray-700/50 transition-all duration-300">
          <div class="p-6 border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-8 h-8 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ t('route.open') }}</h2>
            </div>
          </div>
          <div class="p-6">
            <p class="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{{ t('route.openConfirm') }}</p>
            <div class="flex justify-end gap-3">
              <button @click="mostrarModalApertura = false" class="px-5 py-2.5 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-all duration-200 shadow-sm">{{ t('common.cancel') }}</button>
              <button @click="confirmarAperturaRuta" class="px-5 py-2.5 text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">{{ t('common.confirm') }}</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de confirmación para cerrar ruta -->
    <Teleport to="body">
      <div v-if="mostrarModalCierre" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" @click="mostrarModalCierre = false"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-gray-200/50 dark:border-gray-700/50 transition-all duration-300">
          <div class="p-6 border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-8 h-8 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ t('route.close') }}</h2>
            </div>
          </div>
          <div class="p-6">
            <p class="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{{ t('route.closeConfirm') }}</p>
            <div class="flex justify-end gap-3">
              <button @click="mostrarModalCierre = false" class="px-5 py-2.5 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-all duration-200 shadow-sm">{{ t('common.cancel') }}</button>
              <button @click="confirmarCierreRuta" class="px-5 py-2.5 text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">{{ t('common.confirm') }}</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de advertencia: clientes pendientes -->
    <Teleport to="body">
      <div v-if="mostrarModalPendientes" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" @click="mostrarModalPendientes = false"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-200/50 dark:border-red-700/50 transition-all duration-300">
          <div class="p-6 border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
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
              <button @click="mostrarModalPendientes = false" class="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">{{ t('common.understood') }}</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Modal de advertencia: caja final negativa -->
    <Teleport to="body">
      <div v-if="mostrarModalCajaNegativa" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" @click="mostrarModalCajaNegativa = false"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-200/50 dark:border-red-700/50 transition-all duration-300">
          <div class="p-6 border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
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
              <p class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide">Detalles:</p>
              <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <li class="flex justify-between"><span class="font-medium">Caja inicial:</span> <span class="font-bold">${{ detallesCajaNegativa.cajaInicial?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">Ingresos:</span> <span class="font-bold text-green-600">${{ detallesCajaNegativa.ingresos?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">Recaudado:</span> <span class="font-bold text-green-600">${{ detallesCajaNegativa.recaudado?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">Ventas:</span> <span class="font-bold text-blue-600">${{ detallesCajaNegativa.ventas?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">Egresos:</span> <span class="font-bold text-red-600">${{ detallesCajaNegativa.egresos?.toLocaleString() || '0.00' }}</span></li>
                <li class="flex justify-between"><span class="font-medium">Retiros:</span> <span class="font-bold text-red-600">${{ detallesCajaNegativa.retiros?.toLocaleString() || '0.00' }}</span></li>
              </ul>
            </div>
            <div class="mt-6 flex justify-center">
              <button @click="mostrarModalCajaNegativa = false" class="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">Entendido</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de confirmación para reportar Id -->
    <Teleport to="body">
      <div v-if="mostrarModalReportarCedula" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" @click="mostrarModalReportarCedula = false; clienteParaReportar = null; motivoReporte = ''"></div>
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-indigo-200/50 dark:border-indigo-700/50 transition-all duration-300">
          <div class="p-6 border-b-2 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-8 h-8 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ t('reports.reportId') }}</h2>
            </div>
          </div>
          <div class="p-6">
            <p class="text-base text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
              {{ t('reports.confirm') }} <strong class="text-indigo-600 dark:text-indigo-400">{{ clienteParaReportar?.cc }}</strong>?
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Esta acción marcará el Id como reportado. Al intentar crear un cliente con este Id, se mostrará una advertencia.
            </p>
            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {{ t('reports.reason') }} ({{ t('common.optional') }})
              </label>
              <textarea
                v-model="motivoReporte"
                placeholder="Ej: Cliente con problemas de pago, dirección incorrecta, etc."
                rows="3"
                class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-200"
              ></textarea>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button 
                @click="mostrarModalReportarCedula = false; clienteParaReportar = null; motivoReporte = ''" 
                class="px-5 py-2.5 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-all duration-200 shadow-sm"
              >
                Cancelar
              </button>
              <button 
                @click="confirmarReportarCedula" 
                class="px-5 py-2.5 text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
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
            <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">
              {{ resultadoReporte.exito ? 'Id Reportado' : 'Error' }}
            </h2>
          </div>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            {{ resultadoReporte.mensaje }}
          </p>
          <div class="flex justify-center mt-5">
            <button 
              @click="mostrarModalResultadoReporte = false; resultadoReporte = { exito: false, mensaje: '' }" 
              class="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {{ t('common.understood') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Contenido de clientes -->
    <div class="p-4">
      <div v-if="!rutaAbierta && !cargandoRuta" class="flex flex-col items-center justify-center min-h-[300px]">
        <button
          v-if="!rutaAbierta && !cargandoRuta"
          @click="solicitarAperturaRuta"
          class="bg-green-600 text-white px-6 py-3 rounded font-bold"
        >
          {{ t('route.open') }}
        </button>
        <button 
          v-if="rutaAbierta && !cargandoRuta" 
          @click="cerrarRuta" 
          class="bg-red-600 text-white px-6 py-3 rounded font-bold"
        >
          {{ t('route.close') }}
        </button>
        <div v-if="cargandoRuta" class="text-gray-500 dark:text-gray-400">{{ t('common.loadingRoute') }}</div>
        <div v-if="!rutaAbierta && !cargandoRuta" class="mt-4 text-gray-500 dark:text-gray-400">{{ t('common.mustOpenRoute') }}</div>
      </div>
      <div v-else>
        <div class="flex justify-between items-center mb-6">
          <button
          @click="irACrearCliente"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          {{ t('client.newClient') }}
        </button>
        </div>
        <!-- Lista de clientes dividida en secciones -->
        <div class="space-y-6">
          <!-- Clientes sin pagos en ruta actual -->
          <div class="bg-white dark:bg-gray-800 rounded shadow p-4 transition-colors duration-300">
            <h3
              class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center justify-between cursor-pointer bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md"
              @click="toggleClientesSinPagos"
              :title="mostrarClientesSinPagos ? 'Ocultar sección' : 'Mostrar sección'"
            >
            <div class="flex items-center">
              <svg class="w-6 h-6 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ t('client.clientsWithoutPayments') }} ({{ clientesSinPagos.length }})
            </div>
            <div class="p-1 rounded transition-colors">
              <svg 
                class="w-6 h-6 text-gray-600 dark:text-gray-300 transition-transform duration-200"
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
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ t('common.searchClient') }}</label>
            <div class="relative">
              <input
                v-model="filtroBusquedaSinPagos"
                type="text"
                placeholder="Nombre, apellido, Id o apodo..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                @keyup.enter="() => {}"
              />
              <button
                @click="() => {}"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            <p v-if="filtroBusquedaSinPagos && clientesSinPagosBuscados.length > 0" class="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {{ clientesSinPagosBuscados.length }} resultado(s) encontrado(s)
            </p>
            <p v-else-if="filtroBusquedaSinPagos && clientesSinPagosBuscados.length === 0" class="text-sm text-red-600 dark:text-red-400 mt-2">
              No se encontraron resultados
            </p>
          </div>
          <div v-if="clientesSinPagos.length === 0" class="text-gray-500 dark:text-gray-400 text-center py-4">
            Todos los clientes han realizado pagos en esta ruta.
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full overflow-hidden">
            <div
              v-for="(c, i) in clientesSinPagosBuscados"
              :key="c._id || `sin-pago-${i}`"
              :class="[
                'flex flex-col items-start rounded-lg border border-gray-300 dark:border-gray-600 border-l-4 p-4 cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-700 overflow-hidden min-w-0',
                i % 2 === 0 ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-600',
                calcularParcelasAtrasadas(c) >= 5
                  ? 'border-l-red-600'
                  : calcularParcelasAtrasadas(c) >= 3
                  ? 'border-l-yellow-400'
                  : 'border-l-green-600'
              ]"
            >
              <div class="w-full min-w-0">
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0 cursor-pointer flex flex-col items-center" @click.stop="toggleDesplegar(i)">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                  :class="[
                    'w-16 h-16',
                    calcularParcelasAtrasadas(c) >= 5
                      ? 'text-red-600'
                      : calcularParcelasAtrasadas(c) >= 3
                      ? 'text-yellow-400'
                      : 'text-green-600'
                  ]"
                >
                  <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                </svg>
                    <div class="text-xs text-gray-800 dark:text-gray-200 font-semibold mt-1 text-center">
                      {{ desplegados[i] ? 'Ocultar' : 'Ver más' }}
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="font-bold text-lg text-gray-800 dark:text-gray-100">
                      {{ c.nombres }} {{ c.apellidos }}
                    </div>
                    <div v-if="c.apodo" class="text-gray-700 dark:text-gray-300 font-medium text-sm">({{ c.apodo }})</div>
                  </div>
                </div>
                <div class="mt-3 text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-300 dark:divide-gray-500">
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.sale') }}</span>
                    <span class="text-black dark:text-white font-bold text-base">${{ c.valor }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.initialBalance') }}</span>
                    <span class="text-black dark:text-white font-bold text-base">${{ c.saldo_inicial }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.remainingBalance') }}</span>
                    <span class="text-black dark:text-white font-bold text-base">${{ c.total }}</span>
                  </div>
                  <div class="flex items-start justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.installmentValue') }}</span>
                    <span class="text-right">
                      <span class="text-black dark:text-white font-bold text-base block">${{ c.parcela }}</span>
                      <span class="text-xs text-gray-700 dark:text-gray-300 font-medium">({{ c.saldo_inicial }}/{{ c.dias }} días)</span>
                    </span>
                  </div>
                  <div class="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-3 mt-2 border-t border-gray-200 dark:border-gray-600">
                      <button 
                        @click.stop="irAPagos(c)"
                        :disabled="tieneClienteActivoConMismaCedula(c)"
                        :class="[
                          'px-2 py-2 text-white text-xs font-semibold rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5 w-full',
                          tieneClienteActivoConMismaCedula(c)
                            ? 'bg-gray-400 cursor-not-allowed opacity-60'
                            : 'bg-green-600 hover:bg-green-700 active:scale-95'
                        ]"
                      >
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="text-[11px] whitespace-nowrap">{{ t('client.payment') }}</span>
                      </button>
                      <button 
                        @click.stop="verPagosCliente(c)"
                        class="px-2 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-all shadow-md flex items-center justify-center gap-1.5 w-full active:scale-95"
                      >
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span class="text-[11px] whitespace-nowrap">{{ t('client.viewPayments') }}</span>
                      </button>
                      <button 
                        @click.stop="llamarCliente(c)"
                        class="px-2 py-2 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-all shadow-md flex items-center justify-center gap-1.5 w-full active:scale-95"
                      >
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span class="text-[11px] whitespace-nowrap">{{ t('client.call') }}</span>
                      </button>
                      <button 
                        @click.stop="reportarCliente(c)"
                        class="px-2 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-1.5 w-full active:scale-95"
                      >
                        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span class="text-[11px] whitespace-nowrap">{{ t('client.report') }}</span>
                      </button>
                    </div>
                </div>
                <!-- Info extra desplegable -->
                <div v-if="desplegados[i]" class="mt-2 border-t pt-2 text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-300 dark:divide-gray-500">
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.pendingInstallments') }}</span>
                    <span class="text-black dark:text-white font-bold text-base">{{ calcularParcelasPendientes(c) }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.overdueInstallments') }}</span>
                    <span class="text-black dark:text-white font-bold text-base">{{ calcularParcelasAtrasadas(c) }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.id') }}</span>
                    <span class="text-black dark:text-white font-bold text-base">{{ c.cc }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.residentialAddress') }}</span>
                    <span class="text-black dark:text-white font-bold text-base text-right">{{ resumirDireccion(c.direccion_residencial) }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.commercialAddress') }}</span>
                    <span class="text-black dark:text-white font-bold text-base text-right">{{ resumirDireccion(c.direccion) }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.phone') }}</span>
                    <span class="text-black dark:text-white font-bold text-base">{{ c.celular }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.creationDate') }}</span>
                    <span class="text-black dark:text-white font-bold text-base">{{ c.fecha }}</span>
                  </div>
                </div>
          </div>
          </div>
          </div>
          </div>
          </div>
          <!-- Clientes con pagos en ruta actual -->
          <div class="bg-white dark:bg-gray-800 rounded shadow p-5 md:p-6 border border-gray-200 dark:border-gray-600 transition-colors duration-300">
            <h3
              class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center justify-between cursor-pointer bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md"
              @click="toggleClientesConPagos"
              :title="mostrarClientesConPagos ? 'Ocultar sección' : 'Mostrar sección'"
            >
              <div class="flex items-center">
                <svg class="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ t('client.clientsWithPayments') }} ({{ clientesConPagos.length }})
              </div>
            <div class="p-1 rounded transition-colors">
              <svg 
                class="w-6 h-6 text-gray-600 dark:text-gray-300 transition-transform duration-200"
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
            <!-- Campo de búsqueda -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ t('common.searchClient') }}</label>
              <div class="relative">
                <input
                  v-model="filtroBusquedaConPagos"
                  type="text"
                  placeholder="Nombre, apellido, Id o apodo..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  @keyup.enter="() => {}"
                />
                <button
                  @click="() => {}"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              <p v-if="filtroBusquedaConPagos && clientesConPagosBuscados.length > 0" class="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {{ clientesConPagosBuscados.length }} resultado(s) encontrado(s)
              </p>
              <p v-else-if="filtroBusquedaConPagos && clientesConPagosBuscados.length === 0" class="text-sm text-red-600 dark:text-red-400 mt-2">
                No se encontraron resultados
              </p>
            </div>
            <div v-if="clientesConPagos.length === 0" class="text-gray-500 dark:text-gray-400 text-center py-4">
              No hay clientes con pagos registrados en esta ruta.
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5 w-full overflow-hidden">
            <div
              v-for="(c, i) in clientesConPagosBuscados"
              :key="c._id || `con-pago-${i}`"
              :class="[
                'flex flex-col items-start rounded-lg border border-gray-300 dark:border-gray-600 border-l-4 p-5 md:p-6 cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-700 overflow-hidden min-w-0',
                i % 2 === 0 ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-600',
                'border-l-blue-500'
              ]"
            >
              <div class="w-full min-w-0">
                <div class="flex items-center gap-3">
                  <div class="flex-shrink-0 cursor-pointer flex flex-col items-center" @click.stop="toggleDesplegar(i + clientesSinPagos.length)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                      class="w-16 h-16 text-blue-500"
                    >
                      <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                    </svg>
                    <div class="text-xs text-gray-500 dark:text-gray-300 font-medium mt-1 text-center">
                      {{ desplegados[i + clientesSinPagos.length] ? 'Ocultar' : 'Ver más' }}
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="font-bold text-lg text-gray-800 dark:text-gray-100">
                  {{ c.nombres }} {{ c.apellidos }}
                    </div>
                    <div v-if="c.apodo" class="text-gray-700 dark:text-gray-300 font-medium text-sm">({{ c.apodo }})</div>
                  </div>
                </div>
                <div class="mt-3 text-base text-gray-800 dark:text-gray-200 divide-y divide-gray-300 dark:divide-gray-500">
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.sale') }}</span>
                    <span class="text-black dark:text-white font-bold text-lg">${{ c.valor }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.initialBalance') }}</span>
                    <span class="text-black dark:text-white font-bold text-lg">${{ c.saldo_inicial }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.remainingBalance') }}</span>
                    <span class="text-black dark:text-white font-bold text-lg">${{ c.total }}</span>
                  </div>
                  <div class="flex items-start justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.installmentValue') }}</span>
                    <span class="text-right">
                      <span class="text-black dark:text-white font-bold text-lg block">${{ c.parcela }}</span>
                      <span class="text-xs text-gray-700 dark:text-gray-300 font-medium">({{ c.saldo_inicial }}/{{ c.dias }} días)</span>
                    </span>
                  </div>
                  
                  <!-- Botones de acción cuando información adicional está OCULTA -->
                  <div v-if="!desplegados[i + clientesSinPagos.length]" class="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-600">
                    <button 
                      @click.stop="irAPagos(c)"
                      :disabled="tieneClienteActivoConMismaCedula(c)"
                      :class="[
                        'px-2 py-2 text-white text-xs font-semibold rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5 w-full',
                        tieneClienteActivoConMismaCedula(c)
                          ? 'bg-gray-400 cursor-not-allowed opacity-60'
                          : 'bg-green-600 hover:bg-green-700 active:scale-95'
                      ]"
                    >
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-[11px] whitespace-nowrap">{{ t('client.payment') }}</span>
                    </button>
                    <button 
                      @click.stop="verPagosCliente(c)"
                      class="px-2 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-all shadow-md flex items-center justify-center gap-1.5 w-full active:scale-95"
                    >
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span class="text-[11px] whitespace-nowrap">Ver pagos</span>
                    </button>
                    <button 
                      @click.stop="editarPagoCliente(c)"
                      class="px-2 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-all shadow-md flex items-center justify-center gap-1.5 w-full active:scale-95"
                    >
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                        <span class="text-[11px] whitespace-nowrap">{{ t('client.editPayment') }}</span>
                    </button>
                    <button 
                      @click.stop="llamarCliente(c)"
                      class="px-2 py-2 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-all shadow-md flex items-center justify-center gap-1.5 w-full active:scale-95"
                    >
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span class="text-[11px] whitespace-nowrap">{{ t('client.call') }}</span>
                    </button>
                    <button 
                      @click.stop="reportarCliente(c)"
                      class="px-2 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-1.5 w-full active:scale-95"
                    >
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span class="text-[11px] whitespace-nowrap">Reportar</span>
                    </button>
                  </div>
                </div>
                <!-- Info extra desplegable -->
                <div v-if="desplegados[i + clientesSinPagos.length]" class="mt-2 border-t pt-2 text-base text-gray-800 dark:text-gray-200 divide-y divide-gray-300 dark:divide-gray-500">
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.pendingInstallments') }}</span>
                    <span class="text-black dark:text-white font-bold text-lg">{{ calcularParcelasPendientes(c) }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.overdueInstallments') }}</span>
                    <span class="text-black dark:text-white font-bold text-lg">{{ calcularParcelasAtrasadas(c) }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.id') }}</span>
                    <span class="text-black dark:text-white font-bold text-lg">{{ c.cc }}</span>
                  </div>
                  <!-- Direcciones -->
                  <div v-if="c.direccion_residencial" class="py-2">
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <span class="font-bold text-gray-900 dark:text-gray-100 block mb-1">{{ t('address.residential') }}</span>
                        <p class="text-sm text-gray-700 dark:text-gray-300">{{ resumirDireccion(c.direccion_residencial) }}</p>
                      </div>
                      <button 
                        @click.stop="verEnMapa(c.coordenadas_residencial, c.direccion_residencial)"
                        class="ml-3 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors flex items-center gap-1 flex-shrink-0"
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
                        <span class="font-bold text-gray-900 dark:text-gray-100 block mb-1">{{ t('address.commercial') }}</span>
                        <p class="text-sm text-gray-700 dark:text-gray-300">{{ resumirDireccion(c.direccion) }}</p>
                      </div>
                      <button 
                        @click.stop="verEnMapa(c.coordenadas_comercial, c.direccion)"
                        class="ml-3 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors flex items-center gap-1 flex-shrink-0"
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
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.phone') }}</span>
                    <span class="text-black dark:text-white font-bold text-lg">{{ c.celular }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ t('client.date') }}</span>
                    <span class="text-black dark:text-white font-bold text-lg">{{ c.fecha }}</span>
                  </div>
                  
                  <!-- Botones de acción cuando información adicional está VISIBLE -->
                  <div class="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-600">
                    <button 
                      @click.stop="irAPagos(c)"
                      :disabled="tieneClienteActivoConMismaCedula(c)"
                      :class="[
                        'px-2 py-2 text-white text-xs font-semibold rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5 w-full',
                        tieneClienteActivoConMismaCedula(c)
                          ? 'bg-gray-400 cursor-not-allowed opacity-60'
                          : 'bg-green-600 hover:bg-green-700 active:scale-95'
                      ]"
                    >
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-[11px] whitespace-nowrap">{{ t('client.payment') }}</span>
                    </button>
                    <button 
                      @click.stop="verPagosCliente(c)"
                      class="px-2 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-all shadow-md flex items-center justify-center gap-1.5 w-full active:scale-95"
                    >
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span class="text-[11px] whitespace-nowrap">Ver pagos</span>
                    </button>
                    <button 
                      @click.stop="editarPagoCliente(c)"
                      class="px-2 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-all shadow-md flex items-center justify-center gap-1.5 w-full active:scale-95"
                    >
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                        <span class="text-[11px] whitespace-nowrap">{{ t('client.editPayment') }}</span>
                    </button>
                    <button 
                      @click.stop="llamarCliente(c)"
                      class="px-2 py-2 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-all shadow-md flex items-center justify-center gap-1.5 w-full active:scale-95"
                    >
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span class="text-[11px] whitespace-nowrap">{{ t('client.call') }}</span>
                    </button>
                    <button 
                      @click.stop="reportarCliente(c)"
                      class="px-2 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-1.5 w-full active:scale-95"
                    >
                      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span class="text-[11px] whitespace-nowrap">Reportar</span>
                    </button>
                  </div>
                </div>
                
              </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import API_BASE_URL from '../config/api.js'
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NavbarVendedor from '../components/NavbarVendedor.vue'
// MapaSimple eliminado - ahora usamos botones para abrir Google Maps
import { useClienteStore } from '../stores/useClienteStore'

const { t, locale } = useI18n()

const router = useRouter()
const route = useRoute()
const clientes = ref([])
let cargandoClientesFlag = false
const desplegados = ref([])
const mostrarClientesConPagos = ref(true)
const mostrarClientesSinPagos = ref(true)
const pagos = ref([])
let cargandoPagosFlag = false
const clienteStore = useClienteStore()

const vendedorId = localStorage.getItem('vendedorId')
const rutaAbierta = ref(false)
const cargandoRuta = ref(true)
const mostrarModalApertura = ref(false)
const mostrarModalCierre = ref(false)
const mostrarModalPendientes = ref(false)
const pendientesClientes = ref([])
const mostrarModalCajaNegativa = ref(false)
const mensajeCajaNegativa = ref('')
const detallesCajaNegativa = ref(null)
const mostrarModalReportarCedula = ref(false)
const clienteParaReportar = ref(null)
const motivoReporte = ref('')
const mostrarModalResultadoReporte = ref(false)
const resultadoReporte = ref({ exito: false, mensaje: '' })
const actualizandoDatos = ref(false)
const rutaActualId = ref(null)
let pollingInterval = null
const rutaActualDatos = ref(null)

// Variables para búsqueda de clientes
const filtroBusquedaSinPagos = ref('')
const filtroBusquedaConPagos = ref('')

// Variables computadas para separar clientes
const clientesSinPagos = computed(() => {
  if (!rutaActualId.value) return clientes.value.filter(c => c.estado !== 'finalizado' && !c.cancelado)
  const inicio = rutaActualDatos.value?.fechaApertura ? new Date(rutaActualDatos.value.fechaApertura).getTime() : null
  const fin = rutaActualDatos.value?.fechaCierre ? new Date(rutaActualDatos.value.fechaCierre).getTime() : Date.now()
  
  // NO agrupar por Id - mostrar todos los clientes que cumplan los criterios
  // Esto permite mostrar tanto el cliente original como el renovado
  const clientesFiltrados = clientes.value.filter(cliente => {
    // Excluir clientes finalizados que NO tienen finalizadoPendiente y NO están cancelados
    // (estos son clientes de rutas anteriores que ya fueron procesados)
    if (cliente.estado === 'finalizado' && !cliente.finalizadoPendiente && !cliente.cancelado) return false
    
    // Excluir clientes cancelados que NO tienen finalizadoPendiente y NO fueron creados en la ruta actual
    // PERO incluir clientes cancelados que tienen pagos en la ruta actual (renovados)
    // (estos son clientes de rutas anteriores, excepto si tienen pagos en esta ruta)
    if (cliente.cancelado && !cliente.finalizadoPendiente && inicio) {
      const clienteCreado = new Date(cliente.createdAt).getTime()
      const creadoEnRutaActual = clienteCreado >= inicio && clienteCreado <= fin
      // Si no fue creado en la ruta actual, verificar si tiene pagos en esta ruta
      if (!creadoEnRutaActual) {
        const tienePagoEnRuta = pagos.value.some(pago => { const clienteIdPago = typeof pago.cliente === 'object' ? pago.cliente?._id : pago.cliente; const rutaIdPago = typeof pago.ruta === 'object' ? pago.ruta?._id : pago.ruta; return String(clienteIdPago) === String(cliente._id) && String(rutaIdPago) === String(rutaActualId.value); })
        // Si no tiene pagos en la ruta actual, excluirlo (es de una ruta anterior)
        if (!tienePagoEnRuta) {
          return false
        }
      }
    }
    
    // Excluir clientes con finalizadoPendiente: true que NO fueron creados en la ruta actual
    // (estos deberían haberse marcado como cancelado: true al cerrar la ruta anterior)
    if (cliente.finalizadoPendiente && !cliente.cancelado && inicio) {
      const clienteCreado = new Date(cliente.createdAt).getTime()
      const creadoEnRutaActual = clienteCreado >= inicio && clienteCreado <= fin
      if (!creadoEnRutaActual) {
        return false
      }
    }
    
    return true
  })
  
  return clientesFiltrados.filter(cliente => {
    const tienePagoEnRuta = pagos.value.some(pago => { const clienteIdPago = typeof pago.cliente === 'object' ? pago.cliente?._id : pago.cliente; const rutaIdPago = typeof pago.ruta === 'object' ? pago.ruta?._id : pago.ruta; return String(clienteIdPago) === String(cliente._id) && String(rutaIdPago) === String(rutaActualId.value); })
    // Clientes sin pagos incluye:
    // - Clientes nuevos (creados en ruta) que aún no tienen pagos registrados
    // - Clientes cancelados/finalizados con finalizadoPendiente: true que no tienen pagos en esta ruta
    return !tienePagoEnRuta
  })
})

const clientesConPagos = computed(() => {
  if (!rutaActualId.value) {
    return []
  }
  const inicio = rutaActualDatos.value?.fechaApertura ? new Date(rutaActualDatos.value.fechaApertura).getTime() : null
  const fin = rutaActualDatos.value?.fechaCierre ? new Date(rutaActualDatos.value.fechaCierre).getTime() : Date.now()
  
  // NO agrupar por Id - mostrar todos los clientes que cumplan los criterios
  // Esto permite mostrar tanto el cliente original como el renovado
  const clientesFiltrados = clientes.value.filter(cliente => {
    // Excluir clientes finalizados que NO tienen finalizadoPendiente y NO están cancelados
    // (estos son clientes de rutas anteriores que ya fueron procesados)
    if (cliente.estado === 'finalizado' && !cliente.finalizadoPendiente && !cliente.cancelado) return false
    
    // Excluir clientes cancelados que NO tienen finalizadoPendiente y NO fueron creados en la ruta actual
    // PERO incluir clientes cancelados que tienen pagos en la ruta actual (renovados)
    // (estos son clientes de rutas anteriores, excepto si tienen pagos en esta ruta)
    if (cliente.cancelado && !cliente.finalizadoPendiente && inicio) {
      const clienteCreado = new Date(cliente.createdAt).getTime()
      const creadoEnRutaActual = clienteCreado >= inicio && clienteCreado <= fin
      // Si no fue creado en la ruta actual, verificar si tiene pagos en esta ruta
      if (!creadoEnRutaActual) {
        const tienePagoEnRuta = pagos.value.some(pago => { const clienteIdPago = typeof pago.cliente === 'object' ? pago.cliente?._id : pago.cliente; const rutaIdPago = typeof pago.ruta === 'object' ? pago.ruta?._id : pago.ruta; return String(clienteIdPago) === String(cliente._id) && String(rutaIdPago) === String(rutaActualId.value); })
        // Si no tiene pagos en la ruta actual, excluirlo (es de una ruta anterior)
        if (!tienePagoEnRuta) {
          return false
        }
      }
    }
    
    // Excluir clientes con finalizadoPendiente: true que NO fueron creados en la ruta actual
    // (estos deberían haberse marcado como cancelado: true al cerrar la ruta anterior)
    if (cliente.finalizadoPendiente && !cliente.cancelado && inicio) {
      const clienteCreado = new Date(cliente.createdAt).getTime()
      const creadoEnRutaActual = clienteCreado >= inicio && clienteCreado <= fin
      if (!creadoEnRutaActual) {
        return false
      }
    }
    
    return true
  })
  
  const clientesConPagosFiltrados = clientesFiltrados.filter(cliente => {
    const pagosDelCliente = pagos.value.filter(pago => { const clienteIdPago = typeof pago.cliente === 'object' ? pago.cliente?._id : pago.cliente; const rutaIdPago = typeof pago.ruta === 'object' ? pago.ruta?._id : pago.ruta; return String(clienteIdPago) === String(cliente._id) && String(rutaIdPago) === String(rutaActualId.value); })
    const tienePagosEnRuta = pagosDelCliente.length > 0
    
    // Incluir clientes que tienen pagos en la ruta actual
    // Esto incluye:
    // - Clientes activos con pagos
    // - Clientes cancelados/finalizados con finalizadoPendiente: true que tienen pagos en esta ruta
    // - Clientes cancelados (renovados) que tienen pagos en esta ruta (deben aparecer aunque estén cancelados)
    return tienePagosEnRuta
  })
  return clientesConPagosFiltrados
})

// Variables computadas para filtrar clientes según búsqueda
const clientesSinPagosBuscados = computed(() => {
  if (!filtroBusquedaSinPagos.value) return clientesSinPagos.value
  
  const busqueda = filtroBusquedaSinPagos.value.toLowerCase()
  return clientesSinPagos.value.filter(cliente => {
    return (
      cliente?.nombres?.toLowerCase().includes(busqueda) ||
      cliente?.apellidos?.toLowerCase().includes(busqueda) ||
      cliente?.apodo?.toLowerCase().includes(busqueda) ||
      cliente?.cc?.toLowerCase().includes(busqueda)
    )
  })
})

const clientesConPagosBuscados = computed(() => {
  if (!filtroBusquedaConPagos.value) return clientesConPagos.value
  
  const busqueda = filtroBusquedaConPagos.value.toLowerCase()
  return clientesConPagos.value.filter(cliente => {
    return (
      cliente?.nombres?.toLowerCase().includes(busqueda) ||
      cliente?.apellidos?.toLowerCase().includes(busqueda) ||
      cliente?.apodo?.toLowerCase().includes(busqueda) ||
      cliente?.cc?.toLowerCase().includes(busqueda)
    )
  })
})

// Función para actualizar datos del dashboard
async function actualizarDashboard() {
  try {
  actualizandoDatos.value = true
    
  // Cargar pagos primero para que el filtro de clientes cancelados funcione correctamente
  await cargarPagos()
  await cargarClientes()
    
    actualizandoDatos.value = false
  } catch (error) {
    console.error('❌ Error actualizando dashboard:', error)
  actualizandoDatos.value = false
  }
}

async function consultarRuta() {
  cargandoRuta.value = true
  const res = await fetch(`${API_BASE_URL}/api/rutas/actual/${vendedorId}`)
  const data = await res.json()
  const nuevaRutaAbierta = !!data
  const nuevoRutaActualId = data?._id || null
  rutaActualDatos.value = data || null
  // Si el estado de la ruta cambió, disparar evento
  if (nuevaRutaAbierta !== rutaAbierta.value) {
    if (nuevaRutaAbierta) {
      window.dispatchEvent(new CustomEvent('ruta-abierta'))
    } else {
      window.dispatchEvent(new CustomEvent('ruta-cerrada'))
    }
  }
  rutaAbierta.value = nuevaRutaAbierta
  rutaActualId.value = nuevoRutaActualId
  cargandoRuta.value = false
}

function solicitarAperturaRuta() {
  mostrarModalApertura.value = true
}

async function abrirRuta() {
  const res = await fetch(`${API_BASE_URL}/api/rutas/abrir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendedorId })
  });
  if (res.ok) {
    mostrarModalApertura.value = false
    // Recargar estado de ruta y todos los datos desde la base de datos
    await consultarRuta()
    await actualizarDashboard()
    // Disparar evento para que otras vistas se actualicen
    window.dispatchEvent(new CustomEvent('ruta-abierta'))
  } else {
    alert('No se pudo abrir la ruta');
  }
}

function cerrarRuta() {
  mostrarModalCierre.value = true
}

async function confirmarCierreRuta() {
  // Bloqueo en frontend si hay clientes pendientes
  if (clientesSinPagos.value.length > 0) {
    pendientesClientes.value = clientesSinPagos.value.map(c => ({ id: c._id, nombres: c.nombres, apellidos: c.apellidos }))
    mostrarModalPendientes.value = true
    return
  }
  const res = await fetch(`${API_BASE_URL}/api/rutas/cerrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendedorId })
  });
  if (res.ok) {
    mostrarModalCierre.value = false
    // Recargar estado de ruta y todos los datos desde la base de datos
    await consultarRuta()
    await actualizarDashboard()
    // Disparar evento para que otras vistas se actualicen
    window.dispatchEvent(new CustomEvent('ruta-cerrada'))
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

async function cargarClientes() {
  if (cargandoClientesFlag) {
    return
  }
  cargandoClientesFlag = true
  try {
    // Forzar recarga desde la base de datos, evitando caché con timestamp
    const timestamp = new Date().getTime()
    const res = await fetch(`${API_BASE_URL}/api/clientes?_t=${timestamp}`, {
      cache: 'no-store'
    });
    
    if (res.ok) {
      const todos = await res.json();
      
      // Filtrar clientes: incluir no cancelados, finalizadosPendiente, y cancelados que tengan pagos en la ruta actual
      // Los clientes con finalizadoPendiente (saldo = 0 pero aún no cancelados) deben aparecer hasta cerrar ruta
      // Los clientes cancelados solo aparecerán si tienen pagos en la ruta actual (para aparecer en "clientes con pagos")
      const clientesFiltrados = todos.filter(c => {
        const noCancelado = !c.cancelado;
        const esFinalizadoPendiente = c.finalizadoPendiente === true; // Incluir finalizados pendientes
        const esFinalizado = c.estado === 'finalizado';
        
        // Si es cancelado, solo incluirlo si tiene pagos en la ruta actual
        let canceladoConPagosEnRuta = false;
        if (c.cancelado && rutaActualId.value) {
          // Verificar si tiene pagos en la ruta actual (necesitamos los pagos cargados)
          canceladoConPagosEnRuta = pagos.value.some(pago => 
            { const clienteIdPago = typeof pago.cliente === 'object' ? pago.cliente?._id : pago.cliente; const rutaIdPago = typeof pago.ruta === 'object' ? pago.ruta?._id : pago.ruta; return String(clienteIdPago) === String(c._id) && String(rutaIdPago) === String(rutaActualId.value); }
          );
        }
        
        const pasaFiltro = noCancelado || esFinalizadoPendiente || canceladoConPagosEnRuta;
        
        return pasaFiltro;
      });
      
      clientes.value = clientesFiltrados;
      
      // Inicializar desplegados con el tamaño total de clientes
      desplegados.value = clientes.value.map(() => false);
    } else {
      console.error(`❌ Error cargando clientes: HTTP ${res.status}`)
      clientes.value = [];
      desplegados.value = [];
    }
  } catch (e) {
    console.error('❌ Error cargando clientes:', e)
    clientes.value = [];
    desplegados.value = [];
  } finally { 
    cargandoClientesFlag = false 
  }
}

async function cargarPagos() {
  if (cargandoPagosFlag) {
    return
  }
  cargandoPagosFlag = true
  try {
    // Forzar recarga desde la base de datos, evitando caché con timestamp
    const timestamp = new Date().getTime()
    const res = await fetch(`${API_BASE_URL}/api/pagos?_t=${timestamp}`, {
      cache: 'no-store'
    });
    
    if (res.ok) {
      pagos.value = await res.json();
    } else {
      console.error(`❌ Error cargando pagos: HTTP ${res.status}`)
      pagos.value = [];
    }
  } catch (e) {
    console.error('❌ Error cargando pagos:', e)
    pagos.value = [];
  } finally { 
    cargandoPagosFlag = false 
  }
}

// Función para actualizar dashboard cuando sea necesario
function actualizarDashboardEventos() {
  actualizarDashboard()
}

onMounted(async () => {
  await consultarRuta()
  await actualizarDashboard()
  
  // Escuchar eventos para actualizar datos cuando sea necesario
  window.addEventListener('actualizar-dashboard', actualizarDashboardEventos)
  window.addEventListener('cliente-creado', actualizarDashboardEventos)
  window.addEventListener('cliente-eliminado', actualizarDashboardEventos)
  window.addEventListener('pago-registrado', actualizarDashboardEventos)
  window.addEventListener('pago-editado', actualizarDashboardEventos)
  window.addEventListener('ruta-cerrada', actualizarDashboardEventos)
  window.addEventListener('ruta-abierta', actualizarDashboardEventos)
  
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
})

// Watcher para forzar actualización cuando cambie el idioma
watch(() => locale.value, () => {
  // Forzar actualización del componente cuando cambie el locale
  // Esto asegura que todas las traducciones se actualicen
})

// Recargar clientes cada vez que la ruta cambia a este dashboard
watch(
  () => route.fullPath,
  async () => {
    await consultarRuta()
    await actualizarDashboard()
  }
)

// Limpiar event listeners al desmontar el componente
onUnmounted(() => {
  window.removeEventListener('actualizar-dashboard', actualizarDashboardEventos)
  window.removeEventListener('cliente-creado', actualizarDashboardEventos)
  window.removeEventListener('cliente-eliminado', actualizarDashboardEventos)
  window.removeEventListener('pago-registrado', actualizarDashboardEventos)
  window.removeEventListener('pago-editado', actualizarDashboardEventos)
  window.removeEventListener('ruta-cerrada', actualizarDashboardEventos)
  window.removeEventListener('ruta-abierta', actualizarDashboardEventos)
  window.removeEventListener('ocultar-cliente', (e) => {
    const id = e.detail
    clientes.value = clientes.value.filter(c => c._id !== id)
  })
})

// También actualizar cuando cambian los parámetros de la ruta
watch(
  () => route.params,
  async () => {
    await consultarRuta()
    await actualizarDashboard()
  },
  { deep: true }
)

// Watcher crítico: recargar datos cuando cambie rutaActualId
watch(
  () => rutaActualId.value,
  async (nuevoId, anteriorId) => {
    if (nuevoId !== anteriorId) {
      // Forzar recarga completa de datos desde la base de datos
      await actualizarDashboard()
    }
  }
)

// Watcher para actualizar cuando cambie rutaAbierta
watch(
  () => rutaAbierta.value,
  async (nuevaRutaAbierta, anteriorRutaAbierta) => {
    if (nuevaRutaAbierta !== anteriorRutaAbierta) {
      // Forzar recarga completa de datos desde la base de datos
      await actualizarDashboard()
    }
  }
)

// Watcher para actualizar desplegados cuando cambien las secciones
watch([clientesSinPagos, clientesConPagos], () => {
  const totalClientes = clientesSinPagos.value.length + clientesConPagos.value.length
  if (desplegados.value.length !== totalClientes) {
    desplegados.value = Array(totalClientes).fill(false)
  }
}, { deep: true })


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
  // Redirigir al historial de pagos con el filtro del cliente aplicado
  const clienteNombre = `${cliente.nombres} ${cliente.apellidos}`;
  const url = `/historial-pagos?cliente=${encodeURIComponent(clienteNombre)}`;
  router.push(url);
}

function llamarCliente(cliente) {
  // Abrir la aplicación de llamadas con el número del cliente
  const numeroTelefono = cliente.celular;
  const urlLlamada = `tel:${numeroTelefono}`;
  // Abrir la aplicación de llamadas
  window.location.href = urlLlamada;
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
  motivoReporte.value = ''; // Limpiar el motivo al abrir el modal
  mostrarModalReportarCedula.value = true;
}

async function confirmarReportarCedula() {
  if (!clienteParaReportar.value || !clienteParaReportar.value.cc) {
    return;
  }
  
  mostrarModalReportarCedula.value = false;
  
  // Construir el motivo: si hay motivo personalizado, usarlo; si no, usar el predeterminado
  let motivoFinal = '';
  if (motivoReporte.value && motivoReporte.value.trim()) {
    motivoFinal = motivoReporte.value.trim();
  } else {
    motivoFinal = `Cliente reportado: ${clienteParaReportar.value.nombres} ${clienteParaReportar.value.apellidos}`;
  }
  
  try {
    const vendedorId = localStorage.getItem('vendedorId');
    const res = await fetch(`${API_BASE_URL}/api/cedulas/reportar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cc: clienteParaReportar.value.cc,
        vendedorId: vendedorId,
        motivo: motivoFinal
      })
    });
    
    const data = await res.json();
    if (res.ok) {
      resultadoReporte.value = {
        exito: true,
        mensaje: `Id ${clienteParaReportar.value.cc} reportado exitosamente. Al intentar crear un cliente con este Id, se mostrará una advertencia.`
      };
    } else {
      resultadoReporte.value = {
        exito: false,
        mensaje: data.error || 'Error al reportar el Id'
      };
    }
    mostrarModalResultadoReporte.value = true;
    clienteParaReportar.value = null;
    motivoReporte.value = ''; // Limpiar el motivo después de reportar
  } catch (e) {
    resultadoReporte.value = {
      exito: false,
      mensaje: 'Error de conexión al reportar el Id'
    };
    mostrarModalResultadoReporte.value = true;
    clienteParaReportar.value = null;
    motivoReporte.value = ''; // Limpiar el motivo en caso de error
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
  // Redirigir a la vista de registros para editar pagos
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
  const pagosCliente = pagos.value
    .filter(p => p.cliente === cliente._id)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  let atrasos = 0;
  let dias = 0; // Días en los que se debió pagar (No pago o Parcela)
  const valorParcela = parseFloat(cliente.parcela) || 1;

  pagosCliente.forEach(p => {
    if (p.tipo === 'No pago') {
      atrasos += 1;
      dias += 1;
    } else if (p.tipo === 'No aplica') {
      // 'No aplica' no cuenta como atraso ni como día
      // Solo se registra pero no afecta cálculos
    } else if (p.tipo === 'Parcela') {
      dias += 1;
      // Si pagó más de una cuota, el resto cubre atrasos
      const pagadas = p.numParcelas || 1;
      if (pagadas > 1) {
        atrasos = Math.max(0, atrasos - (pagadas - 1));
      }
    } else if (p.tipo === 'Abono') {
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

function confirmarAperturaRuta() {
  abrirRuta()
}

onUnmounted(() => {
  window.removeEventListener('actualizar-dashboard', actualizarDashboard)
})
</script>


