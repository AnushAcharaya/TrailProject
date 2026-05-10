import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./common/LanguageSwitcher";
import BrandLogo from "./common/BrandLogo";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation("landing");

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-emerald-500 shadow-md">
      <div className="w-full flex items-center justify-between px-6 lg:px-10 py-3">
        {/* Logo — flush LEFT */}
        <BrandLogo variant="onDark" size="md" linkTo="/" />

        {/* Center nav */}
        <div className="hidden md:flex space-x-8 text-sm font-medium text-white/90">
          <a href="#home" className="hover:text-white transition-colors">{t("nav.home")}</a>
          <a href="#about" className="hover:text-white transition-colors">{t("nav.about")}</a>
          <a href="#features" className="hover:text-white transition-colors">{t("nav.features")}</a>
          <a href="#contact" className="hover:text-white transition-colors">{t("nav.contact")}</a>
        </div>

        {/* Right cluster — flush RIGHT */}
        <div className="hidden md:flex items-center gap-6">
          <LanguageSwitcher theme="dark" />
          <Link to="/login">
            <button className="text-sm font-medium text-white hover:text-emerald-100 transition-colors">
              {t("nav.signIn")}
            </button>
          </Link>
          <Link to="/register">
            <button className="bg-white text-emerald-700 hover:bg-emerald-50 text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
              {t("nav.getStarted")}
            </button>
          </Link>
        </div>

        {/* Mobile menu icon */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-100 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden z-50`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-emerald-500">
          <BrandLogo variant="onDark" size="md" linkTo={null} />
          <button onClick={() => setIsOpen(false)} className="text-white">
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col px-6 py-6 space-y-5 text-gray-700 font-medium">
          <a href="#home" onClick={() => setIsOpen(false)} className="hover:text-emerald-600">{t("nav.home")}</a>
          <a href="#about" onClick={() => setIsOpen(false)} className="hover:text-emerald-600">{t("nav.about")}</a>
          <a href="#features" onClick={() => setIsOpen(false)} className="hover:text-emerald-600">{t("nav.features")}</a>
          <a href="#contact" onClick={() => setIsOpen(false)} className="hover:text-emerald-600">{t("nav.contact")}</a>

          <hr className="border-gray-100" />

          <div className="py-1">
            <LanguageSwitcher />
          </div>

          <Link to="/login" onClick={() => setIsOpen(false)}>
            <button className="text-sm text-gray-700 hover:text-emerald-600 text-left w-full">
              {t("nav.signIn")}
            </button>
          </Link>
          <Link to="/register" onClick={() => setIsOpen(false)}>
            <button className="bg-emerald-500 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors w-full">
              {t("nav.getStarted")}
            </button>
          </Link>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
