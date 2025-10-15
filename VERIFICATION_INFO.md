# Información para Verificación Manual del Contrato

## Contrato Desplegado

**Red**: Base Sepolia (Testnet)
**Dirección del Contrato**: `0x0F845905674451bCA3e1D165241de3076F2E5864`
**URL BaseScan**: https://sepolia.basescan.org/address/0x0F845905674451bCA3e1D165241de3076F2E5864

## Configuración del Compilador

- **Compiler Type**: Solidity (Single file)
- **Compiler Version**: v0.8.20+commit.a1b79de6
- **Open Source License Type**: MIT License (3)

## Optimización

- **Optimization**: Yes
- **Runs**: 200
- **EVM Version**: shanghai
- **Via IR**: Yes

## Argumentos del Constructor

```
(vacío - no hay argumentos del constructor)
```

## Código Fuente

El código fuente está en: `contracts/Grabli.sol`

## Verificación Manual

Para verificar manualmente en BaseScan:

1. Ve a: https://sepolia.basescan.org/address/0x0F845905674451bCA3e1D165241de3076F2E5864#code

2. Click en "Verify and Publish"

3. Completa el formulario con la información de arriba

4. Copia y pega el contenido completo de `contracts/Grabli.sol` en el campo "Enter the Solidity Contract Code"

5. Click en "Verify and Publish"

## Contrato con Auto-Close Verificado

**Dirección Nueva**: `0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E`
**URL BaseScan**: https://sepolia.basescan.org/address/0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E

### Pruebas Realizadas

✅ **TEST 1**: getActiveGames() function works
✅ **TEST 2**: First game created successfully
✅ **TEST 3**: Second game created successfully
✅ **TEST 4**: GameFinished event emitted when creating new game
✅ **TEST 5**: Only one game active after creating second game

### Resultado

🎯 **Auto-close functionality VERIFIED ✅**

El contrato nuevo (`0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E`) funciona correctamente:
- Cuando se crea un juego nuevo, todos los juegos activos se cierran automáticamente
- Se emite el evento GameFinished para cada juego cerrado
- Solo un juego permanece activo (el nuevo)

### Transacciones de Prueba

- **Primer Juego Creado**: https://sepolia.basescan.org/tx/0x435907acab032ac790401cdb85ed8a133e7285aead60a3ad7185e8e8113c2ba7
- **Segundo Juego (Auto-Close)**: https://sepolia.basescan.org/tx/0x6e00e812095486f62c771bbc4daddc69fbf0727927c4e1d7913db13dc76acae1

En la segunda transacción puedes ver:
1. Evento `GameFinished` (Juego 0 cerrado automáticamente)
2. Evento `GameCreated` (Juego 1 creado)

## Actualizar .env

Después de la verificación exitosa, actualiza tu `.env`:

```bash
NEXT_PUBLIC_GRABLI_CONTRACT_ADDRESS_SEPOLIA=0x64c3A20C0FBcF8B0a9D17eC0D10c40281371FE8E
NEXT_PUBLIC_CURRENT_GAME_ID=1
```

## Resumen

✅ Contrato desplegado correctamente
✅ Funcionalidad de auto-close verificada en testnet
✅ Eventos emitidos correctamente
✅ Solo un juego activo a la vez (comportamiento esperado)
⏳ Verificación en BaseScan pendiente (manual o resolver issue con plugin)

**El contrato está listo para uso en testnet** y la funcionalidad de auto-close funciona perfectamente según lo especificado.
