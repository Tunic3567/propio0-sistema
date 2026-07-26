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
        <button
          class="flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold text-center transition-all"
          :class="
            esTabPropio
              ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-200 shadow-sm border border-blue-200/90 dark:border-blue-500/35'
              : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-slate-200'
          "
          @click="tabActivo = 'cuenta'"
        >
          {{ $t('accessHub.tabSelf') }}
        </button>
        <button
          class="flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold text-center transition-all relative"
          :class="
            esTabLlaves
              ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-200 shadow-sm border border-blue-200/90 dark:border-blue-500/35'
              : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-slate-200'
          "
          @click="tabActivo = 'llaves'"
        >
          {{ $t('accessHub.tabLlaves') }}
          <span
            v-if="llavesPendientes > 0"
            class="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-600 rounded-full shadow-sm"
          >{{ llavesPendientes }}</span>
        </button>
        <button
          class="flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold text-center transition-all"
          :class="
            !esTabPropio && !esTabLlaves
              ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-200 shadow-sm border border-blue-200/90 dark:border-blue-500/35'
              : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-slate-200'
          "
          @click="tabActivo = 'vendedores'"
        >
          {{ $t('accessHub.tabVendors') }}
        </button>
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
                    {{ usuarioMostrado }}
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
                <p v-if="!editandoUsuario && deseaCambiarUsuario && !msgCuenta.error" class="text-red-500 dark:text-red-400 text-xs mt-2 leading-tight">
                  {{ $t('accessHub.pendingUserChangeHint') }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-600 dark:text-slate-400 mb-1.5">{{ $t('accessHub.currentPassword') }}</label>
                <div class="relative">
                  <input
                    v-model="formCuenta.contrasenaActual"
                    :type="showPass.actual ? 'text' : 'password'"
                    autocomplete="current-password"
                    class="w-full rounded-lg px-3 py-2.5 pr-10 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <button type="button" @click="showPass.actual = !showPass.actual" class="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-slate-200">
                    <svg v-if="!showPass.actual" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/></svg>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-600 dark:text-slate-400 mb-1.5">
                  {{ $t('accessHub.newPassword') }}
                  <span class="font-normal text-neutral-500">({{ $t('common.optional') }})</span>
                </label>
                <div class="relative">
                  <input
                    v-model="formCuenta.nuevaContrasena"
                    :type="showPass.nueva ? 'text' : 'password'"
                    autocomplete="new-password"
                    class="w-full rounded-lg px-3 py-2.5 pr-10 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <button type="button" @click="showPass.nueva = !showPass.nueva" class="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-slate-200">
                    <svg v-if="!showPass.nueva" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/></svg>
                  </button>
                </div>
              </div>
              <div v-show="deseaCambiarPassword">
                <label class="block text-sm font-medium text-neutral-600 dark:text-slate-400 mb-1.5">{{ $t('accessHub.repeatPassword') }}</label>
                <div class="relative">
                  <input
                    v-model="formCuenta.repetirContrasena"
                    :type="showPass.repetir ? 'text' : 'password'"
                    autocomplete="new-password"
                    class="w-full rounded-lg px-3 py-2.5 pr-10 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <button type="button" @click="showPass.repetir = !showPass.repetir" class="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-slate-200">
                    <svg v-if="!showPass.repetir" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/></svg>
                  </button>
                </div>
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
                v-if="esSuperUsuario && estadoEnvioCorreo"
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

      <!-- Llaves -->
      <div v-else-if="esTabLlaves" class="space-y-4">
        <section class="bg-white dark:bg-slate-800 rounded-xl border-2 border-neutral-200 dark:border-slate-600 overflow-hidden">
          <div class="px-5 py-3 border-b border-neutral-100 dark:border-slate-600 flex items-center gap-3">
            <svg class="w-5 h-5 text-neutral-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
            <h2 class="text-base font-semibold text-neutral-800 dark:text-slate-100">Llaves de seguridad</h2>
          </div>
          <div class="p-5 space-y-6">
            <p class="text-sm text-neutral-500 dark:text-slate-400 leading-relaxed">
              Configura topes para ventas, ingresos y egresos. Cuando un vendedor exceda el tope, deberá solicitar una llave para continuar.
            </p>

            <!-- VENTAS -->
            <div class="rounded-lg border border-neutral-200 dark:border-slate-600 overflow-hidden">
              <div class="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-slate-700/50 border-b border-neutral-200 dark:border-slate-600">
                <span class="text-sm font-semibold text-neutral-700 dark:text-slate-300">Límite de ventas</span>
                <button type="button" role="switch" :aria-checked="configLlaves.activado"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  :class="configLlaves.activado ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-slate-600'"
                  @click="configLlaves.activado = !configLlaves.activado; guardarConfigLlaves()">
                  <span class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200" :class="configLlaves.activado ? 'translate-x-5' : 'translate-x-0'"></span>
                </button>
              </div>
              <div v-if="configLlaves.activado" class="p-4">
                <label class="block text-sm font-medium text-neutral-600 dark:text-slate-400 mb-1.5">Valor tope</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-slate-400 font-semibold text-sm">$</span>
                  <input v-model.number="topeInput" type="number" min="0" step="1000"
                    class="w-full rounded-lg pl-8 pr-3 py-2.5 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
                </div>
              </div>
            </div>

            <!-- INGRESOS -->
            <div class="rounded-lg border border-neutral-200 dark:border-slate-600 overflow-hidden">
              <div class="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-slate-700/50 border-b border-neutral-200 dark:border-slate-600">
                <span class="text-sm font-semibold text-neutral-700 dark:text-slate-300">Límite de ingresos</span>
                <button type="button" role="switch" :aria-checked="configLlaves.activadoIngresos"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  :class="configLlaves.activadoIngresos ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-slate-600'"
                  @click="configLlaves.activadoIngresos = !configLlaves.activadoIngresos; guardarConfigLlaves()">
                  <span class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200" :class="configLlaves.activadoIngresos ? 'translate-x-5' : 'translate-x-0'"></span>
                </button>
              </div>
              <div v-if="configLlaves.activadoIngresos" class="p-4">
                <label class="block text-sm font-medium text-neutral-600 dark:text-slate-400 mb-1.5">Valor tope</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-slate-400 font-semibold text-sm">$</span>
                  <input v-model.number="topeInputIngresos" type="number" min="0" step="1000"
                    class="w-full rounded-lg pl-8 pr-3 py-2.5 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
                </div>
              </div>
            </div>

            <!-- EGRESOS -->
            <div class="rounded-lg border border-neutral-200 dark:border-slate-600 overflow-hidden">
              <div class="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-slate-700/50 border-b border-neutral-200 dark:border-slate-600">
                <span class="text-sm font-semibold text-neutral-700 dark:text-slate-300">Límite de egresos</span>
                <button type="button" role="switch" :aria-checked="configLlaves.activadoEgresos"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  :class="configLlaves.activadoEgresos ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-slate-600'"
                  @click="configLlaves.activadoEgresos = !configLlaves.activadoEgresos; guardarConfigLlaves()">
                  <span class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200" :class="configLlaves.activadoEgresos ? 'translate-x-5' : 'translate-x-0'"></span>
                </button>
              </div>
              <div v-if="configLlaves.activadoEgresos" class="p-4">
                <label class="block text-sm font-medium text-neutral-600 dark:text-slate-400 mb-1.5">Valor tope</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-slate-400 font-semibold text-sm">$</span>
                  <input v-model.number="topeInputEgresos" type="number" min="0" step="1000"
                    class="w-full rounded-lg pl-8 pr-3 py-2.5 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
                </div>
              </div>
            </div>

            <!-- Botón guardar general -->
            <button type="button" :disabled="guardandoConfig"
              class="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              @click="guardarConfigLlaves">
              {{ guardandoConfig ? 'Guardando…' : 'Guardar configuración' }}
            </button>
            <p v-if="msgLlaves.error" class="text-sm text-red-600 dark:text-red-400">{{ msgLlaves.error }}</p>
            <p v-if="msgLlaves.ok" class="text-sm text-green-600 dark:text-green-400">{{ msgLlaves.ok }}</p>

            <!-- Solicitudes pendientes -->
            <div v-if="solicitudes.length > 0" class="pt-3 border-t border-neutral-200 dark:border-slate-600">
              <h3 class="text-sm font-semibold text-neutral-700 dark:text-slate-300 mb-3">
                Solicitudes pendientes ({{ solicitudesPendientes.length }})
              </h3>
              <div class="space-y-3">
                <div v-for="s in solicitudesPendientes" :key="s._id"
                  class="rounded-lg border border-amber-200 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/20 px-4 py-3">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div class="text-sm space-y-0.5">
                      <p class="font-medium text-neutral-800 dark:text-slate-200">{{ s.vendedorId?.nombre || '—' }}</p>
                      <p class="text-neutral-600 dark:text-slate-400">
                        <span class="inline-block text-xs font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-slate-600 text-neutral-700 dark:text-slate-300 mr-1">{{ s.tipo || 'venta' }}</span>
                        <span v-if="s.tipo === 'ingreso' || s.tipo === 'egreso'">
                          Valor: <span class="font-semibold tabular-nums">${{ formatNum(s.valorVenta, 0) }}</span>
                        </span>
                        <span v-else>
                          Venta: <span class="font-semibold tabular-nums">${{ formatNum(s.valorVenta, 0) }}</span>
                        </span>
                        &middot; Tope: <span class="font-semibold tabular-nums">${{ formatNum(s.tope, 0) }}</span>
                      </p>
                      <p class="text-xs text-neutral-500 dark:text-slate-500">{{ new Date(s.fechaCreacion).toLocaleString('es-ES') }}</p>
                    </div>
                    <div class="flex gap-2 shrink-0">
                      <button type="button" :disabled="s._aprobando"
                        class="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                        @click="aprobarLlave(s)">
                        {{ s._aprobando ? '…' : '✅ Aprobar' }}
                      </button>
                      <button type="button" :disabled="s._denegando"
                        class="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                        @click="denegarLlave(s)">
                        {{ s._denegando ? '…' : '❌ Denegar' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Asesores -->
      <div v-else class="space-y-4">
        <p v-if="errorMsgV" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{{ errorMsgV }}</p>
        <p v-if="okMsgV" class="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">{{ okMsgV }}</p>

        <div v-if="listaVendedores.length > 1" class="flex justify-end">
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-sm font-medium bg-neutral-200 dark:bg-slate-700 text-neutral-700 dark:text-slate-200 hover:bg-neutral-300 dark:hover:bg-slate-600 transition-colors"
            @click="abrirReordenar"
          >Reordenar</button>
        </div>

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
            <label class="block text-sm font-medium text-neutral-600 dark:text-slate-400 mb-1">{{ $t('client.name') }}</label>
            <input
              v-model="formVendedor.nombre"
              type="text"
              autocomplete="off"
              class="w-full rounded-lg px-3 py-2 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
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
            <div class="relative">
              <input
                v-model="formVendedor.contrasena"
                :type="showPass.vendedor ? 'text' : 'password'"
                autocomplete="new-password"
                :placeholder="$t('accessHub.leaveEmptyPassword')"
                class="w-full rounded-lg px-3 py-2 pr-10 border border-neutral-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30"
              />
              <button type="button" @click="showPass.vendedor = !showPass.vendedor" class="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-slate-200">
                <svg v-if="!showPass.vendedor" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/></svg>
              </button>
            </div>
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

    <!-- Modal reordenar asesores -->
    <Teleport to="body">
      <div v-if="modalReordenar" class="fixed inset-0 z-[200] flex items-center justify-center p-4" @click.self="modalReordenar = false">
        <div class="absolute inset-0 bg-black/50" @click="modalReordenar = false"></div>
        <div class="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-neutral-200 dark:border-slate-700 p-6 w-full max-w-md space-y-4">
          <h2 class="text-lg font-bold text-neutral-800 dark:text-slate-100">Reordenar asesores</h2>
          <p class="text-sm text-neutral-500 dark:text-slate-400">Usa las flechas para cambiar el orden. Los cambios se aplican al guardar.</p>
          <div class="space-y-2 max-h-80 overflow-y-auto">
            <div
              v-for="(v, i) in reordenLista"
              :key="v._id"
              class="flex items-center gap-3 bg-neutral-50 dark:bg-slate-700/50 rounded-lg px-3 py-2.5 border border-neutral-200 dark:border-slate-600"
            >
              <span class="text-xs font-mono text-neutral-400 dark:text-slate-500 w-5 shrink-0">{{ i + 1 }}.</span>
              <span class="flex-1 text-sm font-medium text-neutral-800 dark:text-slate-200 truncate">{{ v.nombre }}</span>
              <div class="flex gap-1 shrink-0">
                <button
                  type="button"
                  :disabled="i === 0"
                  class="p-1.5 rounded-lg text-neutral-600 dark:text-slate-400 hover:bg-neutral-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  @click="moverArriba(i)"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                </button>
                <button
                  type="button"
                  :disabled="i === reordenLista.length - 1"
                  class="p-1.5 rounded-lg text-neutral-600 dark:text-slate-400 hover:bg-neutral-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  @click="moverAbajo(i)"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
            </div>
          </div>
          <p v-if="reordenError" class="text-sm text-red-600 dark:text-red-400">{{ reordenError }}</p>
          <div class="flex gap-2 justify-end pt-2">
            <button type="button" class="px-4 py-2 rounded-lg text-sm border border-neutral-300 dark:border-slate-600 text-neutral-800 dark:text-slate-200" @click="modalReordenar = false">
              {{ $t('common.cancel') }}
            </button>
            <button
              type="button"
              :disabled="guardandoReorden"
              class="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              @click="guardarReorden"
            >
              {{ guardandoReorden ? 'Guardando…' : 'Guardar orden' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal código llave generado -->
    <Teleport to="body">
      <div v-if="modalCodigoLlave" class="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="cerrarModalCodigoLlave"></div>
        <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full border-2 border-amber-300/50 dark:border-amber-700/50 transition-all duration-300">
          <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-amber-50 to-white dark:from-slate-800 dark:to-slate-800 rounded-t-2xl">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-10 h-10 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Llave generada</h2>
            </div>
          </div>
            <div class="p-6 space-y-4">
            <p class="text-sm text-gray-600 dark:text-gray-400 text-center">Comparte este código con el vendedor:</p>
            <div class="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-700/60 rounded-xl p-4 text-center">
              <span class="text-3xl font-bold font-mono tracking-[0.25em] text-amber-800 dark:text-amber-300 select-all">{{ codigoLlaveGenerado }}</span>
            </div>
            <div class="text-center">
              <span
                class="inline-flex items-center gap-1.5 text-sm font-medium"
                :class="tiempoRestante === 'Expirado' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ tiempoRestante ? 'Válido por ' + tiempoRestante : '' }}
              </span>
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                @click="compartirCodigoLlave"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                Compartir
              </button>
              <button
                type="button"
                class="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                @click="eliminarSolicitud"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                Eliminar
              </button>
            </div>
            <div class="flex justify-center pt-1">
              <button
                type="button"
                class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline transition-colors"
                @click="cerrarModalCodigoLlave"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal confirmar denegar solicitud -->
    <Teleport to="body">
      <div v-if="modalDenegar" class="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 dark:bg-black/70" @click="modalDenegar = false"></div>
        <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full border-2 border-red-300/50 dark:border-red-700/50 transition-all duration-300">
          <div class="p-6 border-b-2 border-[#1E293B]/15 dark:border-[#1E293B]/50 bg-gradient-to-r from-red-50 to-white dark:from-slate-800 dark:to-slate-800 rounded-t-2xl">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-10 h-10 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Denegar solicitud</h2>
            </div>
          </div>
          <div class="p-6 space-y-4">
            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              ¿Estás seguro de denegar la solicitud de <strong class="text-gray-900 dark:text-gray-100">{{ solicitudDenegar?.vendedorId?.nombre || 'este vendedor' }}</strong>?
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Venta: <span class="font-semibold text-gray-800 dark:text-gray-200">${{ solicitudDenegar ? formatNum(solicitudDenegar.valorVenta, 0) : '—' }}</span>
            </p>
            <div class="flex gap-2 pt-2">
              <button
                type="button"
                class="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border-2 border-neutral-300 dark:border-slate-600 text-neutral-800 dark:text-slate-200 hover:bg-neutral-100 dark:hover:bg-slate-700 transition-colors"
                @click="modalDenegar = false"
              >
                Cancelar
              </button>
              <button
                type="button"
                :disabled="denegandoEnCurso"
                class="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-colors"
                @click="confirmarDenegar"
              >
                {{ denegandoEnCurso ? 'Denegando…' : 'Denegar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NavbarAdmin from '../components/NavbarAdmin.vue'
import API_BASE_URL from '../config/api.js'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const tabActivo = ref('cuenta')
const esTabPropio = computed(() => tabActivo.value === 'cuenta')
const esTabLlaves = computed(() => tabActivo.value === 'llaves')

const cargando = ref(true)
const guardandoCuenta = ref(false)
const guardandoEmail = ref(false)
const msgCuenta = ref({ error: '', ok: '' })
const modalConfirmarCuenta = ref(false)

const cuenta = ref({ usuario: '', nombre: '', email: '' })
const showPass = ref({ actual: false, nueva: false, repetir: false, vendedor: false })
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
const formVendedor = ref({ nombre: '', usuario: '', contrasena: '' })
const modalVendedorError = ref('')
const guardandoVendedor = ref(false)

// Reordenar asesores
const modalReordenar = ref(false)
const reordenLista = ref([])
const guardandoReorden = ref(false)
const reordenError = ref('')

// ========== Llaves ==========
const configLlaves = ref({ activado: false, tope: 0, activadoIngresos: false, topeIngresos: 0, activadoEgresos: false, topeEgresos: 0 })
const topeInput = ref(0)
const topeInputIngresos = ref(0)
const topeInputEgresos = ref(0)
const guardandoConfig = ref(false)
const msgLlaves = ref({ error: '', ok: '' })
const solicitudes = ref([])
let llavesPollTimer = null
let ultimoConteoSolicitudes = 0

const solicitudesPendientes = computed(() =>
  solicitudes.value.filter(s => s.estado === 'pendiente')
)

// Modal denegar
const modalDenegar = ref(false)
const solicitudDenegar = ref(null)
const denegandoEnCurso = ref(false)

// Modal código llave
const modalCodigoLlave = ref(false)
const codigoLlaveGenerado = ref('')
const solicitudCodigoActual = ref(null)
const fechaExpiracionLlave = ref(null)
const tiempoRestante = ref('')
let timerLlaveInterval = null

function iniciarTimerLlave(msRestantes) {
  detenerTimerLlave()
  tiempoRestante.value = formatearTiempo(msRestantes)
  timerLlaveInterval = setInterval(() => {
    const ahora = Date.now()
    const expiracion = fechaExpiracionLlave.value ? new Date(fechaExpiracionLlave.value).getTime() : 0
    const restante = Math.max(0, expiracion - ahora)
    tiempoRestante.value = formatearTiempo(restante)
    if (restante <= 0) {
      detenerTimerLlave()
      tiempoRestante.value = 'Expirado'
    }
  }, 1000)
}

function detenerTimerLlave() {
  if (timerLlaveInterval) {
    clearInterval(timerLlaveInterval)
    timerLlaveInterval = null
  }
}

function formatearTiempo(ms) {
  if (ms <= 0) return 'Expirado'
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${String(sec).padStart(2, '0')}`
}
const llavesPendientes = computed(() => solicitudesPendientes.value.length)

function formatNum(n, dec = 0) {
  const num = Number(n)
  if (!isFinite(num)) return '0'
  return num.toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

function reproducirSonidoLlave() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.value = 0.08
    osc.start()
    osc.stop(ctx.currentTime + 0.15)
    setTimeout(() => ctx.close(), 200)
  } catch (_) {}
}

async function cargarConfigLlaves() {
  try {
    const token = localStorage.getItem('sessionToken')
    const res = await fetch(`${API_BASE_URL}/api/admin/config-llaves`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      configLlaves.value = data.config || { activado: false, tope: 0, activadoIngresos: false, topeIngresos: 0, activadoEgresos: false, topeEgresos: 0 }
      topeInput.value = configLlaves.value.tope || 0
      topeInputIngresos.value = configLlaves.value.topeIngresos || 0
      topeInputEgresos.value = configLlaves.value.topeEgresos || 0
    }
  } catch (_) {}
}

async function cargarSolicitudes() {
  try {
    const token = localStorage.getItem('sessionToken')
    const res = await fetch(`${API_BASE_URL}/api/admin/solicitudes-llaves`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      solicitudes.value = (data.solicitudes || []).map(s => ({ ...s, _aprobando: false, _denegando: false }))
      const pend = solicitudes.value.filter(s => s.estado === 'pendiente').length
      if (pend > ultimoConteoSolicitudes && pend > 0 && ultimoConteoSolicitudes > 0) {
        reproducirSonidoLlave()
      }
      ultimoConteoSolicitudes = pend
    }
  } catch (_) {}
}

function toggleLlaves() {
  configLlaves.value.activado = !configLlaves.value.activado
  guardarConfigLlaves()
}

async function guardarConfigLlaves() {
  guardandoConfig.value = true
  msgLlaves.value = { error: '', ok: '' }
  try {
    const token = localStorage.getItem('sessionToken')
    const res = await fetch(`${API_BASE_URL}/api/admin/config-llaves`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        activado: configLlaves.value.activado,
        tope: topeInput.value,
        activadoIngresos: configLlaves.value.activadoIngresos,
        topeIngresos: topeInputIngresos.value,
        activadoEgresos: configLlaves.value.activadoEgresos,
        topeEgresos: topeInputEgresos.value
      })
    })
    if (res.ok) {
      const data = await res.json()
      configLlaves.value = data.config
      topeInput.value = data.config.tope || 0
      topeInputIngresos.value = data.config.topeIngresos || 0
      topeInputEgresos.value = data.config.topeEgresos || 0
      msgLlaves.value.ok = 'Configuración guardada'
    } else {
      const err = await res.json().catch(() => ({}))
      msgLlaves.value.error = err.error || 'Error al guardar'
    }
  } catch (e) {
    msgLlaves.value.error = 'Error de conexión'
  } finally {
    guardandoConfig.value = false
  }
}

async function iniciarPollingLlaves() {
  await cargarSolicitudes()
  llavesPollTimer = window.setInterval(() => {
    if (document.hidden) return
    cargarSolicitudes()
  }, 30000)
}

function detenerPollingLlaves() {
  if (llavesPollTimer) {
    clearInterval(llavesPollTimer)
    llavesPollTimer = null
  }
}

async function aprobarLlave(s) {
  s._aprobando = true
  try {
    const token = localStorage.getItem('sessionToken')
    const res = await fetch(`${API_BASE_URL}/api/admin/solicitudes-llaves/${s._id}/aprobar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      codigoLlaveGenerado.value = data.codigoLlave
      solicitudCodigoActual.value = s
      fechaExpiracionLlave.value = data.fechaExpiracion || null
      modalCodigoLlave.value = true
      if (fechaExpiracionLlave.value) {
        iniciarTimerLlave(new Date(fechaExpiracionLlave.value).getTime() - Date.now())
      }
      await cargarSolicitudes()
    } else {
      alert('Error al aprobar')
    }
  } catch (_) {
    alert('Error de conexión')
  } finally {
    s._aprobando = false
  }
}

function denegarLlave(s) {
  solicitudDenegar.value = s
  modalDenegar.value = true
}

async function confirmarDenegar() {
  const s = solicitudDenegar.value
  if (!s || denegandoEnCurso.value) return
  denegandoEnCurso.value = true
  try {
    const token = localStorage.getItem('sessionToken')
    await fetch(`${API_BASE_URL}/api/admin/solicitudes-llaves/${s._id}/denegar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    modalDenegar.value = false
    solicitudDenegar.value = null
    await cargarSolicitudes()
  } catch (_) {}
  denegandoEnCurso.value = false
}

function compartirCodigoLlave() {
  const codigo = codigoLlaveGenerado.value
  const s = solicitudCodigoActual.value
  if (!codigo) return
  const tipo = s?.tipo || 'venta'
  const titulo = tipo === 'ingreso' ? 'Llave de ingreso' : tipo === 'egreso' ? 'Llave de egreso' : 'Llave de venta'
  const texto = `Código de ${tipo}: ${codigo}`
  if (navigator.share) {
    navigator.share({ title: titulo, text: texto }).catch(() => {})
  } else {
    navigator.clipboard.writeText(texto).then(() => {
      alert('Código copiado al portapapeles')
    }).catch(() => {
      alert(texto)
    })
  }
}

async function eliminarSolicitud() {
  const s = solicitudCodigoActual.value
  if (!s) return
  detenerTimerLlave()
  modalCodigoLlave.value = false
  codigoLlaveGenerado.value = ''
  solicitudCodigoActual.value = null
  fechaExpiracionLlave.value = null
  tiempoRestante.value = ''
  s._denegando = true
  try {
    const token = localStorage.getItem('sessionToken')
    await fetch(`${API_BASE_URL}/api/admin/solicitudes-llaves/${s._id}/denegar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    await cargarSolicitudes()
  } catch (_) {}
}

function cerrarModalCodigoLlave() {
  detenerTimerLlave()
  modalCodigoLlave.value = false
  codigoLlaveGenerado.value = ''
  solicitudCodigoActual.value = null
  fechaExpiracionLlave.value = null
  tiempoRestante.value = ''
}

function abrirReordenar() {
  reordenLista.value = listaVendedores.value.map(v => ({ ...v }))
  reordenError.value = ''
  modalReordenar.value = true
}

function moverArriba(i) {
  if (i <= 0) return
  const arr = reordenLista.value;
  [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
}

function moverAbajo(i) {
  if (i >= reordenLista.value.length - 1) return
  const arr = reordenLista.value;
  [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
}

async function guardarReorden() {
  guardandoReorden.value = true
  reordenError.value = ''
  try {
    const token = localStorage.getItem('sessionToken')
    const ordenes = reordenLista.value.map((v, i) => ({ _id: v._id, orden: i + 1 }))
    const c = codigoVinculacion()
    const res = await fetch(`${API_BASE_URL}/api/admin/vendedores/reordenar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ codigoVinculacion: c, ordenes })
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Error al guardar el orden')
    }
    modalReordenar.value = false
    okMsgV.value = 'Orden guardado correctamente'
    await cargarVendedores()
  } catch (e) {
    reordenError.value = e.message
  } finally {
    guardandoReorden.value = false
  }
}

const usuarioMostrado = computed(() => {
  const pending = String(formCuenta.value.nuevoUsuario || '').trim()
  if (pending) return pending
  return String(cuenta.value.usuario || '').trim() || '–'
})

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

const esSuperUsuario = computed(() => {
  try {
    return localStorage.getItem('rol') === 'superusuario'
  } catch { return false }
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
  if (String(formCuenta.value.nuevoUsuario || '').trim()) {
    solicitarConfirmacionCuenta()
  }
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
      msgCuenta.value.error = data.codigo === 'USUARIO_YA_EN_USO' ? t('errors.userAlreadyInUse') : data.error || data.mensaje || t('common.error')
      formCuenta.value.nuevoUsuario = ''
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
  formVendedor.value = { nombre: v.nombre || '', usuario: v.usuario || '', contrasena: '' }
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
    const nombre = String(formVendedor.value.nombre || '').trim()
    const body = { codigoVinculacion: c }
    if (nombre) body.nombre = nombre
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
    if (route.name === 'MiCuentaAdmin' && esSuperUsuario.value) await cargarEstadoEnvioCorreo()
  }
)

onMounted(async () => {
  const tareas = [cargarCuenta(), cargarVendedores(), cargarConfigLlaves()]
  if (esSuperUsuario.value) tareas.push(cargarEstadoEnvioCorreo())
  await Promise.all(tareas)
  await iniciarPollingLlaves()
})

onUnmounted(() => {
  detenerPollingLlaves()
  detenerTimerLlave()
})
</script>
