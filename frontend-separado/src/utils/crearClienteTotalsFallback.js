const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "crearClienteTotalColor": "#4ade80",
  "crearClienteParcelaColor": "#93c5fd",
  "crearClienteTotalScale": 1
}/*EDITMODE-END*/;

void TWEAK_DEFAULTS

let activeRouter = null

const MONEY_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

function isCrearClienteRoute() {
  if (typeof window === 'undefined') return false
  const route = activeRouter?.currentRoute?.value
  const routeName = String(route?.name || '')
  const routePath = String(route?.path || route?.fullPath || '')
  const locationText = `${window.location.hash || ''} ${window.location.pathname || ''}`
  return /crearcliente|crear-cliente/i.test(`${routeName} ${routePath} ${locationText}`)
}

function parseMoneyLike(value) {
  if (value === null || value === undefined) return 0
  const raw = String(value).trim()
  if (!raw) return 0
  const normalized = raw.replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function getInputValueByLabel(labelMatcher) {
  const labels = Array.from(document.querySelectorAll('label'))
  const label = labels.find((item) => labelMatcher.test(item.textContent || ''))
  const control = label?.htmlFor
    ? document.getElementById(label.htmlFor)
    : label?.parentElement?.querySelector('input, select')
  return control?.value ?? ''
}

function calculateTotals() {
  const valor = parseMoneyLike(getInputValueByLabel(/^\s*valor\s*$/i))
  const parcelas = Math.max(0, Math.trunc(parseMoneyLike(getInputValueByLabel(/n[uú]mero\s+de\s+parcelas/i))))
  const appliedInterestNode = Array.from(document.querySelectorAll('*')).find((node) =>
    node.childElementCount === 0 && /inter[eé]s aplicado/i.test(node.textContent || '')
  )
  const interestContainer = appliedInterestNode?.closest('div')
  const interestText = interestContainer?.textContent || ''
  const interestMatch = interestText.match(/(\d+(?:[,.]\d+)?)\s*%/)
  const interest = interestMatch ? Number(interestMatch[1].replace(',', '.')) : 10
  const total = valor > 0 ? valor * (1 + Math.max(0, interest) / 100) : 0
  const cuota = total > 0 && parcelas > 0 ? total / parcelas : 0
  return { total, cuota }
}

function findTotalsMountPoint() {
  const interestTextNode = Array.from(document.querySelectorAll('*')).find((node) =>
    node.childElementCount === 0 && /inter[eé]s aplicado/i.test(node.textContent || '')
  )
  const interestBox = interestTextNode?.closest('div')
  if (interestBox?.parentElement) return interestBox

  const form = document.querySelector('form')
  if (form) return form.lastElementChild || form
  return document.getElementById('app')
}

function ensureTotalsBlock() {
  if (!isCrearClienteRoute()) return

  const app = document.getElementById('app')
  if (!app || !/total a pagar|valor parcela|total parcela|n[uú]mero de parcelas/i.test(app.textContent || '')) return

  const totalLabels = Array.from(document.querySelectorAll('*')).filter((node) =>
    !node.closest('[data-crear-cliente-fixed-totals]') &&
    node.childElementCount === 0 &&
    /total a pagar|valor parcela|total parcela/i.test(node.textContent || '')
  )
  const visibleTotalLabels = totalLabels.filter((node) => {
    const style = window.getComputedStyle(node)
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
  })

  if (visibleTotalLabels.length > 0) {
    document.querySelector('[data-crear-cliente-fixed-totals]')?.remove()
    visibleTotalLabels.forEach((label) => {
      if (/valor parcela/i.test(label.textContent || '')) label.textContent = 'Total parcela:'
      const row = label.closest('div') || label.parentElement
      const valueNode = row?.querySelector('output, strong, b, [data-total-pagar], [data-total-parcela]') || label.nextElementSibling
      const nextText = MONEY_FORMATTER.format(0)
      if (valueNode && valueNode !== label && !/[1-9]/.test(valueNode.textContent || '') && valueNode.textContent !== nextText) {
        valueNode.textContent = nextText
      }
    })
    return
  }

  const mountPoint = findTotalsMountPoint()
  if (!mountPoint || document.querySelector('[data-crear-cliente-fixed-totals]')) return

  const block = document.createElement('section')
  block.className = 'crear-cliente-fixed-totals'
  block.dataset.crearClienteFixedTotals = 'true'
  block.setAttribute('aria-label', 'Resumen de valores calculados')
  block.innerHTML = `
    <div class="crear-cliente-fixed-total-row">
      <span>Total a pagar:</span>
      <output data-total-pagar>${MONEY_FORMATTER.format(0)}</output>
    </div>
    <div class="crear-cliente-fixed-total-row">
      <span>Total parcela:</span>
      <output data-total-parcela>${MONEY_FORMATTER.format(0)}</output>
    </div>
  `

  mountPoint.insertAdjacentElement('afterend', block)
  updateFixedTotalsBlock()
}

function updateFixedTotalsBlock() {
  const block = document.querySelector('[data-crear-cliente-fixed-totals]')
  if (!block) return
  const { total, cuota } = calculateTotals()
  const totalNode = block.querySelector('[data-total-pagar]')
  const cuotaNode = block.querySelector('[data-total-parcela]')
  const totalText = MONEY_FORMATTER.format(total || 0)
  const cuotaText = MONEY_FORMATTER.format(cuota || 0)
  if (totalNode && totalNode.textContent !== totalText) totalNode.textContent = totalText
  if (cuotaNode && cuotaNode.textContent !== cuotaText) cuotaNode.textContent = cuotaText
}

export function installCrearClienteTotalsFallback(router) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  activeRouter = router || null

  let observer
  const refresh = () => {
    if (!isCrearClienteRoute()) {
      document.querySelector('[data-crear-cliente-fixed-totals]')?.remove()
      return
    }
    ensureTotalsBlock()
    updateFixedTotalsBlock()
  }

  const startObserver = () => {
    observer?.disconnect()
    observer = new MutationObserver(() => refresh())
    const app = document.getElementById('app')
    if (app) observer.observe(app, { childList: true, subtree: true })
  }

  router?.afterEach?.(() => {
    window.setTimeout(() => {
      refresh()
      startObserver()
    }, 0)
  })

  document.addEventListener('input', refresh, true)
  document.addEventListener('change', refresh, true)
  window.addEventListener('hashchange', refresh)
  window.setTimeout(() => {
    refresh()
    startObserver()
  }, 500)
}
