
const { ethers } = require('hardhat');

async function main() {
    const currentImplAddress = await upgrades.erc1967.getImplementationAddress("0x8eBbA081291B908096D19f6614Df041C95fc4469");
    console.log(currentImplAddress);
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
