<template>
  <div class="min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-neutral-50 dark:bg-slate-900 transition-theme">
    <NavbarAdmin @logout="logout" />

    <div class="max-w-xl mx-auto p-4 md:p-6 space-y-6">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-slate-100">{{ $t('nav.access') }}</h1>

      <!-- Pestañas compactas (mismo estilo que otras vistas admin) -->
      <div
        class="flex rounded-xl bg-neutral-100 dark:bg-slate-700/70 p-1 border-2 border-neutral-200 dark:border-slate-600 shadow-sm"
        role="tablist"
      >
        <router-link
          to="/admin/mi-cuenta"
          class="flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold text-center transition-all"
          :class="
            esTabPropio
              ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-200 shadow-sm border border-blue-200/90 dark:border-blue-500/35'
              : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-slate-200'
          "
        >
          {{ $t('accessHub.tabSelf') }}
        </router-link>
        <router-link
          to="/admin/vendedores"
          class="flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold text-center transition-all"
          :class="
            !esTabPropio
              ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-200 shadow-sm border border-blue-200/90 dark:border-blue-500/35'
              : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-slate-200'
          "
        >
          {{ $t('accessHub.tabVendors') }}
        </router-link>
      </div>

      <!-- Mi cuenta: un solo formulario + confirmación -->
      <div v-if="esTabPropio" class="space-y-6">
          <section class="bg-white dark:bg-slate-800 rounded-xl border-2 border-neutral-200 dark:border-slate-600 overflow-hidden">
            <div class="px-5 py-3 border-b border-neutral-100 dark:border-slate-600">
              <h2 class="text-base font-semibold text-neutral-800 dark:text-slate-100">{{ $t('accessHub.unifiedCredentialsTitle') }}</h2>
            </div>
            <form class="p-5 space-y-4" @submit.prevent="solicitarConfirmacionCuenta">
              <div>
                <label class="block text-sm font-medium text-neutral-600 dark:text-slate-400 mb-1.5">{{ $t('accessHub.currentUser') }}</label>
                <div v-if="!editandoUsuario" class="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <div
                    class="flex-1 min-w-0 rounded-lg px-3 py-2.5 bg-neutral-50 dark:bg-slate-700/50 text-neutral-700 dark:text-slate-300 border border-neutral-200 dark:border-slate-600"
                  >
                    {{ cuenta.usuario || '–' }}
                  </div>
                  <button
                    type="button"
                    class="shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium border-2 border-neutral-300 dark:border-slate-600 text-neutral-800 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700"
                    @click="abrirEdicionUsuario"
                  >
                    {{ $t('common.edit') }}
                  </button>
                </div>
                <div v-else class="space-y-2">
                  <input
                    v-model="formCuenta.nuevoUsuario"
                    type="text"
                    autocomplete="username"
                    class="w-full rounded-lg px-3 py-2.5 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <div class="flex flex-wrap gap-2 justify-end">
                    <button
                      type="button"
                      class="px-4 py-2 rounded-lg text-sm border border-neutral-300 dark:border-slate-600 text-neutral-800 dark:text-slate-200"
                      @click="cancelarEdicionUsuario"
                    >
                      {{ $t('common.cancel') }}
                    </button>
                    <button
                      type="button"
                      class="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
                      @click="confirmarEdicionUsuario"
                    >
                      {{ $t('common.confirm') }}
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-600 dark:text-slate-400 mb-1.5">{{ $t('accessHub.currentPassword') }}</label>
                <input
                  v-model="formCuenta.contrasenaActual"
                  type="password"
                  autocomplete="current-password"
                  class="w-full rounded-lg px-3 py-2.5 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-600 dark:text-slate-400 mb-1.5">
                  {{ $t('accessHub.newPassword') }}
                  <span class="font-normal text-neutral-500">({{ $t('common.optional') }})</span>
                </label>
                <input
                  v-model="formCuenta.nuevaContrasena"
                  type="password"
                  autocomplete="new-password"
                  class="w-full rounded-lg px-3 py-2.5 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
              <div v-show="deseaCambiarPassword">
                <label class="block text-sm font-medium text-neutral-600 dark:text-slate-400 mb-1.5">{{ $t('accessHub.repeatPassword') }}</label>
                <input
                  v-model="formCuenta.repetirContrasena"
                  type="password"
                  autocomplete="new-password"
                  class="w-full rounded-lg px-3 py-2.5 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
                <p
                  v-if="formCuenta.nuevaContrasena && formCuenta.nuevaContrasena !== formCuenta.repetirContrasena"
                  class="text-xs text-red-600 dark:text-red-400 mt-1"
                >
                  {{ $t('accessHub.passwordMismatch') }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-600 dark:text-slate-400 mb-1.5">
                  <span class="inline-flex items-center gap-2 flex-wrap">
                    {{ $t('accessHub.recoveryEmail') }}
                    <span
                      v-if="correoRecuperacionFaltante"
                      class="inline-flex h-6 min-w-[1.5rem] px-1 shrink-0 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold leading-none shadow-sm ring-2 ring-red-600/30"
                      :title="$t('accessHub.recoveryEmailMissingWarning')"
                      role="img"
                      :aria-label="$t('accessHub.recoveryEmailMissingWarning')"
                    >
                      !
                    </span>
                  </span>
                </label>
                <div v-if="!editandoEmail" class="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <div
                    class="flex-1 min-w-0 rounded-lg px-3 py-2.5 bg-neutral-50 dark:bg-slate-700/50 text-neutral-700 dark:text-slate-300 border border-neutral-200 dark:border-slate-600"
                    :class="{ 'text-neutral-400 dark:text-slate-500 italic': !String(formCuenta.email || '').trim() }"
                  >
                    {{ emailMostrado }}
                  </div>
                  <button
                    type="button"
                    class="shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium border-2 border-neutral-300 dark:border-slate-600 text-neutral-800 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700"
                    @click="abrirEdicionEmail"
                  >
                    {{ $t('common.edit') }}
                  </button>
                </div>
                <div v-else class="space-y-2">
                  <input
                    v-model="formCuenta.email"
                    type="email"
                    autocomplete="email"
                    class="w-full rounded-lg px-3 py-2.5 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    :placeholder="$t('accessHub.recoveryEmailPlaceholder')"
                  />
                  <p v-if="emailInvalido" class="text-xs text-red-600 dark:text-red-400">{{ $t('accessHub.invalidEmail') }}</p>
                  <div class="flex flex-wrap gap-2 justify-end">
                    <button
                      type="button"
                      class="px-4 py-2 rounded-lg text-sm border border-neutral-300 dark:border-slate-600 text-neutral-800 dark:text-slate-200"
                      @click="cancelarEdicionEmail"
                    >
                      {{ $t('common.cancel') }}
                    </button>
                    <button
                      type="button"
                      :disabled="guardandoEmail"
                      class="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                      @click="confirmarEdicionEmail"
                    >
                      {{ guardandoEmail ? $t('accessHub.saving') : $t('common.confirm') }}
                    </button>
                  </div>
                </div>
              </div>
              <div
                v-if="estadoEnvioCorreo"
                class="rounded-lg border px-3 py-2.5 text-xs space-y-2"
                :class="
                  !estadoEnvioCorreo.hintCode
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-200'
                    : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100'
                "
              >
                <p class="font-semibold">{{ $t('accessHub.mailServerStatusTitle') }}</p>
                <ul class="list-none space-y-1 opacity-95">
                  <li>{{ $t('accessHub.mailCheckSmtpHost') }}: {{ estadoEnvioCorreo.smtpHostSet ? '✓' : '—' }}</li>
                  <li>{{ $t('accessHub.mailCheckSmtpUser') }}: {{ estadoEnvioCorreo.smtpUserSet ? '✓' : '—' }}</li>
                  <li>{{ $t('accessHub.mailCheckSmtpPass') }}: {{ estadoEnvioCorreo.smtpPassSet ? '✓' : '—' }}</li>
                  <li>{{ $t('accessHub.mailCheckFrontendUrl') }}: {{ estadoEnvioCorreo.hasFrontendUrl ? '✓' : '—' }}</li>
                  <li>{{ $t('accessHub.mailCheckMailFrom') }}: {{ estadoEnvioCorreo.mailFromSet ? '✓' : '—' }}</li>
                </ul>
                <p v-if="mensajeHintCorreoServidor" class="leading-snug border-t border-amber-200/80 dark:border-amber-800/50 pt-2 mt-1">
                  {{ mensajeHintCorreoServidor }}
                </p>
              </div>
              <p v-if="msgCuenta.error" class="text-sm text-red-600 dark:text-red-400">{{ msgCuenta.error }}</p>
              <p v-if="msgCuenta.ok" class="text-sm text-green-600 dark:text-green-400">{{ msgCuenta.ok }}</p>
              <button
                type="submit"
                :disabled="guardandoCuenta || !puedeGuardarCuentaUnificada"
                class="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                {{ guardandoCuenta ? $t('accessHub.saving') : $t('accessHub.saveChanges') }}
              </button>
            </form>
          </section>
      </div>

      <!-- Asesores -->
      <div v-else class="space-y-4">
        <p v-if="errorMsgV" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{{ errorMsgV }}</p>
        <p v-if="okMsgV" class="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">{{ okMsgV }}</p>

        <div v-if="!cargandoVendedores && listaVendedores.length === 0" class="text-neutral-500 dark:text-slate-400 text-center py-8 rounded-xl border border-dashed border-neutral-300 dark:border-slate-600">
          {{ $t('accessHub.vendorListEmpty') }}
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="v in listaVendedores"
            :key="v._id"
            class="bg-white dark:bg-slate-800 rounded-xl border-2 border-neutral-200 dark:border-slate-600 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div class="min-w-0">
              <div class="font-semibold text-neutral-900 dark:text-slate-100 truncate">{{ v.nombre }}</div>
              <div class="text-sm text-neutral-600 dark:text-slate-400">{{ $t('login.username') }}: {{ v.usuario }}</div>
              <div v-if="v.pais || v.ciudad" class="text-xs text-neutral-500 dark:text-slate-500 mt-0.5">
                {{ [v.ciudad, v.pais].filter(Boolean).join(', ') }}
              </div>
            </div>
            <button
              type="button"
              class="shrink-0 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              @click="abrirModalVendedor(v)"
            >
              {{ $t('common.edit') }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <button
          type="button"
          @click="volver"
          class="text-sm font-medium text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-slate-200"
        >
          {{ $t('accessHub.backToPanel') }}
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="modalConfirmarCuenta"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
        role="dialog"
        aria-modal="true"
        @click.self="modalConfirmarCuenta = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-xl border-2 border-neutral-200 dark:border-slate-600 shadow-xl max-w-md w-full p-6 space-y-4">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-slate-100">{{ $t('accessHub.confirmTitle') }}</h3>
          <p class="text-sm text-neutral-600 dark:text-slate-400">{{ $t('accessHub.confirmIntro') }}</p>
          <ul class="list-disc pl-5 text-sm text-neutral-800 dark:text-slate-200 space-y-1">
            <li v-if="resumenConfirmacion.cambioUsuario">
              <span class="font-medium">{{ $t('accessHub.confirmWillChangeUser') }}:</span>
              {{ resumenConfirmacion.nuevoUsuario }}
            </li>
            <li v-if="resumenConfirmacion.cambioPassword">{{ $t('accessHub.confirmWillChangePassword') }}</li>
          </ul>
          <div class="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-2">
            <button
              type="button"
              class="w-full sm:w-auto px-4 py-2 rounded-lg text-sm border border-neutral-300 dark:border-slate-600 text-neutral-800 dark:text-slate-200"
              @click="modalConfirmarCuenta = false"
            >
              {{ $t('accessHub.confirmCancel') }}
            </button>
            <button
              type="button"
              :disabled="guardandoCuenta"
              class="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              @click="aplicarCambiosCuentaConfirmados"
            >
              {{ guardandoCuenta ? $t('accessHub.saving') : $t('accessHub.confirmApply') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="modalVendedor"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
        role="dialog"
        aria-modal="true"
        @click.self="modalVendedor = null"
      >
        <div class="bg-white dark:bg-slate-800 rounded-xl border-2 border-neutral-200 dark:border-slate-600 shadow-xl max-w-md w-full p-6 space-y-4">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-slate-100">{{ $t('admin.vendorAccess') }}</h3>
          <p class="text-sm text-neutral-600 dark:text-slate-400">{{ modalVendedor.nombre }}</p>
          <div>
            <label class="block text-sm font-medium text-neutral-600 dark:text-slate-400 mb-1">{{ $t('login.username') }}</label>
            <input
              v-model="formVendedor.usuario"
              type="text"
              autocomplete="username"
              class="w-full rounded-lg px-3 py-2 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-600 dark:text-slate-400 mb-1">{{ $t('accessHub.newPasswordOptional') }}</label>
            <input
              v-model="formVendedor.contrasena"
              type="password"
              autocomplete="new-password"
              :placeholder="$t('accessHub.leaveEmptyPassword')"
              class="w-full rounded-lg px-3 py-2 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <p v-if="modalVendedorError" class="text-sm text-red-600 dark:text-red-400">{{ modalVendedorError }}</p>
          <div class="flex gap-2 justify-end pt-2">
            <button type="button" class="px-4 py-2 rounded-lg text-sm border border-neutral-300 dark:border-slate-600 text-neutral-800 dark:text-slate-200" @click="modalVendedor = null">
              {{ $t('common.cancel') }}
            </button>
            <button
              type="button"
              :disabled="guardandoVendedor"
              class="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              @click="guardarModalVendedor"
            >
              {{ guardandoVendedor ? $t('accessHub.saving') : $t('accessHub.modalSave') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NavbarAdmin from '../components/NavbarAdmin.vue'
import API_BASE_URL from '../config/api.js'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const esTabPropio = computed(() => route.name === 'MiCuentaAdmin')

const cargando = ref(true)
const guardandoCuenta = ref(false)
const guardandoEmail = ref(false)
const msgCuenta = ref({ error: '', ok: '' })
const modalConfirmarCuenta = ref(false)

const cuenta = ref({ usuario: '', nombre: '', email: '' })
const formCuenta = ref({
  nuevoUsuario: '',
  contrasenaActual: '',
  nuevaContrasena: '',
  repetirContrasena: '',
  email: ''
})
/** Modo edición de nombre de usuario (inline). */
const editandoUsuario = ref(false)
/** Modo edición de correo de recuperación (inline). */
const editandoEmail = ref(false)

/** Estado SMTP en el servidor (GET /api/admin/mail-delivery-status). */
const estadoEnvioCorreo = ref(null)

const mensajeHintCorreoServidor = computed(() => {
  const s = estadoEnvioCorreo.value
  if (!s?.hintCode) return ''
  return t(`accessHub.mailHints.${s.hintCode}`)
})

const listaVendedores = ref([])
const cargandoVendedores = ref(true)
const errorMsgV = ref('')
const okMsgV = ref('')
const modalVendedor = ref(null)
const formVendedor = ref({ usuario: '', contrasena: '' })
const modalVendedorError = ref('')
const guardandoVendedor = ref(false)

const deseaCambiarUsuario = computed(() => {
  const n = String(formCuenta.value.nuevoUsuario || '').trim()
  if (!n) return false
  return n !== String(cuenta.value.usuario || '').trim()
})

const deseaCambiarPassword = computed(() => {
  const n = String(formCuenta.value.nuevaContrasena || '').trim()
  return n !== ''
})

const emailInvalido = computed(() => {
  const e = String(formCuenta.value.email || '').trim()
  if (!e) return false
  return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
})

/** Texto del correo en solo lectura (formulario sincronizado con BD tras guardar con «Confirmar»). */
const emailMostrado = computed(() => {
  const e = String(formCuenta.value.email || '').trim()
  return e || t('accessHub.recoveryEmailNotSet')
})

/** Aviso rojo: falta correo o el texto no es un correo válido. */
const correoRecuperacionFaltante = computed(() => {
  const e = String(formCuenta.value.email || '').trim()
  if (!e) return true
  return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
})

const passwordCoincide = computed(() => {
  if (!deseaCambiarPassword.value) return true
  return formCuenta.value.nuevaContrasena === formCuenta.value.repetirContrasena
})

const puedeGuardarCuentaUnificada = computed(() => {
  if (editandoUsuario.value || editandoEmail.value) return false
  if (!String(formCuenta.value.contrasenaActual || '').trim()) return false
  if (!deseaCambiarUsuario.value && !deseaCambiarPassword.value) return false
  if (deseaCambiarPassword.value && !passwordCoincide.value) return false
  return true
})

const resumenConfirmacion = computed(() => ({
  cambioUsuario: deseaCambiarUsuario.value,
  cambioPassword: deseaCambiarPassword.value,
  nuevoUsuario: String(formCuenta.value.nuevoUsuario || '').trim()
}))

function codigoVinculacion() {
  return localStorage.getItem('codigoVinculacion') || ''
}

async function cargarCuenta() {
  const adminId = localStorage.getItem('adminId')
  const codigo = codigoVinculacion()
  if (!adminId || !codigo) {
    router.replace('/')
    return
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/mi-cuenta?adminId=${encodeURIComponent(adminId)}&codigoVinculacion=${encodeURIComponent(codigo)}`)
    if (res.ok) {
      cuenta.value = await res.json()
      formCuenta.value.email = String(cuenta.value.email || '').trim()
      const n = cuenta.value.nombre != null ? String(cuenta.value.nombre).trim() : ''
      if (n) localStorage.setItem('adminNombre', n)
    } else {
      cuenta.value = { usuario: '', nombre: '', email: '' }
    }
  } catch (e) {
    console.error(e)
    cuenta.value = { usuario: '', nombre: '', email: '' }
  } finally {
    cargando.value = false
  }
}

async function cargarEstadoEnvioCorreo() {
  estadoEnvioCorreo.value = null
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/mail-delivery-status`, { cache: 'no-store' })
    if (res.ok) estadoEnvioCorreo.value = await res.json()
  } catch (_) {
    estadoEnvioCorreo.value = null
  }
}

async function cargarVendedores() {
  const c = codigoVinculacion()
  if (!c) {
    listaVendedores.value = []
    cargandoVendedores.value = false
    return
  }
  cargandoVendedores.value = true
  errorMsgV.value = ''
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/vendedores?codigoVinculacion=${encodeURIComponent(c)}`, { cache: 'no-store' })
    listaVendedores.value = res.ok ? await res.json() : []
  } catch (e) {
    console.error(e)
    errorMsgV.value = t('admin.loadVendorsError')
  } finally {
    cargandoVendedores.value = false
  }
}

function abrirEdicionUsuario() {
  msgCuenta.value = { error: '', ok: '' }
  editandoUsuario.value = true
  formCuenta.value.nuevoUsuario = String(formCuenta.value.nuevoUsuario || '').trim()
    ? formCuenta.value.nuevoUsuario
    : String(cuenta.value.usuario || '')
}

function cancelarEdicionUsuario() {
  editandoUsuario.value = false
  formCuenta.value.nuevoUsuario = ''
  msgCuenta.value = { error: '', ok: '' }
}

function confirmarEdicionUsuario() {
  const n = String(formCuenta.value.nuevoUsuario || '').trim()
  if (!n) {
    msgCuenta.value = { error: t('accessHub.userEmptyName'), ok: '' }
    return
  }
  if (n === String(cuenta.value.usuario || '').trim()) {
    formCuenta.value.nuevoUsuario = ''
  }
  editandoUsuario.value = false
  msgCuenta.value = { error: '', ok: '' }
}

function abrirEdicionEmail() {
  msgCuenta.value = { error: '', ok: '' }
  editandoEmail.value = true
  formCuenta.value.email = String(cuenta.value.email || '').trim()
}

function cancelarEdicionEmail() {
  editandoEmail.value = false
  formCuenta.value.email = String(cuenta.value.email || '').trim()
  msgCuenta.value = { error: '', ok: '' }
}

async function confirmarEdicionEmail() {
  msgCuenta.value = { error: '', ok: '' }
  const e = String(formCuenta.value.email || '').trim()
  if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    msgCuenta.value = { error: t('accessHub.invalidEmail'), ok: '' }
    return
  }
  if (e === String(cuenta.value.email || '').trim()) {
    editandoEmail.value = false
    return
  }
  guardandoEmail.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/mi-cuenta/email`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: e })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      msgCuenta.value = { error: data.error || data.mensaje || t('common.error'), ok: '' }
      return
    }
    const saved = data.email != null ? String(data.email).trim() : e
    cuenta.value.email = saved
    formCuenta.value.email = saved
    editandoEmail.value = false
    msgCuenta.value = { error: '', ok: t('accessHub.recoveryEmailSaved') }
  } catch (err) {
    console.error(err)
    msgCuenta.value = { error: t('common.error'), ok: '' }
  } finally {
    guardandoEmail.value = false
  }
}

function solicitarConfirmacionCuenta() {
  msgCuenta.value = { error: '', ok: '' }
  if (editandoUsuario.value) {
    msgCuenta.value.error = t('accessHub.finishUserEditFirst')
    return
  }
  if (editandoEmail.value) {
    msgCuenta.value.error = t('accessHub.finishEmailEditFirst')
    return
  }
  if (!String(formCuenta.value.contrasenaActual || '').trim()) {
    msgCuenta.value.error = t('accessHub.currentPasswordRequired')
    return
  }
  if (!deseaCambiarUsuario.value && !deseaCambiarPassword.value) {
    msgCuenta.value.error = t('accessHub.nothingToChange')
    return
  }
  if (deseaCambiarPassword.value && !passwordCoincide.value) {
    msgCuenta.value.error = t('accessHub.passwordMismatch')
    return
  }
  modalConfirmarCuenta.value = true
}

async function aplicarCambiosCuentaConfirmados() {
  if (guardandoCuenta.value) return
  const doUser = deseaCambiarUsuario.value
  const doPass = deseaCambiarPassword.value
  modalConfirmarCuenta.value = false
  msgCuenta.value = { error: '', ok: '' }

  const adminId = localStorage.getItem('adminId')
  const codigo = codigoVinculacion()
  if (!adminId || !codigo) {
    msgCuenta.value.error = t('common.error')
    return
  }

  const pwdActual = String(formCuenta.value.contrasenaActual || '').trim()
  guardandoCuenta.value = true
  try {
    const payload = {
      adminId,
      codigoVinculacion: codigo,
      contrasenaActual: pwdActual
    }
    if (doUser) payload.nuevoUsuario = String(formCuenta.value.nuevoUsuario || '').trim()
    if (doPass) payload.nuevaContrasena = String(formCuenta.value.nuevaContrasena || '').trim()

    const res = await fetch(`${API_BASE_URL}/api/admin/mi-cuenta`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.exito) {
      msgCuenta.value.error = data.error || data.mensaje || t('common.error')
      return
    }
    if (doUser) cuenta.value.usuario = payload.nuevoUsuario
    msgCuenta.value.ok = t('common.success')
    formCuenta.value = {
      nuevoUsuario: '',
      contrasenaActual: '',
      nuevaContrasena: '',
      repetirContrasena: '',
      email: String(cuenta.value.email || '')
    }
    setTimeout(() => {
      localStorage.removeItem('rol')
      localStorage.removeItem('adminId')
      localStorage.removeItem('adminNombre')
      localStorage.removeItem('codigoVinculacion')
      localStorage.removeItem('sessionToken')
      router.replace('/')
    }, 1500)
  } catch (e) {
    console.error(e)
    msgCuenta.value.error = t('common.error')
  } finally {
    guardandoCuenta.value = false
  }
}

function abrirModalVendedor(v) {
  modalVendedorError.value = ''
  okMsgV.value = ''
  modalVendedor.value = v
  formVendedor.value = { usuario: v.usuario || '', contrasena: '' }
}

async function guardarModalVendedor() {
  if (!modalVendedor.value) return
  modalVendedorError.value = ''
  const c = codigoVinculacion()
  const usuario = String(formVendedor.value.usuario || '').trim()
  const contrasena = String(formVendedor.value.contrasena || '').trim()
  if (!usuario && !contrasena) {
    modalVendedorError.value = t('accessHub.mustProvideUserOrPass')
    return
  }
  guardandoVendedor.value = true
  try {
    const body = { codigoVinculacion: c }
    if (usuario) body.usuario = usuario
    if (contrasena) body.contrasena = contrasena
    const res = await fetch(`${API_BASE_URL}/api/admin/vendedores/${modalVendedor.value._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      modalVendedorError.value = data.error || t('common.error')
      return
    }
    okMsgV.value = data.mensaje || t('common.success')
    modalVendedor.value = null
    await cargarVendedores()
  } catch (e) {
    modalVendedorError.value = t('common.error')
  } finally {
    guardandoVendedor.value = false
  }
}

function volver() {
  router.push('/admin')
}

function logout() {
  try {
    localStorage.removeItem('rol')
    localStorage.removeItem('adminId')
    localStorage.removeItem('adminNombre')
    localStorage.removeItem('vendedorId')
    localStorage.removeItem('codigoVinculacion')
    localStorage.removeItem('sessionToken')
  } catch (_) {}
  router.replace('/')
}

watch(
  () => route.name,
  async () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (route.name === 'MiCuentaAdmin') await cargarEstadoEnvioCorreo()
  }
)

onMounted(async () => {
  await cargarCuenta()
  await cargarEstadoEnvioCorreo()
  await cargarVendedores()
})
</script>
