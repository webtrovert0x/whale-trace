"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { BOT_WHALE_TRACE_ABI } from "@/contracts/contractInterface";
import { WhaleAnalysisResult } from "@/types";
import { keccak256, toHex, stringToBytes } from "viem";
import { Database, Send, CheckCircle2, ExternalLink, RefreshCw, Hash, FileCheck, Layers } from "lucide-react";
import { BOT_CHAIN_CONFIG } from "@/config/chain";
import deploymentInfo from "@/contracts/deployment.json";

interface OnChainIntegrationProps {
  currentAnalysis: WhaleAnalysisResult | null;
  onLoadRequestParams?: (params: {
    tokenAddress: string;
    isNative: boolean;
    minimumAmount: number;
    fromBlock: number;
    toBlock: number;
  }) => void;
}

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || deploymentInfo.address) as `0x${string}`;

export function OnChainIntegration({
  currentAnalysis,
  onLoadRequestParams,
}: OnChainIntegrationProps) {
  const { isConnected, address } = useAccount();
  const [activeRequestId, setActiveRequestId] = useState<string>("");
  const [inspectRequestId, setInspectRequestId] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [reportPublished, setReportPublished] = useState<boolean>(false);
  const [lastTxHash, setLastTxHash] = useState<string>("");

  const { writeContractAsync, data: txHash, isPending } = useWriteContract();

  // Read total registered requests on BOTWhaleTrace
  const { data: totalRequests, refetch: refetchTotal } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: BOT_WHALE_TRACE_ABI,
    functionName: "getTotalRequests",
  });

  // Query specific request
  const isValidRequestId = inspectRequestId.startsWith("0x") && inspectRequestId.length === 66;
  const { data: queryRequestData, refetch: refetchQuery, isLoading: isQuerying } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: BOT_WHALE_TRACE_ABI,
    functionName: "getRequest",
    args: isValidRequestId ? [inspectRequestId as `0x${string}`] : undefined,
    query: {
      enabled: Boolean(CONTRACT_ADDRESS && isValidRequestId),
    },
  });

  // Check active request status
  const isActiveRequestIdValid = activeRequestId.startsWith("0x") && activeRequestId.length === 66;
  const { data: activeRequestData, refetch: refetchActive } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: BOT_WHALE_TRACE_ABI,
    functionName: "getRequest",
    args: isActiveRequestIdValid ? [activeRequestId as `0x${string}`] : undefined,
    query: {
      enabled: Boolean(CONTRACT_ADDRESS && isActiveRequestIdValid),
    },
  });

  // Submit requestWhaleAnalysis on-chain
  const handleRequestOnChain = async () => {
    if (!currentAnalysis) {
      alert("Please run or select an analysis first");
      return;
    }
    if (!isConnected) {
      alert("Please connect your wallet first (e.g. MetaMask / AppKit on BOT Chain Testnet)");
      return;
    }

    try {
      setStatusMessage("Submitting requestWhaleAnalysis transaction to BOT Chain Testnet...");
      const tokenAddress = currentAnalysis.isNative
        ? BOT_CHAIN_CONFIG.NATIVE_TOKEN_ADDRESS
        : currentAnalysis.tokenAddress;

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: BOT_WHALE_TRACE_ABI,
        functionName: "requestWhaleAnalysis",
        args: [
          tokenAddress as `0x${string}`,
          BigInt(currentAnalysis.minimumAmountRaw),
          BigInt(currentAnalysis.fromBlock),
          BigInt(currentAnalysis.toBlock),
        ],
      });

      setLastTxHash(hash);
      setStatusMessage(`Transaction submitted: ${hash}. Awaiting confirmation...`);

      // Refetch total after transaction
      setTimeout(() => {
        refetchTotal();
      }, 4000);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error: ${err?.shortMessage || err?.message || "Failed to submit transaction"}`);
    }
  };

  // Publish report hash on-chain (publishResult)
  const handlePublishOnChain = async () => {
    if (!currentAnalysis) {
      alert("No analysis data available to publish");
      return;
    }
    const targetRequestId = activeRequestId || inspectRequestId;
    if (!targetRequestId || !targetRequestId.startsWith("0x") || targetRequestId.length !== 66) {
      alert("Please specify a valid 32-byte Request ID (0x...) to publish the report for");
      return;
    }
    if (!isConnected) {
      alert("Please connect your wallet to publish report hash");
      return;
    }

    try {
      setStatusMessage("Computing cryptographic report hash and invoking publishResult...");

      // Compute deterministic report hash of the findings
      const summaryPayload = JSON.stringify({
        token: currentAnalysis.tokenSymbol,
        min: currentAnalysis.minimumAmount,
        found: currentAnalysis.largeTransfersFound,
        largest: currentAnalysis.largestTransfer?.valueString,
        topSender: currentAnalysis.topSender?.address,
        topRecipient: currentAnalysis.topRecipient?.address,
        blocks: [currentAnalysis.fromBlock, currentAnalysis.toBlock],
      });

      const reportHash = keccak256(toHex(stringToBytes(summaryPayload)));

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: BOT_WHALE_TRACE_ABI,
        functionName: "publishResult",
        args: [targetRequestId as `0x${string}`, reportHash],
      });

      setLastTxHash(hash);
      setReportPublished(true);
      setStatusMessage(`Report published successfully! Tx: ${hash}`);

      setTimeout(() => {
        refetchActive();
        refetchQuery();
      }, 4000);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error: ${err?.shortMessage || err?.message || "Publishing failed"}`);
    }
  };

  const handleApplyQueriedRequest = () => {
    if (!queryRequestData) return;
    const req = queryRequestData as any;
    const tokenAddr = req.token as string;
    const isNat =
      !tokenAddr ||
      tokenAddr.toLowerCase() === BOT_CHAIN_CONFIG.NATIVE_TOKEN_ADDRESS.toLowerCase();

    // Determine readable minimum amount
    const rawMin = BigInt(req.minimumAmount);
    const readableMin = Number(rawMin / BigInt(10 ** 18)) || Number(rawMin);

    onLoadRequestParams?.({
      tokenAddress: isNat ? "" : tokenAddr,
      isNative: isNat,
      minimumAmount: readableMin,
      fromBlock: Number(req.fromBlock),
      toBlock: Number(req.toBlock),
    });

    setActiveRequestId(req.id);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-2.5">
          <Database className="w-4 h-4 text-blue-500" />
          <div>
            <h3 className="text-sm font-semibold text-white">
              Smart Contract Interaction & Registry
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live on-chain verification with deployed <code className="text-slate-300">BOTWhaleTrace.sol</code>
            </p>
          </div>
        </div>

        {/* Contract & Explorer Badge */}
        <div className="flex items-center space-x-2">
          <div className="text-xs bg-slate-950 border border-slate-800 px-2.5 py-1 rounded text-slate-300 font-mono">
            Total Requests: <span className="font-bold text-white">{totalRequests ? String(totalRequests) : "0"}</span>
          </div>
          <a
            href={`${BOT_CHAIN_CONFIG.explorerUrl}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Contract: {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Contract Functions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. requestWhaleAnalysis */}
        <div className="bg-slate-950 border border-slate-800 rounded p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <h4 className="text-xs font-semibold text-white font-mono">
                requestWhaleAnalysis(...)
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Records current inspection parameters (Token: {currentAnalysis?.tokenSymbol || "BOT"}, Threshold: {currentAnalysis?.minimumAmount.toLocaleString() || "10,000"}, Blocks #{currentAnalysis?.fromBlock || 0} - #{currentAnalysis?.toBlock || 0}) onto BOT Chain Testnet.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRequestOnChain}
            disabled={!isConnected || isPending || !currentAnalysis}
            className={`w-full py-2 px-3 rounded text-xs font-medium text-white transition-colors flex items-center justify-center space-x-2 ${
              !isConnected || !currentAnalysis
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isPending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Broadcasting to BOT Chain...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Request to Contract</span>
              </>
            )}
          </button>
        </div>

        {/* 2. publishResult */}
        <div className="bg-slate-950 border border-slate-800 rounded p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h4 className="text-xs font-semibold text-white font-mono">
                publishResult(...)
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Anchors a cryptographic hash (<code className="text-slate-300">bytes32 reportHash</code>) of the analyzed whale results for a request ID.
            </p>
            <input
              type="text"
              value={activeRequestId}
              onChange={(e) => setActiveRequestId(e.target.value.trim())}
              placeholder="Paste Request ID (0x...)"
              className="w-full mt-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={handlePublishOnChain}
            disabled={!isConnected || isPending || !activeRequestId}
            className={`w-full py-2 px-3 rounded text-xs font-medium text-white transition-colors flex items-center justify-center space-x-2 ${
              !isConnected || !activeRequestId
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Publish Report Hash On-Chain</span>
          </button>
        </div>
      </div>

      {/* 3. getRequest Lookup */}
      <div className="bg-slate-950 border border-slate-800 rounded p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <h4 className="text-xs font-semibold text-white">
              Inspect On-Chain Request State (getRequest)
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">Query contract state via view function</span>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={inspectRequestId}
            onChange={(e) => setInspectRequestId(e.target.value.trim())}
            placeholder="Enter 32-byte Request ID (0x...)"
            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => refetchQuery()}
            disabled={!isValidRequestId || isQuerying}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-white transition-colors flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isQuerying ? "animate-spin" : ""}`} />
            <span>Query</span>
          </button>
        </div>

        {/* Display Query Result */}
        {queryRequestData && (
          <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded font-mono text-xs space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Request ID:</span>
              <span className="text-white truncate max-w-xs">{String((queryRequestData as any).id)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Requester:</span>
              <span className="text-white">{String((queryRequestData as any).requester)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Token Address:</span>
              <span className="text-white">{String((queryRequestData as any).token)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Block Range:</span>
              <span className="text-white">
                #{String((queryRequestData as any).fromBlock)} - #{String((queryRequestData as any).toBlock)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status:</span>
              {(queryRequestData as any).isResolved ? (
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resolved & Published</span>
                </span>
              ) : (
                <span className="text-yellow-400 font-semibold">Pending Publication</span>
              )}
            </div>
            {(queryRequestData as any).reportHash && (queryRequestData as any).reportHash !== "0x0000000000000000000000000000000000000000000000000000000000000000" && (
              <div className="flex items-center justify-between truncate">
                <span className="text-slate-400">Report Hash:</span>
                <span className="text-blue-400 font-semibold truncate max-w-sm">
                  {String((queryRequestData as any).reportHash)}
                </span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleApplyQueriedRequest}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-200 transition-colors"
              >
                Apply Parameters to Inspection Form
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Output */}
      {statusMessage && (
        <div className="p-3 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 flex items-center justify-between">
          <span className="font-mono">{statusMessage}</span>
          {lastTxHash && (
            <a
              href={`${BOT_CHAIN_CONFIG.explorerUrl}/tx/${lastTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 ml-2 flex items-center space-x-1 underline flex-shrink-0"
            >
              <span>View Tx on BOTScan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

