<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <NavbarVendedor
      :rutaAbierta="rutaAbierta"
      :cargandoRuta="cargandoRuta"
      :actualizandoDatos="actualizandoDatos"
      tituloSeccion="Clientes"
      @cerrar-ruta="cerrarRuta"
      @logout="logout"
    />

    <!-- Modal de confirmación para abrir ruta -->
    <div v-if="mostrarModalApertura" class="fixed inset-0 bg-black bg-opacity-40 dark:bg-black dark:bg-opacity-60 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-sm w-full transition-colors duration-300">
        <h2 class="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">Abrir ruta</h2>
        <p class="mb-6 text-center text-gray-700 dark:text-gray-300">¿Estás seguro de que deseas abrir la ruta? Esta acción no se puede deshacer.</p>
        <div class="flex justify-center gap-4">
          <button @click="confirmarAperturaRuta" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Confirmar</button>
          <button @click="mostrarModalApertura = false" class="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para cerrar ruta -->
    <div v-if="mostrarModalCierre" class="fixed inset-0 bg-black bg-opacity-40 dark:bg-black dark:bg-opacity-60 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-sm w-full transition-colors duration-300">
        <h2 class="text-xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">Cerrar ruta</h2>
        <p class="mb-6 text-center text-gray-700 dark:text-gray-300">¿Estás seguro de que deseas cerrar la ruta? Esta acción no se puede deshacer.</p>
        <div class="flex justify-center gap-4">
          <button @click="confirmarCierreRuta" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">Confirmar</button>
          <button @click="mostrarModalCierre = false" class="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal de advertencia: clientes pendientes -->
    <div v-if="mostrarModalPendientes" class="fixed inset-0 bg-black bg-opacity-40 dark:bg-black dark:bg-opacity-60 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md transition-colors duration-300">
        <h2 class="text-lg font-bold mb-2 text-center text-red-600 dark:text-red-400">No se puede cerrar la ruta</h2>
        <p class="text-gray-700 dark:text-gray-300 text-center mb-4">Hay cliente(s) sin registro de pago en la ruta actual.</p>
        <div class="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-3 max-h-56 overflow-auto">
          <ul class="list-disc list-inside text-sm text-gray-800 dark:text-gray-200 space-y-1">
            <li v-for="(p, idx) in pendientesClientes" :key="p.id || idx">{{ p.nombres }} {{ p.apellidos }}</li>
          </ul>
        </div>
        <div class="mt-5 flex justify-center">
          <button @click="mostrarModalPendientes = false" class="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Entendido</button>
        </div>
      </div>
    </div>

    <!-- Contenido de clientes -->
    <div class="p-4">
      <div v-if="!rutaAbierta && !cargandoRuta" class="flex flex-col items-center justify-center min-h-[300px]">
        <button
          v-if="!rutaAbierta && !cargandoRuta"
          @click="solicitarAperturaRuta"
          class="bg-green-600 text-white px-6 py-3 rounded font-bold"
        >
          Abrir ruta
        </button>
        <button 
          v-if="rutaAbierta && !cargandoRuta" 
          @click="cerrarRuta" 
          class="bg-red-600 text-white px-6 py-3 rounded font-bold"
        >
          Cerrar ruta
        </button>
        <div v-if="cargandoRuta" class="text-gray-500 dark:text-gray-400">Cargando estado de ruta...</div>
        <div v-if="!rutaAbierta && !cargandoRuta" class="mt-4 text-gray-500 dark:text-gray-400">Debes abrir la ruta para comenzar.</div>
      </div>
      <div v-else>
      <div class="flex justify-between items-center mb-6">
        <button
          @click="irACrearCliente"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          + Nuevo Cliente
        </button>
      </div>

      <!-- Lista de clientes dividida en secciones -->
      <div class="space-y-6">
        <!-- Clientes sin pagos en ruta actual -->
      <div class="bg-white dark:bg-gray-800 rounded shadow p-4 transition-colors duration-300">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Clientes sin pagos ({{ clientesSinPagos.length }})
          </h3>
          <div v-if="clientesSinPagos.length === 0" class="text-gray-500 dark:text-gray-400 text-center py-4">
            Todos los clientes han realizado pagos en esta ruta.
          </div>
          <div v-else class="grid gap-4 mx-auto w-full md:grid-cols-2 md:max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-7xl">
            <div
              v-for="(c, i) in clientesSinPagos"
              :key="c._id || `sin-pago-${i}`"
              :class="[
                'flex flex-col sm:flex-row items-start rounded-lg border border-gray-300 dark:border-gray-600 border-l-4 p-4 cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-700',
                i % 2 === 0 ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-600',
                calcularParcelasAtrasadas(c) >= 5
                  ? 'border-l-red-600'
                  : calcularParcelasAtrasadas(c) >= 3
                  ? 'border-l-yellow-400'
                  : 'border-l-green-600'
              ]"
            >
              <div class="w-full">
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
                    <span class="font-bold text-gray-900 dark:text-gray-100">Venta</span>
                    <span class="text-black dark:text-white font-bold text-base">${{ c.valor }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Saldo inicial</span>
                    <span class="text-black dark:text-white font-bold text-base">${{ c.saldo_inicial }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Saldo restante</span>
                    <span class="text-black dark:text-white font-bold text-base">${{ c.total }}</span>
                  </div>
                  <div class="flex items-start justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Valor parcela</span>
                    <span class="text-right">
                      <span class="text-black dark:text-white font-bold text-base block">${{ c.parcela }}</span>
                      <span class="text-xs text-gray-700 dark:text-gray-300 font-medium">({{ c.saldo_inicial }}/{{ c.dias }} días)</span>
                    </span>
                  </div>
                  <div class="flex gap-2 pt-2">
                      <button 
                        @click.stop="irAPagos(c)"
                        class="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Pago
                      </button>
                      <button 
                        @click.stop="verPagosCliente(c)"
                      class="px-3 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                      >
                        Ver pagos
                      </button>
                      <button 
                        @click.stop="llamarCliente(c)"
                      class="px-3 py-2 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors shadow-sm flex items-center gap-1"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Llamar
                      </button>
                    </div>
                </div>
                <!-- Info extra desplegable -->
                <div v-if="desplegados[i]" class="mt-2 border-t pt-2 text-sm text-gray-800 dark:text-gray-200 divide-y divide-gray-300 dark:divide-gray-500">
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Parcelas pendientes</span>
                    <span class="text-black dark:text-white font-bold text-base">{{ calcularParcelasPendientes(c) }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Parcelas atrasadas</span>
                    <span class="text-black dark:text-white font-bold text-base">{{ calcularParcelasAtrasadas(c) }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Cédula</span>
                    <span class="text-black dark:text-white font-bold text-base">{{ c.cc }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Dirección residencial</span>
                    <span class="text-black dark:text-white font-bold text-base text-right">{{ c.direccion_residencial }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Dirección comercial</span>
                    <span class="text-black dark:text-white font-bold text-base text-right">{{ c.direccion }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Fecha creación</span>
                    <span class="text-black dark:text-white font-bold text-base">{{ c.fecha }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Celular</span>
                    <span class="text-black dark:text-white font-bold text-base">{{ c.celular }}</span>
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
              Clientes con pagos ({{ clientesConPagos.length }})
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
            <div v-if="clientesConPagos.length === 0" class="text-gray-500 dark:text-gray-400 text-center py-4">
              No hay clientes con pagos registrados en esta ruta.
            </div>
            <div v-else class="grid gap-5 mx-auto w-full md:grid-cols-2 md:max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-7xl">
            <div
              v-for="(c, i) in clientesConPagos"
              :key="c._id || `con-pago-${i}`"
              :class="[
                'flex flex-col sm:flex-row items-start rounded-lg border border-gray-300 dark:border-gray-600 border-l-4 p-5 md:p-6 cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-700',
                i % 2 === 0 ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-600',
                'border-l-blue-500'
              ]"
            >
              <div class="w-full">
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
                    <span class="font-bold text-gray-900 dark:text-gray-100">Venta</span>
                    <span class="text-black dark:text-white font-bold text-lg">${{ c.valor }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Saldo inicial</span>
                    <span class="text-black dark:text-white font-bold text-lg">${{ c.saldo_inicial }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Saldo restante</span>
                    <span class="text-black dark:text-white font-bold text-lg">${{ c.total }}</span>
                  </div>
                  <div class="flex items-start justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Valor parcela</span>
                    <span class="text-right">
                      <span class="text-black dark:text-white font-bold text-lg block">${{ c.parcela }}</span>
                      <span class="text-xs text-gray-700 dark:text-gray-300 font-medium">({{ c.saldo_inicial }}/{{ c.dias }} días)</span>
                    </span>
                  </div>
                  
                  <!-- Botones de acción cuando información adicional está OCULTA -->
                  <div v-if="!desplegados[i + clientesSinPagos.length]" class="flex gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-600">
                    <button 
                      @click.stop="irAPagos(c)"
                      class="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Pago
                    </button>
                    <button 
                      @click.stop="verPagosCliente(c)"
                      class="px-3 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                    >
                      Ver pagos
                    </button>
                    <button 
                      @click.stop="editarPagoCliente(c)"
                      class="px-3 py-2 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-1"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar pago
                    </button>
                    <button 
                      @click.stop="llamarCliente(c)"
                      class="px-3 py-2 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors shadow-sm flex items-center gap-1"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Llamar
                    </button>
                  </div>
                </div>
                <!-- Info extra desplegable -->
                <div v-if="desplegados[i + clientesSinPagos.length]" class="mt-2 border-t pt-2 text-base text-gray-800 dark:text-gray-200 divide-y divide-gray-300 dark:divide-gray-500">
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Parcelas pendientes</span>
                    <span class="text-black dark:text-white font-bold text-lg">{{ calcularParcelasPendientes(c) }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Parcelas atrasadas</span>
                    <span class="text-black dark:text-white font-bold text-lg">{{ calcularParcelasAtrasadas(c) }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Cédula</span>
                    <span class="text-black dark:text-white font-bold text-lg">{{ c.cc }}</span>
                  </div>
                  <!-- Direcciones -->
                  <div v-if="c.direccion_residencial" class="py-2">
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <span class="font-bold text-gray-900 dark:text-gray-100 block mb-1">Dirección Residencial</span>
                        <p class="text-sm text-gray-700 dark:text-gray-300">{{ c.direccion_residencial }}</p>
                      </div>
                      <button 
                        v-if="c.coordenadas_residencial"
                        @click.stop="verEnMapa(c.coordenadas_residencial)"
                        class="ml-3 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Ver en mapa
                      </button>
                    </div>
                  </div>
                  
                  <div v-if="c.direccion" class="py-2">
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <span class="font-bold text-gray-900 dark:text-gray-100 block mb-1">Dirección Comercial</span>
                        <p class="text-sm text-gray-700 dark:text-gray-300">{{ c.direccion }}</p>
                      </div>
                      <button 
                        v-if="c.coordenadas_comercial"
                        @click.stop="verEnMapa(c.coordenadas_comercial)"
                        class="ml-3 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Ver en mapa
                      </button>
                    </div>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Fecha</span>
                    <span class="text-black dark:text-white font-bold text-lg">{{ c.fecha }}</span>
                  </div>
                  <div class="flex items-baseline justify-between py-1">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Celular</span>
                    <span class="text-black dark:text-white font-bold text-lg">{{ c.celular }}</span>
                  </div>
                  
                  <!-- Botones de acción cuando información adicional está VISIBLE -->
                  <div class="flex gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-600">
                    <button 
                      @click.stop="irAPagos(c)"
                      class="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Pago
                    </button>
                    <button 
                      @click.stop="verPagosCliente(c)"
                      class="px-3 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                    >
                      Ver pagos
                    </button>
                    <button 
                      @click.stop="editarPagoCliente(c)"
                      class="px-3 py-2 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-1"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar pago
                    </button>
                    <button 
                      @click.stop="llamarCliente(c)"
                      class="px-3 py-2 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors shadow-sm flex items-center gap-1"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Llamar
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
import NavbarVendedor from '../components/NavbarVendedor.vue'
// MapaSimple eliminado - ahora usamos botones para abrir Google Maps
import { useClienteStore } from '../stores/useClienteStore'

const router = useRouter()
const route = useRoute()
const clientes = ref([])
let cargandoClientesFlag = false
const desplegados = ref([])
const mostrarClientesConPagos = ref(true)
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
const actualizandoDatos = ref(false)
const rutaActualId = ref(null)
let pollingInterval = null
const rutaActualDatos = ref(null)

// Variables computadas para separar clientes
const clientesSinPagos = computed(() => {
  if (!rutaActualId.value) return clientes.value.filter(c => c.estado !== 'finalizado')
  const inicio = rutaActualDatos.value?.fechaApertura ? new Date(rutaActualDatos.value.fechaApertura).getTime() : null
  const fin = rutaActualDatos.value?.fechaCierre ? new Date(rutaActualDatos.value.fechaCierre).getTime() : Date.now()
  
  // Filtrar clientes únicos por cédula (tomar el más reciente)
  const clientesUnicos = new Map()
  clientes.value.forEach(cliente => {
    if (cliente.estado === 'finalizado') return
    const key = cliente.cc
    if (!clientesUnicos.has(key) || new Date(cliente.createdAt) > new Date(clientesUnicos.get(key).createdAt)) {
      clientesUnicos.set(key, cliente)
    }
  })
  
  const clientesFiltrados = Array.from(clientesUnicos.values())
  
  return clientesFiltrados.filter(cliente => {
    const tienePagoEnRuta = pagos.value.some(pago => pago.cliente === cliente._id && pago.ruta === rutaActualId.value)
    // Clientes sin pagos incluye clientes nuevos (creados en ruta) que aún no tienen pagos registrados
    return !tienePagoEnRuta
  })
})

const clientesConPagos = computed(() => {
  if (!rutaActualId.value) {
    console.log('❌ No hay ruta actual ID')
    return []
  }
  console.log(`🔍 Buscando clientes con pagos en ruta: ${rutaActualId.value}`)
  console.log(`📊 Total clientes: ${clientes.value.length}`)
  console.log(`💰 Total pagos: ${pagos.value.length}`)
  const inicio = rutaActualDatos.value?.fechaApertura ? new Date(rutaActualDatos.value.fechaApertura).getTime() : null
  const fin = rutaActualDatos.value?.fechaCierre ? new Date(rutaActualDatos.value.fechaCierre).getTime() : Date.now()
  
  // Filtrar clientes únicos por cédula (tomar el más reciente)
  const clientesUnicos = new Map()
  clientes.value.forEach(cliente => {
    const key = cliente.cc
    if (!clientesUnicos.has(key) || new Date(cliente.createdAt) > new Date(clientesUnicos.get(key).createdAt)) {
      clientesUnicos.set(key, cliente)
    }
  })
  
  const clientesFiltrados = Array.from(clientesUnicos.values())
  
  const clientesConPagosFiltrados = clientesFiltrados.filter(cliente => {
    const pagosDelCliente = pagos.value.filter(pago => pago.cliente === cliente._id && pago.ruta === rutaActualId.value)
    const tienePagosEnRuta = pagosDelCliente.length > 0
    // Solo incluir clientes que realmente tienen pagos registrados (no solo creados en la ruta)
    if (tienePagosEnRuta) {
      pagosDelCliente.forEach(pago => {
        console.log(`     - Pago: tipo=${pago.tipo}, valor=${pago.valor}, ruta=${pago.ruta}`)
      })
    }
    return tienePagosEnRuta
  })
  console.log(`✅ Clientes con pagos encontrados: ${clientesConPagosFiltrados.length}`)
  clientesConPagosFiltrados.forEach(cliente => {
    console.log(`   - ${cliente.nombres} ${cliente.apellidos} (${cliente.estado})`)
  })
  return clientesConPagosFiltrados
})

// Función para actualizar datos del dashboard
async function actualizarDashboard() {
  try {
    console.log('🔄 Actualizando dashboard...')
  actualizandoDatos.value = true
    
  await Promise.all([cargarClientes(), cargarPagos()])
    
    console.log(`📊 Dashboard actualizado:`)
    console.log(`- Total clientes: ${clientes.value.length}`)
    console.log(`- Total pagos: ${pagos.value.length}`)
    console.log(`- Ruta actual ID: ${rutaActualId.value}`)
    console.log(`- Clientes sin pagos: ${clientesSinPagos.value.length}`)
    console.log(`- Clientes con pagos: ${clientesConPagos.value.length}`)
    
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
    if (errorData?.error === 'RUTA_CON_CLIENTES_PENDIENTES') {
      pendientesClientes.value = (errorData.pendientes || [])
      mostrarModalPendientes.value = true
    } else {
      alert(errorData?.msg || errorData?.error || 'No se pudo cerrar la ruta')
    }
  }
}

async function cargarClientes() {
  if (cargandoClientesFlag) {
    console.log('⏳ Cargando clientes ya en progreso, esperando...')
    return
  }
  cargandoClientesFlag = true
  try {
    console.log('📞 Cargando clientes desde la base de datos...')
    // Forzar recarga desde la base de datos, evitando caché con timestamp
    const timestamp = new Date().getTime()
    const res = await fetch(`${API_BASE_URL}/api/clientes?_t=${timestamp}`, {
      cache: 'no-store'
    });
    
    if (res.ok) {
      const todos = await res.json();
      console.log(`📋 Total clientes recibidos: ${todos.length}`)
      
      // Mostrar detalles de cada cliente antes del filtro
      todos.forEach(cliente => {
        console.log(`🔍 Cliente antes del filtro: ${cliente.nombres} ${cliente.apellidos}`)
        console.log(`   - ID: ${cliente._id}`)
        console.log(`   - Estado: ${cliente.estado}`)
        console.log(`   - Cancelado: ${cliente.cancelado}`)
        console.log(`   - Saldo: ${cliente.total}`)
        console.log(`   - Vendedor: ${cliente.vendedor}`)
      })
      
      // Filtrar clientes no cancelados O clientes finalizados (que pueden tener pagos en ruta actual)
      const clientesFiltrados = todos.filter(c => {
        const noCancelado = !c.cancelado;
        const esFinalizado = c.estado === 'finalizado';
        const pasaFiltro = noCancelado || esFinalizado;
        
        console.log(`🔍 Filtro para ${c.nombres}: cancelado=${c.cancelado}, estado=${c.estado}, pasa filtro=${pasaFiltro}`)
        return pasaFiltro;
      });
      console.log(`📋 Clientes no cancelados: ${clientesFiltrados.length}`)
      
      clientes.value = clientesFiltrados;
      
      console.log(`✅ Clientes cargados: ${clientes.value.length}`)
      clientes.value.forEach(cliente => {
        console.log(`- ${cliente.nombres} ${cliente.apellidos}: estado=${cliente.estado}, saldo=${cliente.total}, cancelado=${cliente.cancelado}`)
      })
      
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
    console.log('⏳ Cargando pagos ya en progreso, esperando...')
    return
  }
  cargandoPagosFlag = true
  try {
    console.log('💰 Cargando pagos desde la base de datos...')
    // Forzar recarga desde la base de datos, evitando caché con timestamp
    const timestamp = new Date().getTime()
    const res = await fetch(`${API_BASE_URL}/api/pagos?_t=${timestamp}`, {
      cache: 'no-store'
    });
    
    if (res.ok) {
      pagos.value = await res.json();
      console.log(`✅ Pagos cargados: ${pagos.value.length}`)
      
      // Filtrar pagos de la ruta actual
      const pagosRutaActual = pagos.value.filter(pago => pago.ruta === rutaActualId.value)
      console.log(`- Pagos en ruta actual (${rutaActualId.value}): ${pagosRutaActual.length}`)
      
      pagosRutaActual.forEach(pago => {
        console.log(`- Pago: cliente=${pago.cliente}, tipo=${pago.tipo}, valor=${pago.valor}`)
      })
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
  console.log('🔄 Actualizando dashboard por evento...')
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
      console.log('🔄 Ruta actual cambió:', { anteriorId, nuevoId })
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
      console.log('🔄 Estado de ruta cambió:', { anterior: anteriorRutaAbierta, nueva: nuevaRutaAbierta })
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

// Watcher para debug cuando cambien los clientes
watch(clientes, (nuevosClientes) => {
  console.log(`🔄 Clientes cambiaron: ${nuevosClientes.length} clientes`)
  nuevosClientes.forEach(cliente => {
    console.log(`- ${cliente.nombres} ${cliente.apellidos}: estado=${cliente.estado}`)
  })
}, { deep: true })

// Watcher para debug cuando cambien los pagos
watch(pagos, (nuevosPagos) => {
  console.log(`🔄 Pagos cambiaron: ${nuevosPagos.length} pagos`)
}, { deep: true })

function toggleDesplegar(idx) {
  desplegados.value[idx] = !desplegados.value[idx]
}

function irAPagos(cliente) {
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
  
  console.log('🔗 VendedorDashboard - Redirigiendo a:', url);
  console.log('👤 Cliente seleccionado:', clienteNombre);
  
  router.push(url);
}

function llamarCliente(cliente) {
  // Abrir la aplicación de llamadas con el número del cliente
  const numeroTelefono = cliente.celular;
  const urlLlamada = `tel:${numeroTelefono}`;
  
  console.log('📞 VendedorDashboard - Llamando a:', numeroTelefono);
  console.log('👤 Cliente:', `${cliente.nombres} ${cliente.apellidos}`);
  
  // Abrir la aplicación de llamadas
  window.location.href = urlLlamada;
}

// Función para abrir Google Maps con las coordenadas
function verEnMapa(coordenadas) {
  if (coordenadas && coordenadas.lat && coordenadas.lng) {
    const url = `https://www.google.com/maps?q=${coordenadas.lat},${coordenadas.lng}`
    window.open(url, '_blank')
  }
}

function editarPagoCliente(cliente) {
  // Redirigir a la vista de registros para editar pagos
  console.log('✏️ VendedorDashboard - Editando pago para:', `${cliente.nombres} ${cliente.apellidos}`);
  router.push('/registros');
}

function toggleClientesConPagos() {
  mostrarClientesConPagos.value = !mostrarClientesConPagos.value
}

function logout() {
  try {
  localStorage.removeItem('rol')
    localStorage.removeItem('adminId')
  localStorage.removeItem('vendedorId')
    localStorage.removeItem('codigoVinculacion')
  } catch (e) {
    console.warn('No se pudo limpiar storage:', e)
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