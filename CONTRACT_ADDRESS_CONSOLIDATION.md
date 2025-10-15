# Contract Address Consolidation

## 🎯 Objetivo

Consolidar todas las referencias a direcciones de contrato para que **siempre** usen la variable de entorno `NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA` del archivo `.env`.

---

## ❌ Problema Anterior

Múltiples archivos tenían direcciones de contrato **hardcodeadas**, lo que causaba:
- ❌ Confusión sobre qué contrato se está usando
- ❌ Errores al usar contratos antiguos sin funciones nuevas
- ❌ Dificultad para cambiar de contrato
- ❌ Inconsistencias entre scripts

---

## ✅ Solución Implementada

Todos los scripts ahora leen la dirección del contrato desde `.env`:

```typescript
const contractAddress = process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA;

if (!contractAddress) {
  throw new Error("NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA not set in .env");
}
```

---

## 📝 Archivos Modificados

### 1. `scripts/verify-basescan.ts` ✅
**Antes:**
```typescript
const contractAddress = "0x0F845905674451bCA3e1D165241de3076F2E5864";
```

**Después:**
```typescript
const contractAddress = process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA;
if (!contractAddress) {
  throw new Error("NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA not set in .env");
}
```

### 2. `scripts/verify-contract.ts` ✅
**Antes:**
```typescript
const contractAddress = "0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E";
```

**Después:**
```typescript
const contractAddress = process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA;
if (!contractAddress) {
  throw new Error("NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA not set in .env");
}
```

### 3. `scripts/test-new-contract.ts` ✅
**Antes:**
```typescript
// HARDCODED new contract address
const contractAddress = "0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E";
```

**Después:**
```typescript
const contractAddress = process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA;
if (!contractAddress) {
  throw new Error("NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA not set in .env");
}
```

### 4. `scripts/check-active-games.ts` ✅
**Antes:**
```typescript
const contractAddress = "0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E";
```

**Después:**
```typescript
const contractAddress = process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA;
if (!contractAddress) {
  throw new Error("NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA not set in .env");
}
```

### 5. `scripts/test-game-details.ts` ✅
**Antes:**
```typescript
const contract = new ethers.Contract(
  "0xdae7DC676AceedF06Cd16c04bb75c1a9C41f9737",
  abi,
  provider
);
```

**Después:**
```typescript
const contractAddress = process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA;
if (!contractAddress) {
  throw new Error("NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA not set in .env");
}
const contract = new ethers.Contract(contractAddress, artifact.abi, provider);
```

### 6. `lib/contracts/grabli.ts` ✅
**Mantiene el uso de `.env` (ya estaba correcto):**
```typescript
export const GRABLI_ADDRESSES: Record<number, GrabliContractAddress> = {
  84532: (process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA || '0x0') as Address,
  8453: (process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS || '0x0') as Address,
  31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address, // Local hardhat
};
```

---

## 🔧 Configuración Actual

### Archivo `.env`

```bash
# Smart Contract Address (Base Sepolia Testnet)
NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA=0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E

# Smart Contract Address (Base Mainnet)
NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS=0x...  # To be deployed
```

### Contrato Actual

**Network**: Base Sepolia (Testnet)
**Address**: `0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E`
**Features**:
- ✅ Auto-close functionality
- ✅ `getActiveGames()` function
- ✅ Verified on BaseScan
- ✅ Active Game: #1

**BaseScan**: https://sepolia.basescan.org/address/0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E#code

---

## 📋 Contratos Históricos

### Contrato 1 (Obsoleto)
```
0xdae7DC676AceedF06Cd16c04bb75c1a9C41f9737
```
- Primera versión
- ❌ No usar

### Contrato 2 (Obsoleto)
```
0x0F845905674451bCA3e1D165241de3076F2E5864
```
- Segunda versión
- ❌ No tiene `getActiveGames()`
- ❌ No usar

### Contrato 3 (Actual) ✅
```
0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E
```
- Versión con auto-close
- ✅ Tiene `getActiveGames()`
- ✅ **USAR ESTE**

---

## 🎯 Beneficios de la Consolidación

### 1. Fuente Única de Verdad ✅
- Una sola variable de entorno controla todo
- No más direcciones hardcodeadas
- Fácil de actualizar

### 2. Consistencia ✅
- Todos los scripts usan el mismo contrato
- No más confusión sobre qué contrato usar
- Resultados predecibles

### 3. Mantenimiento Simplificado ✅
- Cambiar de contrato: solo actualizar `.env`
- No necesitas editar múltiples archivos
- Menos propenso a errores

### 4. Validación Automática ✅
- Scripts validan que la variable exista
- Error claro si no está configurado
- Previene errores silenciosos

---

## 🚀 Uso

### Para Desarrollo Local

1. **Verificar `.env`:**
   ```bash
   grep GRABLI_CONTRACT_ADDRESS .env
   ```

2. **Debe mostrar:**
   ```bash
   NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA=0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E
   ```

3. **Ejecutar cualquier script:**
   ```bash
   npx hardhat run scripts/check-active-games.ts --network baseSepolia
   npx hardhat run scripts/verify-contract.ts --network baseSepolia
   npx hardhat run scripts/test-game-details.ts --network baseSepolia
   ```

### Para Cambiar de Contrato

1. **Editar `.env`:**
   ```bash
   NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA=0xNUEVA_DIRECCION
   ```

2. **Reiniciar servidor dev:**
   ```bash
   npm run dev
   ```

3. **Listo!** Todos los scripts ahora usan el nuevo contrato

---

## ✅ Checklist de Verificación

Antes de ejecutar scripts:

- [ ] ✅ `.env` tiene `NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA`
- [ ] ✅ La dirección es `0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E`
- [ ] ✅ El servidor dev está reiniciado (si cambió `.env`)
- [ ] ✅ No hay direcciones hardcodeadas en tus cambios

---

## 🔍 Verificación

### Script para Verificar Direcciones Hardcodeadas

```bash
# Buscar direcciones hardcodeadas (excluyendo la local de hardhat)
grep -r "0x[0-9a-fA-F]\{40\}" \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  scripts/ lib/ app/ \
  | grep -v ".env" \
  | grep -v "0x0000000000000000000000000000000000000000" \
  | grep -v "0x5FbDB2315678afecb367f032d93F642f64180aa3"
```

**Resultado esperado**: Solo debe mostrar la dirección local de hardhat si existe.

### Verificar Script Individual

```bash
# Verificar que el script usa .env
cat scripts/check-active-games.ts | grep "process.env.NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA"
```

**Debe mostrar una línea** indicando que usa la variable de entorno.

---

## 📖 Resumen

**Todos los scripts ahora están consolidados** para usar la dirección del contrato desde `.env`:

✅ `scripts/verify-basescan.ts`
✅ `scripts/verify-contract.ts`
✅ `scripts/test-new-contract.ts`
✅ `scripts/check-active-games.ts`
✅ `scripts/test-game-details.ts`
✅ `lib/contracts/grabli.ts`

**Contrato actual**:
- Dirección: `0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E`
- Network: Base Sepolia
- Estado: Verificado ✅
- Features: Auto-close + getActiveGames() ✅

**No más direcciones hardcodeadas!** 🎉

---

**Fecha**: 2025-10-15
**Total de archivos modificados**: 5 scripts + 1 configuración
**Estado**: ✅ COMPLETADO
