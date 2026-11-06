"use client";

import React, { useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { BOT_WHALE_TRACE_ABI } from "@/contracts/contractInterface";
import { WhaleAnalysisResult } from "@/types";
import { keccak256, toHex, stringToBytes } from "viem";
import { Database, Send, CheckCircle, ExternalLink, RefreshCw } from "lucide-react";
import { BOT_CHAIN_CONFIG } from "@/config/chain";

interface SmartContractPanelProps {
  currentAnalysis: WhaleAnalysisResult | null;
  contractAddress: string;
}

export function SmartContractPanel({
  currentAnalysis,
  contractAddress: propContractAddress,
}: SmartContractPanelProps) {
  const { isConnected, address } = useAccount();
  const [contractAddress, setContractAddress] = useState(
    propContractAddress || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ""
  );
  const [requestIdInput, setRequestIdInput] = useState("");
  const [lastGeneratedRequestId, setLastGeneratedRequestId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const { writeContractAsync, isPending } = useWriteContract();

  // Read request state
  const { data: requestData, refetch: refetchRequest, isLoading: isReading } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: BOT_WHALE_TRACE_ABI,
    functionName: "getRequest",
    args: requestIdInput.startsWith("0x") && requestIdInput.length === 66 ? [requestIdInput as `0x${string}`] : undefined,
    query: {
      enabled: Boolean(contractAddress && requestIdInput.startsWith("0x") && requestIdInput.length === 66),
    },
  });

  const handleRequestAnalysis = async () => {
    if (!currentAnalysis) {
      alert("Please perform an analysis first");
      return;
    }
    if (!contractAddress || !contractAddress.startsWith("0x")) {
      alert("Please provide the deployed BOTWhaleTrace contract address");
      return;
    }

    try {
      setStatusMessage("Submitting requestWhaleAnalysis to BOT Chain Testnet...");
      
      const tokenAddr = currentAnalysis.isNative
        ? BOT_CHAIN_CONFIG.NATIVE_TOKEN_ADDRESS
        : currentAnalysis.tokenAddress;

      const tx = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: BOT_WHALE_TRACE_ABI,
        functionName: "requestWhaleAnalysis",
        args: [
          tokenAddr as `0x${string}`,
          BigInt(currentAnalysis.minimumAmountRaw),
          BigInt(currentAnalysis.fromBlock),
          BigInt(currentAnalysis.toBlock),
        ],
      });

      setStatusMessage(`Transaction submitted: ${tx}. Check explorer.`);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error: ${err?.shortMessage || err?.message || "Transaction failed"}`);
    }
  };

  const handlePublishResult = async () => {
    if (!currentAnalysis) {
      alert("Please perform an analysis first");
      return;
    }
    if (!requestIdInput || !requestIdInput.startsWith("0x") || requestIdInput.length !== 66) {
      alert("Please enter a valid 32-byte Request ID (0x...) to publish results for");
      return;
    }
    if (!contractAddress || !contractAddress.startsWith("0x")) {
      alert("Please provide the deployed BOTWhaleTrace contract address");
      return;
    }

    try {
      setStatusMessage("Computing cryptographic report hash and publishing...");
      
      // Calculate keccak256 hash of the analysis result
      const reportContent = JSON.stringify({
        token: currentAnalysis.tokenSymbol,
        min: currentAnalysis.minimumAmount,
        found: currentAnalysis.largeTransfersFound,
        largest: currentAnalysis.largestTransfer?.valueString,
        topSender: currentAnalysis.topSender?.address,
        topRecipient: currentAnalysis.topRecipient?.address,
        blocks: [currentAnalysis.fromBlock, currentAnalysis.toBlock],
      });

      const reportHash = keccak256(toHex(stringToBytes(reportContent)));

      const tx = await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: BOT_WHALE_TRACE_ABI,
        functionName: "publishResult",
        args: [requestIdInput as `0x${string}`, reportHash],
      });

      setStatusMessage(`Report published! Tx: ${tx}`);
      refetchRequest();
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error: ${err?.shortMessage || err?.message || "Publish failed"}`);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-blue-500" />
          <div>
            <h3 className="text-sm font-semibold text-white">
              Smart Contract Registry (BOTWhaleTrace.sol)
            </h3>
            <p className="text-xs text-slate-400">
              Manage on-chain whale analysis requests and publish verified report hashes
            </p>
          </div>
        </div>
        <div className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
          BOT Chain Testnet (968)
        </div>
      </div>

      {/* Contract Address Input */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Contract Address
        </label>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="0x... (Deployed BOTWhaleTrace address)"
          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          Deploy the contract with <code className="text-slate-300">npm run deploy</code> using your private key in <code className="text-slate-300">.env</code>.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* requestWhaleAnalysis */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded">
          <div className="font-semibold text-xs text-white mb-1">
            1. requestWhaleAnalysis(...)
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Register current inspection parameters (token, threshold, blocks) on-chain.
          </p>
          <button
            type="button"
            onClick={handleRequestAnalysis}
            disabled={!isConnected || isPending || !currentAnalysis}
            className={`w-full py-2 px-3 rounded text-xs font-medium text-white transition-colors flex items-center justify-center space-x-1.5 ${
              !isConnected || !currentAnalysis
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Request On-Chain</span>
          </button>
        </div>

        {/* publishResult */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded">
          <div className="font-semibold text-xs text-white mb-1">
            2. publishResult(...)
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Anchor analysis hash (<code className="text-slate-300">bytes32 reportHash</code>) for a request.
          </p>
          <button
            type="button"
            onClick={handlePublishResult}
            disabled={!isConnected || isPending || !requestIdInput}
            className={`w-full py-2 px-3 rounded text-xs font-medium text-white transition-colors flex items-center justify-center space-x-1.5 ${
              !isConnected || !requestIdInput
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Publish Report Hash</span>
          </button>
        </div>
      </div>

      {/* Query Request (getRequest) */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded">
        <label className="block text-xs font-semibold text-white mb-1">
          3. Query Request on Chain (getRequest)
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={requestIdInput}
            onChange={(e) => setRequestIdInput(e.target.value.trim())}
            placeholder="Enter Request ID (bytes32: 0x...)"
            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => refetchRequest()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-white transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Inspect</span>
          </button>
        </div>

        {/* Request Inspection Details */}
        {requestData && (
          <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded text-xs font-mono space-y-1 text-slate-300">
            <div>
              Requester: <span className="text-white">{String((requestData as any).requester)}</span>
            </div>
            <div>
              Token: <span className="text-white">{String((requestData as any).token)}</span>
            </div>
            <div>
              Min Amount (Raw):{" "}
              <span className="text-white">{String((requestData as any).minimumAmount)}</span>
            </div>
            <div>
              Block Range:{" "}
              <span className="text-white">
                #{String((requestData as any).fromBlock)} - #{String((requestData as any).toBlock)}
              </span>
            </div>
            <div>
              Status:{" "}
              {(requestData as any).isResolved ? (
                <span className="text-emerald-400 font-bold">Resolved / Published</span>
              ) : (
                <span className="text-yellow-400">Pending Resolution</span>
              )}
            </div>
            {(requestData as any).reportHash && (
              <div className="truncate">
                Report Hash:{" "}
                <span className="text-blue-400">{String((requestData as any).reportHash)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {statusMessage && (
        <div className="p-2.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200">
          {statusMessage}
        </div>
      )}
    </div>
  );
}

