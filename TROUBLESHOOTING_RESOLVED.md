# Troubleshooting - Problemas Resueltos

## Resumen de Problemas y Soluciones

---

## ❌ Problema 1: Error "abi.filter is not a function"

### Síntoma
Error al intentar crear o cerrar juegos en la interfaz admin.

### Causa
El archivo `lib/contracts/GrabliABI.json` contiene el artifact completo de Hardhat (objeto), no solo el ABI (array). Wagmi esperaba un array pero recibía un objeto.

### Solución
Actualizar `lib/contracts/grabli.ts`:

```typescript
// ❌ ANTES
import GrabliABI from './GrabliABI.json';
export const GRABLI_ABI = GrabliABI;

// ✅ DESPUÉS
import { Abi } from 'viem';
import GrabliArtifact from './GrabliABI.json';
export const GRABLI_ABI = GrabliArtifact.abi as Abi;
```

**Archivo modificado**: `lib/contracts/grabli.ts`
**Estado**: ✅ RESUELTO

---

## ❌ Problema 2: Frontend no detecta juego activo

### Síntoma
- Creaste un juego desde el admin
- El contrato muestra el juego activo (verificado con script)
- Pero el frontend muestra "No active game found"
- El admin no puede cerrar el juego

### Causa
El archivo `.env` contenía la dirección del contrato **antiguo** sin la función `getActiveGames()`:
```bash
# ❌ Dirección incorrecta (contrato antiguo)
NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA=0x0F845905674451bCA3e1D165241de3076F2E5864
```

### Solución
Actualizar `.env` con la dirección del contrato **nuevo** con auto-close:

```bash
# ✅ Dirección correcta (contrato con auto-close)
NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA=0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E
```

### Pasos adicionales
1. Reiniciar el servidor de desarrollo: `npm run dev`
2. Refrescar la página del navegador
3. Verificar en http://localhost:3003/debug

**Archivo modificado**: `.env`
**Estado**: ✅ RESUELTO

---

## 🔧 Verificación de Soluciones

### Script de Verificación
Creamos un script para verificar el estado del contrato:

```bash
npx hardhat run scripts/check-active-games.ts --network baseSepolia
```

**Resultado esperado**:
```
Active Game IDs: [ '1' ]
Count: 1

Game #1 Details:
  Prize Title: Test Game 2 - Auto Close Test
  Finished: false
```

### Página de Debug
Creamos una página de debug en `/debug` que muestra:
- ✅ Si el ABI es un array
- ✅ Si tiene la función `getActiveGames`
- ✅ El resultado de `useActiveGames()`
- ✅ Estado de carga y errores

**URL**: http://localhost:3003/debug

---

## 📋 Checklist de Verificación

Antes de usar la aplicación, verificar:

- [ ] ✅ ABI exportado como array en `lib/contracts/grabli.ts`
- [ ] ✅ Dirección del contrato correcta en `.env`
- [ ] ✅ Servidor de desarrollo reiniciado después de cambios en `.env`
- [ ] ✅ Navegador refrescado (Ctrl+Shift+R para hard refresh)

### Direcciones de Contratos

**Contrato Antiguo** (SIN auto-close):
```
0x0F845905674451bCA3e1D165241de3076F2E5864
```
- ❌ NO usar esta dirección
- No tiene función `getActiveGames()`

**Contrato Nuevo** (CON auto-close):
```
0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E
```
- ✅ Usar esta dirección
- Tiene función `getActiveGames()`
- Auto-cierra juegos al crear uno nuevo
- Verificado en BaseScan

---

## 🎯 Estado Final

### ✅ Funcionando Correctamente

1. **Auto-detección de juegos activos**
   - Frontend detecta automáticamente Game #1
   - No requiere configuración manual de `NEXT_PUBLIC_CURRENT_GAME_ID`

2. **Admin Panel** (`/admin`)
   - Crear juegos ✅
   - Cerrar juegos forzadamente ✅
   - Advertencias de auto-close visibles ✅

3. **Página Principal** (`/`)
   - Muestra juego activo con badge "Game #1" ✅
   - Botón de claim funcional ✅
   - Leaderboard funcional ✅

4. **Debug Page** (`/debug`)
   - Muestra estado del ABI ✅
   - Muestra juegos activos ✅
   - Útil para troubleshooting ✅

---

## 🚀 Uso Normal

### Para Jugar
1. Ir a http://localhost:3003
2. Conectar wallet
3. Verificar que muestra "Game #1"
4. Click en "GRAB IT NOW!"

### Para Administrar
1. Ir a http://localhost:3003/admin
2. Conectar wallet del owner
3. **Crear nuevo juego**: Completa el formulario y submit
   - ⚠️ Se cerrará automáticamente cualquier juego activo
4. **Cerrar juego**: Click en "Force Close Game"
   - Solo disponible si hay un juego activo

### Para Debugging
1. Ir a http://localhost:3003/debug
2. Verificar:
   - ABI Type: Array ✅
   - Has getActiveGames: Yes ✅
   - Active Game Detected: #1 ✅

---

## 📝 Archivos Modificados

1. **lib/contracts/grabli.ts**
   - Exportar `GrabliArtifact.abi` en lugar de `GrabliABI`
   - Cast a tipo `Abi` de viem

2. **.env**
   - Actualizar dirección del contrato a `0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E`

3. **app/debug/page.tsx** (nuevo)
   - Página de debugging para verificar estado del ABI y juegos activos

4. **scripts/check-active-games.ts** (nuevo)
   - Script para verificar juegos activos desde CLI

---

## 🎉 Todo Funcionando

El sistema ahora está completamente funcional:

✅ Smart contract desplegado y verificado
✅ Frontend detecta juegos automáticamente
✅ Admin puede crear y cerrar juegos
✅ Auto-close funciona correctamente
✅ Eventos emitidos correctamente
✅ UI muestra información correcta

**¡Listo para usar!** 🚀

---

**Fecha de resolución**: 2025-10-15
**Contratos actualizados**: 2 problemas principales resueltos
