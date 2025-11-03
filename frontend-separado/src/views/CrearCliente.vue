<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
      <!-- Header -->
      <nav class="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">
        <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">Nuevo Cliente</h1>
        <button
          @click="volver"
          class="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-600 dark:hover:bg-gray-700 transition"
        >
          Volver
        </button>
      </nav>
  
      <!-- Formulario -->
      <div class="p-4">
        <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded shadow p-6">
          <form @submit.prevent="crearCliente">
            <div class="grid grid-cols-1 md:grid-co+ls-2 gap-4">
              <!-- Nombre(s) -->
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-2">Nombre(s)</label>
                <input
                  v-model="cliente.nombres"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500"
                  required
                />
              </div>
  
              <!-- Apellido(s) -->
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-2">Apellido(s)</label>
                <input
                  v-model="cliente.apellidos"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500"
                  required
                />
              </div>
  
              <!-- CC -->
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-2">CC</label>
                <input
                  v-model="cliente.cc"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500"
                  required
                />
              </div>
  
              <!-- Apodo -->
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-2">Apodo</label>
                <input
                  v-model="cliente.apodo"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500"
                />
              </div>
  
              <!-- Celular -->
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-2">Celular</label>
                <input
                  v-model="cliente.celular"
                  type="tel"
                  class="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500"
                  required
                />
              </div>
  
              <!-- Valor del préstamo -->
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-2">Valor del producto</label>
                <input
                  v-model="cliente.valor"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500 appearance-none no-spinner"
                  required
                  @wheel="e => e.target.blur()"
                />
              </div>
  
              <!-- Número de Parcelas -->
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-2">Número de Parcelas</label>
                <select
                  v-model="cliente.parcelas"
                  class="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500"
                  required
                >
                  <option value="">Seleccione</option>
                  <option v-for="n in 99" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>

              <!-- Frecuencia de Pago -->
              <div>
                <label class="block text-gray-700 dark:text-gray-300 mb-2">Frecuencia de Pago</label>
                <select
                  v-model="cliente.frecuencia"
                  class="w-full px-3 py-2 border-2 border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 dark:focus:border-blue-500"
                  required
                >
                  <option value="">Seleccione frecuencia</option>
                  <option value="diaria">Diaria</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>
            </div>
  
            <!-- Información de interés y total -->
            <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-700 dark:text-gray-300 font-semibold">Interés aplicado:</span>
                <span class="text-lg font-bold text-black dark:text-white">
                  {{ interesAplicado }}%
                </span>
              </div>
              
            </div>

            <!-- Total a pagar (como texto resaltado) -->
            <div class="flex items-end mt-4" v-if="totalAPagar">
              <span class="block text-gray-700 dark:text-gray-300 mb-1 font-semibold mr-2">Total a pagar:</span>
              <span class="text-2xl font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-4 py-1 rounded shadow">
                ${{ totalAPagar }}
              </span>
            </div>

            <!-- Valor de la parcela -->
            <div class="flex items-end mt-2" v-if="valorParcela">
              <span class="block text-gray-700 dark:text-gray-300 mb-1 font-semibold mr-2">Valor por parcela:</span>
              <span class="text-xl font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-4 py-1 rounded shadow">
                ${{ valorParcela }}
              </span>
            </div>
  
            <!-- Dirección Comercial con autocompletado -->
            <div class="mt-4">
              <label class="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">Dirección Comercial</label>
              <div class="relative flex gap-2">
                <div class="flex-1 relative">
                  <input
                    v-model="cliente.direccion"
                    @input="onInputDireccion('comercial')"
                    @focus="onFocusDireccion('comercial')"
                    @blur="onBlurDireccion('comercial')"
                    type="text"
                    placeholder="Ingresa la dirección comercial del cliente..."
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
                  class="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded hover:bg-green-600 dark:hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  Mi ubicación
                </button>
                <button
                  v-if="coordenadasComercial"
                  type="button"
                  @click="comprobarDireccion('comercial')"
                  class="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Comprobar dirección
                </button>
              </div>
            </div>

            <!-- Dirección Residencial con autocompletado -->
            <div class="mt-6">
              <label class="block text-gray-700 dark:text-gray-300 mb-2 font-semibold">Dirección Residencial</label>
              <div class="relative flex gap-2">
                <div class="flex-1 relative">
                  <input
                    v-model="cliente.direccion_residencial"
                    @input="onInputDireccion('residencial')"
                    @focus="onFocusDireccion('residencial')"
                    @blur="onBlurDireccion('residencial')"
                    type="text"
                    placeholder="Ingresa la dirección residencial del cliente..."
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
                  class="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded hover:bg-green-600 dark:hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  Mi ubicación
                </button>
                <button
                  v-if="coordenadasResidencial"
                  type="button"
                  @click="comprobarDireccion('residencial')"
                  class="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Comprobar dirección
                </button>
              </div>
            </div>
  
            <!-- Botones -->
            <div class="mt-6 flex space-x-4">
              <button
                type="submit"
                class="flex-1 bg-blue-500 dark:bg-blue-600 text-white py-3 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition"
              >
                Crear Cliente
              </button>
              <button
                type="button"
                @click="volver"
                class="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-3 rounded hover:bg-gray-400 dark:hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>

import API_BASE_URL from '../config/api.js'
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
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
    frecuencia: ''
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

  // Calcular interés según número de parcelas
  const interesAplicado = computed(() => {
    const parcelas = parseInt(cliente.value.parcelas) || 0
    return parcelas <= 11 ? 10 : 20
  })

  const totalAPagar = computed(() => {
    const valor = parseFloat(cliente.value.valor) || 0
    const parcelas = parseInt(cliente.value.parcelas) || 0
    const interes = interesAplicado.value / 100
    return valor > 0 && parcelas > 0 ? (valor + valor * interes).toFixed(2) : ''
  })

  const valorParcela = computed(() => {
    const total = parseFloat(totalAPagar.value) || 0
    const parcelas = parseInt(cliente.value.parcelas) || 0
    return total > 0 && parcelas > 0 ? (total / parcelas).toFixed(2) : ''
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
  async function miUbicacion(tipo) {
    if (!navigator.geolocation) {
      alert('Geolocalización no soportada en este dispositivo')
      return
    }
    try {
      const posicion = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        })
      })
      const lat = posicion.coords.latitude
      const lng = posicion.coords.longitude
      // reverse geocoding
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
    } catch (e) {
      alert('No fue posible obtener la ubicación actual')
    }
  }
  
  async function crearCliente() {
  // Formato de fecha: aa/mm/dd hh:mm
  const now = new Date();
  const fecha = `${now.getFullYear().toString().slice(2)}/` +
    `${String(now.getMonth() + 1).padStart(2, '0')}/` +
    `${String(now.getDate()).padStart(2, '0')} ` +
    `${String(now.getHours()).padStart(2, '0')}:` +
    `${String(now.getMinutes()).padStart(2, '0')}`;

  // Calcular total y parcela
  const valor = parseFloat(cliente.value.valor) || 0;
  const parcelas = parseInt(cliente.value.parcelas) || 0;
  const interes = interesAplicado.value / 100;
  const total = valor + valor * interes;
  const valorParcelaCalculado = parcelas > 0 ? (total / parcelas) : 0;

  // Obtener el id del vendedor (ajusta la clave si usas otra)
  const vendedorId = localStorage.getItem('vendedorId');

  const nuevoCliente = {
    ...cliente.value,
    dias: Number(cliente.value.parcelas), // enviar como 'dias' para el backend
    frecuencia: cliente.value.frecuencia, // frecuencia de pago
    interes: interesAplicado.value, // interés aplicado
    fecha,
    total: Number(total.toFixed(2)),
    parcela: Number(valorParcelaCalculado.toFixed(2)),
    saldo_inicial: Number(total.toFixed(2)),
    vendedor: vendedorId,
    renovado: !!cliente.value.renovado,
    // Coordenadas de las direcciones
    coordenadas_comercial: coordenadasComercial.value,
    coordenadas_residencial: coordenadasResidencial.value
  };
  // Eliminar el campo 'parcelas' si existe
  delete nuevoCliente.parcelas;

  try {
    console.log('📤 Enviando datos del cliente:', nuevoCliente);
    const res = await fetch(`${API_BASE_URL}/api/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoCliente)
    });
    
    const data = await res.json();
    console.log('📥 Respuesta del servidor:', data);
    
    if (res.ok) {
      // Si es renovación, eliminar el cliente anterior
      if (route.query.idAnterior) {
        await fetch(`${API_BASE_URL}/api/clientes/${route.query.idAnterior}`, {
          method: 'DELETE'
        });
      }
      alert(`Cliente ${cliente.value.nombres} ${cliente.value.apellidos} creado exitosamente`);
      router.push('/vendedor');
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

onMounted(() => {
  // Si hay datos en la query, autocompleta el formulario
  const q = route.query
  if (q.nombres) cliente.value.nombres = q.nombres
  if (q.apellidos) cliente.value.apellidos = q.apellidos
  if (q.cc) cliente.value.cc = q.cc
  if (q.apodo) cliente.value.apodo = q.apodo
  if (q.celular) cliente.value.celular = q.celular
  if (q.direccion) cliente.value.direccion = q.direccion
  if (q.direccion_residencial) cliente.value.direccion_residencial = q.direccion_residencial
  if (q.renovado) cliente.value.renovado = true
})
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