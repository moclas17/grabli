"use client";
import { ReactNode } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/styles.css";

// Coinbase Paymaster & Bundler endpoint for gasless transactions
const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT;

// Debug: Log Paymaster configuration
console.log("🔧 Paymaster Configuration:");
console.log("  - Env Variable Set:", !!process.env.NEXT_PUBLIC_PAYMASTER_AND_BUNDLER_ENDPOINT);
console.log("  - Using Paymaster URL:", paymasterUrl);
console.log("  - OnchainKit API Key:", process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY ? "✅ Set" : "❌ Missing");

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: {
          mode: "auto",
        },
        wallet: {
          display: "modal",
          preference: "smartWalletOnly", // Enable Coinbase Smart Wallet for Paymaster support
        },
        paymaster: paymasterUrl, // Coinbase Paymaster & Bundler endpoint for gasless transactions
      }}
      miniKit={{
        enabled: true,
        autoConnect: true,
        notificationProxyUrl: undefined,
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}
