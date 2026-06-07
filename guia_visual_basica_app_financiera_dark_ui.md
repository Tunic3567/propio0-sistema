# Guía visual básica – App financiera (Dark UI)

Documento corto y práctico para mantener coherencia visual y una apariencia profesional en la aplicación.

---

## 1. Concepto general

**Estilo:** Profesional, minimalista y orientado a datos

**Objetivo visual:** Transmitir confianza, claridad y control financiero, evitando distracciones.

**Modo principal:** Oscuro (Dark Mode)

---

## 2. Paleta de colores

### 🎨 Fondos

| Uso | Color | Descripción |
|---|---|---|
| Fondo principal | `#0B1220` | Fondo global de la aplicación |
| Fondo secundario | `#111827` | Secciones internas |
| Cards / superficies | `#1F2937` | Tarjetas, paneles |
| Bordes sutiles | `#2B3648` | Separadores y contornos |

**Regla:** usar máximo 3 niveles de fondo por vista.

---

### 🔵 Color primario (acciones principales)

| Uso | Color |
|---|---|
| Primario | `#3B82F6` |
| Hover | `#2563EB` |
| Activo | `#1D4ED8` |

**Usar para:**
- Botón principal
- Elementos activos
- Enlaces importantes
- Indicadores clave

---

### 🟢 Estados positivos

| Uso | Color |
|---|---|
| Éxito / Pagado / Ingresos | `#22C55E` |
| Texto positivo | `#4ADE80` |

---

### 🟡 Advertencias

| Uso | Color |
|---|---|
| Pendiente / Atención | `#FACC15` |

---

### 🔴 Error o peligro

| Uso | Color |
|---|---|
| Error / Eliminar / Deuda | `#EF4444` |

**Regla:** evitar usar rojo en acciones frecuentes.

---

## 3. Tipografía

### Fuente principal

**Inter**

```css
font-family: 'Inter', system-ui, sans-serif;
```

Alternativas válidas:
- Plus Jakarta Sans
- Manrope

---

### Jerarquía tipográfica

| Uso | Tamaño | Peso |
|---|---|---|
| Título principal | 20–24px | Semibold |
| Título sección | 16–18px | Semibold |
| Texto normal | 14px | Regular |
| Texto secundario | 12–13px | Regular |

**Reglas:**
- No usar más de 3 tamaños por pantalla
- Priorizar peso antes que color para jerarquía

---

## 4. Botones

### Botón primario

- Fondo: `#3B82F6`
- Texto: `#FFFFFF`
- Radio: 10px
- Altura: 40–44px

### Botón secundario

- Fondo: transparente
- Borde: `#2B3648`
- Texto: `#CBD5E1`

### Botón peligro

- Fondo: `#EF4444`
- Texto: `#FFFFFF`

**Regla:** máximo un botón primario por sección.

---

## 5. Cards

- Fondo: `#1F2937`
- Borde: `1px solid #2B3648`
- Radio: 12px
- Padding: 16px

Hover sutil permitido, sin sombras fuertes.

---

## 6. Iconografía

- Librería recomendada: **Lucide Icons**
- Tamaño estándar: 18–20px
- Color: `#9CA3AF`

**Regla:** los iconos acompañan al texto, no lo reemplazan.

---

## 7. Espaciado

Escala base:

`4px · 8px · 12px · 16px · 24px · 32px`

Más espacio = más claridad.

---

## 8. Principios clave

- Consistencia visual ante todo
- Menos colores = más profesional
- Claridad > decoración
- Todo debe ayudar a leer datos rápido

---

**Fin del documento**

