<template>
  <div class="relative">
    <!-- Navbar principal -->
    <nav class="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Logo/Título -->
          <div class="flex items-center space-x-3">
      <button
              @click="toggleSidebar"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
              <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
      </button>
            <div class="flex items-center gap-2">
              <!-- Icono Clientes -->
              <svg v-if="route.path.includes('/vendedor') || route.path === '/vendedor'" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <!-- Icono Registros -->
              <svg v-else-if="route.path.includes('/registros')" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <!-- Icono Ingresos -->
              <svg v-else-if="route.path.includes('/ingresos')" class="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9a3 3 0 00-3-3H6a3 3 0 00-3 3v3" />
              </svg>
              <!-- Icono Egresos -->
              <svg v-else-if="route.path.includes('/egresos')" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2 2 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C8.095 4.01 7.25 4.973 7.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h6.75c.621 0 1.125-.504 1.125-1.125V9.375a1.125 1.125 0 00-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              <!-- Icono Historial Pagos -->
              <svg v-else-if="route.path.includes('/historial-pagos')" class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
              <!-- Icono Historial Clientes -->
              <svg v-else-if="route.path.includes('/historial-clientes')" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              <!-- Icono Resumen -->
              <svg v-else-if="route.path.includes('/resumen')" class="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
              <!-- Icono por defecto -->
              <svg v-else class="h-6 w-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <h1 class="text-lg font-semibold text-gray-800 dark:text-gray-100 lg:text-xl">{{ tituloSeccion || 'Sistema Recaudo' }}</h1>
            </div>
          </div>

          <!-- Botón de tema -->
          <div class="flex items-center space-x-2">
            <ThemeToggle />
          </div>

          <!-- Indicador de actualización -->
      <div v-if="actualizandoDatos" class="flex items-center text-blue-600 dark:text-blue-400 text-sm">
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Actualizando...
      </div>
    </div>
      </div>
    </nav>

    <!-- Sidebar -->
    <div 
      class="fixed inset-0 z-50 lg:hidden"
      v-if="sidebarOpen"
      @click="closeSidebar"
    >
      <div class="absolute inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70"></div>
    </div>

    <div 
      class="fixed top-0 left-0 z-50 w-80 h-full bg-white dark:bg-gray-900 shadow-xl transform transition-all duration-300 ease-in-out"
      :class="[
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Header del sidebar -->
      <div class="flex items-center justify-between p-4 border-b-2 border-gray-300 dark:border-gray-700">
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Menú</h2>
        <button 
          @click="closeSidebar"
          class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        >
          <svg class="w-6 h-6 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Navegación principal -->
      <div class="p-4 space-y-2">
        <h3 class="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">Navegación</h3>
        
        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/vendedor') ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-l-4 border-blue-600' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
            !rutaAbiertaLocal ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/vendedor')"
          :disabled="!rutaAbiertaLocal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <span class="font-semibold text-base">Clientes</span>
        </button>

        

        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/registros') ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 border-l-4 border-green-600' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
            !rutaAbiertaLocal ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/registros')"
          :disabled="!rutaAbiertaLocal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span class="font-semibold text-base">Registros</span>
        </button>

        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/ingresos') ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 border-l-4 border-green-600' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
            !rutaAbiertaLocal ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/ingresos')"
          :disabled="!rutaAbiertaLocal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9a3 3 0 00-3-3H6a3 3 0 00-3 3v3" />
          </svg>
          <span class="font-semibold text-base">Ingresos</span>
        </button>

        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/egresos') ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 border-l-4 border-yellow-600' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
            !rutaAbiertaLocal ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/egresos')"
          :disabled="!rutaAbiertaLocal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2 2 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C8.095 4.01 7.25 4.973 7.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h6.75c.621 0 1.125-.504 1.125-1.125V9.375a1.125 1.125 0 00-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
          <span class="font-semibold text-base">Egresos</span>
        </button>

        <!-- Historial de Pagos -->
        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/historial-pagos') ? 'bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100 border-l-4 border-orange-600' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
            !rutaAbiertaLocal ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/historial-pagos')"
          :disabled="!rutaAbiertaLocal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
          <span class="font-semibold text-base">Historial Pagos</span>
        </button>

        <!-- Historial de Clientes -->
        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/historial-clientes') ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100 border-l-4 border-indigo-600' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
            !rutaAbiertaLocal ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/historial-clientes')"
          :disabled="!rutaAbiertaLocal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <span class="font-semibold text-base">Historial Clientes</span>
        </button>

        <!-- Resumen dentro del bloque principal -->
        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/resumen') ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 border-l-4 border-purple-600' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
            !rutaAbiertaLocal ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/resumen')"
          :disabled="!rutaAbiertaLocal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
          </svg>
          <span class="font-semibold text-base">Resumen</span>
        </button>
      </div>

      <!-- Acciones críticas -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t-2 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div class="space-y-3">
      <button
            @click="logout"
            class="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
      >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            <span class="font-semibold text-base">Cerrar sesión</span>
      </button>
          
      <button
            v-if="rutaAbierta"
            @click="cerrarRuta"
            class="w-full flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
      >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span class="font-semibold text-base">Cerrar ruta</span>
      </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ThemeToggle from './ThemeToggle.vue';

const props = defineProps({
  rutaAbierta: Boolean,
  cargandoRuta: Boolean,
  actualizandoDatos: Boolean,
  tituloSeccion: String
});

const emit = defineEmits(['cerrar-ruta', 'logout']);

// Logs para debug
console.log('🔍 NavbarVendedor - Props recibidas:')
console.log('  - rutaAbierta:', props.rutaAbierta)
console.log('  - cargandoRuta:', props.cargandoRuta)
console.log('  - actualizandoDatos:', props.actualizandoDatos)
console.log('🔍 NavbarVendedor - Condición del botón Cerrar ruta:')
console.log('  - rutaAbierta && !cargandoRuta:', props.rutaAbierta && !props.cargandoRuta)
console.log('  - Solo rutaAbierta:', props.rutaAbierta)

const route = useRoute();
const router = useRouter();
const sidebarOpen = ref(false); // Cerrado por defecto
const rutaAbiertaLocal = ref(true);

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/');
}


function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
  if (sidebarOpen.value) {
    // Revalidar estado real de la ruta al abrir el sidebar
    try {
      const vendedorId = localStorage.getItem('vendedorId');
      if (!vendedorId) {
        rutaAbiertaLocal.value = false;
      } else {
        fetch(`${location.origin.includes('vercel.app') ? 'https://sistema-cobranza-backend.onrender.com' : ''}/api/rutas/actual/${vendedorId}`)
          .then(r => r.json())
          .then(data => { rutaAbiertaLocal.value = !!data; })
          .catch(() => { rutaAbiertaLocal.value = false; });
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

function logout() {
  emit('logout');
  closeSidebar();
}
</script> 

<style scoped>
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>