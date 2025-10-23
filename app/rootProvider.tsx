"use client";
import { ReactNode } from "react";
import { base } from "wagmi/chains";
import { http } from "wagmi";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/styles.css";

// Use Coinbase Paymaster RPC for gasless transactions
const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_RPC_URL ||
  "https://api.developer.coinbase.com/rpc/v1/base/GjqgMTKz5XsNCWXPkWytAxsGbD6ANAh4";

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
          preference: "smartWalletOnly", // Enable Coinbase Smart Wallet with Paymaster (gasless transactions)
        },
      }}
      rpcUrl={paymasterUrl} // Use Coinbase Paymaster RPC
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
