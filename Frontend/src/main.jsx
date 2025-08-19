import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { UserChatProvider } from "./Auth/UserChatContext.jsx";
import { AuthProvider } from "./Auth/AuthContext.jsx";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <UserChatProvider>
        <App />
      </UserChatProvider>
    </AuthProvider>
  </React.StrictMode>
);
