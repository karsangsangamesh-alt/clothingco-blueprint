import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  isPremium?: boolean;
}

const allProducts: Product[] = [
  { id: 1, name: "Silk Evening Gown", brand: "Maison Élégance", price: 1299, image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop", category: "Dresses", isPremium: true },
  { id: 2, name: "Cashmere Blazer", brand: "Urban Chic", price: 899, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop", category: "Outerwear" },
  { id: 3, name: "Designer Handbag", brand: "Luxe Heritage", price: 1599, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop", category: "Accessories", isPremium: true },
  { id: 4, name: "Leather Jacket", brand: "Atelier Moderne", price: 749, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop", category: "Outerwear" },
  { id: 5, name: "Cocktail Dress", brand: "Maison Élégance", price: 599, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop", category: "Dresses" },
  { id: 6, name: "Wool Coat", brand: "Urban Chic", price: 1099, image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&h=500&fit=crop", category: "Outerwear" },
  { id: 7, name: "Silk Scarf", brand: "Luxe Heritage", price: 199, image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=500&fit=crop", category: "Accessories" },
  { id: 8, name: "Tailored Pants", brand: "Atelier Moderne", price: 449, image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=500&fit=crop", category: "Bottoms" },
];

const categories = ["All", "Dresses", "Outerwear", "Accessories", "Bottoms"];

const Products = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
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

  let filteredProducts = allProducts;

  // Filter by search query
  if (searchQuery) {
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Filter by category
  if (selectedCategory !== "All") {
    filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
  }

  // Filter by price
  if (priceRange !== "All") {
    filteredProducts = filteredProducts.filter(p => {
      if (priceRange === "0-500") return p.price <= 500;
      if (priceRange === "500-1000") return p.price > 500 && p.price <= 1000;
      if (priceRange === "1000+") return p.price > 1000;
      return true;
    });
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        {/* Page Header */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Collections</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our carefully curated selection of premium fashion pieces
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-4">
            {searchQuery && (
              <p className="text-center mb-4 text-muted-foreground">
                Search results for: <span className="font-semibold">"{searchQuery}"</span>
              </p>
            )}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium mb-2 text-center">Category</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2 text-center">Price Range</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["All", "0-500", "500-1000", "1000+"].map((range) => (
                    <Button
                      key={range}
                      variant={priceRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPriceRange(range)}
                    >
                      {range === "All" ? "All" : `$${range}`}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative bg-card rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-fade-in"
                >
                  {product.isPremium && (
                    <div className="absolute top-4 left-4 z-10 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
                      Premium
                    </div>
                  )}

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
                      <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                      <h3 className="font-semibold mb-2 group-hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-lg font-bold">${product.price}</p>
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

export default Products;
