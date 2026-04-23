import React from 'react';
import Nav from './Nav';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer';

const Root = () => {
    const location = useLocation();
    // Pages that render their own full-bleed layout (including their own footer)
    const standalonePages = ['/', '/login', '/register', '/add_job'];
    const isStandalone = standalonePages.includes(location.pathname) || location.pathname.startsWith('/job/');

    return (
        <div className="flex flex-col min-h-screen" style={{ background: '#070f09' }}>
            <Nav />
            <div className="flex-1">
                <Outlet />
            </div>
            {/* Only show the shared footer on pages that don't provide their own */}
            {!isStandalone && <Footer />}
        </div>
    );
};

export default Root;