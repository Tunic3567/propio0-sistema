# Fórmulas de Cálculo para Resúmenes

Este documento describe todas las fórmulas utilizadas en el sistema para calcular los resúmenes financieros de las rutas.

## 📊 Variables y Conceptos Básicos

### Variables de Entrada
- **Caja Inicial**: Efectivo disponible al inicio de la ruta
- **Cartera Inicial**: Deuda total de clientes al inicio de la ruta
- **Recaudado Actual**: Dinero recibido de clientes en la ruta actual
- **Recaudado Pretendido**: Suma de parcelas que deberían cobrarse según clientes activos
- **Ingresos**: Dinero recibido NO relacionado con ventas (alquileres, servicios, etc.)
- **Ventas**: Valor original de productos vendidos a crédito (SIN intereses)
- **Intereses**: Diferencia entre el saldo inicial del cliente y el valor del producto
- **Egresos**: Gastos pagados durante la ruta (EXCEPTO retiros de caja)
- **Retiros**: Dinero retirado de la caja durante la ruta (tipo "Retiro de caja")

### Variables de Salida
- **Caja Final**: Efectivo disponible al finalizar la ruta
- **Cartera Final**: Deuda total de clientes al finalizar la ruta

---

## 🧮 Fórmulas Principales

### 1. Caja Final
```
Caja Final = Caja Inicial + Ingresos + Recaudado - Vent
as - Egresos - Retiros
```

**Explicación:**
- **Suma**: Caja Inicial (base), Ingresos (dinero extra), Recaudo (pagos de clientes)
- **Resta**: Ventas (dinero que sale para financiar clientes), Egresos (gastos), Retiros (dinero retirado)

**Nota importante**: Las ventas se restan porque aunque se recuperarán más tarde, representan dinero que sale del bolsillo en el momento de la venta.

---

### 2. Cartera Final
```
Cartera Final = Ventas + Intereses + Cartera Inicial - Recaudado
```

**Explicación:**
- **Suma**: Ventas (deuda nueva), Intereses (ganancia de las ventas), Cartera Inicial (deuda pendiente anterior)
- **Resta**: Recaudado (pagos recibidos que reducen la deuda)

**Nota importante**: Los egresos y retiros NO afectan la cartera, solo la caja.

---

## 📐 Cálculo de Componentes

### 3. Recaudado Actual
```
Recaudado = Σ (Valor de todos los pagos tipo 'Parcela' y 'Abono' en la ruta actual)
```

**Implementación:**
- Se filtran los pagos de la ruta actual con `tipo IN ['Parcela', 'Abono']`
- Se suman todos los valores de esos pagos

---

### 4. Ingresos
```
Ingresos = Σ (Valor de todos los ingresos registrados en la ruta actual)
```

**Implementación:**
- Se obtienen todos los documentos de `Ingreso` asociados a la ruta actual
- Se suman todos sus valores

---

### 5. Ventas
```
Ventas = Σ (Valor original de productos vendidos a crédito en la ruta actual)
         = Σ (cliente.valor) para clientes creados en la ruta actual
```

**Implementación:**
- Se filtran clientes creados durante la ruta actual
- Se suman sus valores `valor` (precio original del producto, SIN intereses)

**Nota importante**: Este valor NO incluye intereses. Los intereses se calculan por separado.

---

### 6. Intereses
```
Intereses = Σ (Intereses de clientes creados en la ruta actual)
          = Σ (cliente.intereses) O (cliente.total - cliente.valor) si intereses no existe
```

**Implementación:**
1. Se filtran clientes creados durante la ruta actual
2. Para cada cliente:
   - Si `cliente.intereses` existe y es válido → usar ese valor
   - Si no, calcular como `(cliente.total || 0) - (cliente.valor || 0)`
3. Se suman todos los intereses

**Cálculo al crear cliente:**
```
intereses = saldo_inicial - valor
```
Donde `saldo_inicial` es el monto total que el cliente debe pagar y `valor` es el precio del producto.

---

### 7. Egresos
```
Egresos = Σ (Valor de todos los egresos que NO son "Retiro de caja")
```

**Implementación:**
- Se filtran egresos de la ruta con `tipo != 'Retiro de caja'`
- Se suman todos sus valores

---

### 8. Retiros
```
Retiros = Σ (Valor de todos los egresos tipo "Retiro de caja")
```

**Implementación:**
- Se filtran egresos de la ruta con `tipo == 'Retiro de caja'`
- Se suman todos sus valores

---

### 9. Recaudo Pretendido
```
Recaudado Pretendido = Σ (parcela de clientes activos creados ANTES de la ruta actual)
```

**Implementación:**
- Se filtran clientes activos (`cancelado == false`) creados ANTES de la fecha de apertura de la ruta
- Se suman todas sus parcelas (`cliente.parcela`)

**Propósito**: Indica cuánto dinero se espera recibir de clientes anteriores.

---

## 🔄 Inicialización de Rutas

### 10. Caja Inicial (al abrir nueva ruta)
```
Si existe ruta anterior cerrada:
  Caja Inicial = Caja Final de la ruta anterior
Si NO existe ruta anterior (primer día):
  Caja Inicial = 0
```

**Implementación:**
```javascript
let cajaInicial = 0;
const rutaAnterior = await Ruta.findOne({ 
  vendedor: vendedorId, 
  abierta: false 
}).sort({ fechaCierre: -1 });

if (rutaAnterior) {
  cajaInicial = rutaAnterior.cajaFinal || 0;
}
```

---

### 11. Cartera Inicial (al abrir nueva ruta)
```
Si existe ruta anterior cerrada:
  Cartera Inicial = Cartera Final de la ruta anterior
Si NO existe ruta anterior (primer día):
  Cartera Inicial = 0
```

**Implementación:**
```javascript
let carteraInicial = 0;
if (rutaAnterior) {
  carteraInicial = rutaAnterior.carteraFinal || 0;
}
```

---

## 💾 Persistencia al Cerrar Ruta

### 12. Caja Final (persistida al cerrar ruta)
```
Al cerrar la ruta:
  1. Calcular: Caja Final = Caja Inicial + Ingresos + Recaudado - Ventas - Egresos - Retiros
  2. Redondear a 2 decimales
  3. Guardar en ruta.cajaFinal
```

**Implementación:**
```javascript
const cajaFinalRuta = (ruta.cajaInicial || 0) + ingresosRutaTotal + recaudadoRutaTotal 
                      - ventasRutaTotal - egresosRutaTotal - retirosRutaTotal;
ruta.cajaFinal = Math.round(cajaFinalRuta * 100) / 100;
```

---

### 13. Cartera Final (persistida al cerrar ruta)
```
Al cerrar la ruta:
  1. Calcular: Cartera Final = Cartera Inicial + Ventas + Intereses - Recaudado
  2. Redondear a 2 decimales
  3. Guardar en ruta.carteraFinal
```

**Implementación:**
```javascript
const carteraFinalRuta = (ruta.carteraInicial || 0) + ventasRutaTotal 
                         + interesesRutaTotal - recaudadoRutaTotal;
ruta.carteraFinal = Math.round(carteraFinalRuta * 100) / 100;
```

---

## 📋 Resumen de Estadísticas de Clientes

### 14. Clientes Nuevos
```
Nuevos = Cantidad de clientes creados en la ruta actual que:
  - NO son renovados (renovado == false)
  - NO están cancelados (cancelado == false)
```

---

### 15. Clientes Renovados
```
Renovados = Cantidad de clientes creados en la ruta actual que:
  - SON renovados (renovado == true)
  - NO están cancelados (cancelado == false)
```

---

### 16. Clientes Cancelados
```
Cancelados = Cantidad de clientes creados en la ruta actual que:
  - Están cancelados (cancelado == true)
```

---

## 🔍 Detalles de Implementación

### Filtrado de Clientes por Ruta
Los clientes se consideran "de la ruta actual" si:
```
fechaCreacion >= fechaAperturaRuta AND fechaCreacion <= fechaCierreRuta (o fecha actual si está abierta)
```

### Cálculo de Intereses al Cerrar Ruta
Al cerrar una ruta, el sistema calcula intereses de dos formas (en orden de prioridad):
1. Si `cliente.intereses` existe y es válido → usar ese valor
2. Si no, calcular como `(cliente.total || 0) - (cliente.valor || 0)`

Esto asegura que se use el valor más preciso disponible.

### Redondeo
Todos los valores finales (Caja Final, Cartera Final) se redondean a 2 decimales:
```javascript
valorRedondeado = Math.round(valor * 100) / 100;
```

---

## 📝 Ejemplo Práctico

### Escenario: Primer Día de Ruta

**Datos iniciales:**
- Caja Inicial: $0 (primer día)
- Cartera Inicial: $0 (primer día)

**Transacciones del día:**
- Ventas: $100 (cliente nuevo con producto de $100)
- Intereses: $10 (cliente debe pagar $110 en total)
- Recaudado: $0 (no se cobró nada)
- Ingresos: $50 (ingreso adicional)
- Egresos: $20 (gasto operativo)
- Retiros: $0

**Cálculos:**
- Caja Final = $0 + $50 + $0 - $100 - $20 - $0 = **-$70**
- Cartera Final = $100 + $10 + $0 - $0 = **$110**

**Al cerrar:**
- Caja Final se guarda como: **-$70.00**
- Cartera Final se guarda como: **$110.00**

### Escenario: Segundo Día

**Datos iniciales:**
- Caja Inicial: **-$70** (del día anterior)
- Cartera Inicial: **$110** (del día anterior)

**Transacciones del día:**
- Recaudado: $60 (se cobró parte de la deuda)
- Ventas: $0 (no hubo nuevas ventas)
- Intereses: $0
- Ingresos: $0
- Egresos: $10
- Retiros: $0

**Cálculos:**
- Caja Final = **-$70** + $0 + $60 - $0 - $10 - $0 = **-$20**
- Cartera Final = $0 + $0 + **$110** - $60 = **$50**

---

## ⚠️ Notas Importantes

1. **Ventas en Caja Final**: Las ventas se restan porque representan dinero que sale del bolsillo al financiar al cliente, aunque se recuperará más tarde.

2. **Intereses en Cartera**: Los intereses solo afectan la cartera, no la caja, porque representan ganancia futura sobre lo prestado.

3. **Egresos vs Retiros**: Los retiros son un tipo especial de egreso que se contabiliza por separado para mayor control.

4. **Persistencia**: Los valores de Caja Final y Cartera Final se guardan al cerrar la ruta y se usan como iniciales para la siguiente ruta.

5. **Primera Ruta**: Si no hay ruta anterior, tanto Caja Inicial como Cartera Inicial comienzan en $0.

---

**Última actualización**: Generado a partir del código en `backend-separado/index.js` (líneas 742-920, 925-954, 1020-1068)

