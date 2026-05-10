import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ShieldCheck, HeartPulse, CalendarDays } from "lucide-react";

const HeroSection = () => {
  const { t } = useTranslation("landing");

  return (
    <section id="home" className="w-full bg-white pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left space-y-6 animate-fade-up">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-green-50 text-green-700 border border-green-100">
              {t("hero.badge")}
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900">
              {t("hero.headline1")} <br />
              <span className="text-green-600">{t("hero.headline2")}</span> <br />
              {t("hero.headline3")}
            </h1>

            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t("hero.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register">
                <button className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                  {t("hero.ctaPrimary")}
                  <ArrowRight size={18} />
                </button>
              </Link>
              <a href="#features">
                <button className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-green-600 hover:text-green-600 text-gray-800 font-medium px-6 py-3 rounded-lg transition-colors">
                  {t("hero.ctaSecondary")}
                </button>
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-gray-500 pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-green-600" />
                <span>{t("hero.trustGovt")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HeartPulse size={16} className="text-green-600" />
                <span>{t("hero.trustVet")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays size={16} className="text-green-600" />
                <span>{t("hero.trustSms")}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100">
              {[
                { num: "1000+", label: t("hero.statsFarmers") },
                { num: "50+", label: t("hero.statsVets") },
                { num: "5000+", label: t("hero.statsAnimals") },
              ].map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold text-green-600">{s.num}</h3>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right image */}
          <div className="flex-1 flex justify-center w-full">
            <img
              src="/IMG_0096.JPG"
              alt="Nepali farmer with livestock"
              className="w-full max-w-lg h-[420px] md:h-[480px] object-cover rounded-2xl border border-gray-100 shadow-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
