import React from "react";


const HeroSection = () => {
  return (
    <section className=" w-full bg-gradient-to-br from-green-50 to-white mt-16">
      <div className="w-full flex flex-col-reverse lg:flex-row items-center justify-between px-6 md:px-10 py-16 gap-10">
        {/* ===== Left Side Content ===== */}
        <div className="flex-1 text-center lg:text-left space-y-5">
          <h2 className="text-base md:text-lg font-medium text-gray-800 leading-snug">
            Smart Livestock Management for Farmers & Vets in Nepal
          </h2>

          <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
            Track vaccinations, book vet visits, manage insurance, and transfer
            animal records — all from your phone.
          </p>

          {/* ==== Buttons ==== */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-md text-sm md:text-base font-medium shadow-sm transition w-full sm:w-auto">
              Register as Farmer →
            </button>
            <button className="border border-green-600 text-green-700 hover:bg-green-50 px-6 py-2.5 rounded-md text-sm md:text-base font-medium transition w-full sm:w-auto">
              Join as Veterinarian
            </button>
          </div>

          {/* ==== Stats Section ==== */}
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-8 pt-6">
            <div className="text-center lg:text-left">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
                1000+
              </h3>
              <p className="text-sm text-gray-500">Registered Farmers</p>
            </div>
            <div className="text-center lg:text-left">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
                50+
              </h3>
              <p className="text-sm text-gray-500">Active Veterinarians</p>
            </div>
            <div className="text-center lg:text-left">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
                5000+
              </h3>
              <p className="text-sm text-gray-500">Animals Tracked</p>
            </div>
          </div>
        </div>

        {/* ===== Right Side Image ===== */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <img
            src="./IMG_0096.JPG"
            alt="Farmer"
            className="rounded-lg shadow-md w-full max-w-sm md:max-w-md lg:max-w-lg object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
