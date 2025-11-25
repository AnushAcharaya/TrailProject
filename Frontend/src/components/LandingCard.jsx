import React from "react";
import { ClipboardList, CalendarCheck, Syringe, Shield } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section className="w-full py-24 bg-gradient-to-b from-blue-50/60 via-white to-white">
      <div className="mx-auto w-full max-w-[1400px] px-6 lg:px-10 xl:px-16">

        {/* ===== Upper Section ===== */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
            Everything You Need to Manage Your Livestock
          </h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            A complete platform designed for farmers and veterinarians to monitor,
            manage, and improve the health and productivity of livestock.
          </p>
        </div>

        {/* ===== Cards Section ===== */}
        <div
          className="
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            lg:grid-cols-4 
            gap-6 
            md:gap-8 
            xl:gap-10 
            2xl:gap-12
          "
        >
          {/* CARD TEMPLATE */}
          {[
            {
              title: "Digital Animal Profiles",
              desc: "Maintain complete records: breed, age, medical history & more.",
              Icon: ClipboardList,
              bg: "bg-blue-100",
              color: "text-blue-600",
            },
            {
              title: "Appointment Booking",
              desc: "Find and schedule veterinary professionals instantly.",
              Icon: CalendarCheck,
              bg: "bg-green-100",
              color: "text-green-600",
            },
            {
              title: "Smart Vaccination Reminders",
              desc: "Automatically alerts you about upcoming vaccinations.",
              Icon: Syringe,
              bg: "bg-purple-100",
              color: "text-purple-600",
            },
            {
              title: "Insurance & Ownership Transfer",
              desc: "Secure livestock insurance and quick digital ownership transfer.",
              Icon: Shield,
              bg: "bg-orange-100",
              color: "text-orange-600",
            },
          ].map((card, index) => (
            <div
              key={index}
              className="
                bg-white 
                p-6 
                lg:p-7 
                xl:p-8 
                rounded-2xl 
                shadow-sm 
                border 
                hover:shadow-lg 
                transition-all 
                duration-300 
                hover:-translate-y-1
              "
            >
              {/* ICON */}
              <div className="flex justify-center mb-4">
                <div className={`${card.bg} p-4 rounded-full`}>
                  <card.Icon className={card.color} size={34} />
                </div>
              </div>

              {/* CONTENT */}
              <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">
                {card.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed text-center">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
