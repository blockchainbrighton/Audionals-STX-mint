// All Stacks-related initialization code goes here

// For example:

async function mintAudionalNFT() {
    if (!ipfsURLGlobal) {
        alert("IPFS URL not ready yet!");
        return;
    }
    const network = new window.stacks.transactions.StacksTestnet(); // Use window.stacks.transactions.StacksMainnet() for mainnet
    const contractAddress = 'ST16SYS65BZPZSGDSBANTAKDQD7HSTBZ9SXJSB47P.Audionals-V8'; // Replace with your contract's address
    const contractName = 'Audionals-V8';

    const txOptions = {
        contractAddress,
        contractName,
        functionName: 'claim',
        functionArgs: [stringAsciiCV(ipfsURLGlobal)],
        appDetails: {
            name: "Your App Name",
            icon: "URL to your app's icon"
        },
        postConditionMode: 0x01, // Post condition mode: Allow
        network,
        onFinish: (result) => {
            if (result.txId) {
                alert(`Minting successful! Transaction ID: ${result.txId}`);
            } else {
                alert('Minting failed. Please try again.');
            }
        }
    };

    await showConnect(txOptions);
}

export { mintAudionalNFT };
