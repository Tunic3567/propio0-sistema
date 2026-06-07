<template>
  <div class="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">Crear Cliente</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Other form fields -->

      <div>
        <label for="totalToPay" class="block text-sm font-medium text-neutral-600 dark:text-slate-300 mb-1">Total a Pagar</label>
        <input type="number" id="totalToPay" v-model.number="form.totalToPay" disabled class="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 dark:bg-slate-800 dark:text-neutral-100" placeholder="$0.00">
      </div>

      <div>
        <label for="parcelValue" class="block text-sm font-medium text-neutral-600 dark:text-slate-300 mb-1">Valor Parcela</label>
        <input type="number" id="parcelValue" v-model.number="form.parcelValue" disabled class="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 dark:bg-slate-800 dark:text-neutral-100" placeholder="$0.00">
      </div>

      <!-- Other form fields -->

      <button type="submit" :disabled="!formIsValid" class="w-full px-4 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-slate-700 dark:hover:bg-slate-600 dark:focus:ring-offset-slate-800">Crear Cliente</button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'

const theme = useTheme()

const form = ref({
  totalToPay: 0,
  parcelValue: 0
})

const formIsValid = computed(() => {
  return Object.values(form.value).every(field => field !== 0)
})

function handleSubmit() {
  // Handle form submission logic here
}
</script>

<style scoped>
/* Add your custom styles here */
input[type="number"] {
  font-size: inherit;
}
</style>
