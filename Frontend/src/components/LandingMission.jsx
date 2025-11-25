import React from "react";
import { CheckCircle } from "lucide-react";

const MissionSection = () => {
  return (
    <section className="w-full bg-gradient-to-b from-green-50/40 to-white py-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 xl:px-16">

        <div
          className="
            flex 
            flex-col 
            lg:flex-row 
            items-center 
            gap-10 
            lg:gap-16 
            xl:gap-20
          "
        >

          {/* LEFT — IMAGE */}
          <div className="w-full lg:w-1/2 h-full">
            <img
              src="/your-image-path.jpg"
              alt="Nepal Farming"
              className="
                w-full 
                h-full 
                object-cover 
                rounded-2xl 
                shadow-xl
              "
            />
          </div>

          {/* RIGHT — TEXT CONTENT */}
          <div className="w-full lg:w-1/2 h-full flex flex-col justify-center space-y-5">
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
              Our Mission
            </h3>

            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              LHMMS empowers Nepali farmers by reducing livestock mortality through
              accessible and affordable digital health tracking.
            </p>

            {/* Why This Matters */}
            <div className="mt-2">
              <h4 className="font-semibold text-gray-800 mb-3">
                Why This Matters
              </h4>

              <ul className="space-y-4">
                {[
                  "Works even in low-connectivity areas (SMS support)",
                  "No hardware required, only phone or laptop",
                  "Designed specifically for rural farmers & veterinarians",
                  "Affordable and accessible for all",
                ].map((point, index) => (
                  <li
                    key={index}
                    className="
                      flex 
                      items-start 
                      gap-3 
                      p-4 
                      bg-white/40 
                      backdrop-blur-sm 
                      rounded-xl 
                      shadow-sm 
                      hover:shadow-md 
                      hover:bg-white/70 
                      transition-all 
                      duration-300
                      cursor-default
                    "
                  >
                    <CheckCircle className="text-green-600 min-w-5" size={22} />
                    <span className="text-gray-700 text-sm md:text-base leading-snug">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Quote */}
            <p className="text-gray-500 italic text-sm mt-4 leading-relaxed">
              "By providing farmers with digital tools, we're helping preserve Nepal’s
              agricultural heritage while embracing modern technology."
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MissionSection;
