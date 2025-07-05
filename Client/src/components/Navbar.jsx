import React from 'react';
import { FaBell, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handleLogout = () => {
    console.log("User logged out");
  };

  return (
    <div className="h-16 bg-white shadow-md flex items-center justify-between px-6 rounded-full w-full">
      <h2 className="text-xl font-semibold text-[#ff5010]">Dak Pad Bhojpur</h2>

      <div className="flex items-center space-x-6">
        <span className="text-sm text-gray-500">{today}</span>

        <button className="relative">
          <FaBell className="w-5 h-5 text-gray-600 hover:text-emerald-600" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-[#ff5010] rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 border border-gray-200 py-1 px-3 rounded-full ">
          <img
            src="https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740"
            alt="user"
            className="w-10 h-10 rounded-full shadow-md"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">Aditya Kumar</span>
            <p className="text-xs text-[#ff5010] -mt-1">Admin</p>
          </div>
        </div>

<button
  className="group flex items-center justify-start w-11 h-11 bg-[#ff5010] rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-lg hover:w-32 hover:rounded-full active:translate-x-1 active:translate-y-1"
>
  <div
    className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3"
  >
    <svg className="w-4 h-4" viewBox="0 0 512 512" fill="white">
      <path
        d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
      ></path>
    </svg>
  </div>
  <div
    className="absolute right-5 transform translate-x-full opacity-0 text-white text-lg font-semibold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
  >
    Logout
  </div>
</button>

      </div>
    </div>
  );
};

export default Navbar;
