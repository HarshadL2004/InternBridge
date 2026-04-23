import React, { useContext, useState, useEffect, useRef } from 'react';
import { PiList, PiX } from 'react-icons/pi';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../config/AuthProvider';
import Swal from 'sweetalert2';

const Nav = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { user, logout } = useContext(AuthContext);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
    });

    const handleLogout = () => {
        logout().then(() => {
            Toast.fire({ icon: "success", title: `Bye! See you again 👋` });
            localStorage.removeItem('user');
        });
    };

    const dashboardPath = user?.role === 'Student' ? '/student' : user?.role === 'Company' ? '/company' : '/college';

    const activeClass = "text-[#05AF2B] font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#05AF2B] after:rounded-full after:scale-x-100 after:transition-transform after:duration-300";
    const inactiveClass = "text-gray-300 hover:text-white transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#05AF2B] after:rounded-full hover:after:w-full after:transition-all after:duration-300";

    const navLinks = (
        <>
            <li className="relative group">
                <NavLink to="/" className={({ isActive }) => `block px-4 py-2 rounded-lg transition-all duration-300 ${isActive ? activeClass : inactiveClass} group-hover:bg-[rgba(5,175,43,0.05)]`}>
                    <span className="relative z-10 flex items-center gap-2">
                        <span className="text-lg">🏠</span>
                        <span>Home</span>
                    </span>
                </NavLink>
            </li>
            <li className="relative group">
                <NavLink to="/ats" className={({ isActive }) => `block px-4 py-2 rounded-lg transition-all duration-300 ${isActive ? activeClass : inactiveClass} group-hover:bg-[rgba(5,175,43,0.05)]`}>
                    <span className="relative z-10 flex items-center gap-2">
                        <span className="text-lg">📊</span>
                        <span>ATS Score</span>
                    </span>
                </NavLink>
            </li>
            <li className="relative group">
                <NavLink to="/student" className={({ isActive }) => `block px-4 py-2 rounded-lg transition-all duration-300 ${isActive ? activeClass : inactiveClass} group-hover:bg-[rgba(5,175,43,0.05)]`}>
                    <span className="relative z-10 flex items-center gap-2">
                        <span className="text-lg">🎓</span>
                        <span>Students</span>
                    </span>
                </NavLink>
            </li>
            {user?.role === 'Company' && (
                <li className="relative group">
                    <NavLink to="/company" className={({ isActive }) => `block px-4 py-2 rounded-lg transition-all duration-300 ${isActive ? activeClass : inactiveClass} group-hover:bg-[rgba(5,175,43,0.05)]`}>
                        <span className="relative z-10 flex items-center gap-2">
                            <span className="text-lg">🏢</span>
                            <span>Companies</span>
                        </span>
                    </NavLink>
                </li>
            )}
            {user?.role === 'College' && (
                <li className="relative group">
                    <NavLink to="/college" className={({ isActive }) => `block px-4 py-2 rounded-lg transition-all duration-300 ${isActive ? activeClass : inactiveClass} group-hover:bg-[rgba(5,175,43,0.05)]`}>
                        <span className="relative z-10 flex items-center gap-2">
                            <span className="text-lg">🏛️</span>
                            <span>Colleges</span>
                        </span>
                    </NavLink>
                </li>
            )}
        </>
    );

    return (
        <div
            className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-[#070f09]/90 backdrop-blur-xl nav-glow border-b border-[rgba(5,175,43,0.1)]'
                    : 'bg-transparent'
                }`}
        >
            <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 h-16">
                {/* Logo */}
                <NavLink to='/' className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#05AF2B] to-emerald-700 flex items-center justify-center shadow-[0_0_16px_rgba(5,175,43,0.4)] group-hover:shadow-[0_0_24px_rgba(5,175,43,0.6)] transition-shadow duration-300">
                        <span className="text-white font-black text-sm">IB</span>
                    </div>
                    <span className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Intern<span className="text-[#05AF2B]">Bridge</span>
                    </span>
                </NavLink>

                {/* Desktop Nav */}
                <div className="hidden md:flex gap-6 items-center">
                    <nav className="flex items-center">
                        <ul className="flex items-center gap-2 text-sm font-medium bg-[rgba(15,36,24,0.3)] backdrop-blur-sm rounded-2xl px-4 py-1.5 border border-[rgba(5,175,43,0.1)] shadow-inner">
                            {navLinks}

                            {user && (
                                <li className="relative ml-2 pl-2 border-l border-white/10 flex items-center h-full">
                                    <div className="flex items-center">
                                        <div
                                            className="w-9 h-9 flex items-center justify-center text-white rounded-full bg-gradient-to-br from-[#05AF2B] to-[#038a22] shadow-[0_0_12px_rgba(5,175,43,0.3)] border border-white/10 relative group cursor-pointer"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        >
                                            <span className="text-sm font-black drop-shadow-md">
                                                {user?.email?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        {isDropdownOpen && (
                                            <div ref={dropdownRef} className="absolute top-full right-0 mt-2 w-48 bg-[#0f2418]/95 backdrop-blur-xl rounded-xl border border-[rgba(5,175,43,0.2)] shadow-xl shadow-[rgba(5,175,43,0.1)] py-2 z-50">
                                                <NavLink
                                                    to={dashboardPath}
                                                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-[rgba(5,175,43,0.1)] transition-all duration-300 rounded-lg mx-2"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                >
                                                    <span>📊</span>
                                                    <span>Dashboard</span>
                                                </NavLink>
                                                <button
                                                    onClick={() => {
                                                        handleLogout();
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="flex items-center gap-3 w-full text-red-400 hover:bg-red-500/10 px-4 py-3 text-sm text-left transition-all duration-300 rounded-lg mx-2"
                                                >
                                                    <span>🚪</span>
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            )}
                        </ul>
                    </nav>

                    {user?.role === 'Company' && (
                        <NavLink
                            to='/add_job'
                            className='relative text-[#05AF2B] text-[10px] tracking-widest font-bold border border-[#05AF2B]/60 px-5 py-2.5 rounded-full hover:bg-[#05AF2B]/10 hover:border-[#05AF2B] transition-all duration-300 overflow-hidden group shadow-[0_0_15px_rgba(5,175,43,0.1)]'
                        >
                            <span className="relative z-10">+ POST INTERNSHIP</span>
                        </NavLink>
                    )}

                    {!user && (
                        <div className='flex items-center gap-4 text-sm font-semibold ml-2'>
                            <NavLink
                                to='/login'
                                className='text-gray-300 tracking-wide hover:text-white transition-all duration-300 px-4 py-2 rounded-xl hover:bg-white/5'
                            >
                                Login
                            </NavLink>
                            <NavLink
                                to='/register'
                                className='btn-primary-glow text-sm px-6 py-2.5 !rounded-full tracking-wide font-bold relative overflow-hidden group shadow-lg shadow-[#05AF2B]/20'
                            >
                                <span className="relative z-10 text-white">Get Started</span>
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    className="md:hidden text-white text-2xl p-3 rounded-xl hover:bg-[rgba(5,175,43,0.1)] transition-all duration-300 hover:scale-105 border border-transparent hover:border-[rgba(5,175,43,0.2)]"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <PiX /> : <PiList />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden glass border-t border-[rgba(5,175,43,0.1)] text-white p-6 flex flex-col gap-6 shadow-2xl fade-in-up bg-[rgba(7,15,9,0.95)] backdrop-blur-xl">
                    <nav className="flex flex-col gap-2">
                        <ul className="flex flex-col gap-1 text-sm font-medium bg-[rgba(15,36,24,0.3)] rounded-2xl p-4 border border-[rgba(5,175,43,0.1)]">
                            {navLinks}
                        </ul>
                    </nav>

                    <div className="divider-green" />

                    {user?.role === 'Company' && (
                        <NavLink
                            to='/add_job'
                            className='text-[#05AF2B] font-bold text-sm border border-[#05AF2B]/60 px-6 py-3 rounded-full text-center hover:bg-[#05AF2B]/10 hover:border-[#05AF2B] transition-all duration-300'
                            onClick={() => setIsOpen(false)}
                        >
                            + POST INTERNSHIP
                        </NavLink>
                    )}

                    {!user ? (
                        <div className="flex flex-col gap-4 pt-2">
                            <NavLink
                                to='/login'
                                className="text-gray-300 text-sm px-4 py-3 rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-all duration-300 text-center border border-transparent hover:border-[rgba(5,175,43,0.2)]"
                                onClick={() => setIsOpen(false)}
                            >
                                Login
                            </NavLink>
                            <NavLink
                                to='/register'
                                className="btn-primary-glow text-center text-sm !rounded-full py-3 font-bold"
                                onClick={() => setIsOpen(false)}
                            >
                                Get Started
                            </NavLink>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="px-4 py-3 text-xs text-gray-400 bg-[rgba(5,175,43,0.05)] rounded-xl border border-[rgba(5,175,43,0.1)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#05AF2B] to-emerald-700 flex items-center justify-center text-sm font-bold">
                                        {user?.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="truncate">{user.email}</span>
                                </div>
                            </div>
                            <NavLink
                                to={dashboardPath}
                                className="text-gray-300 hover:text-white px-4 py-3 rounded-xl hover:bg-[rgba(5,175,43,0.1)] transition-all duration-300 flex items-center gap-3"
                                onClick={() => setIsOpen(false)}
                            >
                                <span>📊</span>
                                <span>Dashboard</span>
                            </NavLink>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsOpen(false);
                                }}
                                className="text-red-400 hover:bg-red-500/10 px-4 py-3 rounded-xl text-sm text-left transition-all duration-300 flex items-center gap-3"
                            >
                                <span>🚪</span>
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Nav;
