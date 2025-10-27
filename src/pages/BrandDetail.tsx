import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
}

const allProducts: Product[] = [
  { id: 1, name: "Silk Evening Gown", brand: "Maison Élégance", price: 1299, image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop", category: "Dresses" },
  { id: 2, name: "Cashmere Blazer", brand: "Urban Chic", price: 899, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop", category: "Outerwear" },
  { id: 3, name: "Designer Handbag", brand: "Luxe Heritage", price: 1599, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop", category: "Accessories" },
  { id: 4, name: "Leather Jacket", brand: "Atelier Moderne", price: 749, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop", category: "Outerwear" },
  { id: 5, name: "Cocktail Dress", brand: "Maison Élégance", price: 599, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop", category: "Dresses" },
  { id: 6, name: "Wool Coat", brand: "Urban Chic", price: 1099, image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&h=500&fit=crop", category: "Outerwear" },
  { id: 7, name: "Silk Scarf", brand: "Luxe Heritage", price: 199, image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=500&fit=crop", category: "Accessories" },
  { id: 8, name: "Tailored Pants", brand: "Atelier Moderne", price: 449, image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=500&fit=crop", category: "Bottoms" },
];

const brandInfo: Record<string, { name: string; description: string; image: string }> = {
  "1": {
    name: "Maison Élégance",
    description: "French haute couture reimagined for the modern woman",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop",
  },
  "2": {
    name: "Urban Chic",
    description: "Contemporary luxury with an urban edge",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=800&fit=crop",
  },
  "3": {
    name: "Luxe Heritage",
    description: "Timeless elegance meets artisanal craftsmanship",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=800&fit=crop",
  },
  "4": {
    name: "Atelier Moderne",
    description: "Avant-garde design for the discerning connoisseur",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop",
  },
};

const BrandDetail = () => {
  const { id } = useParams();
  const brand = brandInfo[id || "1"];
  const brandProducts = allProducts.filter(p => p.brand === brand?.name);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlist(String(product.id))) {
      removeFromWishlist(String(product.id));
    } else {
      addToWishlist({
        product_id: String(product.id),
        product_name: product.name,
        product_brand: product.brand,
        product_price: product.price,
        product_image: product.image,
      });
    }
  };

  if (!brand) {
    return <div>Brand not found</div>;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <section className="relative h-[400px] overflow-hidden">
          <img
            src={brand.image}
            alt={brand.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 text-primary-foreground drop-shadow-lg">
                {brand.name}
              </h1>
              <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto drop-shadow-md">
                {brand.description}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold mb-8">Collection</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {brandProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative bg-card rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <button
                    onClick={() => handleWishlistToggle(product)}
                    className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm hover:bg-background p-2 rounded-full transition-colors"
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      className={`w-4 h-4 ${isInWishlist(String(product.id)) ? 'fill-current text-red-500' : ''}`}
                    />
                  </button>

                  <Link to={`/product/${product.id}`} className="block">
                    <div className="aspect-[3/4] overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 group-hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-lg font-bold">₹{product.price}</p>
                    </div>
                  </Link>

                  <div className="px-4 pb-4">
                    <Button
                      variant="luxury"
                      size="sm"
                      className="w-full"
                      onClick={() => addToCart({
                        product_id: String(product.id),
                        product_name: product.name,
                        product_brand: product.brand,
                        product_price: product.price,
                        product_image: product.image,
                      })}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BrandDetail;
