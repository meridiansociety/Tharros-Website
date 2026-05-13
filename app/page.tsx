import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import WhatWeBuildsSection from "@/components/WhatWeBuildsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WhyTharrosSection from "@/components/WhyTharrosSection";
import PricingSection from "@/components/PricingSection";
import FooterSection from "@/components/FooterSection";
import ChatDemoSectionWrapper from "@/components/ChatDemoSectionWrapper";

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="gpu-accelerated">
        <HeroSection />
        <div className="content-visibility-auto">
          <ProblemSection />
        </div>
        <div className="content-visibility-auto">
          <ChatDemoSectionWrapper />
        </div>
        <div className="content-visibility-auto">
          <WhatWeBuildsSection />
        </div>
        <div className="content-visibility-auto">
          <HowItWorksSection />
        </div>
        <div className="content-visibility-auto">
          <WhyTharrosSection />
        </div>
        <div className="content-visibility-auto">
          <PricingSection />
        </div>
        <FooterSection />
      </main>
    </>
  );
}
