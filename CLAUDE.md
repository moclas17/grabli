# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Farcaster MiniApp built with Next.js 15, OnchainKit, and MiniKit SDK. It's a web3 application that runs inside Farcaster (a decentralized social network) and provides blockchain interactions on Base chain through Coinbase's OnchainKit components.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm lint
```

## Environment Variables

Required environment variables (set in `.env`):
- `NEXT_PUBLIC_PROJECT_NAME` - Project name
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` - OnchainKit API key from Coinbase
- `NEXT_PUBLIC_URL` - Public URL for the app (used in production/Vercel deployments)

## Architecture Overview

### MiniApp Configuration
The app uses a centralized configuration in [minikit.config.ts](minikit.config.ts) that defines:
- MiniApp manifest (name, icons, URLs, categories)
- Account association settings
- Base builder configurations
- The manifest is served via the Farcaster protocol at `/.well-known/farcaster.json`

### Provider Structure
- **RootProvider** ([app/rootProvider.tsx](app/rootProvider.tsx)): Wraps the entire app with `OnchainKitProvider`, configured for:
  - Base chain
  - MiniKit enabled with auto-connect
  - Wallet modal display with "all" wallet preference
  - Auto appearance mode

### Authentication Flow
- Uses Farcaster QuickAuth for verifying user identity
- Auth endpoint at [app/api/auth/route.ts](app/api/auth/route.ts) verifies JWT tokens
- Token verification extracts user's Farcaster ID (FID) from `payload.sub`
- URL host detection handles Vercel deployments with fallbacks to environment variables

### Layout & Metadata
- [app/layout.tsx](app/layout.tsx) generates metadata dynamically from minikit config
- Includes `fc:miniapp` meta tag with launch button configuration
- Uses SafeArea component from OnchainKit for proper mobile display
- Custom fonts: Inter and Source Code Pro

### Webpack Configuration
Next.js config ([next.config.ts](next.config.ts)) externalizes specific dependencies to avoid bundling issues:
- `pino-pretty`
- `lokijs`
- `encoding`

## Key Integration Points

### MiniKit Initialization
Main page ([app/page.tsx](app/page.tsx)) handles MiniKit readiness:
```typescript
const { setMiniAppReady, isMiniAppReady } = useMiniKit();
useEffect(() => {
  if (!isMiniAppReady) {
    setMiniAppReady();
  }
}, [setMiniAppReady, isMiniAppReady]);
```

### Available OnchainKit Components
The app is configured to use these OnchainKit components:
- Transaction
- Swap
- Checkout
- Wallet (already integrated in header)
- Identity

## Important Notes

- All client components must be marked with `"use client"` directive
- MiniKit context provides user data via `useMiniKit().context?.user`
- QuickAuth hook (`useQuickAuth`) can be used for identity verification when needed
- The app targets Base chain by default (configured in RootProvider)
