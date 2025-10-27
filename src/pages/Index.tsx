import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BrandGrid from "@/components/BrandGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <BrandGrid />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
