<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <NavbarVendedor 
      :ruta-abierta="rutaAbierta"
      :cargando-ruta="false"
      :actualizando-datos="false"
      titulo-seccion="Ingresos"
      @logout="logout" 
      @cerrar-ruta="cerrarRuta"
    />
    
    <div class="max-w-4xl mx-auto p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
        <div class="flex items-center justify-between mb-6" v-if="rutaAbierta || cargandoRuta">
          <!-- Título movido al header -->
        </div>
        
        <!-- Formulario para registrar ingreso -->
        <div v-if="!rutaAbierta" class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6 transition-colors duration-300">
          <div class="text-center">
            <p class="text-yellow-800 dark:text-yellow-200 font-medium">No hay una ruta activa</p>
            <p class="text-yellow-600 dark:text-yellow-300 text-sm mt-1">Debes abrir una ruta desde el dashboard para poder registrar ingresos</p>
          </div>
        </div>
        
        <div v-else-if="ingresos.length === 0" class="bg-green-50 dark:bg-gray-800 border border-green-200 dark:border-gray-600 rounded-lg p-4 mb-6 transition-colors duration-300">
          <h2 class="text-lg font-semibold text-green-800 dark:text-gray-100 mb-4">Registrar Nuevo Ingreso</h2>
          
          <form @submit.prevent="registrarIngreso" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Ingreso</label>
                <select 
                  v-model="nuevoIngreso.tipo" 
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="Base">Base</option>
                  <option value="Otros ingresos">Otros ingresos</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valor</label>
                <input 
                  type="text" 
                  v-model="nuevoIngreso.valor" 
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="0.00"
                  required
                  @input="validarValor"
                />
              </div>
            </div>
            
            <div v-if="nuevoIngreso.tipo === 'Otros ingresos'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
              <textarea 
                v-model="nuevoIngreso.descripcion" 
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
        <div v-else class="bg-blue-50 dark:bg-blue-800/70 border border-blue-200 dark:border-blue-600 rounded-lg p-4 mb-6 transition-colors duration-300">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-blue-800 dark:text-blue-200">Ya existe un ingreso en la ruta</h2>
            <span class="text-xs text-blue-700 dark:text-blue-300">Puedes editarlo en la lista de abajo</span>
          </div>
        </div>
        
        <!-- Lista de ingresos registrados -->
        <div class="bg-green-50 dark:bg-gray-800 border border-green-200 dark:border-gray-600 rounded-lg p-4 transition-colors duration-300">
          <h2 class="text-lg font-semibold text-green-800 dark:text-gray-100 mb-4">Ingresos Registrados</h2>
          
          <div v-if="ingresos.length === 0" class="text-gray-500 dark:text-gray-400 text-center py-8">
            No hay ingresos registrados en esta ruta
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="ingreso in ingresos" 
              :key="ingreso._id"
              class="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-600 rounded-lg p-4 transition-colors duration-300"
            >
              <div class="flex justify-between items-center">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-300">{{ ingreso.tipo }}</span>
                    <span class="text-xs text-gray-400 dark:text-gray-500">{{ new Date(ingreso.fecha).toLocaleString('es-ES') }}</span>
                  </div>
                  <div v-if="ingreso.descripcion" class="text-sm text-gray-600 dark:text-gray-300">
                    {{ ingreso.descripcion }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-green-600 dark:text-green-400">
                    ${{ ingreso.valor.toFixed(2) }}
                  </div>
                  <button
                    class="mt-2 px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                    @click="empezarEdicion(ingreso)"
                  >Editar</button>
                  <button
                    class="mt-2 ml-2 px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                    @click="eliminarIngreso(ingreso)"
                  >Eliminar</button>
                </div>
              </div>

              <!-- Formulario de edición inline -->
              <div v-if="ingresoEnEdicionId === ingreso._id" class="mt-4 border-t pt-4">
                <form @submit.prevent="guardarEdicionIngreso">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Ingreso</label>
                      <select 
                        v-model="ingresoEdit.tipo" 
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      >
                        <option value="Base">Base</option>
                        <option value="Otros ingresos">Otros ingresos</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valor</label>
                      <input 
                        type="text" 
                        v-model="ingresoEdit.valor" 
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción (opcional)</label>
                      <input 
                        v-model="ingresoEdit.descripcion" 
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                  <div class="mt-3 flex gap-2">
                    <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" :disabled="guardandoEdicion">
                      <span v-if="guardandoEdicion">Guardando...</span>
                      <span v-else>Guardar cambios</span>
                    </button>
                    <button type="button" class="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition" @click="cancelarEdicion">Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmación para eliminar ingreso -->
    <ConfirmModal
      :show="mostrarModalEliminar"
      title="Eliminar ingreso"
      message="¿Estás seguro de que deseas eliminar este ingreso? Esta acción no se puede deshacer."
      confirmText="Eliminar"
      cancelText="Cancelar"
      @confirm="confirmarEliminarIngreso"
      @cancel="cancelarEliminarIngreso"
    />
    
    <!-- Modal de confirmación para cerrar ruta -->
    <ConfirmModal
      :show="mostrarModalCerrarRuta"
      title="Cerrar ruta"
      message="¿Estás seguro de que deseas cerrar la ruta? Esta acción no se puede deshacer."
      confirmText="Cerrar ruta"
      cancelText="Cancelar"
      @confirm="confirmarCerrarRuta"
      @cancel="cancelarCerrarRuta"
    />
    
    <!-- Modal de confirmación para abrir ruta -->
    <ConfirmModal
      :show="mostrarModalAbrirRuta"
      title="Abrir ruta"
      message="¿Estás seguro de que deseas abrir la ruta? Esta acción no se puede deshacer."
      confirmText="Abrir ruta"
      cancelText="Cancelar"
      @confirm="confirmarAbrirRuta"
      @cancel="cancelarAbrirRuta"
    />
  </div>
</template>

<script setup>
import API_BASE_URL from '../config/api.js'

import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import NavbarVendedor from '../components/NavbarVendedor.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const router = useRouter()
const ingresos = ref([])
const registrando = ref(false)
const rutaAbierta = ref(false)
const mostrarModalEliminar = ref(false)
const ingresoAEliminar = ref(null)
const mostrarModalCerrarRuta = ref(false)
const mostrarModalAbrirRuta = ref(false)
let pollingInterval = null
const ingresoEnEdicionId = ref(null)
const guardandoEdicion = ref(false)
const ingresoEdit = ref({ tipo: 'Base', valor: '', descripcion: '' })
const nuevoIngreso = ref({
  tipo: 'Base',
  valor: '',
  descripcion: ''
 })

// Cargar ingresos al montar
onMounted(async () => {
  await cargarIngresos()
  
  // Escuchar eventos para actualizar cuando sea necesario
  window.addEventListener('ingreso-registrado', actualizarIngresos)
  window.addEventListener('ingreso-editado', actualizarIngresos)
  window.addEventListener('ingreso-eliminado', actualizarIngresos)
  window.addEventListener('ruta-cerrada', actualizarIngresos)
  window.addEventListener('ruta-abierta', actualizarIngresos)
})

// Función para actualizar ingresos cuando sea necesario
function actualizarIngresos() {
  console.log('🔄 Actualizando ingresos por evento...')
  cargarIngresos()
}

// Limpiar event listeners al desmontar el componente
onUnmounted(() => {
  window.removeEventListener('ingreso-registrado', actualizarIngresos)
  window.removeEventListener('ingreso-editado', actualizarIngresos)
  window.removeEventListener('ingreso-eliminado', actualizarIngresos)
  window.removeEventListener('ruta-cerrada', actualizarIngresos)
  window.removeEventListener('ruta-abierta', actualizarIngresos)
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

    // Obtener ingresos de la ruta - forzar recarga desde la base de datos
    console.log('📋 Cargando ingresos desde la base de datos...')
    const timestamp = new Date().getTime()
    const res = await fetch(`${API_BASE_URL}/api/ingresos?ruta=${ruta._id}&_t=${timestamp}`, {
      cache: 'no-store'
    })
    if (res.ok) {
      ingresos.value = await res.json()
      console.log(`✅ Ingresos cargados: ${ingresos.value.length}`)
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

function empezarEdicion(ingreso) {
  ingresoEnEdicionId.value = ingreso._id
  ingresoEdit.value = {
    tipo: ingreso.tipo,
    valor: String(ingreso.valor ?? ''),
    descripcion: ingreso.descripcion || ''
  }
}

function cancelarEdicion() {
  ingresoEnEdicionId.value = null
  ingresoEdit.value = { tipo: 'Base', valor: '', descripcion: '' }
}

async function guardarEdicionIngreso() {
  try {
    guardandoEdicion.value = true
    const vendedorId = localStorage.getItem('vendedorId')
    if (!vendedorId) return alert('No se pudo identificar al vendedor')
    const resRuta = await fetch(`${API_BASE_URL}/api/rutas/actual/${vendedorId}`)
    const ruta = await resRuta.json()
    if (!ruta) return alert('No hay ruta activa')

    const valorNum = Number(ingresoEdit.value.valor)
    if (!isFinite(valorNum) || valorNum < 0) return alert('Valor inválido')

    const res = await fetch(`${API_BASE_URL}/api/ingresos/ruta/${ruta._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: ingresoEdit.value.tipo,
        valor: valorNum,
        descripcion: ingresoEdit.value.descripcion || undefined
      })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return alert(err?.error || 'Error al actualizar ingreso')
    }
    await cargarIngresos()
    cancelarEdicion()
    alert('Ingreso actualizado')
  } catch (e) {
    console.error('guardarEdicionIngreso error:', e)
    alert('Error al actualizar ingreso')
  } finally {
    guardandoEdicion.value = false
  }
}

function eliminarIngreso(ingreso) {
  ingresoAEliminar.value = ingreso
  mostrarModalEliminar.value = true
}

async function confirmarEliminarIngreso() {
  try {
    const vendedorId = localStorage.getItem('vendedorId')
    const resRuta = await fetch(`${API_BASE_URL}/api/rutas/actual/${vendedorId}`)
    const ruta = await resRuta.json()
    if (!ruta) return alert('No hay ruta activa')
    const r = await fetch(`${API_BASE_URL}/api/ingresos/ruta/${ruta._id}`, { method: 'DELETE' })
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      return alert(err?.error || 'Error al eliminar ingreso')
    }
    await cargarIngresos()
    mostrarModalEliminar.value = false
    ingresoAEliminar.value = null
    alert('Ingreso eliminado')
  } catch (e) {
    console.error('eliminarIngreso error:', e)
    alert('Error al eliminar ingreso')
  }
}

function cancelarEliminarIngreso() {
  mostrarModalEliminar.value = false
  ingresoAEliminar.value = null
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

function cerrarRuta() {
  mostrarModalCerrarRuta.value = true
}

async function confirmarCerrarRuta() {
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
      mostrarModalCerrarRuta.value = false
      // Recargar estado de ruta y datos desde la base de datos
      await cargarIngresos()
      // Disparar evento para que otras vistas se actualicen
      window.dispatchEvent(new CustomEvent('ruta-cerrada'))
      alert('Ruta cerrada exitosamente')
      router.push('/vendedor')
    } else {
      alert('Error al cerrar la ruta')
    }
  } catch (error) {
    console.error('Error al cerrar ruta:', error)
    alert('Error al cerrar ruta')
  }
}

function cancelarCerrarRuta() {
  mostrarModalCerrarRuta.value = false
}

function abrirRuta() {
  mostrarModalAbrirRuta.value = true
}

async function confirmarAbrirRuta() {
  const vendedorId = localStorage.getItem('vendedorId')
  const res = await fetch(`${API_BASE_URL}/api/rutas/abrir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendedorId })
  })
  if (res.ok) {
    mostrarModalAbrirRuta.value = false
    // Recargar estado de ruta y datos desde la base de datos
    const estadoRuta = await consultarEstadoRuta()
    rutaAbierta.value = estadoRuta.abierta
    await cargarIngresos()
    // Disparar evento para que otras vistas se actualicen
    window.dispatchEvent(new CustomEvent('ruta-abierta'))
    alert('Ruta abierta exitosamente')
  } else {
    alert('No se pudo abrir la ruta')
  }
}

function cancelarAbrirRuta() {
  mostrarModalAbrirRuta.value = false
}
</script> 