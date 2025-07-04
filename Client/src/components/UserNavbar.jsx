import React, { useState } from 'react';
import { FaBell, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';

const UserNavbar = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);
  const toggleNotifications = () => setShowNotifications(!showNotifications);

  return (
    <div className="relative h-20 bg-white shadow-md flex items-center justify-between px-6 w-full">
      {/* Logo */}
      <h2 className="text-2xl font-bold text-[#ff5010] z-10">Dak Pad</h2>

      {/* Scrolling Info Text */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-[60%] overflow-hidden whitespace-nowrap">
        <div className="animate-marquee text-sm text-gray-600 font-medium">
          📌 Please check your status regularly. Ensure correct information in the application. For any issues, contact admin.
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-6 relative z-10">
        <span className="text-sm text-gray-500">{today}</span>

        {/* Notification bell */}
        <div className="relative">
          <button onClick={toggleNotifications} title="Notifications">
            <FaBell className="w-5 h-5 text-gray-600 hover:text-emerald-600" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#ff5010] rounded-full animate-ping"></span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-4 z-50">
              <p className="text-sm text-gray-600">No new notifications.</p>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className="relative">
          <button onClick={toggleUserMenu} className="flex items-center gap-2 border border-gray-200 py-1 px-3 rounded-full shadow-sm hover:shadow-md">
            <img
              src="https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg"
              alt="user"
              className="w-8 h-8 rounded-full"
            />
            <FaChevronDown className="text-gray-500 text-xs" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-lg z-50 overflow-hidden text-sm">
              <div className="px-4 py-2 border-b text-gray-700">👋 Welcome, User</div>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700">Profile</button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700">Settings</button>
              <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserNavbar;
