import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import VendedorDashboard from '../views/VendedorDashboard.vue'
import CrearCliente from '../views/CrearCliente.vue'
import Pagos from '../views/Pagos.vue'
import Registros from '../views/Registros.vue'
import PagosAdmin from '../views/PagosAdmin.vue'
import Egresos from '../views/Egresos.vue'
import EgresosAdmin from '../views/EgresosAdmin.vue'
import Ingresos from '../views/Ingresos.vue'
import IngresosAdmin from '../views/IngresosAdmin.vue'
import ResumenVendedor from '../views/ResumenVendedor.vue'
import HistorialPagosVendedor from '../views/HistorialPagosVendedor.vue'
import HistorialClientesVendedor from '../views/HistorialClientesVendedor.vue'

const routes = [
  { path: '/', name: 'Login', component: LoginView },
  { 
    path: '/admin', 
    name: 'Admin', 
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'administrador' }
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
  { path: '/admin/pagos', name: 'PagosAdmin', component: PagosAdmin, meta: { requiresAuth: true, role: 'administrador' } },
  { path: '/egresos', name: 'Egresos', component: Egresos, meta: { requiresAuth: true, role: 'vendedor' } },
  { path: '/ingresos', name: 'Ingresos', component: Ingresos, meta: { requiresAuth: true, role: 'vendedor' } },
  { path: '/admin/egresos', name: 'EgresosAdmin', component: EgresosAdmin, meta: { requiresAuth: true, role: 'administrador' } },
  { path: '/admin/ingresos', name: 'IngresosAdmin', component: IngresosAdmin, meta: { requiresAuth: true, role: 'administrador' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Guard global de navegación
router.beforeEach((to, from, next) => {
  const rol = localStorage.getItem('rol')
  if (to.meta.requiresAuth) {
    if (!rol) {
      // No autenticado
      next({ path: '/' })
    } else if (to.meta.role && to.meta.role !== rol) {
      // Rol incorrecto
      next({ path: '/' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router

// ... resto del código del router