import { msalInstance } from './msalConfig';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';

const getAuthenticatedClient = async () => {
  const account = msalInstance.getAllAccounts()[0];
  const scopes = ['Files.ReadWrite.All'];
  
  try {
    const authResult = await msalInstance.acquireTokenSilent({
      account,
      scopes
    });

    const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(msalInstance, {
      account: account,
      scopes: scopes,
      interactionType: 'popup'
    });

    return Client.initWithMiddleware({
      authProvider
    });
  } catch (error) {
    const authResult = await msalInstance.loginPopup({
      scopes,
      prompt: 'select_account'
    });

    const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(msalInstance, {
      account: authResult.account,
      scopes: scopes,
      interactionType: 'popup'
    });

    return Client.initWithMiddleware({
      authProvider
    });
  }
};

export const uploadFileToOneDrive = async (file) => {
    try {
      const client = await getAuthenticatedClient();
      const arrayBuffer = await file.arrayBuffer();
      
      const uploadSession = await client.api('/me/drive/root:/temp/' + file.name + ':/createUploadSession')
        .post({
          item: {
            "@microsoft.graph.conflictBehavior": "rename"
          }
        });
  
      await client.api(uploadSession.uploadUrl)
        .put(arrayBuffer);
  
      const item = await client.api('/me/drive/root:/temp/' + file.name)
        .get();
  
      if (!item.id || !item.parentReference.driveId) {
        console.error('Failed to get necessary item details', item);
        return null;
      }
  
      // For Excel files, use the Excel Online viewer
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(`https://graph.microsoft.com/v1.0/me/drive/items/${item.id}/content`)}`;
      }
  
      // For PDFs, use the OneDrive viewer
      return `https://onedrive.live.com/embed?cid=${item.parentReference.driveId}&resid=${item.id}&authkey=${item.sharingLink?.webUrl?.split('authkey=')[1]}`;
    } catch (error) {
      console.error('Error in uploadFileToOneDrive:', error);
      return null;
    }
  };

export const login = async () => {
  try {
    const loginResponse = await msalInstance.loginPopup({
      scopes: ['Files.ReadWrite.All'],
      prompt: 'select_account'
    });
    return loginResponse.account;
  } catch (err) {
    console.error(err);
  }
};

export const logout = () => {
  msalInstance.logout();
};

export const getAccount = () => {
  const currentAccounts = msalInstance.getAllAccounts();
  if (currentAccounts.length === 0) {
    return null;
  } else if (currentAccounts.length > 1) {
    console.warn("Multiple accounts detected, using the first one. Please review your account usage.");
    return currentAccounts[0];
  } else {
    return currentAccounts[0];
  }
};