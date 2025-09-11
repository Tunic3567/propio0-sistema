<template>
  <nav class="bg-white shadow p-4 flex justify-between items-center">
    <div class="flex space-x-4 items-center">
      <button
        class="flex items-center gap-2 px-4 py-2 rounded shadow-sm transition border-b-4"
        :class="[
          isActive('/admin') ? 'bg-blue-500 text-white border-blue-700 shadow-lg' : 'bg-blue-100 text-blue-800 border-transparent hover:bg-blue-200',
          'focus:outline-none'
        ]"
        @click="$router.push('/admin')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V6a4 4 0 00-8 0v4m12 4v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 012-2h12a2 2 0 012 2z" /></svg>
        Clientes
      </button>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded shadow-sm transition border-b-4"
        :class="[
          isActive('/admin/pagos') ? 'bg-green-600 text-white border-green-800 shadow-lg' : 'bg-green-100 text-green-800 border-transparent hover:bg-green-200',
          'focus:outline-none'
        ]"
        @click="$router.push('/admin/pagos')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 7v7m0 0h4m-4 0H8" /></svg>
        Historial de Rutas
      </button>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded shadow-sm transition border-b-4"
        :class="[
          isActive('/admin/ingresos') ? 'bg-green-600 text-white border-green-800 shadow-lg' : 'bg-green-100 text-green-800 border-transparent hover:bg-green-200',
          'focus:outline-none'
        ]"
        @click="$router.push('/admin/ingresos')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
        Ingresos
      </button>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded shadow-sm transition border-b-4"
        :class="[
          isActive('/admin/egresos') ? 'bg-yellow-600 text-white border-yellow-800 shadow-lg' : 'bg-yellow-100 text-yellow-800 border-transparent hover:bg-yellow-200',
          'focus:outline-none'
        ]"
        @click="$router.push('/admin/egresos')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2v-5a2 2 0 00-2-2h-1V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v7H7a2 2 0 00-2 2v5a2 2 0 002 2z" /></svg>
        Egresos
      </button>
    </div>
    <button
      @click="$emit('logout')"
      class="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
      Cerrar sesión
    </button>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
function isActive(path) {
  if (path === '/admin') {
    return route.path === '/admin';
  }
  return route.path === path || route.path.startsWith(path + '/');
}
</script> 