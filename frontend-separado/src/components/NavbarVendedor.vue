<template>
  <nav class="bg-white shadow p-4 flex justify-between items-center">
    <div class="flex space-x-4 items-center">
      <button
        class="flex items-center gap-2 px-4 py-2 rounded shadow-sm transition border-b-4"
        :class="[
          isActive('/vendedor') ? 'bg-blue-500 text-white border-blue-700 shadow-lg' : 'bg-blue-100 text-blue-800 border-transparent hover:bg-blue-200',
          'focus:outline-none'
        ]"
        @click="$router.push('/vendedor')"
        :disabled="!rutaAbierta"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        Clientes
      </button>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded shadow-sm transition border-b-4"
        :class="[
          isActive('/registros') ? 'bg-green-600 text-white border-green-800 shadow-lg' : 'bg-green-100 text-green-800 border-transparent hover:bg-green-200',
          'focus:outline-none'
        ]"
        @click="$router.push('/registros')"
        :disabled="!rutaAbierta"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2v-5a2 2 0 00-2-2h-1V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v7H7a2 2 0 00-2 2v5a2 2 0 002 2z" /></svg>
        Registros
      </button>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded shadow-sm transition border-b-4"
        :class="[
          isActive('/ingresos') ? 'bg-green-600 text-white border-green-800 shadow-lg' : 'bg-green-100 text-green-800 border-transparent hover:bg-green-200',
          'focus:outline-none'
        ]"
        @click="$router.push('/ingresos')"
        :disabled="!rutaAbierta"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
        Ingresos
      </button>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded shadow-sm transition border-b-4"
        :class="[
          isActive('/egresos') ? 'bg-yellow-600 text-white border-yellow-800 shadow-lg' : 'bg-yellow-100 text-yellow-800 border-transparent hover:bg-yellow-200',
          'focus:outline-none'
        ]"
        @click="$router.push('/egresos')"
        :disabled="!rutaAbierta"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 7v7m0 0h4m-4 0H8" /></svg>
        Egresos
      </button>
      <div v-if="actualizandoDatos" class="flex items-center text-blue-600 text-sm">
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Actualizando...
      </div>
    </div>
    <div class="flex gap-2">
      <button
        v-if="rutaAbierta && !cargandoRuta"
        @click="$emit('cerrar-ruta')"
        class="bg-yellow-500 text-white px-4 py-2 rounded font-bold hover:bg-yellow-600 transition"
      >
        Cerrar ruta
      </button>
      <button
        @click="$emit('logout')"
        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        Cerrar sesión
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router';
const props = defineProps({
  rutaAbierta: Boolean,
  cargandoRuta: Boolean,
  actualizandoDatos: Boolean
});
const route = useRoute();
function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/');
}
</script> 