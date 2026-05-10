import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

const MissionSection = () => {
  const { t } = useTranslation("landing");

  const points = [
    t("mission.point1"),
    t("mission.point2"),
    t("mission.point3"),
    t("mission.point4"),
  ];

  return (
    <section id="about" className="w-full bg-white py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Image */}
          <div className="w-full lg:w-1/2">
            <img
              src="/IMG_0096.JPG"
              alt="Nepali livestock farming"
              className="w-full h-[420px] md:h-[480px] object-cover rounded-2xl border border-gray-100 shadow-md"
            />
          </div>

          {/* Text */}
          <div className="w-full lg:w-1/2 space-y-6">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-green-50 text-green-700 border border-green-100">
              {t("mission.badge")}
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {t("mission.titleStart")}{" "}
              <span className="text-green-600">{t("mission.titleAccent")}</span>{" "}
              {t("mission.titleEnd")}
            </h2>

            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              {t("mission.description")}
            </p>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4 text-lg">
                {t("mission.whyTitle")}
              </h3>
              <ul className="space-y-3">
                {points.map((point, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-green-600 transition-colors"
                  >
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700 text-sm md:text-base leading-snug">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <blockquote className="pl-4 border-l-4 border-green-600 italic text-gray-600 text-sm md:text-base">
              "{t("mission.quote")}"
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
