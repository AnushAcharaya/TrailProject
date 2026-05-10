import React from "react";
import { useTranslation } from "react-i18next";
import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const ContactSection = () => {
  const { t } = useTranslation("landing");

  const contactItems = [
    { Icon: Mail, label: t("contact.info.email"), value: "support@lhmmssystem.org" },
    { Icon: Phone, label: t("contact.info.phone"), value: "+977-98XXXXXXXX" },
    { Icon: MapPin, label: t("contact.info.location"), value: "Herald College Kathmandu" },
  ];

  return (
    <section id="contact" className="w-full bg-green-50 py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-white text-green-700 border border-green-100 mb-4">
            {t("contact.badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {t("contact.titleStart")}{" "}
            <span className="text-green-600">{t("contact.titleAccent")}</span>
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            {t("contact.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8">
              <form className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("contact.form.fullName")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("contact.form.fullNamePlaceholder")}
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-green-600 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("contact.form.email")}
                    </label>
                    <input
                      type="email"
                      placeholder={t("contact.form.emailPlaceholder")}
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-green-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("contact.form.role")}
                  </label>
                  <select className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-green-600 transition-colors">
                    <option>{t("contact.form.rolePlaceholder")}</option>
                    <option>{t("contact.form.roleFarmer")}</option>
                    <option>{t("contact.form.roleVet")}</option>
                    <option>{t("contact.form.roleNgo")}</option>
                    <option>{t("contact.form.roleOther")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("contact.form.message")}
                  </label>
                  <textarea
                    rows="5"
                    placeholder={t("contact.form.messagePlaceholder")}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-green-600 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
                >
                  {t("contact.form.send")}
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* Contact info */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {contactItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 hover:border-green-600 transition-colors"
              >
                <div className="min-w-[48px] h-[48px] rounded-lg bg-green-50 flex items-center justify-center">
                  <item.Icon className="text-green-600" size={20} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    {item.label}
                  </div>
                  <div className="text-sm text-gray-800 font-semibold mt-0.5">
                    {item.value}
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-sm font-semibold text-gray-800 mb-3">
                {t("contact.socialTitle")}
              </p>
              <div className="flex items-center gap-2">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-green-50 hover:bg-green-600 hover:text-white text-green-600 flex items-center justify-center transition-colors"
                    aria-label="Social link"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
