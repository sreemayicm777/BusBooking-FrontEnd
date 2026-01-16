import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./features/authSlice";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, role } = useSelector((state) => state.auth);
  const location = useLocation();

  const hideNavbarFooter = ["/", "/login", "/register"].includes(location.pathname);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-[#FEF9F2] text-slate-800 flex flex-col">
      {/* Navigation */}
      {!hideNavbarFooter && (
        <nav className="sticky top-0 z-50 bg-white border-b border-red-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <Link
                to={user ? (role === "admin" ? "/admin/dashboard" : "/search") : "/"}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17H2a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
                    <circle cx="7" cy="17" r="2" />
                    <circle cx="17" cy="17" r="2" />
                    <path d="M10 17h4" />
                    <path d="M0 10h24" />
                  </svg>
                </div>
                <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
                  Red<span className="text-red-600">Bus</span>
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {user ? (
                  <>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-full py-1.5 pl-1.5 pr-4">
                        <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900 leading-tight">{user.name}</span>
                          <span className="text-[10px] text-red-600 uppercase font-black tracking-widest leading-tight">{role}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        {role === 'admin' ? (
                          <>
                            <NavLink to="/admin/dashboard" label="Home" />
                            <NavLink to="/admin/bookings" label="Bookings" />
                            <NavLink to="/admin/users" label="Users" />
                            <NavLink to="/create-bus" label="Add Bus" />
                          </>
                        ) : (
                          <>
                            <NavLink to="/search" label="Search" />
                            <NavLink to="/my-bookings" label="My Trips" />
                            <NavLink to="/booking-history" label="History" />
                          </>
                        )}
                      </div>

                      <button
                        onClick={handleLogout}
                        className="bg-white hover:bg-red-50 border-2 border-red-600 text-red-600 px-5 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all active:scale-95"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/login"
                      className="text-slate-600 hover:text-red-600 px-4 py-2 font-black uppercase tracking-widest text-xs transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-200 transition-all active:scale-95"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 transition-all"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white border-b border-red-100 overflow-hidden"
              >
                <div className="px-4 pt-2 pb-6 space-y-1">
                  {user ? (
                    <>
                      <div className="flex items-center p-4 bg-red-50 rounded-2xl mb-4 border border-red-100">
                        <div className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center text-white text-xl font-bold mr-4">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-xs text-red-600 uppercase font-black tracking-widest">{role}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {role === 'admin' ? (
                          <>
                            <MobileNavLink to="/admin/dashboard" label="Home" onClick={() => setIsMobileMenuOpen(false)} />
                            <MobileNavLink to="/admin/bookings" label="Manage Bookings" onClick={() => setIsMobileMenuOpen(false)} />
                            <MobileNavLink to="/admin/users" label="User Management" onClick={() => setIsMobileMenuOpen(false)} />
                            <MobileNavLink to="/create-bus" label="Add New Bus" onClick={() => setIsMobileMenuOpen(false)} />
                          </>
                        ) : (
                          <>
                            <MobileNavLink to="/search" label="Find Buses" onClick={() => setIsMobileMenuOpen(false)} />
                            <MobileNavLink to="/my-bookings" label="My Trips" onClick={() => setIsMobileMenuOpen(false)} />
                            <MobileNavLink to="/booking-history" label="History" onClick={() => setIsMobileMenuOpen(false)} />
                          </>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center justify-center w-full mt-4 px-4 py-4 rounded-2xl bg-white text-red-600 font-black uppercase tracking-widest text-xs border-2 border-red-600"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 pt-2">
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center py-4 rounded-2xl bg-slate-50 text-slate-600 font-bold border border-slate-200">
                        Login
                      </Link>
                      <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center py-4 rounded-2xl bg-red-600 text-white font-bold shadow-lg shadow-red-200">
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      {!hideNavbarFooter && (
        <footer className="bg-white border-t border-red-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {/* Company Info */}
              <div className="col-span-1 lg:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-200">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">Red<span className="text-red-600">Bus</span> Platform</span>
                </div>
                <p className="text-slate-500 leading-relaxed max-w-sm mb-8 font-medium">
                  The most reliable bus booking platform. Safe, fast, and comfortable journeys planned just for you.
                </p>
                <div className="flex space-x-5">
                  <SocialIcon path="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" color="#DC2626" />
                  <SocialIcon path="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" color="#DC2626" />
                </div>
              </div>

              {/* Links Sections */}
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-6 border-l-4 border-red-600 pl-3">Quick Links</h3>
                <ul className="space-y-4">
                  <FooterLink label="Search Buses" to="/search" />
                  <FooterLink label="My Bookings" to="/my-bookings" />
                  <FooterLink label="Manage Account" to="#" />
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-6 border-l-4 border-red-600 pl-3">Support</h3>
                <ul className="space-y-4">
                  <FooterLink label="Help Center" to="#" />
                  <FooterLink label="Privacy Policy" to="#" />
                  <FooterLink label="Terms & Conditions" to="#" />
                </ul>
              </div>
            </div>

            <div className="border-t border-red-50 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                © {new Date().getFullYear()} RedBus Platform. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Server Online</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function NavLink({ to, label }) {
  return (
    <Link
      to={to}
      className="text-slate-600 hover:text-red-600 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all relative group"
    >
      {label}
      <span className="absolute bottom-0 left-4 right-4 h-1 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></span>
    </Link>
  );
}

function MobileNavLink({ to, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all"
    >
      {label}
    </Link>
  );
}

function FooterLink({ label, to }) {
  return (
    <li>
      <Link to={to} className="text-slate-500 hover:text-red-600 text-sm font-bold transition-colors">
        {label}
      </Link>
    </li>
  );
}

function SocialIcon({ path, color }) {
  return (
    <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-600 transition-all active:scale-95 group">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={path} />
      </svg>
    </a>
  );
}

export default App;