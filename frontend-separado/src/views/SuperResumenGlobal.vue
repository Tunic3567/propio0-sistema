<template>
  <div
    class="min-h-dvh w-full max-w-full overflow-x-clip overscroll-none flex flex-col bg-neutral-50 dark:bg-slate-900 transition-theme"
  >
    <NavbarAdmin class="shrink-0" @logout="logout" />
    <div class="flex flex-col md:flex-row md:flex-1 md:min-h-0 md:overflow-hidden">
      <button
        type="button"
        @click="sidebarAbierto = !sidebarAbierto"
        class="md:hidden w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-colors"
      >
        <Bars3Icon v-if="!sidebarAbierto" class="w-5 h-5 shrink-0" />
        <XMarkIcon v-else class="w-5 h-5 shrink-0" />
        {{ sidebarAbierto ? 'Ocultar asesores' : 'Mostrar asesores' }}
      </button>
      <div
        v-show="sidebarVisible"
        :class="[
          'w-full md:w-72 lg:w-80 shrink-0 md:shrink-0 min-h-0 md:max-h-none md:h-full flex-col bg-white dark:bg-slate-800 border-b md:border-b-0 md:border-r-2 border-neutral-200 dark:border-slate-600 overscroll-contain transition-theme',
          sidebarAbierto || isDesktopView ? 'flex overflow-y-auto' : 'hidden'
        ]"
      >
        <div class="flex flex-col flex-1 w-full md:min-h-full py-6 px-4 md:px-5 md:py-8">
          <div class="flex flex-col gap-5 md:gap-6 flex-1">
            <div v-if="arbolPorUbicacion.length === 0" class="text-neutral-500 dark:text-slate-400 italic text-base md:text-lg leading-relaxed">
              No hay asesores.
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
                      <span class="truncate leading-snug">
                        {{ v.nombre }}
                        <span class="text-xs text-amber-600 dark:text-amber-400 font-normal">({{ v.adminNombre }})</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref="resumenAdminMainScrollEl"
        class="bg-neutral-50 dark:bg-neutral-900/50 p-4 md:p-8 md:flex-1 md:min-h-0 md:overflow-y-auto md:border-l border-neutral-200 dark:border-neutral-800 transition-theme"
      >
        <transition name="fade">
          <div v-if="vendedorSeleccionado">
            <div class="flex justify-end gap-2 mb-2">
              <button
                @click="actualizarPanel"
                class="text-neutral-400 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                title="Actualizar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582M20 20v-5h-.581M5.582 9A7.974 7.974 0 0112 4c2.042 0 3.899.767 5.318 2.018M18.418 15A7.974 7.974 0 0112 20a7.974 7.974 0 01-5.318-2.018" />
                </svg>
              </button>
            </div>

            <h2 class="text-lg font-bold mb-3 flex items-center gap-2 text-neutral-900 dark:text-slate-100">
              <UserIcon class="w-6 h-6 text-blue-500 dark:text-blue-400" />
              {{ resumenPanel?.vendedor?.nombre || vendedorSeleccionado.nombre }}
              <span class="text-sm font-normal text-amber-600 dark:text-amber-400">({{ vendedorSeleccionado.adminNombre }})</span>
            </h2>

            <div
              v-if="resumenPanel && (resumenPanel?.rutasDisponibles?.length || 0) > 0"
              ref="rutasDropdownRoot"
              class="mb-3 flex flex-wrap items-start gap-3"
            >
              <label class="text-sm font-semibold text-neutral-800 dark:text-slate-200 shrink-0 pt-2">Rutas:</label>
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
                          Apertura:
                        </div>
                        <div class="text-xs sm:text-sm font-mono tabular-nums font-semibold text-green-800 dark:text-green-300 break-words">
                          {{ formatFechaRutaSelect(r.fechaApertura) }}
                        </div>
                      </div>
                      <div class="min-w-0">
                        <div class="text-[0.65rem] font-bold uppercase tracking-wide text-red-600 dark:text-red-400 mb-0.5">
                          Cierre:
                        </div>
                        <div
                          class="text-xs sm:text-sm font-mono tabular-nums font-semibold text-red-800 dark:text-red-300 break-words"
                        >
                          {{ r.fechaCierre ? formatFechaRutaSelect(r.fechaCierre) : 'No cerrada' }}
                        </div>
                      </div>
                    </div>
                    <div class="flex justify-end mt-1">
                      <button
                        type="button"
                        class="inline-flex items-center justify-center w-5 h-5 rounded hover:bg-neutral-200 dark:hover:bg-slate-600 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        :title="$t('admin.editDates')"
                        @click.stop="abrirModalFechas(r)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="resumenPanel" class="space-y-2">
              <button
                type="button"
                class="flex w-full items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-neutral-200/50 dark:hover:bg-slate-800/80 active:bg-neutral-300/40 dark:active:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                @click="abrirModalFechas(resumenPanel.ruta)"
              >
                <CalendarDaysIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Fecha apertura recaudo:</span>
                <span v-if="resumenPanel.ruta?.fechaApertura" class="inline-flex items-center px-3 py-1.5 rounded-lg text-[0.9375rem] font-semibold tabular-nums bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:border dark:border-slate-600">
                  {{ new Date(resumenPanel.ruta.fechaApertura).toLocaleString('es-ES') }}
                </span>
                <span v-else class="inline-flex items-center px-3 py-1.5 rounded-lg text-[0.9375rem] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 dark:border dark:border-slate-600">-</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 ml-auto shrink-0 text-black dark:text-slate-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>

              <button
                type="button"
                class="flex w-full items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-neutral-200/50 dark:hover:bg-slate-800/80 active:bg-neutral-300/40 dark:active:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                @click="abrirModalFechas(resumenPanel.ruta)"
              >
                <CalendarDaysIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Fecha de cierre:</span>
                <span v-if="resumenPanel.ruta?.fechaCierre" class="inline-flex items-center px-3 py-1.5 rounded-lg text-[0.9375rem] font-semibold tabular-nums bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:border dark:border-slate-600">
                  {{ new Date(resumenPanel.ruta.fechaCierre).toLocaleString('es-ES') }}
                </span>
                <span v-else class="inline-flex items-center px-3 py-1.5 rounded-lg text-[0.9375rem] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:border dark:border-slate-600 italic">
                  No cerrada
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 ml-auto shrink-0 text-black dark:text-slate-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>

              <div class="border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
                <button
                  type="button"
                  class="flex w-full items-center gap-2 mb-2 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-neutral-200/50 dark:hover:bg-slate-800/80 active:bg-neutral-300/40 dark:active:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  title="Ir a clientes"
                  @click="router.push({ path: '/admin', query: { vendedorId: vendedorSeleccionado?._id || undefined, rutaId: rutaSeleccionadaId || undefined } })"
                >
                  <UsersIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
                  <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Total clientes:</span>
                  <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">{{ formatNum(resumenPanel.clientes?.length ?? 0) }}</span>
                  <span class="text-gray-600 dark:text-gray-400 text-sm font-normal">
                    ({{ formatNum(resumenPanel.resumen?.clientesConPagosRegistrados ?? 0) }} registrados)
                  </span>
                  <ChevronRightIcon class="w-5 h-5 ml-auto shrink-0 text-black dark:text-slate-100" aria-hidden="true" />
                </button>
                <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#10B98126] text-[#10B981]">
                    Nuevos: {{ formatNum(resumenPanel.resumen?.nuevos ?? 0) }}
                  </span>
                  <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#6366F126] text-[#6366F1]">
                    Renovados: {{ formatNum(resumenPanel.resumen?.renovados ?? 0) }}
                  </span>
                  <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#F43F5E26] text-[#F43F5E]">
                    Cancelados: {{ formatNum(resumenPanel.resumen?.cancelados ?? 0) }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
                <WalletIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Cartera inicial:</span>
                <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(resumenPanel.ruta?.carteraInicial) || 0, 2) }}</span>
              </div>
              <div class="flex items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
                <BanknotesIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Caja inicial:</span>
                <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(resumenPanel.ruta?.cajaInicial) || 0, 2) }}</span>
              </div>

              <button
                type="button"
                class="flex w-full items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-neutral-200/50 dark:hover:bg-slate-800/80 active:bg-neutral-300/40 dark:active:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                title="Ver detalle del recaudo pretendido"
                @click="abrirPretendidoDetalle"
              >
                <ChartBarIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Recaudo pretendido:</span>
                <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(resumenPanel.ruta?.recaudadoPretendido) || 0, 2) }}</span>
                <ChevronRightIcon class="w-5 h-5 ml-auto shrink-0 text-black dark:text-slate-100" />
              </button>
              <div class="flex items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
                <CurrencyDollarIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Recaudo actual:</span>
                <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(resumenPanel.ruta?.recaudado) || 0, 2) }}</span>
                <span :class="['ml-3 inline-flex items-center px-3 py-1.5 rounded-lg text-[0.9375rem] font-semibold tabular-nums', clasePorcentajeRecaudo ]">
                  {{ formatNum(porcentajeRecaudo, 1) }}%
                </span>
              </div>

              <button
                type="button"
                class="flex w-full items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-neutral-200/50 dark:hover:bg-slate-800/80 active:bg-neutral-300/40 dark:active:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                title="Ir a Ingresos y Egresos"
                @click="router.push({ name: 'IngresosEgresosAdmin', query: { vendedor: vendedorSeleccionado?._id || undefined, ruta: rutaSeleccionadaId || undefined } })"
              >
                <ArrowTrendingUpIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400 shrink-0" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Ingresos:</span>
                <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(resumenPanel.ruta?.ingresos) || 0, 2) }}</span>
                <ChevronRightIcon class="w-5 h-5 ml-auto shrink-0 text-black dark:text-slate-100" aria-hidden="true" />
              </button>
              <div class="flex items-center gap-2 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2">
                <ShoppingCartIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Ventas:</span>
                <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(resumenPanel.ruta?.ventas) || 0, 2) }}</span>
                <span v-if="interesesTotalesRuta > 0" class="ml-2 inline-flex items-center px-3 py-1.5 rounded-lg text-[0.9375rem] font-semibold tabular-nums bg-teal-50 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200 dark:border dark:border-teal-700/50">
                  Intereses: ${{ formatNum(interesesTotalesRuta, 2) }}
                </span>
              </div>
              <button
                type="button"
                class="flex w-full items-center gap-2 border-b border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-neutral-200/50 dark:hover:bg-slate-800/80 active:bg-neutral-300/40 dark:active:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                title="Ir a Ingresos y Egresos"
                @click="router.push({ name: 'IngresosEgresosAdmin', query: { vendedor: vendedorSeleccionado?._id || undefined, ruta: rutaSeleccionadaId || undefined } })"
              >
                <ReceiptRefundIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400 shrink-0" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Egresos:</span>
                <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(resumenPanel.ruta?.egresos) || 0, 2) }}</span>
                <ChevronRightIcon class="w-5 h-5 ml-auto shrink-0 text-black dark:text-slate-100" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="flex w-full items-center gap-2 border-b border-[#1E293B]/15 dark:border-[#1E293B]/50 pb-2 mb-2 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-neutral-200/50 dark:hover:bg-slate-800/80 active:bg-neutral-300/40 dark:active:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                title="Ir a Ingresos y Egresos"
                @click="router.push({ name: 'IngresosEgresosAdmin', query: { vendedor: vendedorSeleccionado?._id || undefined, ruta: rutaSeleccionadaId || undefined } })"
              >
                <ArrowTrendingDownIcon class="w-6 h-6 text-neutral-500 dark:text-slate-400 shrink-0" />
                <span class="font-semibold text-gray-900 dark:text-gray-100 text-sm">Retiros:</span>
                <span class="text-lg font-bold tabular-nums tracking-tight text-gray-900 dark:text-slate-100">${{ formatNum(Number(resumenPanel.ruta?.retiros) || 0, 2) }}</span>
                <ChevronRightIcon class="w-5 h-5 ml-auto shrink-0 text-black dark:text-slate-100" aria-hidden="true" />
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

  <!-- Modal detalle recaudo pretendido -->
  <Teleport to="body">
    <div v-if="mostrarPretendidoDetalle" class="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
      <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="cerrarPretendidoDetalle"></div>
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90dvh] flex flex-col overflow-hidden">
        <div class="shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h2 class="text-lg font-bold text-neutral-900 dark:text-slate-100">Detalle del Recaudo Pretendido</h2>
            <p v-if="pretendidoDetalleVendedor" class="text-xs text-neutral-500 dark:text-slate-400 mt-0.5">{{ pretendidoDetalleVendedor }}</p>
          </div>
          <button @click="cerrarPretendidoDetalle" class="text-neutral-400 hover:text-neutral-600 dark:hover:text-slate-300 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div v-if="pretendidoDetalleCargando" class="flex-1 flex items-center justify-center p-8 text-neutral-500 dark:text-slate-400">Cargando...</div>
        <div v-else-if="pretendidoDetalleError" class="flex-1 flex items-center justify-center p-8 text-red-500">{{ pretendidoDetalleError }}</div>
        <div v-else-if="pretendidoDetalleData" class="overflow-y-auto overscroll-contain flex-1 p-2 sm:p-4 space-y-4">
          <div>
            <h3 class="text-sm font-semibold text-neutral-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <span class="inline-block w-3 h-3 rounded-full bg-green-500"></span>
              Sin pago en la ruta ({{ pretendidoDetalleData.sinPagos.length }}) — <span class="tabular-nums">${{ formatNum(pretendidoDetalleData.sumaSinPagos, 2) }}</span>
            </h3>
            <div class="space-y-1">
              <div
                v-for="(c, i) in pretendidoDetalleData.sinPagos"
                :key="c._id"
                class="rounded-lg border border-neutral-200 dark:border-slate-600 overflow-hidden"
              >
                <button
                  type="button"
                  class="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-slate-700/50 transition-colors"
                  @click="toggleExpandPretendido(c._id)"
                >
                  <span class="text-xs text-neutral-400 dark:text-slate-500 w-6 shrink-0 tabular-nums">{{ i + 1 }}</span>
                  <span class="text-sm font-medium text-neutral-800 dark:text-slate-200 min-w-0 flex-1 truncate">{{ c.nombres }} {{ c.apellidos }}</span>
                  <span class="text-xs text-neutral-500 dark:text-slate-400 w-20 shrink-0 truncate">{{ c.cc }}</span>
                  <span class="text-sm font-bold tabular-nums text-green-600 dark:text-green-400 w-20 shrink-0 text-right">${{ formatNum(c.parcela, 2) }}</span>
                  <span v-if="c.estado === 'finalizado'" class="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-slate-600 text-neutral-600 dark:text-slate-300 shrink-0">Finalizado</span>
                  <svg class="w-4 h-4 shrink-0 text-neutral-400 transition-transform" :class="{ 'rotate-180': expandidoPretendido === c._id }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <div v-if="expandidoPretendido === c._id" class="px-3 py-2 bg-neutral-50 dark:bg-slate-800/50 border-t border-neutral-200 dark:border-slate-600 text-xs text-neutral-600 dark:text-slate-400 space-y-1">
                  <div class="flex justify-between"><span>Celular:</span><span class="font-medium text-neutral-800 dark:text-slate-200">{{ c.celular || '—' }}</span></div>
                  <div class="flex justify-between"><span>Saldo inicial:</span><span class="font-medium text-neutral-800 dark:text-slate-200">${{ formatNum(c.saldo_inicial, 2) }}</span></div>
                  <div v-if="c.saldoAntesRuta !== c.saldoRestante" class="flex justify-between"><span>Saldo antes de ruta:</span><span class="font-medium text-neutral-800 dark:text-slate-200">${{ formatNum(c.saldoAntesRuta, 2) }}</span></div>
                  <div class="flex justify-between"><span>Saldo restante:</span><span class="font-medium text-neutral-800 dark:text-slate-200">${{ formatNum(c.saldoRestante, 2) }}</span></div>
                  <div class="flex justify-between"><span>Pagado en ruta:</span><span class="font-medium text-neutral-800 dark:text-slate-200">${{ formatNum(c.totalPagadoEnRuta, 2) }}</span></div>
                  <div class="flex justify-between"><span>Valor parcela:</span><span class="font-medium text-neutral-800 dark:text-slate-200">${{ formatNum(c.parcela, 2) }}</span></div>
                  <div class="flex justify-between"><span>Cuotas:</span><span class="font-medium text-neutral-800 dark:text-slate-200">{{ c.totalParcelas || '—' }}</span></div>
                  <div class="flex justify-between"><span>Estado:</span><span class="font-medium text-neutral-800 dark:text-slate-200">{{ c.estado }}{{ c.cancelado ? ' · Cancelado' : '' }}{{ c.historial ? ' · Historial' : '' }}</span></div>
                  <div class="flex justify-between"><span>Creado:</span><span class="font-medium text-neutral-800 dark:text-slate-200">{{ formatFecha(c.createdAt) }}</span></div>
                  <div v-if="c.pagos && c.pagos.length > 0" class="mt-2 pt-2 border-t border-neutral-300 dark:border-slate-500">
                    <div class="text-xs font-semibold text-neutral-700 dark:text-slate-300 mb-1">Pagos en esta ruta:</div>
                    <div v-for="p in c.pagos" :key="p._id" class="flex items-center justify-between gap-2 py-1.5 px-2 rounded bg-white/60 dark:bg-slate-900/40 mb-1">
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="font-medium text-neutral-800 dark:text-slate-200 shrink-0" :class="{
                          'text-green-600 dark:text-green-400': p.tipo === 'Parcela',
                          'text-blue-600 dark:text-blue-400': p.tipo === 'Abono',
                          'text-red-500 dark:text-red-400': p.tipo === 'No pago'
                        }">{{ p.tipo }}</span>
                        <span v-if="p.numParcelas" class="text-neutral-500 dark:text-slate-400">x{{ p.numParcelas }}</span>
                        <span class="text-neutral-400 dark:text-slate-500 truncate">{{ p.observaciones || '' }}</span>
                      </div>
                      <div class="flex items-center gap-3 shrink-0">
                        <span class="tabular-nums text-neutral-800 dark:text-slate-200 font-medium">${{ formatNum(p.valor, 2) }}</span>
                        <span class="text-neutral-400 dark:text-slate-500">{{ formatFecha(p.fecha) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-neutral-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <span class="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
              Con pago en la ruta ({{ pretendidoDetalleData.conPagos.length }}) — <span class="tabular-nums">${{ formatNum(pretendidoDetalleData.sumaConPagos, 2) }}</span>
            </h3>
            <div class="space-y-1">
              <div
                v-for="(c, i) in pretendidoDetalleData.conPagos"
                :key="c._id"
                class="rounded-lg border border-neutral-200 dark:border-slate-600 overflow-hidden"
              >
                <button
                  type="button"
                  class="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-slate-700/50 transition-colors"
                  @click="toggleExpandPretendido(c._id)"
                >
                  <span class="text-xs text-neutral-400 dark:text-slate-500 w-6 shrink-0 tabular-nums">{{ i + 1 }}</span>
                  <span class="text-sm font-medium text-neutral-800 dark:text-slate-200 min-w-0 flex-1 truncate">{{ c.nombres }} {{ c.apellidos }}</span>
                  <span class="text-xs text-neutral-500 dark:text-slate-400 w-20 shrink-0 truncate">{{ c.cc }}</span>
                  <span class="text-sm font-bold tabular-nums text-blue-600 dark:text-blue-400 w-20 shrink-0 text-right">${{ formatNum(c.parcela, 2) }}</span>
                  <svg class="w-4 h-4 shrink-0 text-neutral-400 transition-transform" :class="{ 'rotate-180': expandidoPretendido === c._id }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <div v-if="expandidoPretendido === c._id" class="px-3 py-2 bg-neutral-50 dark:bg-slate-800/50 border-t border-neutral-200 dark:border-slate-600 text-xs text-neutral-600 dark:text-slate-400 space-y-1">
                  <div class="flex justify-between"><span>Celular:</span><span class="font-medium text-neutral-800 dark:text-slate-200">{{ c.celular || '—' }}</span></div>
                  <div class="flex justify-between"><span>Saldo inicial:</span><span class="font-medium text-neutral-800 dark:text-slate-200">${{ formatNum(c.saldo_inicial, 2) }}</span></div>
                  <div v-if="c.saldoAntesRuta !== c.saldoRestante" class="flex justify-between"><span>Saldo antes de ruta:</span><span class="font-medium text-neutral-800 dark:text-slate-200">${{ formatNum(c.saldoAntesRuta, 2) }}</span></div>
                  <div class="flex justify-between"><span>Saldo restante:</span><span class="font-medium text-neutral-800 dark:text-slate-200">${{ formatNum(c.saldoRestante, 2) }}</span></div>
                  <div class="flex justify-between"><span>Pagado en ruta:</span><span class="font-medium text-neutral-800 dark:text-slate-200">${{ formatNum(c.totalPagadoEnRuta, 2) }}</span></div>
                  <div class="flex justify-between"><span>Valor parcela:</span><span class="font-medium text-neutral-800 dark:text-slate-200">${{ formatNum(c.parcela, 2) }}</span></div>
                  <div class="flex justify-between"><span>Cuotas:</span><span class="font-medium text-neutral-800 dark:text-slate-200">{{ c.totalParcelas || '—' }}</span></div>
                  <div class="flex justify-between"><span>Estado:</span><span class="font-medium text-neutral-800 dark:text-slate-200">{{ c.estado }}{{ c.cancelado ? ' · Cancelado' : '' }}{{ c.historial ? ' · Historial' : '' }}</span></div>
                  <div class="flex justify-between"><span>Creado:</span><span class="font-medium text-neutral-800 dark:text-slate-200">{{ formatFecha(c.createdAt) }}</span></div>
                  <div v-if="c.pagos && c.pagos.length > 0" class="mt-2 pt-2 border-t border-neutral-300 dark:border-slate-500">
                    <div class="text-xs font-semibold text-neutral-700 dark:text-slate-300 mb-1">Pagos en esta ruta:</div>
                    <div v-for="p in c.pagos" :key="p._id" class="flex items-center justify-between gap-2 py-1.5 px-2 rounded bg-white/60 dark:bg-slate-900/40 mb-1">
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="font-medium text-neutral-800 dark:text-slate-200 shrink-0" :class="{
                          'text-green-600 dark:text-green-400': p.tipo === 'Parcela',
                          'text-blue-600 dark:text-blue-400': p.tipo === 'Abono',
                          'text-red-500 dark:text-red-400': p.tipo === 'No pago'
                        }">{{ p.tipo }}</span>
                        <span v-if="p.numParcelas" class="text-neutral-500 dark:text-slate-400">x{{ p.numParcelas }}</span>
                        <span class="text-neutral-400 dark:text-slate-500 truncate">{{ p.observaciones || '' }}</span>
                      </div>
                      <div class="flex items-center gap-3 shrink-0">
                        <span class="tabular-nums text-neutral-800 dark:text-slate-200 font-medium">${{ formatNum(p.valor, 2) }}</span>
                        <span class="text-neutral-400 dark:text-slate-500">{{ formatFecha(p.fecha) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="sticky bottom-0 bg-white dark:bg-gray-800 pt-3 border-t border-neutral-200 dark:border-slate-600">
            <div class="flex items-center justify-between text-sm font-bold text-neutral-900 dark:text-slate-100 px-1">
              <span>Total recaudo pretendido</span>
              <span class="tabular-nums">${{ formatNum(pretendidoDetalleData.recaudadoPretendido, 2) }}</span>
            </div>
          </div>
        </div>
        <div class="shrink-0 flex items-center justify-end px-4 sm:px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-gray-900">
          <button @click="cerrarPretendidoDetalle" class="px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-slate-300 bg-white dark:bg-gray-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
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
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import NavbarAdmin from '../components/NavbarAdmin.vue'
import { useAppScrollRoot } from '../composables/useAppScrollRoot.js'

const router = useRouter()
const route = useRoute()
const appScrollRoot = useAppScrollRoot()
const resumenAdminMainScrollEl = ref(null)

const sidebarAbierto = ref(false)
const isDesktopView = ref(window.innerWidth >= 768)
function onResize() { isDesktopView.value = window.innerWidth >= 768 }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
const sidebarVisible = computed(() => isDesktopView.value || sidebarAbierto.value)

function formatNum(value, decimals = 0) {
  const n = Number(value)
  if (isNaN(n)) {
    return decimals === 0 ? '0' : Number(0).toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  }
  const options = decimals === 0
    ? { useGrouping: true }
    : { useGrouping: true, minimumFractionDigits: decimals, maximumFractionDigits: decimals }
  return n.toLocaleString('es-ES', options)
}

const sidebarExpanded = reactive({ paises: {}, ciudades: {} })

const vendedores = ref([])
const vendedorSeleccionado = ref(null)
const resumenPanel = ref(null)
const rutaSeleccionadaId = ref('')

const rutasDropdownAbierto = ref(false)
const rutasDropdownRoot = ref(null)

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
        label: rawPais || 'País desconocido',
        ciudadesMap: new Map()
      })
    }
    const nodoPais = porPais.get(pKey)
    if (!nodoPais.ciudadesMap.has(ciudadFullKey)) {
      nodoPais.ciudadesMap.set(ciudadFullKey, {
        key: ciudadFullKey,
        label: rawCiudad || 'Ciudad desconocida',
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
          vendedores: [...c.vendedores]
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

function formatFechaRutaSelect(fecha) {
  if (!fecha) return '\u2014'
  return new Date(fecha).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
}

const etiquetaRutaSeleccionada = computed(() => {
  const rutas = resumenPanel.value?.rutasDisponibles || []
  const id = rutaSeleccionadaId.value
  let r = id ? rutas.find(x => String(x._id) === String(id)) : null
  if (!r && resumenPanel.value?.ruta) {
    r = rutas.find(x => String(x._id) === String(resumenPanel.value.ruta._id)) || null
  }
  if (!r && rutas[0]) r = rutas[0]
  if (!r?.fechaApertura) return '\u2014'
  const a = formatFechaRutaSelect(r.fechaApertura)
  const c = r.fechaCierre ? formatFechaRutaSelect(r.fechaCierre) : 'No cerrada'
  return `${a} \u2192 ${c}`
})

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
      const interesPct = Number(c?.intereses) || 0
      return acc + (valor * interesPct) / 100
    }
    return acc
  }, 0)
  return Math.round(suma * 100) / 100
})

const porcentajeRecaudo = computed(() => {
  const recaudado = Number(resumenPanel.value?.ruta?.recaudado) || 0
  const pretendido = Number(resumenPanel.value?.ruta?.recaudadoPretendido) || 0
  if (pretendido <= 0) return 0
  const pct = (recaudado / pretendido) * 100
  return Math.min(999, Math.round(pct * 10) / 10)
})

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
  window.addEventListener('admin-resumen-actualizar', actualizarPanel)
  window.addEventListener('pago-editado', actualizarPanel)
  window.addEventListener('pago-registrado', actualizarPanel)
  try {
    const token = localStorage.getItem('sessionToken')
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

    const [resAdmins, resVendedores] = await Promise.all([
      fetch(`${API_BASE_URL}/api/admin/super/resumen-global`, { headers: authHeaders }),
      fetch(`${API_BASE_URL}/api/vendedores`, { headers: authHeaders })
    ])

    const adminNombreMap = {}
    if (resAdmins.ok) {
      const data = await resAdmins.json()
      if (data.grupos) {
        for (const g of data.grupos) {
          adminNombreMap[g.codigoVinculacion] = g.nombre
        }
      }
    }

    if (resVendedores.ok) {
      const raw = await resVendedores.json()
      vendedores.value = raw.map(v => ({
        ...v,
        adminNombre: adminNombreMap[v.codigoVinculacion] || 'Admin desconocido'
      }))
    }

    expandSidebarFromTree()
    if (vendedores.value.length > 0) {
      const primero = arbolPorUbicacion.value[0]?.ciudades[0]?.vendedores[0] || vendedores.value[0]
      await seleccionarVendedor(primero)
    }
  } catch (e) {
    console.error('Error al cargar super resumen:', e)
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

async function seleccionarVendedor(v) {
  sidebarAbierto.value = false
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
      resumenPanel.value = null
    }
  } catch (e) {
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
  modalFechas.vendedorNombre = vendedorSeleccionado?.value?.nombre || ''
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
    const token = localStorage.getItem('sessionToken')
    const body = { codigoVinculacion: localStorage.getItem('codigoVinculacion') || '' }
    if (modalFechas.fechaApertura) body.fechaApertura = new Date(modalFechas.fechaApertura).toISOString()
    if (modalFechas.fechaCierre) body.fechaCierre = new Date(modalFechas.fechaCierre).toISOString()
    const res = await fetch(`${API_BASE_URL}/api/admin/rutas/${modalFechas.rutaId}/fechas`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      modalFechas.error = data.error || 'Error al guardar las fechas'
      return
    }
    cerrarModalFechas()
    await actualizarPanel()
  } catch (e) {
    modalFechas.error = 'Error al guardar las fechas'
  } finally {
    guardandoFechas.value = false
  }
}

const mostrarPretendidoDetalle = ref(false)
const pretendidoDetalleCargando = ref(false)
const pretendidoDetalleError = ref('')
const pretendidoDetalleData = ref(null)
const pretendidoDetalleVendedor = ref('')
const expandidoPretendido = ref(null)

async function abrirPretendidoDetalle() {
  if (!vendedorSeleccionado.value || !resumenPanel.value?.ruta?._id) return
  mostrarPretendidoDetalle.value = true
  pretendidoDetalleCargando.value = true
  pretendidoDetalleError.value = ''
  pretendidoDetalleData.value = null
  pretendidoDetalleVendedor.value = vendedorSeleccionado.value.nombre
  expandidoPretendido.value = null
  try {
    const token = localStorage.getItem('sessionToken')
    const url = new URL(`${API_BASE_URL}/api/vendedores/${vendedorSeleccionado.value._id}/pretendido-detalle`)
    if (rutaSeleccionadaId.value) {
      url.searchParams.set('rutaId', rutaSeleccionadaId.value)
    } else if (resumenPanel.value?.ruta?._id) {
      url.searchParams.set('rutaId', resumenPanel.value.ruta._id)
    }
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      pretendidoDetalleError.value = data.error || `Error ${res.status}: No se pudo cargar el detalle`
      return
    }
    pretendidoDetalleData.value = await res.json()
  } catch (e) {
    pretendidoDetalleError.value = 'Error de conexión al cargar detalle del recaudo pretendido'
  } finally {
    pretendidoDetalleCargando.value = false
  }
}

function cerrarPretendidoDetalle() {
  mostrarPretendidoDetalle.value = false
  pretendidoDetalleData.value = null
  pretendidoDetalleError.value = ''
  expandidoPretendido.value = null
}

function toggleExpandPretendido(id) {
  expandidoPretendido.value = expandidoPretendido.value === id ? null : id
}

function formatFecha(d) {
  if (!d) return '—'
  const date = new Date(d)
  return date.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' })
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
