import PublicNavbar from "../components/layout/PublicNavbar";
import Footer from "../components/layout/Footer";
import Hero from "../components/landing/Hero";
import FeatureStrip from "../components/landing/FeatureStrip";
import GlanceQuickAccess from "../components/landing/GlanceQuickAccess";
import HowItWorks from "../components/landing/HowItWorks";
import FeaturesImpact from "../components/landing/FeaturesImpact";
import FinalCTA from "../components/landing/FinalCTA";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <Hero />
      <FeatureStrip />
      <GlanceQuickAccess />
      <HowItWorks />
      <FeaturesImpact />
      <FinalCTA />
      <Footer />
    </div>
  );
}
