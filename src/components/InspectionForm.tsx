"use client";

import React, { useState, useEffect } from "react";
import { Search, RefreshCw, AlertCircle, Coins, Hash, Filter } from "lucide-react";
import { getLatestBlockNumber } from "@/lib/rpc";
import { BOT_CHAIN_CONFIG } from "@/config/chain";

export interface InspectionFormValues {
  tokenAddress: string;
  isNative: boolean;
  minimumAmount: number;
  fromBlock: number;
  toBlock: number;
  filterWallet: string;
}

interface InspectionFormProps {
  onAnalyze: (values: InspectionFormValues) => void;
  isLoading: boolean;
  progressStatus?: string;
}

export function InspectionForm({
  onAnalyze,
  isLoading,
  progressStatus,
}: InspectionFormProps) {
  const [isNative, setIsNative] = useState(true);
  const [tokenAddress, setTokenAddress] = useState("");
  const [minimumAmount, setMinimumAmount] = useState<number>(10000);
  const [fromBlock, setFromBlock] = useState<number>(0);
  const [toBlock, setToBlock] = useState<number>(0);
  const [filterWallet, setFilterWallet] = useState("");
  const [fetchingBlock, setFetchingBlock] = useState(false);
  const [currentHeadBlock, setCurrentHeadBlock] = useState<number | null>(null);

  // Sync with current latest block on BOT Chain Testnet
  const syncLatestBlocks = async () => {
    try {
      setFetchingBlock(true);
      const head = await getLatestBlockNumber();
      setCurrentHeadBlock(head);
      setToBlock(head);
      // Default to scanning recent 200 blocks
      const start = Math.max(0, head - 200);
      setFromBlock(start);
    } catch (err) {
      console.warn("Could not fetch latest block:", err);
      // Fallback sensible defaults
      setCurrentHeadBlock(150000);
      setToBlock(150000);
      setFromBlock(149800);
    } finally {
      setFetchingBlock(false);
    }
  };

  useEffect(() => {
    syncLatestBlocks();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (toBlock < fromBlock) {
      alert("Ending block must be greater than or equal to Starting block");
      return;
    }
    if (minimumAmount <= 0) {
      alert("Minimum transfer amount must be greater than 0");
      return;
    }

    onAnalyze({
      tokenAddress: isNative ? BOT_CHAIN_CONFIG.NATIVE_TOKEN_ADDRESS : tokenAddress.trim(),
      isNative,
      minimumAmount: Number(minimumAmount),
      fromBlock: Number(fromBlock),
      toBlock: Number(toBlock),
      filterWallet: filterWallet.trim(),
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center space-x-2">
            <Search className="w-4 h-4 text-blue-500" />
            <span>Inspection Form</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure parameters to detect large movements on BOT Chain Testnet
          </p>
        </div>

        {/* Head Block Status */}
        <div className="flex items-center space-x-2">
          <div className="text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
            Head Block:{" "}
            <span className="font-mono text-white font-semibold">
              {currentHeadBlock !== null ? `#${currentHeadBlock.toLocaleString()}` : "Syncing..."}
            </span>
          </div>
          <button
            type="button"
            onClick={syncLatestBlocks}
            disabled={fetchingBlock}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
            title="Refresh current block"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetchingBlock ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Token Selection */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Token Asset
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
            <button
              type="button"
              onClick={() => {
                setIsNative(true);
                setTokenAddress("");
              }}
              className={`px-3 py-2 text-xs font-medium rounded border text-left transition-colors flex items-center justify-between ${
                isNative
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              <span className="flex items-center space-x-2">
                <Coins className="w-3.5 h-3.5" />
                <span>Native BOT</span>
              </span>
              <span className="text-[10px] opacity-80">Chain Token</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNative(false)}
              className={`sm:col-span-3 px-3 py-2 text-xs font-medium rounded border text-left transition-colors flex items-center justify-between ${
                !isNative
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              <span>Custom ERC-20 Token</span>
              <span className="text-[10px] opacity-80">Enter Contract Address</span>
            </button>
          </div>

          {!isNative && (
            <div>
              <input
                type="text"
                placeholder="0x... (ERC-20 token address)"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                required={!isNative}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Will auto-query the contract’s <code className="text-slate-300">decimals()</code> and{" "}
                <code className="text-slate-300">symbol()</code> on BOT Chain Testnet.
              </p>
            </div>
          )}
        </div>

        {/* Minimum Transfer Amount */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Minimum Transfer Amount</span>
            <span className="text-[11px] text-slate-400">
              Only movements ≥ this value qualify as whale transfers
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              min="0.000001"
              value={minimumAmount}
              onChange={(e) => setMinimumAmount(parseFloat(e.target.value) || 0)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              placeholder="e.g. 10000"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs font-medium text-slate-400">
              {isNative ? "BOT" : "TOKEN"}
            </div>
          </div>
          <div className="flex space-x-2 mt-1.5">
            {[1000, 5000, 10000, 50000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setMinimumAmount(preset)}
                className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300"
              >
                {preset.toLocaleString()} {isNative ? "BOT" : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Block Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span>Starting Block</span>
            </label>
            <input
              type="number"
              min="0"
              value={fromBlock}
              onChange={(e) => setFromBlock(parseInt(e.target.value) || 0)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span>Ending Block</span>
            </label>
            <input
              type="number"
              min="0"
              value={toBlock}
              onChange={(e) => setToBlock(parseInt(e.target.value) || 0)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Optional Wallet Address */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Optional Wallet Address Filter</span>
          </label>
          <input
            type="text"
            placeholder="0x... (Leave empty to analyze all network wallets)"
            value={filterWallet}
            onChange={(e) => setFilterWallet(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            If provided, only transfers where this address is sender or recipient will be analyzed.
          </p>
        </div>

        {/* Progress or Status */}
        {isLoading && progressStatus && (
          <div className="p-3 bg-slate-800 border border-slate-700 rounded flex items-center space-x-3 text-xs text-slate-200">
            <RefreshCw className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
            <span>{progressStatus}</span>
          </div>
        )}

        {/* Action Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 px-4 rounded text-xs font-semibold text-white transition-colors flex items-center justify-center space-x-2 ${
              isLoading
                ? "bg-slate-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning BOT Chain Testnet...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analyze Whales</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

