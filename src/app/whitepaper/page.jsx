import MasterLayout from "@/masterLayout/MasterLayout";
import WhitepaperComponent from "@/components/WhitepaperComponent";

export const metadata = {
  title: "Technical Whitepaper - Myavana AI Ecosystem",
  description: "Comprehensive PhD-level technical analysis of the Myavana AI-powered hair care ecosystem, covering chatbot architecture, dashboard implementation, and advanced analytics capabilities.",
};

const WhitepaperPage = () => {
  return (
    <MasterLayout>
      <WhitepaperComponent />
    </MasterLayout>
  );
};

export default WhitepaperPage;