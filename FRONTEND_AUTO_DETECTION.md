# Frontend Auto-Detection Implementation

## ✅ Implementación Completada

El frontend ahora detecta automáticamente el juego activo usando la función `getActiveGames()` del smart contract. Ya **NO es necesario** actualizar manualmente `NEXT_PUBLIC_CURRENT_GAME_ID` en el archivo `.env`.

---

## 🎯 Características Implementadas

### 1. Hook `useActiveGames()`
**Archivo**: `lib/hooks/useGrabliContract.ts`

```typescript
export function useActiveGames() {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: getGrabliAddress(baseSepolia.id),
    abi: GRABLI_ABI,
    functionName: 'getActiveGames',
    chainId: baseSepolia.id,
  });

  const activeGames = (data as bigint[]) || [];
  const activeGameId = activeGames.length > 0 ? activeGames[0] : null;
  const hasActiveGame = activeGames.length > 0;

  return {
    activeGames,      // Array de IDs de juegos activos
    activeGameId,     // ID del primer juego activo (o null)
    hasActiveGame,    // Boolean: hay al menos un juego activo
    isLoading,
    isError,
    refetch,
  };
}
```

### 2. Página Principal (`app/page.tsx`)

**Cambios principales**:

✅ **Auto-detección del juego activo**:
```typescript
const { activeGameId, hasActiveGame, isLoading: isLoadingActiveGames } = useActiveGames();
const currentGameId = activeGameId || BigInt(0);
```

✅ **Uso del juego detectado en todos los hooks**:
```typescript
const { gameState } = useGameState(currentGameId);
const { gameDetails } = useGameDetails(currentGameId);
const { leaderboard } = useLeaderboard(currentGameId);
const { playerStats } = usePlayerStats(userAddress, currentGameId);
```

✅ **Validación antes de claim**:
```typescript
const handleClaim = () => {
  if (!userAddress) {
    alert("Please connect your wallet first!");
    return;
  }
  if (!hasActiveGame) {
    alert("No active game found!");
    return;
  }
  claim(currentGameId);
};
```

✅ **Badge visual del Game ID**:
```typescript
<div style={{...}}>
  Game #{currentGameId.toString()}
</div>
```

✅ **Estados de carga mejorados**:
```typescript
if (isLoadingActiveGames || isLoadingState || isLoadingDetails) {
  return <div>{isLoadingActiveGames ? 'Detecting active game...' : 'Loading game data...'}</div>
}
```

✅ **Mensajes informativos**:
- Si hay juego activo sin datos: "Game ID X has no data yet"
- Si NO hay juego activo: "No active game found. Please wait for the owner to create a new game"

### 3. Página Admin (`app/admin/page.tsx`)

**Cambios principales**:

✅ **Auto-detección del juego activo**:
```typescript
const { activeGameId, hasActiveGame } = useActiveGames();
const currentGameId = activeGameId || BigInt(0);
```

✅ **Advertencia de auto-close al crear juego**:
```typescript
{hasActiveGame && (
  <>
    <br /><br />
    <strong>⚠️ Auto-Close:</strong> Creating a new game will automatically
    close the active game (ID: {currentGameId.toString()}) and determine its winner.
  </>
)}
```

✅ **Force Close con validación**:
```typescript
onClick={() => {
  if (!hasActiveGame) {
    alert('No active game to close!');
    return;
  }
  if (confirm(`Are you sure you want to force close game ${currentGameId.toString()}?`)) {
    forceCloseGame(currentGameId);
  }
}}
```

✅ **Mensaje dinámico en Force Close**:
- Si hay juego: "This will immediately end the active game (ID: X)"
- Si NO hay juego: "No active game to close. Create a new game first."

---

## 🔄 Flujo de Trabajo

### Escenario 1: Sin Juegos Activos
1. Usuario visita la página principal
2. `useActiveGames()` retorna `hasActiveGame = false`
3. Se muestra: "No active game found. Please wait for owner to create a new game"
4. Botón de claim deshabilitado

### Escenario 2: Con Juego Activo
1. Usuario visita la página principal
2. `useActiveGames()` detecta Game ID (ej: `1`)
3. Automáticamente carga datos del Game ID `1`
4. Muestra badge "Game #1"
5. Usuario puede hacer claim

### Escenario 3: Admin Crea Nuevo Juego
1. Admin abre `/admin`
2. Ve advertencia: "⚠️ Auto-Close: Creating a new game will automatically close the active game"
3. Admin crea nuevo juego
4. Smart contract cierra automáticamente el juego anterior
5. Emite evento `GameFinished` para el juego cerrado
6. Emite evento `GameCreated` para el nuevo juego
7. Frontend detecta automáticamente el nuevo juego
8. ✨ **No se requiere actualizar .env**

---

## 📋 ABI Actualizado

El archivo `lib/contracts/GrabliABI.json` ahora incluye:

```json
{
  "inputs": [],
  "name": "getActiveGames",
  "outputs": [
    {
      "internalType": "uint256[]",
      "name": "",
      "type": "uint256[]"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}
```

---

## 🧪 Testing

### Local Development
```bash
npm run dev
```
- Servidor corriendo en: http://localhost:3003
- Network: Base Sepolia (testnet)

### Pasos de Prueba

1. **Verificar detección automática**:
   - Abrir http://localhost:3003
   - Debe detectar automáticamente Game #1
   - Verificar badge "Game #1" visible

2. **Probar sin juego activo**:
   - En admin, cerrar todos los juegos
   - Verificar mensaje "No active game found"

3. **Crear nuevo juego**:
   - Ir a http://localhost:3003/admin
   - Conectar wallet del owner
   - Crear nuevo juego
   - Verificar que página principal detecta nuevo juego automáticamente

4. **Auto-close**:
   - Con un juego activo, crear otro juego
   - Verificar en BaseScan que se emite `GameFinished` evento
   - Confirmar que frontend muestra el nuevo juego

---

## 🎨 UI/UX Improvements

### Visual Indicators

1. **Game ID Badge**:
   - Color: Verde translúcido
   - Ubicación: Debajo de la descripción del premio
   - Formato: "Game #X"

2. **Loading States**:
   - "Detecting active game..." (mientras detecta)
   - "Loading game data..." (mientras carga datos)

3. **Error States**:
   - "No active game found" con instrucciones claras
   - "No active game to close" en admin

4. **Success Messages**:
   - "✅ Game created successfully!" con link a transacción
   - "✅ Game closed successfully!" con link a transacción

---

## ⚙️ Configuración

### Variables de Entorno (.env)

**Antes** (manual):
```bash
NEXT_PUBLIC_CURRENT_GAME_ID=1  # ⚠️ Había que actualizar manualmente
```

**Ahora** (automático):
```bash
# Ya NO es necesario NEXT_PUBLIC_CURRENT_GAME_ID
# El frontend detecta automáticamente el juego activo
```

**Requeridas**:
```bash
NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA=0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_key_here
```

---

## 🔧 Troubleshooting

### Problema: "No active game found"

**Solución**:
1. Verificar que hay un juego creado en el contrato
2. Usar admin panel para crear un juego
3. Verificar en BaseScan que el juego existe

### Problema: El juego no se detecta

**Solución**:
1. Verificar que el ABI está actualizado: `lib/contracts/GrabliABI.json`
2. Verificar dirección del contrato en `.env`
3. Refrescar la página
4. Revisar consola del navegador para errores

### Problema: Error al crear juego

**Solución**:
1. Verificar que estás en Base Sepolia (chainId: 84532)
2. Confirmar que la wallet conectada es el owner del contrato
3. Verificar que tienes suficiente ETH para gas

---

## 📊 Beneficios de la Implementación

### Para Usuarios
✅ No necesitan saber el Game ID
✅ Siempre ven el juego correcto automáticamente
✅ Mejor UX con mensajes claros
✅ Indicador visual del juego actual

### Para Administradores
✅ No necesitan actualizar `.env` al crear juegos
✅ Advertencias claras sobre auto-close
✅ Validaciones antes de cerrar juegos
✅ Feedback inmediato de acciones

### Para Desarrolladores
✅ Código más limpio y mantenible
✅ Menos configuración manual
✅ Menos errores por IDs incorrectos
✅ Fácil de testear

---

## 🚀 Deploy

### Producción (Vercel)
```bash
vercel --prod
```

### Environment Variables en Vercel
```
NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA=0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_key_here
NEXT_PUBLIC_CDP_API_KEY=your_cdp_key
```

**Nota**: Ya NO incluir `NEXT_PUBLIC_CURRENT_GAME_ID`

---

## 📝 Resumen

La implementación de auto-detección está **completa y funcional**:

✅ Smart contract actualizado con `getActiveGames()`
✅ Nuevo hook `useActiveGames()` creado
✅ Página principal actualizada
✅ Página admin actualizada
✅ ABI actualizado
✅ UI mejorada con indicadores visuales
✅ Validaciones implementadas
✅ Servidor de desarrollo funcionando

**El frontend ahora detecta automáticamente el juego activo sin necesidad de configuración manual.**

🎮 **Listo para usar!**
