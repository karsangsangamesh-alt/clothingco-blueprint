import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import brandmallHero from "@/assets/brandmall-hero.jpg";
import { Link } from "react-router-dom";

interface Brand {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  established: string;
}

const premiumBrands: Brand[] = [
  {
    id: 1,
    name: "Maison Élégance",
    description: "French haute couture reimagined for the modern woman",
    category: "Haute Couture",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop",
    established: "1985",
  },
  {
    id: 2,
    name: "Urban Chic",
    description: "Contemporary luxury with an urban edge",
    category: "Contemporary",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=800&fit=crop",
    established: "2010",
  },
  {
    id: 3,
    name: "Luxe Heritage",
    description: "Timeless elegance meets artisanal craftsmanship",
    category: "Premium",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=800&fit=crop",
    established: "1972",
  },
  {
    id: 4,
    name: "Atelier Moderne",
    description: "Avant-garde design for the discerning connoisseur",
    category: "Designer",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop",
    established: "2005",
  },
];

const Brandmall = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative h-[500px] overflow-hidden">
          <img
            src={brandmallHero}
            alt="Brandmall luxury shopping"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-primary-foreground drop-shadow-lg">
                Welcome to Brandmall
              </h1>
              <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8 drop-shadow-md">
                A curated collection of the world's most prestigious fashion houses
              </p>
              <Button variant="hero" size="xl">
                Explore Brands
              </Button>
            </div>
          </div>
        </section>

        {/* Brand Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                Featured Luxury Brands
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Each brand in our Brandmall has been carefully selected for their exceptional quality,
                unique vision, and commitment to excellence
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {premiumBrands.map((brand, index) => (
                <Link
                  key={brand.id}
                  to={`/brand/${brand.id}`}
                  className="group relative bg-card rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-500 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Image */}
                    <div className="aspect-[3/4] md:aspect-auto overflow-hidden">
                      <img
                        src={brand.image}
                        alt={brand.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-8 flex flex-col justify-center">
                      <div className="mb-4">
                        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                          {brand.category}
                        </span>
                      </div>
                      <h3 className="text-2xl font-serif font-bold mb-3 group-hover:text-accent transition-colors">
                        {brand.name}
                      </h3>
                      <p className="text-muted-foreground mb-4">{brand.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Est. {brand.established}</span>
                      </div>
                      <div className="mt-6">
                        <Button variant="outline" size="sm" className="group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                          Explore Collection
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Experience Premium Shopping
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Join our exclusive community and enjoy personalized service, early access to new collections,
              and special events with our partner brands
            </p>
            <Link to="/auth">
              <Button variant="gold" size="lg">
                Become a Member
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Brandmall;
