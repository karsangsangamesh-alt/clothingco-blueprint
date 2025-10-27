import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Star, Heart, SlidersHorizontal, X, Loader2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  original_price?: number;
  discount?: number;
  image_urls: string[];
  category_id: string;
  category?: {
    id: string;
    name: string;
  };
  rating?: number;
  review_count?: number;
  sizes?: string[];
  colors?: string[];
  stock: number;
  is_new_arrival?: boolean;
  is_best_seller?: boolean;
  description?: string;
  is_trending?: boolean;
  fabric?: string;
  pattern?: string;
  occasion?: string[];
  sleeve?: string;
  fit?: string;
  length?: string;
  neck?: string;
  wash_care?: string[];
  tags?: string[];
  status: boolean;
  is_luxury?: boolean;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  
  // Data state
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState('recommended');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const productsPerPage = 20;

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch products with realtime subscription
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const [brandMallResponse, generalResponse] = await Promise.all([
        supabase
          .from('brandmall_products')
          .select(`
            id,
            name,
            brand,
            price,
            original_price,
            stock,
            color,
            size,
            status,
            is_luxury,
            image_urls,
            description,
            created_at
          `)
          .eq('status', true)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('general_products')
          .select(`
            id,
            name,
            category,
            price,
            stock,
            status,
            image_url,
            description,
            created_at
          `)
          .eq('status', true)
          .order('created_at', { ascending: false })
      ]);

      if (brandMallResponse.error) throw brandMallResponse.error;
      if (generalResponse.error) throw generalResponse.error;

      const brandMallProducts: Product[] = (brandMallResponse.data || []).map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand || 'Unknown Brand',
        price: p.price,
        original_price: p.original_price || undefined,
        discount: p.original_price ? Math.round(((p.original_price - p.price) / p.original_price) * 100) : undefined,
        image_urls: p.image_urls || [],
        category_id: 'luxury',
        category: { id: 'luxury', name: 'Luxury' },
        stock: p.stock,
        sizes: p.size ? [p.size] : [],
        colors: p.color ? [p.color] : [],
        status: p.status,
        is_luxury: p.is_luxury,
        description: p.description,
        is_new_arrival: isNewArrival(p.created_at),
        is_best_seller: false,
        rating: 4 + Math.random() * 0.9,
        review_count: Math.floor(Math.random() * 1000) + 10,
        created_at: p.created_at
      }));

      const generalProducts: Product[] = (generalResponse.data || []).map(p => ({
        id: p.id,
        name: p.name,
        brand: 'General',
        price: p.price,
        image_urls: p.image_url ? [p.image_url] : [],
        category_id: 'general',
        category: { id: 'general', name: p.category || 'General' },
        stock: p.stock,
        status: p.status,
        description: p.description,
        is_new_arrival: isNewArrival(p.created_at),
        is_best_seller: false,
        sizes: [],
        colors: [],
        rating: 4 + Math.random() * 0.9,
        review_count: Math.floor(Math.random() * 500) + 5,
        created_at: p.created_at
      }));

      const combinedProducts = [...brandMallProducts, ...generalProducts];
      setAllProducts(combinedProducts);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const isNewArrival = (createdAt: string): boolean => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(createdAt) > thirtyDaysAgo;
  };

  const setupRealtimeSubscription = () => {
    const brandMallChannel = supabase
      .channel('brandmall_products_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'brandmall_products' },
        () => {
          console.log('BrandMall products changed, refetching...');
          fetchProducts();
        }
      )
      .subscribe();

    const generalChannel = supabase
      .channel('general_products_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'general_products' },
        () => {
          console.log('General products changed, refetching...');
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(brandMallChannel);
      supabase.removeChannel(generalChannel);
    };
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, []);

  const uniqueBrands = useMemo(() => 
    Array.from(new Set(allProducts.map(p => p.brand).filter(Boolean))).sort(),
    [allProducts]
  );

  const uniqueCategories = useMemo(() => 
    Array.from(new Set(allProducts.map(p => p.category?.name).filter(Boolean))).sort(),
    [allProducts]
  );

  const uniqueSizes = useMemo(() => 
    Array.from(new Set(allProducts.flatMap(p => p.sizes || []))).sort(),
    [allProducts]
  );

  const uniqueColors = useMemo(() => 
    Array.from(new Set(allProducts.flatMap(p => p.colors || []).filter(Boolean))).sort(),
    [allProducts]
  );

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach(p => {
      if (p.brand) {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
      }
    });
    return counts;
  }, [allProducts]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach(p => {
      if (p.category?.name) {
        counts[p.category.name] = (counts[p.category.name] || 0) + 1;
      }
    });
    return counts;
  }, [allProducts]);

  const maxPrice = useMemo(() => {
    if (allProducts.length === 0) return 10000;
    return Math.ceil(Math.max(...allProducts.map(p => p.price)) / 1000) * 1000;
  }, [allProducts]);

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.category?.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory.length > 0) {
      result = result.filter(p => p.category?.name && selectedCategory.includes(p.category.name));
    }
    
    if (selectedBrands.length > 0) {
      result = result.filter(p => p.brand && selectedBrands.includes(p.brand));
    }
    
    if (selectedSizes.length > 0) {
      result = result.filter(p => 
        p.sizes && p.sizes.length > 0 && p.sizes.some(size => selectedSizes.includes(size))
      );
    }
    
    if (selectedColors.length > 0) {
      result = result.filter(p =>
        p.colors && p.colors.length > 0 && p.colors.some(color => selectedColors.includes(color))
      );
    }
    
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'discount':
        result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => {
          const aScore = (a.is_best_seller ? 100 : 0) + (a.is_new_arrival ? 50 : 0) + ((a.rating || 0) * 10);
          const bScore = (b.is_best_seller ? 100 : 0) + (b.is_new_arrival ? 50 : 0) + ((b.rating || 0) * 10);
          return bScore - aScore;
        });
    }
    
    return result;
  }, [allProducts, searchQuery, selectedCategory, selectedBrands, selectedSizes, selectedColors, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedBrands, selectedSizes, selectedColors, priceRange, sortBy]);

  const toggleCategory = (category: string) => {
    setSelectedCategory(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory([]);
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, maxPrice]);
    setSearchQuery('');
  };

  const activeFiltersCount = 
    selectedCategory.length + 
    selectedBrands.length + 
    selectedSizes.length + 
    selectedColors.length +
    (priceRange[0] !== 0 || priceRange[1] !== maxPrice ? 1 : 0);

  const handleAddToCart = (product: Product) => {
    addToCart({
      product_id: product.id,
      product_name: product.name,
      product_brand: product.brand,
      product_price: product.price,
      product_image: product.image_urls[0] || '',
    });
  };

  const renderRating = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-xs text-gray-500">({rating?.toFixed(1)})</span>
      </div>
    );
  };

  const sortOptions = [
    { label: 'Recommended', value: 'recommended' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Highest Rated', value: 'rating' },
    { label: 'Best Discount', value: 'discount' },
    { label: 'Name: A to Z', value: 'name' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-gray-900 mx-auto mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4 text-3xl">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Products</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchProducts}>Try Again</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center text-sm text-gray-600">
              <Link to="/" className="hover:text-gray-900">Home</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <Link to="/clothing" className="hover:text-gray-900">Clothing</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-gray-900 font-medium">All Products</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-3 py-3 overflow-x-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="default" className="ml-1 h-5 px-1.5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              <div className="h-6 w-px bg-gray-300" />

              {uniqueCategories.slice(0, 3).map(category => (
                <Button
                  key={category}
                  variant={selectedCategory.includes(category) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}

              <div className="h-6 w-px bg-gray-300" />

              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filters display */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-3">
                <span className="text-sm text-gray-600">Active filters:</span>
                {selectedCategory.map(cat => (
                  <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                    {cat}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleCategory(cat)} />
                  </Badge>
                ))}
                {selectedBrands.map(brand => (
                  <Badge key={brand} variant="secondary" className="flex items-center gap-1">
                    {brand}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleBrand(brand)} />
                  </Badge>
                ))}
                {selectedSizes.map(size => (
                  <Badge key={size} variant="secondary" className="flex items-center gap-1">
                    Size: {size}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleSize(size)} />
                  </Badge>
                ))}
                {selectedColors.map(color => (
                  <Badge key={color} variant="secondary" className="flex items-center gap-1">
                    {color}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleColor(color)} />
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs h-6 px-2"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex gap-6">
            {/* Filters Sidebar */}
            <AnimatePresence>
              {(showFilters || window.innerWidth >= 1024) && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="hidden lg:block flex-shrink-0"
                >
                  <div className="bg-white rounded-lg shadow-sm p-5 sticky top-4 max-h-[calc(100vh-120px)] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold text-gray-900">FILTERS</h2>
                      {activeFiltersCount > 0 && (
                        <button
                          onClick={clearAllFilters}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Search */}
                    <div className="mb-5">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search products..."
                          className="pl-10 h-9 text-sm"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Categories */}
                    {uniqueCategories.length > 0 && (
                      <div className="mb-5 pb-5 border-b">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">CATEGORIES</h3>
                        <div className="space-y-2">
                          {uniqueCategories.map(category => (
                            <label key={category} className="flex items-center justify-between cursor-pointer group">
                              <div className="flex items-center">
                                <Checkbox
                                  checked={selectedCategory.includes(category)}
                                  onCheckedChange={() => toggleCategory(category)}
                                  className="mr-2"
                                />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                  {category}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">({categoryCounts[category] || 0})</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Brands */}
                    {uniqueBrands.length > 0 && (
                      <div className="mb-5 pb-5 border-b">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">BRAND</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {uniqueBrands.map(brand => (
                            <label key={brand} className="flex items-center justify-between cursor-pointer group">
                              <div className="flex items-center">
                                <Checkbox
                                  checked={selectedBrands.includes(brand)}
                                  onCheckedChange={() => toggleBrand(brand)}
                                  className="mr-2"
                                />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                  {brand}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">({brandCounts[brand] || 0})</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price Range */}
                    <div className="mb-5 pb-5 border-b">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">PRICE</h3>
                      <div className="px-1">
                        <input
                          type="range"
                          min="0"
                          max={maxPrice}
                          step="100"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="w-full accent-gray-900"
                        />
                        <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                          <span>₹{priceRange[0].toLocaleString()}</span>
                          <span>₹{priceRange[1].toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Size Filter */}
                    {uniqueSizes.length > 0 && (
                      <div className="mb-5 pb-5 border-b">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">SIZE</h3>
                        <div className="flex flex-wrap gap-2">
                          {uniqueSizes.map(size => (
                            <button
                              key={size}
                              onClick={() => toggleSize(size)}
                              className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                                selectedSizes.includes(size)
                                  ? 'bg-gray-900 text-white border-gray-900'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Color Filter */}
                    {uniqueColors.length > 0 && (
                      <div className="mb-5">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">COLOR</h3>
                        <div className="flex flex-wrap gap-2">
                          {uniqueColors.map(color => (
                            <button
                              key={color}
                              onClick={() => toggleColor(color)}
                              className={`px-3 py-2 border rounded-lg text-xs font-medium transition-colors ${
                                selectedColors.includes(color)
                                  ? 'bg-gray-900 text-white border-gray-900'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
                              }`}
                            >
                              {color}
                            </button>
                          ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </>
    ) : (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-600">
        No products found.
      </div>
    )}
  </div>
</div>
</div>
</main>
<Footer />
</div>
);
};

export default ProductsPage;