export const BOT_WHALE_TRACE_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "requestId", "type": "bytes32" },
      { "indexed": false, "internalType": "bytes32", "name": "reportHash", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "reporter", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "WhaleAnalysisPublished",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "requestId", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "requester", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "token", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "minimumAmount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "fromBlock", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "toBlock", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "WhaleAnalysisRequested",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "allRequestIds",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "offset", "type": "uint256" },
      { "internalType": "uint256", "name": "limit", "type": "uint256" }
    ],
    "name": "getRecentRequests",
    "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "requestId", "type": "bytes32" }],
    "name": "getRequest",
    "outputs": [
      {
        "components": [
          { "internalType": "bytes32", "name": "id", "type": "bytes32" },
          { "internalType": "address", "name": "requester", "type": "address" },
          { "internalType": "address", "name": "token", "type": "address" },
          { "internalType": "uint256", "name": "minimumAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "fromBlock", "type": "uint256" },
          { "internalType": "uint256", "name": "toBlock", "type": "uint256" },
          { "internalType": "bytes32", "name": "reportHash", "type": "bytes32" },
          { "internalType": "bool", "name": "isResolved", "type": "bool" },
          { "internalType": "uint256", "name": "requestedAt", "type": "uint256" },
          { "internalType": "uint256", "name": "resolvedAt", "type": "uint256" }
        ],
        "internalType": "struct BOTWhaleTrace.WhaleRequest",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalRequests",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "requestId", "type": "bytes32" },
      { "internalType": "bytes32", "name": "reportHash", "type": "bytes32" }
    ],
    "name": "publishResult",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "minimumAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "fromBlock", "type": "uint256" },
      { "internalType": "uint256", "name": "toBlock", "type": "uint256" }
    ],
    "name": "requestWhaleAnalysis",
    "outputs": [{ "internalType": "bytes32", "name": "requestId", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

