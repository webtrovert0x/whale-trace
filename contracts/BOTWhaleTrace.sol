// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BOTWhaleTrace
 * @notice On-chain whale analysis registry for BOT Chain.
 * Allows users to register whale inspection requests and publish verified analysis report hashes.
 */
contract BOTWhaleTrace {
    struct WhaleRequest {
        bytes32 id;
        address requester;
        address token; // address(0) represents native BOT
        uint256 minimumAmount;
        uint256 fromBlock;
        uint256 toBlock;
        bytes32 reportHash;
        bool isResolved;
        uint256 requestedAt;
        uint256 resolvedAt;
    }

    // Mapping from requestId => WhaleRequest
    mapping(bytes32 => WhaleRequest) public requests;
    
    // List of all requestIds for discovery & indexing
    bytes32[] public allRequestIds;
    
    // Nonce counter to ensure unique request IDs
    uint256 private _requestNonce;

    // Events
    event WhaleAnalysisRequested(
        bytes32 indexed requestId,
        address indexed requester,
        address indexed token,
        uint256 minimumAmount,
        uint256 fromBlock,
        uint256 toBlock,
        uint256 timestamp
    );

    event WhaleAnalysisPublished(
        bytes32 indexed requestId,
        bytes32 reportHash,
        address indexed reporter,
        uint256 timestamp
    );

    /**
     * @notice Submit a whale analysis inspection request
     * @param token The token address (address(0) for native BOT)
     * @param minimumAmount The minimum token transfer threshold in token base units
     * @param fromBlock Starting block of analysis window
     * @param toBlock Ending block of analysis window
     * @return requestId Unique identifier for the analysis
     */
    function requestWhaleAnalysis(
        address token,
        uint256 minimumAmount,
        uint256 fromBlock,
        uint256 toBlock
    ) external returns (bytes32 requestId) {
        require(toBlock >= fromBlock, "toBlock must be >= fromBlock");
        require(minimumAmount > 0, "minimumAmount must be > 0");

        _requestNonce++;
        requestId = keccak256(
            abi.encodePacked(
                msg.sender,
                token,
                minimumAmount,
                fromBlock,
                toBlock,
                block.timestamp,
                _requestNonce
            )
        );

        requests[requestId] = WhaleRequest({
            id: requestId,
            requester: msg.sender,
            token: token,
            minimumAmount: minimumAmount,
            fromBlock: fromBlock,
            toBlock: toBlock,
            reportHash: bytes32(0),
            isResolved: false,
            requestedAt: block.timestamp,
            resolvedAt: 0
        });

        allRequestIds.push(requestId);

        emit WhaleAnalysisRequested(
            requestId,
            msg.sender,
            token,
            minimumAmount,
            fromBlock,
            toBlock,
            block.timestamp
        );

        return requestId;
    }

    /**
     * @notice Retrieve details of an analysis request
     * @param requestId Unique identifier for the request
     * @return request Data for the specified request
     */
    function getRequest(bytes32 requestId) external view returns (WhaleRequest memory) {
        require(requests[requestId].requester != address(0), "Request does not exist");
        return requests[requestId];
    }

    /**
     * @notice Publish report hash for an analysis request
     * @param requestId Unique identifier for the request
     * @param reportHash Cryptographic hash / IPFS CID hash of the analysis result
     */
    function publishResult(
        bytes32 requestId,
        bytes32 reportHash
    ) external {
        WhaleRequest storage req = requests[requestId];
        require(req.requester != address(0), "Request does not exist");
        require(!req.isResolved, "Request already resolved");
        require(reportHash != bytes32(0), "reportHash cannot be zero");

        req.reportHash = reportHash;
        req.isResolved = true;
        req.resolvedAt = block.timestamp;

        emit WhaleAnalysisPublished(requestId, reportHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Get total count of registered requests
     */
    function getTotalRequests() external view returns (uint256) {
        return allRequestIds.length;
    }

    /**
     * @notice Get recent request IDs with pagination
     */
    function getRecentRequests(uint256 offset, uint256 limit) external view returns (bytes32[] memory) {
        uint256 total = allRequestIds.length;
        if (offset >= total) {
            return new bytes32[](0);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 size = end - offset;
        bytes32[] memory page = new bytes32[](size);
        for (uint256 i = 0; i < size; i++) {
            page[i] = allRequestIds[total - 1 - (offset + i)];
        }
        return page;
    }
}

