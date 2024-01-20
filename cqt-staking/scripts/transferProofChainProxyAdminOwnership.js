const { ethers } = require('hardhat');

const proofChainAbi = require('../generated-abis/ugly/ProofChain.json');
const ProofChainAddress = '';

const newOwner = "0xf49a18d447dDF380a916809Ed1bE4011Ed5946bE";

async function getProofChainContract(signer) {
    return new ethers.Contract(ProofChainAddress, proofChainAbi, signer);
}


async function main() {
    const [owner] = await ethers.getSigners();

    const proofChainContract = await getProofChainContract(owner);


    const adminAdress = await upgrades.erc1967.getAdminAddress(proofChainContract.address);
    console.log("Proxy Admin address: ", adminAdress);

    const adminContract = new ethers.Contract(adminAdress, proofChainAbi, owner);

    console.log("Current ProxyAdmin owner: ", await adminContract.owner());

    await adminContract.connect(owner).transferOwnership(newOwner);

    console.log("New ProxyAdmin owner: ", await adminContract.owner());

}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });