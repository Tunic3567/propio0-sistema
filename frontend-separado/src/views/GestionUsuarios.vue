<template>
  <div class="min-h-screen w-full max-w-full overflow-x-clip bg-amber-50/80 dark:bg-slate-900 transition-theme">
    <NavbarAdmin @logout="logout" />
    <div class="p-4 md:p-6 max-w-6xl mx-auto pt-20 space-y-6">
      <div class="rounded-xl border-2 border-amber-500/80 bg-amber-100/90 dark:bg-amber-950/40 dark:border-amber-600 p-4 text-amber-950 dark:text-amber-100">
        <h1 class="text-lg font-bold">Gestión de usuarios</h1>
        <p class="text-sm mt-2 leading-relaxed">
          Solo sesión <strong>superusuario</strong>. Administra administradores y vendedores del sistema.
        </p>
      </div>

      <!-- Filtros y acciones -->
      <div class="flex flex-wrap gap-3 items-center justify-between">
        <div class="flex gap-2">
          <button
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="filtroRol === 'todos' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-800 text-neutral-700 dark:text-slate-200 border border-neutral-300 dark:border-slate-600'"
            @click="filtroRol = 'todos'"
          >Todos</button>
          <button
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="filtroRol === 'admin' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-800 text-neutral-700 dark:text-slate-200 border border-neutral-300 dark:border-slate-600'"
            @click="filtroRol = 'admin'"
          >Administradores</button>
          <button
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="filtroRol === 'vendedor' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-800 text-neutral-700 dark:text-slate-200 border border-neutral-300 dark:border-slate-600'"
            @click="filtroRol = 'vendedor'"
          >Vendedores</button>
        </div>
        <div class="flex gap-2">
          <button
            class="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            @click="abrirCrearAdmin"
          >+ Nuevo administrador</button>
          <button
            class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            @click="abrirCrearVendedor"
          >+ Nuevo vendedor</button>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-neutral-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div v-if="cargando" class="p-8 text-center text-neutral-500 dark:text-slate-400">Cargando usuarios…</div>
        <div v-else-if="error" class="p-8 text-center text-red-600">{{ error }}</div>
        <div v-else-if="usuariosFiltrados.length === 0" class="p-8 text-center text-neutral-500 dark:text-slate-400">
          No hay usuarios con ese rol.
        </div>
        <table v-else class="w-full text-sm">
          <thead class="bg-neutral-50 dark:bg-slate-700 border-b border-neutral-200 dark:border-slate-600">
            <tr>
              <th class="text-left px-4 py-3 font-semibold text-neutral-700 dark:text-slate-200">Nombre</th>
              <th class="text-left px-4 py-3 font-semibold text-neutral-700 dark:text-slate-200">Usuario</th>
              <th class="text-left px-4 py-3 font-semibold text-neutral-700 dark:text-slate-200">Rol</th>
              <th class="text-left px-4 py-3 font-semibold text-neutral-700 dark:text-slate-200">Código vinculación</th>
              <th class="text-left px-4 py-3 font-semibold text-neutral-700 dark:text-slate-200 w-32">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 dark:divide-slate-700">
            <tr v-for="u in usuariosFiltrados" :key="u._id" class="hover:bg-neutral-50 dark:hover:bg-slate-750 transition-colors">
              <td class="px-4 py-3 text-neutral-800 dark:text-slate-100">{{ u.nombre || '—' }}</td>
              <td class="px-4 py-3 text-neutral-700 dark:text-slate-300 font-mono text-xs">{{ u.usuario }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="u.tipo === 'admin'
                    ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'"
                >{{ u.tipo === 'admin' ? 'Administrador' : 'Vendedor' }}</span>
              </td>
              <td class="px-4 py-3 font-mono text-xs text-neutral-600 dark:text-slate-400">{{ u.codigoVinculacion }}</td>
              <td class="px-4 py-3">
                <div class="flex gap-1.5">
                  <button
                    class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:hover:bg-amber-900/60 transition-colors"
                    @click="abrirEditar(u)"
                  >Editar</button>
                  <button
                    class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60 transition-colors"
                    @click="abrirEliminar(u)"
                  >Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal crear/editar administrador -->
    <Teleport to="body">
      <div v-if="modalAdmin" class="fixed inset-0 z-[200] flex items-center justify-center p-4" @click.self="cerrarModalAdmin">
        <div class="absolute inset-0 bg-black/50" @click="cerrarModalAdmin"></div>
        <div class="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-neutral-200 dark:border-slate-700 p-6 w-full max-w-md space-y-4">
          <h2 class="text-lg font-bold text-neutral-800 dark:text-slate-100">{{ editandoAdmin ? 'Editar administrador' : 'Nuevo administrador' }}</h2>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-semibold text-neutral-700 dark:text-slate-300">Nombre</span>
            <input v-model="formAdmin.nombre" type="text" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-sm" />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-semibold text-neutral-700 dark:text-slate-300">Usuario</span>
            <input v-model="formAdmin.usuario" type="text" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-sm" />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-semibold text-neutral-700 dark:text-slate-300">Contraseña <span class="font-normal text-neutral-500 dark:text-slate-400">(dejar vacío para mantener)</span></span>
            <input v-model="formAdmin.contrasena" type="password" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-sm" />
          </label>
          <p v-if="!editandoAdmin" class="text-xs text-neutral-500 dark:text-slate-400">El código de vinculación se generará automáticamente.</p>
          <div class="flex gap-2 justify-end pt-2">
            <button class="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-slate-700 text-neutral-700 dark:text-slate-200 text-sm" @click="cerrarModalAdmin">Cancelar</button>
            <button
              class="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
              :class="editandoAdmin ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'"
              :disabled="guardandoAdmin"
              @click="guardarAdmin"
            >{{ guardandoAdmin ? 'Guardando…' : editandoAdmin ? 'Guardar cambios' : 'Crear administrador' }}</button>
          </div>
          <p v-if="mensajeAdmin" class="text-sm" :class="mensajeAdminOk ? 'text-green-600' : 'text-red-600'">{{ mensajeAdmin }}</p>
        </div>
      </div>
    </Teleport>

    <!-- Modal crear/editar vendedor -->
    <Teleport to="body">
      <div v-if="modalVendedor" class="fixed inset-0 z-[200] flex items-center justify-center p-4" @click.self="cerrarModalVendedor">
        <div class="absolute inset-0 bg-black/50" @click="cerrarModalVendedor"></div>
        <div class="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-neutral-200 dark:border-slate-700 p-6 w-full max-w-md space-y-4">
          <h2 class="text-lg font-bold text-neutral-800 dark:text-slate-100">{{ editandoVendedor ? 'Editar vendedor' : 'Nuevo vendedor' }}</h2>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-semibold text-neutral-700 dark:text-slate-300">Nombre</span>
            <input v-model="formVendedor.nombre" type="text" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-sm" />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-semibold text-neutral-700 dark:text-slate-300">Usuario</span>
            <input v-model="formVendedor.usuario" type="text" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-sm" />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-semibold text-neutral-700 dark:text-slate-300">Contraseña <span class="font-normal text-neutral-500 dark:text-slate-400">(dejar vacío para mantener)</span></span>
            <input v-model="formVendedor.contrasena" type="password" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-sm" />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-semibold text-neutral-700 dark:text-slate-300">Ciudad</span>
            <input v-model="formVendedor.ciudad" type="text" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-sm" />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-semibold text-neutral-700 dark:text-slate-300">País</span>
            <input v-model="formVendedor.pais" type="text" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-sm" />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-semibold text-neutral-700 dark:text-slate-300">Administrador (vinculación)</span>
            <select v-model="formVendedor.adminId" class="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 border-neutral-300 dark:border-slate-600 text-sm">
              <option value="" disabled>Seleccionar administrador</option>
              <option v-for="a in admins" :key="a._id" :value="a._id">{{ a.nombre || a.usuario }} ({{ a.codigoVinculacion }})</option>
            </select>
          </label>
          <p class="text-xs text-neutral-500 dark:text-slate-400">El vendedor se vinculará al código del administrador seleccionado.</p>
          <div class="flex gap-2 justify-end pt-2">
            <button class="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-slate-700 text-neutral-700 dark:text-slate-200 text-sm" @click="cerrarModalVendedor">Cancelar</button>
            <button
              class="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
              :class="editandoVendedor ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'"
              :disabled="guardandoVendedor"
              @click="guardarVendedor"
            >{{ guardandoVendedor ? 'Guardando…' : editandoVendedor ? 'Guardar cambios' : 'Crear vendedor' }}</button>
          </div>
          <p v-if="mensajeVendedor" class="text-sm" :class="mensajeVendedorOk ? 'text-green-600' : 'text-red-600'">{{ mensajeVendedor }}</p>
        </div>
      </div>
    </Teleport>

    <!-- Modal confirmar eliminación -->
    <Teleport to="body">
      <div v-if="modalEliminar" class="fixed inset-0 z-[200] flex items-center justify-center p-4" @click.self="modalEliminar = false">
        <div class="absolute inset-0 bg-black/50" @click="modalEliminar = false"></div>
        <div class="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-neutral-200 dark:border-slate-700 p-6 w-full max-w-md space-y-4">
          <h2 class="text-lg font-bold text-red-700 dark:text-red-400">Confirmar eliminación</h2>
          <p class="text-sm text-neutral-700 dark:text-slate-300">
            ¿Estás seguro de eliminar a <strong>{{ usuarioEliminar?.nombre || usuarioEliminar?.usuario }}</strong>?
            <span v-if="usuarioEliminar?.tipo === 'admin'"> Es administrador.</span>
            <span v-else> Es vendedor.</span>
          </p>
          <p class="text-xs text-neutral-500 dark:text-slate-400">Esta acción no se puede deshacer.</p>
          <div class="flex gap-2 justify-end pt-2">
            <button class="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-slate-700 text-neutral-700 dark:text-slate-200 text-sm" @click="modalEliminar = false">Cancelar</button>
            <button
              class="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium disabled:opacity-50"
              :disabled="eliminando"
              @click="confirmarEliminar"
            >{{ eliminando ? 'Eliminando…' : 'Eliminar' }}</button>
          </div>
          <p v-if="mensajeEliminar" class="text-sm" :class="mensajeEliminarOk ? 'text-green-600' : 'text-red-600'">{{ mensajeEliminar }}</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import NavbarAdmin from '../components/NavbarAdmin.vue'
import API_BASE_URL from '../config/api.js'

const { t } = useI18n()

const usuarios = ref([])
const cargando = ref(true)
const error = ref('')
const filtroRol = ref('todos')

const modalAdmin = ref(false)
const editandoAdmin = ref(false)
const adminEditandoId = ref(null)
const guardandoAdmin = ref(false)
const mensajeAdmin = ref('')
const mensajeAdminOk = ref(false)

const modalVendedor = ref(false)
const editandoVendedor = ref(false)
const vendedorEditandoId = ref(null)
const guardandoVendedor = ref(false)
const mensajeVendedor = ref('')
const mensajeVendedorOk = ref(false)

const modalEliminar = ref(false)
const eliminando = ref(false)
const mensajeEliminar = ref('')
const mensajeEliminarOk = ref(false)
const usuarioEliminar = ref(null)

const formAdmin = ref({ nombre: '', usuario: '', contrasena: '' })
const formVendedor = ref({ nombre: '', usuario: '', contrasena: '', ciudad: '', pais: '', adminId: '' })

const admins = computed(() => usuarios.value.filter(u => u.tipo === 'admin'))

const usuariosFiltrados = computed(() => {
  if (filtroRol.value === 'todos') return usuarios.value
  return usuarios.value.filter(u => u.tipo === filtroRol.value)
})

async function cargarUsuarios() {
  cargando.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('sessionToken')
    const res = await fetch(`${API_BASE_URL}/api/admin/super/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error al cargar usuarios')
    }
    const data = await res.json()
    usuarios.value = data.usuarios || []
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

/* --- Crear / Editar admin --- */

function abrirCrearAdmin() {
  editandoAdmin.value = false
  adminEditandoId.value = null
  formAdmin.value = { nombre: '', usuario: '', contrasena: '' }
  mensajeAdmin.value = ''
  modalAdmin.value = true
}

function abrirEditarAdmin(u) {
  editandoAdmin.value = true
  adminEditandoId.value = u._id
  formAdmin.value = { nombre: u.nombre || '', usuario: u.usuario || '', contrasena: '' }
  mensajeAdmin.value = ''
  modalAdmin.value = true
}

function cerrarModalAdmin() {
  modalAdmin.value = false
  mensajeAdmin.value = ''
}

async function guardarAdmin() {
  const { nombre, usuario, contrasena } = formAdmin.value
  if (!nombre || !usuario) {
    mensajeAdmin.value = 'Nombre y usuario son obligatorios'
    mensajeAdminOk.value = false
    return
  }
  guardandoAdmin.value = true
  mensajeAdmin.value = ''
  try {
    const token = localStorage.getItem('sessionToken')
    if (editandoAdmin.value) {
      const res = await fetch(`${API_BASE_URL}/api/admin/super/usuarios/admin/${adminEditandoId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre, usuario, contrasena })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.codigo === 'USUARIO_YA_EN_USO' ? t('errors.userAlreadyInUse') : data.error || 'Error al actualizar')
      mensajeAdmin.value = 'Administrador actualizado'
      mensajeAdminOk.value = true
      modalAdmin.value = false
      await cargarUsuarios()
    } else {
      if (!contrasena) {
        mensajeAdmin.value = 'La contraseña es obligatoria para crear'
        mensajeAdminOk.value = false
        guardandoAdmin.value = false
        return
      }
      const res = await fetch(`${API_BASE_URL}/api/admin/super/usuarios/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre, usuario, contrasena })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.codigo === 'USUARIO_YA_EN_USO' ? t('errors.userAlreadyInUse') : data.error || 'Error al crear')
      mensajeAdmin.value = `Administrador creado. Código: ${data.usuario.codigoVinculacion}`
      mensajeAdminOk.value = true
      modalAdmin.value = false
      await cargarUsuarios()
    }
  } catch (e) {
    mensajeAdmin.value = e.message
    mensajeAdminOk.value = false
  } finally {
    guardandoAdmin.value = false
  }
}

/* --- Crear / Editar vendedor --- */

function abrirCrearVendedor() {
  editandoVendedor.value = false
  vendedorEditandoId.value = null
  formVendedor.value = { nombre: '', usuario: '', contrasena: '', ciudad: '', pais: '', adminId: '' }
  mensajeVendedor.value = ''
  modalVendedor.value = true
}

function abrirEditarVendedor(u) {
  editandoVendedor.value = true
  vendedorEditandoId.value = u._id
  const adminActual = admins.value.find(a => a.codigoVinculacion === u.codigoVinculacion)
  formVendedor.value = { nombre: u.nombre || '', usuario: u.usuario || '', contrasena: '', ciudad: u.ciudad || '', pais: u.pais || '', adminId: adminActual?._id || '' }
  mensajeVendedor.value = ''
  modalVendedor.value = true
}

function cerrarModalVendedor() {
  modalVendedor.value = false
  mensajeVendedor.value = ''
}

async function guardarVendedor() {
  const { nombre, usuario, contrasena, ciudad, pais, adminId } = formVendedor.value
  if (!nombre || !usuario) {
    mensajeVendedor.value = 'Nombre y usuario son obligatorios'
    mensajeVendedorOk.value = false
    return
  }
  if (!editandoVendedor.value && !adminId) {
    mensajeVendedor.value = 'Selecciona un administrador para vincular'
    mensajeVendedorOk.value = false
    return
  }
  guardandoVendedor.value = true
  mensajeVendedor.value = ''
  try {
    const token = localStorage.getItem('sessionToken')
    if (editandoVendedor.value) {
      const res = await fetch(`${API_BASE_URL}/api/admin/super/usuarios/vendedor/${vendedorEditandoId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre, usuario, contrasena, ciudad, pais, adminId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.codigo === 'USUARIO_YA_EN_USO' ? t('errors.userAlreadyInUse') : data.error || 'Error al actualizar')
      mensajeVendedor.value = 'Vendedor actualizado'
      mensajeVendedorOk.value = true
      modalVendedor.value = false
      await cargarUsuarios()
    } else {
      if (!contrasena) {
        mensajeVendedor.value = 'La contraseña es obligatoria para crear'
        mensajeVendedorOk.value = false
        guardandoVendedor.value = false
        return
      }
      const res = await fetch(`${API_BASE_URL}/api/admin/super/usuarios/vendedor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre, usuario, contrasena, adminId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.codigo === 'USUARIO_YA_EN_USO' ? t('errors.userAlreadyInUse') : data.error || 'Error al crear')
      mensajeVendedor.value = 'Vendedor creado y vinculado.'
      mensajeVendedorOk.value = true
      modalVendedor.value = false
      await cargarUsuarios()
    }
  } catch (e) {
    mensajeVendedor.value = e.message
    mensajeVendedorOk.value = false
  } finally {
    guardandoVendedor.value = false
  }
}

/* --- Editar / Eliminar genérico --- */

function abrirEditar(u) {
  if (u.tipo === 'admin') abrirEditarAdmin(u)
  else abrirEditarVendedor(u)
}

function abrirEliminar(u) {
  usuarioEliminar.value = u
  mensajeEliminar.value = ''
  mensajeEliminarOk.value = false
  modalEliminar.value = true
}

async function confirmarEliminar() {
  const u = usuarioEliminar.value
  if (!u) return
  eliminando.value = true
  mensajeEliminar.value = ''
  try {
    const token = localStorage.getItem('sessionToken')
    const endpoint = u.tipo === 'admin'
      ? `${API_BASE_URL}/api/admin/super/usuarios/admin/${u._id}`
      : `${API_BASE_URL}/api/admin/super/usuarios/vendedor/${u._id}`
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error al eliminar')
    mensajeEliminar.value = 'Usuario eliminado correctamente'
    mensajeEliminarOk.value = true
    modalEliminar.value = false
    await cargarUsuarios()
  } catch (e) {
    mensajeEliminar.value = e.message
    mensajeEliminarOk.value = false
  } finally {
    eliminando.value = false
  }
}

function logout() {
  localStorage.clear()
  window.location.hash = '#/'
  window.location.reload()
}

onMounted(cargarUsuarios)
</script>
