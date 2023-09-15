import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { makeContractCall, broadcastTransaction, uintCV, stringAsciiCV } from '@stacks/transactions';
import { stringAsciiCV } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import { mintAudionalNFT } from './stacks.js';



const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });



document.getElementById('loginBtn').addEventListener('click', () => {
    const myAppName = 'My Stacks Web-App';
    const myAppIcon = window.location.origin + '/my_logo.png';

    showConnect({
        userSession,
        appDetails: {
            name: myAppName,
            icon: myAppIcon,
        },
        onFinish: () => {
            window.location.reload();
        },
        onCancel: () => {
            console.log('User cancelled login');
        },
    });
});