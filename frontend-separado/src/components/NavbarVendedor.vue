<template>
  <div class="relative">
    <!-- Navbar principal -->
    <nav class="bg-white shadow-lg border-b">
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Logo/Título -->
          <div class="flex items-center space-x-3">
            <button
              @click="toggleSidebar"
              class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <h1 class="text-lg font-semibold text-gray-800 lg:text-xl">Sistema Recaudo</h1>
          </div>

          <!-- Indicador de actualización -->
          <div v-if="actualizandoDatos" class="flex items-center text-blue-600 text-sm">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
    </div>

    <div 
      class="fixed top-0 left-0 z-50 w-80 h-full bg-white shadow-xl transform transition-all duration-300 ease-in-out"
      :class="[
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Header del sidebar -->
      <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-lg font-semibold text-gray-800 lg:text-base">Menú</h2>
        <button 
          @click="closeSidebar"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Navegación principal -->
      <div class="p-4 space-y-2">
        <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Navegación</h3>
        
        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/vendedor') ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-500' : 'text-gray-700 hover:bg-gray-100',
            !rutaAbierta ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/vendedor')"
          :disabled="!rutaAbierta"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Clientes</span>
        </button>

        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/registros') ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 'text-gray-700 hover:bg-gray-100',
            !rutaAbierta ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/registros')"
          :disabled="!rutaAbierta"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2v-5a2 2 0 00-2-2h-1V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v7H7a2 2 0 00-2 2v5a2 2 0 002 2z" />
          </svg>
          <span>Registros</span>
        </button>

        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/ingresos') ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 'text-gray-700 hover:bg-gray-100',
            !rutaAbierta ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/ingresos')"
          :disabled="!rutaAbierta"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
          <span>Ingresos</span>
        </button>

        <button
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
          :class="[
            isActive('/egresos') ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500' : 'text-gray-700 hover:bg-gray-100',
            !rutaAbierta ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          @click="navigateTo('/egresos')"
          :disabled="!rutaAbierta"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 7v7m0 0h4m-4 0H8" />
          </svg>
          <span>Egresos</span>
        </button>
      </div>

      <!-- Acciones críticas -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
        <div class="space-y-2">
          <button
            v-if="rutaAbierta && !cargandoRuta"
            @click="cerrarRuta"
            class="w-full flex items-center gap-3 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Cerrar ruta</span>
          </button>
          
          <button
            @click="logout"
            class="w-full flex items-center gap-3 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  rutaAbierta: Boolean,
  cargandoRuta: Boolean,
  actualizandoDatos: Boolean
});

const emit = defineEmits(['cerrar-ruta', 'logout']);

const route = useRoute();
const router = useRouter();
const sidebarOpen = ref(false); // Cerrado por defecto

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/');
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

function closeSidebar() {
  sidebarOpen.value = false;
}

function navigateTo(path) {
  if (props.rutaAbierta) {
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