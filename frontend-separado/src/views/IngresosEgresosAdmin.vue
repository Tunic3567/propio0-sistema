<template>
  <div class="min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-neutral-50 dark:bg-slate-900 transition-theme">
    <NavbarAdmin @logout="logout" />

    <div class="max-w-6xl mx-auto p-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-md border-2 border-neutral-200 dark:border-slate-600 p-6 transition-theme">
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-slate-100 mb-6">{{ $t('admin.incomeExpenseNav') }}</h1>

        <!-- Menú principal: Ver / Registrar -->
        <div
          class="flex rounded-xl bg-neutral-100 dark:bg-slate-700/70 p-1 mb-6 border-2 border-neutral-200 dark:border-slate-600 shadow-sm"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            :aria-selected="vistaPrincipal === 'ver'"
            class="flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200"
            :class="
              vistaPrincipal === 'ver'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-200 shadow-md border border-blue-200/90 dark:border-blue-500/35'
                : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-slate-200'
            "
            @click="vistaPrincipal = 'ver'"
          >
            Ver movimientos
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="vistaPrincipal === 'registrar'"
            class="flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200"
            :class="
              vistaPrincipal === 'registrar'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-200 shadow-md border border-blue-200/90 dark:border-blue-500/35'
                : 'text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-slate-200'
            "
            @click="vistaPrincipal = 'registrar'"
          >
            Registrar
          </button>
        </div>

        <!-- ========== VISTA: VER ========== -->
        <template v-if="vistaPrincipal === 'ver'">
        <!-- Filtros -->
        <div class="bg-blue-50/80 dark:bg-slate-700/40 border-2 border-blue-200/90 dark:border-slate-600 rounded-xl p-4 mb-6 transition-theme">
          <h2 class="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">Filtros</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-2">{{ $t('admin.vendors') }}</label>
              <select
                v-model="filtros.vendedor"
                class="w-full px-3 py-2 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-theme"
                @change="aplicarFiltros"
              >
                <option value="">{{ $t('admin.allVendors') }}</option>
                <option v-for="v in vendedores" :key="v._id" :value="v._id">{{ v.nombre }} ({{ v.ciudad || '-' }})</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-2">{{ $t('admin.routes') || 'Ruta' }}</label>
              <select
                v-model="filtros.ruta"
                class="w-full px-3 py-2 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-theme"
                @change="aplicarFiltros"
              >
                <option value="">Todas las rutas</option>
                <option v-for="r in rutasFiltradas" :key="r._id" :value="r._id">
                  {{ r.vendedor?.nombre || 'N/A' }} | {{ formatFecha(r.fechaApertura) }}
                </option>
              </select>
            </div>
          </div>
        </div>

          <!-- Lista unificada: ingresos + egresos (una columna, orden cronológico) -->
          <div
            class="bg-neutral-50 dark:bg-slate-700/30 border-2 border-neutral-200 dark:border-slate-600 rounded-xl p-4 transition-theme"
          >
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-slate-100 mb-4">
              {{ $t('admin.movementsUnified') }}
            </h2>

            <div v-if="movimientosUnificados.length === 0" class="text-neutral-500 dark:text-slate-400 text-center py-6">
              {{ $t('admin.noMovementsMatchFilters') }}
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="mov in movimientosUnificados"
                :key="mov.kind + '-' + mov.doc._id"
                :data-mov-id="mov.kind + '-' + mov.doc._id"
                class="bg-white dark:bg-slate-700/50 border-2 rounded-xl p-4 transition-theme"
                :class="
                  mov.kind === 'ingreso'
                    ? 'border-green-200 dark:border-green-900/40'
                    : 'border-amber-200 dark:border-amber-900/40'
                "
              >
                <div class="flex flex-col gap-3 md:flex-row md:justify-between md:items-start md:gap-4">
                  <div class="min-w-0 flex-1 w-full">
                    <div class="flex flex-wrap items-center gap-2 mb-2">
                      <!-- Badge principal: ingreso / egreso -->
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wide"
                        :class="
                          mov.kind === 'ingreso'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                            : 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100'
                        "
                      >
                        {{ mov.kind === 'ingreso' ? $t('admin.movementTypeIncome') : $t('admin.movementTypeExpense') }}
                      </span>
                      <!-- Badge secundario: tipo específico (Base, Comisiones, Gasolina, Salario, etc.) -->
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold tracking-wide"
                        :class="[
                          mov.kind === 'ingreso'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 border border-emerald-600/30'
                            : tipoEgresoClase(mov.doc.tipo)
                        ]"
                      >
                        {{ mov.doc.tipo }}
                      </span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div class="break-words">
                        <span class="font-medium text-neutral-800 dark:text-slate-200">{{ $t('admin.vendors') }}:</span>
                        <span class="text-neutral-700 dark:text-slate-300 ml-1 sm:ml-2">{{ mov.doc.vendedor?.nombre || 'N/A' }}</span>
                      </div>
                      <div class="break-words">
                        <span class="font-medium text-neutral-800 dark:text-slate-200">{{ $t('admin.collectionOpeningShort') }}:</span>
                        <span class="text-neutral-700 dark:text-slate-300 ml-1 sm:ml-2">
                          {{ mov.doc.ruta?.fechaApertura ? formatFecha(mov.doc.ruta.fechaApertura) : 'N/A' }}
                        </span>
                      </div>
                    </div>
                    <div v-if="mov.doc.descripcion" class="mt-2 text-sm text-neutral-600 dark:text-slate-300 break-words">
                      <span class="font-medium">{{ $t('expense.description') }}:</span>
                      {{ mov.doc.descripcion }}
                    </div>
                  </div>

                  <div
                    class="flex flex-col gap-2 w-full md:w-auto md:min-w-[148px] md:shrink-0 md:items-end pt-2 border-t border-neutral-200 dark:border-slate-600 md:border-t-0 md:pt-0"
                  >
                    <div
                      class="text-xl font-bold text-right w-full md:w-auto"
                      :class="
                        mov.kind === 'ingreso'
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-amber-700 dark:text-amber-400'
                      "
                    >
                      ${{ formatMonto(mov.doc.valor) }}
                    </div>
                    <div class="flex flex-wrap gap-2 justify-stretch sm:justify-end w-full">
                      <button
                        type="button"
                        class="flex-1 sm:flex-initial text-sm px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium min-h-[44px] sm:min-h-0"
                        @click="mov.kind === 'ingreso' ? abrirEditarIngreso(mov.doc) : abrirEditarEgreso(mov.doc)"
                      >
                        {{ $t('common.edit') }}
                      </button>
                      <button
                        type="button"
                        class="flex-1 sm:flex-initial text-sm px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium min-h-[44px] sm:min-h-0"
                        @click="solicitarEliminarMovimiento(mov.kind, mov.doc)"
                      >
                        {{ $t('common.delete') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ========== VISTA: REGISTRAR ========== -->
        <template v-else>
          <div class="bg-blue-50 dark:bg-slate-700/40 border-2 border-blue-200 dark:border-slate-600 rounded-xl p-4 mb-6 transition-theme">
            <h2 class="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">Registrar movimiento</h2>
            <p class="text-sm text-neutral-600 dark:text-slate-400 mb-4">{{ $t('admin.incomeExpenseAnyAdvisor') }}</p>
            <div class="flex flex-wrap gap-4 mb-4">
              <label class="inline-flex items-center gap-2 cursor-pointer text-neutral-800 dark:text-slate-200">
                <input v-model="formMovimiento" type="radio" value="ingreso" class="rounded-full border-neutral-400" />
                Ingreso
              </label>
              <label class="inline-flex items-center gap-2 cursor-pointer text-neutral-800 dark:text-slate-200">
                <input v-model="formMovimiento" type="radio" value="egreso" class="rounded-full border-neutral-400" />
                Egreso
              </label>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-2">Ruta</label>
              <select
                v-model="formRutaId"
                class="w-full max-w-xl px-3 py-2 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Seleccione una ruta</option>
                <option v-for="r in rutas" :key="r._id" :value="r._id">
                  {{ r.vendedor?.nombre || $t('admin.vendorFallbackName') }} — {{ formatFecha(r.fechaApertura) }}{{ r.abierta ? ' (abierta)' : '' }}
                </option>
              </select>
            </div>

            <form v-if="formMovimiento === 'ingreso'" class="space-y-3 max-w-xl" @submit.prevent="registrarIngresoAdmin">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-1">Tipo</label>
                <select v-model="formIngreso.tipo" required class="w-full px-3 py-2 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100">
                  <option value="Base">Base</option>
                  <option value="Otros ingresos">Otros ingresos</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-1">Valor</label>
                <input
                  v-model.number="formIngreso.valor"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="w-full px-3 py-2 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100"
                />
              </div>
              <div v-if="formIngreso.tipo === 'Otros ingresos'">
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-1">Descripción</label>
                <textarea v-model="formIngreso.descripcion" rows="2" class="w-full px-3 py-2 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
              </div>
              <button
                type="submit"
                :disabled="guardandoMovimiento"
                class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium"
              >
                {{ guardandoMovimiento ? 'Guardando…' : 'Registrar ingreso' }}
              </button>
            </form>

            <form v-else class="space-y-3 max-w-xl" @submit.prevent="registrarEgresoAdmin">
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-1">Tipo</label>
                <select v-model="formEgreso.tipo" required class="w-full px-3 py-2 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100">
                  <option value="Retiro de caja">Retiro de caja</option>
                  <option value="Comisiones">Comisiones</option>
                  <option value="Gasolina">Gasolina</option>
                  <option value="Repuestos">Repuestos</option>
                  <option value="Salario">Salario</option>
                  <option value="Gastos varios">Gastos varios</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-1">Valor</label>
                <input
                  v-model.number="formEgreso.valor"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  class="w-full px-3 py-2 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100"
                />
              </div>
              <div v-if="formEgreso.tipo === 'Gastos varios'">
                <label class="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-1">Descripción</label>
                <input v-model="formEgreso.descripcion" type="text" class="w-full px-3 py-2 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
              </div>
              <button
                type="submit"
                :disabled="guardandoMovimiento"
                class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium"
              >
                {{ guardandoMovimiento ? 'Guardando…' : 'Registrar egreso' }}
              </button>
            </form>

            <p v-if="msgRegistro" class="text-sm mt-3" :class="msgRegistroOk ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">{{ msgRegistro }}</p>
          </div>
        </template>

        <!-- Modal editar ingreso -->
        <Teleport to="body">
          <div
            v-if="modalIngreso.mostrar"
            class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
            role="dialog"
            aria-modal="true"
            @click.self="cerrarModalIngreso"
          >
            <div class="bg-white dark:bg-slate-800 rounded-xl border-2 border-green-200 dark:border-slate-600 shadow-xl max-w-md w-full p-6">
              <h3 class="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">Editar ingreso</h3>
              <form class="space-y-3" @submit.prevent="guardarEdicionIngreso">
                <div>
                  <label class="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-1">Tipo</label>
                  <select v-model="modalIngreso.tipo" required class="w-full px-3 py-2 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100">
                    <option value="Base">Base</option>
                    <option value="Otros ingresos">Otros ingresos</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-1">Valor</label>
                  <input
                    v-model.number="modalIngreso.valor"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    class="w-full px-3 py-2 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100"
                  />
                </div>
                <div v-if="modalIngreso.tipo === 'Otros ingresos'">
                  <label class="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-1">Descripción</label>
                  <textarea v-model="modalIngreso.descripcion" rows="2" class="w-full px-3 py-2 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
                </div>
                <p v-if="modalIngreso.error" class="text-sm text-red-600 dark:text-red-400">{{ modalIngreso.error }}</p>
                <div class="flex gap-2 justify-end pt-2">
                  <button type="button" class="px-4 py-2 rounded-lg border-2 border-neutral-300 dark:border-slate-600 text-neutral-800 dark:text-slate-200" @click="cerrarModalIngreso">Cancelar</button>
                  <button
                    type="submit"
                    :disabled="guardandoEdicion"
                    class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium"
                  >
                    {{ guardandoEdicion ? 'Guardando…' : 'Guardar' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Teleport>

        <!-- Modal editar egreso -->
        <Teleport to="body">
          <div
            v-if="modalEgreso.mostrar"
            class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
            role="dialog"
            aria-modal="true"
            @click.self="cerrarModalEgreso"
          >
            <div class="bg-white dark:bg-slate-800 rounded-xl border-2 border-amber-200 dark:border-slate-600 shadow-xl max-w-md w-full p-6">
              <h3 class="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-4">Editar egreso</h3>
              <form class="space-y-3" @submit.prevent="guardarEdicionEgreso">
                <div>
                  <label class="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-1">Valor</label>
                  <input
                    v-model.number="modalEgreso.valor"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    class="w-full px-3 py-2 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 dark:text-slate-200 mb-1">Descripción (opcional)</label>
                  <input v-model="modalEgreso.descripcion" type="text" class="w-full px-3 py-2 border-2 border-neutral-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-neutral-900 dark:text-slate-100" />
                </div>
                <p class="text-xs text-neutral-500 dark:text-slate-400">Tipo: {{ modalEgreso.tipoFijo || '—' }} (no editable)</p>
                <p v-if="modalEgreso.error" class="text-sm text-red-600 dark:text-red-400">{{ modalEgreso.error }}</p>
                <div class="flex gap-2 justify-end pt-2">
                  <button type="button" class="px-4 py-2 rounded-lg border-2 border-neutral-300 dark:border-slate-600 text-neutral-800 dark:text-slate-200" @click="cerrarModalEgreso">Cancelar</button>
                  <button
                    type="submit"
                    :disabled="guardandoEdicion"
                    class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium"
                  >
                    {{ guardandoEdicion ? 'Guardando…' : 'Guardar' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Teleport>
      </div>

      <ConfirmModal
        :show="!!(modalEliminar && modalEliminar.show)"
        :title="modalEliminarTitle"
        :message="modalEliminarMessage"
        :confirm-text="$t('common.delete')"
        :cancel-text="$t('common.cancel')"
        @confirm="confirmarEliminarMovimiento"
        @cancel="cerrarModalEliminar"
      />
    </div>
  </div>
</template>

<script setup>
import API_BASE_URL from '../config/api.js'
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NavbarAdmin from '../components/NavbarAdmin.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const loading = ref(true)
const ingresos = ref([])
const egresos = ref([])
const vendedores = ref([])
const rutas = ref([])

const filtros = ref({
  vendedor: '',
  ruta: ''
})

const formMovimiento = ref('ingreso')
const formRutaId = ref('')
const formIngreso = ref({ tipo: 'Base', valor: '', descripcion: '' })
const formEgreso = ref({ tipo: 'Comisiones', valor: '', descripcion: '' })
const guardandoMovimiento = ref(false)
const msgRegistro = ref('')
const msgRegistroOk = ref(false)

/** Pestaña principal: ver listas o solo formulario de alta */
const vistaPrincipal = ref('ver')

const guardandoEdicion = ref(false)

const modalIngreso = reactive({
  mostrar: false,
  rutaId: '',
  tipo: 'Base',
  valor: 0,
  descripcion: '',
  error: ''
})

const modalEgreso = reactive({
  mostrar: false,
  id: '',
  tipoFijo: '',
  valor: 0,
  descripcion: '',
  error: ''
})

const modalEliminar = reactive({
  show: false,
  kind: '',
  doc: null
})

const modalEliminarTitle = computed(() => {
  if (modalEliminar.kind === 'ingreso') return t('admin.confirmDeleteIncomeTitle')
  if (modalEliminar.kind === 'egreso') return t('admin.confirmDeleteExpenseTitle')
  return ''
})
const modalEliminarMessage = computed(() => {
  if (modalEliminar.kind === 'ingreso') return t('admin.confirmDeleteIncomeMessage')
  if (modalEliminar.kind === 'egreso') return t('admin.confirmDeleteExpenseMessage')
  return ''
})

function solicitarEliminarMovimiento(kind, doc) {
  modalEliminar.kind = kind
  modalEliminar.doc = doc
  modalEliminar.show = true
}

function cerrarModalEliminar() {
  modalEliminar.show = false
  modalEliminar.doc = null
  modalEliminar.kind = ''
}

async function confirmarEliminarMovimiento() {
  const kind = modalEliminar.kind
  const doc = modalEliminar.doc
  cerrarModalEliminar()
  if (kind === 'ingreso' && doc) await ejecutarEliminarIngreso(doc)
  else if (kind === 'egreso' && doc) await ejecutarEliminarEgreso(doc)
}

function idRutaDeDoc(rutaField) {
  if (!rutaField) return ''
  return typeof rutaField === 'object' && rutaField._id ? String(rutaField._id) : String(rutaField)
}

function vendedorIdDeRutaSeleccionada() {
  const r = rutas.value.find(x => String(x._id) === String(formRutaId.value))
  if (!r || !r.vendedor) return ''
  return typeof r.vendedor === 'object' && r.vendedor._id ? String(r.vendedor._id) : String(r.vendedor)
}

async function registrarIngresoAdmin() {
  msgRegistro.value = ''
  const codigo = localStorage.getItem('codigoVinculacion')
  if (!codigo) {
    msgRegistroOk.value = false
    msgRegistro.value = 'No hay sesión de administrador.'
    return
  }
  if (!formRutaId.value) {
    msgRegistroOk.value = false
    msgRegistro.value = 'Selecciona una ruta.'
    return
  }
  const vid = vendedorIdDeRutaSeleccionada()
  if (!vid) {
    msgRegistroOk.value = false
    msgRegistro.value = t('admin.couldNotDetermineAdvisor')
    return
  }
  const valor = Number(formIngreso.value.valor)
  if (Number.isNaN(valor) || valor < 0) {
    msgRegistroOk.value = false
    msgRegistro.value = 'Indica un valor numérico válido.'
    return
  }
  guardandoMovimiento.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/ingresos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigoVinculacion: codigo,
        ruta: formRutaId.value,
        vendedor: vid,
        tipo: formIngreso.value.tipo,
        valor,
        descripcion: formIngreso.value.tipo === 'Otros ingresos' ? (formIngreso.value.descripcion || '') : undefined
      })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      msgRegistroOk.value = false
      msgRegistro.value = data.error || data.detalles || 'No se pudo registrar el ingreso.'
      return
    }
    msgRegistroOk.value = true
    msgRegistro.value = 'Ingreso registrado correctamente.'
    formIngreso.value = { tipo: 'Base', valor: '', descripcion: '' }
    await aplicarFiltros()
  } catch (e) {
    msgRegistroOk.value = false
    msgRegistro.value = 'Error de red.'
  } finally {
    guardandoMovimiento.value = false
  }
}

async function registrarEgresoAdmin() {
  msgRegistro.value = ''
  const codigo = localStorage.getItem('codigoVinculacion')
  if (!codigo) {
    msgRegistroOk.value = false
    msgRegistro.value = 'No hay sesión de administrador.'
    return
  }
  if (!formRutaId.value) {
    msgRegistroOk.value = false
    msgRegistro.value = 'Selecciona una ruta.'
    return
  }
  const vid = vendedorIdDeRutaSeleccionada()
  if (!vid) {
    msgRegistroOk.value = false
    msgRegistro.value = t('admin.couldNotDetermineAdvisor')
    return
  }
  const valor = Number(formEgreso.value.valor)
  if (Number.isNaN(valor) || valor <= 0) {
    msgRegistroOk.value = false
    msgRegistro.value = 'Indica un valor mayor a 0.'
    return
  }
  if (formEgreso.value.tipo === 'Gastos varios' && !String(formEgreso.value.descripcion || '').trim()) {
    msgRegistroOk.value = false
    msgRegistro.value = 'La descripción es obligatoria para Gastos varios.'
    return
  }
  guardandoMovimiento.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/egresos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigoVinculacion: codigo,
        ruta: formRutaId.value,
        vendedor: vid,
        tipo: formEgreso.value.tipo,
        valor,
        descripcion: formEgreso.value.tipo === 'Gastos varios' ? formEgreso.value.descripcion : undefined
      })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      msgRegistroOk.value = false
      msgRegistro.value = data.error || data.detalles || 'No se pudo registrar el egreso.'
      return
    }
    msgRegistroOk.value = true
    msgRegistro.value = 'Egreso registrado correctamente.'
    formEgreso.value = { tipo: 'Comisiones', valor: '', descripcion: '' }
    await aplicarFiltros()
  } catch (e) {
    msgRegistroOk.value = false
    msgRegistro.value = 'Error de red.'
  } finally {
    guardandoMovimiento.value = false
  }
}

async function ejecutarEliminarIngreso(ingreso) {
  const rutaId = idRutaDeDoc(ingreso.ruta)
  if (!rutaId) {
    msgRegistroOk.value = false
    msgRegistro.value = t('admin.deleteMovementMissingRoute')
    return
  }
  const codigo = localStorage.getItem('codigoVinculacion')
  if (!codigo) return
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/admin/ingresos/ruta/${encodeURIComponent(rutaId)}?codigoVinculacion=${encodeURIComponent(codigo)}`,
      { method: 'DELETE' }
    )
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      msgRegistroOk.value = false
      msgRegistro.value = data.error || t('admin.deleteMovementError')
      return
    }
    msgRegistroOk.value = true
    msgRegistro.value = t('income.deletedSuccessMessage') || 'Ingreso eliminado.'
    await aplicarFiltros()
  } catch (e) {
    msgRegistroOk.value = false
    msgRegistro.value = t('admin.deleteMovementNetworkError')
  }
}

async function ejecutarEliminarEgreso(e) {
  const codigo = localStorage.getItem('codigoVinculacion')
  if (!codigo) return
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/admin/egresos/${encodeURIComponent(e._id)}?codigoVinculacion=${encodeURIComponent(codigo)}`,
      { method: 'DELETE' }
    )
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      msgRegistroOk.value = false
      msgRegistro.value = data.error || t('admin.deleteMovementError')
      return
    }
    msgRegistroOk.value = true
    msgRegistro.value = t('expense.deletedSuccessMessage') || 'Egreso eliminado.'
    await aplicarFiltros()
  } catch (err) {
    msgRegistroOk.value = false
    msgRegistro.value = t('admin.deleteMovementNetworkError')
  }
}

function abrirEditarIngreso(ingreso) {
  const rutaId = idRutaDeDoc(ingreso.ruta)
  if (!rutaId) {
    msgRegistroOk.value = false
    msgRegistro.value = t('admin.deleteMovementMissingRoute')
    return
  }
  modalIngreso.rutaId = rutaId
  modalIngreso.tipo = ingreso.tipo || 'Base'
  modalIngreso.valor = Number(ingreso.valor) || 0
  modalIngreso.descripcion = ingreso.descripcion || ''
  modalIngreso.error = ''
  modalIngreso.mostrar = true
}

function cerrarModalIngreso() {
  modalIngreso.mostrar = false
  modalIngreso.error = ''
}

async function guardarEdicionIngreso() {
  const codigo = localStorage.getItem('codigoVinculacion')
  if (!codigo) {
    modalIngreso.error = 'No hay sesión de administrador.'
    return
  }
  const valor = Number(modalIngreso.valor)
  if (Number.isNaN(valor) || valor < 0) {
    modalIngreso.error = 'Indica un valor numérico válido.'
    return
  }
  guardandoEdicion.value = true
  modalIngreso.error = ''
  try {
    const body = {
      codigoVinculacion: codigo,
      tipo: modalIngreso.tipo,
      valor,
      descripcion: modalIngreso.tipo === 'Otros ingresos' ? (modalIngreso.descripcion || '') : undefined
    }
    const res = await fetch(`${API_BASE_URL}/api/admin/ingresos/ruta/${encodeURIComponent(modalIngreso.rutaId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      modalIngreso.error = data.error || data.detalles || 'No se pudo actualizar.'
      return
    }
    cerrarModalIngreso()
    await aplicarFiltros()
  } catch (e) {
    modalIngreso.error = 'Error de red.'
  } finally {
    guardandoEdicion.value = false
  }
}

function abrirEditarEgreso(e) {
  modalEgreso.id = String(e._id)
  modalEgreso.tipoFijo = e.tipo || ''
  modalEgreso.valor = Number(e.valor) || 0
  modalEgreso.descripcion = e.descripcion || ''
  modalEgreso.error = ''
  modalEgreso.mostrar = true
}

function cerrarModalEgreso() {
  modalEgreso.mostrar = false
  modalEgreso.error = ''
}

async function guardarEdicionEgreso() {
  const codigo = localStorage.getItem('codigoVinculacion')
  if (!codigo) {
    modalEgreso.error = 'No hay sesión de administrador.'
    return
  }
  const valor = Number(modalEgreso.valor)
  if (Number.isNaN(valor) || valor <= 0) {
    modalEgreso.error = 'Indica un valor mayor a 0.'
    return
  }
  if (modalEgreso.tipoFijo === 'Gastos varios' && !String(modalEgreso.descripcion || '').trim()) {
    modalEgreso.error = 'La descripción es obligatoria para Gastos varios.'
    return
  }
  guardandoEdicion.value = true
  modalEgreso.error = ''
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/egresos/${encodeURIComponent(modalEgreso.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigoVinculacion: codigo,
        valor,
        descripcion: modalEgreso.descripcion
      })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      modalEgreso.error = data.error || data.detalles || 'No se pudo actualizar.'
      return
    }
    cerrarModalEgreso()
    await aplicarFiltros()
  } catch (e) {
    modalEgreso.error = 'Error de red.'
  } finally {
    guardandoEdicion.value = false
  }
}

const rutasFiltradas = computed(() => {
  if (!filtros.value.vendedor) return rutas.value
  return rutas.value.filter(r => r.vendedor?._id === filtros.value.vendedor)
})

/** Ordenar ingresos + egresos en una sola lista (más reciente primero). */
function timestampOrdenMovimiento(doc) {
  const t = doc.createdAt || doc.fechaCreacion || doc.fecha
  if (t) return new Date(t).getTime()
  const r = doc.ruta?.fechaApertura
  if (r) return new Date(r).getTime()
  return 0
}

const movimientosUnificados = computed(() => {
  const rows = []
  for (const ing of ingresos.value) {
    rows.push({ kind: 'ingreso', doc: ing, ts: timestampOrdenMovimiento(ing) })
  }
  for (const eg of egresos.value) {
    rows.push({ kind: 'egreso', doc: eg, ts: timestampOrdenMovimiento(eg) })
  }
  rows.sort((a, b) => b.ts - a.ts)
  return rows
})

function tipoEgresoClase(tipo) {
  const t = String(tipo || '').toLowerCase()
  if (t === 'gasolina') {
    return 'bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-500/40'
  }
  if (t === 'repuestos') {
    return 'bg-orange-50 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 border border-orange-500/40'
  }
  if (t === 'comisiones' || t === 'comisión' || t === 'comissao') {
    return 'bg-sky-50 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200 border border-sky-500/40'
  }
  if (t === 'salario' || t === 'salarios') {
    return 'bg-purple-50 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 border border-purple-500/40'
  }
  if (t === 'retiro de caja' || t === 'retirada de caixa') {
    return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 border border-emerald-500/40'
  }
  if (t === 'gastos varios' || t === 'gastos vários') {
    return 'bg-neutral-100 text-neutral-800 dark:bg-slate-700/70 dark:text-slate-100 border border-neutral-400/60 dark:border-slate-500/60'
  }
  // Fallback neutro para tipos desconocidos
  return 'bg-neutral-100 text-neutral-800 dark:bg-slate-700/70 dark:text-slate-100 border border-neutral-400/60 dark:border-slate-500/60'
}

function formatFecha(fecha) {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
}

function formatMonto(val) {
  const n = Number(val)
  if (isNaN(n)) return '0.00'
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function cargarVendedores() {
  try {
    const codigoVinculacion = localStorage.getItem('codigoVinculacion')
    const url = codigoVinculacion
      ? `${API_BASE_URL}/api/vendedores?codigoVinculacion=${encodeURIComponent(codigoVinculacion)}`
      : `${API_BASE_URL}/api/vendedores`
    const res = await fetch(url)
    if (res.ok) vendedores.value = await res.json()
  } catch (e) {
    console.error('Error al cargar asesores:', e)
  }
}

async function cargarRutas() {
  try {
    const codigoVinculacion = localStorage.getItem('codigoVinculacion')
    const url = codigoVinculacion
      ? `${API_BASE_URL}/api/admin/rutas?codigoVinculacion=${encodeURIComponent(codigoVinculacion)}`
      : `${API_BASE_URL}/api/admin/rutas`
    const res = await fetch(url)
    if (res.ok) {
      rutas.value = await res.json()
      rutas.value.sort((a, b) => new Date(b.fechaApertura) - new Date(a.fechaApertura))
    }
  } catch (e) {
    console.error('Error al cargar rutas:', e)
    rutas.value = []
  }
}

async function cargarIngresos() {
  try {
    const params = new URLSearchParams()
    const codigo = localStorage.getItem('codigoVinculacion')
    if (codigo) params.append('codigoVinculacion', codigo)
    if (filtros.value.vendedor) params.append('vendedor', filtros.value.vendedor)
    if (filtros.value.ruta) params.append('ruta', filtros.value.ruta)
    const res = await fetch(`${API_BASE_URL}/api/ingresos?${params.toString()}`)
    ingresos.value = res.ok ? await res.json() : []
  } catch (e) {
    console.error('Error al cargar ingresos:', e)
    ingresos.value = []
  }
}

async function cargarEgresos() {
  try {
    const params = new URLSearchParams()
    const codigo = localStorage.getItem('codigoVinculacion')
    if (codigo) params.append('codigoVinculacion', codigo)
    if (filtros.value.vendedor) params.append('vendedor', filtros.value.vendedor)
    if (filtros.value.ruta) params.append('ruta', filtros.value.ruta)
    const res = await fetch(`${API_BASE_URL}/api/egresos?${params.toString()}`)
    egresos.value = res.ok ? await res.json() : []
  } catch (e) {
    console.error('Error al cargar egresos:', e)
    egresos.value = []
  }
}

async function aplicarFiltros() {
  loading.value = true
  await Promise.all([cargarIngresos(), cargarEgresos()])
  loading.value = false
}

watch([() => filtros.value.vendedor], () => {
  if (!filtros.value.vendedor) return
  filtros.value.ruta = ''
})

watch(vistaPrincipal, v => {
  if (v === 'ver') aplicarFiltros()
})

function scrollToMovimientoNotif(ingresoId, egresoId) {
  const id = ingresoId ? `ingreso-${ingresoId}` : egresoId ? `egreso-${egresoId}` : ''
  if (!id) return
  nextTick(() => {
    const el = document.querySelector(`[data-mov-id="${id}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-slate-900')
    window.setTimeout(() => {
      el.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-slate-900')
    }, 4500)
  })
}

async function aplicarQueryMovimientos() {
  if (route.path !== '/admin/movimientos') return
  const q = route.query
  filtros.value.vendedor = q.vendedor ? String(q.vendedor) : ''
  filtros.value.ruta = q.ruta ? String(q.ruta) : ''
  if (q.ingresoId || q.egresoId) vistaPrincipal.value = 'ver'
  await aplicarFiltros()
  scrollToMovimientoNotif(q.ingresoId, q.egresoId)
}

onMounted(async () => {
  await cargarVendedores()
  await cargarRutas()
  await aplicarQueryMovimientos()
})

watch(
  () => route.fullPath,
  (newPath, oldPath) => {
    if (!oldPath || newPath === oldPath || route.path !== '/admin/movimientos') return
    if (!String(oldPath).includes('/admin/movimientos')) return
    aplicarQueryMovimientos()
  }
)

function logout() {
  try {
    localStorage.removeItem('rol')
    localStorage.removeItem('adminId')
    localStorage.removeItem('vendedorId')
    localStorage.removeItem('codigoVinculacion')
    localStorage.removeItem('sessionToken')
  } catch (e) {}
  try {
    router.replace('/')
    setTimeout(() => { if (location.hash && !location.hash.endsWith('#/')) location.href = '/' }, 150)
  } catch (e) {
    location.href = '/'
  }
}
</script>
