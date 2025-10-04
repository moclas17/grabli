const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

/**
 * MiniApp configuration object. Must follow the mini app manifest specification.
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjMxNzkwOCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDBiQUEyMjMxNzc1ODM4QkE2N0QyOWY5NUYzY2IzZEI4QkMzMDQxRjcifQ",
    payload: "eyJkb21haW4iOiJncmFibGkudmVyY2VsLmFwcCJ9",
    signature: "MHg5MjhkNjk5OTIyNjgwOTc1NWY5ODYxMzlhNTdhNmNjYzZlNGNhNDY0YmU2NjdhMjdiYmU4ZTExMGI5ODc4YWQ3NTNhNDA0ZjJjMDhjOTkzZjJhNGNmMGQwOWEwNzUyNTBiMDUxZWVjZTc0YzcyZGI1NWY5ZWZjNTI5MWI0M2UyZDFi",
  },
  baseBuilder: {
    allowedAddresses: [],
  },
  miniapp: {
    version: "1",
    name: "grabli",
    subtitle: "",
    description: "",
    screenshotUrls: [],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "utility",
    tags: ["example"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;
