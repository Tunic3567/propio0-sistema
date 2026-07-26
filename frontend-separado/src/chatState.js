import { ref } from 'vue'
export const chatVisible = ref(false)
export function openChat() { chatVisible.value = true }
export function closeChat() { chatVisible.value = false }
export function toggleChat() { chatVisible.value = !chatVisible.value }
