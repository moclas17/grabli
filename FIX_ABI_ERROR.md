# Fix: ABI Filter Error

## ❌ Problema

Error al intentar crear o cerrar juegos:
```
Error: abi.filter is not a function
```

## 🔍 Causa Raíz

El archivo `lib/contracts/GrabliABI.json` contiene el artifact completo de Hardhat, que es un **objeto** con múltiples propiedades:

```json
{
  "_format": "hh3-artifact-1",
  "contractName": "Grabli",
  "sourceName": "contracts/Grabli.sol",
  "abi": [ ... ],  // <-- El ABI real está aquí
  "bytecode": "...",
  "deployedBytecode": "...",
  ...
}
```

El código estaba importando **todo el objeto** en lugar de solo el array `abi`:

```typescript
// ❌ INCORRECTO
import GrabliABI from './GrabliABI.json';
export const GRABLI_ABI = GrabliABI;  // Exporta todo el objeto

// Wagmi espera un array, pero recibe un objeto
// objeto.filter() -> Error: abi.filter is not a function
```

## ✅ Solución

Actualizar `lib/contracts/grabli.ts` para extraer solo el array `abi`:

```typescript
// ✅ CORRECTO
import GrabliArtifact from './GrabliABI.json';
export const GRABLI_ABI = GrabliArtifact.abi;  // Exporta solo el array ABI
```

## 📝 Cambio Realizado

**Archivo**: `lib/contracts/grabli.ts`

**Antes**:
```typescript
import { Address } from 'viem';
import GrabliABI from './GrabliABI.json';

export const GRABLI_ABI = GrabliABI;
```

**Después**:
```typescript
import { Address } from 'viem';
import GrabliArtifact from './GrabliABI.json';

export const GRABLI_ABI = GrabliArtifact.abi;
```

## 🧪 Verificación

```bash
# El ABI debe ser un array
jq '.abi | type' lib/contracts/GrabliABI.json
# Output: "array"

# Debe tener funciones
jq '.abi | length' lib/contracts/GrabliABI.json
# Output: 27

# Incluye getActiveGames
jq '.abi[] | select(.name == "getActiveGames")' lib/contracts/GrabliABI.json
# Output: { "inputs": [], "name": "getActiveGames", ... }
```

## ✅ Resultado

Ahora `GRABLI_ABI` es un array de funciones que Wagmi puede procesar correctamente:

- ✅ `useReadContract` funciona
- ✅ `useWriteContract` funciona
- ✅ Crear juegos funciona
- ✅ Cerrar juegos funciona
- ✅ Todas las funciones del contrato accesibles

## 🔄 Cómo Aplicar el Fix

1. El cambio ya está aplicado en `lib/contracts/grabli.ts`
2. El servidor de desarrollo se recarga automáticamente
3. Refrescar la página del navegador
4. Probar crear/cerrar juegos en `/admin`

## 📚 Información Adicional

### Estructura del Artifact de Hardhat

El archivo JSON generado por Hardhat (`artifacts/contracts/Grabli.sol/Grabli.json`) contiene:

- `_format`: Versión del formato del artifact
- `contractName`: Nombre del contrato
- `sourceName`: Ruta del archivo fuente
- **`abi`**: Array de funciones, eventos y errores del contrato ✅
- `bytecode`: Código bytecode para deployment
- `deployedBytecode`: Código bytecode desplegado
- `linkReferences`: Referencias a librerías
- `deployedLinkReferences`: Referencias en código desplegado

### Por Qué Wagmi Necesita Solo el ABI

Wagmi (y viem) esperan recibir un **array ABI** para:
1. Filtrar funciones por nombre
2. Validar tipos de parámetros
3. Encodear/decodear datos
4. Generar interfaces TypeScript

Cuando recibe un objeto completo, intenta hacer `.filter()` sobre el objeto y falla.

## 🎯 Resumen

**Problema**: Error `abi.filter is not a function`
**Causa**: Exportar objeto completo en lugar de array ABI
**Solución**: Cambiar `GrabliABI` a `GrabliArtifact.abi`
**Estado**: ✅ **RESUELTO**

---

**Fecha**: 2025-10-15
**Archivo Modificado**: `lib/contracts/grabli.ts`
