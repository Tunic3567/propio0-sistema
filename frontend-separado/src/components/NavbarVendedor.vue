<template>
  <OfflineStatusBar @sync="forzarSync" />
  <div class="relative w-full max-w-full min-w-0">
    <!-- Navbar principal: fixed + espaciador reserva alto (menú lateral z-[101] queda por encima) -->
    <nav
      class="fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top,0px)] bg-white dark:bg-slate-800 shadow-md border-b border-[#1E293B]/15 dark:border-[#1E293B]/50 transition-theme overflow-x-clip"
    >
      <div class="px-3 py-2 sm:px-4">
        <div class="flex items-center justify-between gap-2 min-w-0">
          <!-- Logo/Título -->
          <div class="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
      <button
              @click="toggleSidebar"
              class="p-1 sm:p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-700 transition-theme shrink-0"
      >
              <svg class="w-8 h-8 sm:w-9 sm:h-9 text-neutral-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 6h20M2 12h20M2 18h20"></path>
              </svg>
      </button>
            <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <!-- Icono Clientes -->
              <svg v-if="route.path.includes('/vendedor') || route.path === '/vendedor'" class="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 text-neutral-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <!-- Icono Registros -->
              <svg v-else-if="route.path.includes('/registros')" class="h-7 w-7 sm:h-8 sm:w-8 text-neutral-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <!-- Icono Ingresos -->
              <svg v-else-if="route.path.includes('/ingresos')" class="h-7 w-7 sm:h-8 sm:w-8 text-neutral-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9a3 3 0 00-3-3H6a3 3 0 00-3 3v3" />
              </svg>
              <!-- Icono Egresos -->
              <svg v-else-if="route.path.includes('/egresos')" class="h-7 w-7 sm:h-8 sm:w-8 text-neutral-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2 2 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C8.095 4.01 7.25 4.973 7.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h6.75c.621 0 1.125-.504 1.125-1.125V9.375a1.125 1.125 0 00-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              <!-- Icono Ventas -->
              <svg v-else-if="route.path.includes('/ventas')" class="h-7 w-7 sm:h-8 sm:w-8 text-neutral-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <!-- Icono Historial Clientes -->
              <svg v-else-if="route.path.includes('/historial-clientes')" class="h-7 w-7 sm:h-8 sm:w-8 text-neutral-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              <!-- Icono Resumen -->
              <svg v-else-if="route.path.includes('/resumen')" class="h-7 w-7 sm:h-8 sm:w-8 text-neutral-500 dark:text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
              <!-- Icono por defecto -->
              <svg v-else class="h-7 w-7 sm:h-8 sm:w-8 text-neutral-600 dark:text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <h1 class="text-lg sm:text-xl font-semibold leading-snug text-neutral-800 dark:text-slate-100 lg:text-2xl truncate min-w-0">{{ tituloSeccion || 'Sistema Recaudo' }}</h1>
            </div>
            </div>
          </div>

          <!-- Botones de configuración -->
          <div class="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              @click="toggleChat"
              class="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-slate-600 transition-theme"
              :title="$t('chatbot.title')"
            >
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-neutral-700 dark:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <rect x="3" y="1" width="18" height="12" rx="2" />
                <circle cx="8.5" cy="6.5" r="1.2" />
                <circle cx="15.5" cy="6.5" r="1.2" />
                <path d="M6 13v6a2 2 0 002 2h8a2 2 0 002-2v-6" />
                <path d="M12 13v3" stroke-linecap="round" />
                <circle cx="12" cy="18.5" r="1.2" />
              </svg>
              <span class="text-sm font-medium text-neutral-700 dark:text-slate-200 hidden sm:inline">{{ $t('chatbot.title') }}</span>
            </button>
            <div class="hidden md:flex items-center gap-2 sm:gap-2.5">
              <CompartirMensaje />
              <LanguageSelector />
            </div>
            <VendedorNotificationsBell />
            <ThemeToggle />
            <HeaderMoreMenu>
              <div class="flex items-center justify-between px-2 py-2 border-b border-neutral-200 dark:border-slate-600">
                <span class="text-sm font-semibold text-neutral-700 dark:text-slate-200 px-2">Más opciones</span>
              </div>
              <div class="flex items-center justify-center gap-2 py-3">
                <CompartirMensaje />
                <LanguageSelector />
              </div>
            </HeaderMoreMenu>
          </div>

    </div>
        <!-- Pagos guardados sin conexión (cola local) -->
        <div
          v-if="offlinePagoCount > 0"
          class="mx-3 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-amber-300/90 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/50 px-3 py-2"
        >
          <p class="text-xs sm:text-sm text-amber-950 dark:text-amber-100 font-medium min-w-0 leading-snug">
            {{ t('payment.offlineBanner', { count: offlinePagoCount }) }}
          </p>
          <div class="flex shrink-0 items-center gap-2">
            <button
              type="button"
              :disabled="syncingOffline || !navigatorOnline"
              class="px-3 py-1.5 rounded-lg text-sm font-semibold bg-amber-700 text-white hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="sincronizarPagosOffline"
            >
              {{ syncingOffline ? t('payment.syncing') : t('payment.syncNow') }}
            </button>
            <button
              type="button"
              :disabled="syncingOffline"
              class="px-3 py-1.5 rounded-lg text-sm font-semibold border border-amber-500/80 text-amber-950 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/70 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="descartarPagosOffline"
            >
              {{ t('payment.discardOfflineQueue') }}
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Reserva alto del header para que el contenido no quede bajo la barra fija (notch: safe-area) -->
    <div
      class="pointer-events-none shrink-0 select-none w-full h-[calc(4rem+env(safe-area-inset-top,0px))]"
      aria-hidden="true"
    />

    <!-- Sidebar + backdrop: Teleport a body para evitar que transform/overflow del padre rompan fixed y los clics -->
    <Teleport to="body">
      <div
        class="fixed inset-0 z-[100] lg:hidden"
        v-if="sidebarOpen"
        @click="closeSidebar"
      >
        <div class="absolute inset-0 bg-black/50 dark:bg-slate-950/80" />
      </div>
      <div
        class="fixed top-0 left-0 z-[101] h-full w-full max-w-[20rem] bg-white dark:bg-slate-800 border-r border-neutral-200 dark:border-slate-600 shadow-xl dark:shadow-slate-900/50 transform transition-all duration-300 ease-in-out flex flex-col"
        :class="sidebarOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'"
        :aria-hidden="!sidebarOpen"
      >
      <!-- Header del sidebar -->
      <div class="flex items-center justify-between p-4 border-b border-[#1E293B]/15 dark:border-[#1E293B]/50 shrink-0">
        <h2 class="text-xl font-semibold text-neutral-900 dark:text-slate-100">Menú</h2>
        <button 
          @click="closeSidebar"
          class="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-700 transition-theme"
        >
          <svg class="w-6 h-6 text-neutral-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Navegación principal -->
      <div class="p-4 space-y-2 flex-1 overflow-y-auto overscroll-contain sidebar-scroll">
        <h3 class="text-xs font-medium text-neutral-500 dark:text-slate-400 uppercase tracking-wider mb-4">Navegación</h3>
        
        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/vendedor') ? 'bg-neutral-100 dark:bg-slate-700 text-neutral-900 dark:text-slate-100 border-l-2 border-neutral-600 dark:border-slate-400' : 'text-neutral-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700',
            !rutaAbiertaLocal ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/vendedor')"
          :disabled="!rutaAbiertaLocal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 shrink-0 text-neutral-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <span class="font-semibold text-lg">{{ $t('nav.clients') }}</span>
        </button>

        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/ventas') ? 'bg-neutral-100 dark:bg-slate-700 text-neutral-900 dark:text-slate-100 border-l-2 border-neutral-600 dark:border-slate-400' : 'text-neutral-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700',
            !rutaAbiertaLocal ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/ventas')"
          :disabled="!rutaAbiertaLocal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 shrink-0 text-neutral-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          <span class="font-semibold text-lg">{{ $t('nav.sales') }}</span>
        </button>

        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/registros') ? 'bg-neutral-100 dark:bg-slate-700 text-neutral-900 dark:text-slate-100 border-l-2 border-neutral-600 dark:border-slate-400' : 'text-neutral-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700',
            !rutaAbiertaLocal ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/registros')"
          :disabled="!rutaAbiertaLocal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 shrink-0 text-neutral-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span class="font-semibold text-lg">{{ $t('nav.records') }}</span>
        </button>

        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/ingresos') ? 'bg-neutral-100 dark:bg-slate-700 text-neutral-900 dark:text-slate-100 border-l-2 border-neutral-600 dark:border-slate-400' : 'text-neutral-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700',
            !rutaAbiertaLocal ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/ingresos')"
          :disabled="!rutaAbiertaLocal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 shrink-0 text-neutral-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9a3 3 0 00-3-3H6a3 3 0 00-3 3v3" />
          </svg>
          <span class="font-semibold text-lg">{{ $t('nav.income') }}</span>
        </button>

        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/egresos') ? 'bg-neutral-100 dark:bg-slate-700 text-neutral-900 dark:text-slate-100 border-l-2 border-neutral-600 dark:border-slate-400' : 'text-neutral-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700',
            !rutaAbiertaLocal ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/egresos')"
          :disabled="!rutaAbiertaLocal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 shrink-0 text-neutral-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2 2 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C8.095 4.01 7.25 4.973 7.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h6.75c.621 0 1.125-.504 1.125-1.125V9.375a1.125 1.125 0 00-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
          <span class="font-semibold text-lg">{{ $t('nav.expenses') }}</span>
        </button>

        <!-- Historial de Clientes -->
        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/historial-clientes') ? 'bg-neutral-100 dark:bg-slate-700 text-neutral-900 dark:text-slate-100 border-l-2 border-neutral-600 dark:border-slate-400' : 'text-neutral-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700',
            !rutaAbiertaLocal ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/historial-clientes')"
          :disabled="!rutaAbiertaLocal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 shrink-0 text-neutral-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <span class="font-semibold text-lg">{{ $t('nav.clientHistory') }}</span>
        </button>

        <!-- Notas del Día -->
        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/notas-dia') ? 'bg-neutral-100 dark:bg-slate-700 text-neutral-900 dark:text-slate-100 border-l-2 border-neutral-600 dark:border-slate-400' : 'text-neutral-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700',
            !rutaAbiertaLocal ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/notas-dia')"
          :disabled="!rutaAbiertaLocal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 shrink-0 text-neutral-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span class="font-semibold text-lg">{{ $t('nav.notes') }}</span>
        </button>

        <!-- Resumen dentro del bloque principal -->
        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/resumen') ? 'bg-neutral-100 dark:bg-slate-700 text-neutral-900 dark:text-slate-100 border-l-2 border-neutral-600 dark:border-slate-400' : 'text-neutral-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700',
            !rutaAbiertaLocal ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/resumen')"
          :disabled="!rutaAbiertaLocal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 shrink-0 text-neutral-500 dark:text-slate-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
          </svg>
          <span class="font-semibold text-lg">{{ $t('nav.summary') }}</span>
        </button>
      </div>

      <!-- Acciones críticas -->
      <div class="p-4 border-t border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-neutral-100 dark:bg-slate-900 transition-theme shrink-0">
        <div class="space-y-3">
      <button
            @click="logout"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-theme border-2 border-neutral-400 dark:border-slate-400 bg-white dark:bg-slate-600 text-neutral-800 dark:text-slate-100 hover:bg-neutral-100 dark:hover:bg-slate-500 shadow-md"
      >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-neutral-600 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            <span class="font-semibold text-base">{{ $t('nav.logout') }}</span>
      </button>
          
      <button
            v-if="rutaAbierta"
            @click="cerrarRuta"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold border-2 border-red-800/60 shadow-md transition-colors"
      >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span class="font-semibold text-base">{{ $t('route.close') }}</span>
      </button>
        </div>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ThemeToggle from './ThemeToggle.vue';
import LanguageSelector from './LanguageSelector.vue';
import CompartirMensaje from './CompartirMensaje.vue';
import VendedorNotificationsBell from './VendedorNotificationsBell.vue';
import HeaderMoreMenu from './HeaderMoreMenu.vue';
import { toggleChat } from '../chatState.js';
import API_BASE_URL from '../config/api.js';
import { clearOfflinePagosPending, emitOfflinePagosChanged, getOfflinePendingCount } from '../utils/offlinePagoQueue.js';
import { syncAllPendingPagos } from '../utils/syncOfflinePagos.js';
import OfflineStatusBar from './OfflineStatusBar.vue';
import { forceSync } from '../utils/syncEngine.js';

const props = defineProps({
  rutaAbierta: Boolean,
  cargandoRuta: Boolean,
  tituloSeccion: String
});

const emit = defineEmits(['cerrar-ruta', 'logout']);

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const sidebarOpen = ref(false); // Cerrado por defecto
/** Sincronizado con la prop; evita menú habilitado cuando la ruta ya está cerrada */
const rutaAbiertaLocal = ref(!!props.rutaAbierta);

const offlinePagoCount = ref(0);
const syncingOffline = ref(false);
const navigatorOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);

async function refreshOfflinePagoCount() {
  try {
    offlinePagoCount.value = await getOfflinePendingCount();
  } catch {
    offlinePagoCount.value = 0;
  }
}

function onOfflinePagosChanged(ev) {
  const c = ev?.detail?.count;
  if (typeof c === 'number') offlinePagoCount.value = c;
  else void refreshOfflinePagoCount();
}

function onNetOnlineStatus() {
  navigatorOnline.value = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (navigatorOnline.value) void refreshOfflinePagoCount();
}

async function sincronizarPagosOffline() {
  if (syncingOffline.value || !navigatorOnline.value) return;
  syncingOffline.value = true;
  try {
    const r = await syncAllPendingPagos();
    await refreshOfflinePagoCount();
    if (r.synced > 0 || r.skippedDuplicate > 0 || r.discardedInvalid > 0) {
      let msg = r.skippedDuplicate > 0
        ? t('payment.syncDoneDup', { synced: r.synced, dup: r.skippedDuplicate })
        : t('payment.syncDone', { synced: r.synced });
      if (r.discardedInvalid > 0) {
        msg = `${msg} ${t('payment.syncDiscardedInvalid', { count: r.discardedInvalid })}`;
      }
      alert(msg);
    }
  } finally {
    syncingOffline.value = false;
  }
}

async function descartarPagosOffline() {
  if (syncingOffline.value) return;
  const ok = window.confirm(t('payment.discardOfflineQueueConfirm', { count: offlinePagoCount.value }));
  if (!ok) return;
  syncingOffline.value = true;
  try {
    await clearOfflinePagosPending();
    offlinePagoCount.value = 0;
    emitOfflinePagosChanged(0);
  } finally {
    syncingOffline.value = false;
  }
}

watch(
  () => props.rutaAbierta,
  (v) => {
    rutaAbiertaLocal.value = !!v;
  },
  { immediate: true }
);

let bodyScrollLock = { active: false, y: 0 };

function lockBodyScroll() {
  if (bodyScrollLock.active) return;
  const y = window.scrollY || 0;
  bodyScrollLock = { active: true, y };
  document.body.style.position = 'fixed';
  document.body.style.top = `-${y}px`;
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';
}

function unlockBodyScroll() {
  if (!bodyScrollLock.active) return;
  const y = bodyScrollLock.y || 0;
  bodyScrollLock = { active: false, y: 0 };
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  window.scrollTo(0, y);
}

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/');
}


function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
  if (sidebarOpen.value) {
    // Revalidar estado real de la ruta al abrir el sidebar (misma API que rutaUtils)
    try {
      const vendedorId = localStorage.getItem('vendedorId');
      if (!vendedorId) {
        rutaAbiertaLocal.value = false;
      } else {
        fetch(`${API_BASE_URL}/api/rutas/actual/${encodeURIComponent(vendedorId)}?_t=${Date.now()}`, { cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            // API devuelve null si no hay ruta abierta, o el documento de la ruta abierta
            rutaAbiertaLocal.value = !!(data && (data.abierta !== false));
          })
          .catch(() => {
            rutaAbiertaLocal.value = !!props.rutaAbierta;
          });
      }
    } catch {
      rutaAbiertaLocal.value = !!props.rutaAbierta;
    }
  }
}

function closeSidebar() {
  sidebarOpen.value = false;
}

function navigateTo(path) {
  if (rutaAbiertaLocal.value) {
    router.push(path);
    closeSidebar(); // Cerrar sidebar después de navegar
  }
}

function cerrarRuta() {
  emit('cerrar-ruta');
  closeSidebar();
}

function forzarSync() {
  forceSync()
}

function logout() {
  emit('logout');
  closeSidebar();
}

watch(sidebarOpen, (open) => {
  if (open) lockBodyScroll();
  else unlockBodyScroll();
});

onMounted(() => {
  void refreshOfflinePagoCount();
  window.addEventListener('offline-pagos-changed', onOfflinePagosChanged);
  window.addEventListener('online', onNetOnlineStatus);
  window.addEventListener('offline', onNetOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener('offline-pagos-changed', onOfflinePagosChanged);
  window.removeEventListener('online', onNetOnlineStatus);
  window.removeEventListener('offline', onNetOnlineStatus);
  unlockBodyScroll();
});
</script> 

<style scoped>
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.sidebar-scroll { -webkit-overflow-scrolling: touch; }
</style>
