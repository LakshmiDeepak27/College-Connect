import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { toast } from "react-toastify";

const MainLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Fetch initial unread count
    const fetchUnread = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const unread = res.data.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchUnread();

    try {
      // Decode JWT token to get user ID
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;

      const newSocket = io("http://localhost:5000");
      newSocket.emit("register_user", userId);

      newSocket.on("new_notification", (notif) => {
        setUnreadCount(prev => prev + 1);
        toast.info(notif.message, {
           onClick: () => navigate('/notifications'),
           position: "top-right",
           autoClose: 5000,
           hideProgressBar: false,
           closeOnClick: true,
           pauseOnHover: true,
           draggable: true,
           theme: "dark"
        });
      });

      return () => newSocket.disconnect();
    } catch (e) {
      console.error("Socket connection failed", e);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-black relative text-white/90 overflow-x-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMTAgMCBMIDAgMCAwIDEwIiBmaWxsPSJub25lIiBzdHJva2U9IiMzQjgyRjYiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30 pointer-events-none z-0"></div>

      {/* Navbar container */}
      <div className="relative z-10 w-full pointer-events-auto flex flex-col min-h-screen">
        <header className="w-full bg-white/5 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            {/* Hamburger Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none hover:text-blue-400 p-1 rounded transition-colors lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            
            <h1 className="text-lg font-semibold text-white">
              <Link to="/main" className="text-xl font-bold tracking-tight">
                <span className="text-white">College </span>
                <span className="text-blue-500">Connect</span>
              </Link>
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end sm:justify-between">
            {/* Search Bar container */}
            <div className={`relative hidden sm:block transition-all duration-300 flex-1 max-w-md ${isMenuOpen ? 'sm:hidden lg:block' : 'mr-auto ml-4'}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-40 xl:w-64 lg:w-48 pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-white/40 transition-all"
              />
            </div>

            <Link to="/notifications" className="hidden sm:flex text-slate-300 hover:text-white transition-colors relative items-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link to="/profile" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
              Profile
            </Link>

            <button 
              onClick={handleLogout} 
              className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-md hover:bg-red-500/20 hover:text-red-300 text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Layout Body */}
        <div className="flex flex-1 relative w-full h-full">
          {/* Sidebar Menu */}
          <aside 
            className={`
              ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
              transition-transform duration-300 ease-in-out
              fixed z-40 w-64 h-[calc(100vh-61px)] bg-[#0A0A0A] sm:bg-black/90 lg:bg-[#0A0A0A] sm:backdrop-blur-3xl lg:backdrop-blur-none border-r border-white/10 p-4 top-[61px] left-0
            `}
          >
            <nav className="flex flex-col gap-2">
              <Link to="/main" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-white/10 text-slate-300 hover:text-white font-medium transition-colors">
                Dashboard
              </Link>

              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-white/10 text-slate-300 hover:text-white font-medium transition-colors">
                Profile
              </Link>

              <Link to="/chat" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-white/10 text-slate-300 hover:text-white font-medium transition-colors">
                Chat
              </Link>

              <Link to="/opportunities" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-white/10 text-slate-300 hover:text-white font-medium transition-colors">
                Opportunities
              </Link>

              <Link to="/events" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-white/10 text-slate-300 hover:text-white font-medium transition-colors">
                Events
              </Link>
              
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-white/10 text-slate-300 hover:text-white font-medium transition-colors">
                Connections
              </Link>

              <Link to="/notifications" onClick={() => setIsMenuOpen(false)} className="sm:hidden px-3 py-2 rounded-md hover:bg-white/10 text-slate-300 hover:text-white font-medium transition-colors flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                   <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                     {unreadCount}
                   </span>
                )}
              </Link>
            </nav>
          </aside>

          {/* Overlay for mobile when menu is open */}
          {isMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-30 top-[61px] lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            ></div>
          )}

          {/* Main Content */}
          <main 
            className={`flex-1 p-4 sm:p-6 transition-all duration-300 ease-in-out w-full
              ${isMenuOpen ? 'sm:ml-64 lg:ml-64' : 'ml-0 lg:ml-64'}
            `}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
