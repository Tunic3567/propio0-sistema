import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import Pagos from '../views/Pagos.vue'
import HistorialPagosAdmin from '../views/HistorialPagosAdmin.vue'
/** Vistas frecuentes del asesor: carga diferida para acelerar login y primera pintura */
const VendedorDashboard = () => import('../views/VendedorDashboard.vue')
const CrearCliente = () => import('../views/CrearCliente.vue')
const Registros = () => import('../views/Registros.vue')
const Egresos = () => import('../views/Egresos.vue')
const Ingresos = () => import('../views/Ingresos.vue')
import IngresosEgresosAdmin from '../views/IngresosEgresosAdmin.vue'
import ResumenAdmin from '../views/ResumenAdmin.vue'
const ResumenVendedor = () => import('../views/ResumenVendedor.vue')
const HistorialPagosVendedor = () => import('../views/HistorialPagosVendedor.vue')
const HistorialClientesVendedor = () => import('../views/HistorialClientesVendedor.vue')
const Ventas = () => import('../views/Ventas.vue')
import MiCuentaAdmin from '../views/MiCuentaAdmin.vue'
const RepairResumenAdmin = () => import('../views/RepairResumenAdmin.vue')
import AdminRutas from '../views/AdminRutas.vue'
import CrearClienteAdmin from '../views/CrearClienteAdmin.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'

const routes = [
  { path: '/', name: 'Login', component: LoginView },
  { path: '/olvide-contrasena', name: 'OlvideContrasena', component: ForgotPasswordView },
  { path: '/restablecer-contrasena', name: 'RestablecerContrasena', component: ResetPasswordView },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'administrador' }
  },
  {
    path: '/admin/crear-cliente',
    name: 'CrearClienteAdmin',
    component: CrearClienteAdmin,
    meta: { requiresAuth: true, role: 'administrador' }
  },
  {
    path: '/admin/resumen',
    name: 'ResumenAdmin',
    component: ResumenAdmin,
    meta: { requiresAuth: true, role: 'administrador' }
  },
  {
    path: '/admin/repair-resumen',
    name: 'RepairResumenAdmin',
    component: RepairResumenAdmin,
    meta: { requiresAuth: true, role: 'superusuario' }
  },
  {
    path: '/vendedor',
    name: 'Vendedor',
    component: VendedorDashboard,
    meta: { requiresAuth: true, role: 'vendedor' }
  },
  { path: '/resumen', name: 'ResumenVendedor', component: ResumenVendedor, meta: { requiresAuth: true, role: 'vendedor' } },
  { path: '/historial-pagos', name: 'HistorialPagosVendedor', component: HistorialPagosVendedor, meta: { requiresAuth: true, role: 'vendedor' } },
  { path: '/historial-clientes', name: 'HistorialClientesVendedor', component: HistorialClientesVendedor, meta: { requiresAuth: true, role: 'vendedor' } },
  {
    path: '/crear-cliente',
    name: 'CrearCliente',
    component: CrearCliente,
    meta: { requiresAuth: true, role: 'vendedor' }
  },
  { path: '/pagos', name: 'Pagos', component: Pagos, meta: { requiresAuth: true, role: 'vendedor' } },
  { path: '/registros', name: 'Registros', component: Registros, meta: { requiresAuth: true, role: 'vendedor' } },
  { path: '/admin/pagos', name: 'PagosAdmin', component: HistorialPagosAdmin, meta: { requiresAuth: true, role: 'administrador' } },
  { path: '/admin/rutas', name: 'AdminRutas', component: AdminRutas, meta: { requiresAuth: true, role: 'administrador' } },
  { path: '/admin/vendedores', name: 'AdminVendedores', component: MiCuentaAdmin, meta: { requiresAuth: true, role: 'administrador' } },
  { path: '/egresos', name: 'Egresos', component: Egresos, meta: { requiresAuth: true, role: 'vendedor' } },
  { path: '/ingresos', name: 'Ingresos', component: Ingresos, meta: { requiresAuth: true, role: 'vendedor' } },
  { path: '/ventas', name: 'Ventas', component: Ventas, meta: { requiresAuth: true, role: 'vendedor' } },
  { path: '/admin/movimientos', name: 'IngresosEgresosAdmin', component: IngresosEgresosAdmin, meta: { requiresAuth: true, role: 'administrador' } },
  {
    path: '/admin/mi-cuenta',
    name: 'MiCuentaAdmin',
    component: MiCuentaAdmin,
    meta: { requiresAuth: true, role: 'administrador' }
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})


router.onError((error, to) => {
  const message = String(error?.message || error || '')
  const isChunkLoadError = /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk|error loading dynamically imported module/i.test(message)
  if (isChunkLoadError && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('offline-route-module-missing', {
      detail: {
        path: to?.fullPath || to?.path || '',
        message: 'Esta pantalla todavía no está disponible sin conexión. Abre Pagos al menos una vez con internet o actualiza la app cuando vuelva la conexión.'
      }
    }))
  }
})

// Guard global de navegación
router.beforeEach((to, from, next) => {
  const rol = localStorage.getItem('rol')
  if (to.meta.requiresAuth) {
    if (!rol) {
      next({ path: '/' })
      return
    }
    /** Reparar resumen: exclusivo superusuario */
    if (to.meta.role === 'superusuario') {
      if (rol !== 'superusuario') next({ path: '/admin' })
      else next()
      return
    }
    if (to.meta.role && to.meta.role !== rol) {
      if (to.meta.role === 'administrador' && rol === 'superusuario') {
        next()
      } else {
        next({ path: '/' })
      }
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
