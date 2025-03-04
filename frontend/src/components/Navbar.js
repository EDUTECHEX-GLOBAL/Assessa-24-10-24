import React, { useState, useEffect, useRef } from "react";
import AssessaLogo from "../assets/assessaai_logo2.png";
import Menu from "../assets/Menu.svg";
import Close from "../assets/close.png";
import { FiUser, FiBookOpen, FiBriefcase, FiSettings } from "react-icons/fi";

const navLinks = [
  { name: "Discover", href: "#discover" },
  { name: "Vision", href: "#vision" },
  { name: "Features", href: "#features" },
  { name: "Team", href: "#team" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQs", href: "#faqs" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref for the entire dropdown container

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setLoginDropdownOpen(false); // Close login dropdown when opening mobile menu
  };

  const toggleLoginDropdown = () => {
    setLoginDropdownOpen(!loginDropdownOpen);
  };

  // Handle clicks outside of login dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLoginDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenuAndNavigate = (url) => {
    setMenuOpen(false); // Close the mobile menu
    window.location.href = url; // Navigate to the specified URL
  };

  const closeMenuAndScroll = (href) => {
    setMenuOpen(false); // Close the mobile menu
    // Delay the scroll slightly to allow the menu to close fully
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100); // Adjust delay as needed
  };


  return (
    <nav className="fixed top-0 left-0 w-full bg-white z-50 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 lg:container lg:mx-auto lg:px-20">
        <div className="flex items-center gap-x-5">
          <a href="/" aria-label="Home" className="mr-4">
            <img className="w-[100px]" src={AssessaLogo} alt="Assessa Logo" />
          </a>
          <div className="hidden lg:flex gap-x-8 ml-8">
            {navLinks.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="text-[#36485C] font-medium hover:text-[#4b5fde] transition duration-300"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>

        {/* Buttons Section */}
        <div className="flex items-center gap-x-4 relative">
          {/* Login Button with Modern Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleLoginDropdown}
              className="hidden lg:flex items-center gap-2 font-medium text-[#ad2ec7] border border-[#ad2ec7] px-5 py-2 rounded-full transition duration-300 hover:bg-[#ad2ec7] hover:bg-opacity-20 hover:text-[#ad2ec7]"
            >
              <FiUser className="text-lg" />
              Login / Signup
            </button>

            {loginDropdownOpen && (
              <div className="absolute left-10 mt-3 w-72 bg-white backdrop-blur-lg bg-opacity-80 shadow-xl rounded-xl p-4 border border-gray-200 transform transition-all duration-300">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">
                  Continue as:
                </h3>

                <div className="flex flex-col space-y-3">
                  <a
                    href="/student-login"
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 hover:shadow-md hover:scale-[1.02] transition transform"
                  >
                    <div className="p-2 bg-blue-500 text-white rounded-full">
                      <FiBookOpen className="text-lg" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Student</p>
                      <p className="text-sm text-gray-500">
                        Access learning materials & resources
                      </p>
                    </div>
                  </a>

                  <a
                    href="/teacher-login"
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-green-100 hover:shadow-md hover:scale-[1.02] transition transform"
                  >
                    <div className="p-2 bg-green-500 text-white rounded-full">
                      <FiBriefcase className="text-lg" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Teacher</p>
                      <p className="text-sm text-gray-500">
                        Manage courses and student progress
                      </p>
                    </div>
                  </a>

                  <a
                    href="/adminpanel-login"
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-red-50 to-red-100 hover:shadow-md hover:scale-[1.02] transition transform"
                  >
                    <div className="p-2 bg-red-500 text-white rounded-full">
                      <FiSettings className="text-lg" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Admin-Panel</p>
                      <p className="text-sm text-gray-500">
                        Manage platform users and settings
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>
          {/* Request Call Back Button */}
          <a
            href="#contacts"
            className="hidden lg:block font-medium text-white bg-[#1a191a] px-5 py-2 rounded-full transition duration-300 hover:bg-[#2c3b4e]"
          >
            Request Call Back
          </a>

          {/* Mobile Menu Icon */}
          <div className="lg:hidden" onClick={toggleMenu}>
            <img
              src={menuOpen ? Close : Menu}
              alt="Menu Button"
              width={30}
              height={30}
              className="cursor-pointer transition-transform duration-300 transform hover:scale-110"
            />
          </div>
        </div>

        {/* Mobile Menu (Includes Login Dropdown & Request Call Back) */}
        <div
          className={`${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          } fixed top-0 left-0 w-full h-screen bg-white flex flex-col items-center justify-center gap-5 z-50 transition-transform duration-300 ease-in-out`}
        >
          <div className="flex justify-end w-full p-4">
            <img
              src={Close}
              alt="Close Menu"
              onClick={toggleMenu}
              width={30}
              height={30}
              className="cursor-pointer transition-transform duration-300 transform hover:scale-110"
            />
          </div>
          {navLinks.map((item, index) => (
            <a
              key={index}
              href={item.href}
              onClick={toggleMenu}
              className="text-[#36485C] font-medium text-2xl transition duration-300 transform hover:scale-105"
            >
              {item.name}
            </a>
          ))}

          {/* Mobile Login Dropdown */}
          <button
            onClick={toggleLoginDropdown}
            className="font-medium text-[#4b5fde] border border-[#4b5fde] px-6 py-3 rounded-md transition duration-300 hover:bg-[#4b5fde] hover:text-white text-2xl"
          >
            Login
          </button>
          {/* Mobile Login Dropdown (Same as Desktop) */}
          {loginDropdownOpen && (
            <div className="w-72 bg-white shadow-xl rounded-xl p-4 border border-gray-200 transition-all duration-300 z-50">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">
                Continue as:
              </h3>

              <div className="flex flex-col space-y-3">
                <a
                  href="/student-login"
                  onClick={() => closeMenuAndNavigate("/student-login")}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
                >
                  <FiBookOpen className="text-lg text-blue-500" />
                  <span className="font-medium text-gray-700">Student</span>
                </a>
                <a
                  href="/teacher-login"
                  onClick={() => closeMenuAndNavigate("/teacher-login")}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
                >
                  <FiBriefcase className="text-lg text-green-500" />
                  <span className="font-medium text-gray-700">Teacher</span>
                </a>
                <a
                  href="/adminpanel-login"
                  onClick={() => closeMenuAndNavigate("/adminpanel-login")}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
                >
                  <FiSettings className="text-lg text-red-500" />
                  <span className="font-medium text-gray-700">Admin-Panel</span>
                </a>
              </div>
            </div>
          )}

          {/* Mobile Request Call Back Button */}
          <a
            href="#contacts"
            onClick={() => closeMenuAndScroll("#contacts")}
            className="text-white bg-[#1a191a] px-6 py-3 rounded-md transition duration-300 hover:bg-[#2c3b4e] text-2xl"
          >
            Request Call Back
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
