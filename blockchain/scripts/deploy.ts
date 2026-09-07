import { ethers, network } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("Network:", network.name);
  const signers = await ethers.getSigners();
  console.log("Available signers:", signers.length);
  if (signers.length === 0) {
    console.error("No signers available. Check PRIVATE_KEY in .env");
    process.exit(1);
  }
  const deployer = signers[0];
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const Factory = await ethers.getContractFactory("AcademicCertificate");
  const contract = await Factory.deploy(deployer.address);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\nAcademicCertificate deployed to:", address);
  console.log("\nUpdate .env with: CONTRACT_ADDRESS=" + address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
