import React from 'react';
import ReactDOM from 'react-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

const CLIENT_ID = '568392435154-cp8ob93b06f2gggdi5s8rq22tdl2pd4i.apps.googleusercontent.com';

ReactDOM.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
