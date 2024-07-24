// src/services/authConfig.js
export const msalConfig = {
    auth: {
      clientId: "b0bd5752-8098-492c-bae5-4e20cc2d73f2",
      authority: "https://login.microsoftonline.com/common",
      redirectUri: "http://localhost:3001 ",
    },
    cache: {
      cacheLocation: "sessionStorage",
      storeAuthStateInCookie: false,
    },
  };
  
  export const loginRequest = {
    scopes: ["Files.ReadWrite", "Files.ReadWrite.All", "Sites.ReadWrite.All"],
  };