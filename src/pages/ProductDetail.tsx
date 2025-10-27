import { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";

// Mock data - in production, fetch from API
const product = {
  id: 1,
  name: "Silk Evening Gown",
  brand: "Maison Élégance",
  price: 1299,
  description:
    "An exquisite silk evening gown crafted with meticulous attention to detail. This timeless piece features a flowing silhouette, delicate hand-stitched embellishments, and a luxurious champagne silk that drapes beautifully.",
  images: [
    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop",
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=1000&fit=crop",
  ],
  sizes: ["XS", "S", "M", "L", "XL"],
  colors: ["Champagne", "Black", "Navy"],
  details: [
    "100% Silk Charmeuse",
    "Hand-stitched embellishments",
    "Dry clean only",
    "Made in France",
  ],
  isPremium: true,
  rating: 4.8,
  reviews: 127,
};

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const handleWishlistToggle = () => {
    if (isInWishlist(String(product.id))) {
      removeFromWishlist(String(product.id));
    } else {
      addToWishlist({
        product_id: String(product.id),
        product_name: product.name,
        product_brand: product.brand,
        product_price: product.price,
        product_image: product.images[0],
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-[3/4] overflow-hidden rounded-lg">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-[3/4] overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedImage === index ? "border-accent" : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {product.isPremium && (
                <span className="inline-block bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Premium Collection
                </span>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
                <h1 className="text-4xl font-serif font-bold mb-4">{product.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? "fill-accent text-accent"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
                <p className="text-3xl font-bold">₹{product.price}</p>
              </div>

              <p className="text-muted-foreground leading-relaxed">{product.description}</p>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">Select Size</label>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md transition-colors ${
                        selectedSize === size
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border hover:border-accent"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Color: {selectedColor}
                </label>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-md transition-colors ${
                        selectedColor === color
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border hover:border-accent"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  variant="luxury"
                  size="lg"
                  className="w-full"
                  onClick={() => addToCart({
                    product_id: String(product.id),
                    product_name: product.name,
                    product_brand: product.brand,
                    product_price: product.price,
                    product_image: product.images[0],
                  })}
                >
                  Add to Cart
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={handleWishlistToggle}
                  >
                    <Heart
                      className={`w-4 h-4 mr-2 ${isInWishlist(String(product.id)) ? 'fill-current text-red-500' : ''}`}
                    />
                    {isInWishlist(String(product.id)) ? "In Wishlist" : "Add to Wishlist"}
                  </Button>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Product Details */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Product Details</h3>
                <ul className="space-y-2">
                  {product.details.map((detail, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start">
                      <span className="mr-2">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
