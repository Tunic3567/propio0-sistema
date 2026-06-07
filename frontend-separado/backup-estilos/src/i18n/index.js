import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import en from './locales/en.json'
import pt from './locales/pt.json'

// Obtener idioma guardado en localStorage o detectar del navegador
const getDefaultLocale = () => {
  try {
    const saved = localStorage.getItem('app-locale')
    if (saved && ['es', 'en', 'pt'].includes(saved)) {
      return saved
    }
  } catch (e) {
    console.warn('Error al leer localStorage:', e)
  }
  
  // Detectar idioma del navegador
  try {
    const browserLang = navigator.language || navigator.userLanguage
    if (browserLang.startsWith('es')) return 'es'
    if (browserLang.startsWith('pt')) return 'pt'
  } catch (e) {
    console.warn('Error al detectar idioma del navegador:', e)
  }
  
  return 'es' // Por defecto español
}

const i18n = createI18n({
  legacy: false, // Usar Composition API
  locale: getDefaultLocale(),
  fallbackLocale: 'es', // Español como respaldo
  globalInjection: true, // Habilita $t, $tc, etc. en templates
  messages: {
    es,
    en,
    pt
  }
})

export default i18n
