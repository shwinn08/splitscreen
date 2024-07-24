import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: '07174bb1-0966-4bc2-83a4-fda779cd2038', // Replace with your actual client ID
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'http://localhost:3000'
  }
};

export const msalInstance = new PublicClientApplication(msalConfig);