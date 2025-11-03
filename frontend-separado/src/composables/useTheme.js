import { ref, onMounted, onUnmounted } from 'vue'

export function useTheme() {
  const isDark = ref(false)
  const isSystemDark = ref(false)

  // Detectar preferencia del sistema
  const detectSystemTheme = () => {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      isSystemDark.value = mediaQuery.matches
      return mediaQuery.matches
    }
    return false
  }

  // Aplicar tema al documento
  const applyTheme = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Inicializar tema
  const initTheme = () => {
    // Verificar si hay preferencia guardada
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme === 'dark' || savedTheme === 'light') {
      isDark.value = savedTheme === 'dark'
    } else {
      // Usar preferencia del sistema
      isDark.value = detectSystemTheme()
    }
    
    applyTheme(isDark.value)
  }

  // Cambiar tema manualmente
  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    applyTheme(isDark.value)
  }

  // Escuchar cambios en la preferencia del sistema
  let mediaQuery
  const setupSystemThemeListener = () => {
    if (window.matchMedia) {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        isSystemDark.value = e.matches
        // Solo cambiar si no hay preferencia manual guardada
        if (!localStorage.getItem('theme')) {
          isDark.value = e.matches
          applyTheme(e.matches)
        }
      })
    }
  }

  onMounted(() => {
    initTheme()
    setupSystemThemeListener()
  })

  onUnmounted(() => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', () => {})
    }
  })

  return {
    isDark,
    isSystemDark,
    toggleTheme,
    initTheme
  }
}
