const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BOTWhaleTrace Smart Contract", function () {
  let botWhaleTrace;
  let owner;
  let analyst;

  beforeEach(async function () {
    [owner, analyst] = await ethers.getSigners();
    const BOTWhaleTrace = await ethers.getContractFactory("BOTWhaleTrace");
    botWhaleTrace = await BOTWhaleTrace.deploy();
    await botWhaleTrace.waitForDeployment();
  });

  it("should initialize with zero requests", async function () {
    const count = await botWhaleTrace.getTotalRequests();
    expect(count).to.equal(0n);
  });

  it("should allow requesting whale analysis for native BOT (address(0))", async function () {
    const minAmount = ethers.parseEther("10000"); // 10,000 BOT
    const fromBlock = 1000n;
    const toBlock = 2000n;

    const tx = await botWhaleTrace.connect(analyst).requestWhaleAnalysis(
      ethers.ZeroAddress,
      minAmount,
      fromBlock,
      toBlock
    );

    const receipt = await tx.wait();
    expect(await botWhaleTrace.getTotalRequests()).to.equal(1n);

    // Retrieve the emitted event
    const event = receipt.logs.find(
      (log) => log.fragment && log.fragment.name === "WhaleAnalysisRequested"
    );
    expect(event).to.not.be.undefined;
    const requestId = event.args[0];

    const req = await botWhaleTrace.getRequest(requestId);
    expect(req.requester).to.equal(analyst.address);
    expect(req.token).to.equal(ethers.ZeroAddress);
    expect(req.minimumAmount).to.equal(minAmount);
    expect(req.fromBlock).to.equal(fromBlock);
    expect(req.toBlock).to.equal(toBlock);
    expect(req.isResolved).to.be.false;
  });

  it("should reject requests where toBlock < fromBlock or minimumAmount is 0", async function () {
    await expect(
      botWhaleTrace.requestWhaleAnalysis(ethers.ZeroAddress, ethers.parseEther("100"), 2000n, 1000n)
    ).to.be.revertedWith("toBlock must be >= fromBlock");

    await expect(
      botWhaleTrace.requestWhaleAnalysis(ethers.ZeroAddress, 0n, 1000n, 2000n)
    ).to.be.revertedWith("minimumAmount must be > 0");
  });

  it("should allow publishing analysis results", async function () {
    const minAmount = ethers.parseEther("5000");
    const tx = await botWhaleTrace.requestWhaleAnalysis(
      ethers.ZeroAddress,
      minAmount,
      100n,
      200n
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(
      (log) => log.fragment && log.fragment.name === "WhaleAnalysisRequested"
    );
    const requestId = event.args[0];

    const sampleReportHash = ethers.keccak256(ethers.toUtf8Bytes("Whale Report #1234"));

    await expect(botWhaleTrace.connect(analyst).publishResult(requestId, sampleReportHash))
      .to.emit(botWhaleTrace, "WhaleAnalysisPublished")
      .withArgs(requestId, sampleReportHash, analyst.address, (val) => val > 0n);

    const updatedReq = await botWhaleTrace.getRequest(requestId);
    expect(updatedReq.isResolved).to.be.true;
    expect(updatedReq.reportHash).to.equal(sampleReportHash);
    expect(updatedReq.resolvedAt).to.be.gt(0n);
  });

  it("should prevent duplicate publishing for the same request", async function () {
    const tx = await botWhaleTrace.requestWhaleAnalysis(
      ethers.ZeroAddress,
      ethers.parseEther("1000"),
      100n,
      200n
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(
      (log) => log.fragment && log.fragment.name === "WhaleAnalysisRequested"
    );
    const requestId = event.args[0];

    const reportHash = ethers.keccak256(ethers.toUtf8Bytes("Whale Report"));
    await botWhaleTrace.publishResult(requestId, reportHash);

    await expect(
      botWhaleTrace.publishResult(requestId, reportHash)
    ).to.be.revertedWith("Request already resolved");
  });
});

