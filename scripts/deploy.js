const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("-----------------------------------------");
  console.log("Deploying BOTWhaleTrace to network:", hre.network.name);
  console.log("-----------------------------------------");

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer account configured. Check PRIVATE_KEY in .env");
  }

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer address:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "BOT");

  const BOTWhaleTrace = await hre.ethers.getContractFactory("BOTWhaleTrace");
  const contract = await BOTWhaleTrace.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\nBOTWhaleTrace deployed successfully!");
  console.log("Contract Address:", address);
  console.log("Explorer URL:", `https://scan.bohr.life/address/${address}`);

  // Save to src/contracts/deployment.json for frontend consumption
  const contractsDir = path.join(__dirname, "..", "src", "contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  const deploymentData = {
    address: address,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 968,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  fs.writeFileSync(
    path.join(contractsDir, "deployment.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  // Update .env with deployed contract address
  const envPath = path.join(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    if (envContent.includes("NEXT_PUBLIC_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_CONTRACT_ADDRESS=${address}\n`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log("Updated NEXT_PUBLIC_CONTRACT_ADDRESS in .env");
  }

  // Also export contract ABI
  const artifact = await hre.artifacts.readArtifact("BOTWhaleTrace");
  fs.writeFileSync(
    path.join(contractsDir, "BOTWhaleTrace.json"),
    JSON.stringify(artifact, null, 2)
  );

  console.log("Deployment information saved to src/contracts/deployment.json");
  console.log("-----------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

