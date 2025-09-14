<template>
  <div class="min-h-screen bg-gray-50">
    <NavbarVendedor 
      :ruta-abierta="rutaAbierta"
      :cargando-ruta="false"
      :actualizando-datos="false"
      @logout="logout" 
      @cerrar-ruta="cerrarRuta"
    />
    
    <div class="max-w-4xl mx-auto p-4">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Ingresos</h1>
        
        <!-- Formulario para registrar ingreso -->
        <div v-if="!rutaAbierta" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div class="text-center">
            <p class="text-yellow-800 font-medium">No hay una ruta activa</p>
            <p class="text-yellow-600 text-sm mt-1">Debes abrir una ruta desde el dashboard para poder registrar ingresos</p>
          </div>
        </div>
        
        <div v-else class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h2 class="text-lg font-semibold text-green-800 mb-4">Registrar Nuevo Ingreso</h2>
          
          <form @submit.prevent="registrarIngreso" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Ingreso</label>
                <select 
                  v-model="nuevoIngreso.tipo" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Base">Base</option>
                  <option value="Otros ingresos">Otros ingresos</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                <input 
                  type="text" 
                  v-model="nuevoIngreso.valor" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                  required
                  @input="validarValor"
                />
              </div>
            </div>
            
            <div v-if="nuevoIngreso.tipo === 'Otros ingresos'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea 
                v-model="nuevoIngreso.descripcion" 
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción del ingreso..."
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              :disabled="registrando"
            >
              <span v-if="registrando">Registrando...</span>
              <span v-else>Registrar Ingreso</span>
            </button>
          </form>
        </div>
        
        <!-- Lista de ingresos registrados -->
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 class="text-lg font-semibold text-green-800 mb-4">Ingresos Registrados</h2>
          
          <div v-if="ingresos.length === 0" class="text-gray-500 text-center py-8">
            No hay ingresos registrados en esta ruta
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="ingreso in ingresos" 
              :key="ingreso._id"
              class="bg-white border border-green-200 rounded-lg p-4 flex justify-between items-center"
            >
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm font-medium text-gray-600">{{ ingreso.tipo }}</span>
                  <span class="text-xs text-gray-400">{{ new Date(ingreso.fecha).toLocaleString('es-ES') }}</span>
                </div>
                <div v-if="ingreso.descripcion" class="text-sm text-gray-600">
                  {{ ingreso.descripcion }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-green-600">
                  ${{ ingreso.valor.toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import API_BASE_URL from '../config/api.js'

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavbarVendedor from '../components/NavbarVendedor.vue'

const router = useRouter()
const ingresos = ref([])
const registrando = ref(false)
const rutaAbierta = ref(false)
const nuevoIngreso = ref({
  tipo: 'Base',
  valor: '',
  descripcion: ''
 })

// Cargar ingresos al montar
onMounted(async () => {
  await cargarIngresos()
})

async function cargarIngresos() {
  try {
    const vendedorId = localStorage.getItem('vendedorId')
    if (!vendedorId) return

    // Obtener la ruta activa
    const resRuta = await fetch(`${API_BASE_URL}/api/rutas/actual/${vendedorId}`)
    const ruta = await resRuta.json()
    
    if (!ruta) {
      ingresos.value = []
      rutaAbierta.value = false
      return
    }

    // Marcar que hay una ruta abierta
    rutaAbierta.value = true

    // Obtener ingresos de la ruta
    const res = await fetch(`${API_BASE_URL}/api/ingresos?ruta=${ruta._id}`)
    if (res.ok) {
      ingresos.value = await res.json()
    }
  } catch (error) {
    console.error('Error al cargar ingresos:', error)
    ingresos.value = []
    rutaAbierta.value = false
  }
}

function validarValor(event) {
  // Solo permitir números y punto decimal
  const valor = event.target.value
  const regex = /^[0-9]*\.?[0-9]*$/
  
  if (!regex.test(valor)) {
    // Si no es válido, revertir al último valor válido
    event.target.value = valor.replace(/[^0-9.]/g, '')
  }
  
  // Evitar múltiples puntos decimales
  const puntos = valor.split('.').length - 1
  if (puntos > 1) {
    event.target.value = valor.replace(/\.+$/, '')
  }
}

async function registrarIngreso() {
  try {
    registrando.value = true
    
    const vendedorId = localStorage.getItem('vendedorId')
    if (!vendedorId) {
      alert('No se pudo identificar al vendedor')
      return
    }

    // Obtener la ruta activa
    const resRuta = await fetch(`${API_BASE_URL}/api/rutas/actual/${vendedorId}`)
    const ruta = await resRuta.json()
    
    if (!ruta) {
      alert('No hay una ruta activa. Debes abrir una ruta primero.')
      return
    }

    const ingresoData = {
      vendedor: vendedorId,
      ruta: ruta._id,
      tipo: nuevoIngreso.value.tipo,
      valor: Number(nuevoIngreso.value.valor),
      descripcion: nuevoIngreso.value.descripcion || undefined
    }

    const res = await fetch(`${API_BASE_URL}/api/ingresos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ingresoData)
    })

    if (res.ok) {
      // Limpiar formulario
      nuevoIngreso.value = {
        tipo: 'Base',
        valor: '',
        descripcion: ''
      }
      
      // Recargar ingresos
      await cargarIngresos()
      
      alert('Ingreso registrado exitosamente')
    } else {
      const error = await res.json()
      alert(`Error al registrar ingreso: ${error.error}`)
    }
  } catch (error) {
    console.error('Error al registrar ingreso:', error)
    alert('Error al registrar ingreso')
  } finally {
    registrando.value = false
  }
}

function logout() {
  try {
    localStorage.removeItem('rol')
    localStorage.removeItem('adminId')
    localStorage.removeItem('vendedorId')
    localStorage.removeItem('codigoVinculacion')
  } catch (e) {
    console.warn('No se pudo limpiar storage:', e)
  }
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

async function cerrarRuta() {
  try {
    const vendedorId = localStorage.getItem('vendedorId')
    if (!vendedorId) return

    const res = await fetch(`${API_BASE_URL}/api/rutas/cerrar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ vendedorId })
    })

    if (res.ok) {
      alert('Ruta cerrada exitosamente')
      router.push('/vendedor')
    }
  } catch (error) {
    console.error('Error al cerrar ruta:', error)
    alert('Error al cerrar ruta')
  }
}
</script> 