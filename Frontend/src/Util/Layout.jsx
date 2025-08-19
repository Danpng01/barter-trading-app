// Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

const Layout = () => {
    const { currentUser } = useAuth();

    return (
        <>  
            <Header curruser={currentUser}/>
            <Outlet />
            <Footer />
        </>
    );
};

export default Layout;
