import { useState, useRef, useEffect } from "react";

const DropdownButton = ({ label, items }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleItemClick = (onClick) => {
    onClick(); // Execute the onClick passed from parent
    setDropdownOpen(false); // Close the dropdown after item click
  };

  return (
    <div className="relative inline-block text-left mb-2" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className=" border border-green-500 bg-white flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-[#ffbda0]"
      >
        {label}
        <span className="pl-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="fill-current"
          >
            <path d="M10 14.25C9.8125 14.25 9.65625 14.1875 9.5 14.0625L2.3125 7C2.03125 6.71875 2.03125 6.28125 2.3125 6C2.59375 5.71875 3.03125 5.71875 3.3125 6L10 12.5312L16.6875 5.9375C16.9688 5.65625 17.4063 5.65625 17.6875 5.9375C17.9687 6.21875 17.9687 6.65625 17.6875 6.9375L10.5 14C10.3437 14.1563 10.1875 14.25 10 14.25Z" />
          </svg>
        </span>
      </button>

      <div
        className={`absolute left-0 z-40 mt-1 w-full rounded-md  bg-gray-100 shadow-lg py-1 transition-all ${
          dropdownOpen
            ? "top-full opacity-100 visible"
            : "top-[110%] opacity-0 invisible"
        }`}
      >
        {items.map((item, index) => (
          <a
            key={index}
            href="#"
            onClick={() => handleItemClick(item.onClick)}
            className="block px-4 py-1 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
};

export default DropdownButton;
