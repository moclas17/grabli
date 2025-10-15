"use client";
import { useActiveGames } from "../../lib/hooks/useGrabliContract";
import { GRABLI_ABI } from "../../lib/contracts/grabli";

export default function DebugPage() {
  const { activeGames, activeGameId, hasActiveGame, isLoading, isError } = useActiveGames();

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
          Has getActiveGames: {Array.isArray(GRABLI_ABI) && GRABLI_ABI.some((item: any) => item.name === 'getActiveGames') ? 'Yes ✅' : 'No ❌'}
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
    </div>
  );
}
