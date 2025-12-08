import React from "react";
import { Users, CheckCircle, BarChart2, Settings, HelpCircle, X } from "lucide-react";

export default function SideNav({ isOpen, toggleSidebar }) {
  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 md:hidden z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0
          h-[calc(100vh-4rem)] w-64
          bg-white shadow-lg p-6
          flex flex-col gap-6
          z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between md:justify-start">
          <h2 className="text-xl font-bold">LivestockHub</h2>
          <button className="md:hidden ml-auto" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3 mt-6 text-gray-700">
          <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors">
            <Users size={18} /> All Users
          </a>
          <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors">
            <CheckCircle size={18} /> Account Verifications
          </a>
          <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors">
            <BarChart2 size={18} /> Analytics
          </a>
          <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors">
            <Settings size={18} /> Settings
          </a>
          <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors">
            <HelpCircle size={18} /> Help & Support
          </a>
        </nav>

        {/* Footer */}
        <div className="mt-auto text-xs text-gray-500">
          © {new Date().getFullYear()} LivestockHub
        </div>
      </aside>
    </>
  );
}
