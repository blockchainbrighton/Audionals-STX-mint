const instrumentClasses = {
    "Select Class": ["Select Type"],
    "Drums": ["Drum Loop", "Bass Drum", "Snare Drum", "Tom-Tom", "Cymbal", "Hi-Hat", "Floor Tom", "Ride Cymbal", "Crash Cymbal"],
    "Bass": ["Acoustic Bass", "Electric Bass", "Synth Bass", "Fretless Bass", "Upright Bass", "5-String Bass"],
    "Guitar": ["Acoustic Guitar", "Electric Guitar", "Bass Guitar", "Classical Guitar", "12-String Guitar", "Resonator Guitar", "Pedal Steel Guitar"],
    "Vocals": ["Lead Vocals", "Backing Vocals", "Chorus", "Harmony", "Whisper", "Shout", "Speech", "Sounds"],
    "Percussion": ["Bongo", "Conga", "Tambourine", "Maracas", "Timpani", "Xylophone", "Triangle", "Djembe", "Cajon", "Tabla"],
    "Strings": ["Violin", "Viola", "Cello", "Double Bass", "Harp", "Mandolin", "Banjo", "Ukulele", "Sitar"],
    "Keys": ["Piano", "Analog Synth", "Digital Synth", "Modular Synth", "Wavetable Synth", "FM Synthesis", "Granular Synth", "Additive Synth"],
    "Sound Effects": ["Ambient", "Nature", "Industrial", "Electronic", "Urban", "Animals", "Weather", "Mechanical", "Sci-Fi"],
    "Brass": ["Trumpet", "Trombone", "Tuba", "French Horn", "Cornet", "Bugle", "Euphonium"],
    "Woodwinds": ["Flute", "Clarinet", "Oboe", "Bassoon", "Saxophone", "Recorder", "Piccolo", "English Horn"],
    "Keyboards": ["Piano", "Organ", "Harpsichord", "Accordion", "Mellotron", "Clavinet", "Celesta"],
    "Electronic": ["Sampler", "Drum Machine", "Sequencer", "Looper", "Effect Processor"]
};

// Stacks network configuration (change this based on testnet, mainnet, etc.)
const NETWORK = new StacksTestnet(); // change to StacksMainnet() for mainnet

// Your smart contract's principal (address)
const CONTRACT_ADDRESS = "ST16SYS65BZPZSGDSBANTAKDQD7HSTBZ9SXJSB47P";

// The name of your smart contract
const CONTRACT_NAME = "Audionals-V8";

async function mintWithMetadata(uri, ipfsLink, instrumentClass, instrumentType, creatorName) {
    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'mint-with-metadata',
        functionArgs: [
            stringAsciiCV(uri),
            stringAsciiCV(ipfsLink),
            stringAsciiCV(instrumentClass),
            stringAsciiCV(instrumentType),
            stringAsciiCV(creatorName)
        ],
        senderKey: 'YOUR_PRIVATE_KEY_HERE', // Use the private key of the sender
        network: NETWORK
    };
    const transaction = await makeContractCall(txOptions);
    return broadcastTransaction(transaction, NETWORK);
}

async function getTokenData(tokenId) {
    const cvResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-token-data',
        functionArgs: [uintCV(tokenId)],
        senderAddress: 'YOUR_ADDRESS_HERE', // The address that initiates the call
        network: NETWORK
    });
    return cvToJSON(cvResult);
}

async function transferToken(tokenId, sender, recipient) {
    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'transfer',
        functionArgs: [
            uintCV(tokenId),
            standardPrincipalCV(sender),
            standardPrincipalCV(recipient)
        ],
        senderKey: 'YOUR_PRIVATE_KEY_HERE', // Use the private key of the sender
        network: NETWORK
    };
    const transaction = await makeContractCall(txOptions);
    return broadcastTransaction(transaction, NETWORK);
}

async function transferTokenWithMemo(tokenId, sender, recipient, memo) {
    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'transfer-memo',
        functionArgs: [
            uintCV(tokenId),
            standardPrincipalCV(sender),
            standardPrincipalCV(recipient),
            bufferCVFromString(memo)
        ],
        senderKey: 'YOUR_PRIVATE_KEY_HERE', // Use the private key of the sender
        network: NETWORK
    };
    const transaction = await makeContractCall(txOptions);
    return broadcastTransaction(transaction, NETWORK);
}

async function getTokenOwner(tokenId) {
    const cvResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-owner',
        functionArgs: [uintCV(tokenId)],
        senderAddress: 'YOUR_ADDRESS_HERE', // The address that initiates the call
        network: NETWORK
    });
    return cvToJSON(cvResult);
}

async function setTokenURI(tokenId, uri) {
    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'set-token-uri',
        functionArgs: [
            uintCV(tokenId),
            stringAsciiCV(uri)
        ],
        senderKey: 'YOUR_PRIVATE_KEY_HERE', // Use the private key of the sender
        network: NETWORK
    };
    const transaction = await makeContractCall(txOptions);
    return broadcastTransaction(transaction, NETWORK);
}

async function getLastTokenId() {
    const cvResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-last-token-id',
        functionArgs: [],
        senderAddress: 'YOUR_ADDRESS_HERE', // The address that initiates the call
        network: NETWORK
    });
    return cvToJSON(cvResult);
}


const ipfs = IpfsHttpClient.create({ host: 'localhost', port: '5001', protocol: 'http' });

async function getPrice(id) {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
    const data = await response.json();
    return data[id].usd;
}

function attachClassDropdownListeners() {
    document.querySelectorAll('.instrumentClass').forEach(dropdown => {
        dropdown.addEventListener('change', function() {
            updateTypeDropdown(this.nextElementSibling, this.value);
        });
    });
}

async function loadFiles() {
    const [stxPrice, btcPrice] = await Promise.all([getPrice('blockstack'), getPrice('bitcoin')]);
    const files = document.getElementById('audioFiles').files;
    const formContainer = document.getElementById('formsContainer');
    formContainer.innerHTML = '';

    let totalBtcCost = 0, totalUsdCost = 0, totalStxCost = files.length;

    for (let file of files) {
        const fileSizeKB = file.size / 1024;
        const btcCost = (file.size * 6) / 100000000; 
        totalBtcCost += btcCost;
        totalUsdCost += btcCost * btcPrice;

        const newForm = document.createElement('div');
        newForm.className = 'audioForm';
        newForm.innerHTML = `
            <input type="text" placeholder="File Name" class="fileName" value="${file.name}">
            <select class="instrumentClass" name="instrumentClass">
                ${Object.keys(instrumentClasses).map(className => `<option value="${className}">${className}</option>`).join('')}
            </select>
            <select class="instrumentType"></select>
            <input type="text" placeholder="Creator Name" class="creatorName">
            <div class="${getFileSizeColorClass(fileSizeKB)}">File Size: ${fileSizeKB.toFixed(2)} KB</div>
            <div class="orange">Estimated Lowest Bitcoin Inscription Cost: ${btcCost.toFixed(8)} BTC ($${(btcCost * btcPrice).toFixed(2)})</div>
            <div class="green">Cost to mint STX Audional NFT: 1 STX / $${stxPrice.toFixed(2)}</div>
        `;
        formContainer.appendChild(newForm);
        updateTypeDropdown(newForm.querySelector('.instrumentType'), newForm.querySelector('.instrumentClass').value);
    }

    document.getElementById('btcTotal').innerHTML = `<span class="orange">Total Bitcoin Inscription Cost: ${totalBtcCost.toFixed(8)} BTC ($${totalUsdCost.toFixed(2)})</span>`;
    document.getElementById('stxTotal').innerHTML = `<span class="green">Total STX Minting Cost: ${totalStxCost} STX ($${(totalStxCost * stxPrice).toFixed(2)})</span>`;
    attachClassDropdownListeners();
}

function updateTypeDropdown(typeDropdown, selectedClass) {
    typeDropdown.innerHTML = instrumentClasses[selectedClass].concat("User Defined").map(type => `<option value="${type}">${type}</option>`).join('');
}

function getFileSizeColorClass(fileSizeKB) {
    if (fileSizeKB < 1) return 'bright-green';
    if (fileSizeKB < 5) return 'yellow';
    if (fileSizeKB < 20) return 'orange';
    if (fileSizeKB < 100) return 'pink';
    if (fileSizeKB <= 350) return 'red';
    return 'black';
}

async function uploadAllToIPFS() {
    const forms = document.querySelectorAll('.audioForm');
    const files = document.getElementById('audioFiles').files;
    const linksContainer = document.getElementById('ipfsLinks');
    linksContainer.innerHTML = '';

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size / 1024 > 350) {
            alert('Files must be under 350kb per file');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async function () {
            const base64Data = reader.result;
            const form = forms[i];
            const jsonData = {
                p: "audional",
                op: "deploy",
                audinal_id: "648e383daDbMUxq",
                fileName: form.querySelector('.fileName').value,
                instrumentClass: form.querySelector('.instrumentClass').value,
                instrumentType: form.querySelector('.instrumentType').value,
                creatorName: form.querySelector('.creatorName').value,
                audioData: base64Data
            };
            const ipfsURL = await uploadToIPFS(jsonData);
            linksContainer.innerHTML += `<div>${jsonData.fileName}: ${ipfsURL}</div>`;
        };
    }
}

async function uploadToIPFS(data) {
    try {
        const file = { path: 'audio.json', content: new TextEncoder().encode(JSON.stringify(data)) };
        const result = await ipfs.add(file);
        return `https://ipfs.io/ipfs/${result.cid.toString()}`;
    } catch (error) {
        console.error("Error in IPFS upload:", error);
        throw error;
    }
}

function copyLinksToClipboard() {
    const textArea = document.createElement('textarea');
    textArea.value = document.getElementById('ipfsLinks').innerText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}