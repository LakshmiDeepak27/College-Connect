import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function AuthNavbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/signin");
    };

    return (
        <nav className="bg-white border-b border-gray-200 fixed top-0 w-full z-10">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-14">
                    <div className="flex items-center">
                        <Link to="/main" className="text-xl font-bold tracking-tight">
  <span className="text-white">College </span>
  <span className="text-blue-500">Connect</span>
</Link>

                        <div className="hidden md:ml-8 md:flex md:space-x-6">
                            <Link to="/main" className="text-gray-900 border-b-2 border-blue-600 px-1 pt-1 text-sm font-medium">
                                Home
                            </Link>
                            <Link to="/chat" className="text-gray-500 hover:text-gray-900 hover:border-gray-300 border-b-2 border-transparent px-1 pt-1 text-sm font-medium">
                                Chat
                            </Link>
                            <Link to="/notifications" className="text-gray-500 hover:text-gray-900 hover:border-gray-300 border-b-2 border-transparent px-1 pt-1 text-sm font-medium">
                                Notifications
                            </Link>
                            <Link to="/opportunities" className="text-gray-500 hover:text-gray-900 hover:border-gray-300 border-b-2 border-transparent px-1 pt-1 text-sm font-medium">
                                Opportunities
                            </Link>
                            <Link to="/events" className="text-gray-500 hover:text-gray-900 hover:border-gray-300 border-b-2 border-transparent px-1 pt-1 text-sm font-medium">
                                Events
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link to="/profile" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                            Profile
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default AuthNavbar;
