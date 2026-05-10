import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import BrandLogo from "./common/BrandLogo";

const Footer = () => {
  const { t } = useTranslation("landing");
  const year = new Date().getFullYear();

  const quickLinks = [
    { label: t("nav.home"), href: "#home" },
    { label: t("nav.about"), href: "#about" },
    { label: t("nav.features"), href: "#features" },
    { label: t("nav.contact"), href: "#contact" },
  ];

  const accountLinks = [
    { label: t("footer.signIn"), to: "/login" },
    { label: t("footer.createAccount"), to: "/register" },
    { label: t("footer.forgotPassword"), to: "/forgot-password" },
  ];

  const socials = [
    { Icon: Facebook, href: "https://www.facebook.com", label: "Facebook" },
    { Icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { Icon: Instagram, href: "https://www.instagram.com", label: "Instagram" },
    { Icon: Linkedin, href: "https://www.linkedin.com", label: "LinkedIn" },
  ];

  return (
    <footer className="w-full bg-emerald-500 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <BrandLogo variant="onDark" size="md" linkTo="/" />
            <p className="text-sm text-emerald-50 leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-2 pt-2">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/15 hover:bg-white text-white hover:text-emerald-600 flex items-center justify-center transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wide">
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-emerald-50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wide">
              {t("footer.account")}
            </h4>
            <ul className="space-y-2 text-sm">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-emerald-50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wide">
              {t("footer.contact")}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-white mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:support@lhmmssystem.org"
                  className="text-emerald-50 hover:text-white transition-colors break-all"
                >
                  support@lhmmssystem.org
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-white mt-0.5 flex-shrink-0" />
                <a
                  href="tel:+97798XXXXXXXX"
                  className="text-emerald-50 hover:text-white transition-colors"
                >
                  +977-98XXXXXXXX
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-white mt-0.5 flex-shrink-0" />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Herald+College+Kathmandu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-50 hover:text-white transition-colors"
                >
                  Herald College Kathmandu
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/20 text-center text-xs text-emerald-50">
          {t("footer.copyright", { year })}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
