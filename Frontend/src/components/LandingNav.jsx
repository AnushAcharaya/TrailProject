import React, { useState } from "react";
import { Stethoscope, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo Section */}
        <div className="flex items-center space-x-2">
          <div className="bg-green-600 text-white p-2 rounded-md">
            <Stethoscope size={20} />
          </div>
          <span className="font-semibold text-gray-800 text-lg">LHMMS</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-700">
          <a href="#home" className="hover:text-green-700 transition">
            Home
          </a>
          <a href="#about" className="hover:text-green-700 transition">
            About
          </a>
          <a href="#features" className="hover:text-green-700 transition">
            Features
          </a>
          <a href="#contact" className="hover:text-green-700 transition">
            Contact
          </a>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login">
            <button className="text-sm text-gray-700 hover:text-green-700 transition">
              Sign In
            </button>
          </Link>
          <Link to="/create-account">
            <button className="bg-green-600 text-white text-sm px-4 py-2 rounded-md hover:bg-green-700 transition">
              Sign Up
            </button>
          </Link>
        </div>

        {/* Mobile Menu Icon */}
        <button
          className="md:hidden text-gray-800 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Slide-in Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md border-r border-gray-100 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden z-50`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="bg-green-600 text-white p-2 rounded-md">
              <Stethoscope size={20} />
            </div>
            <span className="font-semibold text-gray-800 text-lg">LHMMS</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-800">
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col px-6 py-4 space-y-4 text-gray-700 font-medium">
          <a href="#home" onClick={() => setIsOpen(false)} className="hover:text-green-700">
            Home
          </a>
          <a href="#about" onClick={() => setIsOpen(false)} className="hover:text-green-700">
            About
          </a>
          <a href="#features" onClick={() => setIsOpen(false)} className="hover:text-green-700">
            Features
          </a>
          <a href="#contact" onClick={() => setIsOpen(false)} className="hover:text-green-700">
            Contact
          </a>

          <hr />

          <Link to="/login" onClick={() => setIsOpen(false)}>
            <button className="text-sm text-gray-700 hover:text-green-700 text-left w-full">
              Sign In
            </button>
          </Link>
          <Link to="/create-account" onClick={() => setIsOpen(false)}>
            <button className="bg-green-600 text-white text-sm px-4 py-2 rounded-md hover:bg-green-700 transition text-left w-full">
              Sign Up
            </button>
          </Link>
        </div>
      </div>

      {/* Overlay (dark background when menu open) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-40 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
