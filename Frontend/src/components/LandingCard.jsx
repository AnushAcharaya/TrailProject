import React from "react";
import { useTranslation } from "react-i18next";
import {
  ClipboardList,
  CalendarCheck,
  Syringe,
  Shield,
  Stethoscope,
  Bell,
  Users,
  TrendingUp,
} from "lucide-react";

const featureKeys = [
  { key: "profiles", Icon: ClipboardList },
  { key: "appointments", Icon: CalendarCheck },
  { key: "vaccination", Icon: Syringe },
  { key: "insurance", Icon: Shield },
  { key: "verifiedVets", Icon: Stethoscope },
  { key: "notifications", Icon: Bell },
  { key: "community", Icon: Users },
  { key: "insights", Icon: TrendingUp },
];

const FeaturesSection = () => {
  const { t } = useTranslation("landing");

  return (
    <section id="features" className="w-full bg-green-50 py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-white text-green-700 border border-green-100 mb-4">
            {t("features.badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {t("features.titleStart")}{" "}
            <span className="text-green-600">{t("features.titleAccent")}</span>
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            {t("features.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureKeys.map(({ key, Icon }) => (
            <div
              key={key}
              className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-green-600 hover:shadow-md transition-all duration-300"
            >
              <div className="bg-green-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <Icon className="text-green-600" size={26} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {t(`features.items.${key}.title`)}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {t(`features.items.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
