<template>
  <div class="dashboard-clientes-snap w-full overflow-hidden">
    <!-- Móvil: orden lineal -->
    <div class="flex flex-col gap-2 sm:gap-3 md:hidden">
      <template v-for="(item, index) in list" :key="itemKey(item, index)">
        <slot :item="item" :index="index" />
      </template>
    </div>
    <!-- md+: dos columnas independientes (índice par / impar); no comparten altura de fila como en grid -->
    <div
      class="hidden w-full md:flex md:flex-row md:items-start"
      :class="wideGap ? 'md:gap-5' : 'md:gap-4'"
    >
      <div
        v-for="col in [0, 1]"
        :key="'clientes-col-' + col"
        class="flex min-w-0 flex-1 flex-col gap-2 sm:gap-3"
      >
        <template v-for="(item, index) in list" :key="itemKey(item, index)">
          <div v-if="index % 2 === col" class="min-w-0 w-full">
            <slot :item="item" :index="index" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  list: { type: Array, required: true },
  itemKey: {
    type: Function,
    default: (item, index) => (item && item._id) || `idx-${index}`,
  },
  /** true = mismo espaciado que bloque "con pagos" (md:gap-5) */
  wideGap: { type: Boolean, default: false },
})
</script>
