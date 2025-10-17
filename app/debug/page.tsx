"use client";
import { useActiveGames, useGameState, useGameDetails } from "../../lib/hooks/useGrabliContract";
import { GRABLI_ABI } from "../../lib/contracts/grabli";

export default function DebugPage() {
  const { activeGames, activeGameId, hasActiveGame, isLoading, isError } = useActiveGames();
  const { gameState, isLoading: stateLoading } = useGameState(activeGameId || BigInt(0));
  const { gameDetails, isLoading: detailsLoading } = useGameDetails(activeGameId || BigInt(0));

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Debug Page</h1>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#111', borderRadius: '8px' }}>
        <h2>ABI Check</h2>
        <pre style={{ overflow: 'auto', fontSize: '12px' }}>
          ABI Type: {Array.isArray(GRABLI_ABI) ? 'Array ✅' : `Object ❌ (${typeof GRABLI_ABI})`}
          {'\n'}
          ABI Length: {Array.isArray(GRABLI_ABI) ? GRABLI_ABI.length : 'N/A'}
          {'\n'}
          Has getActiveGames: {Array.isArray(GRABLI_ABI) && GRABLI_ABI.some((item) => 'name' in item && item.name === 'getActiveGames') ? 'Yes ✅' : 'No ❌'}
        </pre>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#111', borderRadius: '8px' }}>
        <h2>useActiveGames() Hook</h2>
        <pre style={{ overflow: 'auto', fontSize: '12px' }}>
          {JSON.stringify({
            isLoading,
            isError,
            hasActiveGame,
            activeGameId: activeGameId?.toString(),
            activeGames: activeGames?.map(id => id.toString()),
          }, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: isError ? '#822' : '#181', borderRadius: '8px' }}>
        <h2>Status</h2>
        {isLoading && <p>⏳ Loading...</p>}
        {isError && <p>❌ Error calling getActiveGames()</p>}
        {!isLoading && !isError && hasActiveGame && (
          <p>✅ Active Game Detected: #{activeGameId?.toString()}</p>
        )}
        {!isLoading && !isError && !hasActiveGame && (
          <p>❌ No active game detected</p>
        )}
      </div>

      {/* Game State Section */}
      {hasActiveGame && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#111', borderRadius: '8px' }}>
          <h2>Game State (ID: {activeGameId?.toString()})</h2>
          {stateLoading ? (
            <p>⏳ Loading game state...</p>
          ) : gameState ? (
            <pre style={{ overflow: 'auto', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
              <strong>Prize Info:</strong>
              {'\n'}Prize Title: {gameState.prizeTitle || '(empty)'}
              {'\n'}Prize Value: {gameState.prizeValue.toString()} {gameState.prizeCurrency}
              {'\n'}
              {'\n'}<strong>ERC20 Prize:</strong>
              {'\n'}Prize Token: {gameState.prizeToken}
              {'\n'}Prize Amount: {gameState.prizeAmount.toString()}
              {'\n'}Has ERC20 Prize: {gameState.prizeToken !== '0x0000000000000000000000000000000000000000' ? '✅ YES' : '❌ NO'}
              {'\n'}
              {'\n'}<strong>Timing:</strong>
              {'\n'}Start At: {gameState.startAt.toString()} {gameState.startAt > 0 ? `(${new Date(Number(gameState.startAt) * 1000).toLocaleString()})` : '(NOT STARTED - Waiting for funding)'}
              {'\n'}End At: {gameState.endAt.toString()} {gameState.endAt > 0 ? `(${new Date(Number(gameState.endAt) * 1000).toLocaleString()})` : '(NOT STARTED)'}
              {'\n'}
              {'\n'}<strong>Game Status:</strong>
              {'\n'}Finished: {gameState.finished ? '✅ YES' : '❌ NO'}
              {'\n'}Current Holder: {gameState.holder}
              {'\n'}Current Holder Seconds: {gameState.currentHolderSeconds.toString()}
              {'\n'}Winner: {gameState.winner !== '0x0000000000000000000000000000000000000000' ? gameState.winner : '(none yet)'}
              {'\n'}
              {'\n'}<strong>Sponsor:</strong>
              {'\n'}{gameState.sponsorName}
            </pre>
          ) : (
            <p>❌ No game state available</p>
          )}
        </div>
      )}

      {/* Game Details Section */}
      {hasActiveGame && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#111', borderRadius: '8px' }}>
          <h2>Game Details (Full)</h2>
          {detailsLoading ? (
            <p>⏳ Loading game details...</p>
          ) : gameDetails ? (
            <pre style={{ overflow: 'auto', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
              <strong>Prize:</strong>
              {'\n'}Title: {gameDetails.prizeTitle || '(empty)'}
              {'\n'}Value: {gameDetails.prizeValue.toString()} {gameDetails.prizeCurrency}
              {'\n'}Description: {gameDetails.prizeDescription}
              {'\n'}
              {'\n'}<strong>ERC20 Prize Details:</strong>
              {'\n'}Token Address: {gameDetails.prizeToken}
              {'\n'}Token Amount: {gameDetails.prizeAmount.toString()}
              {'\n'}Sponsor Address: {gameDetails.sponsor}
              {'\n'}
              {'\n'}<strong>Sponsor Info:</strong>
              {'\n'}Name: {gameDetails.sponsorName}
              {'\n'}URL: {gameDetails.sponsorUrl}
              {'\n'}Logo: {gameDetails.sponsorLogo}
              {'\n'}
              {'\n'}<strong>Timing:</strong>
              {'\n'}Start: {gameDetails.startAt.toString()} {gameDetails.startAt > 0 ? `(${new Date(Number(gameDetails.startAt) * 1000).toLocaleString()})` : '⏳ PENDING FUNDING'}
              {'\n'}End: {gameDetails.endAt.toString()} {gameDetails.endAt > 0 ? `(${new Date(Number(gameDetails.endAt) * 1000).toLocaleString()})` : '⏳ PENDING FUNDING'}
              {'\n'}
              {'\n'}<strong>Status:</strong>
              {'\n'}Finished: {gameDetails.finished ? '✅ YES' : '❌ NO'}
            </pre>
          ) : (
            <p>❌ No game details available</p>
          )}
        </div>
      )}

      {/* Action Needed */}
      {hasActiveGame && gameState && gameState.startAt === BigInt(0) && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#d97706', borderRadius: '8px', color: '#000' }}>
          <h2 style={{ color: '#000', marginTop: 0 }}>⚠️ ACTION NEEDED</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            <strong>Game created but NOT started yet!</strong>
          </p>
          {gameState.prizeToken !== '0x0000000000000000000000000000000000000000' ? (
            <>
              <p>This game has an ERC20 prize and needs to be funded:</p>
              <ol style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>Approve the contract to spend {gameState.prizeAmount.toString()} tokens at {gameState.prizeToken}</li>
                <li>Call <code>fundGame({activeGameId?.toString()})</code> to deposit tokens and start the game</li>
              </ol>
              <p><strong>Token:</strong> {gameState.prizeToken}</p>
              <p><strong>Amount:</strong> {gameState.prizeAmount.toString()}</p>
            </>
          ) : (
            <>
              <p><strong>This game has NO ERC20 prize (prizeToken is address(0))</strong></p>
              <p>The contract needs to be updated to auto-start games without prizes, OR create a new game with an ERC20 prize.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
