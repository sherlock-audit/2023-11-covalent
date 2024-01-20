const hre = require('hardhat');
const { ethers } = require('hardhat');

const proofChainAbi = require('../generated-abis/ugly/ProofChain.json');
const ProofChainAddress = '0x4f2E285227D43D9eB52799D0A28299540452446E';


async function getProofChainContract(signer) {
    return new ethers.Contract(ProofChainAddress, proofChainAbi, signer);
}


async function main() {
    const [owner] = await ethers.getSigners();

    const proofChainContract = await getProofChainContract(owner);

    const adminAdress = await upgrades.erc1967.getAdminAddress(proofChainContract.address)

    // we only need transferOwnership function for ProxyAdmin so using proofChainAbi works fine
    const adminContract = new ethers.Contract(adminAdress, proofChainAbi, owner);

    console.log("Current ProxyAdmin owner: ", await adminContract.owner())

    const newOwner = '' //valid new owner address
    await adminContract.connect(owner).transferOwnership(newOwner)

    console.log("New ProxyAdmin owner: ", await adminContract.owner())

}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });