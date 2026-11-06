"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, ExternalLink } from "lucide-react";
import { BOT_CHAIN_CONFIG } from "@/config/chain";
import deploymentInfo from "@/contracts/deployment.json";

export default function WhitepaperPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Whale Dashboard</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              BOT WhaleTrace Technical Whitepaper
            </h1>
            <p className="text-xs text-slate-400">
              Protocol Architecture, Parameterized Threshold Formulation & On-Chain Registry
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-mono">
          <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded">
            Version 1.0
          </span>
          <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded">
            BOT Chain Testnet (968)
          </span>
          <a
            href={`${BOT_CHAIN_CONFIG.explorerUrl}/address/${deploymentInfo.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-400 rounded flex items-center space-x-1"
          >
            <span>Contract: {deploymentInfo.address.slice(0, 8)}...</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Whitepaper Content Sections */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 space-y-8 text-slate-300 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
            1. Abstract
          </h2>
          <p>
            In decentralized blockchain ecosystems, significant capital transfers by institutional holders, market makers, and large private wallets exert disproportionate influence over token velocity and liquidity depth. Traditional block explorers often provide fragmented raw event logs or attach ungrounded, arbitrary labels to addresses without explaining the underlying volume threshold, token decimals, or analytical boundaries.
          </p>
          <p>
            <strong>BOT WhaleTrace</strong> introduces an open, transparent, and verifiable large-transfer analysis system engineered specifically for BOT Chain. The protocol combines high-speed multi-range RPC scanning, decimal-normalized threshold filtering for both native BOT transfers and ERC-20 tokens, and a formal smart contract registry (<code className="text-white">BOTWhaleTrace.sol</code>) for on-chain analysis requests and cryptographic report anchoring.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
            2. Parameterized Threshold Formulation
          </h2>
          <p>
            Conventional blockchain analytics platforms frequently flag addresses as &quot;whales&quot; using opaque, non-standardized criteria. This leads to false alarms when analyzing high-supply or low-decimal tokens.
          </p>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-white">
            Transfer qualifies as Whale &hArr; V_raw &ge; M &times; 10^Decimals
          </div>
          <p className="text-xs text-slate-400">
            Where <code>V_raw</code> is the raw transfer value from execution logs, <code>M</code> is the human-configured minimum threshold (e.g. 10,000 BOT), and <code>Decimals</code> is fetched dynamically from the token contract (or 18 for native BOT).
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
            3. Smart Contract Specification: BOTWhaleTrace.sol
          </h2>
          <p>
            The on-chain smart contract is deployed on BOT Chain Testnet at:
          </p>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-blue-400 select-all">
            {deploymentInfo.address}
          </div>
          <p className="text-xs">
            Core functions include:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs font-mono text-slate-300">
            <li><code>requestWhaleAnalysis(token, minimumAmount, fromBlock, toBlock)</code></li>
            <li><code>publishResult(requestId, reportHash)</code></li>
            <li><code>getRequest(requestId)</code></li>
            <li><code>getTotalRequests()</code></li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
            4. Utilitarian Flat Design Philosophy
          </h2>
          <p>
            In alignment with professional financial terminals, BOT WhaleTrace deliberately avoids decorative visual artifacts such as color gradients, translucent glassmorphism, or glossy textures. Solid, high-contrast dark tones ensure readability and zero cognitive fatigue during critical on-chain surveillance operations.
          </p>
        </section>
      </div>
    </div>
  );
}
