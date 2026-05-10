import React from "react";
import Navbar from "../components/LandingNav";
import HeroSection from "../components/LandingHero";
import FeaturesSection from "../components/LandingCard";
import MissionSection from "../components/LandingMission";
import ContactSection from "../components/LandingContactus";
import Footer from "../components/LandingFooter";

const Page = () => {
    return (
        <>
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <MissionSection />
            <ContactSection />
            <Footer />
        </>
    );
};

export default Page;
