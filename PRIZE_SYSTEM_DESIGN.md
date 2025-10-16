# Sistema de Premios ERC20 - Diseño Técnico

## Resumen
El sistema permitirá que los sponsors depositen tokens ERC20 (USDC, USDT, etc.) al crear un juego, y el contrato transferirá automáticamente el premio al ganador cuando el juego termine.

## Cambios al Smart Contract

### 1. Estructura del Juego (Game struct)
```solidity
struct Game {
    string prizeTitle;
    uint256 prizeValue;        // Valor en USD (display only)
    string prizeCurrency;      // "USDC" (display only)
    string prizeDescription;

    // NUEVOS CAMPOS
    address prizeToken;        // Dirección del token ERC20 (USDC, USDT, etc.)
    uint256 prizeAmount;       // Cantidad real de tokens (ej: 100e6 para 100 USDC)

    address sponsor;
    string sponsorName;
    string sponsorUrl;
    string sponsorLogo;
    uint256 startAt;
    uint256 endAt;
    uint256 claimCooldown;
    address holder;
    uint256 sinceTs;
    bool finished;
    address winner;
    uint256 winnerTotalSeconds;
}
```

### 2. Función createGame() Modificada (NO inicia el juego)
```solidity
function createGame(
    string memory _prizeTitle,
    uint256 _prizeValue,
    string memory _prizeCurrency,
    string memory _prizeDescription,
    address _prizeToken,        // NUEVO: Dirección del token (address(0) = sin premio)
    uint256 _prizeAmount,       // NUEVO: Cantidad de tokens
    string memory _sponsorName,
    string memory _sponsorUrl,
    string memory _sponsorLogo,
    uint256 _duration,
    uint256 _claimCooldown
) external onlyOwner nonReentrant {
    // Cerrar juegos activos automáticamente
    _closeAllActiveGames();

    // Crear nuevo juego SIN iniciar (startAt = 0, endAt = 0)
    games[gameCount] = Game({
        prizeTitle: _prizeTitle,
        prizeValue: _prizeValue,
        prizeCurrency: _prizeCurrency,
        prizeDescription: _prizeDescription,
        prizeToken: _prizeToken,
        prizeAmount: _prizeAmount,
        sponsor: msg.sender,
        sponsorName: _sponsorName,
        sponsorUrl: _sponsorUrl,
        sponsorLogo: _sponsorLogo,
        startAt: 0,                    // NO iniciado aún
        endAt: 0,                       // NO iniciado aún
        claimCooldown: _claimCooldown,
        holder: address(0),
        sinceTs: 0,
        finished: false,
        winner: address(0),
        winnerTotalSeconds: 0
    });

    // Guardar duración para usarla al fondear
    gameDuration[gameCount] = _duration;

    emit GameCreated(gameCount, _prizeTitle, _prizeAmount, _prizeToken);
    gameCount++;
}
```

### 3. Nueva Función fundGame()
```solidity
// Mapping para guardar la duración del juego
mapping(uint256 => uint256) public gameDuration;

function fundGame(uint256 _gameId) external nonReentrant {
    Game storage game = games[_gameId];

    require(_gameId < gameCount, "Game does not exist");
    require(game.startAt == 0, "Game already funded/started");
    require(game.prizeToken != address(0), "Game has no token prize");
    require(game.prizeAmount > 0, "Game has no prize amount");
    require(msg.sender == game.sponsor, "Only sponsor can fund");

    // Transferir tokens del sponsor al contrato
    IERC20(game.prizeToken).transferFrom(msg.sender, address(this), game.prizeAmount);

    // INICIAR el juego ahora que está fondeado
    game.startAt = block.timestamp;
    game.endAt = block.timestamp + gameDuration[_gameId];

    emit GameFunded(_gameId, game.prizeToken, game.prizeAmount);
}
```

### 3. Función closeGame() Modificada
```solidity
function closeGame(uint256 _gameId) external {
    Game storage game = games[_gameId];

    require(_gameId < gameCount, "Game does not exist");
    require(block.timestamp >= game.endAt, "Game has not ended yet");
    require(!game.finished, "Game already finished");

    // Calcular tiempo final del holder actual
    if (game.holder != address(0)) {
        uint256 finalTime = game.endAt - game.sinceTs;
        playerStats[_gameId][game.holder].totalSeconds += finalTime;
    }

    // Determinar ganador
    address winner = address(0);
    uint256 maxSeconds = 0;

    address[] memory players = gamePlayers[_gameId];
    for (uint256 i = 0; i < players.length; i++) {
        address player = players[i];
        uint256 totalSeconds = playerStats[_gameId][player].totalSeconds;

        if (totalSeconds > maxSeconds) {
            maxSeconds = totalSeconds;
            winner = player;
        }
    }

    game.finished = true;
    game.winner = winner;
    game.winnerTotalSeconds = maxSeconds;

    // NUEVO: Transferir premio automáticamente al ganador
    if (game.prizeToken != address(0) && game.prizeAmount > 0 && winner != address(0)) {
        IERC20(game.prizeToken).transfer(winner, game.prizeAmount);
        emit PrizeClaimed(_gameId, winner, game.prizeToken, game.prizeAmount);
    }

    emit GameFinished(_gameId, winner, maxSeconds);
}
```

### 4. Nuevos Eventos
```solidity
event GameCreated(
    uint256 indexed gameId,
    string prizeTitle,
    uint256 prizeAmount,
    address prizeToken
);

event GameFunded(
    uint256 indexed gameId,
    address prizeToken,
    uint256 amount
);

event PrizeClaimed(
    uint256 indexed gameId,
    address indexed winner,
    address prizeToken,
    uint256 amount
);
```

### 5. Interface IERC20
```solidity
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}
```

## Flujo Completo (CON FONDEO PREVIO)

### A. Crear Juego (SIN iniciar)
```
1. Sponsor crea el juego
2. Frontend: createGame(..., USDC_ADDRESS, 100e6, ...)
   - Usuario confirma transacción de creación
3. Juego se crea pero NO se inicia (startAt = 0)
4. Status: "PENDING_FUNDING"
5. Frontend muestra: "Waiting for funding..."
```

### B. Fondear Juego
```
1. Sponsor debe fondear el juego creado
2. Frontend: approve(GrabliContract, 100 USDC)
   - Usuario confirma transacción de approval
3. Frontend: fundGame(gameId)
   - Usuario confirma transacción de fondeo
4. Contrato ejecuta: USDC.transferFrom(sponsor, contract, 100 USDC)
5. Contrato actualiza: startAt = block.timestamp
6. Juego INICIA automáticamente al recibir fondos
```

### C. Durante el Juego
```
- Players juegan normalmente (claim)
- Premio permanece en el contrato
- Nadie puede retirar el premio hasta que termine
```

### D. Finalizar Juego
```
1. Cualquiera llama: closeGame(gameId)
2. Contrato:
   - Calcula ganador (más tiempo acumulado)
   - Transfiere: contract → winner (100 USDC)
   - Emite evento: PrizeClaimed
3. Winner recibe automáticamente 100 USDC en su wallet
```

## Direcciones de Tokens en Base Sepolia

```javascript
const TOKENS = {
  USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia USDC
  // Agregar más tokens según necesidad
};
```

## Cambios en el Frontend

### 1. Admin Panel - Crear Juego (2 pasos)
```typescript
// Paso 1: Crear juego (NO requiere approval aún)
<input name="prizeToken" placeholder="Token Address (USDC)" />
<input name="prizeAmount" placeholder="Prize Amount (100)" />

<button onClick={createGame}>
  1. Create Game (No funding yet)
</button>

// Paso 2: Fondear juego (después de crearlo)
{pendingGame && (
  <div>
    <p>Game created! Game ID: {pendingGame.id}</p>
    <p>Status: PENDING_FUNDING</p>
    <button onClick={() => {
      // 1. Approve tokens
      approve(tokenAddress, amount)
      // 2. Fund the game
      fundGame(gameId)
    }}>
      2. Fund Game & Start
    </button>
  </div>
)}
```

### 2. Página Principal
```typescript
// Mostrar si el juego está esperando fondeo
{gameState.startAt === 0 && gameState.prizeToken !== "0x0000..." && (
  <div style={{background: 'orange'}}>
    ⏳ Game created but not funded yet
    <div>Waiting for sponsor to deposit {gameState.prizeAmount} tokens</div>
  </div>
)}

// Mostrar si el juego tiene premio real y está activo
{gameState.startAt > 0 && gameState.prizeToken !== "0x0000..." && (
  <div>
    💰 Real Prize: {gameState.prizeAmount} tokens
    <div>Will be automatically sent to winner</div>
  </div>
)}
```

### 3. Winner Banner
```typescript
// Cuando termina el juego
{gameState.finished && gameState.winner && (
  <div>
    Winner: {gameState.winner}
    {gameState.prizeAmount > 0 && (
      <div>✅ Prize automatically sent to winner!</div>
    )}
  </div>
)}
```

## Ventajas de este Sistema

✅ **Automático**: El ganador recibe el premio instantáneamente
✅ **Transparente**: Todos ven el premio bloqueado en el contrato
✅ **Seguro**: El sponsor no puede retirar el premio una vez depositado
✅ **Flexible**: Soporta cualquier token ERC20 (USDC, USDT, custom tokens)
✅ **Sin fricción**: El ganador no necesita hacer nada, recibe automáticamente

## Consideraciones de Seguridad

1. **ReentrancyGuard**: Ya implementado en el contrato actual
2. **Token Validation**: Verificar que el token sea válido antes de crear juego
3. **Balance Check**: Verificar que el contrato tenga el balance antes de transferir
4. **Winner != address(0)**: Solo transferir si hay ganador válido

## Plan de Implementación

### Fase 1: Modificar Contrato ✅
- [ ] Agregar campos prizeToken y prizeAmount a struct Game
- [ ] Modificar createGame() para recibir y transferir tokens
- [ ] Modificar closeGame() para transferir premio al ganador
- [ ] Agregar eventos PrizeClaimed
- [ ] Agregar interface IERC20

### Fase 2: Testing Local
- [ ] Deploy en Hardhat local
- [ ] Crear juego con mock USDC
- [ ] Probar transferencia de premio
- [ ] Verificar eventos emitidos

### Fase 3: Deploy en Testnet
- [ ] Deploy en Base Sepolia
- [ ] Verify contract en BaseScan
- [ ] Actualizar .env con nueva dirección
- [ ] Actualizar ABI en frontend

### Fase 4: Actualizar Frontend
- [ ] Actualizar useCreateGame() para manejar tokens
- [ ] Agregar aprobación de tokens en admin panel
- [ ] Mostrar información de premio real en UI
- [ ] Agregar indicador de "Prize Sent" cuando termina

### Fase 5: Testing End-to-End
- [ ] Crear juego con USDC en testnet
- [ ] Jugar y verificar funcionalidad
- [ ] Cerrar juego y verificar transferencia de premio
- [ ] Validar en BaseScan que se transfirió correctamente

## Migracion de Juegos Existentes

**Importante**: Al re-deployar, los juegos actuales se perderán.

**Opciones**:
1. Cerrar todos los juegos activos antes de re-deploy
2. Migrar datos (complejo, no recomendado)
3. Mantener contrato viejo para historial, usar nuevo para juegos futuros

## Costos Estimados

- **Deploy nuevo contrato**: ~$2-5 USD en Base Sepolia (gratis con faucet)
- **Crear juego con premio**: ~$0.50 USD (approval + createGame)
- **Cerrar juego**: ~$0.30 USD (closeGame + transfer)

## ¿Preguntas?

1. ¿Qué token quieres usar? (USDC recomendado)
2. ¿Cuándo quieres hacer el deploy?
3. ¿Necesitas que agregue funcionalidad para multiples tokens?
