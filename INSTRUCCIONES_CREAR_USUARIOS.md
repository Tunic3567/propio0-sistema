# 📋 Instrucciones para Crear Usuarios con Código de Vinculación

## 🔑 Sistema de Código de Vinculación

El sistema ahora utiliza un **código de vinculación** para conectar administradores con sus vendedores. Este código debe ser el mismo para que el administrador pueda ver y gestionar a sus vendedores.

## 📝 Cómo Crear Usuarios en MongoDB Compass

### 1. **Crear Administrador**

```javascript
{
  "nombre": "Juan Pérez",
  "usuario": "admin1",
  "contrasena": "123456",
  "rol": "admin",
  "codigoVinculacion": "ABC123XYZ"
}
```

### 2. **Crear Vendedores (con el mismo código)**

```javascript
// Vendedor 1
{
  "nombre": "María García",
  "usuario": "vendedor1",
  "contrasena": "123456",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "codigoVinculacion": "ABC123XYZ"
}

// Vendedor 2
{
  "nombre": "Carlos López",
  "usuario": "vendedor2", 
  "contrasena": "123456",
  "pais": "Colombia",
  "ciudad": "Medellín",
  "codigoVinculacion": "ABC123XYZ"
}
```

## 🎯 Ejemplo Completo

### Grupo 1 - Empresa "Ventas Norte"
```javascript
// Administrador
{
  "nombre": "Ana Administradora",
  "usuario": "ana_admin",
  "contrasena": "admin123",
  "rol": "admin",
  "codigoVinculacion": "NORTE2024"
}

// Vendedores del grupo Norte
{
  "nombre": "Pedro Vendedor",
  "usuario": "pedro_v",
  "contrasena": "vendedor123",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "codigoVinculacion": "NORTE2024"
}

{
  "nombre": "Laura Vendedora",
  "usuario": "laura_v",
  "contrasena": "vendedor123",
  "pais": "Colombia", 
  "ciudad": "Cali",
  "codigoVinculacion": "NORTE2024"
}
```

### Grupo 2 - Empresa "Ventas Sur"
```javascript
// Administrador
{
  "nombre": "Carlos Administrador",
  "usuario": "carlos_admin",
  "contrasena": "admin456",
  "rol": "admin",
  "codigoVinculacion": "SUR2024"
}

// Vendedores del grupo Sur
{
  "nombre": "Sofia Vendedora",
  "usuario": "sofia_v",
  "contrasena": "vendedor456",
  "pais": "Colombia",
  "ciudad": "Medellín",
  "codigoVinculacion": "SUR2024"
}
```

## ⚠️ Reglas Importantes

1. **Código único por grupo**: Cada grupo de administrador + vendedores debe tener el mismo `codigoVinculacion`
2. **Código único en administradores**: No puede haber dos administradores con el mismo código
3. **Código obligatorio**: Tanto administradores como vendedores DEBEN tener el campo `codigoVinculacion`
4. **Usuarios únicos**: Los `usuario` deben ser únicos en toda la base de datos

## 🔧 Pasos en MongoDB Compass

1. **Abrir MongoDB Compass**
2. **Conectar a la base de datos** `propio0`
3. **Seleccionar la colección** `administradores` o `vendedores`
4. **Hacer clic en "Add Data" → "Insert Document"**
5. **Pegar el JSON del usuario** (sin las comillas del ejemplo)
6. **Hacer clic en "Insert"**

## 🎉 Resultado

- El administrador solo verá vendedores con su mismo código de vinculación
- Los vendedores solo podrán acceder a sus propios datos
- Cada grupo funciona de forma independiente
- No hay necesidad de gestionar vínculos manualmente desde la interfaz

## 📋 Lista de Campos Requeridos

### Administrador:
- `nombre` (String)
- `usuario` (String, único)
- `contrasena` (String)
- `rol` (String, debe ser "admin")
- `codigoVinculacion` (String, único)

### Vendedor:
- `nombre` (String)
- `usuario` (String, único)
- `contrasena` (String)
- `pais` (String, opcional)
- `ciudad` (String, opcional)
- `codigoVinculacion` (String, debe coincidir con su administrador)
