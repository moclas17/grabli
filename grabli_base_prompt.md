# Grabli Mini-App (Base) — Prompt for Implementation

I want you to generate a **complete MVP** of a mini-app for **Base** called **Grabli**, where a prize (e.g., “$1 USD” or “Coupon”) can be **claimed** by users during a fixed time window. **The winner is the one who accumulates the most seconds in possession** of the prize within the total game time. The app must include sponsor/advertiser integration.

---

## Game Objective

- There is an **active game** with:
  - `prize`: title, value, currency, description, and **sponsor** (name, url, logo).
  - `startAt`, `endAt`: total duration (e.g., 24h).
  - `holder`: current `address` and `sinceTs`.
  - `totals`: `{ [address: string]: totalSeconds }` with accumulated time.
- Main action: **Claim**. When pressed:
  1) The user signs/transmits an action in the Base mini-app.
  2) The previous holder's segment is closed and seconds are added.
  3) The new `holder` becomes the user, with `sinceTs = now`.
- At `endAt`:
  - **Closure** happens: add the last holder’s segment.
  - Winner: the address with the most `totalSeconds`.  
  - Stored in a smart contract on Base.

---

## Tech Stack

- **Base Mini Apps SDK** + Next.js (App Router)
- **TypeScript**
- **Solidity contracts** on Base for:
  - Storing game state (`prize`, `startAt`, `endAt`, `totals`, `holder`).
  - Emitting events on each **Claim**.
  - Resolving and storing the winner at the end.
- **Frontend Mini App**:
  - Simple UI with Base Mini App SDK (buttons: Claim, Scores, Sponsor).
  - Branding/images with sponsor info.
- **Optional Backend**: Redis/Postgres only for caching and analytics (main state is on Base chain).

---

## Environment Variables

```bash
BASE_RPC_URL=...
PRIVATE_KEY=...         # For contract/admin
NEXT_PUBLIC_BASE_URL=...
SPONSOR_DEFAULT_NAME="Acme"
SPONSOR_DEFAULT_URL="https://acme.example"
SPONSOR_DEFAULT_LOGO="https://grabli.app/acme.png"
```

---

## Solidity Contract (summary)

```solidity
pragma solidity ^0.8.20;

contract Grabli {
    struct Game {
        uint256 startAt;
        uint256 endAt;
        address holder;
        uint256 sinceTs;
        mapping(address => uint256) totals;
        bool finished;
        address winner;
    }

    mapping(uint256 => Game) public games;
    uint256 public gameCount;

    event Claimed(uint256 indexed gameId, address indexed player, uint256 ts);
    event Finished(uint256 indexed gameId, address winner, uint256 totalSeconds);

    function newGame(uint256 duration) external returns (uint256 gameId) { ... }
    function claim(uint256 gameId) external { ... }
    function close(uint256 gameId) external { ... }
}
```

- `claim()` updates `totals` and changes `holder`.
- `close()` adds the last segment and sets the winner.
- `events` are used to display scores in the frontend.

---

## Frontend Mini-App

- **Main Screen**:
  - Prize, sponsor, and remaining time.
  - Buttons:
    - **Claim** → calls `claim()` on Base.
    - **Scores** → shows leaderboard (from events or onchain read).
    - **Sponsor** → external link.
- **Leaderboard**:
  - Top players with address/ENS and accumulated seconds.
- **Advertising**:
  - Sponsor logo + link in the UI.
  - Option for multiple sponsors rotating.

---

## Rules

1. **Claim**
   - Only if `now < endAt`.
   - Close previous segment (`delta = now - sinceTs`).
   - Update `totals[holder]`.
   - Pass holder to new player.

2. **Closure**
   - At `endAt`, anyone can call `close()`.
   - Winner is calculated in the contract.
   - `Finished(gameId, winner, totalSeconds)` event emitted.

3. **Anti-abuse**
   - Optional cooldown between claims.
   - Everything recorded onchain → no external locks needed.

---

## Deployment

1. **Contract** on Base Sepolia → then Base Mainnet.
2. **Frontend Mini-App** in Next.js + Base SDK.
3. Configure **App manifest** for [Base Mini Apps](https://www.base.org/build/mini-apps).
4. Publish the mini-app link in communities.

---

## Acceptance Criteria

- [ ] I can create a game (`newGame`) with duration X.
- [ ] Any user can `claim()` the prize.
- [ ] Seconds accumulate correctly in `totals`.
- [ ] At the end, `close()` sets a winner and emits event.
- [ ] The mini-app shows: prize, remaining time, your score, and top 5.
- [ ] Sponsor is visible with logo and link.
- [ ] Flow tested on Base Sepolia and ready for Base Mainnet.

---

## Optional Extras

- NFT badge for winner and top 10.
- Multiple simultaneous games (`gameId` param).
- Integration with Farcaster Frames for visibility.
- Onchain sponsors (contract receives stablecoins as prizes).

---

## Deliverables

- Repo ready for Vercel (**1-click deploy**).
- `README.md` with setup, .env and curl examples to test `claim`/`score`.
- **.env.example** complete.
- Basic unit tests.
