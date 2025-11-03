import API_BASE_URL from '../config/api.js'

export async function consultarEstadoRuta() {
  try {
    const vendedorId = localStorage.getItem('vendedorId')
    console.log('🔍 consultarEstadoRuta - vendedorId:', vendedorId)
    
    if (!vendedorId) {
      console.log('❌ consultarEstadoRuta - No hay vendedorId')
      return { abierta: false, cargando: false }
    }

    const url = `${API_BASE_URL}/api/rutas/actual/${vendedorId}`
    console.log('🔍 consultarEstadoRuta - URL:', url)
    
    const res = await fetch(url)
    console.log('🔍 consultarEstadoRuta - Response status:', res.status)
    
    if (res.ok) {
      const ruta = await res.json()
      console.log('🔍 consultarEstadoRuta - Ruta recibida:', ruta)
      
      const resultado = { 
        abierta: ruta ? ruta.abierta : false, 
        cargando: false,
        ruta: ruta
      }
      console.log('✅ consultarEstadoRuta - Resultado:', resultado)
      return resultado
    } else {
      console.log('❌ consultarEstadoRuta - Error en response:', res.status)
      return { abierta: false, cargando: false }
    }
  } catch (error) {
    console.error('❌ consultarEstadoRuta - Error:', error)
    return { abierta: false, cargando: false }
  }
}

export async function cerrarRuta() {
  try {
    const vendedorId = localStorage.getItem('vendedorId')
    if (!vendedorId) return false

    const res = await fetch(`${API_BASE_URL}/api/rutas/cerrar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ vendedorId })
    })

    if (res.ok) {
      return true
    } else {
      console.error('Error cerrando ruta:', res.statusText)
      return false
    }
  } catch (error) {
    console.error('Error cerrando ruta:', error)
    return false
  }
}

export async function abrirRuta() {
  try {
    const vendedorId = localStorage.getItem('vendedorId')
    if (!vendedorId) return false

    const res = await fetch(`${API_BASE_URL}/api/rutas/abrir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ vendedorId })
    })

    if (res.ok) {
      return true
    } else {
      console.error('Error abriendo ruta:', res.statusText)
      return false
    }
  } catch (error) {
    console.error('Error abriendo ruta:', error)
    return false
  }
}
