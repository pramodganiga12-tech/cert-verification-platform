import { expect } from "chai";
import { ethers } from "hardhat";
import { AcademicCertificate } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("AcademicCertificate Smart Contract Unit Tests", function () {
  let certContract: AcademicCertificate;
  let admin: SignerWithAddress;
  let issuer: SignerWithAddress;
  let revoker: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  const sampleHash = ethers.keccak256(ethers.toUtf8Bytes("SAMPLE_CERTIFICATE_HASH_12345"));
  const sampleCid = "QmQmZ6JsWcJS5pHuSWX35sk7DEyjDZ8MvvVNiZU73kXLaV";

  beforeEach(async function () {
    [admin, issuer, revoker, unauthorized] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("AcademicCertificate");
    certContract = (await Factory.deploy(admin.address)) as AcademicCertificate;
    await certContract.waitForDeployment();

    const ISSUER_ROLE = await certContract.ISSUER_ROLE();
    const REVOKER_ROLE = await certContract.REVOKER_ROLE();

    await certContract.grantRole(ISSUER_ROLE, issuer.address);
    await certContract.grantRole(REVOKER_ROLE, revoker.address);
  });

  it("Should assign roles correctly upon deployment", async function () {
    const DEFAULT_ADMIN_ROLE = await certContract.DEFAULT_ADMIN_ROLE();
    const ISSUER_ROLE = await certContract.ISSUER_ROLE();

    expect(await certContract.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.equal(true);
    expect(await certContract.hasRole(ISSUER_ROLE, issuer.address)).to.equal(true);
  });

  it("Should allow authorized issuer to issue certificate", async function () {
    await expect(certContract.connect(issuer).issueCertificate(sampleHash, sampleCid))
      .to.emit(certContract, "CertificateIssued")
      .withArgs(sampleHash, sampleCid, issuer.address, (val: bigint) => val > 0n);

    expect(await certContract.totalCertificatesCount()).to.equal(1n);

    const [isValid, isRevoked, ipfsCid, certIssuer] = await certContract.verifyCertificate(sampleHash);
    expect(isValid).to.equal(true);
    expect(isRevoked).to.equal(false);
    expect(ipfsCid).to.equal(sampleCid);
    expect(certIssuer).to.equal(issuer.address);
  });

  it("Should prevent duplicate certificate issuance", async function () {
    await certContract.connect(issuer).issueCertificate(sampleHash, sampleCid);
    await expect(
      certContract.connect(issuer).issueCertificate(sampleHash, sampleCid)
    ).to.be.revertedWithCustomError(certContract, "CertificateAlreadyExists");
  });

  it("Should prevent unauthorized users from issuing certificates", async function () {
    await expect(
      certContract.connect(unauthorized).issueCertificate(sampleHash, sampleCid)
    ).to.be.reverted;
  });

  it("Should allow revoker to revoke an issued certificate", async function () {
    await certContract.connect(issuer).issueCertificate(sampleHash, sampleCid);

    await expect(certContract.connect(revoker).revokeCertificate(sampleHash, "Typo in student name"))
      .to.emit(certContract, "CertificateRevoked")
      .withArgs(sampleHash, revoker.address, "Typo in student name", (val: bigint) => val > 0n);

    const [isValid, isRevoked] = await certContract.verifyCertificate(sampleHash);
    expect(isValid).to.equal(false);
    expect(isRevoked).to.equal(true);
  });

  it("Should enforce emergency pause functionality", async function () {
    await certContract.connect(admin).pause();

    await expect(
      certContract.connect(issuer).issueCertificate(sampleHash, sampleCid)
    ).to.be.revertedWithCustomError(certContract, "EnforcedPause");

    await certContract.connect(admin).unpause();

    await expect(certContract.connect(issuer).issueCertificate(sampleHash, sampleCid))
      .to.emit(certContract, "CertificateIssued");
  });
});
