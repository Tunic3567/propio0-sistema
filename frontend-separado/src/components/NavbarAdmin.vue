<template>
  <OfflineStatusBar @sync="forzarSync" />
  <div class="relative w-full max-w-full min-w-0">
    <!-- Navbar principal: fixed + espaciador (drawer lateral z-[101]) -->
    <nav
      class="fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top,0px)] bg-white dark:bg-slate-800 shadow-md border-b border-neutral-200 dark:border-slate-600 transition-theme overflow-x-clip"
    >
      <div class="px-3 py-2 sm:px-4">
        <div class="flex items-center justify-between gap-2 min-w-0">
          <!-- Logo/Título -->
          <div class="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <button
              @click="toggleSidebar"
              class="p-1 sm:p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-theme shrink-0"
            >
              <svg class="w-8 h-8 sm:w-9 sm:h-9 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 6h20M2 12h20M2 18h20"></path>
              </svg>
            </button>
            <h1 class="text-lg sm:text-xl font-semibold leading-snug text-neutral-800 dark:text-slate-100 lg:text-2xl truncate min-w-0">{{ tituloHeader }}</h1>
          </div>
          
          <div class="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              @click="toggleChat"
              class="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-slate-600 transition-theme"
              :title="$t('chatbot.title')"
            >
              <svg class="w-5 h-5 sm:w-6 sm:h-6 text-neutral-700 dark:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <rect x="3" y="1" width="18" height="12" rx="2" />
                <circle cx="8.5" cy="6.5" r="1.2" />
                <circle cx="15.5" cy="6.5" r="1.2" />
                <path d="M6 13v6a2 2 0 002 2h8a2 2 0 002-2v-6" />
                <path d="M12 13v3" stroke-linecap="round" />
                <circle cx="12" cy="18.5" r="1.2" />
              </svg>
              <span class="text-sm font-medium text-neutral-700 dark:text-slate-200 hidden sm:inline">{{ $t('chatbot.title') }}</span>
            </button>
            <AdminNotificationsBell />
            <ThemeToggle />
            <LanguageSelector />
          </div>
        </div>
      </div>
    </nav>

    <div
      class="pointer-events-none shrink-0 select-none w-full h-[calc(4rem+env(safe-area-inset-top,0px))]"
      aria-hidden="true"
    />

    <!-- Sidebar + backdrop: Teleport a body para que fixed y clics no dependan del padre -->
    <Teleport to="body">
      <div
        class="fixed inset-0 z-[100] lg:hidden"
        v-if="sidebarOpen"
        @click="closeSidebar"
      >
        <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      <div
        class="fixed top-0 left-0 z-[101] h-full w-full max-w-[20rem] bg-white dark:bg-slate-800 border-r border-neutral-200 dark:border-slate-600 shadow-xl dark:shadow-slate-900/50 transform transition-all duration-300 ease-in-out flex flex-col"
        :class="sidebarOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'"
      >
      <!-- Header del sidebar -->
      <div class="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-slate-600 shrink-0">
        <h2 class="text-lg font-semibold text-neutral-800 dark:text-slate-100 lg:text-base leading-snug truncate pr-1" :title="etiquetaSidebarAdmin">
          {{ etiquetaSidebarAdmin }}
        </h2>
        <button 
          @click="closeSidebar"
          class="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-700 transition-colors"
        >
          <svg class="w-5 h-5 text-neutral-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Navegación principal -->
      <div class="p-4 space-y-2 flex-1 overflow-y-auto overscroll-contain sidebar-scroll">
        <template v-if="!esSuperUsuario">
          <h3 class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Navegación</h3>
          
          <button
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
            :class="[
              isActive('/admin') ? 'bg-neutral-100 dark:bg-slate-700 text-neutral-900 dark:text-slate-100 border-l-2 border-neutral-600 dark:border-slate-400' : 'text-neutral-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700'
            ]"
            @click="navigateTo('/admin')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V6a4 4 0 00-8 0v4m12 4v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 012-2h12a2 2 0 012 2z" />
            </svg>
            <span class="text-base font-semibold">Clientes</span>
          </button>

          <button
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
            :class="[
              isActive('/admin/ventas') ? 'bg-neutral-100 dark:bg-slate-700 text-neutral-900 dark:text-slate-100 border-l-2 border-neutral-600 dark:border-slate-400' : 'text-neutral-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700'
            ]"
            @click="navigateTo('/admin/ventas')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span class="text-base font-semibold">{{ $t('nav.sales') }}</span>
          </button>

          <button
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
            :class="[
              isActive('/admin/rutas') ? 'bg-neutral-100 dark:bg-slate-700 text-neutral-900 dark:text-slate-100 border-l-2 border-neutral-600 dark:border-slate-400' : 'text-neutral-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700'
            ]"
            @click="navigateTo('/admin/rutas')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span class="text-base font-semibold">{{ $t('admin.routesPlural') }}</span>
          </button>

          <button
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
            :class="[
              isAccessHubActive ? 'bg-neutral-100 dark:bg-slate-700 text-neutral-900 dark:text-slate-100 border-l-2 border-neutral-600 dark:border-slate-400' : 'text-neutral-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700'
            ]"
            @click="navigateTo('/admin/mi-cuenta')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span class="text-base font-semibold">{{ $t('nav.access') }}</span>
          </button>

          <button
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
            :class="[
              isActive('/admin/movimientos') ? 'bg-neutral-100 dark:bg-slate-700 text-neutral-900 dark:text-slate-100 border-l-2 border-neutral-600 dark:border-slate-400' : 'text-neutral-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700'
            ]"
            @click="navigateTo('/admin/movimientos')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            <span class="text-base font-semibold">{{ $t('admin.incomeExpenseNav') }}</span>
          </button>

          <button
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
            :class="[
              isActive('/notas-dia') ? 'bg-neutral-100 dark:bg-slate-700 text-neutral-900 dark:text-slate-100 border-l-2 border-neutral-600 dark:border-slate-400' : 'text-neutral-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700'
            ]"
            @click="navigateTo('/notas-dia')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span class="text-base font-semibold">{{ $t('nav.notes') }}</span>
          </button>

          <button
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
            :class="[
              isActive('/admin/resumen') ? 'bg-neutral-100 dark:bg-slate-700 text-neutral-900 dark:text-slate-100 border-l-2 border-neutral-600 dark:border-slate-400' : 'text-neutral-700 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700'
            ]"
            @click="navigateTo('/admin/resumen')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            </svg>
            <span class="text-base font-semibold">{{ $t('nav.summary') }}</span>
          </button>
        </template>

        <!-- Superusuario: gestión de usuarios -->
        <button
          v-if="esSuperUsuario"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left border border-amber-400/60 dark:border-amber-600/50"
          :class="[
            isActive('/admin/super/usuarios') ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-950 dark:text-amber-100 border-l-2 border-amber-600' : 'text-amber-900 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/30'
          ]"
          @click="navigateTo('/admin/super/usuarios')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <span class="text-base font-semibold">Usuarios</span>
        </button>

        <button
          v-if="esSuperUsuario"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left border border-amber-400/60 dark:border-amber-600/50"
          :class="[
            isActive('/admin/super/resumen-global') ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-950 dark:text-amber-100 border-l-2 border-amber-600' : 'text-amber-900 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/30'
          ]"
          @click="navigateTo('/admin/super/resumen-global')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="text-base font-semibold">Resumen global</span>
        </button>

        <button
          v-if="esSuperUsuario"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left border border-amber-400/60 dark:border-amber-600/50"
          :class="[
            isActive('/admin/super/dashboard') ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-950 dark:text-amber-100 border-l-2 border-amber-600' : 'text-amber-900 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/30'
          ]"
          @click="navigateTo('/admin/super/dashboard')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <span class="text-base font-semibold">Dashboard</span>
        </button>

        <button
          v-if="esSuperUsuario"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left border border-amber-400/60 dark:border-amber-600/50"
          :class="[
            isActive('/admin/repair-resumen') ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-950 dark:text-amber-100 border-l-2 border-amber-600' : 'text-amber-900 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/30'
          ]"
          @click="navigateTo('/admin/repair-resumen')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="text-left leading-snug">Reparar resumen <span class="block text-xs opacity-80">(emergencia)</span></span>
        </button>

        <button
          v-if="esSuperUsuario"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left border border-red-400/60 dark:border-red-600/50"
          :class="[
            isActive('/admin/super/limpiar-vendedor') ? 'bg-red-100 dark:bg-red-950/50 text-red-950 dark:text-red-100 border-l-2 border-red-600' : 'text-red-900 dark:text-red-200 hover:bg-red-50 dark:hover:bg-red-950/30'
          ]"
          @click="navigateTo('/admin/super/limpiar-vendedor')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span class="text-left leading-snug">Limpiar vendedor <span class="block text-xs opacity-80">(solo test)</span></span>
        </button>
      </div>

      <!-- Acciones críticas -->
      <div class="p-4 border-t border-neutral-200 dark:border-slate-600 bg-neutral-100 dark:bg-slate-900 shrink-0">
        <div class="space-y-2">
          <button
            @click="logout"
            class="w-full flex items-center gap-3 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import LanguageSelector from './LanguageSelector.vue';
import ThemeToggle from './ThemeToggle.vue';
import AdminNotificationsBell from './AdminNotificationsBell.vue';
import { toggleChat } from '../chatState.js';
import API_BASE_URL from '../config/api.js';
import OfflineStatusBar from './OfflineStatusBar.vue';
import { forceSync } from '../utils/syncEngine.js';

const emit = defineEmits(['logout']);

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const sidebarOpen = ref(false); // Cerrado por defecto
/** Nombre del administrador para el título del sidebar "Admin. …" */
const nombreAdminSidebar = ref('');

const etiquetaSidebarAdmin = computed(() => {
  const n = nombreAdminSidebar.value.trim();
  return n ? `Admin. ${n}` : 'Admin.';
});

/** Resaltar "Accesos" en mi-cuenta y en pestaña asesores (misma sección). */
const isAccessHubActive = computed(
  () => route.path.startsWith('/admin/mi-cuenta') || route.path.startsWith('/admin/vendedores')
);

/** Reparar resumen: solo sesión superusuario */
const esSuperUsuario = computed(() => {
  try {
    return localStorage.getItem('rol') === 'superusuario';
  } catch {
    return false;
  }
});

async function cargarNombreAdminSidebar() {
  const cached = localStorage.getItem('adminNombre');
  if (cached) nombreAdminSidebar.value = cached;
  const esSuper = localStorage.getItem('esSuperUsuario') === '1';
  if (esSuper) return;
  const adminId = localStorage.getItem('adminId');
  const codigoVinculacion = localStorage.getItem('codigoVinculacion');
  if (!adminId || !codigoVinculacion) return;
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/admin/mi-cuenta?adminId=${encodeURIComponent(adminId)}&codigoVinculacion=${encodeURIComponent(codigoVinculacion)}`
    );
    if (!res.ok) return;
    const data = await res.json();
    const nombre = data.nombre != null ? String(data.nombre).trim() : '';
    const usuario = data.usuario != null ? String(data.usuario).trim() : '';
    const mostrar = nombre || usuario;
    if (mostrar) {
      nombreAdminSidebar.value = mostrar;
      if (nombre) localStorage.setItem('adminNombre', nombre);
    }
  } catch (_) {
    /* silencioso: dejamos caché o "Admin." */
  }
}

let bodyScrollLock = { active: false, y: 0 };

function lockBodyScroll() {
  if (bodyScrollLock.active) return;
  const y = window.scrollY || 0;
  bodyScrollLock = { active: true, y };
  document.body.style.position = 'fixed';
  document.body.style.top = `-${y}px`;
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';
}

function unlockBodyScroll() {
  if (!bodyScrollLock.active) return;
  const y = bodyScrollLock.y || 0;
  bodyScrollLock = { active: false, y: 0 };
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  window.scrollTo(0, y);
}

const tituloHeader = computed(() => {
  if (route.path === '/admin' || route.path === '/admin/') return t('nav.clients');
  if (route.path.startsWith('/admin/crear-cliente')) return 'Nuevo cliente';
  if (route.path.startsWith('/admin/super/resumen-global')) return 'Resumen global';
  if (route.path.startsWith('/admin/super/usuarios')) return 'Gestión de usuarios';
  if (route.path.startsWith('/admin/repair-resumen')) return 'Reparar resumen (emergencia)';
  if (route.path.startsWith('/admin/super/limpiar-vendedor')) return 'Limpiar vendedor (test)';
  if (route.path.startsWith('/admin/ventas')) return t('nav.sales');
  if (route.path.startsWith('/admin/resumen')) return t('nav.summary') || 'Resumen';
  if (route.path.startsWith('/admin/rutas')) return 'Rutas';
  if (route.path.startsWith('/admin/pagos')) return t('nav.paymentHistory');
  if (route.path.startsWith('/admin/movimientos')) return t('admin.incomeExpenseNav');
  if (route.path.startsWith('/admin/mi-cuenta') || route.path.startsWith('/admin/vendedores')) return t('nav.access');
  if (route.path.startsWith('/admin/ingresos')) return t('nav.income');
  if (route.path.startsWith('/admin/egresos')) return t('nav.expenses');
  if (route.path.startsWith('/notas-dia')) return t('nav.notes');
  return t('admin.title') || 'Panel Administrativo';
});

function isActive(path) {
  if (path === '/admin') {
    return route.path === '/admin';
  }
  return route.path === path || route.path.startsWith(path + '/');
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

function closeSidebar() {
  sidebarOpen.value = false;
}

function navigateTo(path) {
  router.push(path);
  closeSidebar(); // Cerrar sidebar después de navegar
}

function forzarSync() {
  forceSync()
}

function logout() {
  try {
    localStorage.removeItem('adminNombre');
  } catch (_) {}
  emit('logout');
  closeSidebar();
}

watch(sidebarOpen, (open) => {
  if (open) lockBodyScroll();
  else unlockBodyScroll();
});

onMounted(() => {
  cargarNombreAdminSidebar();
});

onUnmounted(() => {
  unlockBodyScroll();
});
</script> 

<style scoped>
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.sidebar-scroll { -webkit-overflow-scrolling: touch; }
</style>