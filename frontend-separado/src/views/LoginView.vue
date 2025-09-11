<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <!-- Contenedor principal -->
    <div class="w-full max-w-md mx-4">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-16 h-16 text-white">
            <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM6.262 6.072a8.25 8.25 0 1 0 10.562-.766 4.5 4.5 0 0 1-1.318 1.357L14.25 7.5l.165.33a.809.809 0 0 1-1.086 1.085l-.604-.302a1.125 1.125 0 0 0-1.298.21l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 0 1-2.288 4.04l-.723.724a1.125 1.125 0 0 1-1.298.21l-.153-.076a1.125 1.125 0 0 1-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 0 1-.21-1.298L9.75 12l-1.64-1.64a6 6 0 0 1-1.676-3.257l-.172-1.03Z" clip-rule="evenodd" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Bienvenido</h1>
        <p class="text-gray-600">Ingresa a tu cuenta</p>
      </div>

      <!-- Formulario -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <form @submit.prevent="login" class="space-y-6">
          <!-- Campo Usuario -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2" for="usuario">
              Usuario
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <input
                v-model="usuario"
                id="usuario"
                type="text"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition duration-200"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>
          </div>

          <!-- Campo Contraseña -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2" for="contrasena">
              Contraseña
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <input
                v-model="contrasena"
                id="contrasena"
                type="password"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent transition duration-200"
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>
          </div>

          <!-- Botón de Login -->
          <button
            type="submit"
            class="w-full bg-blue-800 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 transition duration-200 shadow-lg"
          >
            Iniciar Sesión
          </button>

          <!-- Mensaje de error -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>
        </form>

        <!-- Información adicional -->
        <div class="mt-6 text-center">
          <p class="text-xs text-gray-400">
            Sistema de Gestión Empresarial
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import API_BASE_URL from '../config/api.js'

const usuario = ref('')
const contrasena = ref('')
const error = ref('')
const router = useRouter()

const login = async () => {
  error.value = ''
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: usuario.value, contrasena: contrasena.value })
    })
    const data = await response.json()
    if (data.exito) {
      localStorage.setItem('rol', data.rol)
      localStorage.setItem('codigoVinculacion', data.codigoVinculacion) // Guarda el código de vinculación
      if (data.rol === 'administrador') {
        localStorage.setItem('adminId', data.id) // Guarda el ID del administrador
        router.push('/admin')
      } else {
        localStorage.setItem('vendedorId', data.id) // Guarda el ID del vendedor
        router.push('/vendedor')
      }
} else {
      error.value = data.mensaje
    }
  } catch (e) {
    error.value = 'Error de conexión con el servidor'
  }
}
</script>