<template>
    <div class="min-h-screen bg-gray-100">
      <!-- Header -->
      <nav class="bg-white shadow p-4 flex justify-between items-center">
        <h1 class="text-xl font-bold">Nuevo Cliente</h1>
        <button
          @click="volver"
          class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
        >
          Volver
        </button>
      </nav>
  
      <!-- Formulario -->
      <div class="p-4">
        <div class="max-w-2xl mx-auto bg-white rounded shadow p-6">
          <form @submit.prevent="crearCliente">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Nombre(s) -->
              <div>
                <label class="block text-gray-700 mb-2">Nombre(s)</label>
                <input
                  v-model="cliente.nombres"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-gray-400 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400"
                  required
                />
              </div>
  
              <!-- Apellido(s) -->
              <div>
                <label class="block text-gray-700 mb-2">Apellido(s)</label>
                <input
                  v-model="cliente.apellidos"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-gray-400 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400"
                  required
                />
              </div>
  
              <!-- CC -->
              <div>
                <label class="block text-gray-700 mb-2">CC</label>
                <input
                  v-model="cliente.cc"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-gray-400 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400"
                  required
                />
              </div>
  
              <!-- Apodo -->
              <div>
                <label class="block text-gray-700 mb-2">Apodo</label>
                <input
                  v-model="cliente.apodo"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-gray-400 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400"
                />
              </div>
  
              <!-- Celular -->
              <div>
                <label class="block text-gray-700 mb-2">Celular</label>
                <input
                  v-model="cliente.celular"
                  type="tel"
                  class="w-full px-3 py-2 border-2 border-gray-400 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400"
                  required
                />
              </div>
  
              <!-- Valor del préstamo -->
              <div>
                <label class="block text-gray-700 mb-2">Valor del producto</label>
                <input
                  v-model="cliente.valor"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border-2 border-gray-400 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 appearance-none no-spinner"
                  required
                  @wheel="e => e.target.blur()"
                />
              </div>
  
              <!-- Número de Parcelas -->
              <div>
                <label class="block text-gray-700 mb-2">Número de Parcelas</label>
                <select
                  v-model="cliente.parcelas"
                  class="w-full px-3 py-2 border-2 border-gray-400 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400"
                  required
                >
                  <option value="">Seleccione</option>
                  <option v-for="n in 99" :key="n" :value="n">{{ n }}</option>
                </select>
              </div>

              <!-- Frecuencia de Pago -->
              <div>
                <label class="block text-gray-700 mb-2">Frecuencia de Pago</label>
                <select
                  v-model="cliente.frecuencia"
                  class="w-full px-3 py-2 border-2 border-gray-400 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400"
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
            <div class="mt-4 p-4 bg-blue-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-700 font-semibold">Interés aplicado:</span>
                <span class="text-lg font-bold text-black">
                  {{ interesAplicado }}%
                </span>
              </div>
              
            </div>

            <!-- Total a pagar (como texto resaltado) -->
            <div class="flex items-end mt-4" v-if="totalAPagar">
              <span class="block text-gray-700 mb-1 font-semibold mr-2">Total a pagar:</span>
              <span class="text-2xl font-bold text-green-600 bg-green-100 px-4 py-1 rounded shadow">
                ${{ totalAPagar }}
              </span>
            </div>

            <!-- Valor de la parcela -->
            <div class="flex items-end mt-2" v-if="valorParcela">
              <span class="block text-gray-700 mb-1 font-semibold mr-2">Valor por parcela:</span>
              <span class="text-xl font-bold text-blue-600 bg-blue-100 px-4 py-1 rounded shadow">
                ${{ valorParcela }}
              </span>
            </div>
  
            <!-- Dirección Comercial (ocupa toda la fila) -->
            <div class="mt-4">
              <label class="block text-gray-700 mb-2">Dirección Comercial</label>
              <textarea
                v-model="cliente.direccion"
                class="w-full px-3 py-2 border-2 border-gray-400 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 resize-none"
                rows="1"
                required
              ></textarea>
            </div>

            <!-- Dirección Residencial (ocupa toda la fila) -->
            <div class="mt-4">
              <label class="block text-gray-700 mb-2">Dirección Residencial</label>
              <textarea
                v-model="cliente.direccion_residencial"
                class="w-full px-3 py-2 border-2 border-gray-400 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:border-blue-400 resize-none"
                rows="1"
                required
              ></textarea>
            </div>
  
            <!-- Botones -->
            <div class="mt-6 flex space-x-4">
              <button
                type="submit"
                class="flex-1 bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition"
              >
                Crear Cliente
              </button>
              <button
                type="button"
                @click="volver"
                class="flex-1 bg-gray-300 text-gray-700 py-3 rounded hover:bg-gray-400 transition"
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
    renovado: !!cliente.value.renovado
  };
  // Eliminar el campo 'parcelas' si existe
  delete nuevoCliente.parcelas;

  try {
    const res = await fetch(`${API_BASE_URL}/api/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoCliente)
    });
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
      alert('Error al crear cliente');
    }
  } catch (e) {
    alert('Error de conexión con el servidor');
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
  }
  </style>