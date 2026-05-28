import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import PainSection from "@/components/landing/PainSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import VisualProofSection from "@/components/landing/VisualProofSection";
import FinalCTASection from "@/components/landing/FinalCTASection";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <HeroSection />
      <PainSection />
      <HowItWorksSection />
      <VisualProofSection />
      <FinalCTASection />

      {/* Footer mínimo */}
      <footer className="bg-[#1A1D2B] py-8 text-center">
        <p className="font-nunito text-white/50 text-sm">
          © 2026 AulaTeca. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
