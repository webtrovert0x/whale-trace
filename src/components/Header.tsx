"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { ExternalLink, Wallet, CheckCircle2, FileText } from "lucide-react";
import { BOT_CHAIN_CONFIG } from "@/config/chain";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = () => {
    try {
      open();
    } catch {
      if (connectors && connectors.length > 0) {
        connect({ connector: connectors[0] });
      }
    }
  };

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand with Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded overflow-hidden flex-shrink-0 flex items-center justify-center bg-blue-600">
            {/* SVG Logo Icon */}
            <svg viewBox="0 0 100 100" className="w-7 h-7" fill="none">
              <path d="M 22 55 A 28 28 0 0 1 78 55" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="4 4" opacity="0.45"/>
              <path d="M 14 55 A 36 36 0 0 1 86 55" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.25"/>
              <path d="M 24 54 C 24 44, 34 38, 50 38 C 66 38, 76 45, 82 52 C 84 54, 84 57, 80 58 C 72 60, 62 61, 50 61 C 36 61, 26 59, 24 54 Z" fill="#ffffff"/>
              <path d="M 24 54 C 20 53, 16 48, 14 44 C 15 50, 15 54, 12 58 C 16 57, 21 56, 24 54 Z" fill="#ffffff"/>
              <path d="M 48 59 C 45 64, 40 68, 36 68 C 38 64, 42 61, 48 59 Z" fill="#ffffff"/>
              <circle cx="70" cy="48" r="2.5" fill="#2563eb"/>
              <circle cx="70" cy="30" r="3" fill="#ffffff"/>
              <line x1="70" y1="35" x2="70" y2="44" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.75"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white text-base tracking-tight group-hover:text-blue-400 transition-colors">
                BOT WhaleTrace
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700 rounded">
                Testnet
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              BOT Chain Large-Transfer Analysis Tool
            </p>
          </div>
        </Link>

        {/* Navigation & Controls */}
        <div className="flex items-center space-x-3">
          {/* Whitepaper Link */}
          <Link
            href="/whitepaper"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Whitepaper</span>
          </Link>

          {/* Chain Status Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">BOT Chain (968)</span>
          </div>

          {/* Explorer Link */}
          <a
            href={BOT_CHAIN_CONFIG.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
          >
            <span>Explorer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Wallet Button */}
          {mounted && isConnected && address ? (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => disconnect()}
                className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-200 transition-colors"
                title="Click to disconnect"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              className="flex items-center space-x-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
