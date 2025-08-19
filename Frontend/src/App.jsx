// App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUp from './Util/SignUp.jsx';
import Login from './Login/Login.jsx';
import Home from './Home/Home.jsx';
import Profile from './Profile/Profile.jsx';
import Chat from './Chats/Chat.jsx';
import './App.css';
import { AuthProvider } from './Auth/AuthContext.jsx';
import Layout from './Util/Layout.jsx';
import Upload from './Upload/Upload.jsx';
import Contact from './Contact/Contact.jsx';
import ProtectedRoute from './Util/ProtectedRoute.jsx';
import { UserChatProvider } from './Auth/UserChatContext.jsx';
import { BarteringItemsProvider } from './Context/BarteringItemsContext.jsx';

function App() {

    return (
        <AuthProvider>
            <UserChatProvider>
                <BarteringItemsProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Layout />}>
                                <Route index element={<Home />} />
                                <Route path="login" element={<Login />} />
                                <Route path="signup" element={<SignUp />} />
                                <Route path="profile/:userId" element={<Profile />} />
                                <Route path="chats" element={ <ProtectedRoute> <Chat /></ProtectedRoute>} />
                                <Route path="chats/:owner_id/:itemId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                                <Route path="upload" element={ <ProtectedRoute> <Upload /></ProtectedRoute>} />
                                <Route path="contact" element={<Contact />} />
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </BarteringItemsProvider>
            </UserChatProvider>
        </AuthProvider>
    );
}

export default App;
