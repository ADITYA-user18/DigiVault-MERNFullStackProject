import React, { useState, useEffect, useRef, useContext } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Determine if user is logged in based on user object from context
  const isLoggedIn = !!user;

  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Styles ---
  const navLinkStyles = ({ isActive }) =>
    `relative px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg group ${
      isActive
        ? "text-blue-600 bg-blue-50/80"
        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
    }`;

  const mobileLinkStyles = ({ isActive }) =>
    `block px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
        : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
    }`;

  // --- Render Helpers ---
  const handleLogout = () => {
    logout();
  };

  return (
    <nav
      className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md border-slate-200 shadow-sm py-2"
          : "bg-transparent border-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* --- LOGO --- */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300 transform group-hover:scale-105">
              {/* Shield/Vault Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-800 leading-none">
                Digi<span className="text-blue-600">Vault</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Secure Storage</span>
            </div>
          </NavLink>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" className={navLinkStyles}>Home</NavLink>
            <NavLink to="/dashboard" className={navLinkStyles}>Dashboard</NavLink>
            <NavLink to="/upload" className={navLinkStyles}>Upload</NavLink>
            <NavLink to="/getfiles" className={navLinkStyles}>My Files</NavLink>
          </div>

          {/* --- AUTH ACTIONS (DESKTOP) --- */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <NavLink
                  to="/login"
                  className="text-slate-600 hover:text-blue-600 font-medium text-sm transition-colors"
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/signup"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
                >
                  Get Started
                </NavLink>
              </>
            ) : (
              // --- USER DROPDOWN ---
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                >
                  <span className="text-sm font-semibold text-slate-700 ml-2">
                    {user?.name ?? "Guest"}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                    {user?.name?.charAt(0)?.toUpperCase() ?? "G"}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 animation-fade-in origin-top-right">
                    <div className="px-4 py-2 border-b border-slate-50">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm text-slate-800 font-semibold truncate">
                        {user?.email ?? "Not signed in"}
                      </p>
                    </div>
                    
                    <div className="my-1 border-t border-slate-50"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-1 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl transition-all duration-300 ease-in-out origin-top ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="px-4 py-6 space-y-3">
          <NavLink to="/" className={mobileLinkStyles}>Home</NavLink>
          <NavLink to="/dashboard" className={mobileLinkStyles}>Dashboard</NavLink>
          <NavLink to="/upload" className={mobileLinkStyles}>Upload</NavLink>
          <NavLink to="/getfiles" className={mobileLinkStyles}>My Files</NavLink>

          <div className="h-px bg-slate-100 my-4" />

          {!isLoggedIn ? (
            <div className="flex flex-col gap-3">
              <NavLink to="/login" className="w-full py-3 text-center text-slate-600 font-semibold bg-slate-50 rounded-xl">
                Log In
              </NavLink>
              <NavLink to="/signup" className="w-full py-3 text-center text-white font-semibold bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                Sign Up
              </NavLink>
            </div>
          ) : (
            <>
               <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() ?? "G"}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{user?.name ?? "Guest"}</p>
                    <p className="text-xs text-slate-500">{user?.email ?? "Not logged in"}</p>
                  </div>
               </div>
               <button onClick={handleLogout} className="w-full py-3 flex items-center justify-center gap-2 text-red-600 font-medium bg-red-50 rounded-xl">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                 Sign Out
               </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;