<template>
    <div class="min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-neutral-100 dark:bg-slate-900 transition-theme">
      <!-- Header -->
      <nav class="bg-white dark:bg-gray-800 shadow px-4 py-3 flex justify-between items-center">
        <h1 class="text-lg font-bold text-gray-900 dark:text-gray-100">Nuevo Cliente</h1>
        <button
          @click="volver"
          class="bg-gray-500 dark:bg-gray-600 text-white px-3 py-1.5 text-sm rounded hover:bg-gray-600 dark:hover:bg-gray-700 transition"
        >
          {{ $t('common.back') }}
        </button>
      </nav>
  
      <!-- Formulario -->
      <div class="p-4">
        <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg border-2 border-neutral-300 dark:border-gray-600 shadow-md p-4">
          <form @submit.prevent="crearCliente">
            <!-- Banner reabrir modal llave (al inicio del form) -->
            <div
              v-if="solicitudExitosa && !mostrarModalLlave"
              class="mb-4 p-3 rounded-lg border-2 border-amber-200 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/20 cursor-pointer select-none"
              @click="reabrirModalLlave"
            >
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                <span class="text-sm font-medium text-amber-800 dark:text-amber-200">Solicitud de llave enviada — Haz clic para ver el estado</span>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <!-- Nombre(s) -->
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-1 text-sm">{{ $t('client.name') }}</label>
                <input
                  v-model="cliente.nombres"
                  type="text"
                  class="w-full px-2.5 py-1.5 border border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500"
                  required
                />
              </div>
  
              <!-- Apellido(s) -->
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-1 text-sm">{{ $t('client.lastname') }}</label>
                <input
                  v-model="cliente.apellidos"
                  type="text"
                  class="w-full px-2.5 py-1.5 border border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500"
                  required
                />
              </div>
  
              <!-- Id -->
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-1 text-sm">{{ $t('client.id') }}</label>
                <input
                  v-model="cliente.cc"
                  type="text"
                  class="w-full px-2.5 py-1.5 border border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500"
                  required
                />
              </div>
  
              <!-- Apodo -->
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-1 text-sm">{{ $t('client.nickname') }}</label>
                <input
                  v-model="cliente.apodo"
                  type="text"
                  class="w-full px-2.5 py-1.5 border border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500"
                />
              </div>
  
              <!-- Celular -->
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-1 text-sm">{{ $t('client.phone') }}</label>
                <input
                  v-model="cliente.celular"
                  type="tel"
                  class="w-full px-2.5 py-1.5 border border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500"
                  required
                />
              </div>
  
              <!-- Valor del préstamo -->
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-1 text-sm">{{ $t('client.value') }}</label>
                <input
                  v-model="cliente.valor"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  class="w-full px-2.5 py-1.5 border border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500 appearance-none"
                  required
                  @focus="limpiarValorSiCero"
                />
              </div>
  
              <!-- Número de Parcelas -->
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-1 text-sm">{{ $t('payment.installmentCount') }}</label>
                <select
                  v-model="cliente.parcelas"
                  class="w-full px-2.5 py-1.5 border border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500"
                  required
                >
                  <option value="">{{ $t('common.select') || 'Seleccione' }}</option>
                  <option v-for="n in 99" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>
  
              <!-- Frecuencia de Pago -->
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-1 text-sm">{{ $t('client.paymentFrequency') || 'Frecuencia de Pago' }}</label>
                <select
                  v-model="cliente.frecuencia"
                  class="w-full px-2.5 py-1.5 border border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500"
                  required
                >
                  <option value="">{{ $t('client.selectFrequency') || 'Seleccione frecuencia' }}</option>
                  <option value="diaria">{{ $t('client.daily') || 'Diaria' }}</option>
                  <option value="semanal">{{ $t('client.weekly') || 'Semanal' }}</option>
                  <option value="quincenal">{{ $t('client.biweekly') || 'Quincenal' }}</option>
                  <option value="mensual">{{ $t('client.monthly') || 'Mensual' }}</option>
              </select>
            </div>

            <!-- Día de pago (solo para Semanal/Quincenal/Mensual) -->
            <div v-if="cliente.frecuencia && cliente.frecuencia !== 'diaria'">
              <label class="block text-gray-700 dark:text-gray-300 mb-1 text-sm">{{ $t('client.paymentDay') || 'Día de pago' }}</label>
              <select
                v-model="cliente.diaPago"
                required
                class="w-full px-2.5 py-1.5 border border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500"
              >
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
  
            <!-- Información de interés y total -->
            <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <label class="flex items-center gap-2 mb-1 cursor-pointer select-none">
                <input
                  v-model="interesPersonalizadoActivo"
                  type="checkbox"
                  class="rounded border-gray-400 dark:border-gray-500 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-gray-800 dark:text-gray-200 text-sm font-medium">{{ $t('client.customInterest') }}</span>
              </label>
              <div v-if="interesPersonalizadoActivo" class="mb-2">
                <label class="block text-gray-700 dark:text-gray-300 mb-1 text-xs">{{ $t('client.customInterestPercent') }}</label>
                <input
                  v-model="porcentajeInteresPersonalizado"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  class="w-full md:max-w-xs px-2.5 py-1.5 border border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500 appearance-none no-spinner"
                  @wheel="e => e.target.blur()"
                />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-700 dark:text-gray-300 text-sm font-semibold">{{ $t('client.appliedInterest') }}:</span>
                <span class="text-sm font-bold text-black dark:text-white">
                  <template v-if="interesAplicado !== null">{{ interesAplicado }}%</template>
                  <template v-else>—</template>
                </span>
              </div>
            </div>

            <!-- Total a pagar (como texto resaltado) -->
            <div class="flex items-end mt-3">
              <span class="block text-gray-700 dark:text-gray-300 mb-1 font-semibold mr-2">Total a pagar:</span>
              <span class="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded shadow">
                ${{ totalAPagar }}
              </span>
            </div>

            <!-- Valor de la parcela -->
            <div class="flex items-end mt-1">
              <span class="block text-gray-700 dark:text-gray-300 mb-1 font-semibold mr-2">{{ $t('client.installmentValue') }}:</span>
              <span class="text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded shadow">
                ${{ valorParcela }}
              </span>
            </div>
  
            <!-- Dirección Comercial con autocompletado -->
            <div class="mt-3">
              <label class="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-semibold">Dirección Comercial</label>
              <div class="relative flex gap-2">
                <div class="flex-1 relative">
                  <input
                    v-model="cliente.direccion"
                    @input="onInputDireccion('comercial')"
                    @focus="onFocusDireccion('comercial')"
                    @blur="onBlurDireccion('comercial')"
                    type="text"
                    :placeholder="$t('createClient.form.commercialAddressPlaceholder') || 'Ingresa la dirección comercial del cliente...'"
                    class="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500"
                    autocomplete="off"
                  />
                  <!-- Sugerencias -->
                  <ul v-if="mostrarSugComercial && sugerenciasComercial.length"
                      class="absolute z-20 mt-1 w-full max-h-64 overflow-auto bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded shadow">
                    <li v-for="(s, idx) in sugerenciasComercial" :key="idx"
                        @mousedown.prevent="seleccionarSugerencia('comercial', s)"
                        class="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-800 dark:text-gray-200">
                      {{ s.display_name }}
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  @click="miUbicacion('comercial')"
                  class="px-3 py-1.5 text-sm bg-green-500 dark:bg-green-600 text-white rounded hover:bg-green-600 dark:hover:bg-green-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  Mi ubicación
                </button>
                <button
                  v-if="coordenadasComercial"
                  type="button"
                  @click="comprobarDireccion('comercial')"
                  class="px-3 py-1.5 text-sm bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Comprobar
                </button>
              </div>
            </div>

            <!-- Dirección Residencial con autocompletado -->
            <div class="mt-3">
              <label class="block text-gray-700 dark:text-gray-300 mb-1 text-sm font-semibold">{{ $t('client.residentialAddress') }}</label>
              <div class="relative flex gap-2">
                <div class="flex-1 relative">
                  <input
                    v-model="cliente.direccion_residencial"
                    @input="onInputDireccion('residencial')"
                    @focus="onFocusDireccion('residencial')"
                    @blur="onBlurDireccion('residencial')"
                    type="text"
                    :placeholder="$t('createClient.form.residentialAddressPlaceholder') || 'Ingresa la dirección residencial del cliente...'"
                    class="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500"
                    autocomplete="off"
                  />
                  <!-- Sugerencias -->
                  <ul v-if="mostrarSugResidencial && sugerenciasResidencial.length"
                      class="absolute z-20 mt-1 w-full max-h-64 overflow-auto bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded shadow">
                    <li v-for="(s, idx) in sugerenciasResidencial" :key="idx"
                        @mousedown.prevent="seleccionarSugerencia('residencial', s)"
                        class="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-800 dark:text-gray-200">
                      {{ s.display_name }}
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  @click="miUbicacion('residencial')"
                  class="px-3 py-1.5 text-sm bg-green-500 dark:bg-green-600 text-white rounded hover:bg-green-600 dark:hover:bg-green-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  Mi ubicación
                </button>
                <button
                  v-if="coordenadasResidencial"
                  type="button"
                  @click="comprobarDireccion('residencial')"
                  class="px-3 py-1.5 text-sm bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Comprobar
                </button>
              </div>
            </div>

            <!-- Botones -->
            <div class="mt-4 flex space-x-3">
              <button
                type="submit"
                :disabled="creacionEnCurso"
                class="flex-1 bg-blue-500 dark:bg-blue-600 text-white py-2.5 text-sm rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {{ creacionEnCurso ? $t('payment.saving') : $t('client.create') }}
              </button>
              <button
                type="button"
                @click="volver"
                class="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2.5 text-sm rounded hover:bg-gray-400 dark:hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Modal de alerta para Id reportado -->
      <Teleport to="body">
        <div v-if="mostrarModalCedulaReportada" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="mostrarModalCedulaReportada = false"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-yellow-300/50 dark:border-yellow-700/50 transition-all duration-300">
            <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-yellow-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
              <div class="flex items-center gap-3 mb-2">
                <svg class="w-10 h-10 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ $t('reports.warning') }}: {{ $t('reports.reportId') }}</h2>
              </div>
            </div>
            <div class="p-6">
              <p class="text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {{ $t('reports.idReported') }} <strong class="text-yellow-600 dark:text-yellow-400">{{ cliente.cc }}</strong> {{ $t('reports.reportedBefore') }}
              </p>
              <div v-if="infoCedulaReportada?.fechaReporte || infoCedulaReportada?.motivo" class="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-gray-700 dark:to-gray-800 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-4 shadow-inner">
                <p v-if="infoCedulaReportada?.fechaReporte" class="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <span class="font-semibold">{{ $t('reports.reportDate') }}:</span> {{ new Date(infoCedulaReportada.fechaReporte).toLocaleDateString() }}
                </p>
                <p v-if="infoCedulaReportada?.motivo" class="text-sm text-gray-700 dark:text-gray-300">
                  <span class="font-semibold">{{ $t('modal.reason') }}:</span> {{ infoCedulaReportada.motivo }}
                </p>
              </div>
              <p class="text-base text-gray-700 dark:text-gray-300 mb-6 font-medium">
                {{ $t('reports.continueCreation') }}
              </p>
              <div class="flex justify-end gap-3">
                <button 
                  @click="mostrarModalCedulaReportada = false" 
                  class="px-5 py-2.5 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-all duration-200 shadow-sm"
                >
                  {{ $t('reports.goBack') }}
                </button>
                <button 
                  @click="continuarConCreacion" 
                  class="px-5 py-2.5 text-white bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg hover:from-yellow-600 hover:to-yellow-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  {{ $t('reports.continue') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Modal de éxito (cliente creado) -->
      <Teleport to="body">
        <div v-if="mostrarModalExitoCliente" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="cerrarModalExitoCliente"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-green-200/50 dark:border-green-700/50 transition-all duration-300">
            <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-green-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
              <div class="flex items-center gap-3 mb-2">
                <svg class="w-10 h-10 text-green-600 dark:text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ $t('client.createdSuccessTitle') }}</h2>
              </div>
            </div>
            <div class="p-6">
              <p class="text-base text-gray-700 dark:text-gray-300 mb-6 text-center leading-relaxed">{{ mensajeExitoCliente }}</p>
              <div class="flex justify-center">
                <button @click="cerrarModalExitoCliente" class="px-6 py-2.5 text-white bg-green-700 hover:bg-green-800 border-2 border-green-800/60 rounded-lg font-semibold transition-all duration-200 shadow-md">
                  {{ $t('common.accept') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Modal de Llave necesaria -->
      <Teleport to="body">
        <div v-if="mostrarModalLlave" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="mostrarModalLlave = false"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 border-amber-300/50 dark:border-amber-700/50 transition-all duration-300">
            <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-amber-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
              <div class="flex items-center gap-3 mb-2">
                <svg class="w-10 h-10 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
                <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Llave requerida</h2>
              </div>
            </div>
            <div class="p-6 space-y-4">
              <template v-if="estadoLlave === 'pendiente'">
                <p class="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  Esta venta de <strong>${{ formatNumLlave(datosLlave.venta, 0) }}</strong> excede el tope de <strong>${{ formatNumLlave(datosLlave.tope, 0) }}</strong> configurado por tu administrador.
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Solicita una llave para continuar con la creación del cliente.</p>
                <button
                  type="button"
                  :disabled="solicitandoLlave"
                  class="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
                  @click="solicitarLlave"
                >
                  {{ solicitandoLlave ? 'Solicitando…' : 'Solicitar llave al administrador' }}
                </button>
                <p v-if="solicitudExitosa" class="text-sm text-green-600 dark:text-green-400 text-center">Solicitud enviada. Espera el código de tu administrador.</p>
              </template>
              <template v-else-if="estadoLlave === 'esperando'">
                <p class="text-sm text-green-600 dark:text-green-400 text-center font-medium">Solicitud enviada correctamente</p>
                <p class="text-sm text-gray-600 dark:text-gray-400 text-center">Espera el código de tu administrador e ingrésalo aquí:</p>
                <input
                  v-model="codigoLlaveInput"
                  type="text"
                  maxlength="6"
                  placeholder="000000"
                  class="w-full text-center text-2xl font-mono tracking-widest px-3 py-2.5 border border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-amber-400"
                />
                <button
                  type="button"
                  :disabled="!codigoLlaveInput.trim() || validandoLlave"
                  class="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
                  @click="usarLlave"
                >
                  {{ validandoLlave ? 'Validando…' : 'Validar y crear cliente' }}
                </button>
                <p v-if="errorLlave" class="text-sm text-red-600 dark:text-red-400 text-center">{{ errorLlave }}</p>
              </template>
              <template v-else-if="estadoLlave === 'aprobada'">
                <p class="text-sm text-green-600 dark:text-green-400 text-center font-medium">Llave validada correctamente</p>
                <p class="text-sm text-gray-600 dark:text-gray-400 text-center">Creando el cliente...</p>
              </template>
              <div class="flex justify-center pt-2">
                <button
                  type="button"
                  class="px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  @click="cancelarLlave"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </template>
  
  <script setup>

import API_BASE_URL from '../config/api.js'
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  
  const { t } = useI18n()
// Sin mapa: buscamos/obtenemos ubicación y guardamos coordenadas
  
  const router = useRouter()
  const route = useRoute()
  const cliente = ref({
    nombres: '',
    apellidos: '',
    cc: '',
    apodo: '',
    celular: '',
    direccion: '',
    direccion_residencial: '',
    valor: '',
    parcelas: '',
    frecuencia: '',
    diaPago: '',
    renovado: false
  })

  // Coordenadas de las direcciones (se envían al backend, pero no se muestran)
  const coordenadasComercial = ref(null)
  const coordenadasResidencial = ref(null)

  // Estado de autocompletado
  const sugerenciasComercial = ref([])
  const sugerenciasResidencial = ref([])
  const mostrarSugComercial = ref(false)
  const mostrarSugResidencial = ref(false)
  let debounceTimer = null
  
  // Estado para modal de Id reportado
  const mostrarModalCedulaReportada = ref(false)
  const infoCedulaReportada = ref(null)
  const datosClienteParaCrear = ref(null) // Almacenar datos del cliente cuando se detecta Id reportado

  // Modal de éxito al crear cliente
  const mostrarModalExitoCliente = ref(false)
  const mensajeExitoCliente = ref('')
  /** Evita doble envío / condición de carrera al crear el mismo cliente varias veces */
  const creacionEnCurso = ref(false)

  // ===== Llaves =====
  const mostrarModalLlave = ref(false)
  const estadoLlave = ref('pendiente') // pendiente → esperando → aprobada
  const datosLlave = ref({ venta: 0, tope: 0 })
  const solicitandoLlave = ref(false)
  const solicitudExitosa = ref(false)
  const codigoLlaveInput = ref('')
  const validandoLlave = ref(false)
  const errorLlave = ref('')
  const solicitudLlaveId = ref(null)
  const datosClienteParaLlave = ref(null)

  function formatNumLlave(n, dec = 0) {
    const num = Number(n)
    if (!isFinite(num)) return '0'
    return num.toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec })
  }

  function limpiarValorSiCero() {
    if (cliente.valor === '' || cliente.valor === '0' || Number(cliente.valor) === 0) cliente.valor = ''
  }

  /** Interés personalizado: checkbox + % manual; si no, 10% / 20% según cuotas */
  const interesPersonalizadoActivo = ref(false)
  const porcentajeInteresPersonalizado = ref('')

  // Calcular interés: personalizado (0–100) o automático según número de parcelas
  const interesAplicado = computed(() => {
    if (interesPersonalizadoActivo.value) {
      const raw = String(porcentajeInteresPersonalizado.value ?? '').trim().replace(',', '.')
      const p = parseFloat(raw)
      if (!Number.isFinite(p) || p < 0 || p > 100) return null
      return Math.round(p * 100) / 100
    }
    const parcelas = parseInt(cliente.value.parcelas) || 0
    return parcelas <= 11 ? 10 : 20
  })

  const totalAPagar = computed(() => {
    const valor = parseFloat(cliente.value.valor) || 0
    const parcelas = parseInt(cliente.value.parcelas) || 0
    const i = interesAplicado.value
    if (valor <= 0 || parcelas <= 0 || i === null) return '0.00'
    const interes = i / 100
    return (valor + valor * interes).toFixed(2)
  })

  const valorParcela = computed(() => {
    const total = parseFloat(totalAPagar.value) || 0
    const parcelas = parseInt(cliente.value.parcelas) || 0
    return total > 0 && parcelas > 0 ? (total / parcelas).toFixed(2) : '0.00'
  })
  
  function volver() {
    router.push('/vendedor')
  }

  // Autocompletado: obtener sugerencias con debounce
  function onInputDireccion(tipo) {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => cargarSugerencias(tipo), 350)
  }

  function onFocusDireccion(tipo) {
    if (tipo === 'comercial') mostrarSugComercial.value = true
    else mostrarSugResidencial.value = true
  }

  function onBlurDireccion(tipo) {
    setTimeout(() => {
      if (tipo === 'comercial') mostrarSugComercial.value = false
      else mostrarSugResidencial.value = false
    }, 150)
  }

  async function cargarSugerencias(tipo) {
    const texto = tipo === 'comercial' ? cliente.value.direccion : cliente.value.direccion_residencial
    if (!texto || texto.trim().length < 3) {
      if (tipo === 'comercial') sugerenciasComercial.value = []
      else sugerenciasResidencial.value = []
      return
    }
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(texto)}&limit=5&countrycodes=co`
      const res = await fetch(url)
      const data = await res.json()
      if (tipo === 'comercial') sugerenciasComercial.value = data
      else sugerenciasResidencial.value = data
    } catch (e) {
      // silencioso
    }
  }

  function seleccionarSugerencia(tipo, s) {
    const lat = parseFloat(s.lat)
    const lng = parseFloat(s.lon)
    if (tipo === 'comercial') {
      cliente.value.direccion = s.display_name
      coordenadasComercial.value = { lat, lng }
      mostrarSugComercial.value = false
    } else {
      cliente.value.direccion_residencial = s.display_name
      coordenadasResidencial.value = { lat, lng }
      mostrarSugResidencial.value = false
    }
  }

  // Comprobar dirección en Google Maps
  function comprobarDireccion(tipo) {
    const coordenadas = tipo === 'comercial' ? coordenadasComercial.value : coordenadasResidencial.value
    if (coordenadas) {
      const url = `https://www.google.com/maps?q=${coordenadas.lat},${coordenadas.lng}`
      window.open(url, '_blank')
    }
  }

  // Obtener ubicación actual + reverse geocoding
  function miUbicacion(tipo) {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('Geolocalización no soportada en este dispositivo')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (posicion) => {
        const lat = posicion.coords.latitude
        const lng = posicion.coords.longitude
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
          const data = await resp.json()
          const direccion = data && data.display_name ? data.display_name : `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          if (tipo === 'comercial') {
            cliente.value.direccion = direccion
            coordenadasComercial.value = { lat, lng }
          } else {
            cliente.value.direccion_residencial = direccion
            coordenadasResidencial.value = { lat, lng }
          }
        } catch (_) {
          alert('No fue posible obtener la dirección desde la ubicación')
        }
      },
      () => {
        alert('No fue posible obtener la ubicación. Asegúrate de tener la ubicación activada en Ajustes del iPhone.')
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    )
  }
  
  async function crearCliente() {
    if (interesPersonalizadoActivo.value && interesAplicado.value === null) {
      alert(t('client.customInterestInvalid'))
      return
    }

    // Formato de fecha: aa/mm/dd hh:mm
    const now = new Date()
    const fecha = `${now.getFullYear().toString().slice(2)}/` +
      `${String(now.getMonth() + 1).padStart(2, '0')}/` +
      `${String(now.getDate()).padStart(2, '0')} ` +
      `${String(now.getHours()).padStart(2, '0')}:` +
      `${String(now.getMinutes()).padStart(2, '0')}`

    const valor = parseFloat(cliente.value.valor) || 0
    const parcelas = parseInt(cliente.value.parcelas) || 0
    const pct = interesAplicado.value
    if (pct === null) {
      alert(t('client.customInterestInvalid'))
      return
    }
    const interes = pct / 100
    const total = valor + valor * interes
    const valorParcelaCalculado = parcelas > 0 ? (total / parcelas) : 0

    const vendedorId = localStorage.getItem('vendedorId')

    const nuevoCliente = {
      ...cliente.value,
      dias: Number(cliente.value.parcelas),
      frecuencia: cliente.value.frecuencia,
      interes: pct,
      fecha,
      total: Number(total.toFixed(2)),
      parcela: Number(valorParcelaCalculado.toFixed(2)),
      saldo_inicial: Number(total.toFixed(2)),
      vendedor: vendedorId,
      renovado: !!cliente.value.renovado,
      coordenadas_comercial: coordenadasComercial.value,
      coordenadas_residencial: coordenadasResidencial.value
    }
    delete nuevoCliente.parcelas

    if (cliente.value.renovado && route.query.idAnterior) {
      try {
        const resAnt = await fetch(`${API_BASE_URL}/api/clientes/${route.query.idAnterior}`)
        if (resAnt.ok) {
          const clienteAnt = await resAnt.json()
          nuevoCliente.valorPrevioRenovacion = Number(clienteAnt.valor) || 0
        }
      } catch (e) {
        console.error('Error al obtener valor anterior para renovación:', e)
      }
    }

    if (creacionEnCurso.value) return
    creacionEnCurso.value = true
    try {
      if (cliente.value.cc) {
        try {
          const codigoVinculacion = localStorage.getItem('codigoVinculacion')
          if (codigoVinculacion) {
            const resVerificar = await fetch(`${API_BASE_URL}/api/cedulas/verificar/${cliente.value.cc}?codigoVinculacion=${encodeURIComponent(codigoVinculacion)}`)
            const dataVerificar = await resVerificar.json()
            if (dataVerificar.reportada) {
              infoCedulaReportada.value = dataVerificar
              datosClienteParaCrear.value = nuevoCliente
              mostrarModalCedulaReportada.value = true
              return
            }
          }
        } catch (e) {
          console.error('Error al verificar Id reportado:', e)
        }
      }

      // Verificar tope de venta (Llaves)
      const token = localStorage.getItem('sessionToken')
      const resTope = await fetch(`${API_BASE_URL}/api/vendedores/validar-venta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ valor: cliente.value.valor })
      })
      if (resTope.ok) {
        const dataTope = await resTope.json()
        if (dataTope.necesitaLlave) {
          datosLlave.value = { venta: Number(cliente.value.valor) || 0, tope: dataTope.tope }
          datosClienteParaLlave.value = nuevoCliente
          estadoLlave.value = 'pendiente'
          solicitudExitosa.value = false
          codigoLlaveInput.value = ''
          errorLlave.value = ''
          mostrarModalLlave.value = true
          return
        }
      }

      await procederConCreacion(nuevoCliente)
    } finally {
      creacionEnCurso.value = false
    }
  }

async function procederConCreacion(nuevoCliente) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoCliente)
    });
    
    const data = await res.json();
    if (res.ok) {
      // Si es renovación, marcar el cliente anterior como cancelado (NO eliminar)
      // Esto preserva los pagos y valores para el cálculo correcto del resumen
      if (route.query.idAnterior) {
        try {
          await fetch(`${API_BASE_URL}/api/clientes/${route.query.idAnterior}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              cancelado: true,
              historial: true,
              fechaEntradaHistorial: new Date()
            })
          });
        } catch (e) {
          // Si falla, no es crítico - el cliente nuevo ya se creó
        }
      }
      const nombreCompleto = `${cliente.value.nombres || ''} ${cliente.value.apellidos || ''}`.trim() || t('client.title');
      mensajeExitoCliente.value = t('client.createdSuccessMessage', { name: nombreCompleto });
      mostrarModalExitoCliente.value = true;
      window.dispatchEvent(new CustomEvent('cliente-creado'));
    } else {
      const mensajeError = data.detalles || data.error || 'Error desconocido al crear cliente';
      console.error('❌ Error al crear cliente:', data);
      alert(`Error al crear cliente: ${mensajeError}`);
    }
  } catch (e) {
    console.error('❌ Error de conexión:', e);
    alert(`Error de conexión con el servidor: ${e.message}`);
  }
}

function cerrarModalExitoCliente() {
  mostrarModalExitoCliente.value = false;
  window.dispatchEvent(new CustomEvent('actualizar-dashboard'));
  router.push('/vendedor');
}

async function continuarConCreacion() {
  if (creacionEnCurso.value) return
  creacionEnCurso.value = true
  try {
    mostrarModalCedulaReportada.value = false
    if (datosClienteParaCrear.value) {
      const datos = datosClienteParaCrear.value
      datosClienteParaCrear.value = null
      await procederConCreacion(datos)
    }
  } finally {
    creacionEnCurso.value = false
  }
}

async function solicitarLlave() {
  if (solicitandoLlave.value) return
  solicitandoLlave.value = true
  errorLlave.value = ''
  try {
    const token = localStorage.getItem('sessionToken')
    const res = await fetch(`${API_BASE_URL}/api/vendedores/solicitar-llave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        valor: datosLlave.value.venta,
        tope: datosLlave.value.tope,
        datosCliente: datosClienteParaLlave.value
      })
    })
    if (res.ok) {
      const data = await res.json()
      solicitudLlaveId.value = data.solicitudId
      solicitudExitosa.value = true
      estadoLlave.value = 'esperando'
    } else {
      const err = await res.json().catch(() => ({}))
      errorLlave.value = err.error || 'Error al solicitar llave'
    }
  } catch (e) {
    errorLlave.value = 'Error de conexión'
  } finally {
    solicitandoLlave.value = false
  }
}

async function usarLlave() {
  if (validandoLlave.value) return
  validandoLlave.value = true
  errorLlave.value = ''
  try {
    const token = localStorage.getItem('sessionToken')
    const res = await fetch(`${API_BASE_URL}/api/vendedores/usar-llave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ codigoLlave: codigoLlaveInput.value.trim() })
    })
    if (res.ok) {
      estadoLlave.value = 'aprobada'
      if (datosClienteParaLlave.value) {
        await procederConCreacion(datosClienteParaLlave.value)
        mostrarModalLlave.value = false
        estadoLlave.value = 'pendiente'
        datosClienteParaLlave.value = null
      }
    } else {
      const err = await res.json()
      errorLlave.value = err.error || 'Código inválido'
    }
  } catch (e) {
    errorLlave.value = 'Error de conexión'
  } finally {
    validandoLlave.value = false
  }
}

function cancelarLlave() {
  mostrarModalLlave.value = false
  codigoLlaveInput.value = ''
  errorLlave.value = ''
  if (creacionEnCurso.value) creacionEnCurso.value = false
}

function reabrirModalLlave() {
  mostrarModalLlave.value = true
}

  /** Lee query (renovación u otros); tolera string | string[] de vue-router */
  function qStr(key) {
    const v = route.query[key]
    if (v === undefined || v === null) return ''
    return Array.isArray(v) ? String(v[0] ?? '') : String(v)
  }

  function aplicarQueryDesdeRuta() {
    if (route.path !== '/crear-cliente') return
    const q = route.query
    if (!q || Object.keys(q).length === 0) return
    if (qStr('nombres')) cliente.value.nombres = qStr('nombres')
    if (qStr('apellidos')) cliente.value.apellidos = qStr('apellidos')
    if (qStr('cc')) cliente.value.cc = qStr('cc')
    if (qStr('apodo')) cliente.value.apodo = qStr('apodo')
    if (qStr('celular')) cliente.value.celular = qStr('celular')
    if (qStr('direccion')) cliente.value.direccion = qStr('direccion')
    if (qStr('direccion_residencial')) cliente.value.direccion_residencial = qStr('direccion_residencial')
    if (qStr('valor')) cliente.value.valor = qStr('valor')
    if (qStr('parcelas')) cliente.value.parcelas = qStr('parcelas')
    if (qStr('frecuencia')) cliente.value.frecuencia = qStr('frecuencia')
    if (q.renovado === 'true' || q.renovado === true) cliente.value.renovado = true
  }

  async function verificarSolicitudPendiente() {
    try {
      const token = localStorage.getItem('sessionToken')
      const res = await fetch(`${API_BASE_URL}/api/vendedores/solicitud-pendiente`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.solicitud) {
          solicitudLlaveId.value = data.solicitud._id
          datosClienteParaLlave.value = data.solicitud.datosCliente
          datosLlave.value = { venta: data.solicitud.valorVenta || 0, tope: data.solicitud.tope || 0 }
          solicitudExitosa.value = true
          estadoLlave.value = 'esperando'
        }
      }
    } catch (_) {}
  }

  onMounted(async () => {
    aplicarQueryDesdeRuta()
    await verificarSolicitudPendiente()
  })

  // Si ya estabas en Crear cliente y vuelves con query nueva (p. ej. desde Pagos), onMounted no se repite
  watch(
    () => route.fullPath,
    () => aplicarQueryDesdeRuta()
  )
  </script>

  <style>
  /* Quitar flechas de los input type number en todos los navegadores */
  input[type="number"].no-spinner::-webkit-inner-spin-button,
  input[type="number"].no-spinner::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"].no-spinner {
    -moz-appearance: textfield;
    appearance: textfield;
  }
  </style>