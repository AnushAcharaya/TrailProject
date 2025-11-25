// ContactSection.jsx
import React from "react";
import {
  Mail,
  Phone,
  MapPin
} from "lucide-react";

const ContactSection = () => {
  return (
    <section className="w-full bg-white py-20">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">

        {/* Top heading + paragraph */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-sm text-gray-700 font-semibold">Get In Touch</h2>
          <p className="text-gray-500 text-sm md:text-base mt-3">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Main content: form left, info right */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Form (spans 8/12 on lg) */}
          <div className="lg:col-span-8">
            <div className="bg-white border rounded-2xl shadow-sm p-6 md:p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full bg-gray-50 border border-gray-100 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Email</label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      className="w-full bg-gray-50 border border-gray-100 rounded-md px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-2">I am a</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-200"
                  >
                    <option>Select your role</option>
                    <option>Farmer</option>
                    <option>Veterinarian</option>
                    <option>Institution / NGO</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-2">Message</label>
                  <textarea
                    rows="4"
                    placeholder="Tell us how we can help you..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-md px-3 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium shadow-sm hover:bg-green-700 transition"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: Contact info cards (spans 4/12 on lg) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Card 1 */}
            <div className="flex items-center gap-4 bg-white border rounded-lg p-4 shadow-sm">
              <div className="min-w-[48px] min-h-[48px] rounded-lg bg-green-50 flex items-center justify-center">
                <div className="bg-white/0 p-2 rounded-md">
                  <Mail className="text-green-600" size={20} />
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Email</div>
                <div className="text-sm text-gray-800 font-medium">support@lhmmssystem.org</div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex items-center gap-4 bg-white border rounded-lg p-4 shadow-sm">
              <div className="min-w-[48px] min-h-[48px] rounded-lg bg-green-50 flex items-center justify-center">
                <div className="bg-white/0 p-2 rounded-md">
                  <Phone className="text-green-600" size={20} />
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Phone</div>
                <div className="text-sm text-gray-800 font-medium">+977-98XXXXXXXX</div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex items-center gap-4 bg-white border rounded-lg p-4 shadow-sm">
              <div className="min-w-[48px] min-h-[48px] rounded-lg bg-green-50 flex items-center justify-center">
                <div className="bg-white/0 p-2 rounded-md">
                  <MapPin className="text-green-600" size={20} />
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Location</div>
                <div className="text-sm text-gray-800 font-medium">Herald College Kathmandu</div>
              </div>
            </div>

            {/* Optional: small help icon bubble at bottom right (like screenshot) */}
            {/* <div className="mt-4 self-end"> ... </div> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
