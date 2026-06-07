---
version: alpha
name: FinzBPP Login System
description: Minimal visual baton for FinzBPP visual references
colors:
  background: "#0F172A"
  surface: "#172238"
  surfaceRaised: "#1E2D49"
  text: "#F1F5F9"
  muted: "#CBD5E1"
  border: "#40516D"
  accent: "#4DB6B7"
  link: "#60A5FA"
typography:
  display:
    fontFamily: system-ui
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.02em
  body:
    fontFamily: system-ui
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.5
rounded:
  sm: 8px
  md: 12px
  lg: 16px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 56px
components:
  login-logo:
    typography: "{typography.display}"
    textColor: "{colors.accent}"
    backgroundColor: transparent
    rounded: "{rounded.md}"
    padding: 0px
  motivational-message:
    typography: "{typography.body}"
    textColor: "{colors.text}"
    backgroundColor: transparent
    rounded: "{rounded.sm}"
    padding: 0px
  login-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: 32px
---

## Overview

Sistema operativo oscuro para el Login de FinzBPP. Este archivo conserva referencias visuales generales y decisiones estables de experiencia para operación en campo.

## Colors

Mantener fondo azul noche, tarjetas azul grisáceo, bordes visibles y acento turquesa tomado del logo FinzBPP. Los enlaces secundarios pueden usar azul claro para contraste.

## Typography

Usar system-ui existente del proyecto. En Login, la frase motivacional debe conservar buena legibilidad y jerarquía frente a etiquetas y campos de formulario.

## Layout

Preservar el layout centrado actual del Login. El logo debe mantenerse responsivo para no empujar el formulario fuera de pantallas móviles.

## Elevation & Depth

Prefer tonal separation and fine borders before large shadows. Raised surfaces
should feel attached to the system, not floating above it.

## Shapes

Use small radii for controls and medium-to-large radii for panels. Nested
surfaces should never have a larger radius than their parent.

## Components

Hay un override activo y reversible en `frontend-separado/src/assets/global.css` para el Login: aumenta la frase motivacional, refuerza su peso visual y reduce la separación con el logo nuevo.

Cuando el componente Vue del Login esté disponible en el workspace, conviene mover este refinamiento desde `global.css` al componente/estilos propios.

## Offline Session Behavior

La web debe confiar temporalmente en la sesión local cuando `navigator.onLine === false` o una llamada al backend falla por red antes de recibir una respuesta HTTP. En ese estado no se limpian `sessionToken`, `rol` ni identificadores locales; los pagos permanecen en cola offline y se reintentan al volver la conexión. La expulsión al Login debe ocurrir solo ante una respuesta 401 real del backend con sesión revocada, inválida o requerida estando online.

## Crear Cliente

En la vista de Crear Cliente, los campos de resumen `Total a pagar` y `Total parcela` deben permanecer visibles desde el inicio del formulario. Si todavía no hay `Valor`, número de parcelas o datos suficientes para calcular, ambos importes se muestran como `$0.00` en lugar de ocultarse o dejar espacios vacíos.


Las pantallas operativas no deben vaciar clientes/pagos ni mostrar error fatal por un fallo de red transitorio: si existe una carga previa del vendedor, se usa como snapshot local hasta recuperar conexión. La comprobación de despliegue tampoco debe recargar la página mientras `navigator.onLine === false`.

El flujo crítico de cobro debe estar disponible antes de perder conexión: la vista de `Pagos` se carga de forma directa desde el router para que el botón “Pago” de un cliente pueda abrir la ventana/pantalla de pago aun cuando ya no haya internet.

## Do's and Don'ts

Al registrar pagos sin conexión, la consulta de ruta activa no debe bloquear el guardado local ni devolver “ruta cerrada” por falta de red. Si no hay conexión, falla el fetch o la respuesta no es confiable, la app devuelve una ruta temporal abierta basada en la sesión local/última ruta conocida y deja el pago en cola para validarlo al sincronizar.


Do promote repeated visual choices back into this file. Don't paste transient
task notes, long source files, or unverified brand values here.
