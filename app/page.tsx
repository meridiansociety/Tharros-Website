import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import WhatWeBuildsSection from "@/components/WhatWeBuildsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WhyTharrosSection from "@/components/WhyTharrosSection";
import PricingSection from "@/components/PricingSection";
import FooterSection from "@/components/FooterSection";
import ChatDemoSectionWrapper from "@/components/ChatDemoSectionWrapper";
import ModelTiersSection from "@/components/ModelTiersSection";

export default function Home() {
  return (
    <>
      <main>
        <HeroSection />
        <ProblemSection />
        <ChatDemoSectionWrapper />
        <ModelTiersSection />
        <WhatWeBuildsSection />
        <HowItWorksSection />
        <WhyTharrosSection />
        <PricingSection />
        <FooterSection />
      </main>
    </>
  );
}
