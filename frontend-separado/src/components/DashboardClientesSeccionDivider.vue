<template>
  <div
    class="dashboard-clientes-seccion-divider my-3 w-full md:my-4"
    role="separator"
    :aria-label="ariaLabel"
  >
    <!-- Blanco → esmeralda (mismo verde que borde/icono “cliente al día” / pagos) -->
    <div
      class="h-1 w-full rounded-full bg-gradient-to-r from-white via-emerald-400 to-emerald-600 shadow-[0_1px_2px_rgba(16,185,129,0.25)] dark:from-slate-300 dark:via-emerald-500 dark:to-emerald-400 dark:shadow-[0_1px_3px_rgba(16,185,129,0.35)]"
      aria-hidden="true"
    />
  </div>
</template>

<script setup>
defineProps({
  /** Solo para lectores de pantalla (sin texto visible) */
  ariaLabel: { type: String, required: true },
})
</script>
