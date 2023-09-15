// Assuming you have stacks.js and @stacks/connect installed
// Import required libraries
import { showConnect } from '@stacks/connect';
import { UserSession } from '@stacks/auth';

const appDetails = {
    name: 'Audio to IPFS',
    icon: 'path-to-your-app-icon.png' // Replace this with the path to your app's icon
};

const userSession = new UserSession();

document.getElementById('loginButton').addEventListener('click', () => {
    if (!userSession.isUserSignedIn()) {
        showConnect({
            appDetails: appDetails,
            userSession: userSession,
            redirectTo: '/', // Redirect to home after login, modify as needed
            onFinish: () => {
                // Actions after user logs in, like updating the UI
                console.log('User signed in!');
            }
        });
    } else {
        // If user is already signed in, maybe log them out or handle other actions
    }
});
