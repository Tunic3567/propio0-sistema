import { defineStore } from 'pinia'

const STORAGE_KEY = 'clienteSeleccionado'

export const useClienteStore = defineStore('cliente', {
  state: () => ({
    clienteSeleccionado: JSON.parse(localStorage.getItem(STORAGE_KEY)) || null
  }),
  actions: {
    setCliente(cliente) {
      this.clienteSeleccionado = cliente
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cliente))
    },
    limpiarCliente() {
      this.clienteSeleccionado = null
      localStorage.removeItem(STORAGE_KEY)
    }
  }
}) 