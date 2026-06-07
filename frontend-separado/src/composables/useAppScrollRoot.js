import { inject, provide } from 'vue'

export const APP_SCROLL_ROOT_KEY = Symbol('appScrollRoot')

/** Desde App.vue: ref(null) que las vistas pueden rellenar con su contenedor con overflow. */
export function provideAppScrollRoot(refObj) {
  provide(APP_SCROLL_ROOT_KEY, refObj)
}

/** Contenedor scrollable opcional (además de window). Limpiar en onUnmounted de la vista. */
export function useAppScrollRoot() {
  return inject(APP_SCROLL_ROOT_KEY, null)
}
